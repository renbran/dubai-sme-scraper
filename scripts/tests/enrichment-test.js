/**
 * Quick Test: Hunter.io + Snov.io Integration
 * 
 * Tests both services with your credentials before running full campaign
 * 
 * Usage:
 *   node scripts/tests/enrichment-test.js
 */

require('dotenv').config();
const HunterIOEnricher = require('../../src/data-sources/hunter-io-enricher');
const SnovIOEnricher = require('../../src/data-sources/snov-io-enricher');

// Test data
const TEST_COMPANIES = [
    {
        name: 'Emaar Properties',
        website: 'emaar.com',
        category: 'Property Developer'
    },
    {
        name: 'DAMAC Properties',
        website: 'damacproperties.com',
        category: 'Property Developer'
    }
];

async function testHunterIO() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║              Testing Hunter.io Integration               ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const apiKey = process.env.HUNTER_API_KEY;
    
    if (!apiKey || apiKey === 'your_hunter_api_key_here') {
        console.log('❌ Hunter.io API key not configured');
        console.log('📝 Add your Hunter.io API key to .env file:');
        console.log('   1. Sign up at https://hunter.io/users/sign_up');
        console.log('   2. Get API key from https://hunter.io/api_keys');
        console.log('   3. Add to .env: HUNTER_API_KEY=your_key\n');
        return false;
    }

    try {
        const hunter = new HunterIOEnricher(apiKey);
        
        // Test account info
        console.log('🔍 Checking Hunter.io account...');
        const account = await hunter.getAccountInfo();
        
        if (account) {
            console.log('✅ Hunter.io connected successfully!\n');
            console.log('Account Information:');
            console.log(`   Email: ${account.email}`);
            console.log(`   Plan: ${account.plan}`);
            console.log(`   Searches available: ${account.requestsAvailable}/${account.requestsAvailable + account.requestsUsed}`);
            console.log(`   Verifications available: ${account.verificationsAvailable}/${account.verificationsAvailable + account.verificationsUsed}\n`);
            
            // Test domain search
            console.log('🔍 Testing domain search: emaar.com');
            const result = await hunter.searchDomainEmails('emaar.com', { limit: 3 });
            
            if (result && result.emails && result.emails.length > 0) {
                console.log(`✅ Found ${result.emails.length} emails at Emaar:`);
                result.emails.slice(0, 3).forEach((email, i) => {
                    console.log(`   ${i + 1}. ${email.first_name} ${email.last_name}`);
                    console.log(`      Email: ${email.value}`);
                    console.log(`      Position: ${email.position || 'N/A'}`);
                    console.log(`      Confidence: ${email.confidence}%\n`);
                });
            } else {
                console.log('ℹ️  No emails found (this is normal for some domains)\n');
            }
            
            return true;
        }
    } catch (error) {
        console.error('❌ Hunter.io test failed:', error.message);
        console.log('💡 Check your API key is correct\n');
        return false;
    }
}

async function testSnovIO() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║               Testing Snov.io Integration                ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const clientId = process.env.SNOV_CLIENT_ID;
    const clientSecret = process.env.SNOV_CLIENT_SECRET;
    
    if (!clientId || clientId === 'your_snov_client_id_here' || 
        !clientSecret || clientSecret === 'your_snov_client_secret_here') {
        console.log('❌ Snov.io credentials not configured');
        console.log('📝 Add your Snov.io credentials to .env file:');
        console.log('   1. Sign up at https://snov.io/sign-up');
        console.log('   2. Go to https://app.snov.io/api-setting');
        console.log('   3. Copy Client ID and Client Secret');
        console.log('   4. Add to .env:');
        console.log('      SNOV_CLIENT_ID=your_id');
        console.log('      SNOV_CLIENT_SECRET=your_secret\n');
        return false;
    }

    try {
        const snov = new SnovIOEnricher(clientId, clientSecret);
        
        // Test authentication
        console.log('🔍 Authenticating with Snov.io...');
        await snov.authenticate();
        console.log('✅ Snov.io connected successfully!\n');
        
        // Test account balance
        const balance = await snov.getBalance();
        if (balance) {
            console.log('Account Information:');
            console.log(`   Credits available: ${balance.credits}/${balance.maxCredits}`);
            console.log(`   Credits used: ${balance.used}\n`);
        }
        
        // Test domain search
        console.log('🔍 Testing domain search: damacproperties.com');
        const result = await snov.searchDomainEmails('damacproperties.com', { limit: 3 });
        
        if (result && result.emails && result.emails.length > 0) {
            console.log(`✅ Found ${result.emails.length} contacts at DAMAC:`);
            result.emails.slice(0, 3).forEach((email, i) => {
                console.log(`   ${i + 1}. ${email.firstName} ${email.lastName}`);
                console.log(`      Email: ${email.email}`);
                console.log(`      Position: ${email.position || 'N/A'}`);
                console.log(`      Type: ${email.type}\n`);
            });
        } else {
            console.log('ℹ️  No contacts found (this is normal for some domains)\n');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Snov.io test failed:', error.message);
        console.log('💡 Check your credentials are correct\n');
        return false;
    }
}

async function runTests() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║    Enrichment Services Test - Hunter.io + Snov.io       ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const hunterSuccess = await testHunterIO();
    const snovSuccess = await testSnovIO();

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                     Test Results                         ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log(`Hunter.io: ${hunterSuccess ? '✅ READY' : '❌ NOT CONFIGURED'}`);
    console.log(`Snov.io:   ${snovSuccess ? '✅ READY' : '❌ NOT CONFIGURED'}\n`);

    if (hunterSuccess || snovSuccess) {
        console.log('🎉 At least one service is ready!\n');
        console.log('Next steps:');
        console.log('   1. Run full enrichment campaign:');
        console.log('      npm run enrich\n');
        console.log('   2. This will enrich up to 75 companies:');
        if (hunterSuccess) console.log('      ✓ Hunter.io: 25 companies');
        if (snovSuccess) console.log('      ✓ Snov.io: 50 companies\n');
    } else {
        console.log('⚠️  No services configured yet.\n');
        console.log('Please add credentials to .env file and run this test again.\n');
    }
}

// Run tests
if (require.main === module) {
    runTests().catch(error => {
        console.error('\n❌ Test error:', error);
        process.exit(1);
    });
}

module.exports = { testHunterIO, testSnovIO };
