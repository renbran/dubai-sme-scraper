/**
 * Apify HR Outsourcing Campaign Runner
 * 
 * Uses Apify's infrastructure to scrape Google Maps without bot detection issues.
 * This approach is production-ready and handles all anti-scraping measures automatically.
 * 
 * Prerequisites:
 * 1. Apify account (free tier available at https://apify.com)
 * 2. APIFY_TOKEN environment variable set
 * 3. Actor deployed to Apify platform
 * 
 * Usage:
 *   node scripts/campaigns/apify-hr-outsourcing.js
 */

const fs = require('fs');
const path = require('path');

// Check for Apify SDK
let ApifyClient;
try {
    const { ApifyClient: Client } = require('apify-client');
    ApifyClient = Client;
} catch (error) {
    console.error('\n❌ Apify SDK not installed. Installing now...\n');
    const { execSync } = require('child_process');
    execSync('npm install apify-client', { stdio: 'inherit' });
    const { ApifyClient: Client } = require('apify-client');
    ApifyClient = Client;
}

// Configuration
const CAMPAIGN_CONFIG = {
    name: 'Real Estate - Deira Area Campaign (Phase 1)',
    targetEmployees: '10-500',
    industries: ['Real Estate', 'Property Management', 'Rental Homes', 'Holiday Homes', 'Real Estate Developer', 'Real Estate Valuation', 'Realtor', 'Realty'],
    locations: ['Deira', 'Burjuman', 'Al Rigga', 'Bur Dubai', 'Al Karama', 'Al Mankhool', 'Port Saeed'],
    mandatoryPhone: true,
    maxLeadsTarget: 500,
    phase: 1
};

// Lead qualification function
function qualifyLead(business) {
    let score = 0;
    const flags = [];
    
    // MANDATORY: Must have phone
    const hasPhone = business.phone && 
                     business.phone !== 'Not available' && 
                     business.phone.trim() !== '' &&
                     !business.phone.includes('website');
    
    if (!hasPhone) {
        return { qualified: false, score: 0, reason: 'No phone number' };
    }
    
    // Scoring
    score += 30;  // Has phone
    
    if (business.businessName || business.name) score += 10;
    if (business.address) score += 10;
    if (business.website) score += 15;
    if (business.email || business.emailAddress) score += 20;  // Email is valuable
    if (business.rating && business.rating >= 4.0) score += 10;
    if (business.reviewCount && business.reviewCount >= 10) score += 10;
    
    // Location scoring
    const addressLower = (business.address || '').toLowerCase();
    const primaryLocations = ['business bay', 'jvc', 'jumeirah village', 'jlt', 'jumeirah lakes'];
    if (primaryLocations.some(loc => addressLower.includes(loc))) {
        flags.push('TARGET_LOCATION');
        score += 15;
    }
    
    // Industry scoring
    const categoryLower = (business.category || '').toLowerCase();
    const nameLower = (business.businessName || business.name || '').toLowerCase();
    const targetIndustries = ['real estate', 'property management', 'rental', 'holiday home', 'vacation rental', 'developer', 'valuation', 'realtor', 'realty', 'property'];
    if (targetIndustries.some(ind => categoryLower.includes(ind) || nameLower.includes(ind))) {
        flags.push('TARGET_INDUSTRY');
        score += 10;
    }
    
    // Determine priority
    let priority = 'LOW';
    if (score >= 80) priority = 'URGENT';
    else if (score >= 65) priority = 'HIGH';
    else if (score >= 50) priority = 'MEDIUM';
    
    // Extract email if available
    let email = business.email || business.emailAddress || '';
    if (!email && business.website) {
        // Try to extract from website URL or other fields
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const allText = JSON.stringify(business);
        const matches = allText.match(emailRegex);
        if (matches && matches.length > 0) {
            email = matches[0];
        }
    }
    
    return {
        qualified: score >= 40,
        score,
        priority,
        flags,
        email,
        reason: score < 40 ? 'Score too low' : 'Qualified'
    };
}

// Main runner
async function runApifyCampaign() {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 HR OUTSOURCING CAMPAIGN - APIFY POWERED');
    console.log('='.repeat(80));
    console.log(`📋 Campaign: ${CAMPAIGN_CONFIG.name}`);
    console.log(`🏢 Target: ${CAMPAIGN_CONFIG.targetEmployees} employees`);
    console.log(`📍 Locations: ${CAMPAIGN_CONFIG.locations.join(', ')}`);
    console.log(`🏭 Industries: ${CAMPAIGN_CONFIG.industries.join(', ')}`);
    console.log(`📞 Mandatory Phone: ${CAMPAIGN_CONFIG.mandatoryPhone ? 'YES' : 'NO'}`);
    console.log('='.repeat(80) + '\n');
    
    // Check for Apify token
    const apifyToken = process.env.APIFY_TOKEN;
    if (!apifyToken) {
        console.error('❌ ERROR: APIFY_TOKEN environment variable not set\n');
        console.log('📋 Setup Instructions:');
        console.log('   1. Create free account at: https://apify.com');
        console.log('   2. Get your API token from: https://console.apify.com/account/integrations');
        console.log('   3. Set environment variable:');
        console.log('      Windows: $env:APIFY_TOKEN = "your_token_here"');
        console.log('      Linux/Mac: export APIFY_TOKEN="your_token_here"\n');
        console.log('   4. Or add to .env file: APIFY_TOKEN=your_token_here\n');
        process.exit(1);
    }
    
    // Load input configuration
    const inputPath = path.join(__dirname, '../../apify-inputs/hr-outsourcing-campaign.json');
    if (!fs.existsSync(inputPath)) {
        console.error(`❌ ERROR: Input file not found: ${inputPath}\n`);
        process.exit(1);
    }
    
    const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    console.log(`✅ Loaded configuration: ${input.categories.length} search queries\n`);
    
    // Initialize Apify client
    const client = new ApifyClient({
        token: apifyToken,
    });
    
    console.log('🚀 Starting Apify actor run...\n');
    console.log('   This will use Apify\'s Google Maps scraper actor.');
    console.log('   Benefits:');
    console.log('   ✓ Professional anti-bot handling');
    console.log('   ✓ Proxy rotation included');
    console.log('   ✓ Reliable data extraction');
    console.log('   ✓ No browser crashes\n');
    
    // Use Apify's official Google Maps scraper
    const actorId = 'compass/crawler-google-places';  // Official Apify Google Maps scraper
    
    // Transform our input to Apify's format
    const apifyInput = {
        searchStringsArray: input.categories,
        maxCrawledPlacesPerSearch: input.maxResultsPerCategory,
        language: 'en',
        includeHistogram: false,
        includeOpeningHours: false,
        includePeopleAlsoSearch: false,
        maxReviews: 0,
        maxImages: 0,
        exportPlaceUrls: false,
        scrapeDirectories: false,
        scrapeResponseFromOwnerText: false
    };
    
    try {
        console.log('⏳ Running actor (this may take 15-30 minutes for all searches)...\n');
        
        const run = await client.actor(actorId).call(apifyInput);
        
        // Wait for the run to finish
        console.log(`📝 Actor started. Run ID: ${run.id}`);
        console.log(`   Waiting for completion...`);
        
        const finishedRun = await client.run(run.id).waitForFinish();
        
        console.log(`✅ Actor run completed: ${finishedRun.status}\n`);
        console.log(`📊 Run details:`);
        console.log(`   Run ID: ${finishedRun.id}`);
        console.log(`   Status: ${finishedRun.status}`);
        console.log(`   Started: ${new Date(finishedRun.startedAt).toLocaleString()}`);
        console.log(`   Finished: ${new Date(finishedRun.finishedAt).toLocaleString()}`);
        console.log(`   Duration: ${Math.round((new Date(finishedRun.finishedAt) - new Date(finishedRun.startedAt)) / 60000)} minutes\n`);
        
        // Get dataset results
        console.log('📥 Downloading results...\n');
        const { items } = await client.dataset(finishedRun.defaultDatasetId).listItems();
        
        console.log(`✅ Downloaded ${items.length} businesses\n`);
        
        // Qualify leads
        console.log('🔍 Qualifying leads with mandatory phone requirement...\n');
        
        const qualifiedLeads = [];
        let stats = {
            totalBusinesses: items.length,
            qualifiedCount: 0,
            urgentPriority: 0,
            highPriority: 0,
            mediumPriority: 0,
            withEmail: 0,
            withPhone: 0,
            rejectedNoPhone: 0,
            rejectedLowScore: 0,
            targetLocationCount: 0,
            targetIndustryCount: 0,
            areasCovered: {},
            areasProcessed: []
        };
        
        items.forEach((business, index) => {
            // Track areas covered
            const sourceQuery = business.searchString || '';
            const areaMatch = sourceQuery.match(/(Deira|Burjuman|Al Rigga|Bur Dubai|Al Karama|Al Mankhool|Port Saeed)/i);
            if (areaMatch && !stats.areasProcessed.includes(areaMatch[1])) {
                stats.areasProcessed.push(areaMatch[1]);
            }
            if (areaMatch) {
                stats.areasCovered[areaMatch[1]] = (stats.areasCovered[areaMatch[1]] || 0) + 1;
            }
            const qualification = qualifyLead(business);
            
            if (qualification.qualified) {
                const enrichedLead = {
                    // Normalized fields
                    name: business.businessName || business.title || business.name,
                    phone: business.phone,
                    email: qualification.email || business.email || business.emailAddress || '',
                    address: business.address,
                    website: business.website || business.url,
                    category: business.category || business.categoryName,
                    rating: business.rating,
                    reviewCount: business.reviewCount || business.totalScore,
                    coordinates: business.coordinates || {
                        lat: business.latitude,
                        lng: business.longitude
                    },
                    
                    // Qualification data
                    qualification: qualification,
                    
                    // Campaign metadata
                    sourceQuery: business.searchString || 'unknown',
                    scrapedAt: new Date().toISOString(),
                    campaignName: CAMPAIGN_CONFIG.name,
                    
                    // Original data
                    originalData: business
                };
                
                qualifiedLeads.push(enrichedLead);
                stats.qualifiedCount++;
                
                // Count contact info
                if (enrichedLead.email && enrichedLead.email.trim() !== '') stats.withEmail++;
                if (enrichedLead.phone && enrichedLead.phone.trim() !== '') stats.withPhone++;
                
                if (qualification.priority === 'URGENT') stats.urgentPriority++;
                else if (qualification.priority === 'HIGH') stats.highPriority++;
                else if (qualification.priority === 'MEDIUM') stats.mediumPriority++;
                
                if (qualification.flags.includes('TARGET_LOCATION')) stats.targetLocationCount++;
                if (qualification.flags.includes('TARGET_INDUSTRY')) stats.targetIndustryCount++;
                
                console.log(`  ✓ [${index + 1}/${items.length}] ${enrichedLead.name} [${qualification.priority}] Score: ${qualification.score}`);
            } else {
                if (qualification.reason === 'No phone number') {
                    stats.rejectedNoPhone++;
                } else {
                    stats.rejectedLowScore++;
                }
            }
        });
        
        console.log('\n' + '─'.repeat(80));
        console.log(`\n✅ Qualification complete:`);
        console.log(`   Total: ${stats.totalBusinesses}`);
        console.log(`   Qualified: ${stats.qualifiedCount} (${Math.round((stats.qualifiedCount / stats.totalBusinesses) * 100)}%)`);
        console.log(`   📧 With Email: ${stats.withEmail} (${Math.round((stats.withEmail / stats.qualifiedCount) * 100)}%)`);
        console.log(`   📞 With Phone: ${stats.withPhone} (${Math.round((stats.withPhone / stats.qualifiedCount) * 100)}%)`);
        console.log(`   Rejected (no phone): ${stats.rejectedNoPhone}`);
        console.log(`   Rejected (low score): ${stats.rejectedLowScore}\n`);
        
        // Save results
        const timestamp = Date.now();
        const resultsDir = path.join(__dirname, '../../results');
        
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }
        
        const outputData = {
            campaign: CAMPAIGN_CONFIG,
            apifyRun: {
                runId: finishedRun.id,
                status: finishedRun.status,
                startedAt: finishedRun.startedAt,
                finishedAt: finishedRun.finishedAt,
                datasetId: finishedRun.defaultDatasetId
            },
            stats: stats,
            generatedAt: new Date().toISOString(),
            allBusinesses: items,
            qualifiedLeads: qualifiedLeads
        };
        
        const jsonFile = path.join(resultsDir, `apify-hr-outsourcing-${timestamp}.json`);
        fs.writeFileSync(jsonFile, JSON.stringify(outputData, null, 2));
        
        console.log('💾 Results saved:\n');
        console.log(`   JSON: ${path.basename(jsonFile)}`);
        console.log(`   Size: ${Math.round(fs.statSync(jsonFile).size / 1024)} KB\n`);
        
        // Generate CSV for qualified leads
        if (qualifiedLeads.length > 0) {
            const csvLines = [];
            csvLines.push('Name,Phone,Email,Address,Website,Category,Rating,Reviews,Priority,Score,Flags,Latitude,Longitude,Source Query');
            
            qualifiedLeads.forEach(lead => {
                const row = [
                    `"${(lead.name || '').replace(/"/g, '""')}"`,
                    `"${(lead.phone || '').replace(/"/g, '""')}"`,
                    `"${(lead.email || '').replace(/"/g, '""')}"`,
                    `"${(lead.address || '').replace(/"/g, '""')}"`,
                    `"${(lead.website || '').replace(/"/g, '""')}"`,
                    `"${(lead.category || '').replace(/"/g, '""')}"`,
                    lead.rating || '',
                    lead.reviewCount || '',
                    lead.qualification.priority,
                    lead.qualification.score,
                    `"${lead.qualification.flags.join(', ')}"`,
                    lead.coordinates?.lat || '',
                    lead.coordinates?.lng || '',
                    `"${(lead.sourceQuery || '').replace(/"/g, '""')}"`
                ];
                csvLines.push(row.join(','));
            });
            
            const csvFile = path.join(resultsDir, `apify-hr-outsourcing-${timestamp}.csv`);
            fs.writeFileSync(csvFile, csvLines.join('\n'));
            
            console.log(`   CSV: ${path.basename(csvFile)}`);
            console.log(`   Rows: ${qualifiedLeads.length}\n`);
        }
        
        // Final summary
        console.log('='.repeat(80));
        console.log('📊 CAMPAIGN SUMMARY - PHASE 1 (DEIRA AREA)');
        console.log('='.repeat(80));
        console.log(`⏱️  Duration: ${Math.round((new Date(finishedRun.finishedAt) - new Date(finishedRun.startedAt)) / 60000)} minutes`);
        console.log(`🔍 Searches: ${input.categories.length}`);
        console.log(`📊 Total Businesses: ${stats.totalBusinesses}`);
        console.log(`✓ Qualified Leads: ${stats.qualifiedCount} (${Math.round((stats.qualifiedCount / stats.totalBusinesses) * 100)}%)`);
        console.log(`📧 With Email: ${stats.withEmail} (${Math.round((stats.withEmail / stats.qualifiedCount) * 100)}%)`);
        console.log(`📞 With Phone: ${stats.withPhone} (${Math.round((stats.withPhone / stats.qualifiedCount) * 100)}%)`);
        
        // Check if reached 500 target
        const reachedTarget = stats.qualifiedCount >= CAMPAIGN_CONFIG.maxLeadsTarget;
        if (reachedTarget) {
            console.log(`\n🎯 TARGET REACHED: ${stats.qualifiedCount}/${CAMPAIGN_CONFIG.maxLeadsTarget} leads collected!`);
        } else {
            console.log(`\n📊 Progress: ${stats.qualifiedCount}/${CAMPAIGN_CONFIG.maxLeadsTarget} leads (${Math.round((stats.qualifiedCount / CAMPAIGN_CONFIG.maxLeadsTarget) * 100)}%)`);
        }
        
        console.log(`\n🎯 Priority Breakdown:`);
        console.log(`   🔴 URGENT: ${stats.urgentPriority}`);
        console.log(`   🟠 HIGH: ${stats.highPriority}`);
        console.log(`   🟡 MEDIUM: ${stats.mediumPriority}`);
        console.log(`\n📍 Areas Covered in this Phase:`);
        stats.areasProcessed.forEach(area => {
            const count = stats.areasCovered[area] || 0;
            console.log(`   📌 ${area}: ${count} businesses`);
        });
        console.log(`\n🏭 Target Industry Matches: ${stats.targetIndustryCount}`);
        
        if (reachedTarget) {
            console.log(`\n✅ PHASE 1 COMPLETE - STOP HERE`);
            console.log(`═`.repeat(80));
            console.log(`\n📋 Areas Successfully Covered:`);
            stats.areasProcessed.forEach(area => {
                console.log(`   ✓ ${area}`);
            });
            console.log(`\n📍 For Phase 2, target these nearby areas:`);
            console.log(`   • Al Barsha`);
            console.log(`   • Al Quoz`);
            console.log(`   • Jumeirah`);
            console.log(`   • Satwa`);
            console.log(`   • Trade Centre`);
            console.log(`   • Sheikh Zayed Road`);
            console.log(`\n💡 To start Phase 2:`);
            console.log(`   1. Review Phase 1 results in CSV file`);
            console.log(`   2. Update apify-inputs/hr-outsourcing-campaign.json with Phase 2 areas`);
            console.log(`   3. Run campaign again`);
        } else {
            console.log(`\n💡 Next Steps:`);
            console.log(`   1. Review qualified leads in CSV file`);
            console.log(`   2. Import to CRM using: python odoo-integration/bulk_import_leads.py`);
            console.log(`   3. Continue with more searches to reach 500 target`);
        }
        console.log('='.repeat(80) + '\n');
        
    } catch (error) {
        console.error('\n❌ Campaign failed:', error.message);
        console.error('\nError details:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    runApifyCampaign()
        .then(() => {
            console.log('✅ Campaign completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { runApifyCampaign };
