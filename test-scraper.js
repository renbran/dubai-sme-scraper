#!/usr/bin/env node

/**
 * Simple local test for Dubai SME Scraper
 * Bypasses Apify Actor structure for direct local execution
 */

const GoogleMapsScraper = require('./src/scraper');
const fs = require('fs');
const path = require('path');

// CSV conversion function
function convertToCSV(businesses) {
    if (businesses.length === 0) return '';
    
    const headers = [
        'businessName', 'category', 'address', 'phone', 'website',
        'rating', 'reviewCount', 'area', 'emirate', 'latitude', 'longitude',
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
                case 'latitude':
                    value = business.coordinates?.lat || '';
                    break;
                case 'longitude':
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

async function testScraper() {
    console.log('🚀 Testing Dubai SME Scraper locally...');
    
    const scraper = new GoogleMapsScraper({
        headless: false, // Set to true for headless mode
        maxConcurrency: 1,
        requestDelay: 2000,
        timeout: 30000,
        proxyConfig: null
    });

    try {
        console.log('🔧 Initializing scraper...');
        await scraper.initialize();
        
        console.log('🔍 Testing search for restaurants in Dubai Marina...');
        const results = await scraper.searchBusinesses('restaurants in Dubai Marina', 3);
        
        console.log(`✅ Found ${results.length} businesses!`);
        
        // Create results directory
        const resultsDir = path.join(__dirname, 'results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir);
        }
        
        // Save results
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const jsonFilename = path.join(resultsDir, `test-results-${timestamp}.json`);
        const csvFilename = path.join(resultsDir, `test-results-${timestamp}.csv`);
        
        // Save JSON
        fs.writeFileSync(jsonFilename, JSON.stringify(results, null, 2));
        
        // Save CSV
        const csvContent = convertToCSV(results);
        fs.writeFileSync(csvFilename, csvContent);
        
        console.log(`📄 JSON results saved to: ${jsonFilename}`);
        console.log(`📊 CSV results saved to: ${csvFilename}`);
        console.log('📊 Sample business:', results[0] || 'No businesses found');
        
        await scraper.close();
        console.log('🎉 Test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        await scraper.close();
        process.exit(1);
    }
}

if (require.main === module) {
    testScraper();
}

module.exports = { testScraper };