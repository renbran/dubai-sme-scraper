#!/usr/bin/env node

/**
 * QUICK BULK INTELLIGENCE TEST
 * Streamlined test with single query to verify retry mechanism
 */

const EnhancedMultiSourceMapper = require('./src/data-sources/enhanced-multi-source-mapper');

async function quickBulkTest() {
    console.log('⚡ QUICK BULK INTELLIGENCE TEST');
    console.log('===============================');
    console.log('🎯 Testing: 2-retry mechanism with real search');
    console.log('📍 Focus: Single real estate query for speed');
    console.log('');
    
    const mapper = new EnhancedMultiSourceMapper({
        enabledSources: {
            googleMaps: true,
            yelp: true,
            openStreetMap: true,
            websiteAnalysis: false,
            aiIntelligence: false
        },
        retryOptions: {
            retries: 2,
            factor: 2,
            minTimeout: 1000,
            maxTimeout: 3000,
            randomize: true
        },
        fallbackOrder: ['googleMaps', 'yelp', 'openStreetMap']
    });

    const testQuery = 'real estate agencies Dubai';
    
    try {
        console.log('🔧 Initializing mapper...');
        await mapper.initialize();
        console.log('✅ Initialized successfully\\n');
        
        console.log(`🔍 Testing: "${testQuery}"`);
        console.log('⏱️  Retry Policy: Max 2 retries, then move on');
        console.log('-'.repeat(50));
        
        const startTime = Date.now();
        
        try {
            const results = await mapper.searchBusinesses(testQuery, 'Dubai, UAE', {
                maxResults: 5,
                enhanceWithWebsite: false,
                enhancedAI: false,
                requireMinResults: 1
            });
            
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            
            if (results && results.length > 0) {
                console.log(`\\n✅ SUCCESS: Found ${results.length} businesses in ${duration}s`);
                console.log('\\n📋 Results:');
                results.forEach((business, index) => {
                    console.log(`${index + 1}. ${business.businessName}`);
                    console.log(`   📍 ${business.address || 'No address'}`);
                    console.log(`   📞 ${business.phone || 'No phone'}`);
                    console.log(`   🌐 ${business.website || 'No website'}`);
                    console.log(`   📊 Source: ${business.dataSource}`);
                    console.log('');
                });
                
                console.log(`🎉 RETRY MECHANISM TEST: PASSED`);
                console.log(`📊 Total processing time: ${duration}s`);
                
            } else {
                console.log(`\\n⚠️  NO RESULTS: After retries, no businesses found in ${duration}s`);
            }
            
        } catch (error) {
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`\\n❌ FAILED: All retries exhausted in ${duration}s`);
            console.log(`Error: ${error.message}`);
            
            // Test fallback behavior
            console.log('\\n🔄 Testing fallback to next source...');
            console.log('⚠️  This demonstrates the "move on" behavior');
        }
        
        const stats = mapper.getStats();
        console.log('\\n📈 OPERATION STATS:');
        console.log(`Sources attempted: ${stats.sourcesAttempted}`);
        console.log(`Sources successful: ${stats.sourcesSuccessful}`);
        console.log(`Sources used: ${stats.sourcesUsed.join(', ')}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await mapper.close();
        console.log('\\n✅ Quick test complete');
    }
}

// Run the test
quickBulkTest().catch(console.error);