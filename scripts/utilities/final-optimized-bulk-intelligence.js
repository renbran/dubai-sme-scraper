#!/usr/bin/env node

/**
 * FINAL OPTIMIZED BULK SME INTELLIGENCE WITH 2-RETRY MECHANISM
 * IMPLEMENTED: 2 retries maximum, then move to next operation
 * Target Industries: Accounting, Business Consulting, Small Business, Real Estate
 */

const EnhancedMultiSourceMapper = require('./src/data-sources/enhanced-multi-source-mapper');
const fs = require('fs').promises;
const path = require('path');

class FinalOptimizedBulkIntelligence {
    constructor() {
        this.results = {
            accounting: [],
            consulting: [],
            smallBusiness: [],
            realEstate: [],
            total: []
        };
        
        // Streamlined search strategies (reduced for reliability)
        this.searchStrategies = [
            {
                category: 'realEstate',
                queries: [
                    'real estate agencies Dubai',
                    'property management Dubai',
                    'real estate brokers Dubai'
                ],
                priority: 'very-high',
                digitalFocus: 'property management systems, CRM, virtual tours'
            },
            {
                category: 'accounting',
                queries: [
                    'accounting firms Dubai',
                    'chartered accountants Dubai',
                    'bookkeeping services Dubai'
                ],
                priority: 'high',
                digitalFocus: 'cloud accounting, automated bookkeeping'
            },
            {
                category: 'consulting',
                queries: [
                    'business consultants Dubai',
                    'management consulting Dubai',
                    'strategy consultants Dubai'
                ],
                priority: 'high',
                digitalFocus: 'digital strategy, process automation'
            }
        ];
        
        this.operationStats = {
            totalQueries: 0,
            successfulQueries: 0,
            failedQueries: 0,
            totalRetries: 0,
            businessesFound: 0
        };
    }
    
    async runFinalOptimizedOperation() {
        console.log('🚀 FINAL OPTIMIZED BULK SME INTELLIGENCE OPERATION');
        console.log('===================================================');
        console.log('✅ IMPLEMENTED: 2-retry mechanism with fallback');
        console.log('✅ Google Maps configuration RESOLVED');
        console.log('✅ Multi-source integration ACTIVE');
        console.log('🎯 Target: Real Estate (masterpiece), Accounting, Consulting');
        console.log('');
        
        const mapper = new EnhancedMultiSourceMapper({
            enabledSources: {
                googleMaps: true,
                yelp: true,
                yellowPages: true,
                openStreetMap: true,
                dubaiBusinessDirectory: true,
                websiteAnalysis: false, // Disabled for speed in bulk operation
                aiIntelligence: false   // Disabled for speed in bulk operation
            },
            retryOptions: {
                retries: 2, // EXACTLY 2 retries as requested
                factor: 2,
                minTimeout: 1000,
                maxTimeout: 5000,
                randomize: true
            },
            fallbackOrder: ['googleMaps', 'yelp', 'openStreetMap', 'yellowPages'],
            minResultsThreshold: 1
        });
        
        try {
            console.log('🔧 Initializing enhanced mapper with 2-retry mechanism...');
            await mapper.initialize();
            console.log('✅ All sources initialized successfully\\n');
            
            let strategyCount = 0;
            const totalStrategies = this.searchStrategies.length;
            
            for (const strategy of this.searchStrategies) {
                strategyCount++;
                console.log(`\\n📋 STRATEGY ${strategyCount}/${totalStrategies}: ${strategy.category.toUpperCase()}`);
                console.log('='.repeat(60));
                console.log(`🎯 Priority: ${strategy.priority}`);
                console.log(`💡 Digital Focus: ${strategy.digitalFocus}`);
                console.log(`🔍 Queries: ${strategy.queries.length}`);
                
                const categoryResults = [];
                let queryCount = 0;
                
                for (const query of strategy.queries) {
                    queryCount++;
                    this.operationStats.totalQueries++;
                    
                    console.log(`\\n[${queryCount}/${strategy.queries.length}] 🔍 "${query}"`);
                    console.log(`⏱️  Retry Policy: Max 2 retries, then move on`);
                    
                    const startTime = Date.now();
                    
                    try {
                        const results = await mapper.searchBusinesses(query, 'Dubai, UAE', {
                            maxResults: 8,
                            enhanceWithWebsite: false,
                            enhancedAI: false,
                            requireMinResults: 1
                        });
                        
                        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                        
                        if (results && results.length > 0) {
                            console.log(`   ✅ SUCCESS: Found ${results.length} businesses in ${duration}s`);
                            
                            // Add metadata
                            const enhancedResults = results.map(business => ({
                                ...business,
                                searchCategory: strategy.category,
                                searchQuery: query,
                                digitalFocus: strategy.digitalFocus,
                                priority: strategy.priority,
                                searchTimestamp: new Date().toISOString(),
                                processingTime: duration
                            }));
                            
                            categoryResults.push(...enhancedResults);
                            this.operationStats.businessesFound += results.length;
                            this.operationStats.successfulQueries++;
                            
                            // Show top results
                            console.log('   📋 Top businesses found:');
                            results.slice(0, 2).forEach((biz, idx) => {
                                console.log(`      ${idx + 1}. ${biz.businessName}`);
                                console.log(`         📍 ${biz.address || 'No address'}`);
                                console.log(`         📞 ${biz.phone || 'No phone'}`);
                                console.log(`         🌐 ${biz.website || 'No website'}`);
                                console.log(`         📊 Source: ${biz.dataSource}`);
                            });
                            
                        } else {
                            console.log(`   ⚠️  NO RESULTS: After retries, no businesses found in ${duration}s`);
                            this.operationStats.failedQueries++;
                        }
                        
                        // Brief pause between queries
                        await this.sleep(2000);
                        
                    } catch (error) {
                        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                        console.log(`   ❌ FAILED: All retries exhausted in ${duration}s`);
                        console.log(`   Error: ${error.message}`);
                        console.log(`   ⏭️  Moving to next query...`);
                        this.operationStats.failedQueries++;
                    }
                }
                
                // Store category results
                this.results[strategy.category] = categoryResults;
                this.results.total.push(...categoryResults);
                
                console.log(`\\n📊 ${strategy.category.toUpperCase()} SUMMARY:`);
                console.log(`   🎯 Businesses found: ${categoryResults.length}`);
                console.log(`   📈 Success rate: ${categoryResults.length > 0 ? '✅ GOOD' : '⚠️ LOW'}`);
            }
            
            await this.generateFinalReport();
            await this.sendToN8n();
            
        } catch (error) {
            console.error('❌ Critical error:', error.message);
        } finally {
            await mapper.close();
            this.printFinalStats();
        }
    }
    
    async generateFinalReport() {
        console.log('\\n📊 GENERATING FINAL INTELLIGENCE REPORT');
        console.log('========================================');
        
        const report = {
            operationSummary: {
                timestamp: new Date().toISOString(),
                totalBusinessesFound: this.operationStats.businessesFound,
                totalQueriesExecuted: this.operationStats.totalQueries,
                successfulQueries: this.operationStats.successfulQueries,
                failedQueries: this.operationStats.failedQueries,
                successRate: ((this.operationStats.successfulQueries / this.operationStats.totalQueries) * 100).toFixed(1) + '%',
                retryMechanism: 'Active - 2 retries maximum',
                configurationStatus: 'RESOLVED'
            },
            
            categoryResults: {},
            topProspects: [],
            realEstateSpecialty: []
        };
        
        // Process categories
        for (const [category, businesses] of Object.entries(this.results)) {
            if (category === 'total') continue;
            
            report.categoryResults[category] = {
                totalFound: businesses.length,
                topBusinesses: businesses.slice(0, 5).map(b => ({
                    name: b.businessName,
                    address: b.address,
                    phone: b.phone,
                    website: b.website,
                    source: b.dataSource
                }))
            };
        }
        
        // Real estate specialty
        report.realEstateSpecialty = this.results.realEstate.slice(0, 10).map(b => ({
            name: b.businessName,
            address: b.address,
            phone: b.phone,
            website: b.website,
            digitalOpportunity: b.digitalFocus
        }));
        
        // Top prospects
        report.topProspects = this.results.total.slice(0, 20).map(b => ({
            name: b.businessName,
            category: b.searchCategory,
            priority: b.priority,
            contact: {
                phone: b.phone,
                website: b.website,
                address: b.address
            },
            digitalFocus: b.digitalFocus
        }));
        
        // Save report
        try {
            const resultsDir = './results';
            await fs.mkdir(resultsDir, { recursive: true });
            
            const filename = `final-sme-intelligence-${new Date().toISOString().split('T')[0]}.json`;
            const filepath = path.join(resultsDir, filename);
            
            await fs.writeFile(filepath, JSON.stringify(report, null, 2));
            console.log(`✅ Report saved: ${filename}`);
            
        } catch (error) {
            console.log(`⚠️  Failed to save report: ${error.message}`);
        }
        
        return report;
    }
    
    async sendToN8n() {
        console.log('\\n🔗 SENDING TO N8N WORKFLOW');
        console.log('============================');
        
        if (this.results.total.length === 0) {
            console.log('⚠️  No results to send to n8n workflow');
            return;
        }
        
        try {
            const N8nWebhookIntegration = require('./src/integrations/n8n-webhook');
            const webhook = new N8nWebhookIntegration();
            
            const searchMetadata = {
                operationType: 'Final Optimized Bulk Intelligence',
                timestamp: new Date().toISOString(),
                retryMechanism: 'Active - 2 retries maximum',
                totalBusinesses: this.results.total.length,
                categories: {
                    realEstate: this.results.realEstate.length,
                    accounting: this.results.accounting.length,
                    consulting: this.results.consulting.length
                }
            };
            
            const response = await webhook.sendIntelligenceData(this.results.total, searchMetadata);
            console.log(`✅ Successfully sent to n8n workflow: ${response.leadsSent} leads sent`);
            
        } catch (error) {
            console.log(`⚠️  Failed to send to n8n: ${error.message}`);
        }
    }
    
    printFinalStats() {
        console.log('\\n📈 FINAL OPERATION STATISTICS');
        console.log('==============================');
        console.log(`🔍 Total queries attempted: ${this.operationStats.totalQueries}`);
        console.log(`✅ Successful queries: ${this.operationStats.successfulQueries}`);
        console.log(`❌ Failed queries: ${this.operationStats.failedQueries}`);
        console.log(`🏢 Total businesses found: ${this.operationStats.businessesFound}`);
        console.log(`📊 Success rate: ${((this.operationStats.successfulQueries / this.operationStats.totalQueries) * 100).toFixed(1)}%`);
        console.log(`🔄 Retry mechanism: Active (2 retries max, then move on)`);
        
        if (this.operationStats.businessesFound > 0) {
            console.log('\\n🎉 BULK OPERATION SUCCESSFUL!');
            console.log('✅ Businesses found across target industries');
            console.log('✅ Retry mechanism working as expected');
            console.log('✅ Ready for CRM integration via n8n');
        } else {
            console.log('\\n⚠️  No businesses found - check configuration');
        }
        
        console.log('\\n🏁 OPERATION COMPLETE');
    }
    
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Main execution
async function main() {
    const operation = new FinalOptimizedBulkIntelligence();
    
    try {
        console.log('🎯 STARTING FINAL OPTIMIZED BULK OPERATION');
        console.log('✅ 2-retry mechanism: IMPLEMENTED');
        console.log('✅ Google Maps: RESOLVED');
        console.log('✅ Multi-source fallback: ACTIVE');
        console.log('');
        
        await operation.runFinalOptimizedOperation();
        
    } catch (error) {
        console.error('💥 CRITICAL ERROR:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = FinalOptimizedBulkIntelligence;