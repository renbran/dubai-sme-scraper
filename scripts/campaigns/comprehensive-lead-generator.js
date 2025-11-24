// Comprehensive Dubai SME Lead Generation Scraper
// Targeting multiple areas and business categories for maximum lead generation

const GoogleMapsScraper = require('./src/scraper');
const { validateInput } = require('./src/utils');
const fs = require('fs');

async function comprehensiveSMELeadGeneration() {
    console.log('🚀 COMPREHENSIVE DUBAI SME LEAD GENERATION CAMPAIGN');
    console.log('====================================================');
    console.log('🎯 Target: Maximum SME business leads across Dubai');
    console.log('📊 Focus: Complete contact information and business intelligence\n');
    
    // Expanded search configuration for maximum lead generation
    const searchConfig = {
        // Business Services - High conversion potential
        businessServices: [
            'accounting firms Dubai',
            'business consultants Dubai',
            'marketing agencies Dubai',
            'legal services Dubai',
            'business setup Dubai',
            'PRO services Dubai',
            'audit firms Dubai',
            'tax consultants Dubai',
            'business advisors Dubai',
            'management consultants Dubai'
        ],
        
        // Trading Companies - High volume in Dubai
        tradingCompanies: [
            'trading companies Dubai',
            'import export Dubai',
            'wholesale trading Dubai',
            'distribution companies Dubai',
            'general trading Dubai',
            'commodity trading Dubai',
            'electronics trading Dubai',
            'food trading Dubai',
            'textile trading Dubai',
            'machinery trading Dubai'
        ],
        
        // Technology & Digital - Growing sector
        technology: [
            'IT companies Dubai',
            'software companies Dubai',
            'web development Dubai',
            'digital marketing Dubai',
            'tech startups Dubai',
            'app development Dubai',
            'system integrators Dubai',
            'cybersecurity Dubai',
            'cloud services Dubai',
            'IT consultants Dubai'
        ],
        
        // Healthcare - Stable sector
        healthcare: [
            'medical centers Dubai',
            'dental clinics Dubai',
            'physiotherapy Dubai',
            'healthcare services Dubai',
            'medical equipment Dubai',
            'pharmacy Dubai',
            'diagnostic centers Dubai',
            'wellness centers Dubai',
            'medical consultants Dubai',
            'healthcare IT Dubai'
        ],
        
        // Construction & Real Estate - Major Dubai sector
        construction: [
            'construction companies Dubai',
            'contracting Dubai',
            'interior design Dubai',
            'architecture firms Dubai',
            'engineering consultants Dubai',
            'building materials Dubai',
            'MEP contractors Dubai',
            'project management Dubai',
            'facility management Dubai',
            'maintenance services Dubai'
        ],
        
        // Retail & E-commerce - Digital transformation opportunity
        retail: [
            'retail stores Dubai',
            'fashion boutiques Dubai',
            'electronics stores Dubai',
            'home decor Dubai',
            'sporting goods Dubai',
            'beauty salons Dubai',
            'gift shops Dubai',
            'jewelry stores Dubai',
            'mobile shops Dubai',
            'furniture stores Dubai'
        ]
    };
    
    const testInput = {
        categories: [
            // Start with high-potential business services
            ...searchConfig.businessServices.slice(0, 5),
            ...searchConfig.tradingCompanies.slice(0, 5),
            ...searchConfig.technology.slice(0, 3),
            ...searchConfig.healthcare.slice(0, 3),
            ...searchConfig.construction.slice(0, 3),
            ...searchConfig.retail.slice(0, 3)
        ],
        maxResultsPerCategory: 30, // Increased for more leads
        dataQualityLevel: 'standard'
    };
    
    console.log(`🔍 Targeting ${testInput.categories.length} business categories`);
    console.log(`📈 Expected leads: ${testInput.categories.length * testInput.maxResultsPerCategory} businesses\n`);
    
    const validation = validateInput(testInput);
    if (!validation.isValid) {
        console.error('❌ Input validation failed:', validation.errors);
        return;
    }
    
    const scraper = new GoogleMapsScraper({
        headless: true,
        maxConcurrency: 1, // Conservative for stability
        requestDelay: 4000, // Slower for better data extraction
        timeout: 20000 // Longer timeout for detailed extraction
    });
    
    let allBusinesses = [];
    let categoryResults = {};
    
    try {
        await scraper.initialize();
        console.log('✅ Advanced scraper initialized\n');
        
        // Process each category with progress tracking
        for (let i = 0; i < testInput.categories.length; i++) {
            const category = testInput.categories[i];
            const progress = `[${i+1}/${testInput.categories.length}]`;
            
            console.log(`🔍 ${progress} Processing: "${category}"`);
            console.log(`⏱️  Progress: ${Math.round((i/testInput.categories.length)*100)}%`);
            
            try {
                const startTime = Date.now();
                const businesses = await scraper.searchBusinesses(category, testInput.maxResultsPerCategory);
                const duration = Math.round((Date.now() - startTime) / 1000);
                
                console.log(`✅ Found ${businesses.length} businesses in ${duration}s`);
                
                // Store results by category for analysis
                categoryResults[category] = businesses;
                allBusinesses.push(...businesses);
                
                // Show top quality leads found
                const topLeads = businesses
                    .filter(b => b.phone || b.website)
                    .sort((a, b) => (b.dataQualityScore || 0) - (a.dataQualityScore || 0))
                    .slice(0, 3);
                
                if (topLeads.length > 0) {
                    console.log('   🏆 Top leads from this category:');
                    topLeads.forEach((business, idx) => {
                        console.log(`   ${idx + 1}. ${business.businessName}`);
                        console.log(`      📞 ${business.phone || 'No phone'}`);
                        console.log(`      🌐 ${business.website || 'No website'}`);
                        console.log(`      ⭐ ${business.rating || 'No rating'} | Quality: ${business.dataQualityScore || 0}/100`);
                    });
                }
                
                // Progress delay between categories
                if (i < testInput.categories.length - 1) {
                    console.log('   ⏳ Processing next category...\n');
                    await new Promise(resolve => setTimeout(resolve, 6000));
                }
                
            } catch (error) {
                console.error(`❌ Error processing "${category}":`, error.message);
                categoryResults[category] = [];
            }
        }
        
        // Remove duplicates and analyze results
        console.log('\n🔄 Processing and analyzing results...');
        const uniqueBusinesses = [];
        const seen = new Set();
        
        for (const business of allBusinesses) {
            const key = `${business.businessName || 'unknown'}_${business.address || 'no-address'}`.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                uniqueBusinesses.push(business);
            }
        }
        
        // Filter for high-quality leads with contact information
        const qualityLeads = uniqueBusinesses.filter(business => {
            return (business.phone || business.website) && 
                   (business.dataQualityScore || 0) >= 40;
        });
        
        // Categorize leads by business type and priority
        const leadCategories = {
            businessServices: [],
            technology: [],
            trading: [],
            healthcare: [],
            construction: [],
            retail: [],
            other: []
        };
        
        qualityLeads.forEach(business => {
            const category = business.category?.toLowerCase() || '';
            const name = business.businessName?.toLowerCase() || '';
            
            if (category.includes('consult') || category.includes('accounting') || 
                category.includes('legal') || category.includes('business')) {
                leadCategories.businessServices.push(business);
            } else if (category.includes('software') || category.includes('tech') || 
                      category.includes('digital') || category.includes('web')) {
                leadCategories.technology.push(business);
            } else if (category.includes('trading') || category.includes('import') || 
                      category.includes('wholesale') || category.includes('distribution')) {
                leadCategories.trading.push(business);
            } else if (category.includes('medical') || category.includes('health') || 
                      category.includes('clinic') || category.includes('dental')) {
                leadCategories.healthcare.push(business);
            } else if (category.includes('construction') || category.includes('contractor') || 
                      category.includes('engineering') || category.includes('architecture')) {
                leadCategories.construction.push(business);
            } else if (category.includes('retail') || category.includes('store') || 
                      category.includes('shop') || category.includes('boutique')) {
                leadCategories.retail.push(business);
            } else {
                leadCategories.other.push(business);
            }
        });
        
        // Generate comprehensive results
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `results/comprehensive-dubai-sme-leads-${timestamp}.json`;
        
        if (!fs.existsSync('results')) {
            fs.mkdirSync('results');
        }
        
        const results = {
            campaign: {
                name: 'Comprehensive Dubai SME Lead Generation',
                executedAt: new Date().toISOString(),
                targetCategories: testInput.categories.length,
                searchQueries: testInput.categories,
                maxResultsPerCategory: testInput.maxResultsPerCategory
            },
            summary: {
                totalBusinessesFound: allBusinesses.length,
                uniqueBusinesses: uniqueBusinesses.length,
                qualityLeads: qualityLeads.length,
                duplicatesRemoved: allBusinesses.length - uniqueBusinesses.length,
                averageQualityScore: Math.round(
                    qualityLeads.reduce((sum, b) => sum + (b.dataQualityScore || 0), 0) / qualityLeads.length
                ),
                contactableLeads: qualityLeads.filter(b => b.phone).length,
                websiteLeads: qualityLeads.filter(b => b.website).length,
                premiumLeads: qualityLeads.filter(b => (b.dataQualityScore || 0) >= 70).length
            },
            leadCategories: {
                businessServices: {
                    count: leadCategories.businessServices.length,
                    businesses: leadCategories.businessServices
                },
                technology: {
                    count: leadCategories.technology.length,
                    businesses: leadCategories.technology
                },
                trading: {
                    count: leadCategories.trading.length,
                    businesses: leadCategories.trading
                },
                healthcare: {
                    count: leadCategories.healthcare.length,
                    businesses: leadCategories.healthcare
                },
                construction: {
                    count: leadCategories.construction.length,
                    businesses: leadCategories.construction
                },
                retail: {
                    count: leadCategories.retail.length,
                    businesses: leadCategories.retail
                },
                other: {
                    count: leadCategories.other.length,
                    businesses: leadCategories.other
                }
            },
            allLeads: qualityLeads
        };
        
        fs.writeFileSync(filename, JSON.stringify(results, null, 2));
        
        // Display comprehensive results
        console.log('\n🎉 COMPREHENSIVE LEAD GENERATION COMPLETED!');
        console.log('================================================');
        console.log(`📊 Total businesses discovered: ${results.summary.totalBusinessesFound}`);
        console.log(`🔒 Unique businesses: ${results.summary.uniqueBusinesses}`);
        console.log(`⭐ Quality leads (contactable): ${results.summary.qualityLeads}`);
        console.log(`📞 Direct phone contacts: ${results.summary.contactableLeads}`);
        console.log(`🌐 Website contacts: ${results.summary.websiteLeads}`);
        console.log(`🏆 Premium leads (70+ quality): ${results.summary.premiumLeads}`);
        console.log(`📈 Average quality score: ${results.summary.averageQualityScore}/100`);
        console.log(`📁 Results saved to: ${filename}\n`);
        
        // Show breakdown by category
        console.log('📋 LEADS BY BUSINESS CATEGORY:');
        console.log('==============================');
        Object.entries(leadCategories).forEach(([category, businesses]) => {
            if (businesses.length > 0) {
                console.log(`🏢 ${category.toUpperCase()}: ${businesses.length} leads`);
                businesses.slice(0, 3).forEach((business, idx) => {
                    console.log(`   ${idx + 1}. ${business.businessName}`);
                    console.log(`      📞 ${business.phone || 'Website only'}`);
                    console.log(`      ⭐ Quality: ${business.dataQualityScore || 0}/100`);
                });
                if (businesses.length > 3) {
                    console.log(`   ... and ${businesses.length - 3} more leads`);
                }
                console.log('');
            }
        });
        
        return results;
        
    } catch (error) {
        console.error('❌ Comprehensive scraping failed:', error);
        return null;
    } finally {
        try {
            await scraper.close?.();
        } catch (e) {
            // Ignore cleanup errors
        }
    }
}

// Execute the comprehensive lead generation
comprehensiveSMELeadGeneration().then(results => {
    if (results) {
        console.log('\n🎯 LEAD GENERATION CAMPAIGN SUCCESSFUL!');
        console.log(`💰 Estimated lead value: $${(results.summary.qualityLeads * 8000).toLocaleString()}`);
        console.log('📧 Ready for outreach campaigns!');
        process.exit(0);
    } else {
        console.log('\n❌ Lead generation campaign failed');
        process.exit(1);
    }
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});