// Debug test script to see what's happening
const { chromium } = require('playwright');

async function simpleDebugTest() {
    console.log('🔍 Simple Debug Test - Testing Google Maps search directly...\n');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    const page = await context.newPage();
    
    try {
        console.log('🌐 Navigating to Google Maps...');
        await page.goto('https://www.google.com/maps?hl=en&gl=ae');
        await page.waitForTimeout(3000);
        
        console.log('� Searching for coffee shops...');
        await page.fill('input[id="searchboxinput"]', 'coffee shops dubai marina');
        await page.keyboard.press('Enter');
        
        console.log('⏳ Waiting for results...');
        await page.waitForTimeout(5000);
        
        // Check various selectors
        const selectors = [
            'div[role="article"]',
            '.hfpxzc',
            '[data-result-index]',
            '.Nv2PK',
            '.THOPZb',
            '.lI9IFe'
        ];
        
        for (const selector of selectors) {
            const elements = await page.$$(selector);
            console.log(`📊 Found ${elements.length} elements with selector: ${selector}`);
        }
        
        // Check page content
        const title = await page.title();
        console.log(`📄 Page title: ${title}`);
        
        const url = page.url();
        console.log(`🔗 Current URL: ${url}`);
        
        // Check if we can find any business-like content
        const businessTexts = await page.$$eval('h1, h2, h3, .fontHeadlineSmall', 
            elements => elements.map(el => el.textContent?.trim()).filter(text => text && text.length > 0)
        );
        
        console.log('\n📝 Found potential business names:');
        businessTexts.slice(0, 10).forEach((text, i) => {
            console.log(`${i + 1}. ${text}`);
        });
        
    } catch (error) {
        console.error('❌ Debug test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the debug test
simpleDebugTest().catch(console.error);