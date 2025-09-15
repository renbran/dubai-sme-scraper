#!/usr/bin/env node

/**
 * Comprehensive Intelligence Test with n8n Integration
 * Demonstrates the full B2B platform with automated workflow integration
 */

const MultiSourceDataAggregator = require('./src/data-sources/multi-source-aggregator');
const N8nWebhookIntegration = require('./src/integrations/n8n-webhook');
const fs = require('fs');
const path = require('path');

async function convertToEnhancedCSV(businesses, filename) {
    const headers = [
        'businessName', 'category', 'address', 'area', 'emirate', 'phone', 'email', 'website',
        'rating', 'reviewCount', 'latitude', 'longitude', 'businessSize', 'industryCategory',
        'leadScore', 'leadPriority', 'digitalMaturityLevel', 'securityLevel', 'dataQualityScore',
        'verificationStatus', 'confidence', 'recommendations', 'estimatedEmployees'
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
                case 'confidence':
                    value = business.confidence || '';
                    break;
                case 'recommendations':
                    value = business.leadScoring?.recommendations?.slice(0, 1).join('; ') || '';
                    break;
                case 'estimatedEmployees':
                    value = business.aiEnhancements?.estimatedEmployees || '';
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

async function runIntelligenceWithN8nIntegration() {
    console.log('🚀 COMPREHENSIVE B2B INTELLIGENCE WITH n8n AUTOMATION');
    console.log('====================================================');
    
    const aggregator = new MultiSourceDataAggregator({
        enabledSources: {
            googleMaps: true,
            yelp: true,
            websiteAnalysis: true,
            aiIntelligence: true
        }
    });
    
    const n8nIntegration = new N8nWebhookIntegration({
        webhookUrl: 'https://kpajoosus123.app.n8n.cloud/webhook/906ece75-9308-49fb-ab57-3db1375359d0',
        batchSize: 5,
        retryAttempts: 3
    });
    
    try {
        // Initialize platform
        await aggregator.initialize();
        
        console.log('\n🎯 TARGET SEARCH: Tech Companies & Real Estate (High Cybersecurity Need)');
        console.log('======================================================================');
        
        // Search parameters
        const searchQuery = 'technology software real estate Dubai';
        const searchLocation = 'Dubai, UAE';
        const searchTimestamp = new Date().toISOString();
        
        // Comprehensive intelligence search
        const intelligenceResults = await aggregator.searchBusinesses(
            searchQuery,
            searchLocation,
            {
                maxResults: 20,
                enhanceWithWebsite: true,
                minScore: 45,
                minPriority: 'Medium-Low'
            }
        );
        
        if (intelligenceResults && intelligenceResults.length > 0) {
            // Save local results
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const resultsDir = './results';
            if (!fs.existsSync(resultsDir)) {
                fs.mkdirSync(resultsDir);
            }
            
            const jsonFile = path.join(resultsDir, `n8n-intelligence-${timestamp}.json`);
            const csvFile = path.join(resultsDir, `n8n-intelligence-${timestamp}.csv`);
            
            fs.writeFileSync(jsonFile, JSON.stringify(intelligenceResults, null, 2));
            await convertToEnhancedCSV(intelligenceResults, csvFile);
            
            console.log('\n📊 INTELLIGENCE SUMMARY:');
            console.log('=======================');
            console.log(`🎯 Total Qualified Leads: ${intelligenceResults.length}`);
            console.log(`🔥 High Priority: ${intelligenceResults.filter(b => b.leadScoring?.priority === 'High').length}`);
            console.log(`⭐ Medium-High Priority: ${intelligenceResults.filter(b => b.leadScoring?.priority === 'Medium-High').length}`);
            console.log(`🏢 SME Businesses: ${intelligenceResults.filter(b => b.aiClassification?.businessSize === 'SME').length}`);
            
            // Prepare search metadata for n8n
            const searchMetadata = {
                query: searchQuery,
                location: searchLocation,
                timestamp: searchTimestamp,
                platform: 'Dubai-SME-Intelligence-Platform',
                version: '2.0',
                targetIndustries: ['Technology', 'Real Estate', 'Software'],
                searchFilters: {
                    minScore: 45,
                    minPriority: 'Medium-Low',
                    enhancedAnalysis: true
                }
            };
            
            console.log('\n🔗 SENDING TO n8n AUTOMATION WORKFLOW...');
            console.log('=========================================');
            
            // Send to n8n in batches
            const n8nResult = await n8nIntegration.sendLeadsInBatches(intelligenceResults, searchMetadata);
            
            if (n8nResult.successful > 0) {
                console.log('✅ n8n Integration Successful!');
                console.log(`📤 Batches sent: ${n8nResult.successful}/${n8nResult.total}`);
                console.log(`🎯 Total leads sent: ${n8nResult.totalLeadsSent}`);
                
                if (n8nResult.failed > 0) {
                    console.log(`⚠️  Failed batches: ${n8nResult.failed}`);
                    console.log(`🔍 Errors: ${n8nResult.errors.slice(0, 3).join('; ')}`);
                }
            } else {
                console.log('❌ n8n Integration Failed');
                console.log(`🔍 Errors: ${n8nResult.errors.join('; ')}`);
            }
            
            // Show n8n integration statistics
            const n8nStats = n8nIntegration.getStats();
            console.log('\n📈 N8N INTEGRATION STATS:');
            console.log(`📊 Success Rate: ${n8nStats.successRate}%`);
            console.log(`📤 Total Sent: ${n8nStats.totalSent}`);
            console.log(`✅ Successful: ${n8nStats.successful}`);
            console.log(`❌ Failed: ${n8nStats.failed}`);
            console.log(`🔄 Batches: ${n8nStats.batchesSent}`);
            
            console.log('\n💾 LOCAL FILES SAVED:');
            console.log(`📄 Intelligence Data: ${jsonFile}`);
            console.log(`📊 Lead Export: ${csvFile}`);
            
            console.log('\n🏆 TOP PROSPECTS SENT TO n8n:');
            console.log('==============================');
            
            const topProspects = intelligenceResults
                .filter(b => b.leadScoring?.totalScore >= 60)
                .slice(0, 3);
            
            topProspects.forEach((business, index) => {
                console.log(`\n${index + 1}. ${business.businessName}`);
                console.log(`   🎯 Score: ${business.leadScoring?.totalScore}/100 (${business.leadScoring?.priority})`);
                console.log(`   🏢 Type: ${business.aiClassification?.businessSize} ${business.aiClassification?.industryCategory}`);
                console.log(`   📍 Location: ${business.locationDetails?.area || 'Dubai'}`);
                console.log(`   📞 Contact: ${business.phone || 'TBD'} | ${business.email || 'TBD'}`);
                console.log(`   💻 Tech Level: ${business.websiteAnalysis?.digitalMaturity?.level || 'Unknown'}`);
                
                if (business.leadScoring?.recommendations?.length > 0) {
                    console.log(`   💡 Action: ${business.leadScoring.recommendations[0]}`);
                }
            });
            
            console.log('\n🔮 N8N WORKFLOW CAPABILITIES:');
            console.log('=============================');
            console.log('✅ Automatic CRM lead creation');
            console.log('✅ Lead scoring and prioritization');
            console.log('✅ Email sequence automation');
            console.log('✅ Task assignment to sales team');
            console.log('✅ Calendar scheduling integration');
            console.log('✅ Follow-up reminder automation');
            console.log('✅ Reporting and analytics dashboards');
            
            console.log('\n🚀 NEXT STEPS:');
            console.log('==============');
            console.log('1. 📧 Check your n8n workflow for received leads');
            console.log('2. 🎯 Review lead prioritization in your CRM');
            console.log('3. 📅 Automated outreach sequences should start');
            console.log('4. 📊 Monitor conversion metrics in n8n dashboard');
            console.log('5. 🔄 Schedule recurring intelligence scans');
            
        } else {
            console.log('❌ No qualified leads found');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await aggregator.close();
        console.log('\n🎉 Intelligence platform with n8n integration completed!');
    }
}

runIntelligenceWithN8nIntegration();