#!/usr/bin/env python3
"""
Script to send old leads from CSV files to Odoo CRM via webhook
Enhanced version with better error handling and progress tracking
"""
import csv
import json
import os
import sys
import glob
import requests
import logging
from datetime import datetime
from typing import List, Dict

class OldLeadsImporter:
    def __init__(self, webhook_url: str, results_dir: str = "d:/apify/apify_actor/results"):
        self.webhook_url = webhook_url
        self.results_dir = results_dir
        self.imported_count = 0
        self.failed_count = 0
        
    def get_latest_csv_files(self, count: int = 2) -> List[str]:
    """Find all CSV files in the results directory"""
    results_dir = "d:/apify/apify_actor/results"
    csv_files = []
    
    if os.path.exists(results_dir):
        csv_files = glob.glob(os.path.join(results_dir, "*.csv"))
        csv_files.sort(key=os.path.getmtime, reverse=True)  # Sort by modification time, newest first
    
    return csv_files

def load_leads_from_csv(csv_file):
    """Load leads from a CSV file"""
    leads = []
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Convert to expected format
                lead = {
                    'Name': row.get('Name', '').strip('"'),
                    'Category': row.get('Category', '').strip('"'),
                    'Phone': row.get('Phone', '').strip('"'),
                    'Email': row.get('Email', 'Not available').strip('"'),
                    'Website': row.get('Website', '').strip('"'),
                    'Address': row.get('Address', '').strip('"'),
                    'Priority': row.get('Priority', 'MEDIUM').strip('"'),
                    'Quality Score': int(row.get('Quality Score', 5)) if row.get('Quality Score', '').strip('"').isdigit() else 5,
                    'Data Source': row.get('Data Source', '').strip('"'),
                    'Search Term': row.get('Search Term', '').strip('"'),
                    'Timestamp': row.get('Timestamp', datetime.now().isoformat()).strip('"')
                }
                
                # Only add valid leads (must have name)
                if lead['Name'] and lead['Name'] != 'Name':
                    leads.append(lead)
    
    except Exception as e:
        print(f"❌ Error reading CSV file {csv_file}: {e}")
    
    return leads

def push_old_leads_to_crm():
    """Main function to push old leads to CRM"""
    
    print("\n" + "="*70)
    print("📤 SENDING OLD LEADS TO ODOO CRM")
    print("="*70)
    
    # Load webhook config
    try:
        with open('crm_config.json', 'r') as f:
            config = json.load(f)
        
        webhook_url = config['credentials']['webhook_url']
        print(f"🎯 Target: {webhook_url}")
    
    except Exception as e:
        print(f"❌ Error loading CRM config: {e}")
        return
    
    # Initialize webhook connector
    try:
        connector = get_webhook_connector(
            webhook_url=webhook_url,
            auth_header=config['credentials'].get('auth_header')
        )
        print("✅ Webhook connector initialized")
    
    except Exception as e:
        print(f"❌ Error initializing webhook connector: {e}")
        return
    
    # Find CSV files
    csv_files = find_csv_files()
    
    if not csv_files:
        print("❌ No CSV files found in results directory")
        return
    
    print(f"\n📁 Found {len(csv_files)} CSV files:")
    for i, csv_file in enumerate(csv_files[:5], 1):  # Show last 5 files
        file_name = os.path.basename(csv_file)
        file_time = datetime.fromtimestamp(os.path.getmtime(csv_file))
        print(f"   {i}. {file_name} ({file_time.strftime('%Y-%m-%d %H:%M')})")
    
    # Ask user which files to process
    print(f"\n🔄 Processing last 2 CSV files...")
    
    total_leads_sent = 0
    total_leads_failed = 0
    
    # Process last 2 files
    for csv_file in csv_files[:2]:
        file_name = os.path.basename(csv_file)
        print(f"\n📂 Processing: {file_name}")
        
        # Load leads from CSV
        leads = load_leads_from_csv(csv_file)
        
        if not leads:
            print(f"   ⚠️  No valid leads found in {file_name}")
            continue
        
        print(f"   📊 Found {len(leads)} leads")
        
        # Send leads to CRM
        print(f"   📤 Sending to Odoo CRM...")
        
        success_count = 0
        failed_count = 0
        
        for i, lead in enumerate(leads, 1):
            try:
                # Add source information to distinguish old leads
                lead['Data Source'] = f"{lead.get('Data Source', 'Historical Data')} (Re-imported)"
                lead['Search Term'] = f"{lead.get('Search Term', '')} [Historical]"
                
                success = connector.push_lead(lead)
                
                if success:
                    success_count += 1
                    print(f"   ✅ ({i}/{len(leads)}) {lead['Name']}")
                else:
                    failed_count += 1
                    print(f"   ❌ ({i}/{len(leads)}) {lead['Name']} - FAILED")
                
                # Small delay between requests
                import time
                time.sleep(0.5)
                
            except Exception as e:
                failed_count += 1
                print(f"   ❌ ({i}/{len(leads)}) {lead['Name']} - ERROR: {e}")
        
        print(f"   📈 Results: {success_count} sent, {failed_count} failed")
        total_leads_sent += success_count
        total_leads_failed += failed_count
    
    # Final summary
    print("\n" + "="*70)
    print("📊 FINAL SUMMARY")
    print("="*70)
    print(f"✅ Total leads sent to Odoo: {total_leads_sent}")
    print(f"❌ Total failed: {total_leads_failed}")
    print(f"📁 Files processed: {min(2, len(csv_files))}")
    print("="*70)
    
    if total_leads_sent > 0:
        print("\n🎉 SUCCESS! Old leads have been sent to your Odoo CRM.")
        print("💡 Check your Odoo CRM to see the imported leads.")
        print("🏷️  They are marked as 'Re-imported' and '[Historical]' for easy identification.")
    else:
        print("\n⚠️  No leads were successfully sent.")
        print("💡 Check your webhook URL and Odoo server status.")

def main():
    """Main entry point"""
    print("🔄 Starting old leads import process...")
    
    try:
        push_old_leads_to_crm()
    except KeyboardInterrupt:
        print("\n\n⚠️  Process interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
    
    print("\n🏁 Process completed.")
    input("Press Enter to exit...")

if __name__ == "__main__":
    main()