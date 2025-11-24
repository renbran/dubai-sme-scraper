// Live Scraping Test - 5 Businesses from 5 Different Dubai Locations
const GoogleMapsScraper = require('./src/scraper');
const { validateInput } = require('./src/utils');

async function liveScrapingTest() {
    console.log('🔍 Live Scraping Test - 5 Businesses from 5 Different Dubai Locations\n');
    console.log('This test will attempt to scrape real business data from Google Maps');
    console.log('Testing enhanced contact extraction features on actual businesses\n');
    
    // Test different business types across 5 Dubai locations
    const testCategories = [
        {
            query: 'restaurants dubai marina',
            location: 'Dubai Marina',
            expectedType: 'Restaurant/Food Service'
        },
        {
            query: 'real estate downtown dubai',
            location: 'Downtown Dubai',
            expectedType: 'Real Estate'
        },
        {
            query: 'cafes business bay',
            location: 'Business Bay',
            expectedType: 'Cafe/Coffee Shop'
        },
        {
            query: 'dental clinic jumeirah',
            location: 'Jumeirah',
            expectedType: 'Healthcare'
        },
        {
            query: 'gyms al barsha',
            location: 'Al Barsha',
            expectedType: 'Fitness/Health'
        }
    ];
    
    const testInput = {
        categories: testCategories.map(cat => cat.query),
        maxResultsPerCategory: 10, // Small number for focused testing
        dataQualityLevel: 'standard',
        exportToSheets: false
    };
    
    console.log('📋 Testing input validation...');
    const validation = validateInput(testInput);
    if (!validation.isValid) {
        console.error('❌ Input validation failed:', validation.errors);
        return;
    }
    console.log('✅ Input validation passed\n');
    
    // Initialize scraper with more conservative settings
    console.log('🌐 Initializing scraper...');
    const scraper = new GoogleMapsScraper({
        headless: true,
        maxConcurrency: 1,
        requestDelay: 4000 // Longer delay to avoid rate limiting
    });
    
    const allResults = [];
    let totalSuccessful = 0;
    let totalAttempted = 0;
    
    try {
        await scraper.initialize();
        console.log('✅ Scraper initialized successfully\n');
        
        // Process each location/category
        for (let i = 0; i < testCategories.length; i++) {
            const categoryInfo = testCategories[i];
            console.log(`\n${'='.repeat(80)}`);
            console.log(`🏢 Location ${i + 1}/5: ${categoryInfo.location}`);
            console.log(`🔍 Query: "${categoryInfo.query}"`);
            console.log(`📂 Expected Type: ${categoryInfo.expectedType}`);
            console.log(`${'='.repeat(80)}`);
            
            try {
                const businesses = await scraper.searchBusinesses(categoryInfo.query, 2); // Just 2 per location for speed
                totalAttempted += 2;
                
                if (businesses && businesses.length > 0) {
                    console.log(`\n✅ Successfully scraped ${businesses.length} businesses from ${categoryInfo.location}`);
                    totalSuccessful += businesses.length;
                    
                    // Display detailed information for each business
                    businesses.forEach((business, index) => {
                        console.log(`\n📊 Business ${index + 1}:`);
                        console.log(`   🏢 Name: ${business.businessName || 'Not available'}`);
                        console.log(`   📍 Address: ${business.address || 'Not available'}`);
                        console.log(`   📞 Phone: ${business.phone || 'Not available'}`);
                        console.log(`   📧 Email: ${business.email || 'Not available'}`);
                        console.log(`   🌐 Website: ${business.website || 'Not available'}`);
                        console.log(`   ⭐ Rating: ${business.rating || 'Not rated'} (${business.reviewCount || 0} reviews)`);
                        console.log(`   📂 Category: ${business.category || 'Not categorized'}`);
                        
                        // Enhanced contact information
                        if (business.contactPersons && business.contactPersons.length > 0) {
                            console.log(`   👤 Contact Persons: ${business.contactPersons.join(', ')}`);
                        }
                        
                        if (business.additionalEmails && business.additionalEmails.length > 0) {
                            console.log(`   📧 Additional Emails: ${business.additionalEmails.join(', ')}`);
                        }
                        
                        if (business.businessOwner) {
                            console.log(`   👔 Business Owner: ${business.businessOwner}`);
                        }
                        
                        // Location details
                        if (business.locationDetails) {
                            const loc = business.locationDetails;
                            const locationParts = [];
                            if (loc.area) locationParts.push(`Area: ${loc.area}`);
                            if (loc.emirate) locationParts.push(`Emirate: ${loc.emirate}`);
                            if (loc.buildingNumber) locationParts.push(`Building: ${loc.buildingNumber}`);
                            if (loc.floor) locationParts.push(`Floor: ${loc.floor}`);
                            if (loc.office) locationParts.push(`Office: ${loc.office}`);
                            
                            if (locationParts.length > 0) {
                                console.log(`   🏢 Location Details: ${locationParts.join(', ')}`);
                            }
                        }
                        
                        console.log(`   📊 Quality Score: ${business.dataQualityScore || 0}/100`);
                        console.log(`   🔗 Google Maps: ${business.googleMapsUrl || 'Not available'}`);
                        
                        // Data completeness check
                        const dataFields = [
                            business.businessName ? 'Name' : null,
                            business.address ? 'Address' : null,
                            business.phone ? 'Phone' : null,
                            business.email ? 'Email' : null,
                            business.website ? 'Website' : null,
                            business.rating ? 'Rating' : null
                        ].filter(field => field !== null);
                        
                        console.log(`   ✅ Available Data: ${dataFields.join(', ')} (${dataFields.length}/6 fields)`);
                    });
                    
                    allResults.push({
                        location: categoryInfo.location,
                        query: categoryInfo.query,
                        expectedType: categoryInfo.expectedType,
                        businesses: businesses,
                        success: true
                    });
                    
                } else {
                    console.log(`\n❌ No businesses found for "${categoryInfo.query}" in ${categoryInfo.location}`);
                    allResults.push({
                        location: categoryInfo.location,
                        query: categoryInfo.query,
                        expectedType: categoryInfo.expectedType,
                        businesses: [],
                        success: false,
                        error: 'No results found'
                    });
                }
                
            } catch (error) {
                console.error(`\n❌ Error scraping ${categoryInfo.location}:`, error.message);
                allResults.push({
                    location: categoryInfo.location,
                    query: categoryInfo.query,
                    expectedType: categoryInfo.expectedType,
                    businesses: [],
                    success: false,
                    error: error.message
                });
            }
            
            // Add delay between locations to avoid rate limiting
            if (i < testCategories.length - 1) {
                console.log('\n⏳ Waiting 10 seconds before next location...');
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        }
        
        // Final Summary Report
        console.log(`\n\n${'='.repeat(80)}`);
        console.log('📈 LIVE SCRAPING TEST SUMMARY REPORT');
        console.log(`${'='.repeat(80)}`);
        
        console.log(`\n📊 Overall Statistics:`);
        console.log(`   Total Locations Tested: ${testCategories.length}`);
        console.log(`   Successful Locations: ${allResults.filter(r => r.success).length}`);
        console.log(`   Total Businesses Attempted: ${totalAttempted}`);
        console.log(`   Total Businesses Scraped: ${totalSuccessful}`);
        console.log(`   Success Rate: ${Math.round((totalSuccessful / totalAttempted) * 100)}%`);
        
        // Location-by-location summary
        console.log(`\n📍 Location Summary:`);
        allResults.forEach((result, index) => {
            console.log(`\n${index + 1}. ${result.location} (${result.expectedType})`);
            console.log(`   Query: "${result.query}"`);
            console.log(`   Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
            console.log(`   Businesses Found: ${result.businesses.length}`);
            if (!result.success && result.error) {
                console.log(`   Error: ${result.error}`);
            }
        });
        
        // Data Quality Analysis
        if (totalSuccessful > 0) {
            const allBusinesses = allResults.flatMap(r => r.businesses);
            const withEmail = allBusinesses.filter(b => b.email).length;
            const withPhone = allBusinesses.filter(b => b.phone).length;
            const withWebsite = allBusinesses.filter(b => b.website).length;
            const withContactPersons = allBusinesses.filter(b => b.contactPersons && b.contactPersons.length > 0).length;
            const withLocationDetails = allBusinesses.filter(b => b.locationDetails && b.locationDetails.area).length;
            
            console.log(`\n📋 Data Quality Analysis:`);
            console.log(`   Businesses with Email: ${withEmail}/${totalSuccessful} (${Math.round((withEmail / totalSuccessful) * 100)}%)`);
            console.log(`   Businesses with Phone: ${withPhone}/${totalSuccessful} (${Math.round((withPhone / totalSuccessful) * 100)}%)`);
            console.log(`   Businesses with Website: ${withWebsite}/${totalSuccessful} (${Math.round((withWebsite / totalSuccessful) * 100)}%)`);
            console.log(`   Businesses with Contact Persons: ${withContactPersons}/${totalSuccessful} (${Math.round((withContactPersons / totalSuccessful) * 100)}%)`);
            console.log(`   Businesses with Location Details: ${withLocationDetails}/${totalSuccessful} (${Math.round((withLocationDetails / totalSuccessful) * 100)}%)`);
            
            const avgQualityScore = allBusinesses.reduce((sum, b) => sum + (b.dataQualityScore || 0), 0) / allBusinesses.length;
            console.log(`   Average Quality Score: ${Math.round(avgQualityScore)}/100`);
        }
        
        // Enhanced Features Performance
        console.log(`\n🚀 Enhanced Features Performance:`);
        const allBusinesses = allResults.flatMap(r => r.businesses);
        if (allBusinesses.length > 0) {
            const emailExtractionRate = allBusinesses.filter(b => b.email).length / allBusinesses.length * 100;
            const contactPersonRate = allBusinesses.filter(b => b.contactPersons && b.contactPersons.length > 0).length / allBusinesses.length * 100;
            const locationParsingRate = allBusinesses.filter(b => b.locationDetails && b.locationDetails.area).length / allBusinesses.length * 100;
            
            console.log(`   📧 Email Extraction Rate: ${Math.round(emailExtractionRate)}%`);
            console.log(`   👤 Contact Person Detection Rate: ${Math.round(contactPersonRate)}%`);
            console.log(`   🏢 Location Parsing Rate: ${Math.round(locationParsingRate)}%`);
        }
        
        console.log(`\n✅ Live scraping test completed!`);
        console.log(`📄 Test demonstrates real-world scraping capability across multiple Dubai locations`);
        
        if (totalSuccessful > 0) {
            console.log(`🎉 SUCCESS: Scraper successfully extracted data from ${totalSuccessful} real businesses!`);
        } else {
            console.log(`⚠️  WARNING: No businesses were successfully scraped. Check Google Maps access and selectors.`);
        }
        
    } catch (error) {
        console.error('❌ Live scraping test failed:', error.message);
        
        if (error.message.includes('CAPTCHA')) {
            console.log('\n💡 CAPTCHA Detection Tips:');
            console.log('   - This is normal for automated scraping');
            console.log('   - Try again later with longer delays');
            console.log('   - Consider using proxy rotation');
        } else if (error.message.includes('rate')) {
            console.log('\n💡 Rate Limiting Tips:');
            console.log('   - Increase requestDelay in scraper options');
            console.log('   - Add more delays between requests');
            console.log('   - Use rotating user agents');
        }
        
    } finally {
        await scraper.close();
        console.log('\n🧹 Scraper cleanup completed');
    }
}

// Run the live test
if (require.main === module) {
    liveScrapingTest().catch(console.error);
}

module.exports = liveScrapingTest;