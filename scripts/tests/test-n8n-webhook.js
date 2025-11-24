#!/usr/bin/env node

/**
 * n8n Webhook Test & Payload Validation
 * Tests the webhook endpoint and shows the exact payload structure
 */

const N8nWebhookIntegration = require('./src/integrations/n8n-webhook');

async function testN8nWebhookConnection() {
    console.log('🔗 N8N WEBHOOK CONNECTION TEST');
    console.log('==============================');
    
    const n8nIntegration = new N8nWebhookIntegration({
        webhookUrl: 'https://kpajoosus123.app.n8n.cloud/webhook-test/906ece75-9308-49fb-ab57-3db1375359d0',
        retryAttempts: 1 // Quick test
    });
    
    // Create sample lead data for testing
    const sampleLead = {
        businessName: "Test Tech Company LLC",
        category: "Software Company",
        address: "Office 123, Business Bay, Dubai",
        phone: "+971501234567",
        email: "info@testtech.com",
        website: "https://testtech.com",
        rating: 4.5,
        reviewCount: 25,
        coordinates: { lat: 25.1857, lng: 55.2721 },
        locationDetails: {
            area: "Business Bay",
            emirate: "Dubai"
        },
        aiClassification: {
            businessSize: "SME",
            industryCategory: "Technology",
            targetMarket: "B2B",
            companyStage: "Growth",
            keyInsights: "High-growth tech company with strong market position"
        },
        leadScoring: {
            totalScore: 85,
            priority: "High",
            recommendations: [
                "Immediate consultation recommended",
                "Focus on cybersecurity services"
            ],
            reasoning: ["High score due to tech industry fit", "SME size perfect for services"]
        },
        websiteAnalysis: {
            digitalMaturity: {
                level: "Basic",
                score: 65
            },
            security: {
                level: "Low",
                score: 30
            },
            technologies: {
                wordpress: { detected: true, category: "CMS", score: 40 }
            }
        },
        dataQualityScore: 85,
        verificationStatus: "Verified",
        confidence: 0.9,
        dataSource: "Google Maps"
    };
    
    const searchMetadata = {
        query: "technology companies Dubai",
        location: "Dubai, UAE",
        timestamp: new Date().toISOString(),
        platform: "Dubai-SME-Intelligence-Platform",
        version: "2.0"
    };
    
    console.log('\n📤 TESTING WEBHOOK WITH SAMPLE DATA...');
    console.log('=====================================');
    
    try {
        // Test with single lead
        const result = await n8nIntegration.sendIntelligenceData([sampleLead], searchMetadata);
        
        if (result.success) {
            console.log('✅ WEBHOOK TEST SUCCESSFUL!');
            console.log(`📊 Status: ${result.response.status}`);
            console.log(`📄 Response: ${result.response.data}`);
            console.log(`🎯 Leads sent: ${result.leadsSent}`);
        } else {
            console.log('❌ WEBHOOK TEST FAILED');
            console.log(`🔍 Error: ${result.error}`);
        }
        
        // Show the exact payload structure
        console.log('\n📋 SAMPLE PAYLOAD STRUCTURE:');
        console.log('============================');
        
        const payload = n8nIntegration.prepareIntelligencePayload([sampleLead], searchMetadata);
        console.log(JSON.stringify(payload, null, 2));
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        // Show what the payload would look like
        console.log('\n📋 PAYLOAD THAT WOULD BE SENT:');
        console.log('==============================');
        try {
            const payload = n8nIntegration.prepareIntelligencePayload([sampleLead], searchMetadata);
            console.log(JSON.stringify(payload, null, 2));
        } catch (payloadError) {
            console.error('Could not generate payload:', payloadError.message);
        }
    }
    
    console.log('\n🔧 WEBHOOK TROUBLESHOOTING:');
    console.log('===========================');
    console.log('1. ✅ Verify n8n webhook URL is correct');
    console.log('2. ✅ Check if webhook is active in n8n');
    console.log('3. ✅ Ensure webhook accepts POST requests');
    console.log('4. ✅ Verify JSON content-type is supported');
    console.log('5. ✅ Check n8n workflow is published/active');
    
    console.log('\n📊 EXPECTED PAYLOAD FIELDS:');
    console.log('===========================');
    console.log('• timestamp: ISO date');
    console.log('• source: Platform identifier');
    console.log('• searchMetadata: Query context');
    console.log('• intelligence: Aggregate statistics');
    console.log('• leads: Array of processed leads');
    console.log('• processingStats: Summary metrics');
    
    console.log('\n📝 n8n WORKFLOW SETUP:');
    console.log('======================');
    console.log('1. Create webhook trigger node');
    console.log('2. Set HTTP method to POST');
    console.log('3. Enable JSON body parsing');
    console.log('4. Add data processing nodes');
    console.log('5. Connect to CRM/email systems');
    console.log('6. Test with sample payload above');
}

testN8nWebhookConnection();