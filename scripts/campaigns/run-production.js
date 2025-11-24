/**
 * Production runner for Dubai SME Scraper
 * Scale up for larger datasets
 */

const GoogleMapsScraper = require('./src/GoogleMapsScraper');
const fs = require('fs');
const path = require('path');

async function runProductionScraper() {
    console.log('🚀 Starting Production Dubai SME Scraper...');
    
    // Production configuration
    const config = {
        searchQueries: [
            // Restaurants by area
            "restaurants in Dubai Marina",
            "restaurants in Downtown Dubai", 
            "restaurants in Jumeirah",
            "restaurants in Business Bay",
            
            // Cafes by area
            "cafes in Dubai Marina",
            "cafes in Downtown Dubai",
            "cafes in DIFC",
            
            // Other business types
            "retail stores in Dubai Mall",
            "fitness centers in Dubai Marina",
            "beauty salons in Jumeirah"
        ],
        maxBusinessesPerQuery: 20, // Increase for production
        includeImages: true,
        includeReviews: false, // Set to true if needed
        concurrency: 2, // Parallel searches
        delay: 1000, // Delay between requests
        outputFormat: 'both' // JSON + CSV
    };
    
    const scraper = new GoogleMapsScraper();
    await scraper.initialize();
    
    const allResults = [];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        console.log(`📊 Processing ${config.searchQueries.length} search queries...`);
        
        for (let i = 0; i < config.searchQueries.length; i++) {
            const query = config.searchQueries[i];
            console.log(`\n🔍 [${i + 1}/${config.searchQueries.length}] Searching: "${query}"`);
            
            const results = await scraper.scrapeBusinesses(query, {
                maxResults: config.maxBusinessesPerQuery,
                includeImages: config.includeImages,
                includeReviews: config.includeReviews
            });
            
            console.log(`✅ Found ${results.length} businesses for "${query}"`);
            allResults.push(...results);
            
            // Add delay between queries
            if (i < config.searchQueries.length - 1) {
                console.log(`⏱️ Waiting ${config.delay}ms before next query...`);
                await new Promise(resolve => setTimeout(resolve, config.delay));
            }
        }
        
        // Save results
        const resultsDir = path.join(__dirname, 'results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }
        
        // Save JSON
        const jsonFile = path.join(resultsDir, `production-results-${timestamp}.json`);
        fs.writeFileSync(jsonFile, JSON.stringify(allResults, null, 2));
        
        // Save CSV  
        if (config.outputFormat === 'both' || config.outputFormat === 'csv') {
            const csvFile = path.join(resultsDir, `production-results-${timestamp}.csv`);
            const csvContent = convertToCSV(allResults);
            fs.writeFileSync(csvFile, csvContent);
        }
        
        // Generate summary report
        const summary = generateSummaryReport(allResults, config);
        const summaryFile = path.join(resultsDir, `production-summary-${timestamp}.txt`);
        fs.writeFileSync(summaryFile, summary);
        
        console.log('\n🎉 Production scraping completed!');
        console.log(`📄 Results saved to: ${jsonFile}`);
        console.log(`📊 Total businesses found: ${allResults.length}`);
        console.log(`📈 Summary report: ${summaryFile}`);
        
    } catch (error) {
        console.error('❌ Production scraping failed:', error);
    } finally {
        await scraper.close();
    }
}

function convertToCSV(businesses) {
    if (businesses.length === 0) return '';
    
    const headers = [
        'businessName', 'category', 'address', 'phone', 'website', 
        'rating', 'reviewCount', 'area', 'emirate', 'lat', 'lng',
        'dataQualityScore', 'verificationStatus', 'lastUpdated'
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

function generateSummaryReport(businesses, config) {
    const total = businesses.length;
    const categories = {};
    const areas = {};
    const ratings = businesses.filter(b => b.rating).map(b => b.rating);
    
    businesses.forEach(business => {
        // Count by category
        const category = business.category || 'Unknown';
        categories[category] = (categories[category] || 0) + 1;
        
        // Count by area
        const area = business.locationDetails?.area || 'Unknown';
        areas[area] = (areas[area] || 0) + 1;
    });
    
    const avgRating = ratings.length > 0 ? 
        (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 'N/A';
    
    return `
DUBAI SME SCRAPER - PRODUCTION REPORT
=====================================
Generated: ${new Date().toISOString()}

OVERVIEW
--------
Total Businesses Scraped: ${total}
Search Queries Processed: ${config.searchQueries.length}
Average Rating: ${avgRating}/5.0
Businesses with Ratings: ${ratings.length}/${total} (${((ratings.length/total)*100).toFixed(1)}%)

BREAKDOWN BY CATEGORY
--------------------
${Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .map(([category, count]) => `${category}: ${count}`)
    .join('\n')}

BREAKDOWN BY AREA
-----------------
${Object.entries(areas)
    .sort(([,a], [,b]) => b - a)
    .map(([area, count]) => `${area}: ${count}`)
    .join('\n')}

SEARCH QUERIES
--------------
${config.searchQueries.map((query, i) => `${i + 1}. ${query}`).join('\n')}

DATA QUALITY
------------
Businesses with Websites: ${businesses.filter(b => b.website).length}/${total}
Businesses with Phone Numbers: ${businesses.filter(b => b.phone).length}/${total}
Businesses with Coordinates: ${businesses.filter(b => b.coordinates?.lat).length}/${total}
`;
}

// Run the production scraper
if (require.main === module) {
    runProductionScraper().catch(console.error);
}

module.exports = { runProductionScraper };