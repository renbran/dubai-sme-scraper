// Dubai Business Districts Lead Generator
// Target specific commercial areas for comprehensive coverage

const GoogleMapsScraper = require('./src/scraper');
const { validateInput } = require('./src/utils');
const fs = require('fs');

async function businessDistrictsLeadGeneration() {
    console.log('🏙️  DUBAI BUSINESS DISTRICTS LEAD GENERATION');
    console.log('==========================================');
    console.log('🎯 Target: Key commercial districts across Dubai\n');
    
    // Major Dubai business districts with SME concentration
    const businessDistricts = [
        // Traditional business areas
        'small businesses Deira Dubai',
        'trading companies Deira Dubai',
        'businesses Bur Dubai',
        'trading companies Bur Dubai',
        
        // Modern business districts
        'businesses DIFC Dubai', 
        'consultants Business Bay Dubai',
        'companies JLT Dubai',
        'businesses Dubai Marina',
        
        // Industrial and commercial zones
        'businesses Al Qusais Dubai',
        'trading companies Al Rigga Dubai',
        'businesses Karama Dubai',
        'companies Al Fahidi Dubai',
        
        // Mixed commercial areas
        'businesses Jumeirah Dubai',
        'services Al Wasl Dubai',
        'companies Motor City Dubai',
        'businesses Discovery Gardens Dubai'
    ];
    
    const testInput = {
        categories: businessDistricts,
        maxResultsPerCategory: 20,
        dataQualityLevel: 'standard'
    };
    
    console.log(`🏢 Targeting ${testInput.categories.length} business districts`);
    console.log(`📊 Expected coverage: ${testInput.categories.length * 15} local businesses\n`);
    
    const validation = validateInput(testInput);
    if (!validation.isValid) {
        console.error('❌ Input validation failed:', validation.errors);
        return;
    }
    
    const scraper = new GoogleMapsScraper({
        headless: true,
        maxConcurrency: 1,
        requestDelay: 3500,
        timeout: 12000
    });
    
    let allBusinesses = [];
    let districtResults = {};
    
    try {
        await scraper.initialize();
        console.log('✅ Districts scraper initialized\n');
        
        for (let i = 0; i < testInput.categories.length; i++) {
            const district = testInput.categories[i];
            const progress = `[${i+1}/${testInput.categories.length}]`;
            
            console.log(`🏙️  ${progress} Scanning: "${district}"`);
            
            try {
                const businesses = await scraper.searchBusinesses(district, testInput.maxResultsPerCategory);
                console.log(`✅ Found ${businesses.length} businesses`);
                
                // Extract district name from search term
                const districtName = district.split(' ').slice(-2).join(' '); // Get last 2 words (area name)
                districtResults[districtName] = businesses;
                allBusinesses.push(...businesses);
                
                // Show immediate results
                const qualityLeads = businesses.filter(b => 
                    (b.phone || b.website) && (b.dataQualityScore || 0) >= 40
                );
                
                if (qualityLeads.length > 0) {
                    console.log(`   🎯 ${qualityLeads.length} quality leads in ${districtName}:`);
                    qualityLeads.slice(0, 2).forEach((lead, idx) => {
                        console.log(`   ${idx + 1}. ${lead.businessName}`);
                        console.log(`      📞 ${lead.phone || 'Website only'}`);
                        console.log(`      📊 ${lead.dataQualityScore || 0}/100`);
                    });
                }
                
                await new Promise(resolve => setTimeout(resolve, 3500));
                
            } catch (error) {
                console.error(`❌ Error scanning "${district}":`, error.message);
                districtResults[district] = [];
            }
        }
        
        // Process and analyze results by district
        const uniqueBusinesses = [];
        const seen = new Set();
        const districtAnalysis = {};
        
        for (const business of allBusinesses) {
            const key = `${business.businessName || 'unknown'}_${business.address || 'no-address'}`.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                uniqueBusinesses.push(business);
            }
        }
        
        // Analyze by district
        Object.entries(districtResults).forEach(([district, businesses]) => {
            const qualityLeads = businesses.filter(b => 
                (b.phone || b.website) && (b.dataQualityScore || 0) >= 40
            );
            
            districtAnalysis[district] = {
                totalBusinesses: businesses.length,
                qualityLeads: qualityLeads.length,
                averageQuality: qualityLeads.length > 0 ? 
                    Math.round(qualityLeads.reduce((sum, b) => sum + (b.dataQualityScore || 0), 0) / qualityLeads.length) : 0,
                topBusinesses: qualityLeads.slice(0, 5)
            };
        });
        
        // Filter for contactable leads
        const contactableLeads = uniqueBusinesses.filter(b => 
            (b.phone || b.website) && (b.dataQualityScore || 0) >= 35
        );
        
        // Create results
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `results/dubai-districts-leads-${timestamp}.json`;
        
        const results = {
            campaign: {
                type: 'Dubai Business Districts Lead Generation',
                executedAt: new Date().toISOString(),
                districtsTargeted: testInput.categories,
                focus: 'Geographic coverage across major Dubai business areas'
            },
            summary: {
                totalBusinessesFound: allBusinesses.length,
                uniqueBusinesses: uniqueBusinesses.length,
                contactableLeads: contactableLeads.length,
                averageQualityScore: contactableLeads.length > 0 ?
                    Math.round(contactableLeads.reduce((sum, b) => sum + (b.dataQualityScore || 0), 0) / contactableLeads.length) : 0,
                phoneContacts: contactableLeads.filter(b => b.phone).length,
                websiteContacts: contactableLeads.filter(b => b.website).length
            },
            districtAnalysis: districtAnalysis,
            leads: contactableLeads.sort((a, b) => (b.dataQualityScore || 0) - (a.dataQualityScore || 0))
        };
        
        fs.writeFileSync(filename, JSON.stringify(results, null, 2));
        
        console.log('\n🎉 DUBAI DISTRICTS LEAD GENERATION COMPLETED!');
        console.log('==========================================');
        console.log(`🏙️  Districts scanned: ${Object.keys(districtAnalysis).length}`);
        console.log(`📊 Total businesses found: ${results.summary.totalBusinessesFound}`);
        console.log(`🎯 Contactable leads: ${results.summary.contactableLeads}`);
        console.log(`📞 Phone contacts: ${results.summary.phoneContacts}`);
        console.log(`🌐 Website contacts: ${results.summary.websiteContacts}`);
        console.log(`📈 Average quality: ${results.summary.averageQualityScore}/100`);
        console.log(`📁 Results saved to: ${filename}\n`);
        
        // Show district breakdown
        console.log('📍 LEADS BY DUBAI DISTRICT:');
        console.log('===========================');
        Object.entries(districtAnalysis)
            .sort(([,a], [,b]) => b.qualityLeads - a.qualityLeads)
            .forEach(([district, data]) => {
                if (data.qualityLeads > 0) {
                    console.log(`🏢 ${district.toUpperCase()}: ${data.qualityLeads} leads (avg quality: ${data.averageQuality}/100)`);
                    data.topBusinesses.slice(0, 2).forEach((business, idx) => {
                        console.log(`   ${idx + 1}. ${business.businessName}`);
                        console.log(`      📞 ${business.phone || 'Website'} | ⭐ ${business.rating || 'N/A'}`);
                    });
                    console.log('');
                }
            });
        
        return results;
        
    } catch (error) {
        console.error('❌ Districts lead generation failed:', error);
        return null;
    } finally {
        try {
            await scraper.close?.();
        } catch (e) {
            // Ignore cleanup errors
        }
    }
}

businessDistrictsLeadGeneration().then(results => {
    if (results && results.summary.contactableLeads > 0) {
        console.log(`\n💰 GEOGRAPHIC COVERAGE: ${Object.keys(results.districtAnalysis).length} districts`);
        console.log(`📞 READY FOR AREA-SPECIFIC OUTREACH!`);
        process.exit(0);
    } else {
        console.log('\n❌ Districts lead generation incomplete');
        process.exit(1);
    }
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});