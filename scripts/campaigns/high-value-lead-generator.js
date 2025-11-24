// High-Value Business Services Lead Generator
// Focus on service companies with highest conversion potential

const GoogleMapsScraper = require('./src/scraper');
const { validateInput } = require('./src/utils');
const fs = require('fs');

async function highValueLeadGeneration() {
    console.log('🎯 HIGH-VALUE BUSINESS SERVICES LEAD GENERATION');
    console.log('==============================================');
    console.log('💰 Focus: Service companies with high revenue potential\n');
    
    // High-conversion business service categories
    const highValueCategories = [
        // Professional Services - Immediate need for digital solutions
        'accounting firms Dubai',
        'audit firms Dubai', 
        'tax consultants Dubai',
        'business consultants Dubai',
        'management consultants Dubai',
        'legal services Dubai',
        'corporate lawyers Dubai',
        'business setup services Dubai',
        'PRO services Dubai',
        'company formation Dubai',
        
        // Marketing & Digital - Our direct market
        'marketing agencies Dubai',
        'advertising agencies Dubai',
        'digital marketing Dubai',
        'branding agencies Dubai',
        'public relations Dubai',
        
        // IT & Technology - High-value prospects
        'IT companies Dubai',
        'software companies Dubai',
        'web development Dubai',
        'mobile app development Dubai',
        'system integrators Dubai',
        
        // Business Support Services
        'HR consultants Dubai',
        'recruitment agencies Dubai',
        'training companies Dubai',
        'business coaching Dubai',
        'strategy consultants Dubai'
    ];
    
    const testInput = {
        categories: highValueCategories,
        maxResultsPerCategory: 25,
        dataQualityLevel: 'standard'
    };
    
    console.log(`🔍 Targeting ${testInput.categories.length} high-value categories`);
    console.log(`💎 Expected premium leads: ${testInput.categories.length * 20}\n`);
    
    const validation = validateInput(testInput);
    if (!validation.isValid) {
        console.error('❌ Input validation failed:', validation.errors);
        return;
    }
    
    const scraper = new GoogleMapsScraper({
        headless: true,
        maxConcurrency: 1,
        requestDelay: 3000,
        timeout: 15000
    });
    
    let allBusinesses = [];
    let premiumLeads = [];
    
    try {
        await scraper.initialize();
        console.log('✅ High-value scraper initialized\n');
        
        for (let i = 0; i < testInput.categories.length; i++) {
            const category = testInput.categories[i];
            const progress = `[${i+1}/${testInput.categories.length}]`;
            
            console.log(`💎 ${progress} Scanning: "${category}"`);
            
            try {
                const businesses = await scraper.searchBusinesses(category, testInput.maxResultsPerCategory);
                console.log(`✅ Located ${businesses.length} businesses`);
                
                allBusinesses.push(...businesses);
                
                // Filter for premium leads immediately
                const categoryPremium = businesses.filter(b => {
                    return (b.phone || b.website) && 
                           (b.dataQualityScore || 0) >= 50 &&
                           b.businessName && 
                           !b.businessName.toLowerCase().includes('mall') &&
                           !b.businessName.toLowerCase().includes('center');
                });
                
                premiumLeads.push(...categoryPremium);
                
                if (categoryPremium.length > 0) {
                    console.log(`   🏆 ${categoryPremium.length} premium leads identified:`);
                    categoryPremium.slice(0, 2).forEach((lead, idx) => {
                        console.log(`   ${idx + 1}. ${lead.businessName}`);
                        console.log(`      📞 ${lead.phone || 'Website contact'}`);
                        console.log(`      🌐 ${lead.website || 'No website'}`);
                        console.log(`      📊 Quality: ${lead.dataQualityScore || 0}/100`);
                    });
                }
                
                // Short delay between categories
                if (i < testInput.categories.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 4000));
                }
                
            } catch (error) {
                console.error(`❌ Error processing "${category}":`, error.message);
            }
        }
        
        // Process and deduplicate results
        const uniqueLeads = [];
        const seen = new Set();
        
        for (const lead of premiumLeads) {
            const key = `${lead.businessName || 'unknown'}_${lead.phone || lead.website || 'no-contact'}`.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                uniqueLeads.push(lead);
            }
        }
        
        // Sort by quality score
        uniqueLeads.sort((a, b) => (b.dataQualityScore || 0) - (a.dataQualityScore || 0));
        
        // Create results file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `results/high-value-business-leads-${timestamp}.json`;
        
        const results = {
            campaign: {
                type: 'High-Value Business Services Lead Generation',
                executedAt: new Date().toISOString(),
                targetCategories: testInput.categories,
                focus: 'Professional services with high revenue potential'
            },
            summary: {
                totalBusinessesScanned: allBusinesses.length,
                premiumLeadsFound: uniqueLeads.length,
                averageQualityScore: Math.round(
                    uniqueLeads.reduce((sum, l) => sum + (l.dataQualityScore || 0), 0) / uniqueLeads.length
                ),
                contactableLeads: uniqueLeads.filter(l => l.phone).length,
                websiteLeads: uniqueLeads.filter(l => l.website).length,
                topTierLeads: uniqueLeads.filter(l => (l.dataQualityScore || 0) >= 70).length
            },
            leads: uniqueLeads
        };
        
        fs.writeFileSync(filename, JSON.stringify(results, null, 2));
        
        console.log('\n🎉 HIGH-VALUE LEAD GENERATION COMPLETED!');
        console.log('=======================================');
        console.log(`💎 Premium leads discovered: ${results.summary.premiumLeadsFound}`);
        console.log(`📞 Direct phone contacts: ${results.summary.contactableLeads}`);
        console.log(`🌐 Website contacts: ${results.summary.websiteLeads}`);
        console.log(`🏆 Top-tier leads (70+ quality): ${results.summary.topTierLeads}`);
        console.log(`📈 Average quality score: ${results.summary.averageQualityScore}/100`);
        console.log(`📁 Results saved to: ${filename}\n`);
        
        // Display top 10 premium leads
        console.log('🏆 TOP 10 PREMIUM LEADS FOR IMMEDIATE CONTACT:');
        console.log('===========================================');
        uniqueLeads.slice(0, 10).forEach((lead, idx) => {
            console.log(`${idx + 1}. ${lead.businessName}`);
            console.log(`   📞 ${lead.phone || 'Website contact only'}`);
            console.log(`   🌐 ${lead.website || 'No website (opportunity!)'}`);
            console.log(`   📍 ${lead.address || 'Address available'}`);
            console.log(`   📊 Quality: ${lead.dataQualityScore || 0}/100 | Rating: ${lead.rating || 'N/A'}`);
            console.log(`   🏢 Category: ${lead.category || 'Professional Services'}`);
            console.log('');
        });
        
        return results;
        
    } catch (error) {
        console.error('❌ High-value lead generation failed:', error);
        return null;
    } finally {
        try {
            await scraper.close?.();
        } catch (e) {
            // Ignore cleanup errors
        }
    }
}

highValueLeadGeneration().then(results => {
    if (results && results.summary.premiumLeadsFound > 0) {
        console.log(`\n💰 ESTIMATED REVENUE POTENTIAL: $${(results.summary.premiumLeadsFound * 12000).toLocaleString()}`);
        console.log('📞 Ready for immediate outreach!');
        process.exit(0);
    } else {
        console.log('\n❌ High-value lead generation incomplete');
        process.exit(1);
    }
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});