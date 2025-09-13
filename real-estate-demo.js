// Real Estate Sample Data Demo
console.log('🏢 Real Estate Brokerage Data Enhancement Demo\n');

// Simulate extracted business data as it would come from Google Maps
const sampleRealEstateBusinesses = [
    {
        businessName: 'Emirates Property Group',
        address: 'Office 1504, Marina Plaza, Dubai Marina, Dubai, UAE',
        phone: '+971-4-368-5555',
        website: 'https://emiratesproperties.ae',
        description: 'Leading real estate brokerage specializing in Dubai Marina properties. Contact our director Mr. Ahmed Al-Rashid for premium listings.',
        rating: 4.7,
        reviewCount: 189,
        category: 'Real Estate',
        rawTextContent: 'Emirates Property Group - Leading real estate brokerage in Dubai Marina. Contact: Mr. Ahmed Al-Rashid, Director of Sales. Email: info@emiratesproperties.ae or ahmed.alrashid@emiratesproperties.ae Phone: +971-4-368-5555'
    },
    {
        businessName: 'Dubai Elite Realty',
        address: 'Suite 802, Business Bay Tower, Business Bay, Dubai',
        phone: '+971-50-123-4567',
        website: 'https://dubaiEliterealty.com',
        description: 'Premium property services in Business Bay and Downtown. Founded by Sarah Johnson.',
        rating: 4.5,
        reviewCount: 96,
        category: 'Real Estate',
        rawTextContent: 'Dubai Elite Realty - Premium property services. Owner: Sarah Johnson, Licensed Broker. Contact sarah@dubaieliterealty.com or call our office.'
    },
    {
        businessName: 'Al Mansouri Properties',
        address: 'Ground Floor, Building 14, Al Barsha, Dubai, UAE',
        phone: '+971-4-887-9999',
        description: 'Family-owned real estate business serving Dubai since 1998.',
        rating: 4.2,
        reviewCount: 67,
        category: 'Real Estate',
        rawTextContent: 'Al Mansouri Properties - Family business est. 1998. Managed by Dr. Mohammed Al-Mansouri. Office phone +971-4-887-9999. No email available.'
    }
];

// Import our enhanced utility functions
const {
    extractEmailsFromText,
    extractContactPersons,
    parseLocationDetails,
    calculateQualityScore
} = require('./src/utils');

console.log('📊 Enhanced Real Estate Business Data:\n');
console.log('═'.repeat(80));

// Process each business with enhanced data extraction
sampleRealEstateBusinesses.forEach((business, index) => {
    console.log(`\n${index + 1}. ${business.businessName}`);
    console.log('─'.repeat(60));
    
    // Basic information
    console.log(`📍 Address: ${business.address}`);
    console.log(`📞 Phone: ${business.phone || 'Not available'}`);
    console.log(`🌐 Website: ${business.website || 'Not available'}`);
    console.log(`⭐ Rating: ${business.rating || 'Not rated'} (${business.reviewCount || 0} reviews)`);
    
    // Enhanced contact extraction
    const emails = extractEmailsFromText(business.rawTextContent || business.description);
    const contactPersons = extractContactPersons(business.rawTextContent || business.description);
    const locationDetails = parseLocationDetails(business.address);
    
    // Add enhanced data to business object
    business.email = emails.length > 0 ? emails[0] : null;
    business.additionalEmails = emails.slice(1);
    business.contactPersons = contactPersons;
    business.locationDetails = locationDetails;
    
    // Display enhanced contact information
    console.log('\n📧 Contact Information:');
    if (business.email) {
        console.log(`   Primary Email: ${business.email}`);
    }
    if (business.additionalEmails && business.additionalEmails.length > 0) {
        console.log(`   Additional Emails: ${business.additionalEmails.join(', ')}`);
    }
    if (!business.email && business.additionalEmails.length === 0) {
        console.log(`   Email: Not available`);
    }
    
    console.log('\n👤 Contact Persons:');
    if (contactPersons.length > 0) {
        contactPersons.forEach((person) => {
            console.log(`   • ${person}`);
        });
    } else {
        console.log(`   No specific contact persons identified`);
    }
    
    console.log('\n🏢 Location Details:');
    console.log(`   Area: ${locationDetails.area || 'Not specified'}`);
    console.log(`   Emirate: ${locationDetails.emirate || 'Not specified'}`);
    if (locationDetails.buildingNumber) {
        console.log(`   Building: ${locationDetails.buildingNumber}`);
    }
    if (locationDetails.floor) {
        console.log(`   Floor: ${locationDetails.floor}`);
    }
    if (locationDetails.office) {
        console.log(`   Office/Suite: ${locationDetails.office}`);
    }
    
    // Calculate enhanced quality score
    const qualityScore = calculateQualityScore(business);
    console.log(`\n📊 Data Quality Score: ${qualityScore}/100`);
    
    // Quality breakdown
    const qualityFactors = [];
    if (business.phone) qualityFactors.push('Phone ✅');
    if (business.email) qualityFactors.push('Email ✅');
    if (business.website) qualityFactors.push('Website ✅');
    if (business.contactPersons && business.contactPersons.length > 0) qualityFactors.push('Contact Person ✅');
    if (business.locationDetails && business.locationDetails.area) qualityFactors.push('Location Details ✅');
    if (business.rating && business.rating > 0) qualityFactors.push('Rating ✅');
    
    console.log(`   Quality Factors: ${qualityFactors.join(', ')}`);
});

console.log('\n═'.repeat(80));
console.log('\n📈 Summary Statistics:');

const totalBusinesses = sampleRealEstateBusinesses.length;
const withEmail = sampleRealEstateBusinesses.filter((b) => b.email).length;
const withContactPersons = sampleRealEstateBusinesses.filter((b) => b.contactPersons && b.contactPersons.length > 0).length;
const withDetailedLocation = sampleRealEstateBusinesses.filter((b) => b.locationDetails && b.locationDetails.area).length;
const avgQualityScore = sampleRealEstateBusinesses.reduce((sum, b) => sum + calculateQualityScore(b), 0) / totalBusinesses;

console.log(`Total Real Estate Businesses: ${totalBusinesses}`);
console.log(`Businesses with Email: ${withEmail}/${totalBusinesses} (${Math.round((withEmail / totalBusinesses) * 100)}%)`);
console.log(`Businesses with Contact Persons: ${withContactPersons}/${totalBusinesses} (${Math.round((withContactPersons / totalBusinesses) * 100)}%)`);
console.log(`Businesses with Detailed Location: ${withDetailedLocation}/${totalBusinesses} (${Math.round((withDetailedLocation / totalBusinesses) * 100)}%)`);
console.log(`Average Quality Score: ${Math.round(avgQualityScore)}/100`);

console.log('\n🎯 Key Improvements for Real Estate Scraping:');
console.log('   📧 Automatic email extraction from business descriptions');
console.log('   👤 Director/Owner/Manager identification');
console.log('   🏢 Office/Suite/Floor location parsing');
console.log('   📞 Enhanced contact information organization');
console.log('   📊 Quality scoring that prioritizes contact completeness');
console.log('   🔍 Support for Arabic names and UAE-specific business patterns');

console.log('\n✅ Real Estate Enhancement Demo Complete!');