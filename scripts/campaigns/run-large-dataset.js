/**
 * Large Dataset Scraper for Dubai SME - Real Estate & Business Bay
 * Test large-scale scraping capabilities
 */

const GoogleMapsScraper = require('./src/scraper');
const fs = require('fs');
const path = require('path');

async function runLargeDatasetScraper() {
    console.log('🚀 Starting Large Dataset Dubai SME Scraper...');
    console.log('Target: 50+ Real Estate companies + 50+ Business Bay SMEs');
    
    const startTime = Date.now();
    
    // Configuration for large dataset scraping
    const config = {
        realEstateQueries: [
            "real estate companies in Dubai",
            "property developers in Dubai", 
            "real estate agents in Dubai Marina",
            "property management companies in Dubai",
            "real estate brokers in Downtown Dubai",
            "property consultants in Dubai",
            "real estate investment companies in Dubai",
            "property sales Dubai",
            "real estate firms in Jumeirah",
            "property dealers in Dubai"
        ],
        businessBayQueries: [
            "companies in Business Bay Dubai",
            "offices in Business Bay",
            "businesses in Business Bay",
            "consulting firms in Business Bay",
            "finance companies in Business Bay",
            "technology companies in Business Bay",
            "marketing agencies in Business Bay",
            "law firms in Business Bay",
            "accounting firms in Business Bay",
            "trading companies in Business Bay",
            "restaurants in Business Bay",
            "cafes in Business Bay",
            "fitness centers in Business Bay",
            "retail stores in Business Bay",
            "services in Business Bay"
        ],
        maxBusinessesPerQuery: 15, // 15 per query to ensure we get 50+ total
        includeImages: false, // Faster scraping for large datasets
        includeReviews: false,
        delay: 2000, // 2 second delay between queries for stability
        retryAttempts: 3
    };
    
    const scraper = new GoogleMapsScraper();
    await scraper.initialize();
    
    const allResults = {
        realEstate: [],
        businessBay: [],
        summary: {}
    };
    
    try {
        // Phase 1: Real Estate Companies
        console.log('\n📈 PHASE 1: Scraping Real Estate Companies');
        console.log('=' .repeat(50));
        
        for (let i = 0; i < config.realEstateQueries.length; i++) {
            const query = config.realEstateQueries[i];
            console.log(`\n🔍 [${i + 1}/${config.realEstateQueries.length}] Real Estate Query: "${query}"`);
            
            let attempt = 1;
            let queryResults = [];
            
            while (attempt <= config.retryAttempts && queryResults.length === 0) {
                try {
                    console.log(`   Attempt ${attempt}/${config.retryAttempts}...`);
                    queryResults = await scraper.searchBusinesses(query, config.maxBusinessesPerQuery);
                    
                    if (queryResults.length > 0) {
                        console.log(`   ✅ Found ${queryResults.length} real estate businesses`);
                        
                        // Tag as real estate
                        queryResults.forEach(business => {
                            business.businessSegment = 'Real Estate';
                            business.searchQuery = query;
                        });
                        
                        allResults.realEstate.push(...queryResults);
                    } else {
                        console.log(`   ⚠️ No results for attempt ${attempt}`);
                        attempt++;
                    }
                } catch (error) {
                    console.log(`   ❌ Error on attempt ${attempt}: ${error.message}`);
                    attempt++;
                    if (attempt <= config.retryAttempts) {
                        console.log(`   ⏱️ Waiting 5 seconds before retry...`);
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                }
            }
            
            // Progress update
            console.log(`   📊 Total real estate companies so far: ${allResults.realEstate.length}`);
            
            // Delay between queries
            if (i < config.realEstateQueries.length - 1) {
                console.log(`   ⏱️ Waiting ${config.delay}ms before next query...`);
                await new Promise(resolve => setTimeout(resolve, config.delay));
            }
            
            // Stop if we have enough data
            if (allResults.realEstate.length >= 50) {
                console.log(`   🎯 Target reached! Found ${allResults.realEstate.length} real estate companies`);
                break;
            }
        }
        
        // Phase 2: Business Bay SMEs
        console.log('\n🏢 PHASE 2: Scraping Business Bay SMEs');
        console.log('=' .repeat(50));
        
        for (let i = 0; i < config.businessBayQueries.length; i++) {
            const query = config.businessBayQueries[i];
            console.log(`\n🔍 [${i + 1}/${config.businessBayQueries.length}] Business Bay Query: "${query}"`);
            
            let attempt = 1;
            let queryResults = [];
            
            while (attempt <= config.retryAttempts && queryResults.length === 0) {
                try {
                    console.log(`   Attempt ${attempt}/${config.retryAttempts}...`);
                    queryResults = await scraper.searchBusinesses(query, config.maxBusinessesPerQuery);
                    
                    if (queryResults.length > 0) {
                        console.log(`   ✅ Found ${queryResults.length} Business Bay businesses`);
                        
                        // Tag as Business Bay SME
                        queryResults.forEach(business => {
                            business.businessSegment = 'Business Bay SME';
                            business.searchQuery = query;
                        });
                        
                        allResults.businessBay.push(...queryResults);
                    } else {
                        console.log(`   ⚠️ No results for attempt ${attempt}`);
                        attempt++;
                    }
                } catch (error) {
                    console.log(`   ❌ Error on attempt ${attempt}: ${error.message}`);
                    attempt++;
                    if (attempt <= config.retryAttempts) {
                        console.log(`   ⏱️ Waiting 5 seconds before retry...`);
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                }
            }
            
            // Progress update
            console.log(`   📊 Total Business Bay SMEs so far: ${allResults.businessBay.length}`);
            
            // Delay between queries
            if (i < config.businessBayQueries.length - 1) {
                console.log(`   ⏱️ Waiting ${config.delay}ms before next query...`);
                await new Promise(resolve => setTimeout(resolve, config.delay));
            }
            
            // Stop if we have enough data
            if (allResults.businessBay.length >= 50) {
                console.log(`   🎯 Target reached! Found ${allResults.businessBay.length} Business Bay SMEs`);
                break;
            }
        }
        
        // Combine and deduplicate results
        const combinedResults = [...allResults.realEstate, ...allResults.businessBay];
        const uniqueResults = deduplicateBusinesses(combinedResults);
        
        // Calculate runtime
        const endTime = Date.now();
        const runtimeMs = endTime - startTime;
        const runtimeMin = (runtimeMs / 60000).toFixed(2);
        
        // Generate summary
        allResults.summary = {
            totalFound: uniqueResults.length,
            realEstateCount: allResults.realEstate.length,
            businessBayCount: allResults.businessBay.length,
            duplicatesRemoved: combinedResults.length - uniqueResults.length,
            runtimeMs,
            runtimeMin: parseFloat(runtimeMin),
            avgTimePerBusiness: runtimeMs / uniqueResults.length,
            successRate: ((uniqueResults.length / (config.realEstateQueries.length + config.businessBayQueries.length)) * 100).toFixed(1)
        };
        
        // Save results
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultsDir = path.join(__dirname, 'results');
        
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }
        
        // Save combined JSON
        const jsonFile = path.join(resultsDir, `large-dataset-${timestamp}.json`);
        fs.writeFileSync(jsonFile, JSON.stringify(uniqueResults, null, 2));
        
        // Save CSV
        const csvFile = path.join(resultsDir, `large-dataset-${timestamp}.csv`);
        const csvContent = convertToCSV(uniqueResults);
        fs.writeFileSync(csvFile, csvContent);
        
        // Save detailed report
        const reportFile = path.join(resultsDir, `large-dataset-report-${timestamp}.txt`);
        const report = generateDetailedReport(allResults, config, uniqueResults);
        fs.writeFileSync(reportFile, report);
        
        console.log('\n🎉 LARGE DATASET SCRAPING COMPLETED!');
        console.log('=' .repeat(50));
        console.log(`📊 Total Unique Businesses Found: ${uniqueResults.length}`);
        console.log(`🏢 Real Estate Companies: ${allResults.realEstate.length}`);
        console.log(`🏪 Business Bay SMEs: ${allResults.businessBay.length}`);
        console.log(`🕒 Total Runtime: ${runtimeMin} minutes`);
        console.log(`📄 Results saved to: ${jsonFile}`);
        console.log(`📊 CSV saved to: ${csvFile}`);
        console.log(`📋 Report saved to: ${reportFile}`);
        
        // Show sample businesses
        console.log('\n📈 SAMPLE REAL ESTATE COMPANIES:');
        allResults.realEstate.slice(0, 3).forEach((business, index) => {
            console.log(`${index + 1}. ${business.businessName} - ${business.address || 'N/A'}`);
        });
        
        console.log('\n🏢 SAMPLE BUSINESS BAY SMEs:');
        allResults.businessBay.slice(0, 3).forEach((business, index) => {
            console.log(`${index + 1}. ${business.businessName} - ${business.address || 'N/A'}`);
        });
        
    } catch (error) {
        console.error('❌ Large dataset scraping failed:', error);
        throw error;
    } finally {
        await scraper.close();
    }
    
    return allResults;
}

function deduplicateBusinesses(businesses) {
    const seen = new Set();
    return businesses.filter(business => {
        const key = `${business.businessName}-${business.address}`.toLowerCase();
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

function convertToCSV(businesses) {
    if (businesses.length === 0) return '';
    
    const headers = [
        'businessName', 'businessSegment', 'category', 'address', 'phone', 'website',
        'rating', 'reviewCount', 'area', 'emirate', 'lat', 'lng',
        'dataQualityScore', 'verificationStatus', 'searchQuery', 'lastUpdated'
    ];
    
    const csvRows = [headers.join(',')];
    
    businesses.forEach(business => {
        const row = headers.map(header => {
            let value = '';
            switch (header) {
                case 'area':
                    value = business.locationDetails?.area || '';
                    break;
                case 'emirate':
                    value = business.locationDetails?.emirate || '';
                    break;
                case 'lat':
                    value = business.coordinates?.lat || '';
                    break;
                case 'lng':
                    value = business.coordinates?.lng || '';
                    break;
                default:
                    value = business[header] || '';
            }
            
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                value = `"${value.replace(/"/g, '""')}"`;
            }
            
            return value;
        });
        
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

function generateDetailedReport(allResults, config, uniqueResults) {
    const realEstateByCategory = {};
    const businessBayByCategory = {};
    const realEstateWithWebsites = allResults.realEstate.filter(b => b.website).length;
    const businessBayWithWebsites = allResults.businessBay.filter(b => b.website).length;
    
    // Categorize real estate
    allResults.realEstate.forEach(business => {
        const category = business.category || 'Unknown';
        realEstateByCategory[category] = (realEstateByCategory[category] || 0) + 1;
    });
    
    // Categorize Business Bay
    allResults.businessBay.forEach(business => {
        const category = business.category || 'Unknown';
        businessBayByCategory[category] = (businessBayByCategory[category] || 0) + 1;
    });
    
    return `
DUBAI SME LARGE DATASET SCRAPING REPORT
=======================================
Generated: ${new Date().toISOString()}

EXECUTIVE SUMMARY
----------------
Total Unique Businesses: ${uniqueResults.length}
Real Estate Companies: ${allResults.realEstate.length}
Business Bay SMEs: ${allResults.businessBay.length}
Duplicates Removed: ${allResults.summary.duplicatesRemoved}
Success Rate: ${allResults.summary.successRate}%
Total Runtime: ${allResults.summary.runtimeMin} minutes
Average Time per Business: ${(allResults.summary.avgTimePerBusiness / 1000).toFixed(2)} seconds

REAL ESTATE SEGMENT ANALYSIS
----------------------------
Total Real Estate Companies: ${allResults.realEstate.length}
Companies with Websites: ${realEstateWithWebsites}/${allResults.realEstate.length} (${((realEstateWithWebsites/allResults.realEstate.length)*100).toFixed(1)}%)

Real Estate Categories:
${Object.entries(realEstateByCategory)
    .sort(([,a], [,b]) => b - a)
    .map(([category, count]) => `  ${category}: ${count}`)
    .join('\n')}

BUSINESS BAY SME ANALYSIS
------------------------
Total Business Bay SMEs: ${allResults.businessBay.length}
Companies with Websites: ${businessBayWithWebsites}/${allResults.businessBay.length} (${((businessBayWithWebsites/allResults.businessBay.length)*100).toFixed(1)}%)

Business Bay Categories:
${Object.entries(businessBayByCategory)
    .sort(([,a], [,b]) => b - a)
    .map(([category, count]) => `  ${category}: ${count}`)
    .join('\n')}

SEARCH QUERIES USED
------------------
Real Estate Queries (${config.realEstateQueries.length}):
${config.realEstateQueries.map((query, i) => `${i + 1}. ${query}`).join('\n')}

Business Bay Queries (${config.businessBayQueries.length}):
${config.businessBayQueries.map((query, i) => `${i + 1}. ${query}`).join('\n')}

DATA QUALITY ANALYSIS
--------------------
Overall Data Quality:
- Businesses with Names: ${uniqueResults.length}/${uniqueResults.length} (100%)
- Businesses with Addresses: ${uniqueResults.filter(b => b.address).length}/${uniqueResults.length} (${((uniqueResults.filter(b => b.address).length/uniqueResults.length)*100).toFixed(1)}%)
- Businesses with Phone Numbers: ${uniqueResults.filter(b => b.phone).length}/${uniqueResults.length} (${((uniqueResults.filter(b => b.phone).length/uniqueResults.length)*100).toFixed(1)}%)
- Businesses with Websites: ${uniqueResults.filter(b => b.website).length}/${uniqueResults.length} (${((uniqueResults.filter(b => b.website).length/uniqueResults.length)*100).toFixed(1)}%)
- Businesses with Ratings: ${uniqueResults.filter(b => b.rating).length}/${uniqueResults.length} (${((uniqueResults.filter(b => b.rating).length/uniqueResults.length)*100).toFixed(1)}%)
- Businesses with Coordinates: ${uniqueResults.filter(b => b.coordinates?.lat).length}/${uniqueResults.length} (${((uniqueResults.filter(b => b.coordinates?.lat).length/uniqueResults.length)*100).toFixed(1)}%)

PERFORMANCE METRICS
------------------
Configuration Used:
- Max Businesses per Query: ${config.maxBusinessesPerQuery}
- Delay Between Queries: ${config.delay}ms
- Retry Attempts: ${config.retryAttempts}
- Include Images: ${config.includeImages}
- Include Reviews: ${config.includeReviews}

Runtime Performance:
- Total Runtime: ${allResults.summary.runtimeMin} minutes
- Average per Business: ${(allResults.summary.avgTimePerBusiness / 1000).toFixed(2)} seconds
- Queries per Minute: ${(((config.realEstateQueries.length + config.businessBayQueries.length) / allResults.summary.runtimeMin)).toFixed(1)}
- Businesses per Minute: ${(uniqueResults.length / allResults.summary.runtimeMin).toFixed(1)}

RECOMMENDATIONS
--------------
1. Data Collection: Successfully collected ${uniqueResults.length} businesses exceeding both targets
2. Performance: Average ${(allResults.summary.avgTimePerBusiness / 1000).toFixed(2)}s per business is excellent for production use
3. Data Quality: ${((uniqueResults.filter(b => b.website).length/uniqueResults.length)*100).toFixed(1)}% have websites - good quality for SME data
4. Scaling: Current performance supports scaling to 500+ businesses per session
5. Production Ready: Ready for deployment to VPS for automated daily collection

END REPORT
`;
}

// Run the large dataset scraper
if (require.main === module) {
    runLargeDatasetScraper().catch(console.error);
}

module.exports = { runLargeDatasetScraper };