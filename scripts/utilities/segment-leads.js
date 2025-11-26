/**
 * Lead Cleanup & Segmentation Tool
 * 
 * Segments leads into 4 categories:
 * 1. Premium: Email + Phone
 * 2. Email Only
 * 3. Phone Only
 * 4. No Direct Contact (website/address only)
 * 
 * Also removes duplicates and enriches with executive data
 * 
 * Usage:
 *   node scripts/utilities/segment-leads.js
 */

const fs = require('fs');
const path = require('path');

function segmentLeads() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║       Lead Cleanup & Segmentation Tool                    ║');
    console.log('║       Organize by Contact Availability                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Load company data
    const companiesPath = path.join(__dirname, '../../results/real-estate-property-mgmt-leads-2025-11-26T18-15-10-120Z.csv');
    const csvData = fs.readFileSync(companiesPath, 'utf8');
    const lines = csvData.split('\n').slice(1); // Skip header
    
    // Load executives data
    const executivesPath = path.join(__dirname, '../../results/dual-enriched-executives-2025-11-26T18-18-03-668Z.csv');
    const execCsvData = fs.readFileSync(executivesPath, 'utf8');
    const execLines = execCsvData.split('\n').slice(1);
    
    // Parse executives
    const executivesByCompany = {};
    execLines.forEach(line => {
        if (!line.trim()) return;
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!matches || matches.length < 4) return;
        
        const companyName = matches[3]?.replace(/"/g, '').trim();
        if (!companyName || companyName === 'undefined') return;
        
        if (!executivesByCompany[companyName]) {
            executivesByCompany[companyName] = [];
        }
        
        executivesByCompany[companyName].push({
            name: matches[0]?.replace(/"/g, '').trim(),
            email: matches[1]?.replace(/"/g, '').trim(),
            position: matches[2]?.replace(/"/g, '').trim(),
            linkedin: matches[4]?.replace(/"/g, '').trim(),
            phone: matches[5]?.replace(/"/g, '').trim(),
            source: matches[7]?.replace(/"/g, '').trim()
        });
    });
    
    console.log(`📊 Loaded executives from ${Object.keys(executivesByCompany).length} companies\n`);
    
    // Parse companies and remove duplicates
    const companies = [];
    const seen = new Map(); // Use Map to track duplicates and keep best version
    
    lines.forEach(line => {
        if (!line.trim()) return;
        
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!matches || matches.length < 8) return;

        const company = {
            name: matches[0]?.replace(/"/g, '').trim(),
            address: matches[1]?.replace(/"/g, '').trim(),
            phone: matches[2]?.replace(/"/g, '').trim(),
            email: matches[3]?.replace(/"/g, '').trim(),
            website: matches[4]?.replace(/"/g, '').trim(),
            rating: parseFloat(matches[5]) || 0,
            reviews: matches[6]?.replace(/"/g, '').trim(),
            category: matches[7]?.replace(/"/g, '').trim(),
            sector: matches[8]?.replace(/"/g, '').trim() || 'Real Estate & Property Management',
            contactScore: parseInt(matches[9]) || 0
        };
        
        // Clean up fields
        company.phone = cleanValue(company.phone);
        company.email = cleanValue(company.email);
        company.website = cleanValue(company.website);
        
        // Check for executives
        company.executives = executivesByCompany[company.name] || [];
        
        // Validate and clean contact info
        if (company.email && !isValidEmail(company.email)) {
            company.email = null; // Remove invalid email
        }
        if (company.phone && !isValidPhone(company.phone)) {
            company.phone = null; // Remove invalid phone
        }
        
        // Deduplicate logic: Keep entry with most information
        const key = company.name.toLowerCase().trim();
        if (seen.has(key)) {
            const existing = seen.get(key);
            // Keep the one with more contact info
            const existingScore = (existing.phone ? 1 : 0) + (existing.email ? 1 : 0) + (existing.website ? 1 : 0);
            const newScore = (company.phone ? 1 : 0) + (company.email ? 1 : 0) + (company.website ? 1 : 0);
            
            if (newScore > existingScore) {
                seen.set(key, company);
            }
        } else {
            seen.set(key, company);
        }
    });
    
    // Convert Map to array
    const uniqueCompanies = Array.from(seen.values());
    
    console.log(`📋 Original entries: ${lines.length}`);
    console.log(`✨ Unique companies: ${uniqueCompanies.length}`);
    console.log(`🗑️  Duplicates removed: ${lines.length - uniqueCompanies.length}\n`);
    
    // Segment leads
    const segments = {
        premium: [],      // Email + Phone
        emailOnly: [],    // Email only (no phone)
        phoneOnly: [],    // Phone only (no email)
        noContact: []     // No email or phone (website/address only)
    };
    
    uniqueCompanies.forEach(company => {
        // Comprehensive validation: check both company fields AND executive fields
        const hasValidCompanyEmail = isValidEmail(company.email);
        const hasValidCompanyPhone = isValidPhone(company.phone);
        const hasValidExecEmail = hasValidExecutiveContact(company.executives, 'email');
        const hasValidExecPhone = hasValidExecutiveContact(company.executives, 'phone');
        
        const hasEmail = hasValidCompanyEmail || hasValidExecEmail;
        const hasPhone = hasValidCompanyPhone || hasValidExecPhone;
        
        if (hasEmail && hasPhone) {
            segments.premium.push(company);
        } else if (hasEmail) {
            segments.emailOnly.push(company);
        } else if (hasPhone) {
            segments.phoneOnly.push(company);
        } else {
            segments.noContact.push(company);
        }
    });
    
    // Sort each segment by rating and contact score
    Object.keys(segments).forEach(key => {
        segments[key].sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            return b.contactScore - a.contactScore;
        });
    });
    
    // Save segmented results
    saveSegmentedResults(segments, uniqueCompanies.length);
    
    // Print analysis
    printSegmentation(segments);
}

function cleanValue(value) {
    if (!value || value === 'Not available' || value === 'N/A' || value === '') {
        return null;
    }
    return value;
}

function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    
    // Clean the email first
    email = email.trim().toLowerCase();
    
    // Invalid patterns
    const invalidPatterns = [
        'not available',
        'n/a',
        'none',
        'null',
        'undefined',
        'contact via website',
        'no email',
        'not found',
        'not provided',
        ''
    ];
    
    if (invalidPatterns.includes(email)) return false;
    if (email.length < 5) return false; // Minimum email length
    
    // Valid email regex pattern
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    
    // Clean the phone first
    phone = phone.trim();
    
    // Invalid patterns
    const invalidPatterns = [
        'not available',
        'n/a',
        'none',
        'null',
        'undefined',
        'contact via website',
        'no phone',
        'not found',
        'not provided',
        ''
    ];
    
    const lowerPhone = phone.toLowerCase();
    if (invalidPatterns.includes(lowerPhone)) return false;
    
    // Remove common formatting characters
    const digitsOnly = phone.replace(/[\s\-\(\)\+]/g, '');
    
    // Must have at least 7 digits (minimum valid phone number)
    // UAE numbers typically have 9 digits (without country code) or 12 with +971
    if (digitsOnly.length < 7) return false;
    
    // Must contain mostly digits
    const digitCount = (phone.match(/\d/g) || []).length;
    if (digitCount < 7) return false;
    
    // Valid phone patterns for UAE
    const uaePatterns = [
        /^\+971\s*\d{1,2}\s*\d{3}\s*\d{4}$/,  // +971 X XXX XXXX or +971 XX XXX XXXX
        /^971\d{9}$/,                          // 971XXXXXXXXX
        /^0\d{8,9}$/,                          // 0XXXXXXXX or 0XXXXXXXXX
        /^\d{7,}$/                             // Fallback: at least 7 digits
    ];
    
    // Check if it matches UAE patterns
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
    return uaePatterns.some(pattern => pattern.test(normalizedPhone));
}

function hasValidExecutiveContact(executives, type) {
    if (!executives || executives.length === 0) return false;
    
    return executives.some(exec => {
        if (type === 'email') {
            return isValidEmail(exec.email);
        } else if (type === 'phone') {
            return isValidPhone(exec.phone);
        }
        return false;
    });
}

function saveSegmentedResults(segments, totalCount) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(__dirname, '../../results');
    
    // Create CSV headers
    const csvHeader = 'Company Name,Website,Phone,Email,Rating,Reviews,Category,Contact Score,Executive Count,Executive Names,Executive Emails,Executive Phones,Executive LinkedIn\n';
    
    // Helper to format company row with validation status
    function formatCompanyRow(company, includeValidation = false) {
        const execNames = company.executives.map(e => e.name).join(' | ');
        const execEmails = company.executives.map(e => e.email).filter(e => isValidEmail(e)).join(' | ');
        const execPhones = company.executives.map(e => e.phone).filter(e => isValidPhone(e)).join(' | ');
        const execLinkedIn = company.executives.map(e => e.linkedin).filter(e => e).join(' | ');
        
        // Determine best contact info (validated)
        const bestEmail = isValidEmail(company.email) ? company.email : (execEmails || '');
        const bestPhone = isValidPhone(company.phone) ? company.phone : (execPhones || '');
        
        if (includeValidation) {
            return `"${company.name}","${company.website || ''}","${bestPhone}","${bestEmail}",${company.rating},"${company.reviews || ''}","${company.category}",${company.contactScore},${company.executives.length},"${execNames}","${execEmails}","${execPhones}","${execLinkedIn}","${isValidEmail(company.email) ? 'Valid' : 'Invalid/Missing'}","${isValidPhone(company.phone) ? 'Valid' : 'Invalid/Missing'}"`;
        }
        
        return `"${company.name}","${company.website || ''}","${bestPhone}","${bestEmail}",${company.rating},"${company.reviews || ''}","${company.category}",${company.contactScore},${company.executives.length},"${execNames}","${execEmails}","${execPhones}","${execLinkedIn}"`;
    }
    
    // 1. Premium Leads (Email + Phone)
    const premiumPath = path.join(outputDir, `premium-leads-email-phone-${timestamp}.csv`);
    const premiumRows = segments.premium.map(formatCompanyRow).join('\n');
    fs.writeFileSync(premiumPath, csvHeader + premiumRows);
    
    // 2. Email Only Leads
    const emailOnlyPath = path.join(outputDir, `email-only-leads-${timestamp}.csv`);
    const emailOnlyRows = segments.emailOnly.map(formatCompanyRow).join('\n');
    fs.writeFileSync(emailOnlyPath, csvHeader + emailOnlyRows);
    
    // 3. Phone Only Leads
    const phoneOnlyPath = path.join(outputDir, `phone-only-leads-${timestamp}.csv`);
    const phoneOnlyRows = segments.phoneOnly.map(formatCompanyRow).join('\n');
    fs.writeFileSync(phoneOnlyPath, csvHeader + phoneOnlyRows);
    
    // 4. No Direct Contact Leads
    const noContactPath = path.join(outputDir, `no-contact-leads-${timestamp}.csv`);
    const noContactRows = segments.noContact.map(formatCompanyRow).join('\n');
    fs.writeFileSync(noContactPath, csvHeader + noContactRows);
    
    // 5. Master File (All Segments Combined) with Validation
    const masterPath = path.join(outputDir, `master-leads-all-segments-${timestamp}.csv`);
    const masterHeader = 'Segment,Company Name,Website,Phone,Email,Rating,Reviews,Category,Contact Score,Executive Count,Executive Names,Executive Emails,Executive Phones,Executive LinkedIn,Email Status,Phone Status\n';
    
    const masterRows = [
        ...segments.premium.map(c => `"Premium (Email + Phone)",${formatCompanyRow(c, true)}`),
        ...segments.emailOnly.map(c => `"Email Only",${formatCompanyRow(c, true)}`),
        ...segments.phoneOnly.map(c => `"Phone Only",${formatCompanyRow(c, true)}`),
        ...segments.noContact.map(c => `"No Contact",${formatCompanyRow(c, true)}`)
    ].join('\n');
    
    fs.writeFileSync(masterPath, masterHeader + masterRows);
    
    // 6. Validation Report
    const validationPath = path.join(outputDir, `lead-validation-report-${timestamp}.txt`);
    const validationReport = generateValidationReport(segments, totalCount);
    fs.writeFileSync(validationPath, validationReport);
    
    // 7. Executive Contact List (Flat) - Only Valid Contacts
    const execContactPath = path.join(outputDir, `executive-contacts-flat-${timestamp}.csv`);
    const execContactHeader = 'Executive Name,Email,Phone,Position,LinkedIn,Company Name,Company Website,Company Phone,Company Rating,Source,Email Valid,Phone Valid\n';
    
    const execContactRows = [];
    Object.values(segments).flat().forEach(company => {
        company.executives.forEach(exec => {
            const emailValid = isValidEmail(exec.email);
            const phoneValid = isValidPhone(exec.phone);
            
            // Only include executives with at least one valid contact method
            if (emailValid || phoneValid) {
                execContactRows.push(
                    `"${exec.name}","${exec.email || ''}","${exec.phone || ''}","${exec.position}","${exec.linkedin || ''}","${company.name}","${company.website || ''}","${company.phone || ''}",${company.rating},"${exec.source}","${emailValid ? 'Yes' : 'No'}","${phoneValid ? 'Yes' : 'No'}"`
                );
            }
        });
    });
    
    fs.writeFileSync(execContactPath, execContactHeader + execContactRows.join('\n'));
    
    console.log('\n📁 Output Files Created:\n');
    console.log(`   1. ${path.basename(premiumPath)}`);
    console.log(`      → ${segments.premium.length} companies with Email + Phone\n`);
    
    console.log(`   2. ${path.basename(emailOnlyPath)}`);
    console.log(`      → ${segments.emailOnly.length} companies with Email only\n`);
    
    console.log(`   3. ${path.basename(phoneOnlyPath)}`);
    console.log(`      → ${segments.phoneOnly.length} companies with Phone only\n`);
    
    console.log(`   4. ${path.basename(noContactPath)}`);
    console.log(`      → ${segments.noContact.length} companies with No direct contact\n`);
    
    console.log(`   5. ${path.basename(masterPath)}`);
    console.log(`      → All ${totalCount} unique companies with validation status\n`);
    
    console.log(`   6. ${path.basename(validationPath)}`);
    console.log(`      → Detailed validation report\n`);
    
    console.log(`   7. ${path.basename(execContactPath)}`);
    console.log(`      → ${execContactRows.length} valid executive contacts\n`);
}

function generateValidationReport(segments, totalCount) {
    let report = '═══════════════════════════════════════════════════════════\n';
    report += '           LEAD VALIDATION REPORT\n';
    report += '═══════════════════════════════════════════════════════════\n\n';
    
    report += `Total Unique Companies: ${totalCount}\n`;
    report += `Validation Date: ${new Date().toISOString()}\n\n`;
    
    report += '--- VALIDATION CRITERIA ---\n\n';
    report += 'Email Validation:\n';
    report += '  ✓ Must match standard email format (user@domain.com)\n';
    report += '  ✓ Must have @ symbol and valid domain\n';
    report += '  ✓ Minimum 5 characters\n';
    report += '  ✗ Excludes: "Not available", "N/A", "Contact via website"\n\n';
    
    report += 'Phone Validation:\n';
    report += '  ✓ Must contain at least 7 digits\n';
    report += '  ✓ Valid UAE formats: +971 X XXX XXXX, 0XXXXXXXXX\n';
    report += '  ✓ Can include formatting: spaces, hyphens, parentheses\n';
    report += '  ✗ Excludes: "Not available", "N/A", text-only entries\n\n';
    
    report += '--- SEGMENTATION RESULTS ---\n\n';
    
    const allCompanies = Object.values(segments).flat();
    
    let validCompanyEmails = 0;
    let validCompanyPhones = 0;
    let validExecEmails = 0;
    let validExecPhones = 0;
    let invalidEmails = 0;
    let invalidPhones = 0;
    
    allCompanies.forEach(company => {
        if (isValidEmail(company.email)) validCompanyEmails++;
        else if (company.email) invalidEmails++;
        
        if (isValidPhone(company.phone)) validCompanyPhones++;
        else if (company.phone) invalidPhones++;
        
        company.executives.forEach(exec => {
            if (isValidEmail(exec.email)) validExecEmails++;
            if (isValidPhone(exec.phone)) validExecPhones++;
        });
    });
    
    report += `Premium Leads (Email + Phone):    ${segments.premium.length}\n`;
    report += `Email Only Leads:                  ${segments.emailOnly.length}\n`;
    report += `Phone Only Leads:                  ${segments.phoneOnly.length}\n`;
    report += `No Direct Contact:                 ${segments.noContact.length}\n\n`;
    
    report += '--- VALIDATION STATISTICS ---\n\n';
    report += `Valid Company Emails:              ${validCompanyEmails}\n`;
    report += `Valid Company Phones:              ${validCompanyPhones}\n`;
    report += `Valid Executive Emails:            ${validExecEmails}\n`;
    report += `Valid Executive Phones:            ${validExecPhones}\n`;
    report += `Invalid/Placeholder Emails:        ${invalidEmails}\n`;
    report += `Invalid/Placeholder Phones:        ${invalidPhones}\n\n`;
    
    report += '--- PROBLEMATIC ENTRIES ---\n\n';
    
    const problematic = allCompanies.filter(c => {
        const hasInvalidEmail = c.email && !isValidEmail(c.email);
        const hasInvalidPhone = c.phone && !isValidPhone(c.phone);
        return hasInvalidEmail || hasInvalidPhone;
    });
    
    if (problematic.length > 0) {
        problematic.forEach((company, i) => {
            report += `${i + 1}. ${company.name}\n`;
            if (company.email && !isValidEmail(company.email)) {
                report += `   ✗ Invalid Email: "${company.email}"\n`;
            }
            if (company.phone && !isValidPhone(company.phone)) {
                report += `   ✗ Invalid Phone: "${company.phone}"\n`;
            }
            report += '\n';
        });
    } else {
        report += 'No problematic entries found! All contacts validated successfully.\n\n';
    }
    
    report += '--- RECOMMENDATIONS ---\n\n';
    report += `1. Focus on ${segments.premium.length} Premium leads first (multi-channel outreach)\n`;
    report += `2. Email campaign for ${segments.emailOnly.length} Email-only leads\n`;
    report += `3. Cold calling for ${segments.phoneOnly.length} Phone-only leads\n`;
    report += `4. Research needed for ${segments.noContact.length} No-contact leads\n\n`;
    
    report += `Total contactable leads: ${segments.premium.length + segments.emailOnly.length + segments.phoneOnly.length} (${((segments.premium.length + segments.emailOnly.length + segments.phoneOnly.length) / totalCount * 100).toFixed(1)}%)\n\n`;
    
    report += '═══════════════════════════════════════════════════════════\n';
    
    return report;
}

function printSegmentation(segments) {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║           LEAD SEGMENTATION COMPLETE                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    const total = segments.premium.length + segments.emailOnly.length + 
                  segments.phoneOnly.length + segments.noContact.length;
    
    console.log('📊 Segmentation Breakdown:\n');
    
    // Premium Leads
    console.log(`🔥 PREMIUM LEADS (Email + Phone): ${segments.premium.length} companies`);
    console.log(`   Best quality - ready for immediate outreach`);
    console.log(`   Percentage: ${((segments.premium.length / total) * 100).toFixed(1)}%\n`);
    
    if (segments.premium.length > 0) {
        console.log('   Top 5 Premium Leads:');
        segments.premium.slice(0, 5).forEach((c, i) => {
            const execInfo = c.executives.length > 0 ? ` (${c.executives.length} exec${c.executives.length > 1 ? 's' : ''})` : '';
            console.log(`   ${i + 1}. ${c.name}${execInfo} - ⭐${c.rating}/5`);
        });
        console.log('');
    }
    
    // Email Only
    console.log(`📧 EMAIL ONLY LEADS: ${segments.emailOnly.length} companies`);
    console.log(`   Email outreach campaigns`);
    console.log(`   Percentage: ${((segments.emailOnly.length / total) * 100).toFixed(1)}%\n`);
    
    if (segments.emailOnly.length > 0) {
        const withValidExecs = segments.emailOnly.filter(c => hasValidExecutiveContact(c.executives, 'email')).length;
        const withValidCompanyEmail = segments.emailOnly.filter(c => isValidEmail(c.email)).length;
        console.log(`   → ${withValidExecs} have verified executive emails`);
        console.log(`   → ${withValidCompanyEmail} have valid company emails\n`);
    }
    
    // Phone Only
    console.log(`📞 PHONE ONLY LEADS: ${segments.phoneOnly.length} companies`);
    console.log(`   Cold calling campaigns`);
    console.log(`   Percentage: ${((segments.phoneOnly.length / total) * 100).toFixed(1)}%\n`);
    
    // No Contact
    console.log(`🌐 NO DIRECT CONTACT: ${segments.noContact.length} companies`);
    console.log(`   Website research or social selling required`);
    console.log(`   Percentage: ${((segments.noContact.length / total) * 100).toFixed(1)}%\n`);
    
    // Executive Summary
    const totalExecs = Object.values(segments).flat().reduce((sum, c) => sum + c.executives.length, 0);
    const companiesWithExecs = Object.values(segments).flat().filter(c => c.executives.length > 0).length;
    
    console.log('👥 Executive Contacts Summary:\n');
    console.log(`   Total executives found: ${totalExecs}`);
    console.log(`   Companies with executives: ${companiesWithExecs}`);
    console.log(`   Average execs per company: ${(totalExecs / companiesWithExecs).toFixed(1)}\n`);
    
    // Outreach Strategy
    console.log('🚀 Recommended Outreach Strategy:\n');
    console.log(`   PRIORITY 1: Premium Leads (${segments.premium.length})`);
    console.log(`   → Multi-channel: Email + Phone + LinkedIn`);
    console.log(`   → Highest conversion rate (15-20%)`);
    console.log(`   → Start TODAY\n`);
    
    console.log(`   PRIORITY 2: Email Only (${segments.emailOnly.length})`);
    console.log(`   → Email campaigns with follow-ups`);
    console.log(`   → Conversion rate (5-10%)`);
    console.log(`   → This week\n`);
    
    console.log(`   PRIORITY 3: Phone Only (${segments.phoneOnly.length})`);
    console.log(`   → Cold calling campaigns`);
    console.log(`   → Conversion rate (3-7%)`);
    console.log(`   → Next week\n`);
    
    console.log(`   PRIORITY 4: No Contact (${segments.noContact.length})`);
    console.log(`   → LinkedIn social selling`);
    console.log(`   → Website contact forms`);
    console.log(`   → Lower priority\n`);
    
    // Expected Outcomes
    const expectedDeals = 
        segments.premium.length * 0.175 +
        segments.emailOnly.length * 0.075 +
        segments.phoneOnly.length * 0.05;
    
    console.log('💰 Expected Outcomes (Next 3 Months):\n');
    console.log(`   Expected deals: ${Math.round(expectedDeals)} deals`);
    console.log(`   Average deal size: $30,000`);
    console.log(`   Expected revenue: $${(Math.round(expectedDeals) * 30000).toLocaleString()}\n`);
    
    console.log('✅ All leads cleaned, deduplicated, and segmented!');
    console.log('📊 Ready for CRM import and outreach campaigns\n');
}

// Run if called directly
if (require.main === module) {
    segmentLeads();
}

module.exports = segmentLeads;
