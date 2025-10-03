const { chromium } = require('playwright');
const fs = require('fs');

class ExtendedLeadScraper {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = [];
        this.startTime = Date.now();
        this.maxDuration = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.targetLeads = 100;
        
        console.log('\n🚀 EXTENDED 2-HOUR LEAD COLLECTION CAMPAIGN');
        console.log('⏰ Duration: 2 hours maximum');
        console.log('🎯 Target: 100+ fresh Dubai business leads');
        console.log('📊 Strategy: Multi-source systematic collection');
        console.log('💾 Auto-save: Every 10 leads\n');
    }

    async initBrowser() {
        try {
            console.log('🌐 Launching stealth browser...');
            
            this.browser = await chromium.launch({
                headless: true, // Run headless for better performance
                timeout: 60000,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu'
                ]
            });

            const context = await this.browser.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport: { width: 1920, height: 1080 },
                locale: 'en-US',
                timezoneId: 'Asia/Dubai',
                geolocation: { latitude: 25.2048, longitude: 55.2708 }, // Dubai coordinates
                permissions: ['geolocation']
            });

            this.page = await context.newPage();
            
            // Advanced anti-detection
            await this.page.addInitScript(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
                Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
                Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
                window.chrome = { runtime: {} };
            });

            console.log('✅ Stealth browser ready for extended campaign\n');
            return true;
            
        } catch (error) {
            console.error('❌ Browser initialization failed:', error.message);
            return false;
        }
    }

    async runExtendedCampaign() {
        console.log('🎯 STARTING 2-HOUR COLLECTION CAMPAIGN');
        console.log('=' .repeat(60));
        
        const searchCategories = [
            // Business Services
            { term: 'business consultants Dubai', area: 'Dubai', category: 'Business Consulting' },
            { term: 'company formation Dubai DIFC', area: 'DIFC', category: 'Company Formation' },
            { term: 'business setup services Dubai Marina', area: 'Dubai Marina', category: 'Business Setup' },
            { term: 'PRO services Dubai', area: 'Dubai', category: 'PRO Services' },
            { term: 'business setup Deira Dubai', area: 'Deira', category: 'Business Setup' },
            
            // Accounting & Finance
            { term: 'chartered accountants Dubai', area: 'Dubai', category: 'Accounting' },
            { term: 'accounting services Business Bay', area: 'Business Bay', category: 'Accounting' },
            { term: 'tax consultants Dubai DIFC', area: 'DIFC', category: 'Tax Consulting' },
            { term: 'VAT consultants Dubai', area: 'Dubai', category: 'VAT Services' },
            { term: 'auditing services Dubai', area: 'Dubai', category: 'Auditing' },
            { term: 'bookkeeping services Dubai', area: 'Dubai', category: 'Bookkeeping' },
            
            // Legal & Compliance
            { term: 'business lawyers Dubai', area: 'Dubai', category: 'Legal Services' },
            { term: 'corporate lawyers DIFC', area: 'DIFC', category: 'Corporate Law' },
            { term: 'immigration consultants Dubai', area: 'Dubai', category: 'Immigration' },
            
            // Real Estate
            { term: 'commercial real estate Dubai', area: 'Dubai', category: 'Real Estate' },
            { term: 'property management Dubai Marina', area: 'Dubai Marina', category: 'Property Management' },
            
            // Trading & Retail
            { term: 'trading companies Dubai', area: 'Dubai', category: 'Trading' },
            { term: 'import export Dubai', area: 'Dubai', category: 'Import/Export' },
            
            // Technology
            { term: 'IT companies Dubai', area: 'Dubai', category: 'IT Services' },
            { term: 'software companies Dubai Internet City', area: 'Dubai Internet City', category: 'Software' },
            
            // Marketing
            { term: 'marketing agencies Dubai', area: 'Dubai', category: 'Marketing' },
            { term: 'digital marketing Dubai', area: 'Dubai', category: 'Digital Marketing' }
        ];

        let searchIndex = 0;
        let consecutiveFailures = 0;
        const maxConsecutiveFailures = 5;
        
        while (this.shouldContinue() && searchIndex < searchCategories.length) {
            const search = searchCategories[searchIndex];
            const elapsedMinutes = Math.floor((Date.now() - this.startTime) / 60000);
            
            console.log(`\n⏰ Time: ${elapsedMinutes} minutes | Collected: ${this.results.length} leads`);
            console.log(`🔍 Search ${searchIndex + 1}/${searchCategories.length}: "${search.term}"`);
            
            try {
                const collected = await this.searchGoogleMaps(search);
                
                if (collected > 0) {
                    consecutiveFailures = 0;
                    console.log(`✅ Collected ${collected} leads from "${search.term}"`);
                    
                    // Auto-save every 10 leads
                    if (this.results.length % 10 === 0 && this.results.length > 0) {
                        await this.saveProgress();
                    }
                } else {
                    consecutiveFailures++;
                    console.log(`⚠️ No leads from "${search.term}" (failures: ${consecutiveFailures})`);
                }
                
                // If too many failures, try to restart browser
                if (consecutiveFailures >= maxConsecutiveFailures) {
                    console.log('🔄 Too many failures, restarting browser...');
                    await this.restartBrowser();
                    consecutiveFailures = 0;
                }
                
                // Random delay between searches (human-like behavior)
                const delay = 5000 + Math.random() * 5000; // 5-10 seconds
                console.log(`⏳ Waiting ${Math.round(delay/1000)}s before next search...`);
                await this.page.waitForTimeout(delay);
                
            } catch (error) {
                console.error(`❌ Search failed: ${error.message}`);
                consecutiveFailures++;
            }
            
            searchIndex++;
        }
        
        const duration = Math.floor((Date.now() - this.startTime) / 60000);
        console.log(`\n🎉 Campaign completed after ${duration} minutes!`);
        console.log(`📊 Total leads collected: ${this.results.length}`);
        
        return this.results;
    }

    async searchGoogleMaps(search) {
        try {
            // Navigate to Google Maps
            await this.page.goto('https://www.google.com/maps', { 
                waitUntil: 'domcontentloaded',
                timeout: 45000 
            });
            
            await this.randomDelay(2000, 4000);

            // Find and use search box
            const searchBox = await this.page.waitForSelector('input[id="searchboxinput"]', { 
                timeout: 10000 
            }).catch(() => null);
            
            if (!searchBox) {
                console.log('❌ Search box not found');
                return 0;
            }

            // Clear and search
            await searchBox.click();
            await this.page.keyboard.press('Control+A');
            await this.randomDelay(300, 600);
            
            // Type search term naturally
            for (const char of search.term) {
                await this.page.keyboard.type(char);
                await this.randomDelay(50, 120);
            }
            
            await this.page.keyboard.press('Enter');
            
            // Wait for results
            await this.page.waitForSelector('[role="feed"]', { timeout: 15000 }).catch(() => null);
            await this.randomDelay(3000, 5000);

            // Scroll to load more results
            await this.scrollResults();
            
            // Extract business data
            const collected = await this.extractBusinessData(search);
            
            return collected;
            
        } catch (error) {
            console.log(`❌ Google Maps search failed: ${error.message}`);
            return 0;
        }
    }

    async scrollResults() {
        try {
            const scrollContainer = await this.page.$('[role="feed"]');
            if (!scrollContainer) return;
            
            // Scroll 3 times to load more results
            for (let i = 0; i < 3; i++) {
                await scrollContainer.evaluate(el => {
                    el.scrollBy(0, el.scrollHeight);
                });
                await this.randomDelay(1500, 2500);
            }
        } catch (error) {
            // Scroll failed, continue anyway
        }
    }

    async extractBusinessData(search) {
        try {
            const businesses = await this.page.$$eval('[role="article"]', (articles) => {
                return articles.map((article, index) => {
                    try {
                        const nameEl = article.querySelector('[class*="fontHeadlineSmall"]');
                        const ratingEl = article.querySelector('[role="img"][aria-label*="star"]');
                        const addressEl = article.querySelector('[class*="fontBodyMedium"]');
                        
                        const name = nameEl?.textContent?.trim();
                        if (!name) return null;
                        
                        return {
                            name: name,
                            rating: ratingEl?.getAttribute('aria-label') || 'No rating',
                            address: addressEl?.textContent?.trim() || 'Address not available',
                            id: `lead_${Date.now()}_${index}`
                        };
                    } catch (e) {
                        return null;
                    }
                }).filter(Boolean);
            });

            let addedCount = 0;
            
            businesses.forEach(business => {
                // Check for duplicates
                const isDuplicate = this.results.some(r => r.name === business.name);
                if (isDuplicate) return;
                
                business.category = search.category;
                business.area = search.area;
                business.searchTerm = search.term;
                business.phone = 'Research required';
                business.website = 'Research required';
                business.extractedAt = new Date().toISOString();
                business.dataSource = 'Live Google Maps Extended Campaign';
                business.qualityScore = this.calculateQuality(business);
                business.priority = this.determinePriority(business);
                
                this.results.push(business);
                addedCount++;
                
                console.log(`  📍 ${business.name} - ${business.category} (${business.area})`);
            });

            return addedCount;
            
        } catch (error) {
            console.log(`❌ Extraction failed: ${error.message}`);
            return 0;
        }
    }

    calculateQuality(business) {
        let score = 3;
        
        if (business.name && business.name.length > 5) score += 2;
        if (business.rating && business.rating !== 'No rating') score += 2;
        if (business.address && business.address.includes('Dubai')) score += 2;
        if (business.phone && business.phone !== 'Research required') score += 1;
        
        return Math.min(score, 10);
    }

    determinePriority(business) {
        if (business.qualityScore >= 8) return 'HIGH';
        if (business.qualityScore >= 6) return 'MEDIUM';
        return 'LOW';
    }

    shouldContinue() {
        const elapsed = Date.now() - this.startTime;
        const hasTime = elapsed < this.maxDuration;
        const needsMore = this.results.length < this.targetLeads;
        
        return hasTime && needsMore;
    }

    async randomDelay(min, max) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        await this.page.waitForTimeout(delay);
    }

    async restartBrowser() {
        try {
            if (this.browser) {
                await this.browser.close();
            }
            await this.initBrowser();
            console.log('✅ Browser restarted successfully');
        } catch (error) {
            console.error('❌ Browser restart failed:', error.message);
        }
    }

    async saveProgress() {
        try {
            const filename = `extended-campaign-progress-${this.timestamp}`;
            const jsonPath = `./results/${filename}.json`;
            
            const data = {
                meta: {
                    timestamp: new Date().toISOString(),
                    campaignDuration: Math.floor((Date.now() - this.startTime) / 60000) + ' minutes',
                    totalLeads: this.results.length,
                    targetLeads: this.targetLeads,
                    averageQuality: (this.results.reduce((sum, b) => sum + b.qualityScore, 0) / this.results.length).toFixed(1),
                    status: 'In Progress'
                },
                leads: this.results
            };
            
            fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
            console.log(`💾 Progress saved: ${this.results.length} leads`);
            
        } catch (error) {
            console.error('❌ Save progress failed:', error.message);
        }
    }

    async saveFinalResults() {
        try {
            if (!fs.existsSync('./results')) {
                fs.mkdirSync('./results');
            }

            const filename = `extended-campaign-final-${this.timestamp}`;
            const duration = Math.floor((Date.now() - this.startTime) / 60000);
            
            // Final JSON
            const jsonData = {
                meta: {
                    timestamp: new Date().toISOString(),
                    campaignDuration: duration + ' minutes',
                    totalLeads: this.results.length,
                    targetLeads: this.targetLeads,
                    successRate: ((this.results.length / this.targetLeads) * 100).toFixed(1) + '%',
                    averageQuality: (this.results.reduce((sum, b) => sum + b.qualityScore, 0) / this.results.length).toFixed(1),
                    categoryBreakdown: this.getCategoryBreakdown(),
                    priorityBreakdown: {
                        high: this.results.filter(r => r.priority === 'HIGH').length,
                        medium: this.results.filter(r => r.priority === 'MEDIUM').length,
                        low: this.results.filter(r => r.priority === 'LOW').length
                    }
                },
                leads: this.results
            };
            
            const jsonPath = `./results/${filename}.json`;
            fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

            // Final CSV
            const csvPath = `./results/${filename}.csv`;
            const csvHeader = 'Name,Category,Area,Rating,Address,Priority,Quality Score,Search Term,Timestamp\n';
            const csvRows = this.results.map(b => 
                `"${b.name}","${b.category}","${b.area}","${b.rating}","${b.address}","${b.priority}",${b.qualityScore},"${b.searchTerm}","${b.extractedAt}"`
            );
            
            fs.writeFileSync(csvPath, csvHeader + csvRows.join('\n'));

            console.log('\n💾 FINAL RESULTS SAVED:');
            console.log(`📄 JSON: ${jsonPath}`);
            console.log(`📊 CSV: ${csvPath}`);
            console.log(`🎯 Total Leads: ${this.results.length}`);
            console.log(`⏰ Duration: ${duration} minutes`);
            console.log(`⭐ Average Quality: ${jsonData.meta.averageQuality}/10`);
            console.log(`📈 Success Rate: ${jsonData.meta.successRate}`);
            
            this.printSummary();
            
            return { jsonPath, csvPath, count: this.results.length };
            
        } catch (error) {
            console.error('❌ Save final results failed:', error.message);
            return null;
        }
    }

    getCategoryBreakdown() {
        const breakdown = {};
        this.results.forEach(r => {
            breakdown[r.category] = (breakdown[r.category] || 0) + 1;
        });
        return breakdown;
    }

    printSummary() {
        console.log('\n📊 CAMPAIGN SUMMARY BY CATEGORY:');
        const categories = this.getCategoryBreakdown();
        Object.entries(categories).forEach(([cat, count]) => {
            console.log(`   ${cat}: ${count} leads`);
        });
        
        console.log('\n🎯 PRIORITY BREAKDOWN:');
        const high = this.results.filter(r => r.priority === 'HIGH').length;
        const medium = this.results.filter(r => r.priority === 'MEDIUM').length;
        const low = this.results.filter(r => r.priority === 'LOW').length;
        console.log(`   HIGH Priority: ${high} leads`);
        console.log(`   MEDIUM Priority: ${medium} leads`);
        console.log(`   LOW Priority: ${low} leads`);
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('\n🔚 Browser closed successfully');
        }
    }
}

// Main execution
async function runExtendedCampaign() {
    const scraper = new ExtendedLeadScraper();
    
    try {
        const browserReady = await scraper.initBrowser();
        if (!browserReady) {
            console.log('❌ Cannot start campaign without browser');
            return;
        }

        console.log('🚀 Starting 2-hour lead collection...\n');
        
        const results = await scraper.runExtendedCampaign();
        
        if (results.length > 0) {
            await scraper.saveFinalResults();
            
            console.log('\n🎉 EXTENDED CAMPAIGN COMPLETED SUCCESSFULLY!');
            console.log('🚀 Fresh Dubai business leads ready for outreach!');
        } else {
            console.log('\n⚠️ Campaign completed with no results');
            console.log('💡 Check network connection and try again');
        }
        
    } catch (error) {
        console.error('\n💥 Campaign failed:', error.message);
        console.log('\n🔧 Saving any collected data...');
        if (scraper.results.length > 0) {
            await scraper.saveFinalResults();
        }
        
    } finally {
        await scraper.close();
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏹️ Campaign interrupted by user');
    process.exit(0);
});

module.exports = { ExtendedLeadScraper, runExtendedCampaign };

if (require.main === module) {
    console.log('🌟 EXTENDED LEAD COLLECTION CAMPAIGN');
    console.log('⏰ Duration: Up to 2 hours');
    console.log('🎯 Target: 100+ fresh leads');
    console.log('💾 Auto-save: Every 10 leads');
    console.log('\nPress Ctrl+C to stop campaign early\n');
    
    runExtendedCampaign();
}