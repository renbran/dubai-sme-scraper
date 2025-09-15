#!/usr/bin/env node

/**
 * CSV Converter for Dubai SME Scraper Results
 * Converts JSON results to CSV format
 */

const fs = require('fs');
const path = require('path');

function convertJSONToCSV(jsonFilePath, csvFilePath) {
    console.log(`🔄 Converting ${jsonFilePath} to CSV...`);
    
    // Read JSON file
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
        console.log('❌ No data found in JSON file');
        return;
    }
    
    // Define CSV headers
    const headers = [
        'businessName',
        'businessSegment',
        'category', 
        'address',
        'area',
        'emirate',
        'phone',
        'email',
        'website',
        'facebook',
        'instagram',
        'twitter',
        'linkedin',
        'youtube',
        'whatsapp',
        'rating',
        'reviewCount',
        'latitude',
        'longitude',
        'dataQualityScore',
        'verificationStatus',
        'businessHours',
        'priceRange',
        'searchQuery',
        'lastUpdated'
    ];
    
    // Create CSV content
    const csvRows = [headers.join(',')];
    
    jsonData.forEach(business => {
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
                case 'facebook':
                    value = business.socialMedia?.facebook || '';
                    break;
                case 'instagram':
                    value = business.socialMedia?.instagram || '';
                    break;
                case 'twitter':
                    value = business.socialMedia?.twitter || '';
                    break;
                case 'linkedin':
                    value = business.socialMedia?.linkedin || '';
                    break;
                case 'youtube':
                    value = business.socialMedia?.youtube || '';
                    break;
                case 'whatsapp':
                    value = business.socialMedia?.whatsapp || '';
                    break;
                case 'businessHours':
                    value = business.businessHours ? 
                        Object.entries(business.businessHours)
                            .map(([day, hours]) => `${day}: ${hours}`)
                            .join('; ') : '';
                    break;
                default:
                    value = business[header] || '';
            }
            
            // Escape commas and quotes in CSV
            if (typeof value === 'string') {
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
            }
            
            return value;
        });
        
        csvRows.push(row.join(','));
    });
    
    // Write CSV file
    fs.writeFileSync(csvFilePath, csvRows.join('\n'));
    
    console.log(`✅ CSV file created: ${csvFilePath}`);
    console.log(`📊 Total businesses: ${jsonData.length}`);
    
    return jsonData.length;
}

function convertAllJSONFiles() {
    const resultsDir = path.join(__dirname, 'results');
    
    if (!fs.existsSync(resultsDir)) {
        console.log('❌ Results directory not found');
        return;
    }
    
    const files = fs.readdirSync(resultsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
        console.log('❌ No JSON files found in results directory');
        return;
    }
    
    console.log(`🔍 Found ${jsonFiles.length} JSON files to convert:`);
    
    let totalBusinesses = 0;
    
    jsonFiles.forEach(jsonFile => {
        const jsonFilePath = path.join(resultsDir, jsonFile);
        const csvFileName = jsonFile.replace('.json', '.csv');
        const csvFilePath = path.join(resultsDir, csvFileName);
        
        // Skip if CSV already exists
        if (fs.existsSync(csvFilePath)) {
            console.log(`⚠️ CSV already exists: ${csvFileName} (skipping)`);
            return;
        }
        
        try {
            const count = convertJSONToCSV(jsonFilePath, csvFilePath);
            totalBusinesses += count;
        } catch (error) {
            console.error(`❌ Error converting ${jsonFile}:`, error.message);
        }
    });
    
    console.log(`\n🎉 Conversion complete!`);
    console.log(`📊 Total businesses converted: ${totalBusinesses}`);
}

// Run conversion for all JSON files
if (require.main === module) {
    convertAllJSONFiles();
}

module.exports = { convertJSONToCSV, convertAllJSONFiles };