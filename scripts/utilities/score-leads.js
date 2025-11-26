/**
 * Lead Scoring & Probability Analysis
 * 
 * Scores companies based on:
 * - Contact availability (email, phone, website)
 * - Company rating & reviews
 * - Contact score from scraper
 * - Digital presence quality
 * - Company type/category
 * 
 * Usage:
 *   node scripts/utilities/score-leads.js
 */

const fs = require('fs');
const path = require('path');

// Scoring weights
const SCORING_WEIGHTS = {
    hasEmail: 25,
    hasPhone: 20,
    hasWebsite: 15,
    hasHighRating: 10,      // 4.5+ rating
    hasMediumRating: 5,     // 4.0-4.49 rating
    hasReviews: 5,
    contactScore: 20,       // Use existing contact score
    uniqueCompany: 5        // Not a duplicate
};

// Industry scoring modifiers
const INDUSTRY_SCORES = {
    'property management': 10,
    'facilities management': 8,
    'building management': 8,
    'vacation rental': 7,
    'holiday homes': 7,
    'Airbnb management': 9,
    'serviced apartments': 6,
    'rental management': 8,
    'lease management': 7,
    'real estate agency': 5,
    'real estate broker': 5,
    'property consultant': 6,
    'estate management': 7,
    'community management': 6
};

// Pain point indicators (higher = more likely to need ERP/automation)
const PAIN_POINT_SCORE = {
    multipleProperties: 10,      // Vacation rentals, Airbnb = multiple properties
    tenantManagement: 8,         // Lease/rental management
    facilityOps: 9,              // Facilities management = operations heavy
    scalingBusiness: 7,          // Growing agencies
    manualProcesses: 10          // Property management = manual intensive
};

function scoreLeads() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║    AI Lead Scoring & Analysis          ║');
    console.log('║    Probability-Based Qualification     ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Load companies
    const inputPath = path.join(__dirname, '../../results/real-estate-property-mgmt-leads-2025-11-26T18-15-10-120Z.csv');
    const csvData = fs.readFileSync(inputPath, 'utf8');
    const lines = csvData.split('\n').slice(1); // Skip header
    
    const companies = [];
    const seen = new Set();

    // Parse CSV
    lines.forEach(line => {
        if (!line.trim()) return;
        
        // Simple CSV parser (handles quoted fields)
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!matches || matches.length < 8) return;

        const company = {
            name: matches[0].replace(/"/g, '').trim(),
            address: matches[1].replace(/"/g, '').trim(),
            phone: matches[2].replace(/"/g, '').trim(),
            email: matches[3].replace(/"/g, '').trim(),
            website: matches[4].replace(/"/g, '').trim(),
            rating: parseFloat(matches[5]) || 0,
            reviews: matches[6].replace(/"/g, '').trim(),
            category: matches[7].replace(/"/g, '').trim(),
            sector: matches[8]?.replace(/"/g, '').trim() || '',
            contactScore: parseInt(matches[9]) || 0
        };

        // Check for duplicates
        const uniqueKey = `${company.name}-${company.website}`.toLowerCase();
        company.isDuplicate = seen.has(uniqueKey);
        seen.add(uniqueKey);

        companies.push(company);
    });

    console.log(`📊 Analyzing ${companies.length} companies...\n`);

    // Score each company
    const scoredCompanies = companies.map(company => {
        let score = 0;
        const reasons = [];
        
        // Contact information scoring
        if (company.email && company.email !== 'Not available') {
            score += SCORING_WEIGHTS.hasEmail;
            reasons.push('Has direct email');
        }
        
        if (company.phone && company.phone !== 'Not available') {
            score += SCORING_WEIGHTS.hasPhone;
            reasons.push('Has phone number');
        }
        
        if (company.website && company.website !== 'Not available') {
            score += SCORING_WEIGHTS.hasWebsite;
            reasons.push('Has website');
        }
        
        // Rating scoring
        if (company.rating >= 4.5) {
            score += SCORING_WEIGHTS.hasHighRating;
            reasons.push('Excellent rating (4.5+)');
        } else if (company.rating >= 4.0) {
            score += SCORING_WEIGHTS.hasMediumRating;
            reasons.push('Good rating (4.0+)');
        }
        
        if (company.reviews && company.reviews !== 'Not available') {
            score += SCORING_WEIGHTS.hasReviews;
            reasons.push('Has customer reviews');
        }
        
        // Use existing contact score (scaled down)
        const contactScoreContribution = Math.min(20, Math.floor(company.contactScore / 5));
        score += contactScoreContribution;
        if (contactScoreContribution > 0) {
            reasons.push(`Contact score: ${company.contactScore}`);
        }
        
        // Penalty for duplicates
        if (company.isDuplicate) {
            score -= 10;
            reasons.push('⚠️ Duplicate entry');
        } else {
            score += SCORING_WEIGHTS.uniqueCompany;
        }
        
        // Industry-specific scoring
        const categoryLower = company.category.toLowerCase();
        for (const [industry, industryScore] of Object.entries(INDUSTRY_SCORES)) {
            if (categoryLower.includes(industry)) {
                score += industryScore;
                reasons.push(`${industry.charAt(0).toUpperCase() + industry.slice(1)} sector`);
                break;
            }
        }
        
        // Pain point analysis
        const painPoints = [];
        let painPointScore = 0;
        
        if (categoryLower.includes('vacation') || categoryLower.includes('holiday') || categoryLower.includes('airbnb')) {
            painPointScore += PAIN_POINT_SCORE.multipleProperties;
            painPoints.push('Multiple properties management');
        }
        
        if (categoryLower.includes('facilities') || categoryLower.includes('building')) {
            painPointScore += PAIN_POINT_SCORE.facilityOps;
            painPoints.push('Operations-heavy business');
        }
        
        if (categoryLower.includes('rental') || categoryLower.includes('lease') || categoryLower.includes('tenant')) {
            painPointScore += PAIN_POINT_SCORE.tenantManagement;
            painPoints.push('Tenant/lease management');
        }
        
        if (categoryLower.includes('property management')) {
            painPointScore += PAIN_POINT_SCORE.manualProcesses;
            painPoints.push('Manual process intensive');
        }
        
        score += painPointScore;
        
        // Calculate conversion probability
        const probability = Math.min(100, Math.round(score));
        
        // Tier classification
        let tier, priority;
        if (probability >= 80) {
            tier = 'A+ (Hot Lead)';
            priority = 1;
        } else if (probability >= 70) {
            tier = 'A (High Priority)';
            priority = 2;
        } else if (probability >= 60) {
            tier = 'B (Medium Priority)';
            priority = 3;
        } else if (probability >= 50) {
            tier = 'C (Low Priority)';
            priority = 4;
        } else {
            tier = 'D (Cold Lead)';
            priority = 5;
        }
        
        // Generate recommended approach
        let approach = '';
        if (probability >= 70) {
            approach = 'Direct outreach to decision maker. Emphasize ROI and efficiency gains.';
        } else if (probability >= 60) {
            approach = 'Educational approach. Share case studies and industry benchmarks.';
        } else if (probability >= 50) {
            approach = 'Nurture campaign. Provide valuable content, build relationship over time.';
        } else {
            approach = 'Low priority. Consider for future campaigns or when scaling.';
        }
        
        return {
            ...company,
            leadScore: probability,
            tier,
            priority,
            scoringReasons: reasons,
            painPoints,
            conversionProbability: `${probability}%`,
            recommendedApproach: approach,
            estimatedDealSize: estimateDealSize(company, probability),
            expectedValue: calculateExpectedValue(probability, estimateDealSize(company, probability))
        };
    });
    
    // Sort by score (highest first)
    scoredCompanies.sort((a, b) => b.leadScore - a.leadScore);
    
    // Save results
    saveResults(scoredCompanies);
    
    // Print analysis
    printAnalysis(scoredCompanies);
}

function estimateDealSize(company, probability) {
    const categoryLower = company.category.toLowerCase();
    
    // Base deal size by company type
    let baseSize = 30000; // Default
    
    if (categoryLower.includes('facilities management')) {
        baseSize = 75000; // Larger operations
    } else if (categoryLower.includes('vacation') || categoryLower.includes('airbnb')) {
        baseSize = 50000; // Multiple properties
    } else if (categoryLower.includes('property management')) {
        baseSize = 45000; // Property management software
    } else if (categoryLower.includes('building management')) {
        baseSize = 60000; // Building operations
    } else if (categoryLower.includes('serviced apartments')) {
        baseSize = 55000; // Hospitality-style
    } else if (categoryLower.includes('real estate agency') || categoryLower.includes('broker')) {
        baseSize = 25000; // Smaller agencies
    }
    
    // Adjust by rating (proxy for company size/quality)
    if (company.rating >= 4.5) {
        baseSize *= 1.2;
    } else if (company.rating >= 4.0) {
        baseSize *= 1.1;
    } else if (company.rating < 3.5) {
        baseSize *= 0.8;
    }
    
    return Math.round(baseSize);
}

function calculateExpectedValue(probability, dealSize) {
    // Expected value = Probability × Deal Size
    const probDecimal = probability / 100;
    return Math.round(dealSize * probDecimal);
}

function saveResults(companies) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(__dirname, '../../results');
    
    // Save full scored list as JSON
    const jsonPath = path.join(outputDir, `scored-leads-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify({
        metadata: {
            timestamp: new Date().toISOString(),
            totalLeads: companies.length,
            tierBreakdown: {
                'A+ Hot Leads': companies.filter(c => c.tier.startsWith('A+')).length,
                'A High Priority': companies.filter(c => c.tier.startsWith('A (')).length,
                'B Medium Priority': companies.filter(c => c.tier.startsWith('B')).length,
                'C Low Priority': companies.filter(c => c.tier.startsWith('C')).length,
                'D Cold Leads': companies.filter(c => c.tier.startsWith('D')).length
            }
        },
        scoredLeads: companies
    }, null, 2));
    
    // Save CSV for CRM import
    const csvPath = path.join(outputDir, `scored-leads-${timestamp}.csv`);
    const csvHeader = 'Priority,Tier,Lead Score,Company Name,Website,Phone,Email,Rating,Category,Conversion Probability,Deal Size,Expected Value,Recommended Approach,Pain Points\n';
    const csvRows = companies.map(c => 
        `${c.priority},"${c.tier}",${c.leadScore},"${c.name}","${c.website}","${c.phone}","${c.email}",${c.rating},"${c.category}","${c.conversionProbability}","$${c.estimatedDealSize.toLocaleString()}","$${c.expectedValue.toLocaleString()}","${c.recommendedApproach}","${c.painPoints.join('; ')}"`
    ).join('\n');
    fs.writeFileSync(csvPath, csvHeader + csvRows);
    
    // Save top 20 hot leads
    const hotLeads = companies.filter(c => c.leadScore >= 70);
    const hotLeadsCsvPath = path.join(outputDir, `hot-leads-priority-${timestamp}.csv`);
    const hotLeadsCsvRows = hotLeads.map(c => 
        `${c.priority},"${c.tier}",${c.leadScore},"${c.name}","${c.website}","${c.phone}","${c.email}",${c.rating},"${c.category}","${c.conversionProbability}","$${c.estimatedDealSize.toLocaleString()}","$${c.expectedValue.toLocaleString()}","${c.recommendedApproach}","${c.painPoints.join('; ')}"`
    ).join('\n');
    fs.writeFileSync(hotLeadsCsvPath, csvHeader + hotLeadsCsvRows);
    
    console.log(`\n📁 Output Files:`);
    console.log(`   Full list: ${path.basename(csvPath)}`);
    console.log(`   JSON data: ${path.basename(jsonPath)}`);
    console.log(`   Hot leads: ${path.basename(hotLeadsCsvPath)}\n`);
}

function printAnalysis(companies) {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║              LEAD SCORING ANALYSIS COMPLETE                    ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    // Tier breakdown
    const tierA_plus = companies.filter(c => c.tier.startsWith('A+'));
    const tierA = companies.filter(c => c.tier.startsWith('A ('));
    const tierB = companies.filter(c => c.tier.startsWith('B'));
    const tierC = companies.filter(c => c.tier.startsWith('C'));
    const tierD = companies.filter(c => c.tier.startsWith('D'));
    
    console.log('📊 Lead Distribution:');
    console.log(`   🔥 A+ (Hot Leads, 80-100):        ${tierA_plus.length.toString().padStart(2)} leads`);
    console.log(`   ⭐ A  (High Priority, 70-79):     ${tierA.length.toString().padStart(2)} leads`);
    console.log(`   ✓  B  (Medium Priority, 60-69):   ${tierB.length.toString().padStart(2)} leads`);
    console.log(`   →  C  (Low Priority, 50-59):      ${tierC.length.toString().padStart(2)} leads`);
    console.log(`   ❄  D  (Cold Leads, <50):          ${tierD.length.toString().padStart(2)} leads\n`);
    
    // Top 10 leads
    console.log('🎯 Top 10 Priority Leads:\n');
    companies.slice(0, 10).forEach((company, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${company.tier} - Score: ${company.leadScore}`);
        console.log(`    ${company.name}`);
        console.log(`    💰 Deal Size: $${company.estimatedDealSize.toLocaleString()} | Expected Value: $${company.expectedValue.toLocaleString()}`);
        console.log(`    📞 ${company.phone || 'No phone'} | 📧 ${company.email || 'No email'}`);
        console.log(`    🌐 ${company.website || 'No website'}`);
        console.log(`    💡 Pain Points: ${company.painPoints.join(', ') || 'General property management'}`);
        console.log('');
    });
    
    // Pipeline value
    const totalPipelineValue = companies.reduce((sum, c) => sum + c.estimatedDealSize, 0);
    const totalExpectedValue = companies.reduce((sum, c) => sum + c.expectedValue, 0);
    const hotLeadsPipelineValue = tierA_plus.reduce((sum, c) => sum + c.estimatedDealSize, 0);
    const hotLeadsExpectedValue = tierA_plus.reduce((sum, c) => sum + c.expectedValue, 0);
    
    console.log('💰 Pipeline Value Analysis:');
    console.log(`   Total Pipeline Value:        $${totalPipelineValue.toLocaleString()}`);
    console.log(`   Total Expected Value:        $${totalExpectedValue.toLocaleString()}`);
    console.log(`   Hot Leads Pipeline (A+):     $${hotLeadsPipelineValue.toLocaleString()}`);
    console.log(`   Hot Leads Expected Value:    $${hotLeadsExpectedValue.toLocaleString()}\n`);
    
    // Recommendations
    console.log('🚀 Recommended Actions:\n');
    console.log(`1. IMMEDIATE: Focus on ${tierA_plus.length} A+ hot leads`);
    console.log(`   Expected: ${Math.round(tierA_plus.length * 0.15)} deals worth $${Math.round(hotLeadsExpectedValue * 0.15).toLocaleString()}\n`);
    
    console.log(`2. THIS WEEK: Reach out to ${tierA.length} A-tier high-priority leads`);
    console.log(`   Expected: ${Math.round(tierA.length * 0.10)} deals\n`);
    
    console.log(`3. THIS MONTH: Nurture ${tierB.length} B-tier medium-priority leads`);
    console.log(`   Expected: ${Math.round(tierB.length * 0.05)} deals\n`);
    
    console.log(`4. ONGOING: Long-term nurture for ${tierC.length + tierD.length} C/D-tier leads\n`);
}

// Run if called directly
if (require.main === module) {
    scoreLeads();
}

module.exports = scoreLeads;
