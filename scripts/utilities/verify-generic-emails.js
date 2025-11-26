/**
 * Verify Generic Emails Script
 * 
 * Verifies generic company emails (info@, contact@) using Hunter.io
 * Uses 30 of your 100 free monthly verifications
 * 
 * Usage:
 *   node scripts/utilities/verify-generic-emails.js
 */

const HunterIOEnricher = require('../../src/data-sources/hunter-io-enricher');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function verifyGenericEmails() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   Generic Email Verification Tool     ║');
    console.log('║   Hunter.io Email Verifier            ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Initialize Hunter.io
    const enricher = new HunterIOEnricher(process.env.HUNTER_API_KEY);
    
    // Check account status
    try {
        const account = await enricher.getAccountInfo();
        console.log(`✅ Connected: ${account.email}`);
        console.log(`📊 Verifications available: ${account.verificationsAvailable}\n`);
        
        if (account.verificationsAvailable < 30) {
            console.log('⚠️  Warning: Less than 30 verifications available');
            console.log('   Adjust the limit in the script if needed\n');
        }
    } catch (error) {
        console.error('❌ Hunter.io connection failed:', error.message);
        process.exit(1);
    }

    // Load companies
    const inputFile = path.join(__dirname, '../../results/real-estate-property-mgmt-leads-2025-11-26T18-15-10-120Z.json');
    
    if (!fs.existsSync(inputFile)) {
        console.error('❌ Input file not found:', inputFile);
        console.log('   Update the inputFile path in the script');
        process.exit(1);
    }

    const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    let companies = Array.isArray(rawData) ? rawData : rawData.businesses || rawData.data || [];
    
    console.log(`📂 Loaded ${companies.length} companies\n`);
    console.log('🔍 Starting verification (max 30 emails)...\n');

    const verified = [];
    const failed = [];
    let count = 0;
    const maxVerifications = 30;

    for (const company of companies) {
        if (count >= maxVerifications) break;
        if (!company.website) continue;

        const domain = extractDomain(company.website);
        if (!domain) continue;

        // Generic email patterns to test
        const genericEmails = [
            `info@${domain}`,
            `contact@${domain}`
        ];

        for (const email of genericEmails) {
            if (count >= maxVerifications) break;

            try {
                console.log(`[${count + 1}/${maxVerifications}] Verifying: ${email}`);
                
                const result = await enricher.verifyEmail(email);
                
                if (result.result === 'deliverable') {
                    verified.push({
                        company: company.name,
                        website: company.website,
                        email: email,
                        status: 'deliverable',
                        score: result.score || 100,
                        type: email.startsWith('info@') ? 'info' : 'contact'
                    });
                    console.log(`   ✅ DELIVERABLE (Score: ${result.score || 100}%)\n`);
                } else if (result.result === 'risky') {
                    verified.push({
                        company: company.name,
                        website: company.website,
                        email: email,
                        status: 'risky',
                        score: result.score || 50,
                        type: email.startsWith('info@') ? 'info' : 'contact'
                    });
                    console.log(`   ⚠️  RISKY (Score: ${result.score || 50}%)\n`);
                } else {
                    failed.push({
                        company: company.name,
                        email: email,
                        status: result.result
                    });
                    console.log(`   ❌ ${result.result.toUpperCase()}\n`);
                }

                count++;
                
                // Rate limiting
                await sleep(1000);

            } catch (error) {
                console.log(`   ⚠️  Error: ${error.message}\n`);
                failed.push({
                    company: company.name,
                    email: email,
                    status: 'error'
                });
                count++;
            }
        }
    }

    // Filter by quality
    const highQuality = verified.filter(v => v.status === 'deliverable' && v.score >= 90);
    const mediumQuality = verified.filter(v => v.status === 'deliverable' && v.score < 90);
    const risky = verified.filter(v => v.status === 'risky');

    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(__dirname, '../../results');

    // Save all verified emails
    const csvPath = path.join(outputDir, `verified-generic-emails-${timestamp}.csv`);
    const csvHeader = 'Company,Website,Email,Type,Status,Score\n';
    const csvRows = verified.map(v => 
        `"${v.company}","${v.website}","${v.email}","${v.type}","${v.status}",${v.score}`
    ).join('\n');
    fs.writeFileSync(csvPath, csvHeader + csvRows);

    // Save high-quality only
    const highQualityCsvPath = path.join(outputDir, `verified-generic-emails-high-quality-${timestamp}.csv`);
    const highQualityCsvRows = highQuality.map(v => 
        `"${v.company}","${v.website}","${v.email}","${v.type}","${v.status}",${v.score}`
    ).join('\n');
    fs.writeFileSync(highQualityCsvPath, csvHeader + highQualityCsvRows);

    // Print summary
    console.log('╔════════════════════════════════════════╗');
    console.log('║      Verification Complete             ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('📊 Verification Results:');
    console.log(`   Total verified: ${count}`);
    console.log(`   ✅ High quality (90%+): ${highQuality.length}`);
    console.log(`   ⚠️  Medium quality (<90%): ${mediumQuality.length}`);
    console.log(`   ⚠️  Risky: ${risky.length}`);
    console.log(`   ❌ Failed: ${failed.length}\n`);

    console.log('📁 Output Files:');
    console.log(`   All verified: ${path.basename(csvPath)}`);
    console.log(`   High quality only: ${path.basename(highQualityCsvPath)}\n`);

    console.log('💡 Recommendations:');
    console.log(`   • Import ${highQuality.length} high-quality emails to CRM immediately`);
    console.log(`   • Use medium quality (${mediumQuality.length}) as secondary contacts`);
    console.log(`   • Avoid risky emails (${risky.length}) unless high-value target\n`);

    console.log('📈 Combined Lead Count:');
    console.log(`   Hunter.io executives: 35 (already found)`);
    console.log(`   Generic emails (high quality): ${highQuality.length}`);
    console.log(`   ─────────────────────────────────────`);
    console.log(`   Total ready contacts: ${35 + highQuality.length}\n`);

    console.log('🚀 Next Steps:');
    console.log('   1. Import high-quality generic emails to CRM');
    console.log('   2. Combine with your 35 verified executives');
    console.log('   3. Launch email campaign to all contacts');
    console.log('   4. Track response rates and adjust\n');
}

/**
 * Extract domain from URL or website string
 */
function extractDomain(url) {
    if (!url) return null;
    
    try {
        // Remove common prefixes
        url = url.toLowerCase().trim();
        
        if (url.includes('http')) {
            const parsed = new URL(url);
            return parsed.hostname.replace('www.', '');
        }
        
        // Handle plain domains
        return url.replace('www.', '').split('/')[0].split('?')[0];
        
    } catch (e) {
        return null;
    }
}

/**
 * Sleep utility
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run if called directly
if (require.main === module) {
    verifyGenericEmails().catch(error => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = verifyGenericEmails;
