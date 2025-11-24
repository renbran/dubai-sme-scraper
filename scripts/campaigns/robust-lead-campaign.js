const { chromium } = require('playwright');
const fs = require('fs');

class RobustLeadScraper {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
        this.maxDuration = 2 * 60 * 60 * 1000; // 2 hours
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.targetLeads = 100;
        this.browser = null;
        this.context = null;
        
        console.log('\n🚀 ROBUST 2-HOUR LEAD COLLECTION');
        console.log('⏰ Duration: 2 hours maximum');
        console.log('🎯 Target: 100+ fresh leads');
        console.log('🔧 Enhanced: Better browser stability\n');
    }

    async runCampaign() {
        console.log('🎯 STARTING COLLECTION CAMPAIGN');
        console.log('=' .repeat(60));
        
        const searchTerms = [
            'business consultants Dubai',
            'accounting services Dubai',
            'company formation Dubai',
            'PRO services Dubai',
            'tax consultants Dubai',
            'business setup Dubai Marina',
            'chartered accountants Dubai',
            'VAT consultants Dubai',
            'business lawyers Dubai',
            'corporate consultants Dubai',
            'auditing services Dubai',
            'bookkeeping Dubai',
            'business setup Deira',
            'company registration Dubai',
            'business license Dubai',
            'trading companies Dubai',
            'IT companies Dubai',
            'marketing agencies Dubai',
            'real estate companies Dubai',
            'import export Dubai'
        ];

        for (let i = 0; i < searchTerms.length && this.shouldContinue(); i++) {
            const term = searchTerms[i];
            const elapsedMinutes = Math.floor((Date.now() - this.startTime) / 60000);
            
            console.log(`\n⏰ ${elapsedMinutes}min | Leads: ${this.results.length}/${this.targetLeads}`);
            console.log(`🔍 Search ${i + 1}/${searchTerms.length}: "${term}"`);
            
            try {
                // Fresh browser for each search to avoid issues
                await this.initBrowserForSearch();
                const collected = await this.searchAndCollect(term);
                await this.closeBrowser();
                
                if (collected > 0) {
                    console.log(`✅ Added ${collected} new leads`);
                    
                    if (this.results.length % 10 === 0) {
                        await this.saveProgress();
                    }
                } else {
                    console.log(`⚠️ No new leads from this search`);
                }
                
                // Delay between searches
                const delay = 3000 + Math.random() * 3000;
                console.log(`⏳ Cooling down ${Math.round(delay/1000)}s...`);
                await this.sleep(delay);
                
            } catch (error) {
                console.error(`❌ Search error: ${error.message}`);
                await this.closeBrowser();
            }
        }
        
        const duration = Math.floor((Date.now() - this.startTime) / 60000);
        console.log(`\n🎉 Campaign completed! Duration: ${duration} minutes`);
        console.log(`📊 Total leads: ${this.results.length}`);
        
        return this.results;
    }

    async initBrowserForSearch() {
        try {
            this.browser = await chromium.launch({
                headless: true,
                timeout: 60000,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled'
                ]
            });

            this.context = await this.browser.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                viewport: { width: 1920, height: 1080 },
                locale: 'en-US',
                geolocation: { latitude: 25.2048, longitude: 55.2708 }
            });

            await this.context.addInitScript(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            });

            return true;
        } catch (error) {
            console.error('❌ Browser init failed:', error.message);
            return false;
        }
    }

    async searchAndCollect(searchTerm) {
        try {
            const page = await this.context.newPage();
            
            console.log('  🌐 Opening Google Maps...');
            await page.goto('https://www.google.com/maps', { 
                waitUntil: 'domcontentloaded',
                timeout: 30000 
            });
            
            await this.sleep(2000);

            // Find search box
            const searchBox = await page.waitForSelector('#searchboxinput', { 
                timeout: 10000 
            }).catch(() => null);
            
            if (!searchBox) {
                console.log('  ❌ Search box not found');
                await page.close();
                return 0;
            }

            // Type search
            await searchBox.click();
            await page.keyboard.type(searchTerm, { delay: 100 });
            await page.keyboard.press('Enter');
            
            console.log('  ⏳ Waiting for results...');
            await this.sleep(5000);

            // Extract data
            const businesses = await page.evaluate(() => {
                const results = [];
                const articles = document.querySelectorAll('[role="article"]');
                
                articles.forEach((article, index) => {
                    if (index >= 10) return; // Limit to 10 per search
                    
                    const nameEl = article.querySelector('[class*="fontHeadlineSmall"]');
                    const ratingEl = article.querySelector('[role="img"][aria-label*="star"]');
                    
                    const name = nameEl?.textContent?.trim();
                    if (!name) return;
                    
                    results.push({
                        name: name,
                        rating: ratingEl?.getAttribute('aria-label') || 'No rating'
                    });
                });
                
                return results;
            });

            await page.close();

            // Add unique businesses
            let added = 0;
            businesses.forEach(business => {
                const isDuplicate = this.results.some(r => r.name === business.name);
                if (!isDuplicate) {
                    business.searchTerm = searchTerm;
                    business.extractedAt = new Date().toISOString();
                    business.dataSource = '2-Hour Extended Campaign';
                    business.phone = 'Research required';
                    business.website = 'Research required';
                    business.category = this.guessCategory(searchTerm);
                    business.qualityScore = business.rating !== 'No rating' ? 7 : 5;
                    
                    this.results.push(business);
                    added++;
                    console.log(`    📍 ${business.name}`);
                }
            });

            return added;
            
        } catch (error) {
            console.log(`  ❌ Collection failed: ${error.message}`);
            return 0;
        }
    }

    guessCategory(searchTerm) {
        if (searchTerm.includes('account')) return 'Accounting Services';
        if (searchTerm.includes('consult')) return 'Business Consulting';
        if (searchTerm.includes('formation') || searchTerm.includes('setup')) return 'Company Formation';
        if (searchTerm.includes('PRO')) return 'PRO Services';
        if (searchTerm.includes('tax') || searchTerm.includes('VAT')) return 'Tax Services';
        if (searchTerm.includes('legal') || searchTerm.includes('lawyer')) return 'Legal Services';
        if (searchTerm.includes('audit')) return 'Auditing';
        if (searchTerm.includes('trading')) return 'Trading';
        if (searchTerm.includes('IT')) return 'IT Services';
        if (searchTerm.includes('marketing')) return 'Marketing';
        if (searchTerm.includes('real estate')) return 'Real Estate';
        return 'Business Services';
    }

    async closeBrowser() {
        try {
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
                this.context = null;
            }
        } catch (error) {
            // Ignore close errors
        }
    }

    shouldContinue() {
        const elapsed = Date.now() - this.startTime;
        return elapsed < this.maxDuration && this.results.length < this.targetLeads;
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async saveProgress() {
        try {
            const filename = `campaign-progress-${this.timestamp}`;
            const jsonPath = `./results/${filename}.json`;
            
            if (!fs.existsSync('./results')) {
                fs.mkdirSync('./results');
            }
            
            fs.writeFileSync(jsonPath, JSON.stringify({
                meta: {
                    timestamp: new Date().toISOString(),
                    totalLeads: this.results.length,
                    duration: Math.floor((Date.now() - this.startTime) / 60000) + ' minutes'
                },
                leads: this.results
            }, null, 2));
            
            console.log(`  💾 Progress saved: ${this.results.length} leads`);
        } catch (error) {
            console.error('  ❌ Save failed:', error.message);
        }
    }

    async saveFinal() {
        try {
            const filename = `extended-campaign-${this.timestamp}`;
            const duration = Math.floor((Date.now() - this.startTime) / 60000);
            
            if (!fs.existsSync('./results')) {
                fs.mkdirSync('./results');
            }

            // JSON
            const jsonData = {
                meta: {
                    timestamp: new Date().toISOString(),
                    campaignDate: new Date().toLocaleDateString(),
                    duration: duration + ' minutes',
                    totalLeads: this.results.length,
                    targetLeads: this.targetLeads,
                    successRate: ((this.results.length / this.targetLeads) * 100).toFixed(1) + '%',
                    averageQuality: this.results.length > 0 ? 
                        (this.results.reduce((sum, b) => sum + b.qualityScore, 0) / this.results.length).toFixed(1) : 0
                },
                leads: this.results
            };
            
            const jsonPath = `./results/${filename}.json`;
            fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

            // CSV
            const csvPath = `./results/${filename}.csv`;
            const csvHeader = 'Name,Category,Rating,Search Term,Phone,Website,Quality Score,Timestamp\n';
            const csvRows = this.results.map(b => 
                `"${b.name}","${b.category}","${b.rating}","${b.searchTerm}","${b.phone}","${b.website}",${b.qualityScore},"${b.extractedAt}"`
            );
            
            fs.writeFileSync(csvPath, csvHeader + csvRows.join('\n'));

            console.log('\n💾 FINAL RESULTS SAVED:');
            console.log(`📄 JSON: ${jsonPath}`);
            console.log(`📊 CSV: ${csvPath}`);
            console.log(`🎯 Leads: ${this.results.length}`);
            console.log(`⏰ Duration: ${duration} minutes`);
            console.log(`⭐ Avg Quality: ${jsonData.meta.averageQuality}/10`);
            
            return { jsonPath, csvPath, count: this.results.length };
            
        } catch (error) {
            console.error('❌ Save final failed:', error.message);
            return null;
        }
    }
}

async function run() {
    const scraper = new RobustLeadScraper();
    
    try {
        await scraper.runCampaign();
        
        if (scraper.results.length > 0) {
            await scraper.saveFinal();
            console.log('\n🎉 CAMPAIGN SUCCESSFUL!');
            console.log(`📊 Collected ${scraper.results.length} fresh Dubai business leads`);
        } else {
            console.log('\n⚠️ Campaign completed with no results');
        }
        
    } catch (error) {
        console.error('\n💥 Campaign failed:', error.message);
        if (scraper.results.length > 0) {
            await scraper.saveFinal();
        }
    } finally {
        await scraper.closeBrowser();
    }
}

process.on('SIGINT', () => {
    console.log('\n⏹️ Campaign stopped by user');
    process.exit(0);
});

if (require.main === module) {
    console.log('🌟 2-HOUR LEAD COLLECTION STARTING');
    console.log('Press Ctrl+C to stop early\n');
    run();
}

module.exports = { RobustLeadScraper, run };