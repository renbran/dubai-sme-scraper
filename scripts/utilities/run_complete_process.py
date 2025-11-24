#!/usr/bin/env python3
"""
Enhanced complete run script - orchestrates the entire lead management process
"""
import sys
import os
import json
import logging
from datetime import datetime

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    """Main orchestrator function"""
    
    print("\n" + "="*80)
    print("🚀 COMPLETE LEAD MANAGEMENT PROCESS - ODOO 17 INTEGRATION")
    print("="*80)
    print("Target: scholarixglobal.com")
    print("Database: scholarixv17")  
    print("Process: Old Leads Import → Webhook Test → New Scraping → CRM Push")
    print("Duration: ~1.5 hours total")
    print("\n🎯 TARGET: HIGH-POTENTIAL Companies needing:")
    print("   • ERP Implementation (Odoo, SAP)")
    print("   • Business Automation & Workflows") 
    print("   • AI Integration & Analytics")
    print("   • Digital Transformation")
    print("="*80 + "\n")
    
    # Step 1: Test webhook connection
    logger.info("STEP 1: Testing webhook connection...")
    
    try:
        import requests
        
        # Load webhook URL from config
        with open('d:/apify/apify_actor/crm_config.json', 'r') as f:
            config = json.load(f)
        webhook_url = config['credentials']['webhook_url']
        
        logger.info("🔗 Testing webhook connection...")
        
        # Test with a sample lead
        test_lead = {
            'Name': 'Test Connection - Dubai SME Scraper',
            'Category': 'System Test',
            'Phone': 'Test Connection',
            'Email': 'test@example.com',
            'Website': 'https://test.com',
            'Address': 'Test Address, Dubai',
            'Priority': 'LOW',
            'Quality Score': '1',
            'Data Source': 'Connection Test',
            'Search Term': 'webhook test',
            'Timestamp': datetime.now().strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
        }
        
        response = requests.post(
            webhook_url,
            headers={'Content-Type': 'application/json'},
            json=test_lead,
            timeout=15
        )
        
        if response.status_code in [200, 201, 202]:
            logger.info("✅ Webhook connection successful!")
            webhook_test_success = True
        else:
            logger.error(f"❌ Webhook test failed: HTTP {response.status_code}")
            webhook_test_success = False
            
    except Exception as e:
        logger.error(f"❌ Webhook connection test failed: {e}")
        webhook_test_success = False
    
    if not webhook_test_success:
        print("❌ Webhook test failed. Please check your connection and try again.")
        return False
    
    # Step 2: Import old leads
    logger.info("STEP 2: Importing old leads...")
    
    try:
        from import_old_leads import main as import_main
        old_leads_success = import_main()
        if old_leads_success:
            logger.info("✅ Old leads imported successfully")
        else:
            logger.warning("⚠️ Old leads import had issues, but continuing...")
    except Exception as e:
        logger.error(f"❌ Old leads import failed: {e}")
        old_leads_success = False
    
    # Step 3: Start new scraping session
    logger.info("STEP 3: Starting new 1-hour scraping session...")
    
    try:
        from google_maps_scraper import GoogleMapsLeadScraper
        
        # HIGH-POTENTIAL search queries for ERP, Automation & AI implementation
        search_queries = [
            # Manufacturing & Trading (High ERP potential)
            "manufacturing companies Dubai",
            "trading companies Dubai",
            "import export companies Dubai",
            "wholesale distributors Dubai",
            "logistics companies Dubai",
            "warehousing services Dubai",
            "supply chain companies Dubai",
            
            # Retail & E-commerce (Automation & ERP potential)
            "retail companies Dubai",
            "ecommerce businesses Dubai",
            "online stores Dubai",
            "distribution companies Dubai",
            "retail chains Dubai",
            
            # Construction & Real Estate (Project Management & ERP)
            "construction companies Dubai",
            "real estate developers Dubai",
            "property management Dubai",
            "facilities management Dubai",
            "contracting companies Dubai",
            
            # Healthcare (Digital transformation potential)
            "private hospitals Dubai",
            "medical centers Dubai",
            "dental clinics Dubai",
            "healthcare providers Dubai",
            "polyclinics Dubai",
            
            # Hospitality & Tourism (Operations automation)
            "hotels Dubai",
            "restaurants Dubai",
            "catering services Dubai",
            "travel agencies Dubai",
            "tourism companies Dubai",
            "event management Dubai",
            
            # Professional Services (Growing SMEs)
            "law firms Dubai",
            "consulting firms Dubai",
            "marketing agencies Dubai",
            "recruitment agencies Dubai",
            "training centers Dubai",
            "business services Dubai",
            
            # Technology & Innovation (Early adopters)
            "software companies Dubai",
            "IT companies Dubai",
            "digital agencies Dubai",
            "tech startups Dubai",
            "app developers Dubai",
            
            # Financial Services (Compliance & automation needs)
            "accounting firms Dubai",
            "auditing firms Dubai",
            "business consultants Dubai",
            "financial advisors Dubai",
            "CFO services Dubai",
            
            # Education (Digital transformation)
            "training institutes Dubai",
            "educational centers Dubai",
            "coaching centers Dubai",
            "language schools Dubai",
            
            # Automotive & Technical (Service management)
            "car dealerships Dubai",
            "auto service centers Dubai",
            "technical services Dubai",
            "maintenance companies Dubai"
        ]
        
        # Initialize and run scraper for 1 hour
        scraper = GoogleMapsLeadScraper(search_queries, duration_minutes=60)
        scraper.run()
        
        scraping_success = True
        
    except Exception as e:
        logger.error(f"❌ Scraping session failed: {e}")
        scraping_success = False
    
    # Final summary
    print("\n" + "="*80)
    print("📊 FINAL PROCESS SUMMARY")
    print("="*80)
    print(f"✅ Webhook Connection: {'SUCCESS' if webhook_test_success else 'FAILED'}")
    print(f"📤 Old Leads Import: {'SUCCESS' if old_leads_success else 'FAILED/PARTIAL'}")
    print(f"🚀 New Scraping Session: {'SUCCESS' if scraping_success else 'FAILED'}")
    print("="*80)
    
    if scraping_success:
        print("\n🎉 COMPLETE SUCCESS!")
        print("💡 Check your Odoo CRM to see all leads:")
        print("   • Historical leads marked as '[Historical]'")
        print("   • New leads with current timestamp")
        print("   • All leads include extracted emails where available")
        print("   • Leads are categorized by industry and priority")
    else:
        print("\n⚠️ Process completed with some issues.")
        print("💡 Check the logs above for details.")
    
    print(f"\n🏁 Process completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    return scraping_success

if __name__ == "__main__":
    try:
        success = main()
        input("\nPress Enter to exit...")
    except KeyboardInterrupt:
        print("\n\n⚠️ Process interrupted by user")
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        print("\n❌ Process failed due to unexpected error. Check logs above.")
        input("\nPress Enter to exit...")