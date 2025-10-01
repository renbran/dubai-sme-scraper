#!/usr/bin/env node

/**
 * Simple local test runner for Dubai SME Scraper targeting Deira
 */

// Setup Apify environment first
const Apify = require('apify');

// Local input configuration for Deira SME businesses
const localInput = {
    categories: [
        'small businesses Deira Dubai',
        'trading companies Deira Dubai', 
        'retail shops Deira Dubai',
        'restaurants Deira Dubai',
        'textiles trading Deira Dubai',
        'electronics shops Deira Dubai',
        'gold shops Deira Dubai',
        'perfume shops Deira Dubai',
        'wholesale trading Deira Dubai',
        'import export companies Deira Dubai',
        'SME businesses Deira Dubai',
        'medium enterprises Deira Dubai',
        'family businesses Deira Dubai',
        'local businesses Deira Dubai',
        'commercial establishments Deira Dubai'
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

async function runDeiraScraper() {
    try {
        console.log('🚀 Starting Dubai SME Scraper for Deira area...');
        
        // Mock the Actor.getInput to return our local configuration
        const originalGetInput = Apify.Actor.getInput;
        Apify.Actor.getInput = async () => localInput;
        
        // Run the main script
        require('./src/main');
        
    } catch (error) {
        console.error('❌ Scraper failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    runDeiraScraper();
}