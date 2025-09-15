const EnhancedMultiSourceMapper = require('./src/data-sources/enhanced-multi-source-mapper');

async function quickCheck() {
    console.log('🔧 Quick System Check');
    console.log('==================');
    
    const mapper = new EnhancedMultiSourceMapper({
        retryOptions: { retries: 2, factor: 2, minTimeout: 1000, maxTimeout: 3000 }
    });
    
    try {
        await mapper.initialize();
        console.log('✅ System initialized');
        
        const results = await mapper.searchBusinesses('real estate Dubai', 'Dubai, UAE', {
            maxResults: 2,
            enhanceWithWebsite: false,
            enhancedAI: false
        });
        
        console.log(`✅ Found ${results?.length || 0} businesses`);
        if (results && results.length > 0) {
            console.log(`First result: ${results[0].businessName}`);
        }
        
        const stats = mapper.getStats();
        console.log(`📊 Sources tried: ${stats.sourcesAttempted}`);
        console.log(`📊 Sources worked: ${stats.sourcesSuccessful}`);
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    } finally {
        await mapper.close();
        console.log('✅ Test complete');
    }
}

quickCheck().catch(console.error);