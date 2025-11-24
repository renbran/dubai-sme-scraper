/**
 * Results Organization Script
 * 
 * This script:
 * 1. Moves each campaign run to a separate dated folder
 * 2. Creates a master CSV with all leads from all campaigns
 * 3. Creates a master JSON with complete data
 * 4. Generates a campaigns summary overview
 * 
 * Usage:
 *   node scripts/utilities/organize-results.js
 */

const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, '../../results');
const CAMPAIGNS_DIR = path.join(RESULTS_DIR, 'campaigns');
const MASTER_CSV = path.join(RESULTS_DIR, 'MASTER_LEADS.csv');
const MASTER_JSON = path.join(RESULTS_DIR, 'MASTER_LEADS.json');
const SUMMARY_CSV = path.join(RESULTS_DIR, 'CAMPAIGNS_SUMMARY.csv');

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

function escapeCsv(str) {
    if (!str) return '';
    return `"${str.toString().replace(/"/g, '""')}"`;
}

function organizeResults() {
    console.log('\n' + '='.repeat(80));
    console.log('📁 ORGANIZING CAMPAIGN RESULTS');
    console.log('='.repeat(80) + '\n');

    // Create campaigns directory
    if (!fs.existsSync(CAMPAIGNS_DIR)) {
        fs.mkdirSync(CAMPAIGNS_DIR, { recursive: true });
        console.log('✓ Created campaigns archive folder\n');
    }

    // Find all campaign files
    const files = fs.readdirSync(RESULTS_DIR)
        .filter(f => f.startsWith('apify-hr-outsourcing-') && f.endsWith('.json') && !f.includes('-with-emails'))
        .map(f => ({
            name: f,
            path: path.join(RESULTS_DIR, f),
            mtime: fs.statSync(path.join(RESULTS_DIR, f)).mtime
        }))
        .sort((a, b) => a.mtime - b.mtime);

    console.log(`📊 Found ${files.length} campaign run(s)\n`);

    const allLeads = [];
    const campaignsSummary = [];

    files.forEach((file, index) => {
        const data = JSON.parse(fs.readFileSync(file.path, 'utf8'));
        const timestamp = formatDate(data.generatedAt || new Date(file.mtime).toISOString());
        const campaignFolder = path.join(CAMPAIGNS_DIR, `campaign_${timestamp}`);

        console.log(`   [${index + 1}/${files.length}] Processing: ${file.name}`);
        console.log(`      Campaign: ${data.campaign.name}`);
        console.log(`      Date: ${data.generatedAt}`);
        console.log(`      Leads: ${data.stats.qualifiedCount}`);

        // Create campaign folder
        if (!fs.existsSync(campaignFolder)) {
            fs.mkdirSync(campaignFolder, { recursive: true });
        }

        // Copy main files
        fs.copyFileSync(file.path, path.join(campaignFolder, 'campaign_data.json'));
        
        const csvFile = file.path.replace('.json', '.csv');
        if (fs.existsSync(csvFile)) {
            fs.copyFileSync(csvFile, path.join(campaignFolder, 'campaign_leads.csv'));
        }

        // Copy email-extracted files if they exist
        const emailJson = file.path.replace('.json', '-with-emails.json');
        const emailCsv = file.path.replace('.json', '-with-emails.csv');
        
        if (fs.existsSync(emailJson)) {
            fs.copyFileSync(emailJson, path.join(campaignFolder, 'campaign_data_with_emails.json'));
        }
        if (fs.existsSync(emailCsv)) {
            fs.copyFileSync(emailCsv, path.join(campaignFolder, 'campaign_leads_with_emails.csv'));
        }

        // Create README for campaign
        const duration = Math.round((new Date(data.apifyRun.finishedAt) - new Date(data.apifyRun.startedAt)) / 60000);
        const readme = `# Campaign Run: ${timestamp}

## Campaign Details
- **Name**: ${data.campaign.name}
- **Date**: ${data.generatedAt}
- **Duration**: ${duration} minutes
- **Apify Run ID**: ${data.apifyRun.runId}

## Results Summary
- **Total Businesses Scraped**: ${data.stats.totalBusinesses}
- **Qualified Leads**: ${data.stats.qualifiedCount}
- **With Email**: ${data.stats.withEmail || 0}
- **With Phone**: ${data.stats.withPhone || data.stats.qualifiedCount}

## Priority Distribution
- **HIGH**: ${data.stats.highPriority} leads
- **MEDIUM**: ${data.stats.mediumPriority} leads
- **URGENT**: ${data.stats.urgentPriority} leads

## Rejection Reasons
- **No Phone**: ${data.stats.rejectedNoPhone}
- **Low Score**: ${data.stats.rejectedLowScore}

## Industries Targeted
${data.campaign.industries ? data.campaign.industries.join(', ') : 'Various'}

## Locations Covered
${data.campaign.locations ? data.campaign.locations.join(', ') : 'Various'}

## Files in This Folder
- \`campaign_data.json\` - Complete raw data with all businesses
- \`campaign_leads.csv\` - Qualified leads ready for import
- \`campaign_data_with_emails.json\` - Data with email extraction attempts (if available)
- \`campaign_leads_with_emails.csv\` - Leads CSV with email column (if available)

## Notes
- Phone numbers are mandatory for all qualified leads
- Email extraction from Google Maps has ~0% success rate (expected)
- Use phone-first outreach or email enrichment services for emails
- Import to CRM: \`python odoo-integration/bulk_import_leads.py campaign_leads.csv\`
`;

        fs.writeFileSync(path.join(campaignFolder, 'README.md'), readme);

        console.log(`      → Organized into: campaign_${timestamp}/\n`);

        // Add leads to master list
        data.qualifiedLeads.forEach(lead => {
            allLeads.push({
                campaignDate: data.generatedAt,
                campaignName: data.campaign.name,
                campaignFolder: `campaign_${timestamp}`,
                ...lead
            });
        });

        // Add to summary
        campaignsSummary.push({
            campaignDate: data.generatedAt,
            campaignName: data.campaign.name,
            folder: `campaign_${timestamp}`,
            totalBusinesses: data.stats.totalBusinesses,
            qualifiedLeads: data.stats.qualifiedCount,
            withEmail: data.stats.withEmail || 0,
            withPhone: data.stats.withPhone || data.stats.qualifiedCount,
            highPriority: data.stats.highPriority,
            mediumPriority: data.stats.mediumPriority,
            urgentPriority: data.stats.urgentPriority,
            duration: `${duration} min`,
            apifyRunId: data.apifyRun.runId
        });
    });

    // Create master CSV
    console.log('\n📝 Creating master files...\n');
    
    const masterCsvLines = [];
    masterCsvLines.push('Campaign Date,Campaign Name,Campaign Folder,Business Name,Phone,Email,Address,Website,Category,Rating,Reviews,Priority,Score,Latitude,Longitude');
    
    allLeads.forEach(lead => {
        const row = [
            escapeCsv(lead.campaignDate),
            escapeCsv(lead.campaignName),
            escapeCsv(lead.campaignFolder),
            escapeCsv(lead.name),
            escapeCsv(lead.phone),
            escapeCsv(lead.email || ''),
            escapeCsv(lead.address),
            escapeCsv(lead.website),
            escapeCsv(lead.category),
            lead.rating || '',
            lead.reviewCount || '',
            lead.qualification.priority,
            lead.qualification.score,
            lead.coordinates?.lat || '',
            lead.coordinates?.lng || ''
        ];
        masterCsvLines.push(row.join(','));
    });

    fs.writeFileSync(MASTER_CSV, masterCsvLines.join('\n'));
    console.log(`   ✓ Created: MASTER_LEADS.csv (${allLeads.length} leads)`);

    // Create master JSON
    const masterData = {
        generatedAt: new Date().toISOString(),
        totalCampaigns: files.length,
        totalLeads: allLeads.length,
        campaigns: campaignsSummary,
        leads: allLeads
    };

    fs.writeFileSync(MASTER_JSON, JSON.stringify(masterData, null, 2));
    console.log('   ✓ Created: MASTER_LEADS.json (complete data)');

    // Create campaigns summary CSV
    const summaryCsvLines = [];
    summaryCsvLines.push('Campaign Date,Campaign Name,Folder,Total Businesses,Qualified Leads,With Email,With Phone,HIGH Priority,MEDIUM Priority,URGENT Priority,Duration,Apify Run ID');
    
    campaignsSummary.forEach(summary => {
        const row = [
            escapeCsv(summary.campaignDate),
            escapeCsv(summary.campaignName),
            escapeCsv(summary.folder),
            summary.totalBusinesses,
            summary.qualifiedLeads,
            summary.withEmail,
            summary.withPhone,
            summary.highPriority,
            summary.mediumPriority,
            summary.urgentPriority,
            escapeCsv(summary.duration),
            escapeCsv(summary.apifyRunId)
        ];
        summaryCsvLines.push(row.join(','));
    });

    fs.writeFileSync(SUMMARY_CSV, summaryCsvLines.join('\n'));
    console.log('   ✓ Created: CAMPAIGNS_SUMMARY.csv (overview)\n');

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 ORGANIZATION SUMMARY');
    console.log('='.repeat(80) + '\n');

    console.log(` Campaign Runs Organized: ${files.length}`);
    console.log(` Total Unique Leads: ${allLeads.length}\n`);

    console.log(' Master Files Created:');
    console.log('   📄 results/MASTER_LEADS.csv - All leads from all campaigns');
    console.log('   📄 results/MASTER_LEADS.json - Complete data in JSON format');
    console.log('   📄 results/CAMPAIGNS_SUMMARY.csv - Overview of all campaigns\n');

    console.log(' Individual Campaign Folders:');
    campaignsSummary.forEach(summary => {
        console.log(`   📁 results/campaigns/${summary.folder}/`);
        console.log(`      Date: ${summary.campaignDate}`);
        console.log(`      Leads: ${summary.qualifiedLeads}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✓ Organization complete! All campaigns archived.');
    console.log('='.repeat(80) + '\n');
}

// Run if called directly
if (require.main === module) {
    try {
        organizeResults();
    } catch (error) {
        console.error('\n❌ Error organizing results:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

module.exports = { organizeResults };
