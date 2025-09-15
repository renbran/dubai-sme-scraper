#!/usr/bin/env node

/**
 * FOCUSED BULK SME INTELLIGENCE OPERATION
 * Using proven search terms that return results
 * Target: Real Estate (Specialty) + Digital Transformation Candidates
 */

const MultiSourceAggregator = require('./src/data-sources/multi-source-aggregator');
const fs = require('fs').promises;
const path = require('path');

class FocusedBulkOperation {
    constructor() {
        this.allResults = [];
        this.categories = {
            realEstate: [],
            accounting: [],
            consulting: [],
            smallBusiness: [],
            technology: []
        };
        
        // Proven search terms that return results
        this.workingSearches = [
            // Real Estate (Your Specialty - Known Working)
            'real estate Dubai',
            'property management Dubai', 
            'real estate services Dubai',
            'property developers Dubai',
            'real estate companies Dubai',
            
            // Technology & Digital Transformation 
            'technology companies Dubai',
            'software companies Dubai',
            'IT services Dubai',
            'digital services Dubai',
            'tech solutions Dubai',
            
            // Professional Services
            'consulting services Dubai',
            'business services Dubai',
            'professional services Dubai',
            'financial services Dubai',
            'advisory services Dubai',
            
            // Small Business Categories
            'small business Dubai',
            'local companies Dubai',
            'SME Dubai',
            'business solutions Dubai',
            'services Dubai'
        ];
    }
    
    async runFocusedBulkOperation() {
        console.log('🚀 FOCUSED BULK SME INTELLIGENCE OPERATION');
        console.log('==========================================');
        console.log('🎯 Strategy: Use proven search terms + AI categorization');
        console.log('🏢 Focus: Real Estate Specialty + Digital Transformation');
        console.log('📊 Scale: Quality over quantity with working searches');
        console.log('');
        
        const aggregator = new MultiSourceAggregator();
        
        try {
            for (let i = 0; i < this.workingSearches.length; i++) {
                const query = this.workingSearches[i];
                console.log(`\n[${i + 1}/${this.workingSearches.length}] 🔍 "${query}"`);
                console.log('=' .repeat(50));
                
                try {
                    const results = await aggregator.searchBusinesses(query, 'Dubai, UAE', {
                        enhancedAI: true,
                        aiPrompt: `Analyze this Dubai business for digital transformation opportunities. Classify as: 
                        - Real Estate (property management, development, brokerage, investment)
                        - Accounting/Finance (accounting, bookkeeping, financial advisory, tax services)
                        - Consulting (business consulting, management consulting, advisory services)
                        - Small Business (local services, family business, independent operation)
                        - Technology (software, IT services, digital solutions, tech support)
                        
                        Focus on digital maturity, cybersecurity needs, and technology gaps. Rate transformation potential 1-100.`,
                        digitalTransformationFocus: true,
                        maxResults: 15
                    });
                    
                    if (results && results.length > 0) {
                        console.log(`✅ Found ${results.length} qualified businesses`);
                        
                        // Categorize results using AI classification
                        const categorizedResults = this.categorizeBusinesses(results, query);
                        this.allResults.push(...categorizedResults);
                        
                        // Show breakdown
                        const breakdown = this.analyzeResults(categorizedResults);
                        console.log(`📊 Breakdown: RE:${breakdown.realEstate} | AC:${breakdown.accounting} | CO:${breakdown.consulting} | SB:${breakdown.smallBusiness} | TE:${breakdown.technology}`);
                        
                    } else {
                        console.log('⚠️  No results found');
                    }
                    
                    // Delay between searches
                    if (i < this.workingSearches.length - 1) {
                        console.log('⏳ Cooling down...');
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    }
                    
                } catch (error) {
                    console.error(`❌ Error with "${query}":`, error.message);
                }
            }
            
            await this.generateIntelligenceReport();
            await this.sendToN8n();
            
        } catch (error) {
            console.error('❌ Operation error:', error);
        } finally {
            await aggregator.close();
        }
    }
    
    categorizeBusinesses(businesses, searchQuery) {
        return businesses.map(business => {
            const category = this.determineCategory(business, searchQuery);
            const enhanced = {
                ...business,
                searchQuery,
                primaryCategory: category,
                transformationPotential: this.assessTransformationPotential(business),
                searchTimestamp: new Date().toISOString()
            };
            
            // Add to category collections
            if (this.categories[category]) {
                this.categories[category].push(enhanced);
            }
            
            return enhanced;
        });
    }
    
    determineCategory(business, searchQuery) {
        const name = business.businessName?.toLowerCase() || '';
        const category = business.category?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        
        // Real Estate (Your Specialty)
        if (query.includes('real estate') || query.includes('property') || 
            name.includes('real estate') || name.includes('property') ||
            category.includes('real estate') || category.includes('property')) {
            return 'realEstate';
        }
        
        // Technology
        if (query.includes('technology') || query.includes('software') || query.includes('IT') ||
            name.includes('tech') || name.includes('software') || name.includes('IT') ||
            category.includes('technology') || category.includes('software')) {
            return 'technology';
        }
        
        // Accounting/Finance
        if (name.includes('accounting') || name.includes('financial') || name.includes('audit') ||
            category.includes('accounting') || category.includes('financial')) {
            return 'accounting';
        }
        
        // Consulting
        if (query.includes('consulting') || name.includes('consulting') || name.includes('advisory') ||
            category.includes('consulting') || category.includes('advisory')) {
            return 'consulting';
        }
        
        // Default to small business
        return 'smallBusiness';
    }
    
    assessTransformationPotential(business) {
        let score = 0;
        const leadScore = business.leadScoring?.totalScore || 0;
        const digitalMaturity = business.websiteAnalysis?.digitalMaturity?.level;
        const securityLevel = business.websiteAnalysis?.security?.level;
        
        // Base score from lead scoring
        score += leadScore;
        
        // Digital maturity bonus/penalty
        if (digitalMaturity === 'Basic' || digitalMaturity === 'Developing') score += 20;
        if (digitalMaturity === 'Advanced') score -= 10;
        
        // Security level bonus
        if (securityLevel === 'Low' || securityLevel === 'Basic') score += 15;
        
        // Industry multipliers
        const category = business.primaryCategory;
        if (category === 'realEstate') score += 10; // Your specialty
        if (category === 'accounting') score += 8; // High digital need
        if (category === 'technology') score -= 5; // Already digital
        
        return Math.min(100, Math.max(0, score));
    }
    
    analyzeResults(results) {
        const breakdown = {
            realEstate: 0,
            accounting: 0,
            consulting: 0,
            smallBusiness: 0,
            technology: 0
        };
        
        results.forEach(business => {
            const category = business.primaryCategory;
            if (breakdown.hasOwnProperty(category)) {
                breakdown[category]++;
            }
        });
        
        return breakdown;
    }
    
    async generateIntelligenceReport() {
        console.log('\n📊 COMPREHENSIVE INTELLIGENCE REPORT');
        console.log('=====================================');
        
        const totalLeads = this.allResults.length;
        const highPriority = this.allResults.filter(b => b.leadScoring?.priority === 'High').length;
        const avgScore = totalLeads > 0 ? 
            this.allResults.reduce((sum, b) => sum + (b.leadScoring?.totalScore || 0), 0) / totalLeads : 0;
        
        const topTransformationCandidates = this.allResults
            .sort((a, b) => (b.transformationPotential || 0) - (a.transformationPotential || 0))
            .slice(0, 10);
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalLeads,
                highPriorityLeads: highPriority,
                averageLeadScore: Math.round(avgScore),
                searchQueriesUsed: this.workingSearches.length
            },
            categoryBreakdown: {},
            topTransformationCandidates: topTransformationCandidates.map(b => ({
                name: b.businessName,
                category: b.primaryCategory,
                leadScore: b.leadScoring?.totalScore,
                transformationPotential: b.transformationPotential,
                digitalMaturity: b.websiteAnalysis?.digitalMaturity?.level,
                securityLevel: b.websiteAnalysis?.security?.level,
                opportunity: b.leadScoring?.recommendations?.[0],
                contact: {
                    phone: b.phone,
                    email: b.email,
                    website: b.website
                }
            })),
            realEstateSpecialty: this.categories.realEstate.slice(0, 15),
            allLeads: this.allResults
        };
        
        // Category breakdown
        for (const [category, businesses] of Object.entries(this.categories)) {
            const avgCategoryScore = businesses.length > 0 ?
                businesses.reduce((sum, b) => sum + (b.leadScoring?.totalScore || 0), 0) / businesses.length : 0;
            
            report.categoryBreakdown[category] = {
                count: businesses.length,
                averageScore: Math.round(avgCategoryScore),
                highPriority: businesses.filter(b => b.leadScoring?.priority === 'High').length,
                topBusinesses: businesses
                    .sort((a, b) => (b.leadScoring?.totalScore || 0) - (a.leadScoring?.totalScore || 0))
                    .slice(0, 5)
                    .map(b => ({
                        name: b.businessName,
                        score: b.leadScoring?.totalScore,
                        transformationPotential: b.transformationPotential
                    }))
            };
        }
        
        // Save reports
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const jsonPath = path.join(__dirname, 'results', `focused-bulk-intelligence-${timestamp}.json`);
        const csvPath = path.join(__dirname, 'results', `focused-bulk-intelligence-${timestamp}.csv`);
        
        await fs.mkdir(path.dirname(jsonPath), { recursive: true });
        await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
        
        // Generate CSV
        const csvData = this.generateCSV();
        await fs.writeFile(csvPath, csvData);
        
        // Display summary
        console.log(`\n🏆 OPERATION COMPLETE - ${totalLeads} QUALIFIED LEADS FOUND!`);
        console.log('=' .repeat(50));
        console.log(`🏢 Real Estate (Specialty): ${this.categories.realEstate.length}`);
        console.log(`💼 Accounting/Finance: ${this.categories.accounting.length}`);
        console.log(`🤝 Consulting: ${this.categories.consulting.length}`);
        console.log(`🏪 Small Business: ${this.categories.smallBusiness.length}`);
        console.log(`💻 Technology: ${this.categories.technology.length}`);
        console.log(`\n⭐ High Priority Leads: ${highPriority}`);
        console.log(`📊 Average Lead Score: ${Math.round(avgScore)}/100`);
        
        console.log(`\n🔥 TOP TRANSFORMATION CANDIDATES:`);
        console.log('=' .repeat(40));
        topTransformationCandidates.slice(0, 5).forEach((business, i) => {
            console.log(`${i + 1}. ${business.businessName || 'Unknown'}`);
            console.log(`   Category: ${business.primaryCategory} | Score: ${business.leadScoring?.totalScore || 0}`);
            console.log(`   Transformation Potential: ${business.transformationPotential || 0}/100`);
            console.log(`   Opportunity: ${business.leadScoring?.recommendations?.[0] || 'General consultation'}`);
            console.log('');
        });
        
        console.log(`\n📁 Files Generated:`);
        console.log(`   📊 JSON Report: ${jsonPath}`);
        console.log(`   📋 CSV Export: ${csvPath}`);
    }
    
    generateCSV() {
        const headers = [
            'Business Name', 'Primary Category', 'Lead Score', 'Transformation Potential', 'Priority',
            'Phone', 'Email', 'Website', 'Address', 'Digital Maturity', 'Security Level',
            'Industry', 'Business Size', 'Top Recommendation', 'Rating', 'Reviews', 'Search Query'
        ];
        
        const rows = this.allResults.map(business => [
            business.businessName || '',
            business.primaryCategory || '',
            business.leadScoring?.totalScore || '',
            business.transformationPotential || '',
            business.leadScoring?.priority || '',
            business.phone || '',
            business.email || '',
            business.website || '',
            business.address || '',
            business.websiteAnalysis?.digitalMaturity?.level || '',
            business.websiteAnalysis?.security?.level || '',
            business.aiClassification?.industryCategory || '',
            business.aiClassification?.businessSize || '',
            business.leadScoring?.recommendations?.[0] || '',
            business.rating || '',
            business.reviewCount || '',
            business.searchQuery || ''
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }
    
    async sendToN8n() {
        if (this.allResults.length === 0) {
            console.log('\n⚠️  No leads to send to n8n');
            return;
        }
        
        console.log('\n🔗 SENDING TO n8n AUTOMATION...');
        console.log('================================');
        
        const N8nWebhookIntegration = require('./src/integrations/n8n-webhook');
        const n8nIntegration = new N8nWebhookIntegration({
            batchSize: 8
        });
        
        const metadata = {
            operationType: 'focused-bulk-sme-intelligence',
            targetIndustries: ['real-estate-specialty', 'accounting', 'consulting', 'small-business', 'technology'],
            focus: 'digital-transformation-real-estate-specialty',
            timestamp: new Date().toISOString(),
            totalCategories: Object.keys(this.categories).length,
            searchStrategy: 'proven-working-queries'
        };
        
        try {
            const result = await n8nIntegration.sendIntelligenceData(this.allResults, metadata);
            
            console.log('✅ n8n Integration Successful!');
            console.log(`📤 Total leads sent: ${result.leadsSent || this.allResults.length}`);
            console.log(`🎯 Success rate: ${result.success ? '100%' : 'Partial'}`);
            console.log(`🏢 Real Estate leads: ${this.categories.realEstate.length}`);
            console.log(`💼 Professional services: ${this.categories.accounting.length + this.categories.consulting.length}`);
            
        } catch (error) {
            console.error('❌ n8n integration error:', error.message);
        }
    }
}

// Execute focused bulk operation
async function main() {
    const operation = new FocusedBulkOperation();
    await operation.runFocusedBulkOperation();
    
    console.log('\n🎉 FOCUSED BULK INTELLIGENCE OPERATION COMPLETED!');
    console.log('Real Estate specialty leads + Digital transformation candidates ready! 🚀');
}

main().catch(console.error);