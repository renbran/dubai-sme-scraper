/**
 * Real Estate & Property Management Executive Finder
 * Uses Google Maps to find companies and extract contact information
 * Targets: Real Estate, Property Management, Holiday Homes, Rental Homes
 */

const GoogleMapsScraper = require('../../src/scraper');
const fs = require('fs').promises;
const path = require('path');

// Target categories for real estate sector
const REAL_ESTATE_CATEGORIES = [
    // Property Management
    'property management company in Dubai',
    'property manager in Dubai Marina',
    'property management Dubai Downtown',
    'building management Dubai',
    
    // Holiday Homes & Short-term Rentals
    'holiday homes Dubai',
    'vacation rentals Dubai',
    'short term rental Dubai',
    'Airbnb management Dubai',
    'serviced apartments Dubai',
    
    // Rental Services
    'rental management Dubai',
    'lease management Dubai',
    'tenant management Dubai',
    
    // Real Estate Agencies
    'real estate agency Dubai',
    'real estate broker Dubai',
    'property consultant Dubai',
    
    // Facilities Management
    'facilities management Dubai',
    'estate management Dubai',
    'community management Dubai'
];

async function runRealEstateCampaign() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  Dubai Real Estate & Property Management Lead Generator ║');
    console.log('║  Finding Decision Makers in Property Sector             ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const scraper = new GoogleMapsScraper({
        headless: true,
        maxConcurrency: 1,
        requestDelay: 3000,
        timeout: 20000
    });

    const allLeads = [];
    let totalProcessed = 0;
    let leadsWithContacts = 0;

    try {
        await scraper.initialize();

        console.log(`\n📋 Processing ${REAL_ESTATE_CATEGORIES.length} property sector categories...\n`);

        for (const [index, category] of REAL_ESTATE_CATEGORIES.entries()) {
            console.log(`\n${'═'.repeat(60)}`);
            console.log(`📍 Category ${index + 1}/${REAL_ESTATE_CATEGORIES.length}: ${category}`);
            console.log('═'.repeat(60));

            try {
                const results = await scraper.searchBusinesses(category, 15);

                console.log(`   Found ${results.length} businesses`);
                totalProcessed += results.length;

                // Analyze each business
                for (const [bizIndex, business] of results.entries()) {
                    console.log(`\n   ${bizIndex + 1}. ${business.name}`);
                    console.log(`      📍 ${business.address || 'N/A'}`);
                    console.log(`      📞 ${business.phone || 'N/A'}`);
                    console.log(`      📧 ${business.email || 'N/A'}`);
                    console.log(`      🌐 ${business.website || 'N/A'}`);
                    console.log(`      ⭐ ${business.rating || 'N/A'} (${business.reviewCount || 0} reviews)`);

                    // Check if we have contact information
                    const hasContact = business.phone || business.email || business.website;
                    if (hasContact) {
                        leadsWithContacts++;
                    }

                    // Enrich with additional details
                    const enrichedLead = {
                        ...business,
                        category: category,
                        sector: 'Real Estate & Property Management',
                        hasDirectContact: hasContact,
                        contactScore: calculateContactScore(business),
                        scrapedAt: new Date().toISOString(),
                        
                        // Potential executive titles based on company size
                        potentialExecutives: inferExecutiveTitles(business)
                    };

                    allLeads.push(enrichedLead);
                }

                // Small delay between categories
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (categoryError) {
                console.error(`\n❌ Error processing category "${category}":`, categoryError.message);
                continue;
            }
        }

        // Save results
        console.log('\n\n' + '═'.repeat(60));
        console.log('💾 Saving results...');
        console.log('═'.repeat(60));

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultsDir = path.join(__dirname, '../../results');
        
        // Save JSON
        const jsonFilename = `real-estate-property-mgmt-leads-${timestamp}.json`;
        const jsonPath = path.join(resultsDir, jsonFilename);
        await fs.writeFile(jsonPath, JSON.stringify(allLeads, null, 2));
        console.log(`✅ JSON saved: ${jsonFilename}`);
        
        // Save CSV
        const csvFilename = `real-estate-property-mgmt-leads-${timestamp}.csv`;
        const csvPath = path.join(resultsDir, csvFilename);
        const csvContent = convertToCSV(allLeads);
        await fs.writeFile(csvPath, csvContent);
        console.log(`✅ CSV saved: ${csvFilename}`);

        // Generate summary
        printSummary(allLeads, totalProcessed, leadsWithContacts);

    } catch (error) {
        console.error('\n❌ Campaign error:', error);
        throw error;
    } finally {
        await scraper.close();
    }

    return allLeads;
}

/**
 * Convert leads to CSV format
 */
function convertToCSV(leads) {
    const headers = [
        'Company Name', 'Address', 'Phone', 'Email', 'Website',
        'Rating', 'Reviews', 'Category', 'Sector', 'Contact Score',
        'Has Direct Contact', 'Potential Executive Titles', 'Scraped At'
    ];
    
    const rows = [headers.join(',')];
    
    leads.forEach(lead => {
        const row = [
            `"${(lead.businessName || lead.name || '').replace(/"/g, '""')}"`,
            `"${(lead.address || '').replace(/"/g, '""')}"`,
            lead.phone || '',
            lead.email || '',
            lead.website || '',
            lead.rating || '',
            lead.reviewCount || '',
            `"${(lead.category || '').replace(/"/g, '""')}"`,
            lead.sector || '',
            lead.contactScore || '',
            lead.hasDirectContact ? 'Yes' : 'No',
            `"${(lead.potentialExecutives || []).join('; ').replace(/"/g, '""')}"`,
            lead.scrapedAt || ''
        ];
        rows.push(row.join(','));
    });
    
    return rows.join('\n');
}

/**
 * Calculate contact quality score
 */
function calculateContactScore(business) {
    let score = 0;
    
    if (business.phone && business.phone !== 'Not available') score += 30;
    if (business.email && business.email !== 'Not available') score += 30;
    if (business.website && business.website !== 'Not available') score += 20;
    if (business.rating && business.rating >= 4.0) score += 10;
    if (business.reviewCount && business.reviewCount >= 10) score += 5;
    if (business.address && business.address !== 'Not available') score += 5;
    
    return score;
}

/**
 * Infer potential executive titles based on company characteristics
 */
function inferExecutiveTitles(business) {
    const titles = [];
    
    // Standard real estate titles
    titles.push('Managing Director');
    titles.push('Property Manager');
    titles.push('Operations Manager');
    
    // Based on review count (indicator of size)
    if (business.reviewCount > 100) {
        titles.push('CEO');
        titles.push('Head of Operations');
        titles.push('Regional Director');
    } else if (business.reviewCount > 20) {
        titles.push('General Manager');
        titles.push('Senior Property Manager');
    } else {
        titles.push('Owner');
        titles.push('Founder');
    }
    
    // Category-specific titles
    const category = business.category?.toLowerCase() || '';
    if (category.includes('holiday') || category.includes('vacation')) {
        titles.push('Vacation Rental Manager');
        titles.push('Holiday Homes Director');
    }
    if (category.includes('facilities')) {
        titles.push('Facilities Manager');
        titles.push('FM Director');
    }
    if (category.includes('leasing') || category.includes('rental')) {
        titles.push('Leasing Manager');
        titles.push('Rental Operations Manager');
    }
    
    return [...new Set(titles)]; // Remove duplicates
}

/**
 * Print comprehensive summary
 */
function printSummary(leads, totalProcessed, leadsWithContacts) {
    console.log('\n\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                    CAMPAIGN SUMMARY                      ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    
    console.log(`\n📊 Overall Statistics:`);
    console.log(`   Total businesses found: ${totalProcessed}`);
    console.log(`   Businesses with contact info: ${leadsWithContacts}`);
    console.log(`   Contact rate: ${((leadsWithContacts / totalProcessed) * 100).toFixed(1)}%`);
    
    // Quality breakdown
    const highQuality = leads.filter(l => l.contactScore >= 70).length;
    const mediumQuality = leads.filter(l => l.contactScore >= 40 && l.contactScore < 70).length;
    const lowQuality = leads.filter(l => l.contactScore < 40).length;
    
    console.log(`\n🎯 Lead Quality Breakdown:`);
    console.log(`   🔴 High Quality (score ≥70): ${highQuality}`);
    console.log(`   🟡 Medium Quality (score 40-69): ${mediumQuality}`);
    console.log(`   🟢 Low Quality (score <40): ${lowQuality}`);
    
    // Category breakdown
    console.log(`\n📈 By Category:`);
    const categoryStats = {};
    leads.forEach(lead => {
        const cat = lead.category || 'Unknown';
        categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });
    
    Object.entries(categoryStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([category, count]) => {
            console.log(`   • ${category}: ${count} leads`);
        });
    
    // Top leads
    console.log(`\n💼 Top 15 Leads (by contact score):`);
    leads
        .sort((a, b) => b.contactScore - a.contactScore)
        .slice(0, 15)
        .forEach((lead, i) => {
            console.log(`\n   ${i + 1}. ${lead.name} (Score: ${lead.contactScore}/100)`);
            console.log(`      📍 ${lead.address || 'N/A'}`);
            console.log(`      📞 ${lead.phone || 'N/A'}`);
            console.log(`      📧 ${lead.email || 'N/A'}`);
            console.log(`      🌐 ${lead.website || 'N/A'}`);
            console.log(`      ⭐ ${lead.rating || 'N/A'} (${lead.reviewCount || 0} reviews)`);
            if (lead.potentialExecutives && lead.potentialExecutives.length > 0) {
                console.log(`      👥 Potential contacts: ${lead.potentialExecutives.slice(0, 3).join(', ')}`);
            }
        });
    
    console.log('\n\n✅ Campaign completed successfully!\n');
    console.log('📁 Results saved in results/ directory');
    console.log('💡 Next steps:');
    console.log('   1. Review the CSV file for contact details');
    console.log('   2. Use phone/email to reach decision makers');
    console.log('   3. Reference potential executive titles when cold calling');
    console.log('   4. Prioritize high-score leads first\n');
}

// Run if executed directly
if (require.main === module) {
    runRealEstateCampaign()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = runRealEstateCampaign;
