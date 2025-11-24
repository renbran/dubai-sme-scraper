#!/usr/bin/env node

/**
 * Quick AI-Enhanced Dubai SME Scraper
 * Fast collection with AI intelligence for lead scoring
 */

const GoogleMapsScraper = require('./src/scraper');
const AIBusinessIntelligence = require('./src/ai-intelligence');
const fs = require('fs');
const path = require('path');

async function runQuickAITest() {
    console.log('🚀 Quick AI-Enhanced Test - Dubai Real Estate SMEs');
    console.log('==================================================');
    
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
        
        // Step 1: Generate AI-optimized queries (limited for quick test)
        console.log('\n🧠 Generating AI-optimized search queries...');
        const queries = await ai.generateSearchQueries({
            businessType: 'real estate companies and property consultants',
            location: 'Dubai Marina and Business Bay'
        });
        
        console.log(`🎯 AI generated ${queries.length} queries. Using first 3 for quick test.`);
        
        let allBusinesses = [];
        const testQueries = queries.slice(0, 3); // Quick test with first 3 queries
        
        for (let i = 0; i < testQueries.length; i++) {
            const query = testQueries[i];
            console.log(`\n🔍 [${i + 1}/${testQueries.length}] "${query}"`);
            
            try {
                const results = await scraper.searchBusinesses(query);
                if (results && results.length > 0) {
                    const contextualResults = results.map(business => ({
                        ...business,
                        searchQuery: query,
                        businessSegment: 'Real Estate'
                    }));
                    
                    allBusinesses.push(...contextualResults);
                    console.log(`   ✅ Found ${results.length} businesses`);
                    
                    // Show first business found
                    if (results[0]) {
                        console.log(`   📊 Sample: ${results[0].businessName}`);
                        console.log(`   📧 Email: ${results[0].email || 'Not found'}`);
                        console.log(`   📞 Phone: ${results[0].phone || 'Not found'}`);
                    }
                } else {
                    console.log(`   ❌ No results`);
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.log(`   ❌ Query failed: ${error.message}`);
            }
        }
        
        // Remove duplicates
        const uniqueBusinesses = allBusinesses.filter((business, index, arr) => 
            arr.findIndex(b => b.businessName === business.businessName) === index
        );
        
        console.log(`\n📊 Collection Complete: ${uniqueBusinesses.length} unique businesses found`);
        
        if (uniqueBusinesses.length > 0) {
            console.log('\n🧠 Running AI Analysis & Lead Scoring...');
            
            // Process first 3 businesses for quick AI demo
            const testBusinesses = uniqueBusinesses.slice(0, 3);
            const aiEnhancedBusinesses = [];
            
            for (let i = 0; i < testBusinesses.length; i++) {
                const business = testBusinesses[i];
                console.log(`\n🔍 [${i + 1}/${testBusinesses.length}] Analyzing: ${business.businessName}`);
                
                try {
                    // AI Classification
                    const classified = await ai.classifyBusiness(business);
                    
                    // AI Enhancement  
                    const enhanced = await ai.enhanceBusinessData(classified);
                    
                    // Calculate composite score
                    const compositeScore = ai.calculateCompositeScore(enhanced);
                    enhanced.compositeLeadScore = compositeScore;
                    
                    aiEnhancedBusinesses.push(enhanced);
                    
                    console.log(`   🎯 Business Size: ${enhanced.aiClassification?.businessSize}`);
                    console.log(`   📊 Lead Score: ${enhanced.aiClassification?.leadQualityScore}/100`);
                    console.log(`   🏆 Composite Score: ${compositeScore}/100`);
                    console.log(`   💡 AI Insight: ${enhanced.aiClassification?.keyInsights?.substring(0, 100)}...`);
                    
                } catch (error) {
                    console.log(`   ⚠️ AI analysis failed: ${error.message}`);
                    aiEnhancedBusinesses.push({ ...business, compositeLeadScore: 50 });
                }
            }
            
            // Sort by composite score
            const rankedLeads = aiEnhancedBusinesses.sort((a, b) => 
                (b.compositeLeadScore || 0) - (a.compositeLeadScore || 0)
            );
            
            console.log('\n🏆 AI ANALYSIS RESULTS:');
            console.log('========================');
            console.log(`📊 Total Analyzed: ${rankedLeads.length} businesses`);
            console.log(`🏢 SME Businesses: ${rankedLeads.filter(b => b.aiClassification?.businessSize === 'SME').length}`);
            console.log(`🎯 High-Quality Leads (Score ≥70): ${rankedLeads.filter(b => b.compositeLeadScore >= 70).length}`);
            console.log(`📧 Businesses with Email: ${rankedLeads.filter(b => b.email).length}`);
            console.log(`📱 Businesses with Social Media: ${rankedLeads.filter(b => b.socialMedia && Object.keys(b.socialMedia).length > 0).length}`);
            
            // Show top leads
            console.log('\n🥇 TOP LEADS:');
            rankedLeads.forEach((business, index) => {
                console.log(`\n${index + 1}. ${business.businessName}`);
                console.log(`   🎯 Composite Score: ${business.compositeLeadScore}/100`);
                console.log(`   🏢 Business Size: ${business.aiClassification?.businessSize || 'Unknown'}`);
                console.log(`   📧 Email: ${business.email || 'Not found'}`);
                console.log(`   📞 Phone: ${business.phone || 'Not found'}`);
                console.log(`   🌐 Website: ${business.website || 'Not found'}`);
                if (business.socialMedia && Object.keys(business.socialMedia).length > 0) {
                    console.log(`   📱 Social Media: ${Object.keys(business.socialMedia).join(', ')}`);
                }
            });
            
            // Save results
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const resultsDir = './results';
            if (!fs.existsSync(resultsDir)) {
                fs.mkdirSync(resultsDir);
            }
            
            const aiResultsFile = path.join(resultsDir, `ai-quick-test-${timestamp}.json`);
            fs.writeFileSync(aiResultsFile, JSON.stringify(rankedLeads, null, 2));
            
            console.log(`\n💾 AI-enhanced results saved to: ${aiResultsFile}`);
            
        } else {
            console.log('❌ No businesses found for AI analysis');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await scraper.close();
        console.log('\n🎉 Quick AI test completed!');
        console.log('\n📝 Key Benefits Demonstrated:');
        console.log('✅ AI-generated optimized search queries');
        console.log('✅ Intelligent business classification (SME vs Enterprise)');
        console.log('✅ Advanced lead scoring and ranking');
        console.log('✅ Enhanced data extraction with AI insights');
        console.log('✅ Email and social media detection');
        console.log('\n🚀 Ready for full-scale production scraping!');
    }
}

runQuickAITest();