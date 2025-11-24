const N8nWebhookIntegration = require('./src/integrations/n8n-webhook');

async function testWebhook() {
    console.log('🧪 Testing N8N Webhook Integration');
    console.log('================================');
    
    const webhook = new N8nWebhookIntegration();
    
    // Test data
    const testLeads = [
        {
            businessName: 'Test Real Estate Company',
            category: 'Real Estate',
            address: 'Dubai Marina, Dubai',
            phone: '+971501234567',
            website: 'https://testrealestate.com',
            rating: 4.5,
            reviewCount: 150
        }
    ];
    
    const metadata = {
        operationType: 'Webhook Test',
        timestamp: new Date().toISOString(),
        totalBusinesses: testLeads.length
    };
    
    try {
        console.log('📤 Testing sendIntelligenceData method...');
        const result = await webhook.sendIntelligenceData(testLeads, metadata);
        
        if (result.success) {
            console.log(`✅ SUCCESS: ${result.leadsSent} leads sent successfully`);
            console.log(`📊 Response: ${JSON.stringify(result.response, null, 2)}`);
        } else {
            console.log(`❌ FAILED: ${result.error}`);
        }
        
    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
    }
    
    console.log('🧪 Webhook test complete');
}

testWebhook().catch(console.error);