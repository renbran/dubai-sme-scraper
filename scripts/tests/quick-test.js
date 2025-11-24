// Simple test script to verify the scraper works locally
const GoogleMapsScraper = require('./src/scraper');
const { validateInput } = require('./src/utils');

async function quickTest() {
    console.log('🚀 Starting Dubai SME Scraper Quick Test...\n');
    
    // Test input validation
    console.log('📋 Testing input validation...');
    const testInput = {
        categories: ['coffee shops dubai marina'],
        maxResultsPerCategory: 10,
        dataQualityLevel: 'standard'
    };
    
    const validation = validateInput(testInput);
    if (validation.isValid) {
        console.log('✅ Input validation passed');
    } else {
        console.error('❌ Input validation failed:', validation.errors);
        return;
    }
    
    // Test scraper initialization
    console.log('🌐 Testing scraper initialization...');
    const scraper = new GoogleMapsScraper({
        headless: true,
        maxConcurrency: 1,
        requestDelay: 3000
    });
    
    try {
        await scraper.initialize();
        console.log('✅ Scraper initialized successfully');
        
        // Test a small search
        console.log('🔍 Testing business search (10 results max)...');
        const businesses = await scraper.searchBusinesses('coffee shops dubai marina', 10);
        
        console.log(`✅ Search completed! Found ${businesses.length} businesses:`);
        businesses.forEach((business, index) => {
            console.log(`${index + 1}. ${business.businessName}`);
            console.log(`   📍 ${business.address}`);
            console.log(`   📞 ${business.phone || 'No phone'}`);
            console.log(`   🌐 ${business.website || 'No website'}`);
            console.log(`   ⭐ ${business.rating || 'No rating'} (${business.reviewCount || 0} reviews)`);
            console.log(`   📊 Quality Score: ${business.dataQualityScore}/100`);
            console.log('');
        });
        
        console.log('🎉 Quick test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.message === 'CAPTCHA_DETECTED') {
            console.log('💡 This might happen occasionally. Try again in a few minutes.');
        } else if (error.message === 'RATE_LIMITED') {
            console.log('💡 Rate limiting detected. Try with longer delays.');
        }
    } finally {
        await scraper.close();
        console.log('🧹 Cleanup completed');
    }
}

// Run the test
if (require.main === module) {
    quickTest().catch(console.error);
}

module.exports = quickTest;