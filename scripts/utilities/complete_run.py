#!/usr/bin/env python3
"""
Complete lead management process:
1. Import old leads from last 2 CSV files
2. Test webhook connection
3. Start new 1-hour scraping session
4. Push new leads to Odoo CRM in real-time
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

def test_webhook_connection():
    """Test webhook connection before starting"""
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
            return True
        else:
            logger.error(f"❌ Webhook test failed: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Webhook connection test failed: {e}")
        return False

def run_old_leads_import():
    """Import old leads from previous CSV files"""
    try:
        logger.info("📤 Starting old leads import...")
        
        from import_old_leads import main as import_main
        return import_main()
        
    except Exception as e:
        logger.error(f"❌ Old leads import failed: {e}")
        return False

def main():
    print("   Focus: HIGH-POTENTIAL Companies (ERP/AI Ready)")
    print("="*72 + "\n")
    
    try:
        # Step 1: Send old leads from previous runs
        print("📤 STEP 1: Sending old leads to Odoo CRM...")
        print("-" * 50)
        
        result = subprocess.run([sys.executable, "send_old_leads.py"], 
                              cwd=os.path.dirname(__file__), check=False)
        
        if result.returncode == 0:
            print("✅ Old leads sent successfully!")
        else:
            print("⚠️  Some issues with old leads import (check output above)")
        
        print("\n" + "="*50)
        input("📋 Press Enter to continue to webhook test...")
        
        # Step 2: Test webhook connection
        print("\n🔍 STEP 2: Testing webhook connection...")
        print("-" * 50)
        
        result = subprocess.run([sys.executable, "test_webhook.py"], 
                              capture_output=True, text=True, 
                              cwd=os.path.dirname(__file__), check=False)
        
        if "SUCCESS" in result.stdout:
            print("✅ Webhook test passed!")
            print("\n" + "="*50)
            input("🚀 Press Enter to start new scraping session...")
            
            # Step 3: Start new scraping session
            print("\n🎯 STEP 3: Starting new scraping session...")
            print("-" * 50)
            print("Duration: 1 hour")
            print("Target: High-potential companies")
            print("Output: Real-time to Odoo + CSV backup")
            print("-" * 50 + "\n")
            
            subprocess.run([sys.executable, "google_maps_scraper.py"], 
                         cwd=os.path.dirname(__file__), check=False)
            
        else:
            print("❌ Webhook test failed!")
            print("Details:", result.stdout)
            if result.stderr:
                print("Errors:", result.stderr)
            print("\n💡 Please check your webhook URL and Odoo server status.")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure all required files are present and dependencies are installed.")
    
    print("\n" + "🏁 " + "="*68)
    print("   ALL TASKS COMPLETED!")
    print("="*72)
    input("Press Enter to exit...")

if __name__ == "__main__":
    main()