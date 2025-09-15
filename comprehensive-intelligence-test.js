#!/usr/bin/env node

/**
 * Comprehensive Multi-Source Business Intelligence Test
 * Demonstrates the full B2B lead generation and competitive intelligence platform
 */

const MultiSourceDataAggregator = require('./src/data-sources/multi-source-aggregator');
const fs = require('fs');
const path = require('path');

async function convertToEnhancedCSV(businesses, filename) {
    const headers = [
        // Basic Business Info
        'businessName', 'category', 'address', 'area', 'emirate', 'phone', 'email', 'website',
        'rating', 'reviewCount', 'latitude', 'longitude',
        
        // AI Classification
        'businessSize', 'industryCategory', 'targetMarket', 'companyStage',
        
        // Lead Scoring
        'leadScore', 'leadPriority', 'digitalMaturityLevel', 'securityLevel',
        
        // Technology Analysis
        'websiteTechScore', 'performanceScore', 'hasSSL', 'hasCDN', 'cmsDetected',
        
        // Data Quality
        'dataQualityScore', 'verificationStatus', 'confidence', 'dataSources',
        
        // Insights
        'keyInsights', 'recommendations', 'estimatedEmployees'
    ];
    
    const csvRows = [headers.join(',')];
    
    businesses.forEach(business => {
        const row = headers.map(header => {
            let value = '';
            
            switch (header) {
                // Basic info
                case 'businessSize':
                    value = business.aiClassification?.businessSize || '';
                    break;
                case 'industryCategory':
                    value = business.aiClassification?.industryCategory || '';
                    break;
                case 'targetMarket':
                    value = business.aiClassification?.targetMarket || '';
                    break;
                case 'companyStage':
                    value = business.aiClassification?.companyStage || '';
                    break;
                
                // Lead scoring
                case 'leadScore':
                    value = business.leadScoring?.totalScore || '';
                    break;
                case 'leadPriority':
                    value = business.leadScoring?.priority || '';
                    break;
                case 'digitalMaturityLevel':
                    value = business.websiteAnalysis?.digitalMaturity?.level || '';
                    break;
                case 'securityLevel':
                    value = business.websiteAnalysis?.security?.level || '';
                    break;
                
                // Technology
                case 'websiteTechScore':
                    value = business.websiteAnalysis?.digitalMaturity?.breakdown?.technology || '';
                    break;
                case 'performanceScore':
                    value = business.websiteAnalysis?.performance?.score || '';
                    break;
                case 'hasSSL':
                    value = business.websiteAnalysis?.security?.measures?.ssl ? 'Yes' : 'No';
                    break;
                case 'hasCDN':
                    value = business.websiteAnalysis?.security?.measures?.cdn ? 'Yes' : 'No';
                    break;
                case 'cmsDetected':
                    value = business.websiteAnalysis?.technologies?.meta?.cms || '';
                    break;
                
                // Data quality
                case 'confidence':
                    value = business.confidence || '';
                    break;
                case 'dataSources':
                    value = business.dataSources?.join('; ') || business.dataSource || '';
                    break;
                
                // Insights
                case 'keyInsights':
                    value = business.aiClassification?.keyInsights?.substring(0, 100) || '';
                    break;
                case 'recommendations':
                    value = business.leadScoring?.recommendations?.slice(0, 2).join('; ') || '';
                    break;
                case 'estimatedEmployees':
                    value = business.aiEnhancements?.estimatedEmployees || '';
                    break;
                
                // Location details
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
                
                default:
                    value = business[header] || '';
            }
            
            // Escape CSV values
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

async function runComprehensiveIntelligenceTest() {
    console.log('🚀 COMPREHENSIVE B2B INTELLIGENCE PLATFORM TEST');
    console.log('==============================================');
    
    const aggregator = new MultiSourceDataAggregator({
        enabledSources: {
            googleMaps: true,
            yelp: true,
            websiteAnalysis: true,
            aiIntelligence: true
        },
        dedupThreshold: 0.8,
        maxConcurrent: 3
    });
    
    try {
        // Initialize all data sources
        await aggregator.initialize();
        
        console.log('\n🎯 TARGET: Real Estate & Property Management (High Cybersecurity Need)');
        console.log('====================================================================');
        
        // Comprehensive search with all enhancements
        const searchResults = await aggregator.searchBusinesses(
            'real estate property management Dubai',
            'Dubai, UAE',
            {
                maxResults: 15,
                enhanceWithWebsite: true,
                minScore: 40, // Only leads with decent potential
                minPriority: 'Medium-Low'
            }
        );
        
        if (searchResults && searchResults.length > 0) {
            // Generate comprehensive report
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const resultsDir = './results';
            if (!fs.existsSync(resultsDir)) {
                fs.mkdirSync(resultsDir);
            }
            
            const jsonFile = path.join(resultsDir, `comprehensive-intelligence-${timestamp}.json`);
            const csvFile = path.join(resultsDir, `comprehensive-intelligence-${timestamp}.csv`);
            
            // Save detailed JSON
            fs.writeFileSync(jsonFile, JSON.stringify(searchResults, null, 2));
            
            // Save enhanced CSV
            await convertToEnhancedCSV(searchResults, csvFile);
            
            // Generate intelligence report
            console.log('\n📊 COMPREHENSIVE INTELLIGENCE REPORT');
            console.log('===================================');
            
            const stats = aggregator.getStats();
            console.log(`🔍 Data Sources: ${Object.keys(stats.sources).join(', ')}`);
            console.log(`📈 Collection Efficiency: ${stats.efficiency}%`);
            console.log(`📊 Total Unique Leads: ${searchResults.length}`);
            
            // Lead Quality Analysis
            const highPriority = searchResults.filter(b => b.leadScoring?.priority === 'High');
            const mediumHigh = searchResults.filter(b => b.leadScoring?.priority === 'Medium-High');
            const smeBusinesses = searchResults.filter(b => b.aiClassification?.businessSize === 'SME');
            const withWebsites = searchResults.filter(b => b.website);
            const outdatedTech = searchResults.filter(b => 
                b.websiteAnalysis?.digitalMaturity?.level === 'Outdated' || 
                b.websiteAnalysis?.digitalMaturity?.level === 'Basic'
            );
            const lowSecurity = searchResults.filter(b => 
                b.websiteAnalysis?.security?.level === 'Low' || 
                b.websiteAnalysis?.security?.level === 'Basic'
            );
            
            console.log('\n🎯 LEAD QUALITY BREAKDOWN:');
            console.log(`🔥 High Priority Leads: ${highPriority.length} (${Math.round(highPriority.length/searchResults.length*100)}%)`);
            console.log(`⭐ Medium-High Priority: ${mediumHigh.length} (${Math.round(mediumHigh.length/searchResults.length*100)}%)`);
            console.log(`🏢 SME Businesses: ${smeBusinesses.length} (${Math.round(smeBusinesses.length/searchResults.length*100)}%)`);
            console.log(`🌐 With Websites: ${withWebsites.length} (${Math.round(withWebsites.length/searchResults.length*100)}%)`);
            console.log(`⚠️  Outdated Technology: ${outdatedTech.length} (${Math.round(outdatedTech.length/searchResults.length*100)}%)`);
            console.log(`🔒 Low Security: ${lowSecurity.length} (${Math.round(lowSecurity.length/searchResults.length*100)}%)`);
            
            console.log('\n💾 FILES GENERATED:');
            console.log(`📄 Detailed Data: ${jsonFile}`);
            console.log(`📊 Analysis CSV: ${csvFile}`);
            
            console.log('\n🥇 TOP 5 HIGH-VALUE PROSPECTS:');
            console.log('=============================');
            
            const topLeads = searchResults
                .filter(b => b.leadScoring?.totalScore >= 60)
                .slice(0, 5);
            
            topLeads.forEach((business, index) => {
                console.log(`\n${index + 1}. ${business.businessName}`);
                console.log(`   🎯 Lead Score: ${business.leadScoring?.totalScore}/100 (${business.leadScoring?.priority})`);
                console.log(`   🏢 Business Type: ${business.aiClassification?.businessSize} ${business.aiClassification?.industryCategory}`);
                console.log(`   💻 Digital Maturity: ${business.websiteAnalysis?.digitalMaturity?.level || 'Unknown'}`);
                console.log(`   🔒 Security Level: ${business.websiteAnalysis?.security?.level || 'Unknown'}`);
                console.log(`   📍 Location: ${business.locationDetails?.area || business.address || 'Unknown'}`);
                console.log(`   📞 Contact: ${business.phone || 'Not found'} | ${business.email || 'Not found'}`);
                console.log(`   🌐 Website: ${business.website || 'Not found'}`);
                
                if (business.leadScoring?.recommendations?.length > 0) {
                    console.log(`   💡 Key Recommendation: ${business.leadScoring.recommendations[0]}`);
                }
            });
            
            console.log('\n🔍 COMPETITIVE INTELLIGENCE INSIGHTS:');
            console.log('====================================');
            
            // Technology stack analysis
            const techAnalysis = {};
            searchResults.forEach(business => {
                if (business.websiteAnalysis?.technologies) {
                    Object.keys(business.websiteAnalysis.technologies).forEach(tech => {
                        if (tech !== 'meta') {
                            techAnalysis[tech] = (techAnalysis[tech] || 0) + 1;
                        }
                    });
                }
            });
            
            console.log('📊 Technology Stack Distribution:');
            Object.entries(techAnalysis)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .forEach(([tech, count]) => {
                    console.log(`   ${tech}: ${count} businesses (${Math.round(count/searchResults.length*100)}%)`);
                });
            
            // Market opportunity analysis
            const totalOpportunity = searchResults.reduce((sum, business) => 
                sum + (business.leadScoring?.totalScore || 0), 0
            );
            const avgOpportunity = Math.round(totalOpportunity / searchResults.length);
            
            console.log('\n📈 MARKET OPPORTUNITY:');
            console.log(`🎯 Average Lead Score: ${avgOpportunity}/100`);
            console.log(`💰 High-Value Prospects: ${highPriority.length + mediumHigh.length} businesses`);
            console.log(`🏆 Immediate Opportunities: ${searchResults.filter(b => b.leadScoring?.totalScore >= 80).length} businesses`);
            
        } else {
            console.log('❌ No businesses found');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await aggregator.close();
        console.log('\n🎉 Comprehensive intelligence test completed!');
    }
}

runComprehensiveIntelligenceTest();