// Ultra-simple Deira SME extractor - collect what we can get quickly
const GoogleMapsScraper = require('./src/scraper');
const { validateInput } = require('./src/utils');
const fs = require('fs');

async function quickDeirascrape() {
    console.log('🚀 Quick Deira SME Business Collection...\n');
    
    const testInput = {
        categories: ['businesses Deira Dubai'],
        maxResultsPerCategory: 10, // Very small limit for reliability
        dataQualityLevel: 'basic'
    };
    
    const validation = validateInput(testInput);
    if (!validation.isValid) {
        console.error('❌ Input validation failed:', validation.errors);
        return;
    }
    
    const scraper = new GoogleMapsScraper({
        headless: true,
        maxConcurrency: 1,
        requestDelay: 2000
    });
    
    try {
        await scraper.initialize();
        console.log('✅ Scraper initialized\n');
        
        const businesses = await scraper.searchBusinesses('businesses Deira Dubai', 10);
        console.log(`✅ Found ${businesses.length} Deira businesses!`);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `results/deira-sme-quick-${timestamp}.json`;
        
        if (!fs.existsSync('results')) {
            fs.mkdirSync('results');
        }
        
        const results = {
            summary: {
                searchTerm: 'businesses Deira Dubai',
                totalFound: businesses.length,
                targetArea: 'Deira, Dubai',
                businessType: 'Small to Medium Enterprises (SME)',
                scrapedAt: new Date().toISOString()
            },
            businesses: businesses
        };
        
        fs.writeFileSync(filename, JSON.stringify(results, null, 2));
        
        console.log(`\n🎉 Deira SME Data Collected!`);
        console.log(`📊 Total businesses: ${businesses.length}`);
        console.log(`📁 Saved to: ${filename}\n`);
        
        // Display the businesses found
        console.log('🏢 Deira SME Businesses Found:');
        businesses.forEach((business, index) => {
            console.log(`${index + 1}. ${business.businessName || 'Unknown Name'}`);
            console.log(`   📍 ${business.address || 'No address'}`);
            console.log(`   📞 ${business.phone || 'No phone'}`);
            console.log(`   ⭐ ${business.rating || 'No rating'} (${business.reviewCount || 0} reviews)`);
            console.log(`   🌐 ${business.website || 'No website'}`);
            console.log(`   📊 Quality Score: ${business.dataQualityScore || 0}/100`);
            console.log('');
        });
        
        return results;
        
    } catch (error) {
        console.error('❌ Quick scrape failed:', error);
        return null;
    } finally {
        await scraper.cleanup();
    }
}

quickDeirascrape().then(results => {
    if (results) {
        console.log('🎯 Scraping completed successfully!');
        process.exit(0);
    } else {
        console.log('❌ Scraping failed');
        process.exit(1);
    }
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});