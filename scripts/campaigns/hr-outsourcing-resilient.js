/**
 * HR Outsourcing Lead Campaign - Ultra-Resilient Version
 * 
 * This version prioritizes getting results over perfect automation:
 * - Saves after EVERY successful search
 * - Uses longer delays to avoid detection
 * - Gracefully handles crashes and continues
 * - Can resume from saved progress
 */

const fs = require('fs');
const path = require('path');
const GoogleMapsScraper = require('../../src/scraper');

// Campaign configuration
const CAMPAIGN_CONFIG = {
    name: 'HR Outsourcing - Resilient',
    targetEmployees: '50-1000',
    primaryAreas: ['Business Bay', 'JVC', 'JLT'],
    fallbackAreas: ['Downtown Dubai', 'DIFC', 'Dubai Marina'],
    industries: ['Construction', 'Electromechanical', 'Packaging'],
    maxResultsPerSearch: 10,  // Reduced for stability
    delayBetweenSearches: 15000,  // 15 seconds - very human-like
    saveAfterEachSearch: true
};

// Generate focused search queries
function generateSearchQueries() {
    const queries = [];
    const industries = CAMPAIGN_CONFIG.industries;
    const primaryAreas = CAMPAIGN_CONFIG.primaryAreas;
    const fallbackAreas = CAMPAIGN_CONFIG.fallbackAreas;
    
    // Primary area searches (focused)
    industries.forEach(industry => {
        primaryAreas.forEach(area => {
            queries.push(`${industry} companies in ${area} Dubai`);
            queries.push(`${industry} contractors in ${area} Dubai`);
        });
    });
    
    // Fallback area searches
    industries.forEach(industry => {
        fallbackAreas.forEach(area => {
            queries.push(`${industry} companies in ${area}`);
        });
    });
    
    return queries;
}

// Lead qualification with mandatory phone
function qualifyLead(business) {
    let score = 0;
    const flags = [];
    
    // MANDATORY: Must have phone
    const hasPhone = business.phone && 
                     business.phone !== 'Not available' && 
                     business.phone.trim() !== '';
    
    if (!hasPhone) {
        return { qualified: false, score: 0, reason: 'No phone number' };
    }
    
    // Scoring
    score += 30;  // Has phone
    
    if (business.name) score += 10;
    if (business.address) score += 10;
    if (business.website) score += 15;
    if (business.rating && business.rating >= 4.0) score += 10;
    if (business.reviewCount && business.reviewCount >= 10) score += 10;
    
    // Priority flags
    const addressLower = (business.address || '').toLowerCase();
    const primaryLocations = ['business bay', 'jvc', 'jumeirah village', 'jlt', 'jumeirah lakes'];
    if (primaryLocations.some(loc => addressLower.includes(loc))) {
        flags.push('TARGET_LOCATION');
        score += 15;
    }
    
    const categoryLower = (business.category || '').toLowerCase();
    const nameLower = (business.name || '').toLowerCase();
    const targetIndustries = ['construction', 'electromechanical', 'packaging', 'contractor', 'building'];
    if (targetIndustries.some(ind => categoryLower.includes(ind) || nameLower.includes(ind))) {
        flags.push('TARGET_INDUSTRY');
        score += 10;
    }
    
    // Determine priority
    let priority = 'LOW';
    if (score >= 80) priority = 'URGENT';
    else if (score >= 65) priority = 'HIGH';
    else if (score >= 50) priority = 'MEDIUM';
    
    return {
        qualified: score >= 40,  // Lower threshold for resilient mode
        score,
        priority,
        flags,
        reason: score < 40 ? 'Score too low' : 'Qualified'
    };
}

// Load existing progress
function loadProgress(progressFile) {
    if (fs.existsSync(progressFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
            console.log(`📂 Loaded progress: ${data.completedSearches || 0} searches, ${data.qualifiedLeads?.length || 0} qualified leads`);
            return data;
        } catch (error) {
            console.error(`⚠️  Error loading progress: ${error.message}`);
        }
    }
    return {
        completedSearches: 0,
        allBusinesses: [],
        qualifiedLeads: [],
        failedSearches: [],
        stats: {
            totalBusinesses: 0,
            qualifiedCount: 0,
            urgentPriority: 0,
            highPriority: 0,
            mediumPriority: 0
        }
    };
}

// Save progress
function saveProgress(progressFile, data) {
    try {
        fs.writeFileSync(progressFile, JSON.stringify(data, null, 2));
        console.log(`💾 Saved: ${data.completedSearches} searches, ${data.allBusinesses.length} total, ${data.qualifiedLeads.length} qualified`);
        return true;
    } catch (error) {
        console.error(`✗ Save failed: ${error.message}`);
        return false;
    }
}

// Main campaign runner
async function runResilientCampaign() {
    const startTime = Date.now();
    const timestamp = Date.now();
    const resultsDir = path.join(__dirname, '../../results');
    
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const progressFile = path.join(resultsDir, `hr-outsourcing-resilient-${timestamp}.json`);
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 HR OUTSOURCING - RESILIENT CAMPAIGN');
    console.log('='.repeat(80));
    console.log(`📋 Target: ${CAMPAIGN_CONFIG.targetEmployees} employees`);
    console.log(`📍 Primary: ${CAMPAIGN_CONFIG.primaryAreas.join(', ')}`);
    console.log(`🏭 Industries: ${CAMPAIGN_CONFIG.industries.join(', ')}`);
    console.log(`💾 Progress file: ${path.basename(progressFile)}`);
    console.log(`⏱️  Delays: ${CAMPAIGN_CONFIG.delayBetweenSearches/1000}s between searches`);
    console.log('='.repeat(80) + '\n');
    
    const searchQueries = generateSearchQueries();
    console.log(`🔍 Generated ${searchQueries.length} search queries\n`);
    
    // Load existing progress
    const progress = loadProgress(progressFile);
    const startIndex = progress.completedSearches;
    
    if (startIndex > 0) {
        console.log(`🔄 Resuming from search ${startIndex + 1}/${searchQueries.length}\n`);
    }
    
    // Initialize scraper with VERY conservative settings
    const scraper = new GoogleMapsScraper({
        headless: false,  // Visible browser
        maxConcurrency: 1,
        requestDelay: 4000,  // 4 seconds between actions
        timeout: 30000,  // 30 second timeout
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    let browserInitialized = false;
    
    try {
        await scraper.initialize();
        browserInitialized = true;
        console.log('✅ Scraper initialized\n');
        
        // Process queries
        for (let i = startIndex; i < searchQueries.length; i++) {
            const query = searchQueries[i];
            const progress_display = `[${i + 1}/${searchQueries.length}]`;
            
            console.log('─'.repeat(80));
            console.log(`🔍 ${progress_display} Searching: "${query}"`);
            console.log(`⏱️  Progress: ${Math.round(((i + 1) / searchQueries.length) * 100)}%`);
            
            let businesses = [];
            let searchSuccessful = false;
            
            // Try to search with recovery
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    // Check if browser is still alive
                    if (!browserInitialized) {
                        console.log(`  🔄 Reinitializing browser (attempt ${attempt}/3)...`);
                        await scraper.initialize();
                        browserInitialized = true;
                        console.log(`  ✓ Browser ready`);
                        await new Promise(resolve => setTimeout(resolve, 5000));  // Extra wait after init
                    }
                    
                    businesses = await scraper.searchBusinesses(query, CAMPAIGN_CONFIG.maxResultsPerSearch);
                    searchSuccessful = true;
                    break;  // Success!
                    
                } catch (error) {
                    const errorMsg = error.message || String(error);
                    console.log(`  ⚠️  Attempt ${attempt}/3 failed: ${errorMsg.substring(0, 100)}`);
                    
                    browserInitialized = false;  // Mark for reinit
                    
                    if (attempt < 3) {
                        const waitTime = 10000 * attempt;  // 10s, 20s, 30s
                        console.log(`  ⏳ Waiting ${waitTime/1000}s before retry...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        
                        // Clean up crashed browser
                        try {
                            await scraper.close();
                        } catch (closeError) {
                            // Ignore close errors
                        }
                    }
                }
            }
            
            // Process results (if any)
            if (searchSuccessful && businesses.length > 0) {
                console.log(`✓ Found ${businesses.length} businesses`);
                
                let qualifiedCount = 0;
                businesses.forEach(business => {
                    const qualification = qualifyLead(business);
                    
                    if (qualification.qualified) {
                        qualifiedCount++;
                        const enrichedLead = {
                            ...business,
                            qualification: qualification,
                            sourceQuery: query,
                            collectedAt: new Date().toISOString()
                        };
                        progress.qualifiedLeads.push(enrichedLead);
                        progress.stats.qualifiedCount++;
                        
                        if (qualification.priority === 'URGENT') progress.stats.urgentPriority++;
                        else if (qualification.priority === 'HIGH') progress.stats.highPriority++;
                        else if (qualification.priority === 'MEDIUM') progress.stats.mediumPriority++;
                        
                        console.log(`  ✓ QUALIFIED: ${business.name} [${qualification.priority}] Phone: ${business.phone} (Score: ${qualification.score})`);
                    }
                });
                
                progress.allBusinesses.push(...businesses);
                progress.stats.totalBusinesses += businesses.length;
                
                if (qualifiedCount === 0) {
                    console.log(`  ℹ️  No qualified leads (missing phone numbers)`);
                }
            } else if (searchSuccessful) {
                console.log(`  ℹ️  No businesses found`);
            } else {
                console.log(`  ✗ Search failed after 3 attempts`);
                progress.failedSearches.push({ query, attemptedAt: new Date().toISOString() });
            }
            
            // Update progress
            progress.completedSearches = i + 1;
            progress.lastSaveTime = new Date().toISOString();
            
            // SAVE AFTER EVERY SEARCH
            saveProgress(progressFile, progress);
            
            // Delay before next search
            if (i < searchQueries.length - 1) {
                const delay = CAMPAIGN_CONFIG.delayBetweenSearches;
                console.log(`⏳ Waiting ${delay/1000}s before next search...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
    } catch (fatalError) {
        console.error(`\n💥 Fatal error: ${fatalError.message}`);
        console.error(`Stack: ${fatalError.stack}`);
    } finally {
        try {
            await scraper.close();
        } catch (closeError) {
            // Ignore
        }
    }
    
    // Final report
    const duration = Math.round((Date.now() - startTime) / 60000);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 CAMPAIGN COMPLETED');
    console.log('='.repeat(80));
    console.log(`⏱️  Duration: ${duration} minutes`);
    console.log(`🔍 Completed: ${progress.completedSearches}/${searchQueries.length} searches`);
    console.log(`📊 Total Businesses: ${progress.stats.totalBusinesses}`);
    console.log(`✓ Qualified Leads: ${progress.stats.qualifiedCount}`);
    
    if (progress.stats.totalBusinesses > 0) {
        const qualificationRate = Math.round((progress.stats.qualifiedCount / progress.stats.totalBusinesses) * 100);
        console.log(`📈 Qualification Rate: ${qualificationRate}%`);
    }
    
    console.log(`\n🎯 Priority Breakdown:`);
    console.log(`   🔴 URGENT: ${progress.stats.urgentPriority}`);
    console.log(`   🟠 HIGH: ${progress.stats.highPriority}`);
    console.log(`   🟡 MEDIUM: ${progress.stats.mediumPriority}`);
    
    if (progress.failedSearches.length > 0) {
        console.log(`\n⚠️  Failed Searches: ${progress.failedSearches.length}`);
    }
    
    console.log(`\n💾 Results saved to: ${path.basename(progressFile)}`);
    console.log('='.repeat(80) + '\n');
    
    return progress;
}

// Run if called directly
if (require.main === module) {
    runResilientCampaign()
        .then(() => {
            console.log('✅ Campaign finished successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Campaign failed:', error);
            process.exit(1);
        });
}

module.exports = { runResilientCampaign };
