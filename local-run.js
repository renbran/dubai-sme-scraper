#!/usr/bin/env node

/**
 * Local runner for Dubai SME Scraper
 * Run this script to execute the scraper locally without Apify platform
 */

const { DubaiSMEActor } = require('./src/main');

// Mock Apify environment for local execution
global.Apify = {
    Actor: {
        init: async () => console.log('Local mode: Actor initialized'),
        getInput: async () => ({
            categories: [
                'restaurants',
                'hotels',
                'retail stores',
                'beauty salons',
                'fitness centers'
            ],
            maxResultsPerCategory: 50,
            dataQualityLevel: 'basic',
            concurrency: {
                maxConcurrency: 2,
                requestDelay: 3000
            },
            outputFormat: 'json',
            proxyConfiguration: {
                useApifyProxy: false
            }
        }),
        openDataset: async () => ({
            pushData: async (data) => {
                // Save to local file instead of Apify dataset
                const fs = require('fs');
                const filename = `dubai-sme-results-${Date.now()}.json`;
                fs.writeFileSync(filename, JSON.stringify(data, null, 2));
                console.log(`✅ Data saved to ${filename}`);
            }
        }),
        setValue: async (key, value) => {
            console.log(`📊 ${key}:`, value);
        },
        exit: async () => {
            console.log('🏁 Local execution completed');
            process.exit(0);
        }
    }
};

async function runLocally() {
    try {
        console.log('🚀 Starting Dubai SME Scraper locally...');
        
        const actor = new DubaiSMEActor();
        await actor.run();
        
    } catch (error) {
        console.error('❌ Local execution failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    runLocally();
}

module.exports = { runLocally };