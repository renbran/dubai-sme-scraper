const { chromium } = require('playwright');
const fs = require('fs');

class MassiveLeadGenerator {
    constructor() {
        this.results = [];
        this.processed = new Set();
        this.targetCount = 30;
        this.currentCount = 0;
        
        // Expanded search categories targeting 30+ leads
        this.searchCategories = [
            // ACCOUNTING & FINANCE (8 searches)
            'accounting firms Dubai',
            'tax consultants Dubai', 
            'auditing firms Dubai',
            'bookkeeping services Dubai',
            'financial consultants Dubai',
            'VAT consultants Dubai',
            'chartered accountants Dubai',
            'audit firms Dubai',
            
            // BUSINESS SERVICES (8 searches)
            'business consultants Dubai',
            'management consultants Dubai',
            'business setup Dubai', 
            'company formation Dubai',
            'business development Dubai',
            'strategic consultants Dubai',
            'corporate services Dubai',
            'business advisors Dubai',
            
            // LEGAL SERVICES (6 searches)
            'law firms Dubai',
            'legal consultants Dubai',
            'corporate lawyers Dubai',
            'business lawyers Dubai',
            'legal advisors Dubai',
            'legal services Dubai',
            
            // MARKETING & DIGITAL (6 searches)
            'marketing agencies Dubai',
            'digital marketing Dubai',
            'advertising agencies Dubai',
            'branding agencies Dubai',
            'social media agencies Dubai',
            'web design Dubai',
            
            // TRADING & WHOLESALE (4 searches)
            'trading companies Dubai',
            'wholesale distributors Dubai',
            'import export Dubai',
            'suppliers Dubai',
            
            // IT & TECHNOLOGY (4 searches)
            'IT consultants Dubai',
            'software companies Dubai',
            'technology consultants Dubai',
            'IT services Dubai',
            
            // REAL ESTATE & PROPERTY (4 searches)
            'real estate consultants Dubai',
            'property consultants Dubai',
            'real estate agencies Dubai',
            'property management Dubai'
        ];
        
        // Geographic focus areas for better coverage
        this.locations = [
            'Deira Dubai',
            'Bur Dubai', 
            'Business Bay Dubai',
            'DIFC Dubai',
            'Jumeirah Dubai',
            'Al Rigga Dubai',
            'Downtown Dubai',
            'Sheikh Zayed Road Dubai'
        ];
    }

    async scrapeGoogleMaps(query, location = '') {
        console.log(`🔍 Searching: ${query} ${location}`);
        
        const browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        
        try {
            const page = await browser.newPage();
            await page.setViewportSize({ width: 1366, height: 768 });
            
            const searchQuery = location ? `${query} ${location}` : query;
            const encodedQuery = encodeURIComponent(searchQuery);
            
            await page.goto(`https://www.google.com/maps/search/${encodedQuery}`, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            await page.waitForTimeout(3000);
            
            // Get business listings
            const businesses = await page.evaluate(() => {
                const results = [];
                const listings = document.querySelectorAll('[role="article"]');
                
                listings.forEach((listing, index) => {
                    try {
                        if (index >= 5) return; // Limit per search to manage volume
                        
                        const nameEl = listing.querySelector('[role="button"] > div > div:nth-child(2) > div:first-child');
                        const ratingEl = listing.querySelector('span[role="img"][aria-label*="star"]');
                        const addressEl = listing.querySelector('[role="button"] > div > div:nth-child(2) > div:last-child');
                        
                        if (!nameEl) return;
                        
                        const name = nameEl.innerText?.trim();
                        if (!name || name === 'Directions' || name === 'Website') return;
                        
                        let rating = 0;
                        let reviewCount = 0;
                        
                        if (ratingEl) {
                            const ariaLabel = ratingEl.getAttribute('aria-label') || '';
                            const ratingMatch = ariaLabel.match(/(\d+\.?\d*)\s*star/);
                            const reviewMatch = ariaLabel.match(/(\d+)\s*review/);
                            
                            if (ratingMatch) rating = parseFloat(ratingMatch[1]);
                            if (reviewMatch) reviewCount = parseInt(reviewMatch[1]);
                        }
                        
                        const address = addressEl?.innerText?.trim() || '';
                        
                        results.push({
                            name: name,
                            rating: rating,
                            reviewCount: reviewCount,
                            address: address,
                            query: searchQuery
                        });
                        
                    } catch (error) {
                        console.log('Error processing listing:', error);
                    }
                });
                
                return results;
            });
            
            console.log(`✅ Found ${businesses.length} businesses for: ${searchQuery}`);
            return businesses;
            
        } catch (error) {
            console.error(`❌ Error searching ${query}:`, error.message);
            return [];
        } finally {
            await browser.close();
        }
    }

    async getBusinessDetails(business) {
        console.log(`🔍 Getting details for: ${business.name}`);
        
        // Skip if already processed
        const businessKey = `${business.name}_${business.address}`;
        if (this.processed.has(businessKey)) {
            console.log(`⏩ Skipping duplicate: ${business.name}`);
            return null;
        }
        this.processed.add(businessKey);
        
        const browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        try {
            const page = await browser.newPage();
            
            const searchQuery = `${business.name} ${business.address} Dubai`;
            const encodedQuery = encodeURIComponent(searchQuery);
            
            await page.goto(`https://www.google.com/maps/search/${encodedQuery}`, { 
                waitUntil: 'networkidle',
                timeout: 20000 
            });
            
            await page.waitForTimeout(2000);
            
            // Click on the first result if available
            try {
                await page.click('[role="article"]:first-child', { timeout: 5000 });
                await page.waitForTimeout(3000);
            } catch (e) {
                console.log(`⚠️ Could not click on business: ${business.name}`);
            }
            
            // Extract detailed information
            const details = await page.evaluate(() => {
                let phone = '';
                let website = '';
                
                // Try to find phone number
                const phoneSelectors = [
                    'button[data-item-id*="phone"]',
                    'button[aria-label*="phone"]',
                    'button[aria-label*="Call"]',
                    '[data-value*="+971"]'
                ];
                
                for (const selector of phoneSelectors) {
                    const phoneEl = document.querySelector(selector);
                    if (phoneEl) {
                        const phoneText = phoneEl.getAttribute('aria-label') || phoneEl.innerText || phoneEl.getAttribute('data-value') || '';
                        const phoneMatch = phoneText.match(/(\+971[\d\s\-\(\)]+)/);
                        if (phoneMatch) {
                            phone = phoneMatch[1].replace(/[\s\-\(\)]/g, '');
                            break;
                        }
                    }
                }
                
                // Try to find website
                const websiteSelectors = [
                    'a[data-item-id*="authority"]',
                    'a[aria-label*="Website"]',
                    'button[data-item-id*="authority"]'
                ];
                
                for (const selector of websiteSelectors) {
                    const websiteEl = document.querySelector(selector);
                    if (websiteEl) {
                        website = websiteEl.href || websiteEl.getAttribute('data-value') || '';
                        if (website && !website.includes('google.com')) break;
                    }
                }
                
                return { phone, website };
            });
            
            // Calculate quality score
            const qualityScore = this.calculateQualityScore({
                ...business,
                phone: details.phone,
                website: details.website
            });
            
            // Determine revenue potential based on industry and quality
            const revenuePotential = this.calculateRevenuePotential(business, qualityScore);
            
            const result = {
                name: business.name,
                phone: details.phone || 'N/A',
                website: details.website || 'N/A',
                address: business.address,
                rating: business.rating,
                reviewCount: business.reviewCount,
                industry: this.categorizeIndustry(business.query),
                qualityScore: qualityScore,
                revenuePotential: revenuePotential,
                searchQuery: business.query,
                contactMethod: details.phone ? 'Direct Phone' : (details.website !== 'N/A' ? 'Website' : 'Research Required'),
                priority: qualityScore > 70 ? 'URGENT' : qualityScore > 60 ? 'HIGH' : qualityScore > 50 ? 'MEDIUM' : 'LOW',
                servicesNeeded: this.suggestServices(business.query, details.website === 'N/A'),
                timestamp: new Date().toISOString()
            };
            
            console.log(`✅ Processed: ${business.name} (Quality: ${qualityScore}, Revenue: ${revenuePotential})`);
            return result;
            
        } catch (error) {
            console.error(`❌ Error getting details for ${business.name}:`, error.message);
            return null;
        } finally {
            await browser.close();
        }
    }

    calculateQualityScore(business) {
        let score = 0;
        
        // Rating contribution (0-30 points)
        if (business.rating > 4.5) score += 30;
        else if (business.rating > 4.0) score += 25;
        else if (business.rating > 3.5) score += 20;
        else if (business.rating > 3.0) score += 15;
        else if (business.rating > 0) score += 10;
        
        // Review count contribution (0-20 points)
        if (business.reviewCount > 100) score += 20;
        else if (business.reviewCount > 50) score += 15;
        else if (business.reviewCount > 20) score += 12;
        else if (business.reviewCount > 10) score += 8;
        else if (business.reviewCount > 5) score += 5;
        
        // Contact information (0-25 points)
        if (business.phone && business.phone !== 'N/A') score += 15;
        if (business.website && business.website !== 'N/A') score += 10;
        
        // Address specificity (0-15 points)
        if (business.address && business.address.length > 20) score += 15;
        else if (business.address && business.address.length > 10) score += 10;
        else if (business.address) score += 5;
        
        // Business name quality (0-10 points)
        if (business.name && business.name.length < 50 && !business.name.includes('...')) score += 10;
        else if (business.name) score += 5;
        
        return Math.min(score, 100);
    }

    calculateRevenuePotential(business, qualityScore) {
        const industry = this.categorizeIndustry(business.query);
        let baseRevenue = 15000; // Base potential
        
        // Industry multipliers
        const industryMultipliers = {
            'Legal Services': 2.0,
            'Accounting & Finance': 1.8,
            'Business Consulting': 1.6,
            'IT & Technology': 1.5,
            'Marketing & Digital': 1.4,
            'Real Estate': 1.3,
            'Trading & Wholesale': 1.2
        };
        
        const multiplier = industryMultipliers[industry] || 1.0;
        baseRevenue *= multiplier;
        
        // Quality score adjustment
        const qualityMultiplier = 1 + (qualityScore / 100);
        const finalRevenue = baseRevenue * qualityMultiplier;
        
        const minRevenue = Math.round(finalRevenue * 0.8);
        const maxRevenue = Math.round(finalRevenue * 1.3);
        
        return `$${minRevenue.toLocaleString()}-${maxRevenue.toLocaleString()}`;
    }

    categorizeIndustry(query) {
        const q = query.toLowerCase();
        if (q.includes('accounting') || q.includes('tax') || q.includes('audit') || q.includes('financial') || q.includes('vat')) {
            return 'Accounting & Finance';
        }
        if (q.includes('law') || q.includes('legal') || q.includes('lawyer')) {
            return 'Legal Services';
        }
        if (q.includes('business') || q.includes('management') || q.includes('strategic') || q.includes('consultant')) {
            return 'Business Consulting';
        }
        if (q.includes('marketing') || q.includes('digital') || q.includes('advertising') || q.includes('branding') || q.includes('web')) {
            return 'Marketing & Digital';
        }
        if (q.includes('trading') || q.includes('wholesale') || q.includes('import') || q.includes('supplier')) {
            return 'Trading & Wholesale';
        }
        if (q.includes('it ') || q.includes('software') || q.includes('technology')) {
            return 'IT & Technology';
        }
        if (q.includes('real estate') || q.includes('property')) {
            return 'Real Estate';
        }
        return 'General Business';
    }

    suggestServices(query, noWebsite = false) {
        const industry = this.categorizeIndustry(query);
        const services = {
            'Accounting & Finance': 'Accounting software, client portal, automated reporting, tax compliance system',
            'Legal Services': 'Case management system, client portal, document automation, billing system',
            'Business Consulting': 'CRM system, project management platform, client onboarding automation',
            'Marketing & Digital': 'Client management system, campaign tracking, performance dashboard',
            'Trading & Wholesale': 'Inventory management, B2B platform, supplier portal, e-commerce integration',
            'IT & Technology': 'Project management system, client portal, service automation platform',
            'Real Estate': 'Property management system, client CRM, document automation, virtual tours'
        };
        
        let baseServices = services[industry] || 'Custom business management system, client portal, workflow automation';
        
        if (noWebsite) {
            baseServices = `Complete digital transformation, website development, ${baseServices}`;
        }
        
        return baseServices;
    }

    async saveResults() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `massive-lead-generation-${timestamp}`;
        
        // Save JSON
        fs.writeFileSync(`results/${filename}.json`, JSON.stringify(this.results, null, 2));
        
        // Save CSV
        if (this.results.length > 0) {
            const csvHeader = 'Name,Phone,Website,Address,Industry,Rating,Reviews,Quality Score,Revenue Potential,Priority,Contact Method,Services Needed,Search Query\n';
            const csvRows = this.results.map(result => {
                return [
                    `"${result.name}"`,
                    `"${result.phone}"`,
                    `"${result.website}"`,
                    `"${result.address}"`,
                    `"${result.industry}"`,
                    result.rating,
                    result.reviewCount,
                    result.qualityScore,
                    `"${result.revenuePotential}"`,
                    result.priority,
                    `"${result.contactMethod}"`,
                    `"${result.servicesNeeded}"`,
                    `"${result.searchQuery}"`
                ].join(',');
            }).join('\n');
            
            fs.writeFileSync(`results/${filename}.csv`, csvHeader + csvRows);
        }
        
        console.log(`\n💾 Results saved to results/${filename}.json and results/${filename}.csv`);
        return filename;
    }

    async run() {
        console.log('🚀 MASSIVE DUBAI SME LEAD GENERATION STARTING');
        console.log(`🎯 Target: ${this.targetCount}+ high-quality leads`);
        console.log(`📊 Categories: ${this.searchCategories.length} search terms`);
        console.log(`🏙️ Locations: ${this.locations.length} Dubai areas\n`);
        
        try {
            let categoryIndex = 0;
            let locationIndex = 0;
            
            while (this.currentCount < this.targetCount && categoryIndex < this.searchCategories.length) {
                const category = this.searchCategories[categoryIndex];
                const location = this.locations[locationIndex];
                
                console.log(`\n📍 Progress: ${this.currentCount}/${this.targetCount} leads collected`);
                
                // Search for businesses
                const businesses = await this.scrapeGoogleMaps(category, location);
                
                // Process each business
                for (const business of businesses) {
                    if (this.currentCount >= this.targetCount) break;
                    
                    const result = await this.getBusinessDetails(business);
                    if (result && result.qualityScore >= 40) { // Minimum quality threshold
                        this.results.push(result);
                        this.currentCount++;
                        
                        console.log(`✅ Lead #${this.currentCount}: ${result.name} (${result.qualityScore} quality)`);
                        
                        // Brief pause between extractions
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                
                // Move to next location/category
                locationIndex++;
                if (locationIndex >= this.locations.length) {
                    locationIndex = 0;
                    categoryIndex++;
                }
                
                // Pause between searches
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // Save results
            const filename = await this.saveResults();
            
            console.log('\n🎉 MASSIVE LEAD GENERATION COMPLETE!');
            console.log(`📊 Total Leads Generated: ${this.results.length}`);
            console.log(`📞 Direct Phone Contacts: ${this.results.filter(r => r.phone !== 'N/A').length}`);
            console.log(`🌐 Website Contacts: ${this.results.filter(r => r.website !== 'N/A').length}`);
            console.log(`⭐ Average Quality Score: ${Math.round(this.results.reduce((sum, r) => sum + r.qualityScore, 0) / this.results.length)}`);
            console.log(`💰 Total Revenue Potential: $${this.calculateTotalRevenue()}`);
            console.log(`📁 Files saved: ${filename}.json & ${filename}.csv`);
            
            return this.results;
            
        } catch (error) {
            console.error('❌ Error in massive lead generation:', error);
            if (this.results.length > 0) {
                await this.saveResults();
                console.log(`💾 Partial results saved: ${this.results.length} leads`);
            }
            throw error;
        }
    }

    calculateTotalRevenue() {
        return this.results.reduce((total, result) => {
            // Extract max revenue from string like "$15,000-25,000"
            const match = result.revenuePotential.match(/\$[\d,]+-(\d{1,3}(?:,\d{3})*)/);
            if (match) {
                const maxRevenue = parseInt(match[1].replace(/,/g, ''));
                return total + maxRevenue;
            }
            return total;
        }, 0).toLocaleString();
    }
}

// Run the massive lead generation
async function main() {
    const generator = new MassiveLeadGenerator();
    try {
        await generator.run();
        console.log('\n🚀 SUCCESS: 30+ Dubai SME leads ready for sales outreach!');
    } catch (error) {
        console.error('❌ Generation failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = MassiveLeadGenerator;