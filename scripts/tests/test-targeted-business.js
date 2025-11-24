#!/usr/bin/env node

/**
 * TARGETED BUSINESS INTELLIGENCE TEST
 * Quick test of key real estate and accounting searches to verify the system works
 */

const EnhancedMultiSourceMapper = require('./src/data-sources/enhanced-multi-source-mapper');

async function targetedBusinessTest() {
    console.log('🎯 TARGETED BUSINESS INTELLIGENCE TEST');
    console.log('=====================================');
    
    const mapper = new EnhancedMultiSourceMapper({
        enabledSources: {
            googleMaps: true,
            yelp: true,
            yellowPages: true,
            openStreetMap: true,
            dubaiBusinessDirectory: true,
            websiteAnalysis: true,
            aiIntelligence: true
        }
    });

    const testQueries = [
        'real estate agencies Dubai',
        'accounting firms Dubai',
        'business consultants Dubai'
    ];

    try {
        console.log('🔧 Initializing mapper...');
        await mapper.initialize();
        console.log('✅ Mapper initialized\\n');
        
        const allResults = [];
        
        for (const query of testQueries) {
            console.log(`🔍 Testing: "${query}"`);
            console.log('-'.repeat(50));
            
            try {
                const results = await mapper.searchBusinesses(query, 'Dubai, UAE', {
                    maxResults: 5, // Small number for quick test
                    enhanceWithWebsite: false, // Skip for speed
                    enhancedAI: false, // Skip for speed
                    requireMinResults: 1
                });
                
                console.log(`✅ Found ${results.length} businesses for "${query}"`);
                
                if (results.length > 0) {
                    results.forEach((business, index) => {
                        console.log(`  ${index + 1}. ${business.businessName}`);
                        console.log(`     📍 ${business.address || 'No address'}`);
                        console.log(`     📞 ${business.phone || 'No phone'}`);
                        console.log(`     🌐 ${business.website || 'No website'}`);
                        console.log(`     📊 Source: ${business.dataSource}`);
                        console.log('');
                    });
                    
                    allResults.push(...results);
                } else {
                    console.log(`   ⚠️  No results found for "${query}"`);
                }
                
            } catch (error) {
                console.error(`❌ Error with "${query}":`, error.message);
            }
            
            console.log('\\n');
        }
        
        console.log('📊 FINAL SUMMARY');
        console.log('================');
        console.log(`Total businesses found: ${allResults.length}`);
        console.log(`Unique business names: ${new Set(allResults.map(b => b.businessName)).size}`);
        
        const stats = mapper.getStats();
        console.log(`Sources successful: ${stats.sourcesSuccessful}/${stats.sourcesAttempted}`);
        console.log(`Sources used: ${stats.sourcesUsed.join(', ')}`);
        
        if (allResults.length > 0) {
            console.log('\\n🎉 SUCCESS: Enhanced mapper is working!');
            console.log('The bulk operation should now work properly.');
        } else {
            console.log('\\n⚠️  WARNING: No businesses found across all searches.');
            console.log('There may still be configuration issues.');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    } finally {
        await mapper.close();
        console.log('\\n✅ Test complete');
    }
}

// Run the test
targetedBusinessTest().catch(console.error);