#!/usr/bin/env node

/**
 * Comprehensive Scraping Summary Generator
 * Analyzes all scraped data files and provides complete company count and list
 */

const fs = require('fs');
const path = require('path');

class ComprehensiveScrapingSummary {
    constructor() {
        this.allCompanies = new Map(); // Use Map to avoid duplicates
        this.totalScraped = 0;
        this.categoryBreakdown = {};
        this.sourceBreakdown = {};
    }

    // Load and analyze all JSON files
    async analyzeScrapeResults() {
        console.log('🔍 COMPREHENSIVE SCRAPING ANALYSIS');
        console.log('=================================');

        const files = this.findAllResultFiles();
        
        for (const filePath of files) {
            console.log(`📁 Analyzing: ${path.basename(filePath)}`);
            await this.processFile(filePath);
        }

        this.generateSummary();
    }

    // Find all result files
    findAllResultFiles() {
        const files = [];
        
        // Main directory files
        const mainDir = __dirname;
        const mainFiles = fs.readdirSync(mainDir)
            .filter(f => f.endsWith('.json') && f.includes('dubai'))
            .map(f => path.join(mainDir, f));
        files.push(...mainFiles);

        // Results directory files
        const resultsDir = path.join(mainDir, 'results');
        if (fs.existsSync(resultsDir)) {
            const resultFiles = fs.readdirSync(resultsDir)
                .filter(f => f.endsWith('.json'))
                .map(f => path.join(resultsDir, f));
            files.push(...resultFiles);
        }

        return files;
    }

    // Process individual file
    async processFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);
            const fileName = path.basename(filePath);

            let companies = [];
            let source = 'Unknown';

            // Determine source and extract companies based on file structure
            if (fileName.includes('property-owner')) {
                source = 'Property Owners';
                companies = this.extractPropertyOwners(data);
            } else if (fileName.includes('sme') || fileName.includes('intelligence')) {
                source = 'SME Intelligence';
                companies = this.extractSMECompanies(data);
            } else if (fileName.includes('medical')) {
                source = 'Medical Facilities';
                companies = this.extractMedicalFacilities(data);
            } else if (fileName.includes('test-results')) {
                source = 'Test Results';
                companies = this.extractTestResults(data);
            }

            // Add companies to our master list
            let addedCount = 0;
            companies.forEach(company => {
                const key = this.generateCompanyKey(company);
                if (!this.allCompanies.has(key)) {
                    this.allCompanies.set(key, {
                        ...company,
                        source: source,
                        fileName: fileName
                    });
                    addedCount++;
                }
            });

            console.log(`   ✅ Found ${companies.length} companies, ${addedCount} new unique companies`);

            // Update source breakdown
            if (!this.sourceBreakdown[source]) {
                this.sourceBreakdown[source] = 0;
            }
            this.sourceBreakdown[source] += addedCount;

        } catch (error) {
            console.log(`   ❌ Error processing ${path.basename(filePath)}: ${error.message}`);
        }
    }

    // Extract property owner companies
    extractPropertyOwners(data) {
        const companies = [];
        
        if (data.topProspects) {
            data.topProspects.forEach(company => {
                companies.push({
                    name: company.businessName,
                    address: company.address,
                    phone: company.phone,
                    website: company.website,
                    category: 'Property Management/Real Estate',
                    rating: company.rating,
                    leadScore: company.dataQualityScore || 0
                });
            });
        }

        if (data.allResults) {
            data.allResults.forEach(company => {
                companies.push({
                    name: company.businessName,
                    address: company.address,
                    phone: company.phone,
                    website: company.website,
                    category: 'Property Management/Real Estate',
                    rating: company.rating,
                    leadScore: company.dataQualityScore || 0
                });
            });
        }

        return companies;
    }

    // Extract SME companies
    extractSMECompanies(data) {
        const companies = [];

        if (data.categoryResults) {
            Object.keys(data.categoryResults).forEach(category => {
                const categoryData = data.categoryResults[category];
                if (categoryData.topBusinesses) {
                    categoryData.topBusinesses.forEach(company => {
                        companies.push({
                            name: company.name || company.businessName,
                            address: company.address,
                            phone: company.phone,
                            website: company.website,
                            category: category.charAt(0).toUpperCase() + category.slice(1),
                            rating: company.rating,
                            leadScore: company.leadScore || 0
                        });
                    });
                }
            });
        }

        if (data.results) {
            data.results.forEach(company => {
                companies.push({
                    name: company.name || company.businessName,
                    address: company.address,
                    phone: company.phone,
                    website: company.website,
                    category: 'SME',
                    rating: company.rating,
                    leadScore: company.leadScore || 0
                });
            });
        }

        return companies;
    }

    // Extract medical facilities
    extractMedicalFacilities(data) {
        const companies = [];

        if (data.allResults) {
            data.allResults.forEach(company => {
                companies.push({
                    name: company.name || company.businessName,
                    address: company.address,
                    phone: company.phone,
                    website: company.website,
                    category: 'Medical/Healthcare',
                    rating: company.rating,
                    leadScore: company.leadScore || 0
                });
            });
        }

        return companies;
    }

    // Extract test results
    extractTestResults(data) {
        const companies = [];

        if (Array.isArray(data)) {
            data.forEach(company => {
                companies.push({
                    name: company.name || company.businessName,
                    address: company.address,
                    phone: company.phone,
                    website: company.website,
                    category: 'Test Data',
                    rating: company.rating,
                    leadScore: company.leadScore || 0
                });
            });
        }

        return companies;
    }

    // Generate unique key for company
    generateCompanyKey(company) {
        const name = (company.name || '').toLowerCase().trim();
        const address = (company.address || '').toLowerCase().trim();
        return `${name}_${address}`.replace(/[^a-z0-9_]/g, '');
    }

    // Generate comprehensive summary
    generateSummary() {
        this.totalScraped = this.allCompanies.size;

        // Category breakdown
        this.allCompanies.forEach(company => {
            const category = company.category || 'Unknown';
            if (!this.categoryBreakdown[category]) {
                this.categoryBreakdown[category] = 0;
            }
            this.categoryBreakdown[category]++;
        });

        console.log('\n📊 COMPREHENSIVE SCRAPING RESULTS');
        console.log('==================================');
        console.log(`🏢 Total Unique Companies Scraped: ${this.totalScraped}`);
        
        console.log('\n📂 BY SOURCE:');
        Object.keys(this.sourceBreakdown).forEach(source => {
            console.log(`   ${source}: ${this.sourceBreakdown[source]} companies`);
        });

        console.log('\n🏷️ BY CATEGORY:');
        Object.keys(this.categoryBreakdown).forEach(category => {
            console.log(`   ${category}: ${this.categoryBreakdown[category]} companies`);
        });

        console.log('\n🎯 TOP 20 COMPANIES WITH CONTACT INFO:');
        const companiesWithContacts = Array.from(this.allCompanies.values())
            .filter(c => c.phone || c.website)
            .sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0))
            .slice(0, 20);

        companiesWithContacts.forEach((company, index) => {
            console.log(`${index + 1}. ${company.name}`);
            console.log(`   📍 ${company.address || 'Address not available'}`);
            console.log(`   📞 ${company.phone || 'Phone not available'}`);
            console.log(`   🌐 ${company.website || 'Website not available'}`);
            console.log(`   🏷️ Category: ${company.category}`);
            console.log(`   ⭐ Lead Score: ${company.leadScore || 0}`);
            console.log(`   📁 Source: ${company.source}`);
            console.log('');
        });

        console.log('\n📋 COMPLETE COMPANY LIST:');
        console.log('========================');
        
        const sortedCompanies = Array.from(this.allCompanies.values())
            .sort((a, b) => a.name.localeCompare(b.name));

        sortedCompanies.forEach((company, index) => {
            console.log(`${index + 1}. ${company.name} (${company.category})`);
        });

        // Save complete results
        const report = {
            summary: {
                totalUniqueCompanies: this.totalScraped,
                scrapedDate: new Date().toISOString(),
                sourceBreakdown: this.sourceBreakdown,
                categoryBreakdown: this.categoryBreakdown
            },
            companiesWithContacts: companiesWithContacts,
            allCompanies: sortedCompanies
        };

        const fileName = `complete-scraping-summary-${Date.now()}.json`;
        fs.writeFileSync(fileName, JSON.stringify(report, null, 2));
        console.log(`\n📁 Complete report saved: ${fileName}`);
        
        console.log('\n✅ ANALYSIS COMPLETE!');
        console.log(`🎯 Ready for outreach to ${this.totalScraped} unique Dubai companies`);
    }
}

// Execute analysis
const analyzer = new ComprehensiveScrapingSummary();
analyzer.analyzeScrapeResults().catch(console.error);