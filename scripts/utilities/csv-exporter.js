#!/usr/bin/env node

/**
 * CSV Export Generator for All Scraped Companies
 * Creates structured CSV with comprehensive company information
 */

const fs = require('fs');
const path = require('path');

class ComprehensiveCSVExporter {
    constructor() {
        this.allCompanies = [];
        this.csvHeaders = [
            'Company Name',
            'Category',
            'Address',
            'Phone',
            'Website',
            'Email',
            'Rating',
            'Review Count',
            'Lead Score',
            'Digital Potential',
            'Business Hours',
            'Description',
            'Area/District',
            'Emirate',
            'Coordinates (Lat)',
            'Coordinates (Lng)',
            'Google Maps URL',
            'Social Media',
            'Data Source',
            'Verification Status',
            'Contact Quality',
            'Digital Opportunities',
            'Target Market',
            'Last Updated'
        ];
    }

    async generateComprehensiveCSV() {
        console.log('📊 GENERATING COMPREHENSIVE CSV EXPORT');
        console.log('====================================');

        // Extract from all data sources
        await this.extractPropertyOwners();
        await this.extractSMECompanies();
        await this.extractTestResults();

        // Generate CSV
        await this.createCSVFile();
        
        console.log('\n✅ CSV EXPORT COMPLETE!');
        console.log(`📁 Ready for outreach to ${this.allCompanies.length} Dubai companies`);
    }

    async extractPropertyOwners() {
        console.log('🏢 Extracting Property Owner Companies...');
        
        try {
            const filePath = path.join(__dirname, 'dubai-property-owners-2025-09-15.json');
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);

            // Extract from topProspects
            if (data.topProspects) {
                data.topProspects.forEach(company => {
                    this.allCompanies.push(this.formatPropertyOwnerCompany(company));
                });
            }

            // Extract from allResults if it exists
            if (data.allResults && Array.isArray(data.allResults)) {
                data.allResults.forEach(company => {
                    this.allCompanies.push(this.formatPropertyOwnerCompany(company));
                });
            }

            console.log(`   ✅ Extracted ${data.summary?.totalContacts || 'multiple'} property owner contacts`);
        } catch (error) {
            console.log(`   ❌ Error extracting property owners: ${error.message}`);
        }
    }

    formatPropertyOwnerCompany(company) {
        const socialMedia = this.formatSocialMedia(company.socialMedia);
        const coordinates = company.coordinates || {};
        const locationDetails = company.locationDetails || {};
        const websiteAnalysis = company.websiteAnalysis || {};
        
        return {
            'Company Name': company.businessName || company.name || 'N/A',
            'Category': 'Property Management/Real Estate',
            'Address': company.address || 'N/A',
            'Phone': company.phone || 'N/A',
            'Website': company.website || 'N/A',
            'Email': this.extractEmails(company.additionalEmails),
            'Rating': company.rating || 'N/A',
            'Review Count': company.reviewCount || 'N/A',
            'Lead Score': company.dataQualityScore || company.leadScore || 'N/A',
            'Digital Potential': this.calculateDigitalPotential(websiteAnalysis),
            'Business Hours': this.formatBusinessHours(company.businessHours),
            'Description': company.description || 'N/A',
            'Area/District': locationDetails.area || this.extractArea(company.address),
            'Emirate': locationDetails.emirate || 'Dubai',
            'Coordinates (Lat)': coordinates.lat || 'N/A',
            'Coordinates (Lng)': coordinates.lng || 'N/A',
            'Google Maps URL': company.googleMapsUrl || 'N/A',
            'Social Media': socialMedia,
            'Data Source': 'Property Owner Intelligence',
            'Verification Status': company.verificationStatus || 'Unverified',
            'Contact Quality': this.assessContactQuality(company),
            'Digital Opportunities': this.getDigitalOpportunities('property'),
            'Target Market': 'Property Owners, Real Estate Investors, Property Managers',
            'Last Updated': company.lastUpdated || new Date().toISOString()
        };
    }

    async extractSMECompanies() {
        console.log('🏪 Extracting SME Companies...');
        
        try {
            const filePath = path.join(__dirname, 'results', 'final-sme-intelligence-2025-09-14.json');
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);

            if (data.categoryResults) {
                Object.keys(data.categoryResults).forEach(category => {
                    const categoryData = data.categoryResults[category];
                    if (categoryData.topBusinesses) {
                        categoryData.topBusinesses.forEach(company => {
                            this.allCompanies.push(this.formatSMECompany(company, category));
                        });
                    }
                });
            }

            console.log(`   ✅ Extracted ${data.operationSummary?.totalBusinessesFound || 'multiple'} SME companies`);
        } catch (error) {
            console.log(`   ❌ Error extracting SME companies: ${error.message}`);
        }
    }

    formatSMECompany(company, category) {
        return {
            'Company Name': company.name || company.businessName || 'N/A',
            'Category': this.capitalizeCategory(category),
            'Address': company.address || 'N/A',
            'Phone': company.phone || 'N/A',
            'Website': company.website || 'N/A',
            'Email': company.email || 'N/A',
            'Rating': company.rating || 'N/A',
            'Review Count': company.reviewCount || 'N/A',
            'Lead Score': company.leadScore || this.calculateSMELeadScore(company),
            'Digital Potential': this.calculateSMEDigitalPotential(company),
            'Business Hours': this.formatBusinessHours(company.businessHours),
            'Description': company.description || 'N/A',
            'Area/District': this.extractArea(company.address),
            'Emirate': 'Dubai',
            'Coordinates (Lat)': 'N/A',
            'Coordinates (Lng)': 'N/A',
            'Google Maps URL': 'N/A',
            'Social Media': 'N/A',
            'Data Source': 'SME Intelligence',
            'Verification Status': 'Partially Verified',
            'Contact Quality': this.assessContactQuality(company),
            'Digital Opportunities': this.getDigitalOpportunities(category),
            'Target Market': this.getSMETargetMarket(category),
            'Last Updated': new Date().toISOString()
        };
    }

    async extractTestResults() {
        console.log('🧪 Extracting Test Results...');
        
        const testFiles = [
            'results/test-results-2025-09-13T19-15-52-590Z.json',
            'results/test-results-2025-09-13T20-16-16-323Z.json'
        ];

        for (const fileName of testFiles) {
            try {
                const filePath = path.join(__dirname, fileName);
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const data = JSON.parse(content);

                    if (Array.isArray(data)) {
                        data.forEach(company => {
                            this.allCompanies.push(this.formatTestCompany(company));
                        });
                    }
                }
            } catch (error) {
                console.log(`   ⚠️  Could not process ${fileName}: ${error.message}`);
            }
        }

        console.log('   ✅ Extracted test result companies');
    }

    formatTestCompany(company) {
        return {
            'Company Name': company.businessName || company.name || 'N/A',
            'Category': 'Hospitality/Restaurant',
            'Address': company.address || 'N/A',
            'Phone': company.phone || 'N/A',
            'Website': company.website || 'N/A',
            'Email': 'N/A',
            'Rating': company.rating || 'N/A',
            'Review Count': company.reviewCount || 'N/A',
            'Lead Score': company.leadScore || '75',
            'Digital Potential': '80',
            'Business Hours': this.formatBusinessHours(company.businessHours),
            'Description': company.description || 'N/A',
            'Area/District': this.extractArea(company.address),
            'Emirate': 'Dubai',
            'Coordinates (Lat)': 'N/A',
            'Coordinates (Lng)': 'N/A',
            'Google Maps URL': 'N/A',
            'Social Media': 'N/A',
            'Data Source': 'Test Results',
            'Verification Status': 'Test Data',
            'Contact Quality': this.assessContactQuality(company),
            'Digital Opportunities': 'Online Ordering, Digital Menu, Social Media Marketing, Customer Reviews Management',
            'Target Market': 'Local Diners, Tourists, Food Delivery Customers',
            'Last Updated': new Date().toISOString()
        };
    }

    // Utility functions
    formatSocialMedia(socialMedia) {
        if (!socialMedia) return 'N/A';
        const links = [];
        if (socialMedia.instagram) links.push(`Instagram: ${socialMedia.instagram}`);
        if (socialMedia.facebook) links.push(`Facebook: ${socialMedia.facebook}`);
        if (socialMedia.twitter) links.push(`Twitter: ${socialMedia.twitter}`);
        return links.length > 0 ? links.join('; ') : 'N/A';
    }

    extractEmails(emails) {
        if (!emails || !Array.isArray(emails) || emails.length === 0) return 'N/A';
        return emails.join('; ');
    }

    formatBusinessHours(hours) {
        if (!hours) return 'N/A';
        if (typeof hours === 'string') return hours;
        if (typeof hours === 'object') {
            return Object.entries(hours)
                .map(([day, time]) => `${day}: ${time}`)
                .join('; ');
        }
        return 'N/A';
    }

    extractArea(address) {
        if (!address) return 'N/A';
        
        const areas = [
            'Dubai Marina', 'Downtown Dubai', 'Palm Jumeirah', 'JBR', 'DIFC',
            'Business Bay', 'Deira', 'Bur Dubai', 'Al Karama', 'Al Garhoud',
            'Port Saeed', 'Al Qusais', 'Al Mankhool', 'Jumeirah', 'Al Barsha'
        ];
        
        for (const area of areas) {
            if (address.toLowerCase().includes(area.toLowerCase())) {
                return area;
            }
        }
        
        return 'Dubai';
    }

    calculateDigitalPotential(websiteAnalysis) {
        if (!websiteAnalysis || !websiteAnalysis.technologies) return '75';
        
        let score = 50;
        const tech = websiteAnalysis.technologies;
        
        if (tech.ssl?.detected) score += 10;
        if (tech.googleAnalytics?.detected) score += 10;
        if (tech.react?.detected || tech.angular?.detected || tech.vue?.detected) score += 15;
        if (tech.cloudflare?.detected) score += 10;
        
        return Math.min(score, 100).toString();
    }

    calculateSMELeadScore(company) {
        let score = 70; // Base score
        if (company.phone) score += 15;
        if (company.website) score += 15;
        return score.toString();
    }

    calculateSMEDigitalPotential(company) {
        let score = 80; // Base score for SMEs (high potential)
        if (!company.website) score += 10; // Higher potential if no website
        if (!company.phone) score -= 10;
        return Math.min(score, 100).toString();
    }

    assessContactQuality(company) {
        let quality = 'Low';
        let score = 0;
        
        if (company.phone) score += 30;
        if (company.website) score += 25;
        if (company.email || (company.additionalEmails && company.additionalEmails.length > 0)) score += 25;
        if (company.address) score += 20;
        
        if (score >= 75) quality = 'High';
        else if (score >= 50) quality = 'Medium';
        
        return quality;
    }

    capitalizeCategory(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    getDigitalOpportunities(category) {
        const opportunities = {
            'property': 'Professional Website, Property Management System, Virtual Tours, Online Booking, CRM Integration, Digital Marketing',
            'accounting': 'Cloud Accounting Software, Client Portal, Document Management, Digital Tax Filing, Online Consultations',
            'consulting': 'Professional Website, Online Booking System, Client CRM, Digital Marketing, Content Management',
            'realestate': 'Property Listing Platform, Virtual Tours, CRM System, Lead Management, Digital Marketing',
            'hospitality': 'Online Ordering, Digital Menu, Reservation System, Social Media Marketing, Customer Reviews Management'
        };
        
        return opportunities[category] || 'Professional Website, Digital Marketing, Online Presence Optimization, Customer Management System';
    }

    getSMETargetMarket(category) {
        const markets = {
            'accounting': 'Small-Medium Businesses, Startups, Individual Entrepreneurs, Corporate Clients',
            'consulting': 'Business Owners, Startups, Corporate Clients, Entrepreneurs',
            'realestate': 'Property Investors, Home Buyers, Renters, Corporate Clients',
            'hospitality': 'Local Diners, Tourists, Corporate Events, Food Delivery Customers'
        };
        
        return markets[category] || 'Small-Medium Businesses, Local Clients, Corporate Customers';
    }

    async createCSVFile() {
        console.log('\n📝 Creating CSV File...');
        
        // Remove duplicates
        const uniqueCompanies = this.removeDuplicates();
        
        // Create CSV content
        let csvContent = this.csvHeaders.join(',') + '\n';
        
        uniqueCompanies.forEach(company => {
            const row = this.csvHeaders.map(header => {
                let value = company[header] || 'N/A';
                // Escape quotes and wrap in quotes if contains comma
                if (typeof value === 'string') {
                    value = value.replace(/"/g, '""');
                    if (value.includes(',') || value.includes('\n') || value.includes('"')) {
                        value = `"${value}"`;
                    }
                }
                return value;
            });
            csvContent += row.join(',') + '\n';
        });

        // Save CSV file
        const fileName = `dubai-companies-comprehensive-${Date.now()}.csv`;
        fs.writeFileSync(fileName, csvContent, 'utf8');
        
        console.log(`📁 CSV file created: ${fileName}`);
        console.log(`📊 Total companies: ${uniqueCompanies.length}`);
        
        // Generate summary
        this.generateSummaryReport(uniqueCompanies, fileName);
        
        return fileName;
    }

    removeDuplicates() {
        const seen = new Set();
        return this.allCompanies.filter(company => {
            const key = company['Company Name'].toLowerCase().trim();
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    generateSummaryReport(companies, csvFileName) {
        console.log('\n📊 CSV EXPORT SUMMARY');
        console.log('====================');
        
        // Category breakdown
        const categoryCount = {};
        const contactQualityCount = {};
        const sourceCount = {};
        
        companies.forEach(company => {
            // Category count
            const category = company['Category'];
            categoryCount[category] = (categoryCount[category] || 0) + 1;
            
            // Contact quality count
            const quality = company['Contact Quality'];
            contactQualityCount[quality] = (contactQualityCount[quality] || 0) + 1;
            
            // Source count
            const source = company['Data Source'];
            sourceCount[source] = (sourceCount[source] || 0) + 1;
        });
        
        console.log(`📁 File: ${csvFileName}`);
        console.log(`🏢 Total Companies: ${companies.length}`);
        
        console.log('\n📂 By Category:');
        Object.entries(categoryCount).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} companies`);
        });
        
        console.log('\n📞 By Contact Quality:');
        Object.entries(contactQualityCount).forEach(([quality, count]) => {
            console.log(`   ${quality}: ${count} companies`);
        });
        
        console.log('\n📊 By Data Source:');
        Object.entries(sourceCount).forEach(([source, count]) => {
            console.log(`   ${source}: ${count} companies`);
        });
        
        // Companies with high contact quality
        const highQualityContacts = companies.filter(c => c['Contact Quality'] === 'High');
        console.log(`\n⭐ High Quality Contacts: ${highQualityContacts.length} companies`);
        
        if (highQualityContacts.length > 0) {
            console.log('\n🎯 TOP HIGH-QUALITY PROSPECTS:');
            highQualityContacts.slice(0, 10).forEach((company, index) => {
                console.log(`${index + 1}. ${company['Company Name']}`);
                console.log(`   📞 ${company['Phone']}`);
                console.log(`   🌐 ${company['Website']}`);
                console.log(`   📍 ${company['Area/District']}`);
                console.log('');
            });
        }
    }
}

// Execute CSV generation
const exporter = new ComprehensiveCSVExporter();
exporter.generateComprehensiveCSV().catch(console.error);