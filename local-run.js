#!/usr/bin/env node

/**
 * Local runner for Dubai SME Scraper
 * Run this script to execute the scraper locally without Apify platform
 */

const DubaiSMEActor = require('./src/main');

// Mock Apify environment for local execution - Deira SME focused
const localInput = {
    categories: [
        "small businesses Deira Dubai",
        "trading companies Deira Dubai",
        "retail shops Deira Dubai",
        "restaurants Deira Dubai",
        "textiles trading Deira Dubai",
        "electronics shops Deira Dubai",
        "gold shops Deira Dubai",
        "perfume shops Deira Dubai",
        "wholesale trading Deira Dubai",
        "import export companies Deira Dubai",
        "SME businesses Deira Dubai",
        "medium enterprises Deira Dubai",
        "family businesses Deira Dubai",
        "local businesses Deira Dubai",
        "commercial establishments Deira Dubai"
    ],
    maxResultsPerCategory: 50,
    dataQualityLevel: 'standard',
    searchRadius: 'Deira',
    concurrency: {
        maxConcurrency: 2,
        requestDelay: 3000,
        retryAttempts: 3
    },
    outputFormat: {
        includePhotos: true,
        includeReviews: true,
        includeCoordinates: true,
        includeSocialMedia: true
    },
    proxyConfiguration: {
        useApifyProxy: false
    }
};

global.Apify = {
    Actor: {
        init: async () => console.log('Local mode: Actor initialized'),
        getInput: async () => localInput,
        openDataset: async () => ({
            pushData: async (data) => {
                // Save to local file instead of Apify dataset
                const fs = require('fs');
                const path = require('path');
                
                // Create results directory if it doesn't exist
                const resultsDir = path.join(__dirname, 'results');
                if (!fs.existsSync(resultsDir)) {
                    fs.mkdirSync(resultsDir);
                }
                
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = path.join(resultsDir, `dubai-sme-results-${timestamp}.json`);
                
                fs.writeFileSync(filename, JSON.stringify(data, null, 2));
                console.log(`✅ Data saved to ${filename}`);
                console.log(`📊 Records saved: ${Array.isArray(data) ? data.length : 'Summary + businesses'}`);
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
        
        // Initialize Apify Actor for local execution
        await Apify.Actor.init();
        
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