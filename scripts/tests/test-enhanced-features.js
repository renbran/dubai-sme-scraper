// Simple Enhanced Features Test
const {
    extractEmailsFromText,
    extractContactPersons,
    parseLocationDetails,
    cleanEmail,
    calculateQualityScore
} = require('./src/utils');

console.log('🧪 Testing Enhanced Contact Extraction Features...\n');

// Test email extraction
console.log('📧 Testing Email Extraction:');
const sampleTexts = [
    'Contact us at info@dubairealty.com or call +971-4-123-4567',
    'For inquiries, reach out to john.smith@emiratesbrokers.ae',
    'Visit our website or email sales@propertyexperts.com for more details',
    'Mr. Ahmed Al-Rashid - Director, ahmed@luxuryproperties.ae Tel: +971 50 123 4567'
];

sampleTexts.forEach((text, i) => {
    const emails = extractEmailsFromText(text);
    console.log(`${i + 1}. "${text.substring(0, 50)}..."`);
    console.log(`   Found emails: ${emails.length > 0 ? emails.join(', ') : 'None'}\n`);
});

// Test contact person extraction
console.log('👤 Testing Contact Person Extraction:');
const contactTexts = [
    'Contact: Mr. Ahmed Al-Rashid, Property Manager',
    'Owner: Sarah Johnson, Director of Sales',
    'For more information contact Dr. Mohammed Hassan',
    'Managed by Mrs. Linda Thompson - Senior Broker',
    'Founded by Ahmed Al-Mansouri - CEO and Founder'
];

contactTexts.forEach((text, i) => {
    const contacts = extractContactPersons(text);
    console.log(`${i + 1}. "${text}"`);
    console.log(`   Found contacts: ${contacts.length > 0 ? contacts.join(', ') : 'None'}\n`);
});

// Test location parsing
console.log('🏢 Testing Location Details Parsing:');
const addresses = [
    'Office 1204, Building 12, Dubai Marina, Dubai, UAE',
    'Shop 45, Ground Floor, Business Bay Tower, Business Bay, Dubai',
    'Unit 3B, Level 3, Al Barsha Mall, Al Barsha, Dubai, United Arab Emirates',
    'Suite 807, Floor 8, Sheikh Zayed Road, Trade Centre, Dubai'
];

addresses.forEach((address, i) => {
    const details = parseLocationDetails(address);
    console.log(`${i + 1}. "${address}"`);
    console.log(`   Area: ${details.area || 'Not detected'}`);
    console.log(`   Emirate: ${details.emirate || 'Not detected'}`);
    console.log(`   Building: ${details.buildingNumber || 'Not detected'}`);
    console.log(`   Floor: ${details.floor || 'Not detected'}`);
    console.log(`   Office: ${details.office || 'Not detected'}\n`);
});

// Test enhanced quality scoring
console.log('📊 Testing Enhanced Quality Scoring:');
const sampleBusinesses = [
    {
        businessName: 'Dubai Premium Properties',
        phone: '+971-4-123-4567',
        email: 'info@dubaiproperties.com',
        website: 'https://dubaiproperties.com',
        address: 'Office 1204, Dubai Marina, Dubai, UAE',
        rating: 4.5,
        reviewCount: 127,
        description: 'Leading real estate brokerage in Dubai Marina',
        businessHours: 'Mon-Fri 9AM-6PM',
        coordinates: { lat: 25.0657, lng: 55.1713 },
        contactPersons: ['Ahmed Al-Rashid'],
        additionalEmails: ['sales@dubaiproperties.com'],
        businessOwner: 'Ahmed Al-Rashid - Director',
        locationDetails: { area: 'Dubai Marina', emirate: 'Dubai' }
    },
    {
        businessName: 'Basic Realty',
        phone: '+971-4-999-8888',
        address: 'Dubai, UAE'
    },
    {
        businessName: 'Elite Properties',
        phone: '+971-50-123-4567',
        email: 'contact@eliteproperties.ae',
        website: 'https://eliteproperties.ae',
        address: 'Business Bay, Dubai, UAE',
        contactPersons: ['Sarah Johnson', 'Mike Thompson'],
        locationDetails: { area: 'Business Bay' }
    }
];

sampleBusinesses.forEach((business, i) => {
    const score = calculateQualityScore(business);
    console.log(`${i + 1}. ${business.businessName}`);
    console.log(`   Quality Score: ${score}/100`);
    console.log(`   Phone: ${business.phone ? '✅' : '❌'}`);
    console.log(`   Email: ${business.email ? '✅' : '❌'}`);
    console.log(`   Website: ${business.website ? '✅' : '❌'}`);
    console.log(`   Contact Persons: ${business.contactPersons && business.contactPersons.length > 0 ? '✅' : '❌'}`);
    console.log(`   Location Details: ${business.locationDetails && business.locationDetails.area ? '✅' : '❌'}\n`);
});

console.log('✅ Enhanced Features Test Complete!');
console.log('\n💡 Key Enhancements Added:');
console.log('   📧 Automatic email extraction from business descriptions');
console.log('   👤 Contact person identification (Mr./Mrs./Dr. titles, Owner/Manager/Director roles)');
console.log('   🏢 Detailed location parsing (building, floor, office numbers)');
console.log('   📊 Enhanced quality scoring including contact information');
console.log('   📝 Support for multiple emails per business');
console.log('   👔 Business owner/manager information extraction');