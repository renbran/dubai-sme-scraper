#!/usr/bin/env node

/**
 * Dubai Union Area Medical Scraper
 * Targets clinics and hospitals specifically in union areas of Dubai
 * Focus: Medical facilities in union/industrial districts
 */

const EnhancedMultiSourceMapper = require('./src/data-sources/enhanced-multi-source-mapper');

class DubaiUnionAreaMedicalScraper {
    constructor() {
        this.mapper = null;
        this.results = {
            unionAreaClinics: [],
            unionAreaHospitals: [],
            unionAreaMedicalCenters: [],
            unionAreaPharmacies: []
        };
        this.totalFound = 0;
        this.startTime = Date.now();
        
        // Union areas in Dubai
        this.unionAreas = [
            'Al Qusais Industrial Area',
            'Dubai Industrial City',
            'Jebel Ali Industrial Area',
            'Al Aweer Industrial Area',
            'Dubai Investment Park',
            'Dubai South',
            'Al Quoz Industrial Area',
            'Ras Al Khor Industrial Area',
            'Dubai Maritime City',
            'Dubai Multi Commodities Centre'
        ];
    }

    async initialize() {
        console.log('🏭 DUBAI UNION AREA MEDICAL SCRAPER');
        console.log('===================================');
        console.log('🎯 Target: Medical facilities in union/industrial areas');
        console.log('📍 Focus Areas: Industrial zones with medical services');
        console.log('💡 Opportunity: Underserved medical digitization in industrial areas');

        this.mapper = new EnhancedMultiSourceMapper();
        await this.mapper.initialize();
        console.log('✅ System ready for union area medical extraction');
        
        console.log('\n📍 TARGET UNION AREAS:');
        this.unionAreas.forEach((area, index) => {
            console.log(`   ${index + 1}. ${area}`);
        });
    }

    // Check if business is in union/industrial area
    isInUnionArea(business) {
        if (!business) return false;
        
        const address = business.address ? business.address.toLowerCase() : '';
        const name = business.name ? business.name.toLowerCase() : '';
        const description = business.description ? business.description.toLowerCase() : '';
        
        const unionKeywords = [
            'industrial', 'union', 'qusais', 'jebel ali', 'aweer', 
            'investment park', 'dubai south', 'quoz', 'ras al khor',
            'maritime city', 'commodities centre', 'industrial city',
            'worker', 'occupational', 'labor', 'labour', 'factory'
        ];
        
        return unionKeywords.some(keyword => 
            address.includes(keyword) || name.includes(keyword) || description.includes(keyword)
        );
    }

    // Classify union area medical business
    classifyUnionMedical(business) {
        if (!business || !business.name) {
            return null;
        }
        
        const name = business.name ? business.name.toLowerCase() : '';
        const address = business.address ? business.address.toLowerCase() : '';
        
        let medicalType = 'General Medical';
        let unionArea = 'Unknown';
        let workerFocus = false;
        let digitalPotential = 80; // High potential in underserved areas
        let leadScore = 85;
        
        // Identify specific union area
        this.unionAreas.forEach(area => {
            if (address.includes(area.toLowerCase()) || 
                name.includes(area.toLowerCase())) {
                unionArea = area;
            }
        });
        
        // Medical facility type
        if (name.includes('clinic') || name.includes('polyclinic')) {
            medicalType = 'Clinic';
            digitalPotential = 85;
        } else if (name.includes('hospital') || name.includes('medical center')) {
            medicalType = 'Hospital/Medical Center';
            digitalPotential = 90;
            leadScore = 90;
        } else if (name.includes('pharmacy') || name.includes('medical supplies')) {
            medicalType = 'Pharmacy/Medical Supplies';
            digitalPotential = 75;
        } else if (name.includes('diagnostic') || name.includes('lab')) {
            medicalType = 'Diagnostic Center';
            digitalPotential = 80;
        }
        
        // Worker-focused facilities (common in industrial areas)
        if (name.includes('worker') || name.includes('labor') || 
            name.includes('occupational') || name.includes('industrial health')) {
            workerFocus = true;
            digitalPotential += 10; // Higher need for efficiency
            leadScore += 5;
        }
        
        // Industrial area boost (underserved = higher opportunity)
        if (this.isInUnionArea(business)) {
            digitalPotential += 5;
            leadScore += 5;
        }
        
        return {
            ...business,
            medicalType,
            unionArea,
            workerFocus,
            digitalPotential: Math.min(digitalPotential, 100),
            leadScore: Math.min(leadScore, 100),
            digitalOpportunities: this.getUnionAreaDigitalOpportunities(medicalType, workerFocus),
            targetMarket: this.getTargetMarket(unionArea, workerFocus),
            lastScanned: new Date().toISOString()
        };
    }

    // Digital opportunities for union area medical facilities
    getUnionAreaDigitalOpportunities(medicalType, workerFocus) {
        const baseOpportunities = [
            'Professional Medical Website',
            'Google Business Profile Optimization',
            'Online Appointment Booking',
            'Digital Patient Records',
            'Multi-language Support System'
        ];
        
        const workerFocusedOpportunities = [
            'Occupational Health Management System',
            'Worker Health Screening Platform',
            'Company Contract Management',
            'Bulk Appointment Scheduling',
            'Industrial Health Reporting Dashboard',
            'Emergency Response Coordination'
        ];
        
        const medicalSpecific = {
            'Clinic': [
                'Patient Queue Management',
                'Teleconsultation Platform',
                'Medical Certificate Generation',
                'Insurance Processing System'
            ],
            'Hospital/Medical Center': [
                'Hospital Management System',
                'Emergency Department Management',
                'Medical Equipment Tracking',
                'Staff Scheduling System'
            ],
            'Pharmacy/Medical Supplies': [
                'Inventory Management System',
                'Prescription Management',
                'B2B Corporate Sales Platform',
                'Medical Supply Chain Integration'
            ],
            'Diagnostic Center': [
                'Lab Information Management System',
                'Digital Report Delivery',
                'Equipment Integration Platform',
                'Sample Tracking System'
            ]
        };
        
        let opportunities = [...baseOpportunities];
        
        if (workerFocus) {
            opportunities.push(...workerFocusedOpportunities);
        }
        
        if (medicalSpecific[medicalType]) {
            opportunities.push(...medicalSpecific[medicalType]);
        }
        
        return opportunities;
    }

    // Identify target market for union area medical facilities
    getTargetMarket(unionArea, workerFocus) {
        let market = ['Local Residents', 'Walk-in Patients'];
        
        if (workerFocus || unionArea !== 'Unknown') {
            market.push(
                'Industrial Workers',
                'Factory Employees',
                'Construction Workers',
                'Corporate Contracts',
                'Company Health Programs'
            );
        }
        
        return market;
    }

    // Search for medical facilities in union areas
    async searchUnionAreaMedical() {
        console.log('\n🏭 SEARCHING MEDICAL FACILITIES IN UNION AREAS');
        console.log('===============================================');

        // Location-specific queries
        const locationQueries = [
            'clinics Al Qusais Industrial Area Dubai',
            'hospitals Dubai Industrial City',
            'medical center Jebel Ali Industrial',
            'clinics Al Aweer Industrial Area',
            'hospitals Dubai Investment Park',
            'medical facilities Dubai South',
            'clinics Al Quoz Industrial Area',
            'hospitals Ras Al Khor Industrial'
        ];

        // Service-specific queries for union areas
        const serviceQueries = [
            'worker clinics Dubai industrial areas',
            'occupational health Dubai',
            'industrial medical services Dubai',
            'labor medical center Dubai',
            'factory medical facilities Dubai',
            'company medical services Dubai',
            'employee health clinics Dubai',
            'industrial area hospitals Dubai'
        ];

        const allQueries = [...locationQueries, ...serviceQueries];

        for (let i = 0; i < allQueries.length; i++) {
            const query = allQueries[i];
            console.log(`\n[${i + 1}/${allQueries.length}] 🔍 "${query}"`);
            
            try {
                const results = await this.mapper.searchBusinesses(query, 'Dubai, UAE');
                
                if (results && results.length > 0) {
                    console.log(`   📋 Found ${results.length} businesses, filtering for union areas...`);
                    
                    // Filter for businesses in union areas
                    const unionAreaBusinesses = results.filter(business => {
                        if (!business || !business.name) return false;
                        
                        return this.isInUnionArea(business) || 
                            business.name.toLowerCase().includes('worker') ||
                            business.name.toLowerCase().includes('industrial') ||
                            business.name.toLowerCase().includes('occupational');
                    });
                    
                    if (unionAreaBusinesses.length > 0) {
                        console.log(`   ✅ ${unionAreaBusinesses.length} medical facilities in union areas found!`);
                        
                        const enhanced = unionAreaBusinesses
                            .map(business => this.classifyUnionMedical(business))
                            .filter(business => business !== null);
                        
                        // Categorize results
                        enhanced.forEach(business => {
                            if (business.medicalType === 'Clinic') {
                                this.results.unionAreaClinics.push(business);
                            } else if (business.medicalType === 'Hospital/Medical Center') {
                                this.results.unionAreaHospitals.push(business);
                            } else if (business.medicalType === 'Pharmacy/Medical Supplies') {
                                this.results.unionAreaPharmacies.push(business);
                            } else {
                                this.results.unionAreaMedicalCenters.push(business);
                            }
                        });
                        
                        this.totalFound += enhanced.length;
                        
                        // Display sample
                        const sample = enhanced[0];
                        console.log(`   🏥 Sample: ${sample.name}`);
                        console.log(`   📍 Union Area: ${sample.unionArea}`);
                        console.log(`   🏭 Worker Focus: ${sample.workerFocus ? 'Yes' : 'No'}`);
                        console.log(`   💻 Digital Potential: ${sample.digitalPotential}%`);
                        console.log(`   ⭐ Lead Score: ${sample.leadScore}/100`);
                    } else {
                        console.log(`   ⚠️  No union area medical facilities found in this search`);
                    }
                } else {
                    console.log(`   ⚠️  No results for "${query}"`);
                }
                
                // Pause between queries
                await new Promise(resolve => setTimeout(resolve, 4000));
                
            } catch (error) {
                console.log(`   ❌ Error searching "${query}": ${error.message}`);
            }
        }
    }

    // Generate union area medical report
    async generateUnionAreaReport() {
        console.log('\n📊 GENERATING UNION AREA MEDICAL REPORT');
        console.log('========================================');

        const allResults = [
            ...this.results.unionAreaClinics,
            ...this.results.unionAreaHospitals,
            ...this.results.unionAreaMedicalCenters,
            ...this.results.unionAreaPharmacies
        ];

        // Sort by lead score
        const sortedResults = allResults.sort((a, b) => b.leadScore - a.leadScore);

        // Group by union area
        const byUnionArea = {};
        sortedResults.forEach(business => {
            if (!byUnionArea[business.unionArea]) byUnionArea[business.unionArea] = [];
            byUnionArea[business.unionArea].push(business);
        });

        // Worker-focused vs general
        const workerFocused = sortedResults.filter(b => b.workerFocus);
        const generalMedical = sortedResults.filter(b => !b.workerFocus);

        const report = {
            metadata: {
                generatedAt: new Date().toISOString(),
                totalUnionAreaMedical: this.totalFound,
                operationDuration: Math.round((Date.now() - this.startTime) / 1000),
                focus: 'Medical facilities in Dubai union/industrial areas',
                averageLeadScore: Math.round(sortedResults.reduce((sum, b) => sum + b.leadScore, 0) / sortedResults.length),
                averageDigitalPotential: Math.round(sortedResults.reduce((sum, b) => sum + b.digitalPotential, 0) / sortedResults.length)
            },
            summary: {
                unionAreaClinics: this.results.unionAreaClinics.length,
                unionAreaHospitals: this.results.unionAreaHospitals.length,
                unionAreaMedicalCenters: this.results.unionAreaMedicalCenters.length,
                unionAreaPharmacies: this.results.unionAreaPharmacies.length,
                workerFocusedFacilities: workerFocused.length,
                generalMedicalFacilities: generalMedical.length
            },
            categorizedResults: {
                byUnionArea: byUnionArea,
                byMedicalType: {
                    clinics: this.results.unionAreaClinics,
                    hospitals: this.results.unionAreaHospitals,
                    medicalCenters: this.results.unionAreaMedicalCenters,
                    pharmacies: this.results.unionAreaPharmacies
                },
                byFocus: {
                    workerFocused: workerFocused,
                    generalMedical: generalMedical
                }
            },
            allResults: sortedResults
        };

        // Save report
        const fileName = `dubai-union-area-medical-${Date.now()}.json`;
        require('fs').writeFileSync(fileName, JSON.stringify(report, null, 2));
        
        console.log(`\n📁 Report saved: ${fileName}`);
        console.log(`🏭 Total union area medical facilities: ${this.totalFound}`);
        console.log(`👷 Worker-focused facilities: ${workerFocused.length}`);
        console.log(`⭐ Average lead score: ${report.metadata.averageLeadScore}/100`);
        console.log(`💻 Average digital potential: ${report.metadata.averageDigitalPotential}%`);
        
        // Display breakdown by union area
        console.log('\n📍 RESULTS BY UNION AREA:');
        Object.keys(byUnionArea).forEach(area => {
            if (area !== 'Unknown') {
                console.log(`   ${area}: ${byUnionArea[area].length} facilities`);
            }
        });
        
        // Display breakdown by medical type
        console.log('\n🏥 RESULTS BY MEDICAL TYPE:');
        console.log(`   Clinics: ${this.results.unionAreaClinics.length}`);
        console.log(`   Hospitals/Medical Centers: ${this.results.unionAreaHospitals.length}`);
        console.log(`   Medical Centers: ${this.results.unionAreaMedicalCenters.length}`);
        console.log(`   Pharmacies: ${this.results.unionAreaPharmacies.length}`);
        
        // Show top targets
        console.log('\n🎯 TOP 5 UNION AREA MEDICAL TARGETS:');
        sortedResults.slice(0, 5).forEach((business, index) => {
            console.log(`${index + 1}. ${business.name}`);
            console.log(`   📍 Union Area: ${business.unionArea}`);
            console.log(`   🏥 Type: ${business.medicalType}`);
            console.log(`   👷 Worker Focus: ${business.workerFocus ? 'Yes' : 'No'}`);
            console.log(`   📞 ${business.phone || 'Phone not available'}`);
            console.log(`   ⭐ Lead Score: ${business.leadScore}/100`);
            console.log(`   💡 Top opportunity: ${business.digitalOpportunities[0]}`);
            console.log('');
        });

        return report;
    }

    // Main execution
    async execute() {
        try {
            await this.initialize();
            await this.searchUnionAreaMedical();
            await this.generateUnionAreaReport();
            
            console.log('\n✅ UNION AREA MEDICAL SCRAPING COMPLETE!');
            console.log('🏭 Ready for industrial area medical digitization outreach');
            
        } catch (error) {
            console.error('❌ Operation failed:', error.message);
        } finally {
            if (this.mapper) {
                await this.mapper.close();
            }
        }
    }
}

// Execute
const scraper = new DubaiUnionAreaMedicalScraper();
scraper.execute().catch(console.error);