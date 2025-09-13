// Real Estate Brokerage Test - Enhanced with contact details extraction
const GoogleMapsScraper = require('./src/scraper');
const { validateInput } = require('./src/utils');

async function realEstateTest() {
    console.log('🏢 Starting Real Estate Brokerage Companies Test...\n');
    
    // Test input for real estate brokerages in Dubai
    const testInput = {
        categories: [
            'real estate companies dubai marina',
            'property brokers business bay',
            'real estate agents downtown dubai'
        ],
        maxResultsPerCategory: 15,
        dataQualityLevel: 'high',
        exportToSheets: false  // Disable sheets for testing
    };
    
    console.log('📋 Testing input validation...');
    const validation = validateInput(testInput);
    if (!validation.isValid) {
        console.error('❌ Input validation failed:', validation.errors);
        return;
    }
    console.log('✅ Input validation passed\n');
    
    // Initialize scraper
    console.log('🌐 Initializing scraper...');
    const scraper = new GoogleMapsScraper({
        headless: true,
        maxConcurrency: 1,
        requestDelay: 3000
    });
    
    try {
        await scraper.initialize();
        console.log('✅ Scraper initialized successfully\n');
        
        const allBusinesses = [];
        
        // Process each category
        for (let i = 0; i < testInput.categories.length; i++) {
            const category = testInput.categories[i];
            console.log(`🔍 Processing category ${i + 1}/${testInput.categories.length}: "${category}"`);
            
            try {
                const businesses = await scraper.searchBusinesses(category, testInput.maxResultsPerCategory);
                console.log(`✅ Found ${businesses.length} businesses in "${category}"\n`);
                
                allBusinesses.push(...businesses);
                
                // Show sample of enhanced data for first few businesses
                if (i === 0 && businesses.length > 0) {
                    console.log('📊 Sample Enhanced Data Preview:');
                    console.log('═'.repeat(60));
                    
                    businesses.slice(0, 3).forEach((business, index) => {
                        console.log(`\n${index + 1}. ${business.businessName}`);
                        console.log(`   📍 Address: ${business.address || 'Not available'}`);
                        console.log(`   📞 Phone: ${business.phone || 'Not available'}`);
                        console.log(`   📧 Email: ${business.email || 'Not available'}`);
                        
                        if (business.additionalEmails && business.additionalEmails.length > 0) {
                            console.log(`   📧 Additional Emails: ${business.additionalEmails.join(', ')}`);
                        }
                        
                        if (business.contactPersons && business.contactPersons.length > 0) {
                            console.log(`   👤 Contact Persons: ${business.contactPersons.join(', ')}`);
                        }
                        
                        if (business.businessOwner) {
                            console.log(`   👔 Business Owner: ${business.businessOwner}`);
                        }
                        
                        if (business.locationDetails) {
                            const loc = business.locationDetails;
                            console.log(`   🏢 Location Details:`);
                            if (loc.area) console.log(`      Area: ${loc.area}`);
                            if (loc.emirate) console.log(`      Emirate: ${loc.emirate}`);
                            if (loc.buildingNumber) console.log(`      Building: ${loc.buildingNumber}`);
                            if (loc.floor) console.log(`      Floor: ${loc.floor}`);
                            if (loc.office) console.log(`      Office: ${loc.office}`);
                        }
                        
                        console.log(`   🌐 Website: ${business.website || 'Not available'}`);
                        console.log(`   ⭐ Rating: ${business.rating || 'No rating'} (${business.reviewCount || 0} reviews)`);
                        console.log(`   📂 Category: ${business.category}`);
                        console.log(`   📊 Quality Score: ${business.dataQualityScore}/100`);
                    });
                    
                    console.log('\n═'.repeat(60));
                }
                
            } catch (error) {
                console.error(`❌ Error processing category "${category}":`, error.message);
            }
            
            // Add delay between categories
            if (i < testInput.categories.length - 1) {
                console.log('⏳ Waiting before next category...');
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
        
        // Final statistics
        console.log('\n📈 Final Test Results:');
        console.log('═'.repeat(50));
        console.log(`Total businesses found: ${allBusinesses.length}`);
        
        const withEmail = allBusinesses.filter((b) => b.email).length;
        const withPhone = allBusinesses.filter((b) => b.phone).length;
        const withContactPersons = allBusinesses.filter((b) => b.contactPersons && b.contactPersons.length > 0).length;
        const withLocationDetails = allBusinesses.filter((b) => b.locationDetails && b.locationDetails.area).length;
        const withWebsite = allBusinesses.filter((b) => b.website).length;
        
        console.log(`Businesses with email: ${withEmail} (${Math.round((withEmail / allBusinesses.length) * 100)}%)`);
        console.log(`Businesses with phone: ${withPhone} (${Math.round((withPhone / allBusinesses.length) * 100)}%)`);
        console.log(`Businesses with contact persons: ${withContactPersons} (${Math.round((withContactPersons / allBusinesses.length) * 100)}%)`);
        console.log(`Businesses with detailed location: ${withLocationDetails} (${Math.round((withLocationDetails / allBusinesses.length) * 100)}%)`);
        console.log(`Businesses with website: ${withWebsite} (${Math.round((withWebsite / allBusinesses.length) * 100)}%)`);
        
        const avgQualityScore = allBusinesses.reduce((sum, b) => sum + (b.dataQualityScore || 0), 0) / allBusinesses.length;
        console.log(`Average quality score: ${Math.round(avgQualityScore)}/100`);
        
        console.log('\n🎉 Real Estate Test Completed Successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.message === 'CAPTCHA_DETECTED') {
            console.log('💡 CAPTCHA detected. This is normal for Google Maps scraping.');
            console.log('💡 Try again later or implement CAPTCHA solving.');
        } else if (error.message === 'RATE_LIMITED') {
            console.log('💡 Rate limiting detected. Try with longer delays between requests.');
        }
    } finally {
        await scraper.close();
        console.log('🧹 Cleanup completed');
    }
}

// Run the test
if (require.main === module) {
    realEstateTest().catch(console.error);
}

module.exports = realEstateTest;