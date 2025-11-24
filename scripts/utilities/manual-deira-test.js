// Manual Deira SME Test - Direct approach
const { chromium } = require('playwright');

async function testDeiraBusinesses() {
    console.log('🚀 Testing Direct Deira Business Search...\n');
    
    let browser;
    try {
        // Launch browser
        browser = await chromium.launch({ headless: false }); // visible for debugging
        const page = await browser.newPage();
        
        // Navigate to Google Maps
        console.log('📍 Opening Google Maps...');
        await page.goto('https://www.google.com/maps', { waitUntil: 'networkidle' });
        
        // Search for businesses in Deira
        const searchTerms = [
            'small businesses Deira Dubai',
            'trading companies Deira Dubai',
            'shops Deira Dubai'
        ];
        
        for (const searchTerm of searchTerms) {
            console.log(`\n🔍 Searching for: "${searchTerm}"`);
            
            // Find and click search box
            const searchBox = await page.locator('#searchboxinput');
            await searchBox.clear();
            await searchBox.fill(searchTerm);
            await searchBox.press('Enter');
            
            // Wait for results to load
            await page.waitForTimeout(5000);
            
            // Try to find business results
            const businessElements = await page.locator('[data-value="Directions"]').count();
            console.log(`   Found ${businessElements} potential businesses`);
            
            // Extract first few business names
            const businessNames = await page.locator('h1.DUwDvf.lfPIob').allTextContents();
            console.log('   Sample businesses found:');
            businessNames.slice(0, 5).forEach((name, index) => {
                console.log(`   ${index + 1}. ${name}`);
            });
            
            // Wait before next search
            await page.waitForTimeout(3000);
        }
        
        console.log('\n✅ Manual test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testDeiraBusinesses().catch(console.error);