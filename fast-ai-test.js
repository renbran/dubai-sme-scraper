#!/usr/bin/env node

/**
 * Fast AI Test - Quick validation of AI-enhanced scraping
 * Optimized for speed with minimal retries
 */

const GoogleMapsScraper = require('./src/scraper');
const AIBusinessIntelligence = require('./src/ai-intelligence');

async function runFastAITest() {
    console.log('⚡ Fast AI-Enhanced Scraper Test');
    console.log('================================');
    console.log('🔧 Settings: 1 retry max, 8s timeout per business');
    
    const ai = new AIBusinessIntelligence({
        apiKey: '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',
        enabled: true
    });
    
    const scraper = new GoogleMapsScraper({
        headless: true,
        timeout: 20000
    });
    
    try {
        await scraper.initialize();
        
        // Test with a single AI-generated query
        console.log('\n🧠 Generating AI-optimized query...');
        const queries = await ai.generateSearchQueries({
            businessType: 'real estate companies',
            location: 'Dubai Marina'
        });
        
        const testQuery = queries[0];
        console.log(`🎯 Testing query: "${testQuery}"`);
        
        const startTime = Date.now();
        const results = await scraper.searchBusinesses(testQuery);
        const duration = (Date.now() - startTime) / 1000;
        
        console.log(`\n⏱️ Collection took ${duration}s`);
        console.log(`📊 Found ${results?.length || 0} businesses`);
        
        if (results && results.length > 0) {
            // Test AI analysis on first business
            const testBusiness = results[0];
            console.log(`\n🔍 AI analyzing: ${testBusiness.businessName}`);
            
            const classified = await ai.classifyBusiness(testBusiness);
            console.log(`✅ Business Size: ${classified.aiClassification?.businessSize}`);
            console.log(`✅ Lead Score: ${classified.aiClassification?.leadQualityScore}/100`);
            console.log(`✅ Industry: ${classified.aiClassification?.industryCategory}`);
            
            // Show contact info
            console.log(`\n📧 Contact Information:`);
            console.log(`   Email: ${testBusiness.email || 'Not found'}`);
            console.log(`   Phone: ${testBusiness.phone || 'Not found'}`);
            console.log(`   Website: ${testBusiness.website || 'Not found'}`);
            
            if (testBusiness.socialMedia && Object.keys(testBusiness.socialMedia).length > 0) {
                console.log(`   Social Media: ${Object.keys(testBusiness.socialMedia).join(', ')}`);
            }
            
            console.log(`\n🎉 AI Integration Test: SUCCESSFUL!`);
            console.log(`📈 Ready for large-scale production scraping`);
            
        } else {
            console.log('❌ No businesses found in test');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await scraper.close();
        console.log('\n⚡ Fast test completed!');
    }
}

runFastAITest();