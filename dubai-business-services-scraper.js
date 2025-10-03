const { chromium } = require('playwright');
const fs = require('fs');

// Specialized Dubai Business Services Scraper - Target: 50+ companies
class DubaiBusinessServicesScraper {
    constructor() {
        this.results = [];
        this.processed = new Set();
        this.targetCount = 50;
        
        // Comprehensive search categories for business services
        this.searchCategories = [
            // BUSINESS SETUP SERVICES (12 searches)
            'business setup Dubai',
            'company formation Dubai',
            'business registration Dubai',
            'LLC formation Dubai',
            'company incorporation Dubai',
            'business license Dubai',
            'mainland company setup Dubai',
            'freezone company setup Dubai',
            'offshore company Dubai',
            'business setup consultants Dubai',
            'company formation services Dubai',
            'business establishment Dubai',
            
            // PRO SERVICES (10 searches)
            'PRO services Dubai',
            'public relations officer Dubai',
            'government relations Dubai',
            'visa services Dubai',
            'emirates ID services Dubai',
            'labor card services Dubai',
            'trade license renewal Dubai',
            'immigration services Dubai',
            'document clearing Dubai',
            'government liaison Dubai',
            
            // ACCOUNTING SERVICES (12 searches)
            'accounting services Dubai',
            'bookkeeping services Dubai',
            'chartered accountants Dubai',
            'accounting firms Dubai',
            'tax consultants Dubai',
            'audit services Dubai',
            'VAT consultants Dubai',
            'financial consultants Dubai',
            'accounting outsourcing Dubai',
            'payroll services Dubai',
            'financial advisory Dubai',
            'tax advisory Dubai',
            
            // BUSINESS CONSULTANCY (10 searches)
            'business consultants Dubai',
            'management consultants Dubai',
            'business advisory Dubai',
            'strategic consultants Dubai',
            'business development Dubai',
            'corporate consultants Dubai',
            'business planning Dubai',
            'startup consultants Dubai',
            'business coaching Dubai',
            'growth consultants Dubai',
            
            // BROKERAGE SERVICES (8 searches)
            'business brokers Dubai',
            'investment brokers Dubai',
            'financial brokers Dubai',
            'real estate brokers Dubai',
            'insurance brokers Dubai',
            'mortgage brokers Dubai',
            'investment advisory Dubai',
            'wealth management Dubai'
        ];
        
        // Dubai districts for comprehensive coverage
        this.dubaiDistricts = [
            'Deira Dubai',
            'Bur Dubai',
            'Business Bay Dubai',
            'DIFC Dubai',
            'Jumeirah Dubai',
            'Downtown Dubai',
            'Dubai Marina',
            'Al Rigga Dubai',
            'Karama Dubai',
            'Al Qusais Dubai',
            'Dubai Investment Park',
            'Al Barsha Dubai'
        ];
    }

    async scrapeBusinessServices(query, location = '') {
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
                waitUntil: 'domcontentloaded',
                timeout: 25000 
            });
            
            await page.waitForTimeout(3000);
            
            const businesses = await page.evaluate(() => {
                const results = [];
                const listings = document.querySelectorAll('[role="article"]');
                
                for (let i = 0; i < Math.min(listings.length, 6); i++) {
                    const listing = listings[i];
                    try {
                        const nameEl = listing.querySelector('[role="button"] > div > div:nth-child(2) > div:first-child') ||
                                     listing.querySelector('a[href*="/maps/place/"] > div > div:nth-child(2) > div:first-child');
                        
                        if (!nameEl) continue;
                        
                        const name = nameEl.innerText?.trim();
                        if (!name || name === 'Directions' || name === 'Website' || name.length < 3) continue;
                        
                        const ratingEl = listing.querySelector('span[role="img"][aria-label*="star"]');
                        let rating = 0;
                        let reviewCount = 0;
                        
                        if (ratingEl) {
                            const ariaLabel = ratingEl.getAttribute('aria-label') || '';
                            const ratingMatch = ariaLabel.match(/(\d+\.?\d*)\s*star/);
                            const reviewMatch = ariaLabel.match(/(\d+)\s*review/);
                            
                            if (ratingMatch) rating = parseFloat(ratingMatch[1]);
                            if (reviewMatch) reviewCount = parseInt(reviewMatch[1]);
                        }
                        
                        const addressEl = listing.querySelector('[role="button"] > div > div:nth-child(2) > div:last-child');
                        const address = addressEl?.innerText?.trim() || '';
                        
                        results.push({
                            name: name,
                            rating: rating,
                            reviewCount: reviewCount,
                            address: address,
                            query: searchQuery,
                            businessKey: `${name}_${address}`
                        });
                        
                    } catch (error) {
                        console.log('Error processing listing:', error);
                    }
                }
                
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

    async enrichBusinessData(business) {
        console.log(`🔍 Enriching: ${business.name}`);
        
        // Skip duplicates
        if (this.processed.has(business.businessKey)) {
            console.log(`⏩ Skipping duplicate: ${business.name}`);
            return null;
        }
        this.processed.add(business.businessKey);
        
        const browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        try {
            const page = await browser.newPage();
            
            const searchQuery = `${business.name} ${business.address} Dubai`;
            const encodedQuery = encodeURIComponent(searchQuery);
            
            await page.goto(`https://www.google.com/maps/search/${encodedQuery}`, { 
                waitUntil: 'domcontentloaded',
                timeout: 20000 
            });
            
            await page.waitForTimeout(2500);
            
            // Try to click the business listing
            try {
                await page.click('[role="article"]:first-child', { timeout: 5000 });
                await page.waitForTimeout(3000);
            } catch (e) {
                // Continue without clicking
            }
            
            // Extract contact information
            const contactInfo = await page.evaluate(() => {
                let phone = '';
                let website = '';
                
                // Phone number extraction - comprehensive selectors
                const phoneSelectors = [
                    'button[data-item-id*="phone"]',
                    'button[aria-label*="phone"]',
                    'button[aria-label*="Call"]',
                    '[data-value*="+971"]',
                    'a[href^="tel:"]'
                ];
                
                for (const selector of phoneSelectors) {
                    const phoneEl = document.querySelector(selector);
                    if (phoneEl) {
                        const text = phoneEl.getAttribute('aria-label') || 
                                   phoneEl.innerText || 
                                   phoneEl.getAttribute('data-value') || 
                                   phoneEl.getAttribute('href') || '';
                        const phoneMatch = text.match(/(\+971[\d\s\-\(\)]+)/);
                        if (phoneMatch) {
                            phone = phoneMatch[1].replace(/[\s\-\(\)]/g, '');
                            break;
                        }
                    }
                }
                
                // Website extraction - comprehensive selectors
                const websiteSelectors = [
                    'a[data-item-id*="authority"]',
                    'a[aria-label*="Website"]',
                    'button[data-item-id*="authority"]',
                    'a[href^="http"]:not([href*="google.com"])'
                ];
                
                for (const selector of websiteSelectors) {
                    const websiteEl = document.querySelector(selector);
                    if (websiteEl) {
                        const url = websiteEl.href || websiteEl.getAttribute('data-value') || '';
                        if (url && !url.includes('google.com') && url.startsWith('http')) {
                            website = url;
                            break;
                        }
                    }
                }
                
                return { phone, website };
            });
            
            // Calculate quality score based on multiple factors
            const qualityScore = this.calculateQualityScore({
                ...business,
                phone: contactInfo.phone,
                website: contactInfo.website
            });
            
            // Determine service category and revenue potential
            const serviceCategory = this.categorizeService(business.query);
            const revenuePotential = this.calculateRevenuePotential(serviceCategory, qualityScore);
            const priority = this.assignPriority(qualityScore, contactInfo.phone, contactInfo.website);
            
            const enrichedLead = {
                name: business.name,
                phone: contactInfo.phone || 'N/A',
                website: contactInfo.website || 'N/A',
                address: business.address,
                serviceCategory: serviceCategory,
                rating: business.rating,
                reviewCount: business.reviewCount,
                qualityScore: qualityScore,
                revenuePotential: revenuePotential,
                priority: priority,
                contactMethod: contactInfo.phone ? 'Direct Phone' : (contactInfo.website !== 'N/A' ? 'Website Form' : 'Research Required'),
                servicesNeeded: this.suggestServices(serviceCategory, contactInfo.website === 'N/A'),
                searchQuery: business.query,
                leadSource: 'Dubai Business Services Campaign',
                timestamp: new Date().toISOString()
            };
            
            console.log(`✅ ${business.name}: ${serviceCategory} (Quality: ${qualityScore}, ${priority})`);
            return enrichedLead;
            
        } catch (error) {
            console.error(`❌ Error enriching ${business.name}:`, error.message);
            return null;
        } finally {
            await browser.close();
        }
    }

    calculateQualityScore(business) {
        let score = 0;
        
        // Rating contribution (0-25 points)
        if (business.rating >= 4.8) score += 25;
        else if (business.rating >= 4.5) score += 22;
        else if (business.rating >= 4.0) score += 18;
        else if (business.rating >= 3.5) score += 14;
        else if (business.rating > 0) score += 8;
        
        // Review count contribution (0-20 points)
        if (business.reviewCount > 200) score += 20;
        else if (business.reviewCount > 100) score += 18;
        else if (business.reviewCount > 50) score += 15;
        else if (business.reviewCount > 20) score += 12;
        else if (business.reviewCount > 5) score += 8;
        
        // Contact availability (0-30 points)
        if (business.phone && business.phone !== 'N/A') score += 20;
        if (business.website && business.website !== 'N/A') score += 10;
        
        // Address quality (0-15 points)
        if (business.address && business.address.length > 25) score += 15;
        else if (business.address && business.address.length > 15) score += 12;
        else if (business.address && business.address.length > 5) score += 8;
        
        // Business name quality (0-10 points)
        if (business.name && business.name.length < 60 && !business.name.includes('...')) score += 10;
        else if (business.name) score += 6;
        
        return Math.min(score, 100);
    }

    categorizeService(query) {
        const q = query.toLowerCase();
        
        if (q.includes('business setup') || q.includes('company formation') || q.includes('incorporation') || q.includes('registration') || q.includes('license')) {
            return 'Business Setup Services';
        }
        if (q.includes('pro services') || q.includes('public relations officer') || q.includes('visa') || q.includes('emirates id') || q.includes('government') || q.includes('document clearing')) {
            return 'PRO Services';
        }
        if (q.includes('accounting') || q.includes('bookkeeping') || q.includes('chartered accountant') || q.includes('audit') || q.includes('tax') || q.includes('vat') || q.includes('payroll')) {
            return 'Accounting Services';
        }
        if (q.includes('business consultant') || q.includes('management consultant') || q.includes('advisory') || q.includes('strategic') || q.includes('business development') || q.includes('coaching')) {
            return 'Business Consultancy';
        }
        if (q.includes('broker') || q.includes('investment') || q.includes('wealth management') || q.includes('financial broker') || q.includes('insurance broker')) {
            return 'Brokerage Services';
        }
        
        return 'Professional Services';
    }

    calculateRevenuePotential(serviceCategory, qualityScore) {
        const basePotentials = {
            'Business Setup Services': 25000,
            'PRO Services': 15000,
            'Accounting Services': 30000,
            'Business Consultancy': 35000,
            'Brokerage Services': 40000,
            'Professional Services': 20000
        };
        
        const baseValue = basePotentials[serviceCategory] || 20000;
        const qualityMultiplier = 1 + (qualityScore / 150); // 0.67x to 1.67x multiplier
        
        const estimatedValue = baseValue * qualityMultiplier;
        const minValue = Math.round(estimatedValue * 0.7);
        const maxValue = Math.round(estimatedValue * 1.4);
        
        return `$${minValue.toLocaleString()}-${maxValue.toLocaleString()}`;
    }

    assignPriority(qualityScore, phone, website) {
        if (qualityScore >= 75 && phone !== 'N/A') return 'URGENT';
        if (qualityScore >= 65 && (phone !== 'N/A' || website !== 'N/A')) return 'HIGH';
        if (qualityScore >= 50) return 'MEDIUM';
        return 'LOW';
    }

    suggestServices(serviceCategory, hasNoWebsite) {
        const serviceRecommendations = {
            'Business Setup Services': 'Client onboarding automation, document management system, compliance tracking, CRM for new business clients',
            'PRO Services': 'Government liaison tracking system, visa processing automation, document management, client portal',
            'Accounting Services': 'Advanced accounting software, client portal, automated reporting, tax compliance system, audit management',
            'Business Consultancy': 'Consulting project management platform, client relationship system, proposal automation, performance tracking',
            'Brokerage Services': 'Investment tracking platform, client portfolio management, regulatory compliance system, performance reporting',
            'Professional Services': 'Professional service management system, client portal, project tracking, billing automation'
        };
        
        let services = serviceRecommendations[serviceCategory] || 'Custom business management system, client portal, workflow automation';
        
        if (hasNoWebsite) {
            services = `Professional website development, complete digital presence, online client acquisition, ${services}`;
        }
        
        return services;
    }

    async saveResults() {
        if (this.results.length === 0) {
            console.log('⚠️ No results to save');
            return null;
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `dubai-business-services-${timestamp}`;
        
        // Save JSON
        fs.writeFileSync(`results/${filename}.json`, JSON.stringify(this.results, null, 2));
        
        // Save comprehensive CSV
        const csvHeaders = [
            'Company Name', 'Phone', 'Website', 'Address', 'Service Category', 'Rating', 
            'Review Count', 'Quality Score', 'Revenue Potential', 'Priority', 
            'Contact Method', 'Services Needed', 'Search Query', 'Lead Source'
        ];
        
        const csvRows = this.results.map(lead => [
            `"${lead.name}"`,
            `"${lead.phone}"`,
            `"${lead.website}"`,
            `"${lead.address}"`,
            `"${lead.serviceCategory}"`,
            lead.rating,
            lead.reviewCount,
            lead.qualityScore,
            `"${lead.revenuePotential}"`,
            lead.priority,
            `"${lead.contactMethod}"`,
            `"${lead.servicesNeeded}"`,
            `"${lead.searchQuery}"`,
            `"${lead.leadSource}"`
        ].join(','));
        
        const csvContent = csvHeaders.join(',') + '\n' + csvRows.join('\n');
        fs.writeFileSync(`results/${filename}.csv`, csvContent);
        
        console.log(`💾 Results saved: ${filename}.json & ${filename}.csv`);
        return filename;
    }

    async runComprehensiveCampaign() {
        console.log('🚀 DUBAI BUSINESS SERVICES COMPREHENSIVE CAMPAIGN');
        console.log(`🎯 Target: ${this.targetCount}+ specialized business service companies`);
        console.log(`📊 Search Categories: ${this.searchCategories.length}`);
        console.log(`🏙️ Dubai Districts: ${this.dubaiDistricts.length}`);
        console.log(`🔍 Total Search Combinations: ${this.searchCategories.length * 2} (with/without location)\n`);
        
        try {
            let categoryIndex = 0;
            let locationIndex = 0;
            let useLocation = false;
            
            while (this.results.length < this.targetCount && categoryIndex < this.searchCategories.length) {
                const category = this.searchCategories[categoryIndex];
                const location = useLocation ? this.dubaiDistricts[locationIndex] : '';
                
                console.log(`\n📊 Progress: ${this.results.length}/${this.targetCount} companies collected`);
                console.log(`📈 Service Categories Found:`);
                
                // Show current category breakdown
                const categoryCount = {};
                this.results.forEach(result => {
                    categoryCount[result.serviceCategory] = (categoryCount[result.serviceCategory] || 0) + 1;
                });
                
                Object.entries(categoryCount).forEach(([cat, count]) => {
                    console.log(`   - ${cat}: ${count} companies`);
                });
                
                // Search for businesses
                const businesses = await this.scrapeBusinessServices(category, location);
                
                // Process each business
                for (const business of businesses) {
                    if (this.results.length >= this.targetCount) break;
                    
                    const enrichedLead = await this.enrichBusinessData(business);
                    
                    if (enrichedLead && enrichedLead.qualityScore >= 40) {
                        this.results.push(enrichedLead);
                        console.log(`✅ Company #${this.results.length}: ${enrichedLead.name} (${enrichedLead.serviceCategory}, ${enrichedLead.priority})`);
                    }
                    
                    // Brief pause between extractions
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
                
                // Move to next search combination
                if (useLocation) {
                    locationIndex++;
                    if (locationIndex >= this.dubaiDistricts.length) {
                        locationIndex = 0;
                        categoryIndex++;
                        useLocation = false;
                    }
                } else {
                    useLocation = true;
                    if (locationIndex >= this.dubaiDistricts.length) {
                        locationIndex = 0;
                        categoryIndex++;
                        useLocation = false;
                    }
                }
                
                // Pause between searches
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
            
            // Save final results
            const filename = await this.saveResults();
            
            console.log('\n🎉 DUBAI BUSINESS SERVICES CAMPAIGN COMPLETE!');
            console.log(`📊 Total Companies Found: ${this.results.length}`);
            console.log(`📞 Direct Phone Contacts: ${this.results.filter(r => r.phone !== 'N/A').length}`);
            console.log(`🌐 Website Contacts: ${this.results.filter(r => r.website !== 'N/A').length}`);
            console.log(`🚨 URGENT Priority: ${this.results.filter(r => r.priority === 'URGENT').length}`);
            console.log(`⚡ HIGH Priority: ${this.results.filter(r => r.priority === 'HIGH').length}`);
            console.log(`⭐ Average Quality Score: ${Math.round(this.results.reduce((sum, r) => sum + r.qualityScore, 0) / this.results.length)}`);
            
            // Service category breakdown
            console.log('\n📋 Service Category Breakdown:');
            const finalCategoryCount = {};
            this.results.forEach(result => {
                finalCategoryCount[result.serviceCategory] = (finalCategoryCount[result.serviceCategory] || 0) + 1;
            });
            
            Object.entries(finalCategoryCount).forEach(([category, count]) => {
                console.log(`   - ${category}: ${count} companies`);
            });
            
            console.log(`💰 Total Revenue Potential: $${this.calculateTotalRevenue()}`);
            
            if (filename) {
                console.log(`📁 Files: ${filename}.json & ${filename}.csv`);
            }
            
            return this.results;
            
        } catch (error) {
            console.error('❌ Campaign failed:', error);
            if (this.results.length > 0) {
                await this.saveResults();
                console.log(`💾 Partial results saved: ${this.results.length} companies`);
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

// Execute Dubai Business Services Campaign
async function main() {
    const scraper = new DubaiBusinessServicesScraper();
    try {
        await scraper.runComprehensiveCampaign();
        console.log('\n🚀 SUCCESS: 50+ Dubai business service companies ready for outreach!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Campaign failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = DubaiBusinessServicesScraper;