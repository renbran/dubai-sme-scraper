/**
 * Apollo C-Level Executive Scraper Test
 * Quick test to find C-suite and decision makers using Apollo.io
 */

const ApolloScraper = require('../../src/data-sources/apollo-scraper');
const fs = require('fs').promises;
const path = require('path');

async function testApolloExecutiveScraper() {
    console.log('=== Apollo C-Level Executive Scraper Test ===\n');

    const scraper = new ApolloScraper({
        apiKey: process.env.APOLLO_API_KEY,
        rateLimit: 60 // Adjust based on your plan
    });

    try {
        await scraper.initialize();

        // Test 1: Search for executives in Dubai tech companies
        console.log('\n--- Test 1: Dubai Tech Executives ---');
        
        const techExecutives = await scraper.searchPeople({
            location: ['United Arab Emirates', 'Dubai'],
            titles: ['CEO', 'CTO', 'CIO', 'VP Technology', 'Director Technology'],
            seniorityLevels: ['c_suite', 'vp', 'director'],
            perPage: 10
        });

        console.log(`\nFound ${techExecutives.contacts.length} tech executives:`);
        techExecutives.contacts.forEach((contact, i) => {
            console.log(`${i + 1}. ${contact.fullName} - ${contact.title} at ${contact.companyName}`);
            console.log(`   Email: ${contact.email || 'N/A'}`);
            console.log(`   Phone: ${contact.phone || 'N/A'}`);
            console.log(`   LinkedIn: ${contact.linkedinUrl || 'N/A'}`);
        });

        // Test 2: Find all C-level at a specific company
        console.log('\n\n--- Test 2: Executives at Specific Company ---');
        
        const companyExecutives = await scraper.searchPeople({
            companyName: 'Careem', // Example Dubai company
            location: ['United Arab Emirates'],
            seniorityLevels: ['founder', 'c_suite', 'vp'],
            perPage: 10
        });

        console.log(`\nFound ${companyExecutives.contacts.length} executives at Careem:`);
        companyExecutives.contacts.forEach((contact, i) => {
            console.log(`${i + 1}. ${contact.fullName} - ${contact.title}`);
            console.log(`   ${contact.email || 'Email not available'}`);
        });

        // Test 3: Search companies with their executives
        console.log('\n\n--- Test 3: Dubai SMEs with Executives ---');
        
        const companiesWithExecs = await scraper.searchCompaniesWithExecutives({
            location: ['United Arab Emirates', 'Dubai'],
            employeeCount: ['11-50', '51-200', '201-500'],
            industries: [], // You can add specific industry IDs
            perPage: 5,
            maxExecutivesPerCompany: 3
        });

        console.log(`\nFound ${companiesWithExecs.companies.length} companies with executives:`);
        companiesWithExecs.companies.forEach((company, i) => {
            console.log(`\n${i + 1}. ${company.name} (${company.employeeRange} employees)`);
            console.log(`   Domain: ${company.domain}`);
            console.log(`   Industry: ${company.industry}`);
            console.log(`   Executives (${company.executiveCount}):`);
            
            company.executives.forEach((exec, j) => {
                console.log(`     ${j + 1}. ${exec.fullName} - ${exec.title}`);
                console.log(`        📧 ${exec.email || 'N/A'}`);
                console.log(`        📱 ${exec.phone || 'N/A'}`);
            });
        });

        // Save results
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultsDir = path.join(__dirname, '../../results');
        
        const results = {
            testDate: new Date().toISOString(),
            techExecutives: techExecutives.contacts,
            companyExecutives: companyExecutives.contacts,
            companiesWithExecutives: companiesWithExecs.companies,
            stats: scraper.getStats(),
            creditsUsed: scraper.stats.creditsUsed
        };

        const filename = `apollo-executives-test-${timestamp}.json`;
        const filepath = path.join(resultsDir, filename);
        
        await fs.writeFile(filepath, JSON.stringify(results, null, 2));
        console.log(`\n\n✅ Results saved to: ${filename}`);

        // Print summary
        console.log('\n=== Summary ===');
        console.log(`Total contacts found: ${techExecutives.contacts.length + companyExecutives.contacts.length}`);
        console.log(`Companies analyzed: ${companiesWithExecs.companies.length}`);
        console.log(`API calls made: ${scraper.stats.apiCalls}`);
        console.log(`Credits used: ${scraper.stats.creditsUsed}`);
        console.log(`Success rate: ${scraper.getStats().successRate}`);

        await scraper.close();

    } catch (error) {
        console.error('\n❌ Error during test:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.status, error.response.data);
        }
        await scraper.close();
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testApolloExecutiveScraper();
}

module.exports = testApolloExecutiveScraper;
