#!/usr/bin/env python3
"""
Test script to verify Odoo webhook connection
"""
import json
import sys
import os
from datetime import datetime

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from webhook_crm_connector import get_webhook_connector

def test_webhook_connection():
    """Test the Odoo webhook connection with a sample lead"""
    
    print("\n" + "="*60)
    print("🧪 TESTING ODOO WEBHOOK CONNECTION")
    print("="*60)
    
    # Load config
    with open('crm_config.json', 'r') as f:
        config = json.load(f)
    
    webhook_url = config['credentials']['webhook_url']
    print(f"Webhook URL: {webhook_url}")
    
    # Initialize connector
    connector = get_webhook_connector(
        webhook_url=webhook_url,
        auth_header=config['credentials'].get('auth_header')
    )
    
    # Sample test lead
    test_lead = {
        'Name': 'Test Company Ltd',
        'Category': 'Business Consultancy',
        'Phone': '+971501234567',
        'Email': 'test@testcompany.ae',
        'Website': 'https://testcompany.ae',
        'Address': 'Dubai Internet City, Dubai, UAE',
        'Priority': 'HIGH',
        'Quality Score': 8,
        'Data Source': 'Webhook Test',
        'Search Term': 'test webhook connection',
        'Timestamp': datetime.now().strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
    }
    
    print("\n📤 Sending test lead...")
    print(f"Company: {test_lead['Name']}")
    print(f"Email: {test_lead['Email']}")
    print(f"Phone: {test_lead['Phone']}")
    
    # Test single lead push
    success = connector.push_lead(test_lead)
    
    if success:
        print("\n✅ SUCCESS! Webhook connection working properly.")
        print("✅ Test lead sent to Odoo CRM successfully.")
        print("\n💡 Check your Odoo CRM for the test lead:")
        print(f"   - Company Name: {test_lead['Name']}")
        print(f"   - Source: Webhook Test")
    else:
        print("\n❌ FAILED! Webhook connection not working.")
        print("❌ Check webhook URL and Odoo server status.")
    
    print("\n" + "="*60)
    return success

if __name__ == "__main__":
    test_webhook_connection()
    input("\nPress Enter to exit...")