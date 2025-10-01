// Deira SME Scraper Test
const GoogleMapsScraper = require('./src/scraper');
const { validateInput } = require('./src/utils');
const fs = require('fs');

async function runDeiraSMETest() {
    console.log('🚀 Starting Deira SME Business Scraper...\n');
    
    // Configuration for Deira SME businesses
    const testInput = {
        categories: [
            'small businesses Deira Dubai',
            'trading companies Deira Dubai',
            'retail shops Deira Dubai',
            'gold shops Deira Dubai',
            'textiles Deira Dubai',
            'electronics shops Deira Dubai'
        ],
        maxResultsPerCategory: 25,
        dataQualityLevel: 'standard'
    };
    
    // Validate input
    const validation = validateInput(testInput);
    if (!validation.isValid) {
        console.error('❌ Input validation failed:', validation.errors);
        return;
    }
    console.log('✅ Input validation passed');
    
    // Initialize scraper
    const scraper = new GoogleMapsScraper({
        headless: true,
        maxConcurrency: 1,
        requestDelay: 4000 // Slower to avoid issues
    });
    
    let allBusinesses = [];
    
    try {
        await scraper.initialize();
        console.log('✅ Scraper initialized successfully\n');
        
        // Process each category
        for (let i = 0; i < testInput.categories.length; i++) {
            const category = testInput.categories[i];
            console.log(`🔍 [${i+1}/${testInput.categories.length}] Searching: ${category}`);
            
            try {
                const businesses = await scraper.searchBusinesses(category, testInput.maxResultsPerCategory);
                console.log(`✅ Found ${businesses.length} businesses for "${category}"`);
                
                allBusinesses.push(...businesses);
                
                // Show sample results
                if (businesses.length > 0) {
                    console.log('   Sample results:');
                    businesses.slice(0, 3).forEach((business, index) => {
                        console.log(`   ${index + 1}. ${business.businessName}`);
                        console.log(`      📍 ${business.address}`);
                        console.log(`      📞 ${business.phone || 'No phone'}`);
                        console.log(`      ⭐ ${business.rating || 'No rating'}`);
                    });
                }
                
                // Delay between categories
                if (i < testInput.categories.length - 1) {
                    console.log('   ⏳ Waiting before next category...\n');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
                
            } catch (error) {
                console.error(`❌ Error searching "${category}":`, error.message);
            }
        }
        
        // Save results
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `results/deira-sme-businesses-${timestamp}.json`;
        
        // Create results directory if it doesn't exist
        if (!fs.existsSync('results')) {
            fs.mkdirSync('results');
        }
        
        // Remove duplicates
        const uniqueBusinesses = [];
        const seen = new Set();
        for (const business of allBusinesses) {
            const key = `${business.businessName}_${business.address}`.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                uniqueBusinesses.push(business);
            }
        }
        
        const results = {
            summary: {
                totalCategories: testInput.categories.length,
                totalBusinesses: allBusinesses.length,
                uniqueBusinesses: uniqueBusinesses.length,
                duplicatesRemoved: allBusinesses.length - uniqueBusinesses.length,
                searchArea: 'Deira, Dubai',
                scrapedAt: new Date().toISOString()
            },
            businesses: uniqueBusinesses
        };
        
        fs.writeFileSync(filename, JSON.stringify(results, null, 2));
        
        console.log(`\n🎉 Scraping completed!`);
        console.log(`📊 Total businesses found: ${results.summary.totalBusinesses}`);
        console.log(`🔒 Unique businesses: ${results.summary.uniqueBusinesses}`);
        console.log(`📁 Results saved to: ${filename}`);
        
    } catch (error) {
        console.error('❌ Scraping failed:', error);
    } finally {
        await scraper.cleanup();
    }
}

// Run the test
if (require.main === module) {
    runDeiraSMETest().catch(console.error);
}