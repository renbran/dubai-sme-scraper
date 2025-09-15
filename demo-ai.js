#!/usr/bin/env node

/**
 * Simple AI Demo - Shows OpenAI integration capabilities
 * Run this with your API key to see AI features in action
 */

const AIBusinessIntelligence = require('./src/ai-intelligence');

async function demoAIFeatures() {
    console.log('🧠 AI-Enhanced Dubai SME Scraper Demo');
    console.log('=====================================\n');
    
    // Initialize with your API key
    const ai = new AIBusinessIntelligence({
        apiKey: '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',
        enabled: true
    });
    
    if (!ai.isEnabled()) {
        console.log('❌ OpenAI not enabled. Please add your API key to this script.');
        return;
    }
    
    try {
        // Demo 1: Smart Query Generation
        console.log('🎯 Demo 1: AI-Generated Search Queries');
        console.log('--------------------------------------');
        
        const queries = await ai.generateSearchQueries({
            businessType: 'real estate companies',
            location: 'Dubai Marina'
        });
        
        console.log('Generated queries:');
        queries.forEach((query, index) => {
            console.log(`${index + 1}. ${query}`);
        });
        
        // Demo 2: Business Classification
        console.log('\n🔍 Demo 2: Business Intelligence Classification');
        console.log('----------------------------------------------');
        
        const sampleBusiness = {
            businessName: 'Dubai Properties Investment LLC',
            category: 'Real estate company',
            description: 'Leading property developer in Dubai with over 200 employees',
            address: 'Business Bay, Dubai',
            website: 'https://dubaipropinv.com',
            phone: '+971 4 123 4567',
            reviewCount: 150,
            rating: 4.2
        };
        
        const classified = await ai.classifyBusiness(sampleBusiness);
        
        console.log('Business Analysis:');
        console.log(`📊 Business Size: ${classified.aiClassification.businessSize}`);
        console.log(`🏢 Industry: ${classified.aiClassification.industryCategory}`);
        console.log(`🎯 Lead Score: ${classified.aiClassification.leadQualityScore}/100`);
        console.log(`💡 Insights: ${classified.aiClassification.keyInsights}`);
        
        // Demo 3: Data Enhancement
        console.log('\n🚀 Demo 3: AI Data Enhancement');
        console.log('------------------------------');
        
        const enhanced = await ai.enhanceBusinessData(sampleBusiness);
        
        if (enhanced.aiEnhancements) {
            console.log('Enhanced Data:');
            console.log(`👥 Estimated Employees: ${enhanced.aiEnhancements.estimatedEmployees}`);
            console.log(`🎯 Business Model: ${enhanced.aiEnhancements.businessModel}`);
            console.log(`🌍 Market Focus: ${enhanced.aiEnhancements.marketFocus}`);
            console.log(`💻 Digital Maturity: ${enhanced.aiEnhancements.digitalMaturity}`);
        }
        
        console.log('\n✅ AI Demo completed successfully!');
        console.log('\n📝 Next Steps:');
        console.log('1. Add your OpenAI API key to run-ai-enhanced.js');
        console.log('2. Run: node run-ai-enhanced.js');
        console.log('3. Get intelligent lead scoring and classification!');
        
    } catch (error) {
        console.error('❌ Demo failed:', error.message);
        console.log('\n💡 Make sure your OpenAI API key is valid and has sufficient credits.');
    }
}

demoAIFeatures();