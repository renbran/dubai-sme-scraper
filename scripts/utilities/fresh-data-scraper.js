const { chromium } = require('playwright');
const fs = require('fs');

class FreshDataScraper {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = [];
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        ];
        
        console.log('\n🌐 FRESH DATA SCRAPER INITIALIZED');
        console.log('🎯 Target: Real-time Dubai business data');
        console.log('🔧 Method: Advanced anti-detection scraping');
        console.log('📊 Expected: 20+ fresh business contacts\n');
    }

    async initBrowser() {
        try {
            console.log('🚀 Launching stealth browser...');
            
            this.browser = await chromium.launch({
                headless: false, // Show browser for demonstration
                args: [
                    '--no-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-features=VizDisplayCompositor',
                    '--disable-web-security',
                    '--disable-features=TranslateUI',
                    '--disable-ipc-flooding-protection',
                    '--disable-renderer-backgrounding',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-client-side-phishing-detection',
                    '--disable-sync',
                    '--disable-default-apps',
                    '--no-first-run',
                    '--no-default-browser-check'
                ]
            });

            const context = await this.browser.newContext({
                userAgent: this.userAgents[Math.floor(Math.random() * this.userAgents.length)],
                viewport: { width: 1366, height: 768 },
                locale: 'en-US',
                timezoneId: 'Asia/Dubai'
            });

            this.page = await context.newPage();
            
            // Add stealth scripts
            await this.page.addInitScript(() => {
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });
                
                window.chrome = {
                    runtime: {},
                };
                
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5],
                });
            });

            console.log('✅ Stealth browser ready with anti-detection measures');
            return true;
            
        } catch (error) {
            console.error('❌ Browser initialization failed:', error.message);
            return false;
        }
    }

    async humanLikeDelay(min = 1000, max = 3000) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        await this.page.waitForTimeout(delay);
    }

    async simulateHumanBehavior() {
        // Random mouse movements
        await this.page.mouse.move(
            Math.random() * 1000, 
            Math.random() * 600
        );
        
        // Random scrolling
        await this.page.evaluate(() => {
            window.scrollBy(0, Math.random() * 500);
        });
        
        await this.humanLikeDelay(500, 1500);
    }

    async scrapeDubaiBusinesses() {
        try {
            console.log('🔍 Starting fresh Dubai business data collection...');
            
            const searches = [
                'business consultants Dubai',
                'accounting services Dubai Marina',
                'PRO services Bur Dubai',
                'company formation Dubai',
                'business setup DIFC'
            ];

            for (let i = 0; i < searches.length; i++) {
                const searchTerm = searches[i];
                console.log(`\n🎯 Search ${i + 1}/${searches.length}: "${searchTerm}"`);
                
                await this.performSearch(searchTerm);
                await this.humanLikeDelay(3000, 5000);
                
                if (i < searches.length - 1) {
                    console.log('⏳ Cooling down between searches...');
                    await this.humanLikeDelay(5000, 8000);
                }
            }

            console.log(`\n🎉 Collection complete! Found ${this.results.length} businesses`);
            return this.results;
            
        } catch (error) {
            console.error('❌ Scraping failed:', error.message);
            return [];
        }
    }

    async performSearch(searchTerm) {
        try {
            // Navigate to Google Maps
            console.log('🗺️ Navigating to Google Maps...');
            await this.page.goto('https://www.google.com/maps', { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });

            await this.simulateHumanBehavior();

            // Find and click search box
            const searchBox = await this.page.waitForSelector('input[id="searchboxinput"]', { timeout: 10000 });
            
            // Clear and type search term with human-like typing
            await searchBox.click();
            await this.page.keyboard.press('Control+A');
            await this.humanLikeDelay(200, 500);
            
            for (const char of searchTerm) {
                await this.page.keyboard.type(char);
                await this.humanLikeDelay(50, 150);
            }
            
            // Press Enter
            await this.page.keyboard.press('Enter');
            console.log('🔍 Search submitted, waiting for results...');

            // Wait for results to load
            await this.page.waitForSelector('[role="main"]', { timeout: 15000 });
            await this.humanLikeDelay(3000, 5000);

            // Extract business information
            await this.extractBusinessData(searchTerm);
            
        } catch (error) {
            console.error(`❌ Search failed for "${searchTerm}":`, error.message);
        }
    }

    async extractBusinessData(searchTerm) {
        try {
            console.log('📊 Extracting business data...');
            
            // Wait for business listings
            await this.page.waitForSelector('[role="article"]', { timeout: 10000 });
            
            const businesses = await this.page.$$eval('[role="article"]', (articles) => {
                return articles.slice(0, 5).map(article => {
                    try {
                        const nameElement = article.querySelector('[class*="fontHeadlineSmall"]');
                        const ratingElement = article.querySelector('[class*="fontBodyMedium"] span[aria-label*="stars"]');
                        const categoryElement = article.querySelector('[class*="fontBodyMedium"]:nth-of-type(2)');
                        const addressElement = article.querySelector('[class*="fontBodyMedium"]:last-of-type');
                        
                        return {
                            name: nameElement?.textContent?.trim() || 'Name not found',
                            rating: ratingElement?.getAttribute('aria-label') || 'No rating',
                            category: categoryElement?.textContent?.trim() || 'Category not found',
                            address: addressElement?.textContent?.trim() || 'Address not found',
                            timestamp: new Date().toISOString(),
                            freshData: true
                        };
                    } catch (e) {
                        return null;
                    }
                }).filter(Boolean);
            });

            console.log(`✅ Extracted ${businesses.length} businesses for "${searchTerm}"`);
            
            businesses.forEach((business, index) => {
                business.searchTerm = searchTerm;
                business.id = `fresh_${Date.now()}_${index}`;
                business.dataSource = 'Live Google Maps Scraping';
                business.qualityScore = this.calculateQualityScore(business);
                
                this.results.push(business);
                
                console.log(`📍 ${business.name} - ${business.category} - Quality: ${business.qualityScore}/10`);
            });

        } catch (error) {
            console.error('❌ Data extraction failed:', error.message);
        }
    }

    calculateQualityScore(business) {
        let score = 5; // Base score
        
        if (business.name && business.name !== 'Name not found') score += 2;
        if (business.rating && business.rating !== 'No rating') score += 1;
        if (business.category && business.category !== 'Category not found') score += 1;
        if (business.address && business.address !== 'Address not found') score += 1;
        
        return Math.min(score, 10);
    }

    async saveResults() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `fresh-dubai-businesses-${timestamp}`;
            
            // Save JSON
            const jsonPath = `./results/${filename}.json`;
            fs.writeFileSync(jsonPath, JSON.stringify({
                meta: {
                    timestamp: new Date().toISOString(),
                    totalBusinesses: this.results.length,
                    dataFreshness: 'Real-time scraped',
                    scrapingMethod: 'Advanced anti-detection',
                    averageQuality: this.results.reduce((sum, b) => sum + b.qualityScore, 0) / this.results.length
                },
                businesses: this.results
            }, null, 2));

            // Save CSV
            const csvPath = `./results/${filename}.csv`;
            const csvHeader = 'Name,Category,Rating,Address,Search Term,Quality Score,Timestamp,Data Source\n';
            const csvContent = this.results.map(b => 
                `"${b.name}","${b.category}","${b.rating}","${b.address}","${b.searchTerm}",${b.qualityScore},"${b.timestamp}","${b.dataSource}"`
            ).join('\n');
            
            fs.writeFileSync(csvPath, csvHeader + csvContent);

            console.log(`\n💾 Results saved:`);
            console.log(`📄 JSON: ${jsonPath}`);
            console.log(`📊 CSV: ${csvPath}`);
            console.log(`🎯 Total Businesses: ${this.results.length}`);
            console.log(`⭐ Average Quality: ${(this.results.reduce((sum, b) => sum + b.qualityScore, 0) / this.results.length).toFixed(1)}/10`);
            
        } catch (error) {
            console.error('❌ Save failed:', error.message);
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔚 Browser closed');
        }
    }
}

// Main execution
async function runFreshDataCollection() {
    const scraper = new FreshDataScraper();
    
    try {
        console.log('🌟 FRESH DATA SCRAPING DEMONSTRATION');
        console.log('=' .repeat(50));
        
        const browserReady = await scraper.initBrowser();
        if (!browserReady) {
            console.log('❌ Cannot proceed without browser');
            return;
        }

        const results = await scraper.scrapeDubaiBusinesses();
        
        if (results.length > 0) {
            await scraper.saveResults();
            
            console.log('\n🎉 FRESH DATA COLLECTION SUCCESSFUL!');
            console.log('📈 Quality Data Metrics:');
            console.log(`   • Total Businesses: ${results.length}`);
            console.log(`   • Real-time Data: 100%`);
            console.log(`   • Success Rate: ${(results.length / 25 * 100).toFixed(1)}%`);
            console.log('🚀 Ready for immediate lead outreach!');
            
        } else {
            console.log('⚠️ No data collected - check network and retry');
        }
        
    } catch (error) {
        console.error('💥 Scraping failed:', error.message);
        
        console.log('\n🔧 TROUBLESHOOTING SUGGESTIONS:');
        console.log('1. Check internet connection');
        console.log('2. Disable VPN if active');
        console.log('3. Clear browser cache');
        console.log('4. Try different search terms');
        console.log('5. Use manual backup database');
        
    } finally {
        await scraper.close();
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏹️ Stopping scraper...');
    process.exit(0);
});

// Export for use in other files
module.exports = { FreshDataScraper, runFreshDataCollection };

// Run if called directly
if (require.main === module) {
    runFreshDataCollection();
}