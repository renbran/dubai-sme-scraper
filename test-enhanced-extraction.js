#!/usr/bin/env node

/**
 * Test Enhanced Email and Social Media Extraction
 * Quick test to verify email and social media extraction is working
 */

const GoogleMapsScraper = require('./src/scraper');

async function testEnhancedExtraction() {
    console.log('🚀 Testing Enhanced Email & Social Media Extraction...');
    
    const scraper = new GoogleMapsScraper({
        headless: false,
        timeout: 30000
    });
    
    try {
        console.log('🔧 Initializing scraper...');
        await scraper.initialize();
        
        console.log('🔍 Testing search for a specific business with social media...');
        const results = await scraper.searchBusinesses('McDonald\'s Downtown Dubai');
        
        if (results && results.length > 0) {
            console.log('✅ Found businesses with enhanced data:');
            results.forEach((business, index) => {
                console.log(`\n📊 Business ${index + 1}: ${business.businessName}`);
                console.log(`📧 Email: ${business.email || 'Not found'}`);
                console.log(`📱 Social Media:`, business.socialMedia || 'None found');
                console.log(`📞 Phone: ${business.phone || 'Not found'}`);
                console.log(`🌐 Website: ${business.website || 'Not found'}`);
            });
            
            // Save enhanced results
            const fs = require('fs');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `enhanced-test-${timestamp}.json`;
            const filePath = `./results/${fileName}`;
            
            fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
            console.log(`\n💾 Enhanced results saved to: ${filePath}`);
            
        } else {
            console.log('❌ No businesses found');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await scraper.close();
        console.log('🔚 Test completed');
    }
}

// Run test
testEnhancedExtraction();