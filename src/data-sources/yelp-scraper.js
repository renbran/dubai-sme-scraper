/**
 * Yelp Business Scraper
 * Scrapes business data from Yelp for enhanced lead generation
 */

const BaseScraper = require('./base-scraper');

class YelpScraper extends BaseScraper {
    constructor(options = {}) {
        super(options);
        this.baseUrl = 'https://www.yelp.com';
        this.searchUrl = 'https://www.yelp.com/search';
    }

    /**
     * Search for businesses on Yelp
     */
    async search(query, location = 'Dubai, UAE') {
        console.log(`[YelpScraper] Searching: "${query}" in ${location}`);
        
        try {
            // Navigate to Yelp search
            const searchParams = new URLSearchParams({
                find_desc: query,
                find_loc: location
            });
            
            const searchUrl = `${this.searchUrl}?${searchParams.toString()}`;
            await this.page.goto(searchUrl, { waitUntil: 'networkidle' });
            
            // Wait for results to load
            await this.page.waitForSelector('[data-testid="serp-ia-card"]', { timeout: 10000 });
            await this.randomDelay(2000, 4000);
            
            // Get all business cards
            const businessCards = await this.page.$$('[data-testid="serp-ia-card"]');
            console.log(`[YelpScraper] Found ${businessCards.length} business cards`);
            
            const businesses = [];
            
            for (let i = 0; i < Math.min(businessCards.length, 10); i++) {
                try {
                    const businessData = await this.extractBusinessData(businessCards[i]);
                    if (businessData && businessData.businessName) {
                        businesses.push({
                            ...businessData,
                            source: 'Yelp',
                            scrapedAt: new Date().toISOString()
                        });
                        this.updateStats(true);
                    }
                    await this.randomDelay(500, 1500);
                } catch (error) {
                    console.log(`[YelpScraper] Error extracting business ${i + 1}: ${error.message}`);
                    this.updateStats(false);
                }
            }
            
            return businesses;
            
        } catch (error) {
            console.error(`[YelpScraper] Search failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Extract business data from Yelp business card
     */
    async extractBusinessData(cardElement) {
        try {
            const business = {};
            
            // Business name
            business.businessName = await this.extractText(cardElement, '[data-testid="serp-ia-card"] h3 a', 'span');
            
            // Rating and review count
            const ratingElement = await cardElement.$('[role="img"][aria-label*="star"]');
            if (ratingElement) {
                const ariaLabel = await ratingElement.getAttribute('aria-label');
                const ratingMatch = ariaLabel.match(/(\d+\.?\d*)\s*star/);
                business.rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
            }
            
            const reviewElement = await cardElement.$('span[data-font-weight="semibold"]');
            if (reviewElement) {
                const reviewText = await reviewElement.textContent();
                const reviewMatch = reviewText.match(/(\d+)/);
                business.reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : 0;
            }
            
            // Categories
            const categoryElements = await cardElement.$$('button[data-testid="category-link"]');
            business.categories = [];
            for (const categoryEl of categoryElements) {
                const categoryText = await categoryEl.textContent();
                if (categoryText.trim()) {
                    business.categories.push(categoryText.trim());
                }
            }
            business.category = business.categories.length > 0 ? business.categories[0] : null;
            
            // Price range
            const priceElement = await cardElement.$('[data-testid="price-range"]');
            business.priceRange = priceElement ? await priceElement.textContent() : null;
            
            // Address
            business.address = await this.extractText(cardElement, '[data-testid="address"]');
            
            // Phone number (if visible)
            business.phone = await this.extractText(cardElement, '[data-testid="phone"]');
            
            // Website/Yelp URL
            const linkElement = await cardElement.$('h3 a');
            if (linkElement) {
                const relativeUrl = await linkElement.getAttribute('href');
                business.yelpUrl = relativeUrl ? `${this.baseUrl}${relativeUrl}` : null;
            }
            
            // Location parsing
            if (business.address) {
                business.locationDetails = this.parseLocation(business.address);
            }
            
            // Data quality assessment
            business.dataQualityScore = this.calculateDataQuality(business);
            business.verificationStatus = business.dataQualityScore >= 70 ? 'Verified' : 'Partially Verified';
            
            return business;
            
        } catch (error) {
            console.error(`[YelpScraper] Error extracting business data: ${error.message}`);
            return null;
        }
    }

    /**
     * Extract text from element with fallback selectors
     */
    async extractText(parent, ...selectors) {
        for (const selector of selectors) {
            try {
                const element = await parent.$(selector);
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
     * Parse location details from address
     */
    parseLocation(address) {
        const locationDetails = {};
        
        // Extract emirate
        const emirates = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'];
        for (const emirate of emirates) {
            if (address.includes(emirate)) {
                locationDetails.emirate = emirate;
                break;
            }
        }
        
        // Extract common Dubai areas
        const dubaiAreas = [
            'Dubai Marina', 'Downtown Dubai', 'Business Bay', 'DIFC', 'JLT', 'Jumeirah',
            'Dubai Mall', 'Burj Khalifa', 'Sheikh Zayed Road', 'Deira', 'Bur Dubai',
            'Al Barsha', 'Dubai Sports City', 'Dubai Hills', 'City Walk'
        ];
        
        for (const area of dubaiAreas) {
            if (address.includes(area)) {
                locationDetails.area = area;
                break;
            }
        }
        
        return locationDetails;
    }

    /**
     * Calculate data quality score
     */
    calculateDataQuality(business) {
        let score = 0;
        
        if (business.businessName) score += 20;
        if (business.address) score += 15;
        if (business.phone) score += 15;
        if (business.rating && business.rating > 0) score += 10;
        if (business.reviewCount && business.reviewCount > 0) score += 10;
        if (business.categories && business.categories.length > 0) score += 10;
        if (business.priceRange) score += 5;
        if (business.yelpUrl) score += 10;
        if (business.locationDetails && Object.keys(business.locationDetails).length > 0) score += 5;
        
        return Math.min(score, 100);
    }

    /**
     * Get detailed business information by visiting business page
     */
    async getBusinessDetails(yelpUrl) {
        try {
            const detailPage = await this.context.newPage();
            await detailPage.goto(yelpUrl, { waitUntil: 'networkidle' });
            
            const details = {};
            
            // Business hours
            details.businessHours = await this.extractBusinessHours(detailPage);
            
            // Website
            const websiteLink = await detailPage.$('a[href*="biz_redir"]');
            if (websiteLink) {
                const href = await websiteLink.getAttribute('href');
                // Extract actual website from Yelp redirect
                const urlMatch = href.match(/url=([^&]+)/);
                if (urlMatch) {
                    details.website = decodeURIComponent(urlMatch[1]);
                }
            }
            
            // Full description
            details.description = await this.safeText('p[data-testid="business-description"]');
            
            // Photos count
            const photosElement = await detailPage.$('[data-testid="photo-count"]');
            if (photosElement) {
                const photosText = await photosElement.textContent();
                const photosMatch = photosText.match(/(\d+)/);
                details.photosCount = photosMatch ? parseInt(photosMatch[1]) : 0;
            }
            
            await detailPage.close();
            return details;
            
        } catch (error) {
            console.error(`[YelpScraper] Error getting business details: ${error.message}`);
            return {};
        }
    }

    /**
     * Extract business hours
     */
    async extractBusinessHours(page) {
        try {
            const hoursTable = await page.$('[data-testid="hours-table"]');
            if (!hoursTable) return null;
            
            const hours = {};
            const dayElements = await hoursTable.$$('tr');
            
            for (const dayEl of dayElements) {
                const dayText = await this.extractText(dayEl, 'th');
                const timeText = await this.extractText(dayEl, 'td');
                
                if (dayText && timeText) {
                    hours[dayText] = timeText;
                }
            }
            
            return Object.keys(hours).length > 0 ? hours : null;
            
        } catch (error) {
            return null;
        }
    }
}

module.exports = YelpScraper;