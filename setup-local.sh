#!/bin/bash

echo "🚀 Testing Dubai SME Scraper Self-Hosting Setup"
echo "============================================="

# Check Node.js
echo "📦 Checking Node.js..."
node --version || { echo "❌ Node.js not found. Please install Node.js 20+"; exit 1; }

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install chromium

# Test browser installation
echo "🔍 Testing browser installation..."
node -e "
const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    console.log('✅ Browser test successful');
    await browser.close();
  } catch (error) {
    console.log('❌ Browser test failed:', error.message);
  }
})();
"

echo ""
echo "🎉 Setup complete! You can now run:"
echo "   node local-run.js"
echo ""
echo "📊 Or use Docker:"
echo "   docker build -f Dockerfile.ubuntu -t dubai-scraper ."
echo "   docker run -v \$(pwd)/results:/app/results dubai-scraper"