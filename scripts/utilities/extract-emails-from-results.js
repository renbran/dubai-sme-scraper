/**
 * Extract Email Addresses from Existing Campaign Results
 * 
 * This script:
 * 1. Reads existing campaign JSON results
 * 2. Extracts email addresses from business data (websites, descriptions, etc.)
 * 3. Updates the results file with enriched email data
 * 4. Generates updated CSV with email column
 * 
 * Usage:
 *   node scripts/utilities/extract-emails-from-results.js [results-file.json]
 */

const fs = require('fs');
const path = require('path');

// Email extraction regex
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function extractEmailsFromBusiness(business) {
    const emails = new Set();
    
    // Check direct email fields
    if (business.email) emails.add(business.email.toLowerCase());
    if (business.emailAddress) emails.add(business.emailAddress.toLowerCase());
    
    // Extract from all text fields
    const searchableFields = [
        business.title,
        business.name,
        business.businessName,
        business.description,
        business.about,
        business.website,
        business.url,
        JSON.stringify(business.additionalInfo || {}),
        JSON.stringify(business.peopleAlsoSearch || [])
    ];
    
    searchableFields.forEach(field => {
        if (field) {
            const matches = field.match(EMAIL_REGEX);
            if (matches) {
                matches.forEach(email => {
                    // Filter out common false positives
                    if (!email.includes('sentry.io') && 
                        !email.includes('google.com') &&
                        !email.includes('example.com') &&
                        !email.includes('test.com')) {
                        emails.add(email.toLowerCase());
                    }
                });
            }
        }
    });
    
    return Array.from(emails);
}

async function processResults(resultsFile) {
    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL EXTRACTION FROM CAMPAIGN RESULTS');
    console.log('='.repeat(80));
    console.log(`\n📂 Processing: ${path.basename(resultsFile)}\n`);
    
    // Read existing results
    const data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    
    console.log(`📊 Original Stats:`);
    console.log(`   Total Businesses: ${data.stats.totalBusinesses}`);
    console.log(`   Qualified Leads: ${data.stats.qualifiedCount}`);
    console.log(`   Original Emails: ${data.stats.withEmail || 0}\n`);
    
    // Extract emails from all businesses
    console.log('🔍 Extracting emails...\n');
    let emailsExtracted = 0;
    let leadsWithEmail = 0;
    
    data.allBusinesses.forEach((business, index) => {
        const emails = extractEmailsFromBusiness(business);
        if (emails.length > 0) {
            business.extractedEmails = emails;
            business.email = emails[0]; // Use first email as primary
            emailsExtracted += emails.length;
            if ((index + 1) % 50 === 0) {
                console.log(`   Processed ${index + 1}/${data.allBusinesses.length} businesses...`);
            }
        }
    });
    
    // Update qualified leads with extracted emails
    console.log(`\n📝 Updating qualified leads...\n`);
    data.qualifiedLeads.forEach(lead => {
        // Find corresponding business
        const business = data.allBusinesses.find(b => 
            (b.title || b.name) === lead.name || 
            b.phone === lead.phone
        );
        
        if (business && business.extractedEmails && business.extractedEmails.length > 0) {
            lead.email = business.extractedEmails[0];
            lead.allEmails = business.extractedEmails;
            leadsWithEmail++;
        }
    });
    
    // Update stats
    data.stats.withEmail = leadsWithEmail;
    data.stats.emailsExtracted = emailsExtracted;
    data.stats.emailExtractedAt = new Date().toISOString();
    
    // Save updated JSON
    const updatedJsonFile = resultsFile.replace('.json', '-with-emails.json');
    fs.writeFileSync(updatedJsonFile, JSON.stringify(data, null, 2));
    
    console.log(`✅ Updated JSON saved: ${path.basename(updatedJsonFile)}`);
    console.log(`   Size: ${Math.round(fs.statSync(updatedJsonFile).size / 1024)} KB\n`);
    
    // Generate updated CSV
    const csvLines = [];
    csvLines.push('Name,Phone,Email,All Emails,Address,Website,Category,Rating,Reviews,Priority,Score,Flags,Latitude,Longitude,Source Query');
    
    data.qualifiedLeads.forEach(lead => {
        const row = [
            `"${(lead.name || '').replace(/"/g, '""')}"`,
            `"${(lead.phone || '').replace(/"/g, '""')}"`,
            `"${(lead.email || '').replace(/"/g, '""')}"`,
            `"${(lead.allEmails || []).join('; ').replace(/"/g, '""')}"`,
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
    
    const csvFile = updatedJsonFile.replace('.json', '.csv');
    fs.writeFileSync(csvFile, csvLines.join('\n'));
    
    console.log(`📊 Updated CSV saved: ${path.basename(csvFile)}`);
    console.log(`   Rows: ${data.qualifiedLeads.length}\n`);
    
    // Final summary
    console.log('='.repeat(80));
    console.log('📊 EMAIL EXTRACTION SUMMARY');
    console.log('='.repeat(80));
    console.log(`\n📧 Email Statistics:`);
    console.log(`   Total Emails Found: ${emailsExtracted}`);
    console.log(`   Qualified Leads with Email: ${leadsWithEmail}/${data.stats.qualifiedCount} (${Math.round((leadsWithEmail / data.stats.qualifiedCount) * 100)}%)`);
    console.log(`   Improvement: +${leadsWithEmail - (data.stats.withEmail - leadsWithEmail || 0)} emails\n`);
    
    console.log(`✅ Files generated:`);
    console.log(`   📄 JSON: ${path.basename(updatedJsonFile)}`);
    console.log(`   📊 CSV: ${path.basename(csvFile)}\n`);
    
    console.log('='.repeat(80));
    console.log('✓ Email extraction complete!\n');
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // Find most recent results file
        const resultsDir = path.join(__dirname, '../../results');
        const files = fs.readdirSync(resultsDir)
            .filter(f => f.startsWith('apify-hr-outsourcing-') && f.endsWith('.json') && !f.includes('-with-emails'))
            .sort()
            .reverse();
        
        if (files.length === 0) {
            console.error('\n❌ No campaign results found in results/ directory\n');
            console.log('Usage: node scripts/utilities/extract-emails-from-results.js [results-file.json]\n');
            process.exit(1);
        }
        
        const latestFile = path.join(resultsDir, files[0]);
        processResults(latestFile).catch(console.error);
    } else {
        const resultsFile = path.resolve(args[0]);
        if (!fs.existsSync(resultsFile)) {
            console.error(`\n❌ File not found: ${resultsFile}\n`);
            process.exit(1);
        }
        processResults(resultsFile).catch(console.error);
    }
}

module.exports = { extractEmailsFromBusiness };
