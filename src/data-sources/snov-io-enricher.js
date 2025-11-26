/**
 * Snov.io Lead Generation Integration
 * 
 * Free Plan: 50 credits per month
 * Documentation: https://snov.io/api-documentation
 * 
 * Features:
 * - Email search by domain
 * - Email finder by name + company
 * - Email verification
 * - LinkedIn profile enrichment
 * - Bulk operations
 */

const axios = require('axios');

class SnovIOEnricher {
    constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.baseUrl = 'https://api.snov.io/v1';
        this.accessToken = null;
        this.tokenExpiry = null;
        this.requestCount = 0;
        this.maxRequests = 50; // Free plan limit
    }

    /**
     * Authenticate and get access token
     */
    async authenticate() {
        try {
            if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
                return this.accessToken;
            }

            console.log('[Snov.io] Authenticating...');
            
            const response = await axios.post(`${this.baseUrl}/oauth/access_token`, {
                grant_type: 'client_credentials',
                client_id: this.clientId,
                client_secret: this.clientSecret
            });

            if (response.data && response.data.access_token) {
                this.accessToken = response.data.access_token;
                this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
                console.log('✅ Snov.io authenticated successfully');
                return this.accessToken;
            }

            throw new Error('Failed to get access token');
        } catch (error) {
            console.error('❌ Snov.io authentication error:', error.message);
            throw error;
        }
    }

    /**
     * Find email addresses for a specific domain
     * Uses 1 credit per search
     */
    async searchDomainEmails(domain, options = {}) {
        try {
            await this.authenticate();

            this.requestCount++;
            if (this.requestCount > this.maxRequests) {
                console.warn(`⚠️  Snov.io: Approaching free plan limit (${this.requestCount}/${this.maxRequests})`);
            }

            const params = {
                access_token: this.accessToken,
                domain: domain,
                type: options.type || 'all', // 'all', 'personal', 'generic'
                limit: options.limit || 10,
                lastId: options.lastId || 0
            };

            console.log(`[Snov.io] Searching emails for domain: ${domain}`);
            
            const response = await axios.post(`${this.baseUrl}/get-domain-emails-with-info`, null, { params });

            if (response.data && response.data.success && response.data.emails) {
                return {
                    domain: domain,
                    emails: response.data.emails.map(e => ({
                        email: e.email,
                        firstName: e.firstName,
                        lastName: e.lastName,
                        position: e.position,
                        type: e.type, // 'personal' or 'generic'
                        status: e.status,
                        linkedin: e.linkedinUrl,
                        lastUpdate: e.lastUpdate
                    })),
                    companyName: response.data.companyName,
                    webmail: response.data.webmail,
                    result: response.data.result,
                    success: true
                };
            }

            return null;
        } catch (error) {
            if (error.response?.status === 429) {
                console.error('❌ Snov.io: Rate limit exceeded (50 credits/month on free plan)');
            } else {
                console.error(`[Snov.io] Error searching ${domain}:`, error.message);
            }
            return null;
        }
    }

    /**
     * Find email for a specific person at a company
     * Uses 1 credit
     */
    async findPersonEmail(firstName, lastName, domain) {
        try {
            await this.authenticate();

            this.requestCount++;

            const params = {
                access_token: this.accessToken,
                firstName: firstName,
                lastName: lastName,
                domain: domain
            };

            console.log(`[Snov.io] Finding email for ${firstName} ${lastName} at ${domain}`);
            
            const response = await axios.post(`${this.baseUrl}/get-emails-from-names`, null, { params });

            if (response.data && response.data.success && response.data.data) {
                const result = response.data.data;
                return {
                    email: result.email,
                    firstName: result.firstName,
                    lastName: result.lastName,
                    position: result.position,
                    companyName: result.companyName,
                    linkedin: result.linkedinUrl,
                    status: result.status,
                    success: true
                };
            }

            return null;
        } catch (error) {
            console.error(`[Snov.io] Error finding email:`, error.message);
            return null;
        }
    }

    /**
     * Verify email address
     * Uses verification credits
     */
    async verifyEmail(email) {
        try {
            await this.authenticate();

            const params = {
                access_token: this.accessToken,
                email: email
            };

            console.log(`[Snov.io] Verifying email: ${email}`);
            
            const response = await axios.post(`${this.baseUrl}/get-emails-verification`, null, { params });

            if (response.data && response.data.success) {
                return {
                    email: response.data.email,
                    status: response.data.status, // 'valid', 'invalid', 'catch-all', 'unknown'
                    result: response.data.result,
                    success: true
                };
            }

            return null;
        } catch (error) {
            console.error(`[Snov.io] Error verifying ${email}:`, error.message);
            return null;
        }
    }

    /**
     * Get prospect data from LinkedIn URL
     * Uses 1 credit
     */
    async enrichLinkedInProfile(linkedinUrl) {
        try {
            await this.authenticate();

            this.requestCount++;

            const params = {
                access_token: this.accessToken,
                url: linkedinUrl
            };

            console.log(`[Snov.io] Enriching LinkedIn profile: ${linkedinUrl}`);
            
            const response = await axios.post(`${this.baseUrl}/get-profile-by-url`, null, { params });

            if (response.data && response.data.success && response.data.data) {
                const profile = response.data.data;
                return {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    name: profile.name,
                    linkedin: profile.link,
                    emails: profile.emails || [],
                    phones: profile.phones || [],
                    position: profile.current_position,
                    company: profile.current_company,
                    companyWebsite: profile.company_website,
                    locality: profile.locality,
                    country: profile.country,
                    skills: profile.skills || [],
                    success: true
                };
            }

            return null;
        } catch (error) {
            console.error(`[Snov.io] Error enriching LinkedIn profile:`, error.message);
            return null;
        }
    }

    /**
     * Extract domain from company name or website
     */
    extractDomain(companyNameOrUrl) {
        if (!companyNameOrUrl) return null;

        // If it's a URL, extract domain
        if (companyNameOrUrl.includes('http') || companyNameOrUrl.includes('www')) {
            try {
                const url = new URL(companyNameOrUrl.startsWith('http') ? companyNameOrUrl : `https://${companyNameOrUrl}`);
                return url.hostname.replace('www.', '');
            } catch (e) {
                return null;
            }
        }

        // Try to construct domain from company name
        const cleanName = companyNameOrUrl
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .trim()
            .replace(/\s+/g, '');

        return `${cleanName}.com`;
    }

    /**
     * Enrich a business with Snov.io data
     */
    async enrichBusiness(business) {
        const website = business.website || business.url;
        
        if (!website || website === 'Not available') {
            console.log(`[Snov.io] No website for ${business.name}, skipping...`);
            return business;
        }

        const domain = this.extractDomain(website);
        
        if (!domain) {
            console.log(`[Snov.io] Could not extract domain from ${website}`);
            return business;
        }

        // Search for emails at this domain
        const emailData = await this.searchDomainEmails(domain, {
            type: 'personal',
            limit: 5
        });

        if (emailData && emailData.emails && emailData.emails.length > 0) {
            console.log(`✅ Found ${emailData.emails.length} contacts at ${business.name}`);
            
            business.snovData = {
                domain: emailData.domain,
                companyName: emailData.companyName,
                contacts: emailData.emails.map(e => ({
                    firstName: e.firstName,
                    lastName: e.lastName,
                    email: e.email,
                    position: e.position,
                    type: e.type,
                    linkedin: e.linkedin,
                    status: e.status
                }))
            };

            // Add first contact as primary
            if (emailData.emails[0]) {
                const contact = emailData.emails[0];
                if (!business.contactPerson) {
                    business.contactPerson = `${contact.firstName} ${contact.lastName}`;
                }
                if (!business.contactEmail) {
                    business.contactEmail = contact.email;
                }
                if (!business.contactPosition) {
                    business.contactPosition = contact.position;
                }
                if (!business.contactLinkedIn && contact.linkedin) {
                    business.contactLinkedIn = contact.linkedin;
                }
            }
        } else {
            console.log(`ℹ️  No contacts found for ${business.name}`);
            business.snovData = { searched: true, found: false };
        }

        // Add delay to respect rate limits
        await this.sleep(1000);

        return business;
    }

    /**
     * Batch enrich multiple businesses
     */
    async enrichBusinesses(businesses, maxEnrichments = 50) {
        console.log(`\n🔍 Enriching ${Math.min(businesses.length, maxEnrichments)} businesses with Snov.io...`);
        
        const enriched = [];
        let count = 0;

        for (const business of businesses) {
            if (count >= maxEnrichments) {
                console.log(`\n⚠️  Reached Snov.io free plan limit (${maxEnrichments} credits)`);
                console.log(`💡 ${businesses.length - count} businesses remain unenriched`);
                break;
            }

            const enrichedBusiness = await this.enrichBusiness(business);
            enriched.push(enrichedBusiness);
            count++;

            // Progress indicator
            if (count % 5 === 0) {
                console.log(`📊 Progress: ${count}/${Math.min(businesses.length, maxEnrichments)} businesses enriched`);
            }
        }

        // Add remaining businesses without enrichment
        if (count < businesses.length) {
            enriched.push(...businesses.slice(count));
        }

        console.log(`\n✅ Snov.io enrichment complete: ${count} businesses processed`);
        console.log(`📧 Found contacts at ${enriched.filter(b => b.snovData?.found !== false).length} companies`);

        return enriched;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get account balance
     */
    async getBalance() {
        try {
            await this.authenticate();

            const response = await axios.get(`${this.baseUrl}/get-user-balance`, {
                params: { access_token: this.accessToken }
            });

            if (response.data && response.data.success) {
                return {
                    credits: response.data.credits,
                    maxCredits: response.data.max_credits,
                    used: response.data.max_credits - response.data.credits,
                    success: true
                };
            }

            return null;
        } catch (error) {
            console.error('[Snov.io] Error fetching balance:', error.message);
            return null;
        }
    }
}

module.exports = SnovIOEnricher;
