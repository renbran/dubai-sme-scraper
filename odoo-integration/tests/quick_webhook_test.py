#!/usr/bin/env python3
"""
Quick webhook test to verify connection
"""
import requests
import json
from datetime import datetime

def test_webhook():
    webhook_url = "https://scholarixglobal.com/web/hook/1342d838-a97c-466c-99f1-8ae3222f38ce"
    
    print("🔗 Testing webhook connection...")
    print(f"URL: {webhook_url}")
    
    test_lead = {
        'Name': 'Test Lead - Dubai SME Scraper',
        'Category': 'Business Services',
        'Phone': '+971501234567',
        'Email': 'test@example.com',
        'Website': 'https://test.com',
        'Address': 'Test Address, Dubai, UAE',
        'Priority': 'MEDIUM',
        'Quality Score': '8',
        'Data Source': 'Webhook Test',
        'Search Term': 'test connection',
        'Timestamp': datetime.now().strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
    }
    
    try:
        response = requests.post(
            webhook_url,
            headers={'Content-Type': 'application/json'},
            json=test_lead,
            timeout=30
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Text: {response.text[:200]}...")
        
        if response.status_code in [200, 201, 202]:
            print("✅ SUCCESS: Webhook is working!")
            return True
        else:
            print(f"❌ FAILED: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    test_webhook()