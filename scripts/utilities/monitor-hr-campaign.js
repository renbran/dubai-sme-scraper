/**
 * HR Outsourcing Campaign Monitor
 * Quick script to check campaign progress
 */

const fs = require('fs');
const path = require('path');

function monitorCampaign() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 HR OUTSOURCING CAMPAIGN - PROGRESS MONITOR');
    console.log('='.repeat(70) + '\n');
    
    const resultsDir = path.join(__dirname, '../../results');
    
    if (!fs.existsSync(resultsDir)) {
        console.log('❌ Results directory not found yet. Campaign may still be starting...\n');
        return;
    }
    
    // Find latest campaign files
    const files = fs.readdirSync(resultsDir)
        .filter(f => f.startsWith('hr-outsourcing'))
        .sort()
        .reverse();
    
    if (files.length === 0) {
        console.log('⏳ No results yet. Campaign is still in progress...\n');
        console.log('💡 Tip: Results appear after the first search completes\n');
        return;
    }
    
    console.log(`📁 Found ${files.length} campaign file(s):\n`);
    
    files.forEach(file => {
        const filePath = path.join(resultsDir, file);
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        const modified = stats.mtime.toLocaleString();
        
        console.log(`   📄 ${file}`);
        console.log(`      Size: ${sizeMB} MB | Modified: ${modified}`);
        
        // Try to read summary
        if (file.includes('qualified') && !file.includes('URGENT') && !file.includes('HIGH')) {
            try {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                console.log(`      ✓ Qualified Leads: ${data.leads ? data.leads.length : 0}`);
                
                if (data.stats) {
                    console.log(`      📊 Total Businesses: ${data.stats.totalBusinesses}`);
                    console.log(`      🔍 Searches: ${data.stats.totalSearches}`);
                    console.log(`      🔴 URGENT: ${data.stats.urgentPriority}`);
                    console.log(`      🟠 HIGH: ${data.stats.highPriority}`);
                    console.log(`      🟡 MEDIUM: ${data.stats.mediumPriority}`);
                }
            } catch (err) {
                console.log(`      ⚠️  Could not read file details`);
            }
        }
        console.log('');
    });
    
    console.log('='.repeat(70));
    console.log('💡 Run this script again to see updated progress');
    console.log('💡 Campaign continues running in background terminal');
    console.log('='.repeat(70) + '\n');
}

// Run monitor
monitorCampaign();

module.exports = { monitorCampaign };
