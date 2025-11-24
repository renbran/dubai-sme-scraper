const { chromium } = require('playwright');
const fs = require('fs');

// Series 3: Real Estate & Construction Services
class Series3RealEstateConstruction {
    constructor() {
        this.results = [];
        this.processed = new Set();
        
        this.searchQueries = [
            'real estate consultants Dubai',
            'property consultants Dubai',
            'construction companies Dubai',
            'architects Dubai',
            'interior design Dubai',
            'facilities management Dubai',
            'property management Dubai',
            'real estate agencies Dubai',
            'building contractors Dubai',
            'engineering consultants Dubai'
        ];
    }

    async scrapeBusinesses(query) {
        console.log(`🔍 Searching: ${query}`);
        
        const browser = await chromium.launch({ headless: true });
        try {
            const page = await browser.newPage();
            await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, { 
                waitUntil: 'networkidle' 
            });
            
            await page.waitForTimeout(3000);
            
            const businesses = await page.evaluate(() => {
                const results = [];
                const listings = document.querySelectorAll('[role="article"]');
                
                for (let i = 0; i < Math.min(listings.length, 4); i++) {
                    const listing = listings[i];
                    try {
                        const nameEl = listing.querySelector('[role="button"] > div > div:nth-child(2) > div:first-child');
                        if (!nameEl) continue;
                        
                        const name = nameEl.innerText?.trim();
                        if (!name || name === 'Directions' || name === 'Website') continue;
                        
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
                            name,
                            rating,
                            reviewCount,
                            address,
                            query
                        });
                        
                    } catch (error) {
                        console.log('Error processing listing:', error);
                    }
                }
                
                return results;
            });
            
            console.log(`✅ Found ${businesses.length} businesses for: ${query}`);
            return businesses;
            
        } catch (error) {
            console.error(`❌ Error searching ${query}:`, error.message);
            return [];
        } finally {
            await browser.close();
        }
    }

    async getContactDetails(business) {
        console.log(`🔍 Getting details for: ${business.name}`);
        
        const businessKey = `${business.name}_${business.address}`;
        if (this.processed.has(businessKey)) {
            return null;
        }
        this.processed.add(businessKey);
        
        const browser = await chromium.launch({ headless: true });
        try {
            const page = await browser.newPage();
            
            const searchQuery = `${business.name} ${business.address} Dubai`;
            await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`, { 
                waitUntil: 'networkidle' 
            });
            
            await page.waitForTimeout(2000);
            
            try {
                await page.click('[role="article"]:first-child', { timeout: 5000 });
                await page.waitForTimeout(3000);
            } catch (e) {
                // Continue without clicking
            }
            
            const contactInfo = await page.evaluate(() => {
                let phone = '';
                let website = '';
                
                // Phone extraction
                const phoneElements = document.querySelectorAll('button[data-item-id*="phone"], button[aria-label*="Call"], [data-value*="+971"]');
                for (const el of phoneElements) {
                    const text = el.getAttribute('aria-label') || el.innerText || el.getAttribute('data-value') || '';
                    const phoneMatch = text.match(/(\+971[\d\s\-\(\)]+)/);
                    if (phoneMatch) {
                        phone = phoneMatch[1].replace(/[\s\-\(\)]/g, '');
                        break;
                    }
                }
                
                // Website extraction
                const websiteElements = document.querySelectorAll('a[data-item-id*="authority"], a[aria-label*="Website"]');
                for (const el of websiteElements) {
                    const url = el.href || el.getAttribute('data-value') || '';
                    if (url && !url.includes('google.com') && url.startsWith('http')) {
                        website = url;
                        break;
                    }
                }
                
                return { phone, website };
            });
            
            // Quality scoring
            let qualityScore = 0;
            if (business.rating >= 4.5) qualityScore += 25;
            else if (business.rating >= 4.0) qualityScore += 20;
            else if (business.rating >= 3.5) qualityScore += 15;
            
            if (business.reviewCount > 50) qualityScore += 20;
            else if (business.reviewCount > 20) qualityScore += 15;
            else if (business.reviewCount > 10) qualityScore += 10;
            
            if (contactInfo.phone) qualityScore += 20;
            if (contactInfo.website) qualityScore += 10;
            if (business.address && business.address.length > 20) qualityScore += 15;
            if (business.name && business.name.length < 50) qualityScore += 10;
            
            // Industry classification
            const q = business.query.toLowerCase();
            let industry = '';
            let baseRevenue = 25000;
            
            if (q.includes('real estate') || q.includes('property')) {
                industry = 'Real Estate Services';
                baseRevenue = 30000;
            } else if (q.includes('construction') || q.includes('contractor') || q.includes('building')) {
                industry = 'Construction Services';
                baseRevenue = 35000;
            } else if (q.includes('architect') || q.includes('interior') || q.includes('design')) {
                industry = 'Design & Architecture';
                baseRevenue = 28000;
            } else if (q.includes('engineering') || q.includes('facilities')) {
                industry = 'Engineering & Facilities';
                baseRevenue = 32000;
            } else {
                industry = 'Property Services';
            }
            
            const revenueMultiplier = 1 + (qualityScore / 200);
            const estimatedRevenue = baseRevenue * revenueMultiplier;
            const minRevenue = Math.round(estimatedRevenue * 0.7);
            const maxRevenue = Math.round(estimatedRevenue * 1.3);
            
            const priority = qualityScore >= 70 ? 'URGENT' : qualityScore >= 60 ? 'HIGH' : qualityScore >= 50 ? 'MEDIUM' : 'LOW';
            
            const result = {
                name: business.name,
                phone: contactInfo.phone || 'N/A',
                website: contactInfo.website || 'N/A',
                address: business.address,
                industry: industry,
                rating: business.rating,
                reviewCount: business.reviewCount,
                qualityScore: qualityScore,
                revenuePotential: `$${minRevenue.toLocaleString()}-${maxRevenue.toLocaleString()}`,
                priority: priority,
                contactMethod: contactInfo.phone ? 'Direct Phone' : (contactInfo.website !== 'N/A' ? 'Website Form' : 'Research Required'),
                servicesNeeded: this.getServices(industry, contactInfo.website === 'N/A'),
                searchQuery: business.query,
                leadSource: 'Series 3 - Real Estate & Construction',
                timestamp: new Date().toISOString()
            };
            
            console.log(`✅ ${business.name}: Quality ${qualityScore}, ${priority} priority`);
            return result;
            
        } catch (error) {
            console.error(`❌ Error getting details for ${business.name}:`, error.message);
            return null;
        } finally {
            await browser.close();
        }
    }

    getServices(industry, noWebsite) {
        const services = {
            'Real Estate Services': 'Property management system, client CRM, listing automation, virtual tour platform',
            'Construction Services': 'Project management system, client portal, progress tracking, document management',
            'Design & Architecture': 'Design portfolio platform, client collaboration tools, project visualization',
            'Engineering & Facilities': 'Technical project management, client portal, documentation system',
            'Property Services': 'Property management system, client portal, maintenance tracking'
        };
        
        let baseServices = services[industry] || 'Project management system, client portal';
        
        if (noWebsite) {
            baseServices = `Professional website with portfolio showcase, complete digital presence, ${baseServices}`;
        }
        
        return baseServices;
    }

    async saveResults() {
        if (this.results.length === 0) return null;
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `series3-realestate-construction-${timestamp}`;
        
        // Save JSON
        fs.writeFileSync(`results/${filename}.json`, JSON.stringify(this.results, null, 2));
        
        // Save CSV
        const csvHeaders = [
            'Company Name', 'Phone', 'Website', 'Address', 'Industry', 'Rating', 
            'Review Count', 'Quality Score', 'Revenue Potential', 'Priority', 
            'Contact Method', 'Services Needed', 'Search Query'
        ];
        
        const csvRows = this.results.map(r => [
            `"${r.name}"`, `"${r.phone}"`, `"${r.website}"`, `"${r.address}"`,
            `"${r.industry}"`, r.rating, r.reviewCount, r.qualityScore,
            `"${r.revenuePotential}"`, r.priority, `"${r.contactMethod}"`,
            `"${r.servicesNeeded}"`, `"${r.searchQuery}"`
        ].join(','));
        
        const csvContent = csvHeaders.join(',') + '\n' + csvRows.join('\n');
        fs.writeFileSync(`results/${filename}.csv`, csvContent);
        
        console.log(`💾 Series 3 results saved: ${filename}.json & ${filename}.csv`);
        return filename;
    }

    async run() {
        console.log('🚀 SERIES 3: REAL ESTATE & CONSTRUCTION LEAD GENERATION');
        console.log(`🎯 Target: 10+ leads from real estate & construction`);
        console.log(`📊 Queries: ${this.searchQueries.length}\n`);
        
        try {
            for (const query of this.searchQueries) {
                console.log(`\n📊 Progress: ${this.results.filter(r => r.qualityScore >= 45).length} qualified leads collected`);
                
                const businesses = await this.scrapeBusinesses(query);
                
                for (const business of businesses) {
                    const result = await this.getContactDetails(business);
                    if (result && result.qualityScore >= 45) {
                        this.results.push(result);
                        console.log(`✅ Lead: ${result.name} (${result.priority})`);
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
                
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
            
            await this.saveResults();
            
            console.log('\n🎉 SERIES 3 COMPLETE!');
            console.log(`📊 Total Leads: ${this.results.length}`);
            console.log(`📞 Phone Contacts: ${this.results.filter(r => r.phone !== 'N/A').length}`);
            console.log(`🚨 URGENT: ${this.results.filter(r => r.priority === 'URGENT').length}`);
            console.log(`⚡ HIGH: ${this.results.filter(r => r.priority === 'HIGH').length}`);
            
            return this.results;
            
        } catch (error) {
            console.error('❌ Series 3 failed:', error);
            if (this.results.length > 0) {
                await this.saveResults();
            }
            throw error;
        }
    }
}

// Execute Series 3
async function main() {
    const scraper = new Series3RealEstateConstruction();
    try {
        await scraper.run();
        console.log('\n🚀 Series 3 SUCCESS: Real Estate & Construction leads ready!');
    } catch (error) {
        console.error('❌ Series 3 failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = Series3RealEstateConstruction;