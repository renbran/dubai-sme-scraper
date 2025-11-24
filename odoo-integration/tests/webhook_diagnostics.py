#!/usr/bin/env python3
# =================================================================
# 🔧 WEBHOOK DIAGNOSTIC TOOL - Complete Validation
# =================================================================

import requests
import json
from datetime import datetime
import sys

def test_webhook_connectivity(url):
    """Test basic webhook connectivity"""
    print("🌐 TESTING WEBHOOK CONNECTIVITY")
    print("=" * 50)
    
    try:
        # Test simple GET request first
        response = requests.get(url, timeout=10, allow_redirects=True)
        print(f"✅ Webhook URL reachable: {response.status_code}")
        return True
    except requests.exceptions.TooManyRedirects:
        print("⚠️ Too Many Redirects: Server configuration issue")
        return True  # Server is up, just misconfigured
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Cannot reach webhook URL")
        return False
    except requests.exceptions.Timeout:
        print("❌ Timeout Error: Webhook not responding")
        return False
    except Exception as e:
        print(f"❌ Unknown Error: {e}")
        return False

def validate_payload_format():
    """Show the exact payload format we're sending"""
    print("\n📋 CURRENT PAYLOAD FORMAT")
    print("=" * 50)
    
    sample_payload = {
        "Name": "Test Company LLC",
        "Category": "Business Setup Services", 
        "Phone": "+971 4 123 4567",
        "Email": "info@testcompany.ae",
        "Website": "https://testcompany.ae",
        "Address": "Business Bay, Dubai, UAE",
        "Priority": "HIGH",
        "Quality Score": "9",
        "Data Source": "Google Maps Scraper",
        "Search Term": "business setup companies Dubai",
        "Timestamp": datetime.now().strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
    }
    
    print("📤 Payload being sent:")
    print(json.dumps(sample_payload, indent=2))
    return sample_payload

def test_webhook_response(url, payload):
    """Test webhook with detailed error analysis"""
    print("\n🧪 TESTING WEBHOOK RESPONSE")
    print("=" * 50)
    
    try:
        response = requests.post(
            url,
            json=payload,
            timeout=30,
            allow_redirects=True,
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'Dubai-SME-Scraper/1.0'
            }
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📝 Response Headers: {dict(response.headers)}")
        print(f"📄 Response Body: {response.text}")
        
        # Analyze response
        if response.status_code == 200:
            print("✅ SUCCESS: Webhook processed successfully!")
            return True
        elif response.status_code == 500:
            print("❌ SERVER ERROR (500): Internal error in Odoo webhook")
            print("\n🔧 LIKELY CAUSES:")
            print("   1. Target Record field incorrect")
            print("   2. Webhook code has syntax errors") 
            print("   3. CRM module not installed")
            print("   4. Missing required fields in payload")
            return False
        elif response.status_code == 404:
            print("❌ NOT FOUND (404): Webhook URL not configured")
            return False
        elif response.status_code == 401:
            print("❌ UNAUTHORIZED (401): Authentication issue")
            return False
        else:
            print(f"⚠️ UNEXPECTED STATUS: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"💥 REQUEST FAILED: {e}")
        return False

def check_required_fields(payload):
    """Verify all required fields are present"""
    print("\n📋 PAYLOAD FIELD VALIDATION")
    print("=" * 50)
    
    required_fields = ["Name", "Phone", "Email", "Category"]
    optional_fields = ["Website", "Address", "Priority", "Quality Score", "Data Source", "Search Term", "Timestamp"]
    
    print("✅ REQUIRED FIELDS:")
    for field in required_fields:
        if field in payload:
            print(f"   ✓ {field}: {payload[field]}")
        else:
            print(f"   ❌ {field}: MISSING")
    
    print("\n📋 OPTIONAL FIELDS:")
    for field in optional_fields:
        if field in payload:
            print(f"   ✓ {field}: {payload[field]}")
        else:
            print(f"   - {field}: Not provided")

def test_odoo_target_record():
    """Show the correct Target Record configuration"""
    print("\n🎯 ODOO TARGET RECORD VALIDATION")
    print("=" * 50)
    print("📌 The Target Record field in Odoo MUST contain EXACTLY:")
    print("   env['crm.lead'].create({})")
    print()
    print("❌ COMMON MISTAKES:")
    print("   • env['crm.lead']")
    print("   • model.browse()")
    print("   • False")
    print("   • Empty field")
    print()
    print("✅ CORRECT CONFIGURATION:")
    print("   Target Record: env['crm.lead'].create({})")

def main():
    webhook_url = "http://scholarixglobal.com/web/hook/aa6e5d99-5030-4128-864f-9d9a35725c0f"
    
    print("🔧 COMPREHENSIVE WEBHOOK DIAGNOSTIC")
    print("🌐 URL:", webhook_url)
    print("=" * 70)
    
    # Step 1: Test connectivity
    if not test_webhook_connectivity(webhook_url):
        print("\n❌ CONNECTIVITY FAILED - Cannot proceed with further tests")
        return
    
    # Step 2: Show payload format
    payload = validate_payload_format()
    
    # Step 3: Validate fields
    check_required_fields(payload)
    
    # Step 4: Test webhook response
    success = test_webhook_response(webhook_url, payload)
    
    # Step 5: Show Odoo configuration
    test_odoo_target_record()
    
    # Final summary
    print("\n" + "=" * 70)
    print("📊 DIAGNOSTIC SUMMARY")
    print("=" * 70)
    
    if success:
        print("🎉 WEBHOOK IS WORKING CORRECTLY!")
        print("✅ Ready for live scraping session")
    else:
        print("⚠️ WEBHOOK NEEDS CONFIGURATION")
        print("📋 Next Steps:")
        print("   1. Check Odoo Target Record field")
        print("   2. Verify webhook code is pasted correctly")
        print("   3. Ensure CRM module is installed")
        print("   4. Check Odoo error logs")

if __name__ == "__main__":
    main()