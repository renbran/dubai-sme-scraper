// Simple Deira SME Scraper - Robust version
const GoogleMapsScraper = require('./src/scraper');
const { validateInput } = require('./src/utils');
const fs = require('fs');

async function runSimpleDeiraScraper() {
    console.log('🚀 Starting Simple Deira SME Business Scraper...\n');
    
    // Start with fewer categories and smaller limits
    const testInput = {
        categories: [
            'businesses Deira Dubai',
            'shops Deira Dubai',
            'trading companies Deira'
        ],
        maxResultsPerCategory: 15, // Smaller limit
        dataQualityLevel: 'basic' // Basic level for faster processing
    };
    
    const validation = validateInput(testInput);
    if (!validation.isValid) {
        console.error('❌ Input validation failed:', validation.errors);
        return;
    }
    console.log('✅ Input validation passed');
    
    const scraper = new GoogleMapsScraper({
        headless: true,
        maxConcurrency: 1,
        requestDelay: 5000, // Longer delay
        timeout: 15000 // Longer timeout
    });
    
    let allBusinesses = [];
    
    try {
        await scraper.initialize();
        console.log('✅ Scraper initialized successfully\n');
        
        for (let i = 0; i < testInput.categories.length; i++) {
            const category = testInput.categories[i];
            console.log(`🔍 [${i+1}/${testInput.categories.length}] Searching: ${category}`);
            
            try {
                const businesses = await scraper.searchBusinesses(category, testInput.maxResultsPerCategory);
                console.log(`✅ Found ${businesses.length} businesses for "${category}"`);
                
                allBusinesses.push(...businesses);
                
                // Show results immediately
                businesses.forEach((business, index) => {
                    console.log(`   ${index + 1}. ${business.businessName || 'Unknown Name'}`);
                    console.log(`      📍 ${business.address || 'No address'}`);
                    console.log(`      📞 ${business.phone || 'No phone'}`);
                    console.log(`      ⭐ ${business.rating || 'No rating'} (${business.reviewCount || 0} reviews)`);
                    console.log(`      🌐 ${business.website || 'No website'}`);
                    console.log(`      📊 Quality: ${business.dataQualityScore || 0}/100`);
                    console.log('');
                });
                
                // Longer delay between categories
                if (i < testInput.categories.length - 1) {
                    console.log('   ⏳ Waiting 10 seconds before next category...\n');
                    await new Promise(resolve => setTimeout(resolve, 10000));
                }
                
            } catch (error) {
                console.error(`❌ Error searching "${category}":`, error.message);
                // Continue with next category
            }
        }
        
        // Save results
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `results/deira-sme-simple-${timestamp}.json`;
        
        if (!fs.existsSync('results')) {
            fs.mkdirSync('results');
        }
        
        // Remove duplicates
        const uniqueBusinesses = [];
        const seen = new Set();
        for (const business of allBusinesses) {
            const key = `${business.businessName || 'unknown'}_${business.address || 'no-address'}`.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                uniqueBusinesses.push(business);
            }
        }
        
        const results = {
            summary: {
                searchTerms: testInput.categories,
                totalFound: allBusinesses.length,
                uniqueBusinesses: uniqueBusinesses.length,
                duplicatesRemoved: allBusinesses.length - uniqueBusinesses.length,
                targetArea: 'Deira, Dubai',
                businessType: 'Small to Medium Enterprises (SME)',
                scrapedAt: new Date().toISOString(),
                note: 'This scraping focused on SME businesses in the Deira area of Dubai'
            },
            businesses: uniqueBusinesses
        };
        
        fs.writeFileSync(filename, JSON.stringify(results, null, 2));
        
        console.log(`\n🎉 Deira SME Scraping Completed!`);
        console.log(`📊 Total businesses found: ${results.summary.totalFound}`);
        console.log(`🔒 Unique businesses: ${results.summary.uniqueBusinesses}`);
        console.log(`🏢 Focus area: Deira, Dubai (SME businesses)`);
        console.log(`📁 Results saved to: ${filename}`);
        
        // Show top businesses
        if (uniqueBusinesses.length > 0) {
            console.log(`\n🏆 Top ${Math.min(5, uniqueBusinesses.length)} Deira SME Businesses:`);
            uniqueBusinesses.slice(0, 5).forEach((business, index) => {
                console.log(`${index + 1}. ${business.businessName || 'Unknown'}`);
                console.log(`   📍 ${business.address || 'No address'}`);
                console.log(`   📞 ${business.phone || 'No phone'}`);
                console.log(`   ⭐ ${business.rating || 'No rating'}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Scraping failed:', error);
    } finally {
        await scraper.cleanup();
    }
}

runSimpleDeiraScraper().catch(console.error);