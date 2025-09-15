const { chromium } = require('playwright');

const { GOOGLE_MAPS, PERFORMANCE, ERRORS, USER_AGENTS } = require('./constants');
const {
    cleanPhoneNumber,
    cleanEmail,
    cleanWebsite,
    cleanAddress,
    extractCoordinatesFromUrl,
    parseBusinessHours,
    calculateQualityScore,
    categorizeBusiness,
    sleep,
    randomDelay,
    retryWithBackoff,
    getTimestamp,
    extractEmailsFromText,
    extractSocialMediaLinks,
    extractContactPersons,
    parseLocationDetails
} = require('./utils');

/**
 * Google Maps Scraper Class
 * Handles all scraping operations for extracting business data from Google Maps
 */
class GoogleMapsScraper {
    constructor(options = {}) {
        this.options = {
            headless: options.headless !== false,
            maxConcurrency: options.maxConcurrency || 3,
            requestDelay: options.requestDelay || 2000,
            timeout: options.timeout || PERFORMANCE.DEFAULT_TIMEOUT,
            proxyConfig: options.proxyConfig || null,
            userAgent: options.userAgent || USER_AGENTS[0]
        };

        this.browser = null;
        this.pages = [];
        this.stats = {
            totalProcessed: 0,
            successful: 0,
            failed: 0,
            startTime: Date.now()
        };
    }

    /**
     * Initialize the browser and setup
     */
    async initialize() {
        console.log(`[${getTimestamp()}] Initializing Google Maps scraper...`);

        const browserOptions = {
            headless: this.options.headless,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        };

        // Add proxy configuration if provided and valid
        if (this.options.proxyConfig && this.options.proxyConfig.server) {
            browserOptions.proxy = this.options.proxyConfig;
        }

        // Use system Chromium if available, fallback to Playwright's Chromium
        const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium-browser';
        
        try {
            console.log(`[${getTimestamp()}] Attempting to launch browser with system executable: ${executablePath}`);
            browserOptions.executablePath = executablePath;
            this.browser = await chromium.launch(browserOptions);
            console.log(`[${getTimestamp()}] Browser initialized successfully with system executable`);
        } catch (error) {
            console.log(`[${getTimestamp()}] System browser failed, trying Playwright's Chromium: ${error.message}`);
            delete browserOptions.executablePath;
            this.browser = await chromium.launch(browserOptions);
            console.log(`[${getTimestamp()}] Browser initialized successfully with Playwright's Chromium`);
        }
    }

    /**
     * Create a new page with proper configuration
     */
    async createPage() {
        if (!this.browser) {
            throw new Error('Browser not initialized. Call initialize() first.');
        }

        const page = await this.browser.newPage({
            userAgent: this.options.userAgent,
            viewport: { width: 1366, height: 768 }
        });

        // Set timeouts
        page.setDefaultTimeout(this.options.timeout);
        page.setDefaultNavigationTimeout(PERFORMANCE.NAVIGATION_TIMEOUT);

        // Block unnecessary resources
        await page.route('**/*', (route) => {
            const resourceType = route.request().resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                route.abort();
            } else {
                route.continue();
            }
        });

        // Handle dialog boxes
        page.on('dialog', async (dialog) => {
            console.log(`Dialog appeared: ${dialog.message()}`);
            await dialog.dismiss();
        });

        this.pages.push(page);
        return page;
    }

    /**
     * Search for businesses in a specific category
     * @param {string} searchQuery - Search query (e.g., "restaurants dubai")
     * @param {number} maxResults - Maximum number of results to collect
     * @returns {Array} - Array of business data
     */
    async searchBusinesses(searchQuery, maxResults = 100) {
        console.log(`[${getTimestamp()}] Starting search for: "${searchQuery}"`);

        const page = await this.createPage();
        const businesses = [];

        try {
            // Navigate to Google Maps with English interface
            await page.goto('https://www.google.com/maps?hl=en&gl=ae', {
                waitUntil: 'networkidle',
                timeout: PERFORMANCE.NAVIGATION_TIMEOUT
            });

            // Wait for search box and perform search
            await page.waitForSelector(GOOGLE_MAPS.SELECTORS.SEARCH_BOX, {
                timeout: PERFORMANCE.ELEMENT_WAIT_TIMEOUT
            });

            // Clear existing content and fill search box
            await page.fill(GOOGLE_MAPS.SELECTORS.SEARCH_BOX, '');
            await page.fill(GOOGLE_MAPS.SELECTORS.SEARCH_BOX, searchQuery);
            
            // Try multiple approaches to search
            try {
                // First try: Press Enter
                await page.press(GOOGLE_MAPS.SELECTORS.SEARCH_BOX, 'Enter');
            } catch (enterError) {
                this.log('Failed to press Enter, trying click...');
                try {
                    // Second try: Force click the search button
                    await page.click(GOOGLE_MAPS.SELECTORS.SEARCH_BUTTON, { force: true });
                } catch (clickError) {
                    this.log('Failed to click search button, trying JS click...');
                    // Third try: JavaScript click
                    await page.evaluate(() => {
                        const searchBtn = document.querySelector('button[id="searchbox-searchbutton"]');
                        if (searchBtn) searchBtn.click();
                    });
                }
            }

            // Wait for results to load
            await page.waitForSelector(GOOGLE_MAPS.SELECTORS.RESULT_ITEMS, {
                timeout: PERFORMANCE.ELEMENT_WAIT_TIMEOUT
            });

            await sleep(randomDelay(2000, 4000));

            let scrollAttempts = 0;
            let lastBusinessCount = 0;

            while (businesses.length < maxResults && scrollAttempts < PERFORMANCE.MAX_SCROLL_ATTEMPTS) {
                // Get current business elements
                const businessElements = await page.$$(GOOGLE_MAPS.SELECTORS.RESULT_ITEMS);

                console.log(`[${getTimestamp()}] Found ${businessElements.length} business elements, collected ${businesses.length} businesses`);

                // Process new businesses
                for (let i = lastBusinessCount; i < businessElements.length && businesses.length < maxResults; i++) {
                    try {
                        const businessData = await this.extractBusinessData(page, businessElements[i], i);
                        if (businessData) {
                            businesses.push(businessData);
                            console.log(`[${getTimestamp()}] Extracted: ${businessData.businessName}`);
                        }
                    } catch (error) {
                        console.warn(`[${getTimestamp()}] Error extracting business ${i}:`, error.message);
                        this.stats.failed++;
                    }

                    // Add delay between extractions
                    await sleep(randomDelay(500, 1000));
                }

                lastBusinessCount = businessElements.length;

                // Scroll to load more results
                if (businesses.length < maxResults) {
                    await this.scrollToLoadMore(page);
                    scrollAttempts++;
                    await sleep(randomDelay(2000, 3000));
                }
            }

            this.stats.totalProcessed += businesses.length;
            this.stats.successful += businesses.length;

            console.log(`[${getTimestamp()}] Completed search for "${searchQuery}": ${businesses.length} businesses found`);
            return businesses;
        } catch (error) {
            console.error(`[${getTimestamp()}] Error in searchBusinesses:`, error);

            // Check for specific error types
            if (await this.detectCaptcha(page)) {
                throw new Error(ERRORS.CAPTCHA_DETECTED);
            }

            if (await this.detectRateLimit(page)) {
                throw new Error(ERRORS.RATE_LIMITED);
            }

            throw error;
        } finally {
            await page.close();
            this.pages = this.pages.filter((p) => p !== page);
        }
    }

    /**
     * Safe click method with multiple fallback strategies
     * @param {Page} page - Playwright page object
     * @param {ElementHandle} element - Element to click
     * @param {number} index - Index for logging
     */
    async safeClick(page, element, index) {
        try {
            // Strategy 1: Regular click
            await element.click({ timeout: 5000 });
        } catch (clickError) {
            console.log(`[${getTimestamp()}] Click failed for element ${index}, trying force click...`);
            try {
                // Strategy 2: Force click (ignore intercepts)
                await element.click({ force: true, timeout: 5000 });
            } catch (forceClickError) {
                console.log(`[${getTimestamp()}] Force click failed for element ${index}, trying scroll + click...`);
                try {
                    // Strategy 3: Scroll into view and click
                    await element.scrollIntoViewIfNeeded();
                    await sleep(1000);
                    await element.click({ timeout: 5000 });
                } catch (scrollClickError) {
                    console.log(`[${getTimestamp()}] Scroll click failed for element ${index}, trying JavaScript click...`);
                    try {
                        // Strategy 4: JavaScript click
                        await element.evaluate((el) => el.click());
                    } catch (jsClickError) {
                        console.log(`[${getTimestamp()}] All click strategies failed for element ${index}, trying hover + click...`);
                        // Strategy 5: Hover then click
                        await element.hover();
                        await sleep(500);
                        await element.click({ timeout: 3000 });
                    }
                }
            }
        }
    }

    /**
     * Extract detailed business data from a business element
     * @param {Page} page - Playwright page object
     * @param {ElementHandle} businessElement - Business element to extract from
     * @param {number} index - Index of the business element
     * @returns {Object|null} - Extracted business data or null
     */
    async extractBusinessData(page, businessElement, index) {
        try {
            // Enhanced click mechanism for better reliability
            await this.safeClick(page, businessElement, index);
            await sleep(randomDelay(2000, 3000));

            // Wait for business details to load
            await page.waitForSelector(GOOGLE_MAPS.SELECTORS.BUSINESS_NAME, {
                timeout: PERFORMANCE.ELEMENT_WAIT_TIMEOUT
            }).catch(() => {
                // Try alternative selector
                return page.waitForSelector(GOOGLE_MAPS.SELECTORS.BUSINESS_NAME_ALT, {
                    timeout: PERFORMANCE.ELEMENT_WAIT_TIMEOUT
                });
            });

            const businessData = {};

            // Extract business name
            businessData.businessName = await this.extractText(page, [
                GOOGLE_MAPS.SELECTORS.BUSINESS_NAME,
                GOOGLE_MAPS.SELECTORS.BUSINESS_NAME_ALT
            ]);

            if (!businessData.businessName) {
                console.warn(`[${getTimestamp()}] No business name found for element ${index}`);
                return null;
            }

            // Extract address
            businessData.address = cleanAddress(await this.extractText(page, [
                GOOGLE_MAPS.SELECTORS.ADDRESS,
                GOOGLE_MAPS.SELECTORS.ADDRESS_ALT
            ]));

            // Extract phone number
            const rawPhone = await this.extractText(page, [
                GOOGLE_MAPS.SELECTORS.PHONE,
                GOOGLE_MAPS.SELECTORS.PHONE_ALT
            ]);
            businessData.phone = cleanPhoneNumber(rawPhone);

            // Extract website
            const rawWebsite = await this.extractAttribute(page, [
                GOOGLE_MAPS.SELECTORS.WEBSITE,
                GOOGLE_MAPS.SELECTORS.WEBSITE_ALT
            ], 'href');
            businessData.website = cleanWebsite(rawWebsite);

            // Extract rating
            const ratingText = await this.extractText(page, [
                GOOGLE_MAPS.SELECTORS.RATING,
                GOOGLE_MAPS.SELECTORS.RATING_ALT
            ]);
            businessData.rating = ratingText ? parseFloat(ratingText.replace(',', '.')) : null;

            // Extract review count
            const reviewText = await this.extractText(page, [
                GOOGLE_MAPS.SELECTORS.REVIEW_COUNT,
                GOOGLE_MAPS.SELECTORS.REVIEW_COUNT_ALT
            ]);
            businessData.reviewCount = reviewText ? parseInt(reviewText.replace(/[^\d]/g, '')) : 0;

            // Extract business hours
            const hoursText = await this.extractText(page, [
                GOOGLE_MAPS.SELECTORS.HOURS,
                GOOGLE_MAPS.SELECTORS.HOURS_ALT
            ]);
            businessData.businessHours = parseBusinessHours(hoursText);

            // Extract category
            const categoryText = await this.extractText(page, [
                GOOGLE_MAPS.SELECTORS.CATEGORY,
                GOOGLE_MAPS.SELECTORS.CATEGORY_ALT
            ]);

            // Extract description
            businessData.description = await this.extractText(page, [
                GOOGLE_MAPS.SELECTORS.DESCRIPTION
            ]);

            // Categorize business
            businessData.category = categorizeBusiness(
                businessData.businessName,
                categoryText,
                businessData.description
            );

            // Extract price range
            businessData.priceRange = await this.extractText(page, [
                GOOGLE_MAPS.SELECTORS.PRICE_RANGE
            ]);

            // Extract coordinates from URL
            const currentUrl = page.url();
            businessData.coordinates = extractCoordinatesFromUrl(currentUrl);
            businessData.googleMapsUrl = currentUrl;

            // Extract primary photo
            businessData.primaryPhoto = await this.extractAttribute(page, [
                GOOGLE_MAPS.SELECTORS.PHOTOS
            ], 'src');

            // Extract email addresses
            const emailLink = await this.extractAttribute(page, [
                GOOGLE_MAPS.SELECTORS.EMAIL,
                GOOGLE_MAPS.SELECTORS.EMAIL_ALT
            ], 'href');
            
            if (emailLink && emailLink.startsWith('mailto:')) {
                businessData.email = cleanEmail(emailLink.replace('mailto:', ''));
            }

            // Extract additional contact information and emails from all text content
            const allTextContent = await page.$$eval(GOOGLE_MAPS.SELECTORS.ALL_TEXT_CONTENT,
                (elements) => elements.map((el) => el.textContent).join(' ')
            ).catch(() => '');

            // Find emails in text content
            const extractedEmails = extractEmailsFromText(allTextContent);
            if (extractedEmails.length > 0 && !businessData.email) {
                businessData.email = extractedEmails[0]; // Use first found email
            }
            businessData.additionalEmails = extractedEmails.slice(1); // Store additional emails

            // Extract social media links from page content
            const pageContent = await page.content().catch(() => '');
            const socialMediaLinks = extractSocialMediaLinks(pageContent + ' ' + allTextContent);
            businessData.socialMedia = socialMediaLinks;

            // Extract contact persons
            businessData.contactPersons = extractContactPersons(allTextContent);

            // Parse location details
            businessData.locationDetails = parseLocationDetails(businessData.address);

            // Extract business owner information
            businessData.businessOwner = await this.extractText(page, [
                GOOGLE_MAPS.SELECTORS.BUSINESS_OWNER
            ]);

            // Add metadata
            businessData.lastUpdated = new Date().toISOString();
            businessData.dataQualityScore = calculateQualityScore(businessData);
            businessData.verificationStatus = this.determineVerificationStatus(businessData);

            return businessData;
        } catch (error) {
            console.warn(`[${getTimestamp()}] Error extracting business data for element ${index}:`, error.message);
            return null;
        }
    }

    /**
     * Extract text content from elements using multiple selectors
     * @param {Page} page - Playwright page object
     * @param {Array} selectors - Array of selectors to try
     * @returns {string|null} - Extracted text or null
     */
    async extractText(page, selectors) {
        for (const selector of selectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    const text = await element.textContent();
                    if (text && text.trim()) {
                        return text.trim();
                    }
                }
            } catch (error) {
                // Continue to next selector
            }
        }
        return null;
    }

    /**
     * Extract attribute value from elements using multiple selectors
     * @param {Page} page - Playwright page object
     * @param {Array} selectors - Array of selectors to try
     * @param {string} attribute - Attribute name to extract
     * @returns {string|null} - Extracted attribute value or null
     */
    async extractAttribute(page, selectors, attribute) {
        for (const selector of selectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    const value = await element.getAttribute(attribute);
                    if (value && value.trim()) {
                        return value.trim();
                    }
                }
            } catch (error) {
                // Continue to next selector
            }
        }
        return null;
    }

    /**
     * Scroll to load more results
     * @param {Page} page - Playwright page object
     */
    async scrollToLoadMore(page) {
        try {
            // Scroll to bottom of results panel
            await page.evaluate(() => {
                const resultsPanel = document.querySelector('[role="main"]');
                if (resultsPanel) {
                    resultsPanel.scrollTop = resultsPanel.scrollHeight;
                }
            });

            // Look for and click "Load more" button if available
            const loadMoreButton = await page.$(GOOGLE_MAPS.SELECTORS.LOAD_MORE);
            if (loadMoreButton) {
                await loadMoreButton.click();
                await sleep(1000);
            }
        } catch (error) {
            console.warn(`[${getTimestamp()}] Error during scroll:`, error.message);
        }
    }

    /**
     * Detect if CAPTCHA is present on the page
     * @param {Page} page - Playwright page object
     * @returns {boolean} - True if CAPTCHA detected
     */
    async detectCaptcha(page) {
        try {
            const captchaSelectors = [
                '[src*="captcha"]',
                '[id*="captcha"]',
                '[class*="captcha"]',
                'iframe[src*="recaptcha"]'
            ];

            for (const selector of captchaSelectors) {
                const element = await page.$(selector);
                if (element) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Detect if rate limiting is in effect
     * @param {Page} page - Playwright page object
     * @returns {boolean} - True if rate limited
     */
    async detectRateLimit(page) {
        try {
            const pageText = await page.textContent('body');
            const rateLimitIndicators = [
                'too many requests',
                'rate limit',
                'try again later',
                'unusual traffic'
            ];

            return rateLimitIndicators.some((indicator) => pageText.toLowerCase().includes(indicator)
            );
        } catch (error) {
            return false;
        }
    }

    /**
     * Determine verification status based on available data
     * @param {Object} businessData - Business data object
     * @returns {string} - Verification status
     */
    determineVerificationStatus(businessData) {
        if (businessData.phone && businessData.website && businessData.rating) {
            return 'Verified';
        } if (businessData.phone || businessData.website) {
            return 'Partially Verified';
        }
        return 'Unverified';
    }

    /**
     * Get scraping statistics
     * @returns {Object} - Statistics object
     */
    getStats() {
        const runtime = Date.now() - this.stats.startTime;
        return {
            ...this.stats,
            runtimeMs: runtime,
            runtimeMin: Math.round(runtime / 60000 * 100) / 100,
            successRate: this.stats.totalProcessed > 0
                ? Math.round((this.stats.successful / this.stats.totalProcessed) * 100) : 0
        };
    }

    /**
     * Close browser and cleanup
     */
    async close() {
        console.log(`[${getTimestamp()}] Closing scraper...`);

        if (this.pages.length > 0) {
            await Promise.all(this.pages.map((page) => page.close().catch(() => {})));
        }

        if (this.browser) {
            await this.browser.close();
        }

        console.log(`[${getTimestamp()}] Scraper closed. Final stats:`, this.getStats());
    }
}

module.exports = GoogleMapsScraper;
