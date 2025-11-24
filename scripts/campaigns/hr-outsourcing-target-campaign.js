/**
 * HR Outsourcing Target Campaign
 * 
 * TARGET PROFILE:
 * - SME-Enterprises requiring outsourced HR (white & blue collar)
 * - Company Size: 50-1000 employees
 * - Areas: Business Bay, JVC, JLT (Dubai)
 * - Industries: Construction, Electromechanical, Packaging
 * 
 * Business Intelligence Focus:
 * - Current workforce size indicators
 * - Project-based operations
 * - Multi-site operations
 * - Active hiring patterns
 */

const GoogleMapsScraper = require('../../src/scraper');
const AIBusinessIntelligence = require('../../src/ai-intelligence');
const { 
    validateInput, 
    calculateQualityScore,
    getMemoryUsage,
    getTimestamp 
} = require('../../src/utils');
const fs = require('fs');
const path = require('path');

// Configuration for HR Outsourcing Target Campaign
const CAMPAIGN_CONFIG = {
    name: 'HR Outsourcing - SME Enterprise Target',
    targetCompanySize: '50-1000 employees',
    targetAreas: ['Business Bay', 'JVC (Jumeirah Village Circle)', 'JLT (Jumeirah Lakes Towers)'],
    targetIndustries: ['Construction', 'Electromechanical', 'Packaging'],
    serviceOffering: 'Outsourced HR Services (White & Blue Collar)',
    
    // Scraping parameters
    maxResultsPerSearch: 15,  // Faster, focused scraping
    dataQualityLevel: 'high',  // Higher quality for enterprise leads
    
    // Lead qualification criteria
    qualificationCriteria: {
        mustHavePhone: true,  // MANDATORY: Must have phone or mobile
        hasWebsite: true,     // Enterprises usually have websites
        minRating: 3.5,       // Established companies
        minReviews: 5         // Active companies with presence
    }
};

/**
 * Generate targeted search queries for HR outsourcing prospects
 */
function generateTargetedSearchQueries() {
    // Primary target areas
    const primaryAreas = [
        'Business Bay Dubai',
        'JVC Dubai',
        'Jumeirah Village Circle Dubai',
        'JLT Dubai',
        'Jumeirah Lakes Towers Dubai'
    ];
    
    // Fallback area
    const fallbackAreas = [
        'Downtown Dubai',
        'DIFC Dubai',
        'Dubai Marina'
    ];
    
    const areas = [...primaryAreas, ...fallbackAreas];
    
    // Focused, high-yield search terms only
    const industries = {
        construction: [
            'construction companies',
            'building contractors',
            'MEP contractors',
            'fit-out contractors',
            'general contractors'
        ],
        electromechanical: [
            'electromechanical companies',
            'MEP contractors',
            'HVAC contractors',
            'electrical contractors',
            'facility management companies'
        ],
        packaging: [
            'packaging companies',
            'packaging manufacturers',
            'industrial packaging',
            'packaging solutions'
        ]
    };
    
    const queries = [];
    
    // Priority searches in target areas first
    primaryAreas.forEach(area => {
        industries.construction.forEach(type => {
            queries.push(`${type} in ${area}`);
        });
        industries.electromechanical.forEach(type => {
            queries.push(`${type} in ${area}`);
        });
        industries.packaging.forEach(type => {
            queries.push(`${type} in ${area}`);
        });
    });
    
    // Add fallback areas
    fallbackAreas.forEach(area => {
        industries.construction.forEach(type => {
            queries.push(`${type} in ${area}`);
        });
        industries.electromechanical.forEach(type => {
            queries.push(`${type} in ${area}`);
        });
        industries.packaging.forEach(type => {
            queries.push(`${type} in ${area}`);
        });
    });
    
    return queries;
}

/**
 * Qualify lead as potential HR outsourcing client
 */
function qualifyLeadForHROutsourcing(business) {
    const qualification = {
        score: 0,
        maxScore: 100,
        qualified: false,
        reasons: [],
        flags: []
    };
    
    // MANDATORY: Must have phone (30 points) - REJECT if missing
    const hasValidPhone = business.phone && 
                          business.phone !== 'Not available' && 
                          business.phone !== 'Contact via website' &&
                          business.phone.trim() !== '';
    
    if (!hasValidPhone) {
        // Immediately disqualify - no phone number
        qualification.score = 0;
        qualification.qualified = false;
        qualification.reasons.push('REJECTED: No valid phone number');
        return qualification;
    }
    
    qualification.score += 30;
    qualification.reasons.push('Has phone contact');
    qualification.flags.push('HAS_PHONE');
    
    // Bonus for email (10 points)
    if (business.email && business.email !== 'Not available') {
        qualification.score += 10;
        qualification.reasons.push('Has email contact');
    }
    
    // Has website (20 points) - indicates established company
    if (business.website && business.website !== 'Not available') {
        qualification.score += 20;
        qualification.reasons.push('Has company website');
        qualification.flags.push('ESTABLISHED_BUSINESS');
    }
    
    // Location in target area (15 points)
    const targetLocations = ['business bay', 'jvc', 'jumeirah village', 'jlt', 'jumeirah lakes'];
    const address = (business.address || '').toLowerCase();
    const hasTargetLocation = targetLocations.some(loc => address.includes(loc));
    
    if (hasTargetLocation) {
        qualification.score += 15;
        qualification.reasons.push('Located in target area');
        qualification.flags.push('TARGET_LOCATION');
    }
    
    // Good rating (10 points) - indicates quality operation
    const rating = parseFloat(business.rating) || 0;
    if (rating >= 4.0) {
        qualification.score += 10;
        qualification.reasons.push('High rating (4.0+)');
    } else if (rating >= 3.5) {
        qualification.score += 5;
        qualification.reasons.push('Good rating (3.5+)');
    }
    
    // Has reviews (10 points) - indicates active business
    const reviews = parseInt(business.reviewCount) || 0;
    if (reviews >= 20) {
        qualification.score += 10;
        qualification.reasons.push('Many reviews (20+)');
        qualification.flags.push('ACTIVE_BUSINESS');
    } else if (reviews >= 5) {
        qualification.score += 5;
        qualification.reasons.push('Has reviews (5+)');
    }
    
    // Industry indicators in name or category (15 points)
    const businessInfo = `${business.name} ${business.category || ''}`.toLowerCase();
    const industryKeywords = [
        'construction', 'contractor', 'building', 'civil', 'fit-out', 'mep',
        'electromechanical', 'electrical', 'mechanical', 'hvac', 'plumbing',
        'packaging', 'manufacturing', 'industrial', 'facility management'
    ];
    
    const hasIndustryKeyword = industryKeywords.some(keyword => businessInfo.includes(keyword));
    if (hasIndustryKeyword) {
        qualification.score += 15;
        qualification.reasons.push('Matches target industry');
        qualification.flags.push('TARGET_INDUSTRY');
    }
    
    // Enterprise indicators (10 points)
    const enterpriseKeywords = ['group', 'holdings', 'international', 'llc', 'fze', 'fzco'];
    const hasEnterpriseIndicator = enterpriseKeywords.some(keyword => 
        business.name.toLowerCase().includes(keyword)
    );
    
    if (hasEnterpriseIndicator) {
        qualification.score += 10;
        qualification.reasons.push('Enterprise-level company');
        qualification.flags.push('ENTERPRISE');
    }
    
    // Qualification threshold: 50+ points
    qualification.qualified = qualification.score >= 50;
    
    if (qualification.qualified) {
        if (qualification.score >= 80) {
            qualification.priority = 'URGENT';
            qualification.flags.push('HIGH_PRIORITY');
        } else if (qualification.score >= 65) {
            qualification.priority = 'HIGH';
        } else {
            qualification.priority = 'MEDIUM';
        }
    } else {
        qualification.priority = 'LOW';
    }
    
    return qualification;
}

/**
 * Enrich lead with HR outsourcing context
 */
function enrichLeadForHROutsourcing(business, qualification) {
    return {
        ...business,
        
        // Campaign metadata
        campaignName: CAMPAIGN_CONFIG.name,
        targetProfile: CAMPAIGN_CONFIG.serviceOffering,
        qualificationScore: qualification.score,
        qualificationReasons: qualification.reasons.join('; '),
        priority: qualification.priority,
        flags: qualification.flags.join(', '),
        
        // Business size estimate
        estimatedSize: estimateCompanySize(business),
        
        // HR outsourcing pitch angle
        pitchAngle: determinePitchAngle(business, qualification),
        
        // Target decision makers
        targetRoles: 'HR Manager, Operations Manager, Project Manager, CEO/MD',
        
        // Service offering match
        serviceMatch: determineServiceMatch(business),
        
        // Next action
        nextAction: determineNextAction(qualification)
    };
}

/**
 * Estimate company size based on available data
 */
function estimateCompanySize(business) {
    const reviews = parseInt(business.reviewCount) || 0;
    const rating = parseFloat(business.rating) || 0;
    const businessInfo = `${business.name} ${business.category || ''}`.toLowerCase();
    
    // Size indicators
    const largeIndicators = ['group', 'holdings', 'international'];
    const mediumIndicators = ['llc', 'fze', 'fzco', 'contractors', 'management'];
    
    const hasLargeIndicator = largeIndicators.some(ind => businessInfo.includes(ind));
    const hasMediumIndicator = mediumIndicators.some(ind => businessInfo.includes(ind));
    
    if (hasLargeIndicator && reviews > 50) {
        return '200-1000 employees (estimated)';
    } else if ((hasMediumIndicator && reviews > 20) || (rating >= 4.0 && reviews > 30)) {
        return '100-500 employees (estimated)';
    } else if (reviews > 10 || hasMediumIndicator) {
        return '50-200 employees (estimated)';
    } else {
        return 'SME - needs verification';
    }
}

/**
 * Determine best pitch angle based on business type
 */
function determinePitchAngle(business, qualification) {
    const businessInfo = `${business.name} ${business.category || ''}`.toLowerCase();
    
    if (businessInfo.includes('construction') || businessInfo.includes('contractor')) {
        return 'Project-based workforce scaling, skilled labor supply, compliance management';
    } else if (businessInfo.includes('mep') || businessInfo.includes('electromechanical')) {
        return 'Technical staff augmentation, certified technicians, multi-site workforce';
    } else if (businessInfo.includes('packaging') || businessInfo.includes('manufacturing')) {
        return 'Production floor staffing, shift-based workers, quality control staff';
    } else if (businessInfo.includes('facility')) {
        return 'Multi-site staff management, maintenance crews, security personnel';
    } else {
        return 'Flexible workforce solutions, white & blue collar staffing';
    }
}

/**
 * Determine service match
 */
function determineServiceMatch(business) {
    const businessInfo = `${business.name} ${business.category || ''}`.toLowerCase();
    const services = [];
    
    if (businessInfo.includes('construction') || businessInfo.includes('contractor')) {
        services.push('Site supervisors', 'Skilled laborers', 'Project coordinators');
    }
    
    if (businessInfo.includes('mep') || businessInfo.includes('electrical') || 
        businessInfo.includes('mechanical')) {
        services.push('Electricians', 'HVAC technicians', 'Plumbers', 'Engineers');
    }
    
    if (businessInfo.includes('packaging') || businessInfo.includes('manufacturing')) {
        services.push('Production workers', 'Machine operators', 'QC inspectors');
    }
    
    if (businessInfo.includes('facility')) {
        services.push('Maintenance staff', 'Cleaning crew', 'Security guards');
    }
    
    // Add general services
    services.push('HR compliance', 'Payroll management', 'Visa processing');
    
    return services.join(', ');
}

/**
 * Determine next action based on qualification
 */
function determineNextAction(qualification) {
    if (qualification.priority === 'URGENT') {
        return 'IMMEDIATE CALL - Schedule site visit and workforce audit';
    } else if (qualification.priority === 'HIGH') {
        return 'PRIORITY OUTREACH - Send tailored proposal within 24 hours';
    } else if (qualification.priority === 'MEDIUM') {
        return 'FOLLOW-UP - Email introduction and case studies';
    } else {
        return 'NURTURE - Add to newsletter and periodic check-ins';
    }
}

/**
 * Main campaign execution
 */
async function runHROutsourcingCampaign() {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 HR OUTSOURCING TARGET CAMPAIGN');
    console.log('='.repeat(80));
    console.log(`📋 Campaign: ${CAMPAIGN_CONFIG.name}`);
    console.log(`🏢 Target Size: ${CAMPAIGN_CONFIG.targetCompanySize}`);
    console.log(`📍 Areas: ${CAMPAIGN_CONFIG.targetAreas.join(', ')}`);
    console.log(`🏭 Industries: ${CAMPAIGN_CONFIG.targetIndustries.join(', ')}`);
    console.log(`💼 Service: ${CAMPAIGN_CONFIG.serviceOffering}`);
    console.log('='.repeat(80) + '\n');
    
    const startTime = Date.now();
    const searchQueries = generateTargetedSearchQueries();
    
    console.log(`🔍 Generated ${searchQueries.length} targeted search queries\n`);
    
    // Initialize scraper with faster settings
    const scraper = new GoogleMapsScraper({
        headless: false,  // Visible browser for monitoring
        maxConcurrency: 1,
        requestDelay: 2000,  // Faster scraping (2s instead of 5s)
        timeout: 20000,  // Quicker timeout
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    let allLeads = [];
    let qualifiedLeads = [];
    let stats = {
        totalSearches: searchQueries.length,
        totalBusinesses: 0,
        qualifiedCount: 0,
        urgentPriority: 0,
        highPriority: 0,
        mediumPriority: 0,
        targetLocationCount: 0,
        targetIndustryCount: 0
    };
    
    try {
        await scraper.initialize();
        console.log('✅ Scraper initialized\n');
        
        // Process searches
        for (let i = 0; i < searchQueries.length; i++) {
            const query = searchQueries[i];
            const progress = `[${i + 1}/${searchQueries.length}]`;
            
            console.log(`\n${'─'.repeat(80)}`);
            console.log(`🔍 ${progress} Searching: "${query}"`);
            console.log(`⏱️  Progress: ${Math.round((i / searchQueries.length) * 100)}%`);
            
            try {
                let businesses = [];
                let retryCount = 0;
                const maxRetries = 3;
                
                while (retryCount < maxRetries) {
                    try {
                        businesses = await scraper.searchBusinesses(
                            query, 
                            CAMPAIGN_CONFIG.maxResultsPerSearch
                        );
                        break; // Success, exit retry loop
                    } catch (searchError) {
                        retryCount++;
                        const errorMsg = searchError.message || String(searchError);
                        console.log(`  ⚠️ Attempt ${retryCount}/${maxRetries} failed: ${errorMsg}`);
                        
                        // Check if browser crashed (Google Maps anti-bot)
                        const isBrowserCrash = errorMsg.includes('browser has been closed') || 
                                              errorMsg.includes('Target page') || 
                                              errorMsg.includes('Target closed');
                        
                        if (retryCount < maxRetries) {
                            const waitTime = isBrowserCrash ? 10000 : 5000;  // Wait longer if browser crashed
                            console.log(`  🔄 ${isBrowserCrash ? 'Browser crashed - ' : ''}Retrying in ${waitTime/1000} seconds...`);
                            await new Promise(resolve => setTimeout(resolve, waitTime));
                            
                            // Always reinitialize browser on crash
                            try {
                                await scraper.close();
                                console.log(`  🔄 Reinitializing browser...`);
                                await scraper.initialize();
                                console.log(`  ✓ Browser ready`);
                            } catch (reinitError) {
                                console.log(`  ⚠️ Browser reinit error: ${reinitError.message}`);
                            }
                        } else {
                            console.log(`  ✗ Max retries reached, skipping this search`);
                            // Don't throw - just skip this query and continue
                            businesses = [];
                        }
                    }
                }
                
                console.log(`✓ Found ${businesses.length} businesses`);
                
                // Qualify each lead (only those with phone numbers)
                let rejectedNoPhone = 0;
                businesses.forEach(business => {
                    const qualification = qualifyLeadForHROutsourcing(business);
                    
                    if (qualification.qualified) {
                        const enrichedLead = enrichLeadForHROutsourcing(business, qualification);
                        qualifiedLeads.push(enrichedLead);
                        
                        stats.qualifiedCount++;
                        
                        if (qualification.priority === 'URGENT') stats.urgentPriority++;
                        else if (qualification.priority === 'HIGH') stats.highPriority++;
                        else if (qualification.priority === 'MEDIUM') stats.mediumPriority++;
                        
                        if (qualification.flags.includes('TARGET_LOCATION')) stats.targetLocationCount++;
                        if (qualification.flags.includes('TARGET_INDUSTRY')) stats.targetIndustryCount++;
                        
                        console.log(`  ✓ QUALIFIED: ${business.name} [${qualification.priority}] Phone: ${business.phone} (Score: ${qualification.score})`);
                    } else {
                        rejectedNoPhone++;
                    }
                });
                
                if (rejectedNoPhone > 0) {
                    console.log(`  ✗ Rejected ${rejectedNoPhone} businesses (no phone number)`);
                }
                
                allLeads.push(...businesses);
                stats.totalBusinesses += businesses.length;
                
                // Memory management
                if (stats.totalBusinesses % 100 === 0) {
                    if (global.gc) global.gc();
                    const mem = getMemoryUsage();
                    console.log(`💾 Memory: ${mem.heapUsedMB}MB / ${mem.totalMB}MB`);
                }
                
            } catch (error) {
                console.error(`✗ Error searching "${query}":`, error.message);
            }
            
            // Shorter pause for faster campaign
            if (i < searchQueries.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // Progressive save every 5 searches (more frequent for stability)
            if ((i + 1) % 5 === 0) {
                const progressFile = path.join(resultsDir, `hr-outsourcing-progress-${timestamp}.json`);
                const saveData = {
                    campaign: CAMPAIGN_CONFIG,
                    stats: {
                        ...stats,
                        progressSearches: i + 1,
                        progressPercent: Math.round(((i + 1) / searchQueries.length) * 100),
                        lastSaveTime: new Date().toISOString()
                    },
                    timestamp: new Date().toISOString(),
                    allBusinesses: allLeads,  // Save all businesses too
                    qualifiedLeads: qualifiedLeads
                };
                
                try {
                    fs.writeFileSync(progressFile, JSON.stringify(saveData, null, 2));
                    console.log(`💾 Progress saved: ${i + 1}/${searchQueries.length} searches, ${allLeads.length} total, ${qualifiedLeads.length} qualified`);
                } catch (saveError) {
                    console.error(`✗ Failed to save progress: ${saveError.message}`);
                }
            }
        }
        
    } finally {
        await scraper.close();
    }
    
    // Generate reports
    console.log('\n' + '='.repeat(80));
    console.log('📊 CAMPAIGN RESULTS');
    console.log('='.repeat(80));
    console.log(`⏱️  Duration: ${Math.round((Date.now() - startTime) / 60000)} minutes`);
    console.log(`🔍 Searches: ${stats.totalSearches}`);
    console.log(`📊 Total Businesses: ${stats.totalBusinesses}`);
    console.log(`✓ Qualified Leads: ${stats.qualifiedCount} (${Math.round((stats.qualifiedCount / stats.totalBusinesses) * 100)}%)`);
    console.log(`\n🎯 Priority Breakdown:`);
    console.log(`   🔴 URGENT: ${stats.urgentPriority}`);
    console.log(`   🟠 HIGH: ${stats.highPriority}`);
    console.log(`   🟡 MEDIUM: ${stats.mediumPriority}`);
    console.log(`\n📍 Target Criteria:`);
    console.log(`   📌 Target Location: ${stats.targetLocationCount}`);
    console.log(`   🏭 Target Industry: ${stats.targetIndustryCount}`);
    console.log('='.repeat(80) + '\n');
    
    // Save results
    const timestamp = Date.now();
    const resultsDir = path.join(__dirname, '../../results');
    
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // Save qualified leads
    const qualifiedFile = path.join(resultsDir, `hr-outsourcing-qualified-${timestamp}.json`);
    fs.writeFileSync(qualifiedFile, JSON.stringify({
        campaign: CAMPAIGN_CONFIG,
        stats: stats,
        timestamp: new Date().toISOString(),
        leads: qualifiedLeads
    }, null, 2));
    
    console.log(`💾 Qualified leads saved: ${qualifiedFile}`);
    
    // Save all leads
    const allLeadsFile = path.join(resultsDir, `hr-outsourcing-all-${timestamp}.json`);
    fs.writeFileSync(allLeadsFile, JSON.stringify({
        campaign: CAMPAIGN_CONFIG,
        stats: stats,
        timestamp: new Date().toISOString(),
        leads: allLeads
    }, null, 2));
    
    console.log(`💾 All leads saved: ${allLeadsFile}`);
    
    // Create priority lists
    const urgentLeads = qualifiedLeads.filter(l => l.priority === 'URGENT');
    const highPriorityLeads = qualifiedLeads.filter(l => l.priority === 'HIGH');
    
    if (urgentLeads.length > 0) {
        const urgentFile = path.join(resultsDir, `hr-outsourcing-URGENT-${timestamp}.json`);
        fs.writeFileSync(urgentFile, JSON.stringify({
            priority: 'URGENT',
            count: urgentLeads.length,
            leads: urgentLeads
        }, null, 2));
        console.log(`🔴 URGENT leads saved: ${urgentFile}`);
    }
    
    if (highPriorityLeads.length > 0) {
        const highFile = path.join(resultsDir, `hr-outsourcing-HIGH-${timestamp}.json`);
        fs.writeFileSync(highFile, JSON.stringify({
            priority: 'HIGH',
            count: highPriorityLeads.length,
            leads: highPriorityLeads
        }, null, 2));
        console.log(`🟠 HIGH priority leads saved: ${highFile}`);
    }
    
    console.log('\n✅ HR OUTSOURCING CAMPAIGN COMPLETE!\n');
    
    return {
        stats,
        qualifiedLeads,
        allLeads
    };
}

// Execute campaign
if (require.main === module) {
    runHROutsourcingCampaign()
        .then(results => {
            console.log('Campaign completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Campaign failed:', error);
            process.exit(1);
        });
}

module.exports = { runHROutsourcingCampaign, qualifyLeadForHROutsourcing };
