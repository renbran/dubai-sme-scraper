#!/usr/bin/env node

/**
 * MAXIMUM BULK SME INTELLIGENCE OPERATION
 * Using the working search pattern to generate massive lead database
 * Focus: Real Estate Specialty + All Target Industries
 */

const MultiSourceAggregator = require('./src/data-sources/multi-source-aggregator');
const fs = require('fs').promises;
const path = require('path');

class MaximumBulkOperation {
    constructor() {
        this.allResults = [];
        this.categories = {
            realEstate: [],
            accounting: [],
            consulting: [],
            technology: [],
            smallBusiness: [],
            finance: [],
            legal: [],
            healthcare: [],
            retail: [],
            manufacturing: []
        };
        
        // Working search combinations (base pattern + industry)
        this.industryTerms = [
            // Real Estate (Your Specialty)
            'real estate',
            'property management', 
            'property development',
            'real estate investment',
            'property consulting',
            'real estate brokerage',
            'property services',
            
            // Accounting & Finance
            'accounting',
            'bookkeeping',
            'financial advisory',
            'tax consulting',
            'auditing',
            'financial services',
            'wealth management',
            
            // Business Consulting
            'business consulting',
            'management consulting', 
            'strategy consulting',
            'business advisory',
            'organizational consulting',
            'process consulting',
            'business development',
            
            // Technology & Digital Services
            'technology',
            'software development',
            'IT services',
            'digital solutions',
            'cybersecurity',
            'cloud services',
            'web development',
            
            // Professional Services
            'legal services',
            'law firms',
            'legal consulting',
            'corporate law',
            'business law',
            
            // Healthcare
            'healthcare services',
            'medical services',
            'healthcare consulting',
            'medical practices',
            
            // Small Business Categories
            'small business services',
            'local services',
            'family business',
            'SME services',
            'business services',
            
            // Retail & E-commerce
            'retail',
            'e-commerce',
            'online business',
            'retail services',
            
            // Manufacturing & Industry
            'manufacturing',
            'industrial services',
            'supply chain',
            'logistics'
        ];
        
        this.locationVariants = [
            'Dubai',
            'Dubai UAE',
            'Business Bay Dubai',
            'Downtown Dubai',
            'DIFC Dubai',
            'Dubai Marina',
            'Jumeirah Dubai',
            'Deira Dubai'
        ];
    }
    
    async runMaximumBulkOperation() {
        console.log('🚀 MAXIMUM BULK SME INTELLIGENCE OPERATION');
        console.log('===========================================');
        console.log(`🎯 Industry Terms: ${this.industryTerms.length}`);
        console.log(`📍 Location Variants: ${this.locationVariants.length}`);
        console.log(`🔍 Total Search Combinations: ${this.industryTerms.length * this.locationVariants.length}`);
        console.log('🏢 Focus: Real Estate Specialty + Complete SME Coverage');
        console.log('📊 Strategy: Maximum Lead Generation with AI Enhancement');
        console.log('');
        
        const aggregator = new MultiSourceAggregator();
        let searchCount = 0;
        const totalSearches = this.industryTerms.length * this.locationVariants.length;
        
        try {
            for (const industry of this.industryTerms) {
                console.log(`\n📋 INDUSTRY FOCUS: ${industry.toUpperCase()}`);
                console.log('=' .repeat(60));
                
                for (const location of this.locationVariants) {
                    searchCount++;
                    const query = `${industry} ${location}`;
                    
                    console.log(`\n[${searchCount}/${totalSearches}] 🔍 "${query}"`);
                    
                    try {
                        const results = await aggregator.searchBusinesses(query, 'Dubai, UAE', {
                            enhancedAI: true,
                            aiPrompt: `Analyze this ${industry} business in Dubai for digital transformation opportunities. 
                            Assess: digital maturity, cybersecurity needs, technology gaps, automation potential, 
                            and modernization requirements. Classify industry category and rate transformation urgency 1-100.
                            Focus on businesses that would benefit from: digital strategy, cybersecurity services, 
                            cloud migration, process automation, website modernization, and IT infrastructure upgrades.`,
                            digitalTransformationFocus: true,
                            industryCategory: industry,
                            maxResults: 20
                        });
                        
                        if (results && results.length > 0) {
                            console.log(`   ✅ Found ${results.length} qualified leads`);
                            
                            const enhancedResults = results.map(business => ({
                                ...business,
                                searchIndustry: industry,
                                searchLocation: location,
                                searchQuery: query,
                                primaryCategory: this.categorizeByIndustry(industry, business),
                                transformationScore: this.calculateTransformationScore(business, industry),
                                searchTimestamp: new Date().toISOString(),
                                bulkOperationId: 'max-bulk-' + new Date().toISOString().split('T')[0]
                            }));
                            
                            this.allResults.push(...enhancedResults);
                            this.categorizeResults(enhancedResults);
                            
                            const highPriority = enhancedResults.filter(b => b.leadScoring?.priority === 'High').length;
                            console.log(`   🎯 High priority: ${highPriority} | Total collected: ${this.allResults.length}`);
                            
                        } else {
                            console.log(`   ⚠️  No results`);
                        }
                        
                        // Smart delay - longer for high-yield searches
                        const delayTime = results && results.length > 5 ? 4000 : 2000;
                        if (searchCount < totalSearches) {
                            await new Promise(resolve => setTimeout(resolve, delayTime));
                        }
                        
                        // Progress checkpoint every 20 searches
                        if (searchCount % 20 === 0) {
                            console.log(`\n📊 CHECKPOINT - Collected ${this.allResults.length} total leads`);
                            await this.saveCheckpoint();
                        }
                        
                    } catch (error) {
                        console.error(`   ❌ Error: ${error.message}`);
                    }
                }
            }
            
            await this.generateMegaReport();
            await this.sendMegaBatchToN8n();
            
        } catch (error) {
            console.error('❌ Maximum operation error:', error);
        } finally {
            await aggregator.close();
        }
    }
    
    categorizeByIndustry(searchIndustry, business) {
        const industry = searchIndustry.toLowerCase();
        const businessName = business.businessName?.toLowerCase() || '';
        const businessCategory = business.category?.toLowerCase() || '';
        
        // Real Estate (Priority Category)
        if (industry.includes('real estate') || industry.includes('property')) {
            return 'realEstate';
        }
        
        // Accounting & Finance
        if (industry.includes('accounting') || industry.includes('financial') || industry.includes('tax') || industry.includes('audit')) {
            return 'accounting';
        }
        
        // Consulting
        if (industry.includes('consulting') || industry.includes('advisory')) {
            return 'consulting';
        }
        
        // Technology
        if (industry.includes('technology') || industry.includes('software') || industry.includes('IT') || industry.includes('cyber')) {
            return 'technology';
        }
        
        // Legal
        if (industry.includes('legal') || industry.includes('law')) {
            return 'legal';
        }
        
        // Finance
        if (industry.includes('wealth') || industry.includes('investment')) {
            return 'finance';
        }
        
        // Healthcare
        if (industry.includes('healthcare') || industry.includes('medical')) {
            return 'healthcare';
        }
        
        // Retail
        if (industry.includes('retail') || industry.includes('commerce')) {
            return 'retail';
        }
        
        // Manufacturing
        if (industry.includes('manufacturing') || industry.includes('industrial')) {
            return 'manufacturing';
        }
        
        return 'smallBusiness';
    }
    
    calculateTransformationScore(business, industry) {
        let score = business.leadScoring?.totalScore || 0;
        
        // Industry-specific bonuses
        const industryBonuses = {
            'real estate': 15,  // Your specialty
            'accounting': 12,   // High digital need
            'legal': 10,        // Traditional industry
            'healthcare': 8,    // Compliance needs
            'manufacturing': 7,
            'retail': 6
        };
        
        const bonus = industryBonuses[industry] || 0;
        score += bonus;
        
        // Digital maturity penalties/bonuses
        const digitalLevel = business.websiteAnalysis?.digitalMaturity?.level;
        if (digitalLevel === 'Basic') score += 20;
        if (digitalLevel === 'Developing') score += 15;
        if (digitalLevel === 'Advanced') score -= 5;
        
        // Security level bonuses
        const securityLevel = business.websiteAnalysis?.security?.level;
        if (securityLevel === 'Low') score += 25;
        if (securityLevel === 'Basic') score += 15;
        
        return Math.min(100, Math.max(0, score));
    }
    
    categorizeResults(results) {
        results.forEach(business => {
            const category = business.primaryCategory;
            if (this.categories[category]) {
                this.categories[category].push(business);
            }
        });
    }
    
    async saveCheckpoint() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const checkpointPath = path.join(__dirname, 'results', `checkpoint-${timestamp}.json`);
        
        await fs.mkdir(path.dirname(checkpointPath), { recursive: true });
        await fs.writeFile(checkpointPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            totalLeads: this.allResults.length,
            categoryBreakdown: Object.fromEntries(
                Object.entries(this.categories).map(([key, value]) => [key, value.length])
            ),
            latestLeads: this.allResults.slice(-10)
        }, null, 2));
        
        console.log(`   💾 Checkpoint saved: ${this.allResults.length} leads`);
    }
    
    async generateMegaReport() {
        console.log('\n📊 GENERATING MEGA INTELLIGENCE REPORT');
        console.log('======================================');
        
        const totalLeads = this.allResults.length;
        const highPriority = this.allResults.filter(b => b.leadScoring?.priority === 'High').length;
        const avgScore = totalLeads > 0 ? 
            this.allResults.reduce((sum, b) => sum + (b.leadScoring?.totalScore || 0), 0) / totalLeads : 0;
        const avgTransformationScore = totalLeads > 0 ?
            this.allResults.reduce((sum, b) => sum + (b.transformationScore || 0), 0) / totalLeads : 0;
        
        // Top transformation candidates
        const topCandidates = this.allResults
            .sort((a, b) => (b.transformationScore || 0) - (a.transformationScore || 0))
            .slice(0, 50);
        
        // Real estate specialty analysis
        const realEstateAnalysis = {
            total: this.categories.realEstate.length,
            highPriority: this.categories.realEstate.filter(b => b.leadScoring?.priority === 'High').length,
            avgScore: this.categories.realEstate.length > 0 ?
                this.categories.realEstate.reduce((sum, b) => sum + (b.leadScoring?.totalScore || 0), 0) / this.categories.realEstate.length : 0,
            topProspects: this.categories.realEstate
                .sort((a, b) => (b.transformationScore || 0) - (a.transformationScore || 0))
                .slice(0, 20)
        };
        
        const megaReport = {
            operationMetadata: {
                timestamp: new Date().toISOString(),
                operationType: 'maximum-bulk-sme-intelligence',
                totalSearches: this.industryTerms.length * this.locationVariants.length,
                focus: 'real-estate-specialty-digital-transformation'
            },
            
            executiveSummary: {
                totalLeadsFound: totalLeads,
                highPriorityLeads: highPriority,
                averageLeadScore: Math.round(avgScore),
                averageTransformationScore: Math.round(avgTransformationScore),
                successRate: totalLeads > 0 ? Math.round((totalLeads / (this.industryTerms.length * this.locationVariants.length)) * 100) : 0
            },
            
            industryBreakdown: Object.fromEntries(
                Object.entries(this.categories).map(([category, businesses]) => [
                    category,
                    {
                        count: businesses.length,
                        percentage: totalLeads > 0 ? Math.round((businesses.length / totalLeads) * 100) : 0,
                        averageScore: businesses.length > 0 ?
                            Math.round(businesses.reduce((sum, b) => sum + (b.leadScoring?.totalScore || 0), 0) / businesses.length) : 0,
                        highPriority: businesses.filter(b => b.leadScoring?.priority === 'High').length,
                        topProspects: businesses
                            .sort((a, b) => (b.transformationScore || 0) - (a.transformationScore || 0))
                            .slice(0, 10)
                            .map(b => ({
                                name: b.businessName,
                                score: b.leadScoring?.totalScore,
                                transformationScore: b.transformationScore,
                                contact: {
                                    phone: b.phone,
                                    email: b.email,
                                    website: b.website
                                }
                            }))
                    }
                ])
            ),
            
            realEstateSpecialtyFocus: realEstateAnalysis,
            
            topTransformationOpportunities: topCandidates.map(business => ({
                name: business.businessName,
                industry: business.searchIndustry,
                category: business.primaryCategory,
                leadScore: business.leadScoring?.totalScore,
                transformationScore: business.transformationScore,
                priority: business.leadScoring?.priority,
                digitalMaturity: business.websiteAnalysis?.digitalMaturity?.level,
                securityLevel: business.websiteAnalysis?.security?.level,
                keyOpportunity: business.leadScoring?.recommendations?.[0],
                contact: {
                    phone: business.phone,
                    email: business.email,
                    website: business.website,
                    address: business.address
                },
                businessIntelligence: {
                    size: business.aiClassification?.businessSize,
                    stage: business.aiClassification?.companyStage,
                    insights: business.aiClassification?.keyInsights
                }
            })),
            
            actionablePriorities: {
                immediate: topCandidates.filter(b => b.transformationScore >= 85).slice(0, 25),
                shortTerm: topCandidates.filter(b => b.transformationScore >= 70 && b.transformationScore < 85).slice(0, 50),
                longTerm: topCandidates.filter(b => b.transformationScore >= 50 && b.transformationScore < 70).slice(0, 100)
            },
            
            completeDatabase: this.allResults
        };
        
        // Save mega report
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportPath = path.join(__dirname, 'results', `mega-sme-intelligence-${timestamp}.json`);
        const csvPath = path.join(__dirname, 'results', `mega-sme-intelligence-${timestamp}.csv`);
        const summaryPath = path.join(__dirname, 'results', `mega-summary-${timestamp}.json`);
        
        await fs.mkdir(path.dirname(reportPath), { recursive: true });
        await fs.writeFile(reportPath, JSON.stringify(megaReport, null, 2));
        await fs.writeFile(summaryPath, JSON.stringify(megaReport.executiveSummary, null, 2));
        
        // Generate comprehensive CSV
        const csvData = this.generateMegaCSV();
        await fs.writeFile(csvPath, csvData);
        
        // Display results
        console.log('\n🏆 MEGA INTELLIGENCE OPERATION COMPLETE!');
        console.log('========================================');
        console.log(`📊 Total SME Leads Found: ${totalLeads}`);
        console.log(`🎯 High Priority Leads: ${highPriority}`);
        console.log(`📈 Average Lead Score: ${Math.round(avgScore)}/100`);
        console.log(`🔄 Average Transformation Score: ${Math.round(avgTransformationScore)}/100`);
        
        console.log('\n📋 INDUSTRY BREAKDOWN:');
        console.log('='.repeat(30));
        Object.entries(this.categories).forEach(([category, businesses]) => {
            console.log(`${category.toUpperCase()}: ${businesses.length} leads`);
        });
        
        console.log('\n🏢 REAL ESTATE SPECIALTY FOCUS:');
        console.log('='.repeat(35));
        console.log(`🎯 Total Real Estate Leads: ${realEstateAnalysis.total}`);
        console.log(`⭐ High Priority: ${realEstateAnalysis.highPriority}`);
        console.log(`📊 Average Score: ${Math.round(realEstateAnalysis.avgScore)}/100`);
        
        console.log('\n🔥 TOP 10 TRANSFORMATION OPPORTUNITIES:');
        console.log('='.repeat(45));
        topCandidates.slice(0, 10).forEach((business, i) => {
            console.log(`${i + 1}. ${business.businessName || 'Unknown'}`);
            console.log(`   Industry: ${business.searchIndustry} | Category: ${business.primaryCategory}`);
            console.log(`   Transformation Score: ${business.transformationScore}/100`);
            console.log(`   Opportunity: ${business.leadScoring?.recommendations?.[0] || 'Consultation needed'}`);
            console.log('');
        });
        
        console.log(`\n📁 Mega Reports Generated:`);
        console.log(`   📊 Complete Database: ${reportPath}`);
        console.log(`   📋 CSV Export: ${csvPath}`);
        console.log(`   📈 Executive Summary: ${summaryPath}`);
        
        return megaReport;
    }
    
    generateMegaCSV() {
        const headers = [
            'Business Name', 'Search Industry', 'Primary Category', 'Lead Score', 'Transformation Score',
            'Priority', 'Phone', 'Email', 'Website', 'Address', 'Digital Maturity', 'Security Level',
            'Business Size', 'Company Stage', 'Top Recommendation', 'Key Insights', 'Rating', 'Reviews',
            'Search Location', 'Search Query', 'Search Timestamp'
        ];
        
        const rows = this.allResults.map(business => [
            business.businessName || '',
            business.searchIndustry || '',
            business.primaryCategory || '',
            business.leadScoring?.totalScore || '',
            business.transformationScore || '',
            business.leadScoring?.priority || '',
            business.phone || '',
            business.email || '',
            business.website || '',
            business.address || '',
            business.websiteAnalysis?.digitalMaturity?.level || '',
            business.websiteAnalysis?.security?.level || '',
            business.aiClassification?.businessSize || '',
            business.aiClassification?.companyStage || '',
            business.leadScoring?.recommendations?.[0] || '',
            business.aiClassification?.keyInsights || '',
            business.rating || '',
            business.reviewCount || '',
            business.searchLocation || '',
            business.searchQuery || '',
            business.searchTimestamp || ''
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }
    
    async sendMegaBatchToN8n() {
        if (this.allResults.length === 0) {
            console.log('\n⚠️  No leads to send to n8n');
            return;
        }
        
        console.log('\n🔗 SENDING MEGA BATCH TO n8n AUTOMATION...');
        console.log('===========================================');
        
        const N8nWebhookIntegration = require('./src/integrations/n8n-webhook');
        const n8nIntegration = new N8nWebhookIntegration({
            batchSize: 10  // Larger batches for bulk operation
        });
        
        const metadata = {
            operationType: 'maximum-bulk-sme-intelligence',
            targetIndustries: this.industryTerms,
            locations: this.locationVariants,
            focus: 'real-estate-specialty-digital-transformation-complete-sme-coverage',
            timestamp: new Date().toISOString(),
            totalLeads: this.allResults.length,
            realEstateLeads: this.categories.realEstate.length,
            searchStrategy: 'comprehensive-industry-location-matrix'
        };
        
        try {
            const result = await n8nIntegration.sendIntelligenceData(this.allResults, metadata);
            
            console.log('✅ Mega n8n Integration Complete!');
            console.log(`📤 Total leads sent: ${result.leadsSent || this.allResults.length}`);
            console.log(`🎯 Success rate: ${result.success ? '100%' : 'Partial'}`);
            console.log(`🏢 Real Estate leads: ${this.categories.realEstate.length}`);
            console.log(`💼 Accounting/Finance: ${this.categories.accounting.length}`);
            console.log(`🤝 Consulting: ${this.categories.consulting.length}`);
            console.log(`💻 Technology: ${this.categories.technology.length}`);
            console.log(`⚖️ Legal: ${this.categories.legal.length}`);
            console.log(`🏥 Healthcare: ${this.categories.healthcare.length}`);
            
        } catch (error) {
            console.error('❌ Mega n8n integration error:', error.message);
        }
    }
}

// Execute maximum bulk operation
async function main() {
    const operation = new MaximumBulkOperation();
    await operation.runMaximumBulkOperation();
    
    console.log('\n🎉 MAXIMUM BULK SME INTELLIGENCE OPERATION COMPLETED!');
    console.log('Real Estate specialty + Complete Dubai SME database ready! 🚀');
    console.log('Your comprehensive lead intelligence platform is now fully loaded! 💪');
}

main().catch(console.error);