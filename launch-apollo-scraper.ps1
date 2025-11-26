# Apollo Executive Scraper Launcher
# Quick launcher for finding C-level executives using Apollo.io

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Apollo Executive Scraper" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Apollo API key is set
if (-not $env:APOLLO_API_KEY) {
    Write-Host "ERROR: APOLLO_API_KEY not set!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please set your Apollo API key:" -ForegroundColor Yellow
    Write-Host "  `$env:APOLLO_API_KEY='your_key_here'" -ForegroundColor White
    Write-Host ""
    Write-Host "Get your API key from: https://app.apollo.io/#/settings/integrations/api" -ForegroundColor Cyan
    Write-Host ""
    pause
    exit 1
}

Write-Host "Apollo API Key: " -NoNewline -ForegroundColor Green
Write-Host "***${env:APOLLO_API_KEY.Substring($env:APOLLO_API_KEY.Length - 4)}" -ForegroundColor Yellow
Write-Host ""

# Menu
Write-Host "Select an option:" -ForegroundColor Yellow
Write-Host "  1. Quick Test (5-10 executives)" -ForegroundColor White
Write-Host "  2. Combined Campaign (Google Maps + Apollo)" -ForegroundColor White
Write-Host "  3. Custom Search" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Running quick test..." -ForegroundColor Green
        node scripts/tests/apollo-executive-test.js
    }
    "2" {
        Write-Host ""
        Write-Host "Running combined campaign..." -ForegroundColor Green
        Write-Host "This will scrape Google Maps + enrich with Apollo executives" -ForegroundColor Cyan
        Write-Host ""
        node scripts/campaigns/apollo-combined-campaign.js
    }
    "3" {
        Write-Host ""
        Write-Host "Custom search options:" -ForegroundColor Cyan
        
        $companyName = Read-Host "Company name (press Enter to skip)"
        $location = Read-Host "Location (default: Dubai)"
        
        if ([string]::IsNullOrWhiteSpace($location)) {
            $location = "Dubai"
        }
        
        Write-Host ""
        Write-Host "Searching for executives at '$companyName' in $location..." -ForegroundColor Green
        
        # Create temporary script
        $tempScript = @"
const ApolloScraper = require('./src/data-sources/apollo-scraper');

(async () => {
    const scraper = new ApolloScraper({
        apiKey: process.env.APOLLO_API_KEY
    });
    
    await scraper.initialize();
    
    const result = await scraper.searchPeople({
        companyName: '$companyName',
        location: ['$location', 'United Arab Emirates'],
        seniorityLevels: ['founder', 'c_suite', 'vp', 'director'],
        perPage: 10
    });
    
    console.log('\n=== Results ===');
    console.log('Found ' + result.contacts.length + ' executives:\n');
    
    result.contacts.forEach((contact, i) => {
        console.log((i + 1) + '. ' + contact.fullName + ' - ' + contact.title);
        console.log('   Company: ' + contact.companyName);
        console.log('   Email: ' + (contact.email || 'N/A'));
        console.log('   Phone: ' + (contact.phone || 'N/A'));
        console.log('   LinkedIn: ' + (contact.linkedinUrl || 'N/A'));
        console.log('');
    });
    
    await scraper.close();
})();
"@
        
        $tempFile = "temp-apollo-search.js"
        $tempScript | Out-File -FilePath $tempFile -Encoding UTF8
        
        node $tempFile
        
        Remove-Item $tempFile
    }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Check results/ directory for output files" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
pause
