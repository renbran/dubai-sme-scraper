#!/usr/bin/env python3
# =================================================================
# 🧪 WEBHOOK TEST SCRIPT - Test your Odoo CRM integration
# =================================================================

import requests
import json
from datetime import datetime

def test_webhook():
    """Test the Odoo webhook with sample lead data"""
    
    webhook_url = "http://scholarixglobal.com/web/hook/aa6e5d99-5030-4128-864f-9d9a35725c0f"
    
    # Sample test lead - QUALIFIED (has both phone AND email)
    test_lead = {
        "Name": "Arabian Business Solutions LLC",
        "Category": "Business Setup Services", 
        "Phone": "+971 4 123 4567",
        "Email": "info@arabianbusiness.ae",
        "Website": "https://arabianbusiness.ae",
        "Address": "Business Bay, Dubai, UAE",
        "Priority": "HIGH",
        "Quality Score": "9",
        "Data Source": "Webhook Test",
        "Search Term": "business setup companies Dubai",
        "Timestamp": datetime.now().strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
    }
    
    print("🧪 TESTING ODOO WEBHOOK INTEGRATION")
    print("=" * 50)
    print("📋 FILTERING LOGIC: Leads with EITHER phone OR email are pushed to CRM")
    print("📊 All leads are still saved to CSV regardless of completeness")
    print("=" * 50)
    print(f"📡 Webhook URL: {webhook_url}")
    print(f"📋 Test Lead: {test_lead['Name']}")
    print(f"📞 Phone: {test_lead['Phone']}")
    print(f"📧 Email: {test_lead['Email']}")
    print("✅ This lead QUALIFIES for CRM push (has phone AND email)")
    print()
    
    try:
        print("🚀 Sending test payload...")
        
        response = requests.post(
            webhook_url,
            json=test_lead,
            timeout=30,
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'Dubai-SME-Webhook-Test/1.0'
            }
        )
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📝 Response Body: {response.text}")
        
        if response.status_code == 200:
            print("\n✅ SUCCESS! Webhook test passed!")
            print("🎉 Check your Odoo CRM for the new lead:")
            print("   • Go to CRM → Leads/Opportunities") 
            print("   • Look for: 'Arabian Business Solutions LLC - Dubai SME Opportunity'")
            print("   • Should have tags: Dubai SME, Google Maps Lead, Business Setup Services")
            
        elif response.status_code == 500:
            print("\n❌ WEBHOOK ERROR (500)")
            print("🔧 Possible fixes:")
            print("   1. Check Target Record field: env['crm.lead'].create({})")
            print("   2. Verify code is pasted correctly")
            print("   3. Ensure CRM module is installed")
            print("   4. Check Odoo logs for detailed error")
            
        else:
            print(f"\n⚠️ UNEXPECTED RESPONSE ({response.status_code})")
            print("🔍 Check webhook configuration in Odoo")
            
    except requests.exceptions.Timeout:
        print("\n⏰ TIMEOUT ERROR")
        print("🔧 Webhook took too long to respond")
        
    except requests.exceptions.ConnectionError:
        print("\n🌐 CONNECTION ERROR") 
        print("🔧 Could not connect to webhook URL")
        
    except Exception as e:
        print(f"\n💥 UNEXPECTED ERROR: {e}")
        
    print("\n" + "=" * 50)

if __name__ == "__main__":
    test_webhook()