/**
 * LinkedIn People Scraper
 * Searches for professionals by job title, company, and location
 * Extracts: Name, Title, Company, Location, Profile URL, Email patterns
 */

// Load environment variables
require('dotenv').config();

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class LinkedInScraper {
    constructor(options = {}) {
        this.options = {
            headless: options.headless !== false,
            timeout: options.timeout || 30000,
            email: options.email || process.env.LINKEDIN_EMAIL,
            password: options.password || process.env.LINKEDIN_PASSWORD,
            ...options
        };
        
        this.browser = null;
        this.page = null;
        this.isLoggedIn = false;
        
        this.stats = {
            searched: 0,
            extracted: 0,
            failed: 0,
            startTime: Date.now()
        };
    }

    /**
     * Initialize browser
     */
    async initialize() {
        console.log('[LinkedIn] Initializing browser...');
        
        this.browser = await chromium.launch({
            headless: this.options.headless,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        this.page = await this.browser.newPage({
            viewport: { width: 1366, height: 768 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });

        // Remove automation detection
        await this.page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        });

        console.log('[LinkedIn] Browser initialized');
    }

    /**
     * Login to LinkedIn
     */
    async login() {
        if (!this.options.email || !this.options.password) {
            console.log('\n⚠️  LinkedIn credentials not provided.');
            console.log('Set LINKEDIN_EMAIL and LINKEDIN_PASSWORD environment variables, or:');
            console.log('  const scraper = new LinkedInScraper({ email: "your@email.com", password: "yourpass" });');
            console.log('\nWill attempt to use browser session if already logged in...\n');
            return false;
        }

        try {
            console.log('[LinkedIn] Navigating to login page...');
            await this.page.goto('https://www.linkedin.com/login', { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });

            // Fill login form
            console.log('[LinkedIn] Entering credentials...');
            await this.page.fill('#username', this.options.email);
            await this.page.fill('#password', this.options.password);
            
            // Click sign in
            await this.page.click('button[type="submit"]');
            
            // Wait for navigation
            await this.page.waitForLoadState('networkidle', { timeout: 30000 });
            
            // Check if login successful
            const currentUrl = this.page.url();
            if (currentUrl.includes('/feed') || currentUrl.includes('/in/')) {
                console.log('[LinkedIn] ✅ Login successful!');
                this.isLoggedIn = true;
                await this.page.waitForTimeout(2000);
                return true;
            } else if (currentUrl.includes('/checkpoint/challenge')) {
                console.log('[LinkedIn] ⚠️  Security challenge detected. Please complete manually in the browser.');
                await this.page.waitForTimeout(30000); // Wait for manual completion
                this.isLoggedIn = true;
                return true;
            } else {
                console.log('[LinkedIn] ❌ Login may have failed. Current URL:', currentUrl);
                return false;
            }
        } catch (error) {
            console.error('[LinkedIn] Login error:', error.message);
            return false;
        }
    }

    /**
     * Search for people
     */
    async searchPeople(query) {
        console.log(`\n[LinkedIn] Searching for: "${query}"`);
        
        try {
            // Navigate to search
            const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`;
            await this.page.goto(searchUrl, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });

            await this.page.waitForTimeout(3000);
            
            // Check if we're still logged in
            if (this.page.url().includes('/login')) {
                console.log('[LinkedIn] Session expired or not logged in');
                return [];
            }

            const people = [];
            let scrollAttempts = 0;
            const maxScrolls = 5;

            while (scrollAttempts < maxScrolls) {
                // Extract people from current view
                const newPeople = await this.extractPeopleFromPage();
                people.push(...newPeople);
                
                console.log(`[LinkedIn] Extracted ${newPeople.length} people (total: ${people.length})`);
                
                // Scroll down
                await this.page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight);
                });
                
                await this.page.waitForTimeout(2000);
                scrollAttempts++;
            }

            // Remove duplicates
            const uniquePeople = this.deduplicatePeople(people);
            console.log(`[LinkedIn] Found ${uniquePeople.length} unique profiles`);
            
            this.stats.searched++;
            this.stats.extracted += uniquePeople.length;
            
            return uniquePeople;

        } catch (error) {
            console.error('[LinkedIn] Search error:', error.message);
            this.stats.failed++;
            return [];
        }
    }

    /**
     * Extract people from current page
     */
    async extractPeopleFromPage() {
        try {
            const people = await this.page.evaluate(() => {
                const results = [];
                
                // Try multiple selectors for different LinkedIn layouts
                const selectors = [
                    '.reusable-search__result-container',
                    '.search-result__wrapper',
                    'li.reusable-search__result-container',
                    'div[data-chameleon-result-urn]'
                ];
                
                let elements = [];
                for (const selector of selectors) {
                    elements = document.querySelectorAll(selector);
                    if (elements.length > 0) break;
                }

                elements.forEach(element => {
                    try {
                        // Name
                        const nameEl = element.querySelector('.entity-result__title-text a span[aria-hidden="true"]') ||
                                      element.querySelector('.actor-name') ||
                                      element.querySelector('[data-anonymize="person-name"]');
                        const name = nameEl?.textContent?.trim() || '';

                        // Title
                        const titleEl = element.querySelector('.entity-result__primary-subtitle') ||
                                       element.querySelector('.actor-description');
                        const title = titleEl?.textContent?.trim() || '';

                        // Company
                        const companyEl = element.querySelector('.entity-result__secondary-subtitle') ||
                                         element.querySelector('.actor-description-detail');
                        let company = companyEl?.textContent?.trim() || '';
                        
                        // Clean company text (remove "at" prefix)
                        company = company.replace(/^at\s+/i, '').trim();

                        // Location
                        const locationEl = element.querySelector('.entity-result__location') ||
                                          element.querySelector('[data-anonymize="location"]');
                        const location = locationEl?.textContent?.trim() || '';

                        // Profile URL
                        const linkEl = element.querySelector('a.app-aware-link[href*="/in/"]') ||
                                      element.querySelector('a[href*="/in/"]');
                        const profileUrl = linkEl?.href || '';

                        // Extract profile ID
                        const profileId = profileUrl.match(/\/in\/([^/?]+)/)?.[1] || '';

                        if (name && profileUrl) {
                            results.push({
                                name,
                                title,
                                company,
                                location,
                                profileUrl,
                                profileId
                            });
                        }
                    } catch (err) {
                        console.error('Error extracting person:', err);
                    }
                });

                return results;
            });

            return people;

        } catch (error) {
            console.error('[LinkedIn] Extract error:', error.message);
            return [];
        }
    }

    /**
     * Remove duplicate people
     */
    deduplicatePeople(people) {
        const seen = new Set();
        return people.filter(person => {
            const key = person.profileUrl || person.name;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    /**
     * Enrich person with email patterns
     */
    enrichWithEmailPatterns(person) {
        if (!person.name || !person.company) {
            return person;
        }

        // Extract first and last name
        const nameParts = person.name.split(' ').filter(p => p.length > 0);
        const firstName = nameParts[0]?.toLowerCase() || '';
        const lastName = nameParts[nameParts.length - 1]?.toLowerCase() || '';
        
        // Extract domain from company name (guess)
        const companyDomain = person.company
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '');

        // Common email patterns
        const emailPatterns = [
            `${firstName}.${lastName}@${companyDomain}.com`,
            `${firstName}.${lastName}@${companyDomain}.ae`,
            `${firstName}@${companyDomain}.com`,
            `${firstName}${lastName}@${companyDomain}.com`,
            `${firstName.charAt(0)}${lastName}@${companyDomain}.com`,
            `${firstName}_${lastName}@${companyDomain}.com`
        ];

        return {
            ...person,
            firstName,
            lastName,
            emailPatterns: emailPatterns.slice(0, 3), // Top 3 most common
            likelyEmail: emailPatterns[0] // Most common pattern
        };
    }

    /**
     * Get statistics
     */
    getStats() {
        const duration = Date.now() - this.stats.startTime;
        return {
            ...this.stats,
            duration: `${(duration / 1000).toFixed(1)}s`,
            avgPerSearch: this.stats.searched > 0 
                ? (this.stats.extracted / this.stats.searched).toFixed(1)
                : 0
        };
    }

    /**
     * Close browser
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('\n[LinkedIn] Browser closed');
        }
    }
}

/**
 * Real Estate Executive Search Queries
 */
const REAL_ESTATE_SEARCHES = [
    // Property Management
    'Property Manager Dubai',
    'Property Management Director Dubai',
    'Building Manager Dubai',
    'Community Manager Dubai',
    
    // Holiday Homes & Rentals
    'Vacation Rental Manager Dubai',
    'Holiday Homes Manager Dubai',
    'Short-term Rental Manager Dubai',
    'Airbnb Manager Dubai',
    
    // Real Estate Leadership
    'Real Estate Director Dubai',
    'Real Estate CEO Dubai',
    'Real Estate Managing Director Dubai',
    
    // Facilities Management
    'Facilities Manager Dubai',
    'FM Director Dubai',
    'Estate Manager Dubai',
    
    // Operations
    'Operations Manager Real Estate Dubai',
    'Leasing Manager Dubai',
    'Asset Manager Dubai'
];

/**
 * Run LinkedIn Real Estate Executive Search
 */
async function runLinkedInRealEstateSearch() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  LinkedIn Real Estate Executive Finder                  ║');
    console.log('║  Property Management & Rental Sector Decision Makers    ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const scraper = new LinkedInScraper({
        headless: false, // Set to false to see browser and login manually if needed
        email: process.env.LINKEDIN_EMAIL,
        password: process.env.LINKEDIN_PASSWORD
    });

    try {
        await scraper.initialize();
        
        // Login
        console.log('\n📝 Attempting LinkedIn login...');
        const loggedIn = await scraper.login();
        
        if (!loggedIn) {
            console.log('\n⚠️  Not logged in. Please:');
            console.log('1. Login manually in the browser window that opened');
            console.log('2. Press Enter here when done\n');
            
            // Wait for manual login
            await new Promise(resolve => {
                process.stdin.once('data', () => resolve());
            });
            
            scraper.isLoggedIn = true;
        }

        const allPeople = [];

        console.log(`\n📋 Searching ${REAL_ESTATE_SEARCHES.length} executive categories...\n`);

        for (const [index, query] of REAL_ESTATE_SEARCHES.entries()) {
            console.log(`\n${'═'.repeat(60)}`);
            console.log(`🔍 Search ${index + 1}/${REAL_ESTATE_SEARCHES.length}: ${query}`);
            console.log('═'.repeat(60));

            const people = await scraper.searchPeople(query);
            
            // Enrich with email patterns
            const enrichedPeople = people.map(person => ({
                ...scraper.enrichWithEmailPatterns(person),
                searchQuery: query,
                searchCategory: 'Real Estate & Property Management',
                scrapedAt: new Date().toISOString()
            }));

            allPeople.push(...enrichedPeople);

            console.log(`✅ Found ${enrichedPeople.length} professionals`);

            // Show sample
            if (enrichedPeople.length > 0) {
                const sample = enrichedPeople.slice(0, 3);
                sample.forEach((person, i) => {
                    console.log(`\n   ${i + 1}. ${person.name}`);
                    console.log(`      Title: ${person.title || 'N/A'}`);
                    console.log(`      Company: ${person.company || 'N/A'}`);
                    console.log(`      Location: ${person.location || 'N/A'}`);
                    console.log(`      Likely Email: ${person.likelyEmail || 'N/A'}`);
                    console.log(`      LinkedIn: ${person.profileUrl}`);
                });
            }

            // Delay between searches
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        // Remove duplicates across all searches
        const uniquePeople = scraper.deduplicatePeople(allPeople);

        // Save results
        console.log('\n\n' + '═'.repeat(60));
        console.log('💾 Saving results...');
        console.log('═'.repeat(60));

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultsDir = path.join(__dirname, '../../results');

        // JSON
        const jsonFilename = `linkedin-real-estate-executives-${timestamp}.json`;
        const jsonPath = path.join(resultsDir, jsonFilename);
        await fs.writeFile(jsonPath, JSON.stringify(uniquePeople, null, 2));
        console.log(`✅ JSON saved: ${jsonFilename}`);

        // CSV
        const csvFilename = `linkedin-real-estate-executives-${timestamp}.csv`;
        const csvPath = path.join(resultsDir, csvFilename);
        const csvContent = convertToCSV(uniquePeople);
        await fs.writeFile(csvPath, csvContent);
        console.log(`✅ CSV saved: ${csvFilename}`);

        // Print summary
        printSummary(uniquePeople, scraper);

        await scraper.close();

    } catch (error) {
        console.error('\n❌ Error:', error);
        await scraper.close();
        process.exit(1);
    }
}

/**
 * Convert to CSV
 */
function convertToCSV(people) {
    const headers = [
        'Name', 'First Name', 'Last Name', 'Title', 'Company', 'Location',
        'LinkedIn URL', 'Profile ID', 'Likely Email', 'Email Pattern 2', 'Email Pattern 3',
        'Search Query', 'Category', 'Scraped At'
    ];

    const rows = [headers.join(',')];

    people.forEach(person => {
        const row = [
            `"${person.name.replace(/"/g, '""')}"`,
            person.firstName || '',
            person.lastName || '',
            `"${(person.title || '').replace(/"/g, '""')}"`,
            `"${(person.company || '').replace(/"/g, '""')}"`,
            `"${(person.location || '').replace(/"/g, '""')}"`,
            person.profileUrl || '',
            person.profileId || '',
            person.likelyEmail || '',
            person.emailPatterns?.[1] || '',
            person.emailPatterns?.[2] || '',
            `"${(person.searchQuery || '').replace(/"/g, '""')}"`,
            person.searchCategory || '',
            person.scrapedAt || ''
        ];
        rows.push(row.join(','));
    });

    return rows.join('\n');
}

/**
 * Print summary
 */
function printSummary(people, scraper) {
    console.log('\n\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                    CAMPAIGN SUMMARY                      ║');
    console.log('╚══════════════════════════════════════════════════════════╝');

    const stats = scraper.getStats();
    
    console.log(`\n📊 Overall Statistics:`);
    console.log(`   Searches performed: ${stats.searched}`);
    console.log(`   Total profiles found: ${people.length}`);
    console.log(`   Avg per search: ${stats.avgPerSearch}`);
    console.log(`   Duration: ${stats.duration}`);

    // Company breakdown
    const companies = {};
    people.forEach(p => {
        if (p.company) {
            companies[p.company] = (companies[p.company] || 0) + 1;
        }
    });

    console.log(`\n🏢 Top Companies (by executives found):`);
    Object.entries(companies)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .forEach(([company, count]) => {
            console.log(`   • ${company}: ${count} executives`);
        });

    // Title breakdown
    const titles = {};
    people.forEach(p => {
        const titleKey = p.title?.split(' at ')[0] || 'Unknown';
        titles[titleKey] = (titles[titleKey] || 0) + 1;
    });

    console.log(`\n💼 Top Titles:`);
    Object.entries(titles)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([title, count]) => {
            console.log(`   • ${title}: ${count}`);
        });

    console.log(`\n👥 Sample Contacts:`);
    people.slice(0, 10).forEach((person, i) => {
        console.log(`\n   ${i + 1}. ${person.name}`);
        console.log(`      ${person.title || 'N/A'} at ${person.company || 'N/A'}`);
        console.log(`      📧 ${person.likelyEmail}`);
        console.log(`      🔗 ${person.profileUrl}`);
    });

    console.log('\n\n✅ LinkedIn search completed!');
    console.log('📁 Check results/ directory for CSV and JSON files\n');
}

// Run if executed directly
if (require.main === module) {
    runLinkedInRealEstateSearch()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { LinkedInScraper, runLinkedInRealEstateSearch };
