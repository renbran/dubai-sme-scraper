/**
 * Dual Enrichment Campaign: Hunter.io + Snov.io
 * 
 * Enriches existing Google Maps company data with executive contacts
 * from both Hunter.io (25 free searches) and Snov.io (50 free credits)
 * 
 * Total: Up to 75 companies can be enriched for free!
 * 
 * Usage:
 *   node scripts/campaigns/dual-enrichment-campaign.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const HunterIOEnricher = require('../../src/data-sources/hunter-io-enricher');
const SnovIOEnricher = require('../../src/data-sources/snov-io-enricher');

// Configuration
const CONFIG = {
    // Input file: Your existing Google Maps data
    inputFile: process.env.INPUT_FILE || 'results/real-estate-property-mgmt-leads-2025-11-26T18-15-10-120Z.json',
    
    // Hunter.io API key (get from: https://hunter.io/api_keys)
    hunterApiKey: process.env.HUNTER_API_KEY,
    
    // Snov.io credentials (get from: https://app.snov.io/api-setting)
    snovClientId: process.env.SNOV_CLIENT_ID,
    snovClientSecret: process.env.SNOV_CLIENT_SECRET,
    
    // How many companies to enrich with each service
    hunterLimit: 50,  // Hunter.io free plan (you have 50 available!)
    snovLimit: 0,     // Disabled since no Snov.io credentials
    
    // Filter criteria
    filterByWebsite: true,  // Only enrich companies with websites
    prioritizeHighQuality: true  // Process high-quality leads first
};

class DualEnrichmentCampaign {
    constructor(config) {
        this.config = config;
        this.hunterEnricher = null;
        this.snovEnricher = null;
    }

    /**
     * Initialize enrichers
     */
    async initialize() {
        console.log('\n╔══════════════════════════════════════════════════════════╗');
        console.log('║      Dual Enrichment Campaign: Hunter.io + Snov.io      ║');
        console.log('║      Executive Contact Discovery System                  ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');

        // Initialize Hunter.io
        if (this.config.hunterApiKey) {
            console.log('🔧 Initializing Hunter.io...');
            this.hunterEnricher = new HunterIOEnricher(this.config.hunterApiKey);
            
            const hunterAccount = await this.hunterEnricher.getAccountInfo();
            if (hunterAccount) {
                console.log(`✅ Hunter.io connected: ${hunterAccount.email}`);
                console.log(`   Plan: ${hunterAccount.plan}`);
                console.log(`   Searches available: ${hunterAccount.requestsAvailable}/${hunterAccount.requestsAvailable + hunterAccount.requestsUsed}`);
                console.log(`   Verifications available: ${hunterAccount.verificationsAvailable}/${hunterAccount.verificationsAvailable + hunterAccount.verificationsUsed}\n`);
            }
        } else {
            console.log('⚠️  Hunter.io API key not found in .env file');
            console.log('   Add HUNTER_API_KEY=your_key to .env\n');
        }

        // Initialize Snov.io
        if (this.config.snovClientId && this.config.snovClientSecret) {
            console.log('🔧 Initializing Snov.io...');
            this.snovEnricher = new SnovIOEnricher(
                this.config.snovClientId,
                this.config.snovClientSecret
            );
            
            try {
                await this.snovEnricher.authenticate();
                const snovBalance = await this.snovEnricher.getBalance();
                if (snovBalance) {
                    console.log(`✅ Snov.io connected`);
                    console.log(`   Credits available: ${snovBalance.credits}/${snovBalance.maxCredits}\n`);
                }
            } catch (error) {
                console.log('⚠️  Snov.io authentication failed\n');
            }
        } else {
            console.log('⚠️  Snov.io credentials not found in .env file');
            console.log('   Add SNOV_CLIENT_ID and SNOV_CLIENT_SECRET to .env\n');
        }

        if (!this.hunterEnricher && !this.snovEnricher) {
            throw new Error('No enrichment services configured. Please add API keys to .env file');
        }
    }

    /**
     * Load existing business data
     */
    loadBusinessData() {
        const inputPath = path.join(__dirname, '../..', this.config.inputFile);
        
        if (!fs.existsSync(inputPath)) {
            throw new Error(`Input file not found: ${inputPath}`);
        }

        console.log(`📂 Loading business data from: ${this.config.inputFile}`);
        const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
        
        let businesses = [];
        
        // Handle different JSON structures
        if (Array.isArray(data)) {
            businesses = data;
        } else if (data.businesses) {
            businesses = data.businesses;
        } else if (data.results) {
            businesses = data.results;
        } else if (data.data) {
            businesses = data.data;
        }

        console.log(`✅ Loaded ${businesses.length} businesses\n`);
        return businesses;
    }

    /**
     * Filter and prioritize businesses for enrichment
     */
    filterBusinesses(businesses) {
        console.log('🔍 Filtering businesses for enrichment...\n');

        let filtered = businesses;

        // Filter by website if configured
        if (this.config.filterByWebsite) {
            filtered = filtered.filter(b => 
                b.website && 
                b.website !== 'Not available' && 
                b.website !== 'N/A' &&
                !b.website.includes('facebook') &&
                !b.website.includes('instagram')
            );
            console.log(`   ✓ ${filtered.length} businesses with valid websites`);
        }

        // Prioritize high-quality leads
        if (this.config.prioritizeHighQuality) {
            filtered.sort((a, b) => {
                const scoreA = a.qualityScore || a.score || 0;
                const scoreB = b.qualityScore || b.score || 0;
                return scoreB - scoreA;
            });
            console.log(`   ✓ Sorted by quality score (highest first)\n`);
        }

        return filtered;
    }

    /**
     * Run the dual enrichment campaign
     */
    async run() {
        try {
            await this.initialize();

            // Load business data
            const allBusinesses = this.loadBusinessData();
            const filtered = this.filterBusinesses(allBusinesses);

            console.log('╔═══════════════════════════════════════╗');
            console.log('║     Enrichment Strategy               ║');
            console.log('╠═══════════════════════════════════════╣');
            console.log(`║  Total businesses: ${allBusinesses.length.toString().padEnd(18)} ║`);
            console.log(`║  With websites: ${filtered.length.toString().padEnd(21)} ║`);
            console.log(`║  Hunter.io limit: ${this.config.hunterLimit.toString().padEnd(19)} ║`);
            console.log(`║  Snov.io limit: ${this.config.snovLimit.toString().padEnd(21)} ║`);
            console.log('╚═══════════════════════════════════════╝\n');

            let enrichedBusinesses = [];

            // Phase 1: Hunter.io enrichment
            if (this.hunterEnricher) {
                console.log('\n═══════════════════════════════════════════════════════');
                console.log('  PHASE 1: Hunter.io Executive Email Discovery');
                console.log('═══════════════════════════════════════════════════════\n');

                const hunterBatch = filtered.slice(0, this.config.hunterLimit);
                enrichedBusinesses = await this.hunterEnricher.enrichBusinesses(
                    hunterBatch,
                    this.config.hunterLimit
                );

                await this.sleep(2000);
            }

            // Phase 2: Snov.io enrichment
            if (this.snovEnricher) {
                console.log('\n═══════════════════════════════════════════════════════');
                console.log('  PHASE 2: Snov.io Contact Discovery');
                console.log('═══════════════════════════════════════════════════════\n');

                // Start from where Hunter.io left off
                const startIndex = enrichedBusinesses.length;
                const snovBatch = filtered.slice(startIndex, startIndex + this.config.snovLimit);
                
                const snovEnriched = await this.snovEnricher.enrichBusinesses(
                    snovBatch,
                    this.config.snovLimit
                );

                enrichedBusinesses.push(...snovEnriched);
            }

            // Add remaining businesses without enrichment
            if (enrichedBusinesses.length < allBusinesses.length) {
                const remaining = allBusinesses.filter(b => 
                    !enrichedBusinesses.find(eb => eb.name === b.name)
                );
                enrichedBusinesses.push(...remaining);
            }

            // Generate summary and save results
            await this.saveResults(enrichedBusinesses, allBusinesses.length);

        } catch (error) {
            console.error('\n❌ Campaign error:', error.message);
            throw error;
        }
    }

    /**
     * Save enriched results
     */
    async saveResults(businesses, originalCount) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputDir = path.join(__dirname, '../../results');
        
        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Count enrichment statistics
        const stats = {
            total: businesses.length,
            original: originalCount,
            hunterEnriched: businesses.filter(b => b.hunterData?.executives?.length > 0).length,
            snovEnriched: businesses.filter(b => b.snovData?.contacts?.length > 0).length,
            withContacts: businesses.filter(b => b.contactEmail && b.contactEmail !== 'Not available').length,
            executives: []
        };

        // Extract all executives
        businesses.forEach(business => {
            if (business.hunterData?.executives) {
                business.hunterData.executives.forEach(exec => {
                    stats.executives.push({
                        name: `${exec.firstName} ${exec.lastName}`,
                        email: exec.email,
                        position: exec.position,
                        company: business.name,
                        linkedin: exec.linkedin,
                        source: 'Hunter.io'
                    });
                });
            }
            
            if (business.snovData?.contacts) {
                business.snovData.contacts.forEach(contact => {
                    stats.executives.push({
                        name: `${contact.firstName} ${contact.lastName}`,
                        email: contact.email,
                        position: contact.position,
                        company: business.name,
                        linkedin: contact.linkedin,
                        source: 'Snov.io'
                    });
                });
            }
        });

        // Save JSON
        const jsonPath = path.join(outputDir, `dual-enriched-leads-${timestamp}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify({
            metadata: {
                timestamp: new Date().toISOString(),
                totalBusinesses: stats.total,
                enriched: {
                    hunter: stats.hunterEnriched,
                    snov: stats.snovEnriched,
                    total: stats.withContacts
                },
                executivesFound: stats.executives.length
            },
            businesses: businesses,
            executives: stats.executives
        }, null, 2));

        // Save CSV (flattened executives)
        const csvPath = path.join(outputDir, `dual-enriched-executives-${timestamp}.csv`);
        const csvHeader = 'Name,Email,Position,Company,LinkedIn,Source\n';
        const csvRows = stats.executives.map(exec => 
            `"${exec.name}","${exec.email}","${exec.position || ''}","${exec.company}","${exec.linkedin || ''}","${exec.source}"`
        ).join('\n');
        fs.writeFileSync(csvPath, csvHeader + csvRows);

        // Print summary
        console.log('\n╔══════════════════════════════════════════════════════════╗');
        console.log('║              ENRICHMENT CAMPAIGN COMPLETE                ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');

        console.log('📊 Statistics:');
        console.log(`   Total businesses processed: ${stats.total}`);
        console.log(`   Enriched by Hunter.io: ${stats.hunterEnriched}`);
        console.log(`   Enriched by Snov.io: ${stats.snovEnriched}`);
        console.log(`   Total with contacts: ${stats.withContacts}`);
        console.log(`   Executives found: ${stats.executives.length}\n`);

        console.log('📁 Output files:');
        console.log(`   JSON: ${path.basename(jsonPath)}`);
        console.log(`   CSV:  ${path.basename(csvPath)}\n`);

        console.log('💡 Next steps:');
        console.log('   1. Review executives in CSV file');
        console.log('   2. Verify emails with Hunter.io verification (50 free)');
        console.log('   3. Import to your CRM');
        console.log('   4. Start outreach campaigns\n');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run campaign
if (require.main === module) {
    const campaign = new DualEnrichmentCampaign(CONFIG);
    campaign.run().catch(error => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = DualEnrichmentCampaign;
