#!/usr/bin/env python3
# =================================================================
# 🔄 WEBHOOK MONITOR - Check when server comes back online
# =================================================================

import requests
import time
from datetime import datetime

def check_webhook_status(url):
    """Quick webhook status check"""
    try:
        response = requests.get(url, timeout=10, allow_redirects=False)
        return response.status_code, "OK"
    except requests.exceptions.TooManyRedirects:
        return None, "Too many redirects (server maintenance)"
    except requests.exceptions.ConnectionError:
        return None, "Connection refused (server down)"
    except requests.exceptions.Timeout:
        return None, "Timeout (server slow/overloaded)"
    except Exception as e:
        return None, f"Error: {str(e)}"

def monitor_webhook():
    """Monitor webhook status until it comes back online"""
    webhook_url = "http://scholarixglobal.com/web/hook/aa6e5d99-5030-4128-864f-9d9a35725c0f"
    
    print("🔄 WEBHOOK STATUS MONITOR")
    print("=" * 50)
    print(f"🌐 URL: {webhook_url}")
    print(f"⏰ Started: {datetime.now().strftime('%H:%M:%S')}")
    print("=" * 50)
    
    check_count = 0
    while True:
        check_count += 1
        status_code, message = check_webhook_status(webhook_url)
        
        timestamp = datetime.now().strftime('%H:%M:%S')
        
        if status_code:
            if status_code == 200:
                print(f"✅ {timestamp} - Status {status_code}: WEBHOOK ONLINE!")
                print("\n🎉 SERVER IS BACK ONLINE!")
                print("📋 You can now run: python webhook_diagnostics.py")
                break
            elif status_code == 500:
                print(f"⚠️ {timestamp} - Status {status_code}: Server online but webhook needs config")
                print("\n🔧 SERVER ONLINE - NEEDS ODOO CONFIGURATION")
                print("📋 Check the Target Record field in Odoo")
                break
            else:
                print(f"🔍 {timestamp} - Status {status_code}: Server responding")
        else:
            print(f"🔴 {timestamp} - Check {check_count}: {message}")
        
        if check_count >= 20:
            print(f"\n⏰ Stopped after {check_count} checks")
            print("💡 Server may be in extended maintenance")
            break
            
        time.sleep(15)  # Check every 15 seconds

if __name__ == "__main__":
    monitor_webhook()