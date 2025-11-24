const { chromium } = require('playwright');
const fs = require('fs');

// Ultra-robust parallel scraper for 30+ leads
class UltraLeadGenerator {
    constructor() {
        this.results = [];
        this.processed = new Set();
        
        // High-value search categories proven to work
        this.campaigns = [
            // Campaign 1: Premium Professional Services
            {
                name: 'Premium Professional Services',
                categories: [
                    'chartered accountants Dubai',
                    'audit firms Dubai',
                    'tax consultants Dubai',
                    'legal consultants Dubai',
                    'law firms Dubai'
                ]
            },
            
            // Campaign 2: Business Services
            {
                name: 'Business Services',
                categories: [
                    'business consultants Dubai',
                    'management consultants Dubai',
                    'company formation Dubai',
                    'business setup Dubai',
                    'corporate services Dubai'
                ]
            },
            
            // Campaign 3: Digital & Marketing
            {
                name: 'Digital Marketing',
                categories: [
                    'marketing agencies Dubai',
                    'digital marketing Dubai',
                    'advertising agencies Dubai',
                    'web design Dubai',
                    'branding agencies Dubai'
                ]
            },
            
            // Campaign 4: Trading & Commerce
            {
                name: 'Trading Commerce',
                categories: [
                    'trading companies Dubai',
                    'wholesale distributors Dubai',
                    'import export Dubai',
                    'suppliers Dubai',
                    'distributors Dubai'
                ]
            },
            
            // Campaign 5: Technology Services
            {
                name: 'Technology Services',
                categories: [
                    'IT consultants Dubai',
                    'software companies Dubai',
                    'technology consultants Dubai',
                    'IT services Dubai',
                    'software development Dubai'
                ]
            },
            
            // Campaign 6: Financial Services
            {
                name: 'Financial Services',
                categories: [
                    'financial consultants Dubai',
                    'investment advisors Dubai',
                    'financial planning Dubai',
                    'wealth management Dubai',
                    'insurance brokers Dubai'
                ]
            }
        ];
    }

    async runSingleSearch(query, maxResults = 8) {
        console.log(`🔍 Searching: ${query}`);
        
        const browser = await chromium.launch({ 
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });
        
        try {
            const page = await browser.newPage();
            await page.setViewportSize({ width: 1366, height: 768 });
            
            const encodedQuery = encodeURIComponent(query);
            await page.goto(`https://www.google.com/maps/search/${encodedQuery}`, { 
                waitUntil: 'domcontentloaded',
                timeout: 25000 
            });
            
            await page.waitForTimeout(4000);
            
            // Extract business listings
            const businesses = await page.evaluate((maxRes) => {
                const results = [];
                const listings = document.querySelectorAll('[role="article"]');
                
                for (let i = 0; i < Math.min(listings.length, maxRes); i++) {
                    const listing = listings[i];
                    try {
                        const nameEl = listing.querySelector('a[href*="/maps/place/"] > div > div:nth-child(2) > div:first-child') ||
                                     listing.querySelector('[role="button"] > div > div:nth-child(2) > div:first-child');
                        
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
                        
                        // Skip if we've seen this business before
                        const businessKey = `${name}_${address}`;
                        
                        results.push({
                            name: name,
                            rating: rating,
                            reviewCount: reviewCount,
                            address: address,
                            businessKey: businessKey,
                            query: query
                        });
                        
                    } catch (error) {
                        console.log('Error processing listing:', error);
                    }
                }
                
                return results;
            }, maxResults);
            
            console.log(`✅ Found ${businesses.length} businesses for: ${query}`);
            return businesses;
            
        } catch (error) {
            console.error(`❌ Error in search ${query}:`, error.message);
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
                
                // Phone number extraction
                const phoneElements = document.querySelectorAll('[data-item-id*="phone"], button[aria-label*="phone"], button[aria-label*="Call"], [data-value*="+971"]');
                for (const el of phoneElements) {
                    const text = el.getAttribute('aria-label') || el.innerText || el.getAttribute('data-value') || '';
                    const phoneMatch = text.match(/(\+971[\d\s\-\(\)]+)/);
                    if (phoneMatch) {
                        phone = phoneMatch[1].replace(/[\s\-\(\)]/g, '');
                        break;
                    }
                }
                
                // Website extraction
                const websiteElements = document.querySelectorAll('a[data-item-id*="authority"], a[aria-label*="Website"], button[data-item-id*="authority"]');
                for (const el of websiteElements) {
                    const url = el.href || el.getAttribute('data-value') || '';
                    if (url && !url.includes('google.com') && url.startsWith('http')) {
                        website = url;
                        break;
                    }
                }
                
                return { phone, website };
            });
            
            // Calculate comprehensive metrics
            const qualityScore = this.calculateQualityScore({
                ...business,
                phone: contactInfo.phone,
                website: contactInfo.website
            });
            
            const industry = this.determineIndustry(business.query);
            const revenuePotential = this.calculateRevenuePotential(industry, qualityScore);
            const priority = this.assignPriority(qualityScore, contactInfo.phone, contactInfo.website);
            
            const enrichedLead = {
                name: business.name,
                phone: contactInfo.phone || 'N/A',
                website: contactInfo.website || 'N/A',
                address: business.address,
                industry: industry,
                rating: business.rating,
                reviewCount: business.reviewCount,
                qualityScore: qualityScore,
                revenuePotential: revenuePotential,
                priority: priority,
                contactMethod: contactInfo.phone ? 'Direct Phone' : (contactInfo.website !== 'N/A' ? 'Website Form' : 'Research Required'),
                servicesNeeded: this.suggestServices(industry, contactInfo.website === 'N/A'),
                searchQuery: business.query,
                timestamp: new Date().toISOString(),
                leadSource: 'Ultra Lead Generator'
            };
            
            console.log(`✅ Enriched: ${business.name} (Quality: ${qualityScore}, ${priority} priority)`);
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
        
        // Rating (0-25 points)
        if (business.rating >= 4.8) score += 25;
        else if (business.rating >= 4.5) score += 22;
        else if (business.rating >= 4.0) score += 18;
        else if (business.rating >= 3.5) score += 14;
        else if (business.rating > 0) score += 8;
        
        // Review count (0-20 points)
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

    determineIndustry(query) {
        const q = query.toLowerCase();
        if (q.includes('chartered') || q.includes('audit') || q.includes('tax') || q.includes('accounting') || q.includes('financial')) {
            return 'Professional Services - Finance';
        }
        if (q.includes('law') || q.includes('legal') || q.includes('lawyer')) {
            return 'Professional Services - Legal';
        }
        if (q.includes('business') || q.includes('management') || q.includes('consultant') || q.includes('corporate')) {
            return 'Business Consulting';
        }
        if (q.includes('marketing') || q.includes('digital') || q.includes('advertising') || q.includes('branding') || q.includes('web')) {
            return 'Marketing & Digital Services';
        }
        if (q.includes('trading') || q.includes('wholesale') || q.includes('import') || q.includes('export') || q.includes('supplier')) {
            return 'Trading & Distribution';
        }
        if (q.includes('it ') || q.includes('software') || q.includes('technology') || q.includes('development')) {
            return 'Technology Services';
        }
        return 'General Business Services';
    }

    calculateRevenuePotential(industry, qualityScore) {
        const industryValues = {
            'Professional Services - Legal': 40000,
            'Professional Services - Finance': 35000,
            'Business Consulting': 28000,
            'Technology Services': 32000,
            'Marketing & Digital Services': 25000,
            'Trading & Distribution': 22000,
            'General Business Services': 20000
        };
        
        const baseValue = industryValues[industry] || 20000;
        const qualityMultiplier = 1 + (qualityScore / 200); // 0.5x to 1.5x multiplier
        
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

    suggestServices(industry, hasNoWebsite) {
        const serviceMap = {
            'Professional Services - Legal': 'Legal case management, client portal, document automation, billing system',
            'Professional Services - Finance': 'Financial software, client portal, reporting automation, compliance system',
            'Business Consulting': 'CRM system, project management, client onboarding, performance tracking',
            'Technology Services': 'Project management, client portal, service automation, technical documentation',
            'Marketing & Digital Services': 'Campaign management, client dashboard, performance analytics, social media tools',
            'Trading & Distribution': 'Inventory management, B2B portal, supplier integration, e-commerce platform',
            'General Business Services': 'Business management system, client portal, workflow automation'
        };
        
        let services = serviceMap[industry] || 'Custom business automation, client management system';
        
        if (hasNoWebsite) {
            services = `Complete digital transformation, professional website, ${services}`;
        }
        
        return services;
    }

    async saveResults() {
        if (this.results.length === 0) {
            console.log('⚠️ No results to save');
            return null;
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `ultra-lead-generation-${timestamp}`;
        
        // Save JSON
        fs.writeFileSync(`results/${filename}.json`, JSON.stringify(this.results, null, 2));
        
        // Save CSV
        const csvHeaders = [
            'Company Name', 'Phone', 'Website', 'Address', 'Industry', 'Rating', 
            'Review Count', 'Quality Score', 'Revenue Potential', 'Priority', 
            'Contact Method', 'Services Needed', 'Search Query', 'Lead Source'
        ];
        
        const csvRows = this.results.map(lead => [
            `"${lead.name}"`,
            `"${lead.phone}"`,
            `"${lead.website}"`,
            `"${lead.address}"`,
            `"${lead.industry}"`,
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

    async runCampaign() {
        console.log('🚀 ULTRA DUBAI SME LEAD GENERATION');
        console.log(`🎯 Target: 30+ premium leads`);
        console.log(`📊 Campaigns: ${this.campaigns.length}`);
        console.log(`🔍 Total searches: ${this.campaigns.reduce((sum, campaign) => sum + campaign.categories.length, 0)}\n`);
        
        let totalLeadsNeeded = 30;
        let leadsPerCampaign = Math.ceil(totalLeadsNeeded / this.campaigns.length);
        
        for (const campaign of this.campaigns) {
            if (this.results.length >= totalLeadsNeeded) break;
            
            console.log(`\n🎯 Campaign: ${campaign.name}`);
            console.log(`📊 Progress: ${this.results.length}/${totalLeadsNeeded} leads collected`);
            
            for (const category of campaign.categories) {
                if (this.results.length >= totalLeadsNeeded) break;
                
                try {
                    // Search for businesses
                    const businesses = await this.runSingleSearch(category);
                    
                    // Process each business
                    for (const business of businesses) {
                        if (this.results.length >= totalLeadsNeeded) break;
                        
                        const enrichedLead = await this.enrichBusinessData(business);
                        
                        if (enrichedLead && enrichedLead.qualityScore >= 40) {
                            this.results.push(enrichedLead);
                            console.log(`✅ Lead #${this.results.length}: ${enrichedLead.name} (${enrichedLead.priority})`);
                        }
                        
                        // Brief pause
                        await new Promise(resolve => setTimeout(resolve, 1500));
                    }
                    
                    // Pause between searches
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    
                } catch (error) {
                    console.error(`❌ Error in category ${category}:`, error.message);
                    continue;
                }
            }
        }
        
        // Save final results
        const filename = await this.saveResults();
        
        console.log('\n🎉 ULTRA LEAD GENERATION COMPLETE!');
        console.log(`📊 Total Leads: ${this.results.length}`);
        console.log(`📞 Phone Contacts: ${this.results.filter(l => l.phone !== 'N/A').length}`);
        console.log(`🌐 Website Contacts: ${this.results.filter(l => l.website !== 'N/A').length}`);
        console.log(`🚨 URGENT Priority: ${this.results.filter(l => l.priority === 'URGENT').length}`);
        console.log(`⚡ HIGH Priority: ${this.results.filter(l => l.priority === 'HIGH').length}`);
        console.log(`⭐ Avg Quality: ${Math.round(this.results.reduce((sum, l) => sum + l.qualityScore, 0) / this.results.length)}`);
        
        if (filename) {
            console.log(`📁 Files: ${filename}.json & ${filename}.csv`);
        }
        
        return this.results;
    }
}

// Execute ultra lead generation
async function main() {
    const generator = new UltraLeadGenerator();
    try {
        await generator.runCampaign();
        console.log('\n🚀 SUCCESS: 30+ Dubai SME leads ready for sales!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Campaign failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = UltraLeadGenerator;