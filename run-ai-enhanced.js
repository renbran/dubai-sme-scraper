#!/usr/bin/env node

/**
 * AI-Enhanced Dubai SME Scraper
 * Advanced scraper with OpenAI integration for intelligent targeting and classification
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
        'estimatedEmployees',
        'businessModel',
        'marketFocus',
        'digitalMaturity',
        'dataQualityScore',
        'verificationStatus',
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
                case 'estimatedEmployees':
                    value = business.aiEnhancements?.estimatedEmployees || '';
                    break;
                case 'businessModel':
                    value = business.aiEnhancements?.businessModel || '';
                    break;
                case 'marketFocus':
                    value = business.aiEnhancements?.marketFocus || '';
                    break;
                case 'digitalMaturity':
                    value = business.aiEnhancements?.digitalMaturity || '';
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

async function runAIEnhancedScraper() {
    console.log('🚀 Starting AI-Enhanced Dubai SME Scraper...');
    console.log('🧠 Advanced targeting with OpenAI integration');
    console.log('📊 Intelligent lead scoring and classification');
    
    // Initialize AI Intelligence with your API key
    const ai = new AIBusinessIntelligence({
        apiKey: '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',
        model: 'gpt-4o-mini', // Cost-effective model
        enabled: true
    });
    
    if (!ai.isEnabled()) {
        console.log('\n⚠️  OpenAI API key not found!');
        console.log('📝 Please set your OpenAI API key:');
        console.log('   Option 1: Set environment variable: OPENAI_API_KEY=your_key_here');
        console.log('   Option 2: Edit this file and add your key to the AIBusinessIntelligence constructor');
        console.log('\n🔄 Continuing with basic scraping (no AI features)...\n');
    }
    
    const scraper = new GoogleMapsScraper({
        headless: true,
        timeout: 30000
    });
    
    try {
        await scraper.initialize();
        
        // Phase 1: AI-Generated Real Estate Queries
        console.log('\n📈 PHASE 1: AI-Enhanced Real Estate Scraping');
        console.log('==================================================');
        
        const realEstateQueries = await ai.generateSearchQueries({
            businessType: 'real estate companies and property developers',
            location: 'Dubai, UAE'
        });
        
        console.log(`🎯 AI generated ${realEstateQueries.length} optimized queries for real estate`);
        
        let allBusinesses = [];
        
        for (let i = 0; i < realEstateQueries.length; i++) {
            const query = realEstateQueries[i];
            console.log(`\n🔍 [${i + 1}/${realEstateQueries.length}] AI Query: "${query}"`);
            
            try {
                const results = await scraper.searchBusinesses(query);
                if (results && results.length > 0) {
                    // Add query context to results
                    const contextualResults = results.map(business => ({
                        ...business,
                        searchQuery: query,
                        businessSegment: 'Real Estate'
                    }));
                    
                    allBusinesses.push(...contextualResults);
                    console.log(`   ✅ Found ${results.length} businesses`);
                } else {
                    console.log(`   ❌ No results for this query`);
                }
                
                // Brief delay between queries
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.log(`   ❌ Query failed: ${error.message}`);
                continue;
            }
        }
        
        // Remove duplicates
        const uniqueBusinesses = allBusinesses.filter((business, index, arr) => 
            arr.findIndex(b => b.businessName === business.businessName) === index
        );
        
        console.log(`\n📊 Phase 1 Results: ${uniqueBusinesses.length} unique real estate businesses found`);
        
        // Phase 2: AI Enhancement and Lead Scoring
        if (uniqueBusinesses.length > 0) {
            console.log('\n🧠 PHASE 2: AI Business Intelligence & Lead Scoring');
            console.log('==================================================');
            
            const aiEnhancedBusinesses = await ai.scoreAndRankLeads(uniqueBusinesses);
            
            // Filter for high-quality SME leads
            const qualifiedLeads = aiEnhancedBusinesses.filter(business => 
                business.aiClassification?.businessSize === 'SME' &&
                business.compositeLeadScore >= 60
            );
            
            console.log(`\n🎯 AI Analysis Complete:`);
            console.log(`   📊 Total Businesses: ${aiEnhancedBusinesses.length}`);
            console.log(`   🏢 SME Businesses: ${aiEnhancedBusinesses.filter(b => b.aiClassification?.businessSize === 'SME').length}`);
            console.log(`   🎖️ High-Quality Leads (Score ≥60): ${qualifiedLeads.length}`);
            console.log(`   📧 Businesses with Email: ${aiEnhancedBusinesses.filter(b => b.email).length}`);
            console.log(`   📱 Businesses with Social Media: ${aiEnhancedBusinesses.filter(b => b.socialMedia && Object.keys(b.socialMedia).length > 0).length}`);
            
            // Save results
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const resultsDir = './results';
            if (!fs.existsSync(resultsDir)) {
                fs.mkdirSync(resultsDir);
            }
            
            // Save all results
            const allResultsFile = path.join(resultsDir, `ai-enhanced-all-${timestamp}.json`);
            fs.writeFileSync(allResultsFile, JSON.stringify(aiEnhancedBusinesses, null, 2));
            
            // Save qualified leads only
            const qualifiedLeadsFile = path.join(resultsDir, `ai-qualified-leads-${timestamp}.json`);
            fs.writeFileSync(qualifiedLeadsFile, JSON.stringify(qualifiedLeads, null, 2));
            
            // Generate CSV files
            const allCsvFile = path.join(resultsDir, `ai-enhanced-all-${timestamp}.csv`);
            const qualifiedCsvFile = path.join(resultsDir, `ai-qualified-leads-${timestamp}.csv`);
            
            await convertToCSV(aiEnhancedBusinesses, allCsvFile);
            await convertToCSV(qualifiedLeads, qualifiedCsvFile);
            
            console.log(`\n💾 Results saved:`);
            console.log(`   📄 All businesses JSON: ${allResultsFile}`);
            console.log(`   📊 All businesses CSV: ${allCsvFile}`);
            console.log(`   🎯 Qualified leads JSON: ${qualifiedLeadsFile}`);
            console.log(`   📈 Qualified leads CSV: ${qualifiedCsvFile}`);
            
            // Show top 3 leads
            console.log(`\n🏆 TOP 3 QUALIFIED LEADS:`);
            qualifiedLeads.slice(0, 3).forEach((business, index) => {
                console.log(`\n${index + 1}. ${business.businessName}`);
                console.log(`   🎯 Composite Score: ${business.compositeLeadScore}/100`);
                console.log(`   🏢 Size: ${business.aiClassification?.businessSize}`);
                console.log(`   📧 Email: ${business.email || 'Not found'}`);
                console.log(`   📞 Phone: ${business.phone || 'Not found'}`);
                console.log(`   🌐 Website: ${business.website || 'Not found'}`);
                console.log(`   💡 AI Insights: ${business.aiClassification?.keyInsights || 'None'}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Scraper error:', error.message);
    } finally {
        await scraper.close();
        console.log('\n🎉 AI-Enhanced scraping completed!');
    }
}

// Check if we need to prompt for API key
if (!process.env.OPENAI_API_KEY) {
    console.log('\n🔑 OpenAI API Key Setup Required');
    console.log('=====================================');
    console.log('To enable AI features, please set your OpenAI API key:');
    console.log('');
    console.log('Windows: set OPENAI_API_KEY=your_api_key_here');
    console.log('Linux/Mac: export OPENAI_API_KEY=your_api_key_here');
    console.log('');
    console.log('Or edit this file and add your key directly to the AIBusinessIntelligence constructor.');
    console.log('');
    console.log('Continue without AI features? (y/n)');
    
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', (key) => {
        if (key.toString().toLowerCase() === 'y') {
            console.log('Continuing without AI features...\n');
            runAIEnhancedScraper();
        } else {
            console.log('Setup your API key and try again.');
            process.exit(0);
        }
    });
} else {
    runAIEnhancedScraper();
}