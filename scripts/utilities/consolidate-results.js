/**
 * Consolidate All Results
 * 
 * Merges:
 * - Scored leads (49 companies with AI scoring)
 * - Executive data (35 verified executives)
 * - Segmented leads (validated contacts)
 * - Removes duplicates
 * - Creates master consolidated database
 * 
 * Usage:
 *   node scripts/utilities/consolidate-results.js
 */

const fs = require('fs');
const path = require('path');

function consolidateResults() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║       Master Lead Consolidation Tool                      ║');
    console.log('║       Merge All Data Sources                              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Load scored leads
    const scoredPath = findLatestFile('scored-leads-*.json');
    const scoredData = JSON.parse(fs.readFileSync(scoredPath, 'utf8'));
    console.log(`📊 Loaded ${scoredData.scoredLeads.length} scored companies`);

    // Load executives
    const execPath = findLatestFile('dual-enriched-executives-*.csv');
    const execCsvData = fs.readFileSync(execPath, 'utf8');
    const execLines = execCsvData.split('\n').slice(1);
    
    const executivesByCompany = {};
    const allExecutives = [];
    
    execLines.forEach(line => {
        if (!line.trim()) return;
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!matches || matches.length < 4) return;
        
        const exec = {
            name: matches[0]?.replace(/"/g, '').trim(),
            email: matches[1]?.replace(/"/g, '').trim(),
            position: matches[2]?.replace(/"/g, '').trim(),
            company: matches[3]?.replace(/"/g, '').trim(),
            linkedin: matches[4]?.replace(/"/g, '').trim(),
            phone: matches[5]?.replace(/"/g, '').trim(),
            confidence: matches[6]?.replace(/"/g, '').trim(),
            source: matches[7]?.replace(/"/g, '').trim()
        };
        
        if (!exec.company || exec.company === 'undefined') return;
        
        if (!executivesByCompany[exec.company]) {
            executivesByCompany[exec.company] = [];
        }
        
        executivesByCompany[exec.company].push(exec);
        allExecutives.push(exec);
    });
    
    console.log(`👥 Loaded ${allExecutives.length} executives from ${Object.keys(executivesByCompany).length} companies\n`);

    // Merge data
    const consolidatedLeads = [];
    const seenCompanies = new Map();
    
    scoredData.scoredLeads.forEach(lead => {
        const companyKey = lead.name.toLowerCase().trim();
        
        // Skip duplicates
        if (seenCompanies.has(companyKey)) {
            const existing = seenCompanies.get(companyKey);
            // Keep the one with higher score or more contact info
            if (lead.score > existing.score) {
                const index = consolidatedLeads.findIndex(c => c.name.toLowerCase().trim() === companyKey);
                if (index !== -1) {
                    consolidatedLeads[index] = mergeLeadData(lead, executivesByCompany);
                    seenCompanies.set(companyKey, lead);
                }
            }
            return;
        }
        
        const consolidated = mergeLeadData(lead, executivesByCompany);
        consolidatedLeads.push(consolidated);
        seenCompanies.set(companyKey, lead);
    });
    
    console.log(`✨ Consolidated to ${consolidatedLeads.length} unique companies`);
    console.log(`🗑️  Removed ${scoredData.scoredLeads.length - consolidatedLeads.length} duplicates\n`);
    
    // Classify by contact availability
    const segments = classifyByContact(consolidatedLeads);
    
    // Save consolidated results
    saveConsolidatedResults(consolidatedLeads, segments, allExecutives);
    
    // Print summary
    printConsolidation(consolidatedLeads, segments, allExecutives);
}

function findLatestFile(pattern) {
    const resultsDir = path.join(__dirname, '../../results');
    const files = fs.readdirSync(resultsDir)
        .filter(f => f.match(pattern.replace('*', '.*')))
        .map(f => ({
            name: f,
            path: path.join(resultsDir, f),
            time: fs.statSync(path.join(resultsDir, f)).mtime
        }))
        .sort((a, b) => b.time - a.time);
    
    if (files.length === 0) {
        throw new Error(`No files found matching pattern: ${pattern}`);
    }
    
    console.log(`   Found: ${files[0].name}`);
    return files[0].path;
}

function mergeLeadData(lead, executivesByCompany) {
    const executives = executivesByCompany[lead.name] || [];
    
    // Get best contact info (prioritize executive emails/phones)
    const bestEmail = lead.email || executives.find(e => isValidEmail(e.email))?.email || null;
    const bestPhone = lead.phone || executives.find(e => isValidPhone(e.phone))?.phone || null;
    
    // Count valid contacts
    const validExecEmails = executives.filter(e => isValidEmail(e.email)).length;
    const validExecPhones = executives.filter(e => isValidPhone(e.phone)).length;
    
    return {
        ...lead,
        email: bestEmail,
        phone: bestPhone,
        executives: executives,
        executiveCount: executives.length,
        validExecEmails: validExecEmails,
        validExecPhones: validExecPhones,
        totalValidEmails: (bestEmail ? 1 : 0) + validExecEmails,
        totalValidPhones: (bestPhone ? 1 : 0) + validExecPhones,
        hasExecutives: executives.length > 0,
        executiveNames: executives.map(e => e.name).join(' | '),
        executiveEmails: executives.map(e => e.email).filter(e => isValidEmail(e)).join(' | '),
        executivePhones: executives.map(e => e.phone).filter(e => isValidPhone(e)).join(' | '),
        executivePositions: executives.map(e => e.position).join(' | ')
    };
}

function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    email = email.trim().toLowerCase();
    
    const invalidPatterns = ['not available', 'n/a', 'none', 'null', 'undefined', 'contact via website', 'no email', ''];
    if (invalidPatterns.includes(email)) return false;
    if (email.length < 5) return false;
    
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    phone = phone.trim();
    
    const invalidPatterns = ['not available', 'n/a', 'none', 'null', 'undefined', 'contact via website', 'no phone', ''];
    const lowerPhone = phone.toLowerCase();
    if (invalidPatterns.includes(lowerPhone)) return false;
    
    const digitsOnly = phone.replace(/[\s\-\(\)\+]/g, '');
    if (digitsOnly.length < 7) return false;
    
    const digitCount = (phone.match(/\d/g) || []).length;
    return digitCount >= 7;
}

function classifyByContact(leads) {
    const segments = {
        premium: [],        // Email + Phone
        emailOnly: [],      // Email only
        phoneOnly: [],      // Phone only
        executiveOnly: [],  // Has executives but no company contact
        noContact: []       // No contact at all
    };
    
    leads.forEach(lead => {
        const hasCompanyEmail = isValidEmail(lead.email);
        const hasCompanyPhone = isValidPhone(lead.phone);
        const hasExecContact = lead.validExecEmails > 0 || lead.validExecPhones > 0;
        
        const hasAnyEmail = hasCompanyEmail || lead.validExecEmails > 0;
        const hasAnyPhone = hasCompanyPhone || lead.validExecPhones > 0;
        
        if (hasAnyEmail && hasAnyPhone) {
            segments.premium.push(lead);
        } else if (hasAnyEmail) {
            segments.emailOnly.push(lead);
        } else if (hasAnyPhone) {
            segments.phoneOnly.push(lead);
        } else if (hasExecContact || lead.executiveCount > 0) {
            segments.executiveOnly.push(lead);
        } else {
            segments.noContact.push(lead);
        }
    });
    
    // Sort each segment by score
    Object.keys(segments).forEach(key => {
        segments[key].sort((a, b) => b.score - a.score);
    });
    
    return segments;
}

function saveConsolidatedResults(leads, segments, allExecutives) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(__dirname, '../../results');
    
    // 1. Master Consolidated JSON
    const masterJson = {
        metadata: {
            generatedAt: new Date().toISOString(),
            totalCompanies: leads.length,
            totalExecutives: allExecutives.length,
            companiesWithExecutives: leads.filter(l => l.executiveCount > 0).length,
            segmentation: {
                premium: segments.premium.length,
                emailOnly: segments.emailOnly.length,
                phoneOnly: segments.phoneOnly.length,
                executiveOnly: segments.executiveOnly.length,
                noContact: segments.noContact.length
            },
            tierBreakdown: {
                'A+': leads.filter(l => l.tier === 'A+').length,
                'A': leads.filter(l => l.tier === 'A').length,
                'B': leads.filter(l => l.tier === 'B').length,
                'C': leads.filter(l => l.tier === 'C').length,
                'D': leads.filter(l => l.tier === 'D').length
            },
            totalPipelineValue: leads.reduce((sum, l) => sum + (l.dealSize || 0), 0),
            totalExpectedValue: leads.reduce((sum, l) => sum + (l.expectedValue || 0), 0)
        },
        companies: leads
    };
    
    const masterJsonPath = path.join(outputDir, `MASTER-CONSOLIDATED-DATABASE-${timestamp}.json`);
    fs.writeFileSync(masterJsonPath, JSON.stringify(masterJson, null, 2));
    
    // 2. Master CSV with all fields
    const masterCsvPath = path.join(outputDir, `MASTER-CONSOLIDATED-DATABASE-${timestamp}.csv`);
    const masterHeader = 'Segment,Priority,Tier,Score,Company Name,Website,Phone,Email,Rating,Reviews,Category,Executive Count,Executive Names,Executive Emails,Executive Phones,Executive Positions,Deal Size,Expected Value,Conversion Probability,Recommended Approach,Pain Points,Has Executives,Total Valid Emails,Total Valid Phones\n';
    
    const masterRows = [];
    
    const addSegmentRows = (segment, segmentName) => {
        segment.forEach(lead => {
            masterRows.push(formatMasterRow(lead, segmentName));
        });
    };
    
    addSegmentRows(segments.premium, 'Premium (Email + Phone)');
    addSegmentRows(segments.emailOnly, 'Email Only');
    addSegmentRows(segments.phoneOnly, 'Phone Only');
    addSegmentRows(segments.executiveOnly, 'Executive Contacts Only');
    addSegmentRows(segments.noContact, 'No Direct Contact');
    
    fs.writeFileSync(masterCsvPath, masterHeader + masterRows.join('\n'));
    
    // 3. Premium Leads Only (Top Priority)
    const premiumPath = path.join(outputDir, `PREMIUM-LEADS-READY-TO-CONTACT-${timestamp}.csv`);
    const premiumHeader = 'Priority,Tier,Score,Company Name,Best Email,Best Phone,Website,Rating,Executive Count,Executive Names,Executive Emails,Executive Phones,Deal Size,Expected Value,Recommended Approach\n';
    const premiumRows = segments.premium.map(lead => 
        `${lead.priority || 1},"${lead.tier}",${lead.score},"${lead.name}","${lead.email || ''}","${lead.phone || ''}","${lead.website || ''}",${lead.rating || 0},${lead.executiveCount},"${lead.executiveNames}","${lead.executiveEmails}","${lead.executivePhones}",${lead.dealSize || 0},${lead.expectedValue || 0},"${lead.recommendedApproach || ''}"`
    );
    fs.writeFileSync(premiumPath, premiumHeader + premiumRows.join('\n'));
    
    // 4. All Executives Flat List
    const execFlatPath = path.join(outputDir, `ALL-EXECUTIVES-CONTACT-LIST-${timestamp}.csv`);
    const execFlatHeader = 'Executive Name,Email,Phone,Position,LinkedIn,Company Name,Company Score,Company Tier,Company Website,Company Rating,Source,Confidence\n';
    const execFlatRows = [];
    
    leads.forEach(lead => {
        lead.executives.forEach(exec => {
            if (isValidEmail(exec.email) || isValidPhone(exec.phone)) {
                execFlatRows.push(
                    `"${exec.name}","${exec.email || ''}","${exec.phone || ''}","${exec.position}","${exec.linkedin || ''}","${lead.name}",${lead.score},"${lead.tier}","${lead.website || ''}",${lead.rating || 0},"${exec.source}","${exec.confidence}"`
                );
            }
        });
    });
    
    fs.writeFileSync(execFlatPath, execFlatHeader + execFlatRows.join('\n'));
    
    // 5. Hot Leads Summary (A+ and A tier)
    const hotLeadsPath = path.join(outputDir, `HOT-LEADS-IMMEDIATE-ACTION-${timestamp}.csv`);
    const hotLeads = leads.filter(l => l.tier === 'A+' || l.tier === 'A');
    const hotHeader = 'Priority,Tier,Score,Company Name,Best Contact Method,Email,Phone,Executive Count,Deal Size,Expected Value,Reason\n';
    const hotRows = hotLeads.map(lead => {
        const hasEmail = isValidEmail(lead.email) || lead.validExecEmails > 0;
        const hasPhone = isValidPhone(lead.phone) || lead.validExecPhones > 0;
        const contactMethod = hasEmail && hasPhone ? 'Multi-channel (Email + Phone)' : 
                             hasEmail ? 'Email Campaign' :
                             hasPhone ? 'Cold Call' : 'LinkedIn Research';
        const reason = lead.tier === 'A+' ? 'Highest conversion probability (80-100%)' : 'High priority (70-79% conversion)';
        
        return `${lead.priority || 1},"${lead.tier}",${lead.score},"${lead.name}","${contactMethod}","${lead.email || ''}","${lead.phone || ''}",${lead.executiveCount},${lead.dealSize || 0},${lead.expectedValue || 0},"${reason}"`;
    });
    fs.writeFileSync(hotLeadsPath, hotHeader + hotRows.join('\n'));
    
    // 6. Companies with Multiple Executives (High Value)
    const multiExecPath = path.join(outputDir, `COMPANIES-WITH-MULTIPLE-EXECUTIVES-${timestamp}.csv`);
    const multiExec = leads.filter(l => l.executiveCount >= 2).sort((a, b) => b.executiveCount - a.executiveCount);
    const multiExecHeader = 'Company Name,Executive Count,Score,Tier,Website,Rating,Executive Names,Executive Emails,Executive Phones,Deal Size\n';
    const multiExecRows = multiExec.map(lead =>
        `"${lead.name}",${lead.executiveCount},${lead.score},"${lead.tier}","${lead.website || ''}",${lead.rating || 0},"${lead.executiveNames}","${lead.executiveEmails}","${lead.executivePhones}",${lead.dealSize || 0}`
    );
    fs.writeFileSync(multiExecPath, multiExecHeader + multiExecRows.join('\n'));
    
    console.log('📁 Consolidated Files Created:\n');
    console.log(`   1. ${path.basename(masterJsonPath)}`);
    console.log(`      → Complete database (JSON format)\n`);
    
    console.log(`   2. ${path.basename(masterCsvPath)}`);
    console.log(`      → Complete database (CSV format) - ${leads.length} companies\n`);
    
    console.log(`   3. ${path.basename(premiumPath)}`);
    console.log(`      → Premium leads only - ${segments.premium.length} companies\n`);
    
    console.log(`   4. ${path.basename(execFlatPath)}`);
    console.log(`      → All executives flat list - ${execFlatRows.length} contacts\n`);
    
    console.log(`   5. ${path.basename(hotLeadsPath)}`);
    console.log(`      → Hot leads (A+/A tier) - ${hotLeads.length} companies\n`);
    
    console.log(`   6. ${path.basename(multiExecPath)}`);
    console.log(`      → Companies with 2+ executives - ${multiExec.length} companies\n`);
}

function formatMasterRow(lead, segment) {
    return `"${segment}",${lead.priority || 1},"${lead.tier}",${lead.score},"${lead.name}","${lead.website || ''}","${lead.phone || ''}","${lead.email || ''}",${lead.rating || 0},"${lead.reviews || ''}","${lead.category || ''}",${lead.executiveCount},"${lead.executiveNames}","${lead.executiveEmails}","${lead.executivePhones}","${lead.executivePositions}",${lead.dealSize || 0},${lead.expectedValue || 0},"${lead.conversionProbability || ''}","${lead.recommendedApproach || ''}","${lead.painPoints || ''}","${lead.hasExecutives ? 'Yes' : 'No'}",${lead.totalValidEmails},${lead.totalValidPhones}`;
}

function printConsolidation(leads, segments, allExecutives) {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         MASTER CONSOLIDATION COMPLETE                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('📊 Database Summary:\n');
    console.log(`   Total Unique Companies:        ${leads.length}`);
    console.log(`   Total Executives:              ${allExecutives.length}`);
    console.log(`   Companies with Executives:     ${leads.filter(l => l.executiveCount > 0).length}`);
    console.log(`   Companies with 2+ Executives:  ${leads.filter(l => l.executiveCount >= 2).length}\n`);
    
    console.log('🎯 Contact Availability:\n');
    console.log(`   🔥 Premium (Email + Phone):    ${segments.premium.length} companies`);
    console.log(`   📧 Email Only:                 ${segments.emailOnly.length} companies`);
    console.log(`   📞 Phone Only:                 ${segments.phoneOnly.length} companies`);
    console.log(`   👥 Executive Contacts Only:    ${segments.executiveOnly.length} companies`);
    console.log(`   🌐 No Direct Contact:          ${segments.noContact.length} companies\n`);
    
    const contactable = segments.premium.length + segments.emailOnly.length + segments.phoneOnly.length + segments.executiveOnly.length;
    console.log(`   Total Contactable:             ${contactable} (${((contactable / leads.length) * 100).toFixed(1)}%)\n`);
    
    console.log('⭐ Lead Quality Tiers:\n');
    const tierCounts = {
        'A+': leads.filter(l => l.tier === 'A+').length,
        'A': leads.filter(l => l.tier === 'A').length,
        'B': leads.filter(l => l.tier === 'B').length,
        'C': leads.filter(l => l.tier === 'C').length,
        'D': leads.filter(l => l.tier === 'D').length
    };
    
    console.log(`   A+ (Hot Leads):                ${tierCounts['A+']} companies`);
    console.log(`   A  (High Priority):            ${tierCounts['A']} companies`);
    console.log(`   B  (Medium Priority):          ${tierCounts['B']} companies`);
    console.log(`   C  (Low Priority):             ${tierCounts['C']} companies`);
    console.log(`   D  (Cold Leads):               ${tierCounts['D']} companies\n`);
    
    console.log('💰 Pipeline Value:\n');
    const totalPipeline = leads.reduce((sum, l) => sum + (l.dealSize || 0), 0);
    const totalExpected = leads.reduce((sum, l) => sum + (l.expectedValue || 0), 0);
    const premiumPipeline = segments.premium.reduce((sum, l) => sum + (l.dealSize || 0), 0);
    const premiumExpected = segments.premium.reduce((sum, l) => sum + (l.expectedValue || 0), 0);
    
    console.log(`   Total Pipeline Value:          $${totalPipeline.toLocaleString()}`);
    console.log(`   Total Expected Value:          $${totalExpected.toLocaleString()}`);
    console.log(`   Premium Leads Pipeline:        $${premiumPipeline.toLocaleString()}`);
    console.log(`   Premium Expected Value:        $${premiumExpected.toLocaleString()}\n`);
    
    console.log('🚀 Top 5 Premium Leads:\n');
    segments.premium.slice(0, 5).forEach((lead, i) => {
        const execInfo = lead.executiveCount > 0 ? ` (${lead.executiveCount} exec${lead.executiveCount > 1 ? 's' : ''})` : '';
        console.log(`   ${i + 1}. ${lead.name}${execInfo}`);
        console.log(`      Score: ${lead.score}% | Tier: ${lead.tier} | Deal: $${(lead.dealSize || 0).toLocaleString()}`);
        if (lead.email) console.log(`      📧 ${lead.email}`);
        if (lead.phone) console.log(`      📞 ${lead.phone}`);
        console.log('');
    });
    
    console.log('📈 Next Steps:\n');
    console.log(`   1. Start with ${segments.premium.length} Premium leads (multi-channel outreach)`);
    console.log(`   2. Email campaign for ${segments.emailOnly.length} Email-only leads`);
    console.log(`   3. Cold calling for ${segments.phoneOnly.length} Phone-only leads`);
    console.log(`   4. LinkedIn research for ${segments.executiveOnly.length + segments.noContact.length} remaining leads\n`);
    
    console.log('✅ All data consolidated and ready for CRM import!\n');
}

// Run if called directly
if (require.main === module) {
    try {
        consolidateResults();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

module.exports = consolidateResults;
