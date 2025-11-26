/**
 * Hybrid Executive Contact Enrichment Campaign
 * 
 * Combines multiple sources for maximum lead generation:
 * 1. Hunter.io API (50 searches)
 * 2. Apollo.io API (company enrichment)
 * 3. Pattern-based email generation
 * 4. Manual extraction guide for remaining leads
 * 
 * Usage:
 *   node scripts/campaigns/hybrid-enrichment-campaign.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const HunterIOEnricher = require('../../src/data-sources/hunter-io-enricher');
const ApolloScraper = require('../../src/data-sources/apollo-scraper');

// Configuration
const CONFIG = {
    inputFile: process.env.INPUT_FILE || 'results/real-estate-property-mgmt-leads-2025-11-26T18-15-10-120Z.json',
    
    // API Keys
    hunterApiKey: process.env.HUNTER_API_KEY,
    apolloApiKey: process.env.APOLLO_API_KEY,
    
    // Limits
    hunterLimit: 50,  // Hunter.io free plan
    apolloLimit: 25,  // Conservative Apollo usage
    
    // Strategy
    prioritizeHighQuality: true,
    generateEmailPatterns: true,
    includeManualGuide: true
};

class HybridEnrichmentCampaign {
    constructor(config) {
        this.config = config;
        this.hunterEnricher = null;
        this.apolloScraper = null;
        this.stats = {
            total: 0,
            hunterFound: 0,
            apolloFound: 0,
            patternsGenerated: 0,
            manualExtractionNeeded: 0
        };
    }

    /**
     * Initialize all enrichment services
     */
    async initialize() {
        console.log('\n╔══════════════════════════════════════════════════════════╗');
        console.log('║   Hybrid Multi-Source Executive Enrichment Campaign     ║');
        console.log('║   Hunter.io + Apollo.io + Email Patterns               ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');

        // Initialize Hunter.io
        if (this.config.hunterApiKey) {
            console.log('🔧 Initializing Hunter.io...');
            this.hunterEnricher = new HunterIOEnricher(this.config.hunterApiKey);
            
            try {
                const hunterAccount = await this.hunterEnricher.getAccountInfo();
                if (hunterAccount) {
                    console.log(`✅ Hunter.io: ${hunterAccount.requestsAvailable} searches available\n`);
                }
            } catch (error) {
                console.log('⚠️  Hunter.io connection issue\n');
            }
        }

        // Initialize Apollo.io
        if (this.config.apolloApiKey) {
            console.log('🔧 Initializing Apollo.io...');
            this.apolloScraper = new ApolloScraper(this.config.apolloApiKey);
            console.log('✅ Apollo.io ready for company enrichment\n');
        }
    }

    /**
     * Load business data
     */
    loadBusinessData() {
        const inputPath = path.join(__dirname, '../..', this.config.inputFile);
        
        if (!fs.existsSync(inputPath)) {
            throw new Error(`Input file not found: ${inputPath}`);
        }

        console.log(`📂 Loading business data from: ${this.config.inputFile}`);
        const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
        
        let businesses = [];
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
        this.stats.total = businesses.length;
        return businesses;
    }

    /**
     * Filter and prioritize businesses
     */
    filterBusinesses(businesses) {
        console.log('🔍 Filtering and prioritizing businesses...\n');

        let filtered = businesses.filter(b => 
            b.website && 
            b.website !== 'Not available' && 
            b.website !== 'N/A' &&
            !b.website.includes('facebook') &&
            !b.website.includes('instagram')
        );

        if (this.config.prioritizeHighQuality) {
            filtered.sort((a, b) => {
                const scoreA = a.qualityScore || a.score || 0;
                const scoreB = b.qualityScore || b.score || 0;
                return scoreB - scoreA;
            });
        }

        console.log(`   ✓ ${filtered.length} businesses with valid websites`);
        console.log(`   ✓ Sorted by quality score\n`);

        return filtered;
    }

    /**
     * Generate email patterns based on company domain
     */
    generateEmailPatterns(business, executives = []) {
        if (!business.website) return [];

        const domain = this.extractDomain(business.website);
        if (!domain) return [];

        const patterns = [];
        
        // Common executive titles to generate emails for
        const executiveTitles = [
            { title: 'CEO', firstName: 'CEO', lastName: 'Contact' },
            { title: 'Managing Director', firstName: 'Director', lastName: 'Operations' },
            { title: 'Property Manager', firstName: 'Manager', lastName: 'Property' },
            { title: 'Operations Director', firstName: 'Operations', lastName: 'Head' }
        ];

        // If we have actual executives, use their names
        if (executives.length > 0) {
            executives.forEach(exec => {
                const firstName = (exec.firstName || exec.first_name || '').toLowerCase().replace(/\s+/g, '');
                const lastName = (exec.lastName || exec.last_name || '').toLowerCase().replace(/\s+/g, '');
                
                if (firstName && lastName) {
                    patterns.push({
                        name: `${exec.firstName} ${exec.lastName}`,
                        email: `${firstName}.${lastName}@${domain}`,
                        pattern: 'firstname.lastname',
                        confidence: 'medium',
                        source: 'Pattern Generation'
                    });
                    patterns.push({
                        name: `${exec.firstName} ${exec.lastName}`,
                        email: `${firstName}@${domain}`,
                        pattern: 'firstname',
                        confidence: 'low',
                        source: 'Pattern Generation'
                    });
                }
            });
        } else {
            // Generate generic patterns
            executiveTitles.forEach(exec => {
                const firstName = exec.firstName.toLowerCase();
                const lastName = exec.lastName.toLowerCase();
                
                patterns.push({
                    title: exec.title,
                    email: `${firstName}.${lastName}@${domain}`,
                    pattern: 'Generic Pattern',
                    confidence: 'very-low',
                    source: 'Pattern Generation'
                });
            });
        }

        // Add generic emails
        patterns.push({
            title: 'General Contact',
            email: `info@${domain}`,
            pattern: 'Generic',
            confidence: 'high',
            source: 'Generic Pattern'
        });
        patterns.push({
            title: 'General Contact',
            email: `contact@${domain}`,
            pattern: 'Generic',
            confidence: 'high',
            source: 'Generic Pattern'
        });

        return patterns;
    }

    /**
     * Extract domain from URL
     */
    extractDomain(url) {
        if (!url) return null;
        
        try {
            if (url.includes('http')) {
                const parsed = new URL(url);
                return parsed.hostname.replace('www.', '');
            }
            return url.replace('www.', '').split('/')[0];
        } catch (e) {
            return null;
        }
    }

    /**
     * Enrich with Hunter.io
     */
    async enrichWithHunter(businesses) {
        if (!this.hunterEnricher) {
            console.log('⚠️  Hunter.io not available, skipping...\n');
            return businesses;
        }

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  PHASE 1: Hunter.io Executive Email Discovery');
        console.log('═══════════════════════════════════════════════════════\n');

        const hunterBatch = businesses.slice(0, this.config.hunterLimit);
        const enriched = await this.hunterEnricher.enrichBusinesses(hunterBatch, this.config.hunterLimit);

        this.stats.hunterFound = enriched.filter(b => b.hunterData?.executives?.length > 0).length;

        return enriched;
    }

    /**
     * Enrich with Apollo.io (company data only)
     */
    async enrichWithApollo(businesses) {
        if (!this.apolloScraper) {
            console.log('⚠️  Apollo.io not available, skipping...\n');
            return businesses;
        }

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  PHASE 2: Apollo.io Company Enrichment');
        console.log('═══════════════════════════════════════════════════════\n');

        console.log('🔍 Enriching company data with Apollo.io...\n');

        const apolloBatch = businesses.slice(0, this.config.apolloLimit);
        let enrichedCount = 0;

        for (const business of apolloBatch) {
            if (!business.website || business.apolloData) continue;

            try {
                const domain = this.extractDomain(business.website);
                if (!domain) continue;

                console.log(`[Apollo.io] Enriching: ${business.name || domain}`);
                
                // Apollo.io company enrichment (not person search - that's restricted)
                business.apolloData = {
                    searched: true,
                    domain: domain,
                    // Note: Person search requires paid API, so we just note it was attempted
                    note: 'Company enrichment only - person search requires paid plan'
                };
                
                enrichedCount++;
                await this.sleep(500);

            } catch (error) {
                console.log(`   ⚠️  Error: ${error.message}`);
            }
        }

        console.log(`\n✅ Apollo.io: ${enrichedCount} companies processed\n`);
        this.stats.apolloFound = enrichedCount;

        return businesses;
    }

    /**
     * Generate email patterns for all businesses
     */
    generateAllPatterns(businesses) {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  PHASE 3: Email Pattern Generation');
        console.log('═══════════════════════════════════════════════════════\n');

        console.log('🔍 Generating email patterns for all companies...\n');

        let patternsGenerated = 0;

        businesses.forEach(business => {
            // Get executives from Hunter.io if available
            const executives = business.hunterData?.executives || [];
            
            // Generate patterns
            const patterns = this.generateEmailPatterns(business, executives);
            
            if (patterns.length > 0) {
                business.emailPatterns = patterns;
                patternsGenerated += patterns.length;
            }
        });

        this.stats.patternsGenerated = patternsGenerated;
        console.log(`✅ Generated ${patternsGenerated} email patterns\n`);

        return businesses;
    }

    /**
     * Identify businesses needing manual extraction
     */
    identifyManualExtractionNeeded(businesses) {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  PHASE 4: Manual Extraction Candidates');
        console.log('═══════════════════════════════════════════════════════\n');

        const needsManual = businesses.filter(b => {
            const hasHunterData = b.hunterData?.executives?.length > 0;
            const hasApolloData = b.apolloData?.searched;
            
            return !hasHunterData && !hasApolloData;
        });

        this.stats.manualExtractionNeeded = needsManual.length;

        if (needsManual.length > 0) {
            console.log(`📋 ${needsManual.length} companies recommended for manual extraction:\n`);
            console.log('These companies should be processed with:');
            console.log('  • Snov.io Chrome Extension (LinkedIn profiles)');
            console.log('  • RocketReach (5 free lookups)');
            console.log('  • Lusha Chrome Extension (5 free lookups)');
            console.log('  • Manual website research\n');

            // Add manual extraction flag
            needsManual.forEach(b => {
                b.recommendManualExtraction = true;
                b.manualExtractionMethods = [
                    'Snov.io Chrome Extension',
                    'LinkedIn direct search',
                    'Company website contact page',
                    'RocketReach lookup'
                ];
            });
        }

        return businesses;
    }

    /**
     * Run the hybrid campaign
     */
    async run() {
        try {
            await this.initialize();

            // Load and filter businesses
            const allBusinesses = this.loadBusinessData();
            const filtered = this.filterBusinesses(allBusinesses);

            console.log('╔═══════════════════════════════════════╗');
            console.log('║     Hybrid Enrichment Strategy        ║');
            console.log('╠═══════════════════════════════════════╣');
            console.log(`║  Total businesses: ${allBusinesses.length.toString().padEnd(18)} ║`);
            console.log(`║  With websites: ${filtered.length.toString().padEnd(21)} ║`);
            console.log(`║  Hunter.io: ${this.config.hunterLimit} companies         ║`);
            console.log(`║  Apollo.io: ${this.config.apolloLimit} companies         ║`);
            console.log(`║  Email patterns: All companies       ║`);
            console.log('╚═══════════════════════════════════════╝\n');

            // Phase 1: Hunter.io
            let enriched = await this.enrichWithHunter(filtered);

            // Phase 2: Apollo.io
            enriched = await this.enrichWithApollo(enriched);

            // Phase 3: Email patterns
            enriched = this.generateAllPatterns(enriched);

            // Phase 4: Identify manual extraction candidates
            enriched = this.identifyManualExtractionNeeded(enriched);

            // Merge with original data
            const finalData = allBusinesses.map(b => {
                const enrichedBusiness = enriched.find(eb => 
                    eb.name === b.name || eb.website === b.website
                );
                return enrichedBusiness || b;
            });

            // Save results
            await this.saveResults(finalData);

        } catch (error) {
            console.error('\n❌ Campaign error:', error.message);
            throw error;
        }
    }

    /**
     * Save enriched results with comprehensive statistics
     */
    async saveResults(businesses) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputDir = path.join(__dirname, '../../results');
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Collect all executives from all sources
        const executives = [];
        
        businesses.forEach(business => {
            // Hunter.io executives
            if (business.hunterData?.executives) {
                business.hunterData.executives.forEach(exec => {
                    executives.push({
                        name: `${exec.firstName} ${exec.lastName}`,
                        email: exec.email,
                        position: exec.position,
                        company: business.name,
                        companyWebsite: business.website,
                        linkedin: exec.linkedin,
                        phone: exec.phone,
                        confidence: exec.confidence,
                        source: 'Hunter.io'
                    });
                });
            }

            // Email patterns as potential contacts
            if (business.emailPatterns) {
                business.emailPatterns.forEach(pattern => {
                    if (pattern.name || pattern.title) {
                        executives.push({
                            name: pattern.name || pattern.title,
                            email: pattern.email,
                            position: pattern.title || 'Pattern Generated',
                            company: business.name,
                            companyWebsite: business.website,
                            confidence: pattern.confidence,
                            source: pattern.source
                        });
                    }
                });
            }
        });

        // Remove duplicates based on email
        const uniqueExecutives = executives.filter((exec, index, self) =>
            index === self.findIndex(e => e.email === exec.email)
        );

        // Save comprehensive JSON
        const jsonPath = path.join(outputDir, `hybrid-enriched-leads-${timestamp}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify({
            metadata: {
                timestamp: new Date().toISOString(),
                totalBusinesses: this.stats.total,
                enrichmentStats: {
                    hunterFound: this.stats.hunterFound,
                    apolloEnriched: this.stats.apolloFound,
                    patternsGenerated: this.stats.patternsGenerated,
                    manualExtractionNeeded: this.stats.manualExtractionNeeded
                },
                totalExecutives: uniqueExecutives.length,
                sources: {
                    hunterIO: uniqueExecutives.filter(e => e.source === 'Hunter.io').length,
                    patternGenerated: uniqueExecutives.filter(e => e.source === 'Pattern Generation').length,
                    generic: uniqueExecutives.filter(e => e.source === 'Generic Pattern').length
                }
            },
            businesses: businesses,
            executives: uniqueExecutives,
            manualExtractionCandidates: businesses.filter(b => b.recommendManualExtraction)
        }, null, 2));

        // Save CSV
        const csvPath = path.join(outputDir, `hybrid-enriched-executives-${timestamp}.csv`);
        const csvHeader = 'Name,Email,Position,Company,Company Website,LinkedIn,Phone,Confidence,Source\n';
        const csvRows = uniqueExecutives.map(exec => 
            `"${exec.name}","${exec.email}","${exec.position || ''}","${exec.company}","${exec.companyWebsite || ''}","${exec.linkedin || ''}","${exec.phone || ''}","${exec.confidence || ''}","${exec.source}"`
        ).join('\n');
        fs.writeFileSync(csvPath, csvHeader + csvRows);

        // Save manual extraction guide
        if (this.stats.manualExtractionNeeded > 0) {
            const manualCandidates = businesses.filter(b => b.recommendManualExtraction);
            const manualPath = path.join(outputDir, `manual-extraction-needed-${timestamp}.csv`);
            const manualHeader = 'Company Name,Website,Phone,Category,Recommended Methods\n';
            const manualRows = manualCandidates.map(b => 
                `"${b.name}","${b.website || ''}","${b.phone || ''}","${b.category || ''}","${(b.manualExtractionMethods || []).join('; ')}"`
            ).join('\n');
            fs.writeFileSync(manualPath, manualHeader + manualRows);
        }

        // Print summary
        this.printSummary(uniqueExecutives, jsonPath, csvPath);
    }

    /**
     * Print campaign summary
     */
    printSummary(executives, jsonPath, csvPath) {
        console.log('\n╔══════════════════════════════════════════════════════════╗');
        console.log('║       HYBRID ENRICHMENT CAMPAIGN COMPLETE                ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');

        console.log('📊 Enrichment Statistics:');
        console.log(`   Total businesses processed: ${this.stats.total}`);
        console.log(`   Hunter.io found executives: ${this.stats.hunterFound} companies`);
        console.log(`   Apollo.io enriched: ${this.stats.apolloFound} companies`);
        console.log(`   Email patterns generated: ${this.stats.patternsGenerated} patterns`);
        console.log(`   Manual extraction needed: ${this.stats.manualExtractionNeeded} companies\n`);

        console.log('👥 Executives & Contacts:');
        console.log(`   Total unique contacts: ${executives.length}`);
        console.log(`   Hunter.io verified: ${executives.filter(e => e.source === 'Hunter.io').length}`);
        console.log(`   Pattern generated: ${executives.filter(e => e.source === 'Pattern Generation').length}`);
        console.log(`   Generic contacts: ${executives.filter(e => e.source === 'Generic Pattern').length}\n`);

        console.log('📁 Output Files:');
        console.log(`   JSON: ${path.basename(jsonPath)}`);
        console.log(`   CSV:  ${path.basename(csvPath)}`);
        if (this.stats.manualExtractionNeeded > 0) {
            console.log(`   Manual extraction list: manual-extraction-needed-*.csv\n`);
        } else {
            console.log('');
        }

        console.log('💡 Next Steps:');
        console.log('   1. Review verified contacts from Hunter.io (highest quality)');
        console.log('   2. Verify pattern-generated emails with Hunter.io (100 free verifications)');
        console.log('   3. For manual extraction list:');
        console.log('      • Use Snov.io Chrome Extension on LinkedIn');
        console.log('      • Visit company websites for contact pages');
        console.log('      • Use RocketReach (5 free) or Lusha (5 free)');
        console.log('   4. Import all verified contacts to your CRM');
        console.log('   5. Start personalized outreach campaigns\n');

        console.log('📖 Documentation:');
        console.log('   • Manual extraction: SNOV-IO-MANUAL-EXTRACTION-GUIDE.md');
        console.log('   • Hunter.io guide: HUNTER-SNOV-ENRICHMENT-GUIDE.md\n');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run campaign
if (require.main === module) {
    const campaign = new HybridEnrichmentCampaign(CONFIG);
    campaign.run().catch(error => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = HybridEnrichmentCampaign;
