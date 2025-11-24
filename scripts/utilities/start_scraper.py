#!/usr/bin/env python3
"""
Quick launcher for Google Maps scraper with Odoo webhook
"""
import subprocess
import sys
import os

def main():
    print("\n" + "🚀 " + "="*58)
    print("   GOOGLE MAPS LEAD SCRAPER - ODOO WEBHOOK")
    print("🎯 " + "="*58)
    print(f"   Target: scholarixglobal.com")
    print(f"   Webhook: /web/hook/1342d838-a97c-466c-99f1-8ae3222f38ce")
    print(f"   Duration: 1 Hour")
    print(f"   Focus: HIGH-POTENTIAL Companies (ERP/AI Ready)")
    print("📧 " + "="*58)
    print("   NEW: Email extraction enabled!")
    print("="*62 + "\n")
    
    try:
        # Test webhook first
        print("🔍 Testing webhook connection...")
        result = subprocess.run([sys.executable, "test_webhook.py"], 
                              capture_output=True, text=True, cwd=os.path.dirname(__file__))
        
        if "SUCCESS" in result.stdout:
            print("✅ Webhook test passed! Starting scraper...\n")
            
            # Run the scraper
            subprocess.run([sys.executable, "google_maps_scraper.py"], cwd=os.path.dirname(__file__))
            
        else:
            print("❌ Webhook test failed!")
            print("Please check your Odoo webhook URL and server status.")
            print("\nDetails:")
            print(result.stdout)
            if result.stderr:
                print("Errors:")
                print(result.stderr)
    
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure all required files are present and Python dependencies are installed.")
    
    input("\n🏁 Press Enter to exit...")

if __name__ == "__main__":
    main()