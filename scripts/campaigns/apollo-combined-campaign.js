/**
 * Apollo + Google Maps Combined Campaign
 * Scrapes companies from Google Maps and enriches with C-level contacts from Apollo
 */

const GoogleMapsScraper = require('../../src/scraper');
const ApolloScraper = require('../../src/data-sources/apollo-scraper');
const AIBusinessIntelligence = require('../../src/ai-intelligence');
const { saveToJSON, saveToCSV, formatPhoneNumber } = require('../../src/utils');
const path = require('path');

// Target business categories for Dubai
const TARGET_CATEGORIES = [
    // Technology & Digital
    'software company in Dubai',
    'IT consulting Dubai',
    'digital marketing agency Dubai',
    'web development company Dubai',
    
    // Professional Services
    'business consulting Dubai',
    'management consulting Dubai',
    'accounting firm Dubai',
    'legal services Dubai',
    
    // Trading & Distribution
    'trading company Dubai',
    'import export company Dubai',
    'wholesale distributor Dubai',
    
    // Healthcare
    'private clinic Dubai',
    'medical center Dubai',
    'healthcare provider Dubai',
    
    // Construction & Real Estate
    'construction company Dubai',
    'real estate developer Dubai',
    'facility management Dubai'
];

async function runCombinedCampaign() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║  Apollo + Google Maps Combined Executive Campaign        ║');
    console.log('║  Find companies & enrich with C-level decision makers    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    const gmapsScraper = new GoogleMapsScraper({
        headless: true,
        maxConcurrency: 1,
        requestDelay: 3000,
        timeout: 20000
    });

    const apolloScraper = new ApolloScraper({
        apiKey: process.env.APOLLO_API_KEY,
        rateLimit: 60
    });

    const aiIntelligence = new AIBusinessIntelligence({
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4o-mini'
    });

    const allLeadsWithExecutives = [];
    let totalCompanies = 0;
    let companiesWithExecutives = 0;
    let totalExecutivesFound = 0;

    try {
        // Initialize scrapers
        await gmapsScraper.initialize();
        await apolloScraper.initialize();

        console.log(`\n📋 Processing ${TARGET_CATEGORIES.length} categories...\n`);

        for (const [index, category] of TARGET_CATEGORIES.entries()) {
            console.log(`\n${'═'.repeat(60)}`);
            console.log(`📍 Category ${index + 1}/${TARGET_CATEGORIES.length}: ${category}`);
            console.log('═'.repeat(60));

            try {
                // Step 1: Scrape from Google Maps
                console.log('\n🔍 Step 1: Scraping Google Maps...');
                const gmapsResults = await gmapsScraper.scrapeBusinesses(category, {
                    maxResults: 10,
                    minRating: 3.0
                });

                console.log(`   Found ${gmapsResults.length} businesses`);
                totalCompanies += gmapsResults.length;

                // Step 2: For each company, find executives on Apollo
                for (const [bizIndex, business] of gmapsResults.entries()) {
                    console.log(`\n   🏢 ${bizIndex + 1}. ${business.name}`);

                    // Extract domain from website if available
                    let domain = null;
                    if (business.website) {
                        try {
                            const url = new URL(business.website);
                            domain = url.hostname.replace('www.', '');
                        } catch (e) {
                            console.log(`      ⚠️  Invalid website URL: ${business.website}`);
                        }
                    }

                    // Search for executives using Apollo
                    console.log('      🔎 Searching for C-level executives...');
                    
                    let executives = [];
                    try {
                        const apolloResults = await apolloScraper.searchPeople({
                            companyName: business.name,
                            companyDomain: domain,
                            location: ['United Arab Emirates', 'Dubai'],
                            seniorityLevels: ['founder', 'c_suite', 'vp', 'owner', 'partner'],
                            perPage: 5
                        });

                        executives = apolloResults.contacts || [];
                        
                        if (executives.length > 0) {
                            console.log(`      ✅ Found ${executives.length} executives:`);
                            executives.forEach((exec, i) => {
                                console.log(`         ${i + 1}. ${exec.fullName} - ${exec.title}`);
                                console.log(`            📧 ${exec.email || 'N/A'} | 📱 ${exec.phone || 'N/A'}`);
                            });
                            companiesWithExecutives++;
                            totalExecutivesFound += executives.length;
                        } else {
                            console.log('      ℹ️  No executives found');
                        }

                        // Rate limiting - wait a bit between Apollo searches
                        await new Promise(resolve => setTimeout(resolve, 1500));

                    } catch (apolloError) {
                        console.error(`      ❌ Apollo search failed: ${apolloError.message}`);
                    }

                    // Step 3: AI enhancement for the business
                    console.log('      🤖 Running AI analysis...');
                    let aiInsights = null;
                    try {
                        aiInsights = await aiIntelligence.analyzeBusinessPotential({
                            name: business.name,
                            category: business.category,
                            rating: business.rating,
                            reviewCount: business.reviewCount,
                            website: business.website,
                            address: business.address
                        });
                        console.log(`      📊 Lead Score: ${aiInsights.leadScore}/100 | Priority: ${aiInsights.priority}`);
                    } catch (aiError) {
                        console.error(`      ⚠️  AI analysis failed: ${aiError.message}`);
                    }

                    // Combine all data
                    const enrichedLead = {
                        // Company Info from Google Maps
                        ...business,
                        
                        // Executive Contacts from Apollo
                        executives,
                        executiveCount: executives.length,
                        hasExecutiveContacts: executives.length > 0,
                        
                        // Primary decision maker (first executive found)
                        primaryContact: executives.length > 0 ? {
                            name: executives[0].fullName,
                            title: executives[0].title,
                            email: executives[0].email,
                            phone: executives[0].phone,
                            linkedinUrl: executives[0].linkedinUrl
                        } : null,
                        
                        // AI Intelligence
                        aiAnalysis: aiInsights,
                        
                        // Metadata
                        dataSource: 'google_maps + apollo.io',
                        scrapedAt: new Date().toISOString(),
                        category: category
                    };

                    allLeadsWithExecutives.push(enrichedLead);
                }

                // Small delay between categories
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (categoryError) {
                console.error(`\n❌ Error processing category "${category}":`, categoryError.message);
                continue;
            }
        }

        // Save results
        console.log('\n\n' + '═'.repeat(60));
        console.log('💾 Saving results...');
        console.log('═'.repeat(60));

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `apollo-gmaps-combined-${timestamp}`;
        
        const jsonPath = await saveToJSON(allLeadsWithExecutives, filename);
        console.log(`✅ JSON saved: ${jsonPath}`);
        
        const csvPath = await saveToCSV(allLeadsWithExecutives, filename);
        console.log(`✅ CSV saved: ${csvPath}`);

        // Print comprehensive summary
        console.log('\n\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║                    CAMPAIGN SUMMARY                       ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        
        console.log(`\n📊 Overall Statistics:`);
        console.log(`   Total categories processed: ${TARGET_CATEGORIES.length}`);
        console.log(`   Total companies found: ${totalCompanies}`);
        console.log(`   Companies with executives: ${companiesWithExecutives}`);
        console.log(`   Total executives found: ${totalExecutivesFound}`);
        console.log(`   Average executives per company: ${(totalExecutivesFound / companiesWithExecutives || 0).toFixed(1)}`);
        console.log(`   Executive contact rate: ${((companiesWithExecutives / totalCompanies) * 100).toFixed(1)}%`);

        console.log(`\n🎯 Lead Quality Breakdown:`);
        const highPriority = allLeadsWithExecutives.filter(l => l.aiAnalysis?.priority === 'high').length;
        const mediumPriority = allLeadsWithExecutives.filter(l => l.aiAnalysis?.priority === 'medium').length;
        const lowPriority = allLeadsWithExecutives.filter(l => l.aiAnalysis?.priority === 'low').length;
        
        console.log(`   🔴 High Priority: ${highPriority}`);
        console.log(`   🟡 Medium Priority: ${mediumPriority}`);
        console.log(`   🟢 Low Priority: ${lowPriority}`);

        console.log(`\n💼 Top Leads with Executive Contacts:`);
        const topLeads = allLeadsWithExecutives
            .filter(l => l.hasExecutiveContacts)
            .sort((a, b) => (b.aiAnalysis?.leadScore || 0) - (a.aiAnalysis?.leadScore || 0))
            .slice(0, 10);

        topLeads.forEach((lead, i) => {
            console.log(`\n   ${i + 1}. ${lead.name} (Score: ${lead.aiAnalysis?.leadScore || 'N/A'}/100)`);
            console.log(`      📍 ${lead.address || 'N/A'}`);
            console.log(`      🌐 ${lead.website || 'N/A'}`);
            console.log(`      👥 ${lead.executiveCount} executives found`);
            if (lead.primaryContact) {
                console.log(`      🎯 Primary: ${lead.primaryContact.name} - ${lead.primaryContact.title}`);
                console.log(`         📧 ${lead.primaryContact.email || 'N/A'}`);
                console.log(`         📱 ${lead.primaryContact.phone || 'N/A'}`);
            }
        });

        console.log(`\n📈 API Usage:`);
        console.log(`   Google Maps requests: ${gmapsScraper.stats.totalProcessed}`);
        console.log(`   Apollo API calls: ${apolloScraper.stats.apiCalls}`);
        console.log(`   Apollo credits used: ${apolloScraper.stats.creditsUsed}`);
        console.log(`   OpenAI API calls: ${aiIntelligence.stats.totalProcessed || 0}`);

        console.log('\n✅ Campaign completed successfully!\n');

    } catch (error) {
        console.error('\n❌ Campaign error:', error);
        throw error;
    } finally {
        await gmapsScraper.close();
        await apolloScraper.close();
    }

    return allLeadsWithExecutives;
}

// Run if executed directly
if (require.main === module) {
    runCombinedCampaign()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = runCombinedCampaign;
