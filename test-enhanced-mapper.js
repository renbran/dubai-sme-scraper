#!/usr/bin/env node

/**
 * TEST: Enhanced Multi-Source Mapper
 * Quick test to verify the enhanced mapper works with fallback sources
 */

const EnhancedMultiSourceMapper = require('./src/data-sources/enhanced-multi-source-mapper');

async function testEnhancedMapper() {
    console.log('🧪 TESTING ENHANCED MULTI-SOURCE MAPPER');
    console.log('=========================================');
    
    const mapper = new EnhancedMultiSourceMapper({
        enabledSources: {
            googleMaps: true,
            yelp: true,
            yellowPages: true,
            openStreetMap: true,
            dubaiBusinessDirectory: true,
            websiteAnalysis: false, // Disable for quick test
            aiIntelligence: false   // Disable for quick test
        }
    });

    try {
        console.log('🔧 Initializing mapper...');
        await mapper.initialize();
        
        console.log('\\n🔍 Testing search: "real estate agencies Dubai"');
        const results = await mapper.searchBusinesses('real estate agencies Dubai', 'Dubai, UAE', {
            maxResults: 10,
            enhanceWithWebsite: false,
            enhancedAI: false
        });
        
        console.log('\\n📊 RESULTS:');
        console.log(`Found: ${results.length} businesses`);
        
        if (results.length > 0) {
            console.log('\\n📋 Sample Results:');
            results.slice(0, 3).forEach((business, index) => {
                console.log(`${index + 1}. ${business.businessName}`);
                console.log(`   Source: ${business.dataSource}`);
                console.log(`   Address: ${business.address || 'N/A'}`);
                console.log(`   Phone: ${business.phone || 'N/A'}`);
                console.log('');
            });
        }
        
        const stats = mapper.getStats();
        console.log('📊 STATISTICS:');
        console.log(`Sources attempted: ${stats.sourcesAttempted}`);
        console.log(`Sources successful: ${stats.sourcesSuccessful}`);
        console.log(`Sources used: ${stats.sourcesUsed.join(', ')}`);
        console.log('Source breakdown:', stats.sources);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    } finally {
        await mapper.close();
        console.log('\\n✅ Test complete');
    }
}

// Run the test
testEnhancedMapper().catch(console.error);