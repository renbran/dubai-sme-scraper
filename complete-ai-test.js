#!/usr/bin/env node

/**
 * Complete AI Test with File Output
 * Saves comprehensive AI-enhanced results to JSON and CSV files
 */

const GoogleMapsScraper = require('./src/scraper');
const AIBusinessIntelligence = require('./src/ai-intelligence');
const fs = require('fs');
const path = require('path');

async function convertToCSV(businesses, filename) {
    const headers = [
        'businessName',
        'businessSize',
        'industryCategory',
        'leadQualityScore',
        'compositeLeadScore',
        'category', 
        'address',
        'area',
        'emirate',
        'phone',
        'email',
        'website',
        'facebook',
        'instagram',
        'twitter',
        'linkedin',
        'youtube',
        'whatsapp',
        'rating',
        'reviewCount',
        'latitude',
        'longitude',
        'dataQualityScore',
        'verificationStatus',
        'searchQuery',
        'lastUpdated'
    ];
    
    const csvRows = [headers.join(',')];
    
    businesses.forEach(business => {
        const row = headers.map(header => {
            let value = '';
            
            switch (header) {
                case 'businessSize':
                    value = business.aiClassification?.businessSize || '';
                    break;
                case 'industryCategory':
                    value = business.aiClassification?.industryCategory || '';
                    break;
                case 'leadQualityScore':
                    value = business.aiClassification?.leadQualityScore || '';
                    break;
                case 'compositeLeadScore':
                    value = business.compositeLeadScore || '';
                    break;
                case 'area':
                    value = business.locationDetails?.area || '';
                    break;
                case 'emirate':
                    value = business.locationDetails?.emirate || '';
                    break;
                case 'latitude':
                    value = business.coordinates?.lat || '';
                    break;
                case 'longitude':
                    value = business.coordinates?.lng || '';
                    break;
                case 'facebook':
                    value = business.socialMedia?.facebook || '';
                    break;
                case 'instagram':
                    value = business.socialMedia?.instagram || '';
                    break;
                case 'twitter':
                    value = business.socialMedia?.twitter || '';
                    break;
                case 'linkedin':
                    value = business.socialMedia?.linkedin || '';
                    break;
                case 'youtube':
                    value = business.socialMedia?.youtube || '';
                    break;
                case 'whatsapp':
                    value = business.socialMedia?.whatsapp || '';
                    break;
                default:
                    value = business[header] || '';
            }
            
            if (typeof value === 'string') {
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
            }
            
            return value;
        });
        
        csvRows.push(row.join(','));
    });
    
    fs.writeFileSync(filename, csvRows.join('\n'));
    return businesses.length;
}

async function runCompleteAITest() {
    console.log('🚀 Complete AI-Enhanced Test with File Output');
    console.log('============================================');
    
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
        
        // Generate AI queries for real estate
        console.log('\n🧠 Generating AI-optimized queries...');
        const queries = await ai.generateSearchQueries({
            businessType: 'real estate companies and property agencies',
            location: 'Dubai Marina and Business Bay'
        });
        
        console.log(`🎯 Generated ${queries.length} AI queries. Testing first 2 for comprehensive demo.`);
        
        let allBusinesses = [];
        const testQueries = queries.slice(0, 2);
        
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
                }
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.log(`   ❌ Query failed: ${error.message}`);
            }
        }
        
        // Remove duplicates
        const uniqueBusinesses = allBusinesses.filter((business, index, arr) => 
            arr.findIndex(b => b.businessName === business.businessName) === index
        );
        
        console.log(`\n📊 Collection Complete: ${uniqueBusinesses.length} unique businesses`);
        
        if (uniqueBusinesses.length > 0) {
            console.log('\n🧠 Running AI Analysis & Enhancement...');
            
            const aiEnhancedBusinesses = [];
            
            for (let i = 0; i < uniqueBusinesses.length; i++) {
                const business = uniqueBusinesses[i];
                console.log(`\n🔍 [${i + 1}/${uniqueBusinesses.length}] AI analyzing: ${business.businessName}`);
                
                try {
                    // AI Classification
                    const classified = await ai.classifyBusiness(business);
                    console.log(`   📊 Size: ${classified.aiClassification?.businessSize} | Score: ${classified.aiClassification?.leadQualityScore}/100`);
                    
                    // AI Enhancement  
                    const enhanced = await ai.enhanceBusinessData(classified);
                    
                    // Calculate composite score
                    const compositeScore = ai.calculateCompositeScore(enhanced);
                    enhanced.compositeLeadScore = compositeScore;
                    
                    aiEnhancedBusinesses.push(enhanced);
                    
                } catch (error) {
                    console.log(`   ⚠️ AI analysis failed: ${error.message}`);
                    aiEnhancedBusinesses.push({ ...business, compositeLeadScore: 50 });
                }
            }
            
            // Sort by composite score
            const rankedLeads = aiEnhancedBusinesses.sort((a, b) => 
                (b.compositeLeadScore || 0) - (a.compositeLeadScore || 0)
            );
            
            // Save results
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const resultsDir = './results';
            if (!fs.existsSync(resultsDir)) {
                fs.mkdirSync(resultsDir);
            }
            
            const jsonFile = path.join(resultsDir, `ai-complete-test-${timestamp}.json`);
            const csvFile = path.join(resultsDir, `ai-complete-test-${timestamp}.csv`);
            
            // Save enhanced JSON results
            fs.writeFileSync(jsonFile, JSON.stringify(rankedLeads, null, 2));
            
            // Save enhanced CSV results
            await convertToCSV(rankedLeads, csvFile);
            
            console.log('\n🏆 AI ANALYSIS COMPLETE!');
            console.log('========================');
            console.log(`📊 Total Businesses: ${rankedLeads.length}`);
            console.log(`🏢 SME Businesses: ${rankedLeads.filter(b => b.aiClassification?.businessSize === 'SME').length}`);
            console.log(`🎯 High-Quality Leads (Score ≥70): ${rankedLeads.filter(b => b.compositeLeadScore >= 70).length}`);
            console.log(`📧 With Email: ${rankedLeads.filter(b => b.email).length}`);
            console.log(`📱 With Social Media: ${rankedLeads.filter(b => b.socialMedia && Object.keys(b.socialMedia).length > 0).length}`);
            
            console.log('\n💾 FILES SAVED:');
            console.log(`📄 JSON: ${jsonFile}`);
            console.log(`📊 CSV: ${csvFile}`);
            
            console.log('\n🥇 TOP LEADS:');
            rankedLeads.slice(0, 3).forEach((business, index) => {
                console.log(`\n${index + 1}. ${business.businessName}`);
                console.log(`   🎯 Composite Score: ${business.compositeLeadScore}/100`);
                console.log(`   🏢 Business Size: ${business.aiClassification?.businessSize || 'Unknown'}`);
                console.log(`   📧 Email: ${business.email || 'Not found'}`);
                console.log(`   📞 Phone: ${business.phone || 'Not found'}`);
                console.log(`   🌐 Website: ${business.website || 'Not found'}`);
            });
            
        } else {
            console.log('❌ No businesses found');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await scraper.close();
        console.log('\n🎉 Complete AI test finished!');
    }
}

runCompleteAITest();