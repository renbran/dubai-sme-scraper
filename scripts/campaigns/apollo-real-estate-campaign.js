/**
 * Apollo Real Estate Executive Scraper (Free Plan Compatible)
 * Uses Apollo's person enrichment endpoint which works on free plan
 * Targets: Real Estate, Property Management, Holiday Homes, Rental Homes executives
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class ApolloRealEstateEnricher {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.apollo.io/v1';
        this.stats = {
            processed: 0,
            enriched: 0,
            failed: 0,
            creditsUsed: 0
        };
    }

    /**
     * Real Estate Executive Titles
     */
    static get REAL_ESTATE_TITLES() {
        return {
            // Property Management
            'Property Manager': 'property_manager',
            'Property Management Director': 'senior',
            'VP Property Management': 'vp',
            'Head of Property Management': 'director',
            
            // Real Estate Leadership
            'Real Estate Director': 'director',
            'VP Real Estate': 'vp',
            'Head of Real Estate': 'director',
            'Chief Real Estate Officer': 'c_suite',
            
            // Holiday Homes & Short-term Rentals
            'Holiday Homes Manager': 'manager',
            'Vacation Rental Manager': 'manager',
            'Short-term Rental Manager': 'manager',
            'Airbnb Manager': 'manager',
            
            // Leasing & Rentals
            'Leasing Manager': 'manager',
            'Rental Manager': 'manager',
            'Leasing Director': 'director',
            'VP Leasing': 'vp',
            
            // C-Suite
            'CEO': 'c_suite',
            'Chief Executive Officer': 'c_suite',
            'Managing Director': 'director',
            'Founder': 'founder',
            'Co-Founder': 'founder',
            'Owner': 'owner',
            
            // Operations
            'Operations Manager': 'manager',
            'Operations Director': 'director',
            'VP Operations': 'vp',
            'General Manager': 'manager',
            'Community Manager': 'manager'
        };
    }

    /**
     * Target company types
     */
    static get COMPANY_TYPES() {
        return [
            'Property Management',
            'Real Estate',
            'Holiday Homes',
            'Vacation Rentals',
            'Property Services',
            'Facilities Management',
            'Estate Management',
            'Rental Management',
            'Airbnb Management',
            'Short-term Rentals'
        ];
    }

    /**
     * Enrich a person by first name, last name, and company
     */
    async enrichPerson(firstName, lastName, companyName, companyDomain = null) {
        try {
            const payload = {
                first_name: firstName,
                last_name: lastName,
                organization_name: companyName
            };

            if (companyDomain) {
                payload.domain = companyDomain;
            }

            const response = await axios.post(
                `${this.baseUrl}/people/match`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache',
                        'X-Api-Key': this.apiKey
                    }
                }
            );

            this.stats.processed++;
            
            if (response.data.person) {
                this.stats.enriched++;
                return this.normalizePerson(response.data.person);
            }
            
            return null;
        } catch (error) {
            this.stats.failed++;
            console.error(`Failed to enrich ${firstName} ${lastName} at ${companyName}:`, error.message);
            return null;
        }
    }

    /**
     * Search for company on Apollo (free plan compatible)
     */
    async searchCompany(companyName, domain = null) {
        try {
            const params = {};
            
            if (domain) {
                params.domain = domain;
            } else {
                params.organization_name = companyName;
            }

            const response = await axios.get(
                `${this.baseUrl}/organizations/enrich`,
                {
                    params,
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache',
                        'X-Api-Key': this.apiKey
                    }
                }
            );

            if (response.data.organization) {
                return this.normalizeCompany(response.data.organization);
            }
            
            return null;
        } catch (error) {
            console.error(`Failed to find company ${companyName}:`, error.message);
            return null;
        }
    }

    /**
     * Normalize person data
     */
    normalizePerson(person) {
        return {
            firstName: person.first_name || '',
            lastName: person.last_name || '',
            fullName: person.name || `${person.first_name} ${person.last_name}`.trim(),
            title: person.title || '',
            seniority: person.seniority || '',
            
            email: person.email || person.personal_email || '',
            phone: person.phone_numbers?.[0]?.raw_number || person.corporate_phone || '',
            linkedinUrl: person.linkedin_url || '',
            
            companyName: person.organization?.name || '',
            companyDomain: person.organization?.primary_domain || '',
            
            city: person.city || '',
            state: person.state || '',
            country: person.country || '',
            
            apolloId: person.id,
            dataSource: 'apollo.io'
        };
    }

    /**
     * Normalize company data
     */
    normalizeCompany(company) {
        return {
            name: company.name || '',
            domain: company.primary_domain || company.website_url || '',
            industry: company.industry || '',
            description: company.short_description || '',
            
            employeeCount: company.estimated_num_employees || 0,
            revenue: company.annual_revenue || '',
            
            street: company.street_address || '',
            city: company.city || '',
            country: company.country || '',
            
            website: company.website_url || '',
            linkedinUrl: company.linkedin_url || '',
            phone: company.phone || '',
            
            apolloId: company.id
        };
    }
}

/**
 * Manual list of Dubai Real Estate & Property Management companies with known executives
 * This is the workaround for free plan - we provide the names and let Apollo enrich them
 */
const DUBAI_REAL_ESTATE_TARGETS = [
    // Major Property Management Companies
    {
        company: 'Asteco Property Management',
        domain: 'asteco.com',
        executives: [
            { firstName: 'John', lastName: 'Stevens', title: 'CEO' },
            { firstName: 'Andrew', lastName: 'Cleave', title: 'Property Management Director' }
        ]
    },
    {
        company: 'Emaar Properties',
        domain: 'emaar.com',
        executives: [
            { firstName: 'Mohamed', lastName: 'Alabbar', title: 'Founder' },
            { firstName: 'Ahmad', lastName: 'Al Matrooshi', title: 'Managing Director' }
        ]
    },
    {
        company: 'Eltizam Asset Management',
        domain: 'eltizam.com',
        executives: [
            { firstName: 'Tariq', lastName: 'Al Hashmi', title: 'CEO' }
        ]
    },
    {
        company: 'DAMAC Properties',
        domain: 'damacproperties.com',
        executives: [
            { firstName: 'Hussain', lastName: 'Sajwani', title: 'Founder & Chairman' },
            { firstName: 'Ziad', lastName: 'El Chaar', title: 'CEO' }
        ]
    },
    {
        company: 'Nakheel',
        domain: 'nakheel.com',
        executives: [
            { firstName: 'Ali', lastName: 'Rashid Lootah', title: 'Chairman' }
        ]
    },
    {
        company: 'Bayut',
        domain: 'bayut.com',
        executives: [
            { firstName: 'Haider', lastName: 'Ali Khan', title: 'CEO' }
        ]
    },
    {
        company: 'Property Finder',
        domain: 'propertyfinder.ae',
        executives: [
            { firstName: 'Michael', lastName: 'Lahyani', title: 'CEO & Founder' }
        ]
    },
    // Holiday Homes & Short-term Rentals
    {
        company: 'Stay One Degree',
        domain: 'stayonedegree.com',
        executives: [
            { firstName: 'Murtaza', lastName: 'Haji', title: 'CEO' }
        ]
    },
    {
        company: 'Vacation Homes',
        domain: 'vacationhomes.ae',
        executives: [
            { firstName: 'Faizan', lastName: 'Ahmed', title: 'Managing Director' }
        ]
    },
    {
        company: 'HomeZen Holiday Homes',
        domain: 'homezen.ae',
        executives: [
            { firstName: 'Sarah', lastName: 'Thompson', title: 'Operations Director' }
        ]
    },
    // Facilities Management
    {
        company: 'Farnek',
        domain: 'farnek.com',
        executives: [
            { firstName: 'Markus', lastName: 'Oberlin', title: 'CEO' }
        ]
    },
    {
        company: 'Khidmah',
        domain: 'khidmah.ae',
        executives: [
            { firstName: 'Jamal', lastName: 'Abdulla Lootah', title: 'CEO' }
        ]
    },
    {
        company: 'Imdad',
        domain: 'imdad.ae',
        executives: [
            { firstName: 'Gary', lastName: 'Annett', title: 'CEO' }
        ]
    }
];

async function runRealEstateExecutiveScraper() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  Dubai Real Estate & Property Management Executives     ║');
    console.log('║  Apollo.io Free Plan Compatible Scraper                 ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const apiKey = process.env.APOLLO_API_KEY;
    if (!apiKey) {
        console.error('❌ APOLLO_API_KEY not set!');
        process.exit(1);
    }

    const enricher = new ApolloRealEstateEnricher(apiKey);
    const enrichedLeads = [];

    console.log(`📋 Processing ${DUBAI_REAL_ESTATE_TARGETS.length} real estate companies...\n`);

    for (const [index, target] of DUBAI_REAL_ESTATE_TARGETS.entries()) {
        console.log(`\n${'═'.repeat(60)}`);
        console.log(`🏢 ${index + 1}/${DUBAI_REAL_ESTATE_TARGETS.length}: ${target.company}`);
        console.log('═'.repeat(60));

        // Get company info
        console.log('   🔍 Looking up company details...');
        const companyInfo = await enricher.searchCompany(target.company, target.domain);
        
        if (companyInfo) {
            console.log(`   ✅ Company found: ${companyInfo.name}`);
            console.log(`      Industry: ${companyInfo.industry}`);
            console.log(`      Employees: ${companyInfo.employeeCount || 'N/A'}`);
            console.log(`      Website: ${companyInfo.website}`);
        }

        // Enrich each executive
        const executives = [];
        console.log(`\n   👥 Enriching ${target.executives.length} executives...`);

        for (const exec of target.executives) {
            console.log(`\n      🔎 ${exec.firstName} ${exec.lastName} - ${exec.title}`);
            
            const enrichedPerson = await enricher.enrichPerson(
                exec.firstName,
                exec.lastName,
                target.company,
                target.domain
            );

            if (enrichedPerson) {
                console.log(`      ✅ Contact found!`);
                console.log(`         📧 ${enrichedPerson.email || 'N/A'}`);
                console.log(`         📱 ${enrichedPerson.phone || 'N/A'}`);
                console.log(`         🔗 ${enrichedPerson.linkedinUrl || 'N/A'}`);
                executives.push(enrichedPerson);
            } else {
                console.log(`      ⚠️  Contact not found in Apollo`);
            }

            // Small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Combine company + executives
        const lead = {
            company: companyInfo || {
                name: target.company,
                domain: target.domain
            },
            executives,
            executiveCount: executives.length,
            hasExecutiveContacts: executives.length > 0,
            primaryContact: executives.length > 0 ? executives[0] : null,
            category: 'Real Estate & Property Management',
            scrapedAt: new Date().toISOString()
        };

        enrichedLeads.push(lead);

        console.log(`\n   📊 Summary: Found ${executives.length}/${target.executives.length} executives`);
    }

    // Save results
    console.log('\n\n' + '═'.repeat(60));
    console.log('💾 Saving results...');
    console.log('═'.repeat(60));

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsDir = path.join(__dirname, '../../results');
    
    // JSON output
    const jsonFilename = `apollo-real-estate-executives-${timestamp}.json`;
    const jsonPath = path.join(resultsDir, jsonFilename);
    await fs.writeFile(jsonPath, JSON.stringify(enrichedLeads, null, 2));
    console.log(`✅ JSON saved: ${jsonFilename}`);

    // CSV output
    const csvFilename = `apollo-real-estate-executives-${timestamp}.csv`;
    const csvPath = path.join(resultsDir, csvFilename);
    
    const csvRows = [];
    csvRows.push([
        'Company Name', 'Company Domain', 'Company Industry', 'Employee Count',
        'Executive Name', 'Title', 'Seniority', 'Email', 'Phone', 'LinkedIn',
        'City', 'Country'
    ].join(','));

    for (const lead of enrichedLeads) {
        for (const exec of lead.executives) {
            csvRows.push([
                `"${lead.company.name}"`,
                lead.company.domain || '',
                `"${lead.company.industry || ''}"`,
                lead.company.employeeCount || '',
                `"${exec.fullName}"`,
                `"${exec.title}"`,
                exec.seniority || '',
                exec.email || '',
                exec.phone || '',
                exec.linkedinUrl || '',
                exec.city || '',
                exec.country || ''
            ].join(','));
        }
    }

    await fs.writeFile(csvPath, csvRows.join('\n'));
    console.log(`✅ CSV saved: ${csvFilename}`);

    // Print summary
    console.log('\n\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                    CAMPAIGN SUMMARY                      ║');
    console.log('╚══════════════════════════════════════════════════════════╝');

    const totalExecutives = enrichedLeads.reduce((sum, lead) => sum + lead.executiveCount, 0);
    const companiesWithContacts = enrichedLeads.filter(l => l.hasExecutiveContacts).length;

    console.log(`\n📊 Overall Statistics:`);
    console.log(`   Companies processed: ${enrichedLeads.length}`);
    console.log(`   Companies with executive contacts: ${companiesWithContacts}`);
    console.log(`   Total executives found: ${totalExecutives}`);
    console.log(`   Success rate: ${((companiesWithContacts / enrichedLeads.length) * 100).toFixed(1)}%`);

    console.log(`\n🎯 Top Contacts:`);
    enrichedLeads
        .filter(l => l.hasExecutiveContacts)
        .slice(0, 10)
        .forEach((lead, i) => {
            console.log(`\n   ${i + 1}. ${lead.company.name}`);
            lead.executives.forEach(exec => {
                console.log(`      • ${exec.fullName} - ${exec.title}`);
                console.log(`        📧 ${exec.email || 'N/A'} | 📱 ${exec.phone || 'N/A'}`);
            });
        });

    console.log(`\n📈 API Usage:`);
    console.log(`   Persons enriched: ${enricher.stats.enriched}/${enricher.stats.processed}`);
    console.log(`   Failed requests: ${enricher.stats.failed}`);
    console.log(`   Credits used: ~${enricher.stats.enriched} (1 per contact)`);

    console.log('\n✅ Scraping completed!\n');
}

// Run if executed directly
if (require.main === module) {
    runRealEstateExecutiveScraper()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { ApolloRealEstateEnricher, runRealEstateExecutiveScraper };
