#!/usr/bin/env python3
# ================================================================
# 🚀 DUBAI SME LEADS - BULK CRM IMPORT SCRIPT
# ================================================================

import os
import csv
import json
import requests
import time
from datetime import datetime

class DubaiLeadsBulkImporter:
    def __init__(self):
        self.webhook_url = "http://scholarixglobal.com/web/hook/aa6e5d99-5030-4128-864f-9d9a35725c0f"
        self.results_dir = "d:/apify/apify_actor/results"
        self.success_count = 0
        self.error_count = 0
        self.processed_leads = []
        
    def get_all_csv_files(self):
        """Get all CSV files with Dubai business leads"""
        csv_files = []
        
        # Priority files (most recent and comprehensive)
        priority_files = [
            "fresh-dubai-businesses-2025-10-15T09-10-46-966Z.csv",
            "fresh-dubai-businesses-2025-10-15T08-28-15-012Z.csv",
            "MASTER-35-DUBAI-SME-LEADS.csv", 
            "MASTER-55-DUBAI-BUSINESS-SERVICES.csv",
            "master-dubai-sme-leads.csv",
            "deira-sme-leads.csv"
        ]
        
        # Add priority files first
        for filename in priority_files:
            filepath = os.path.join(self.results_dir, filename)
            if os.path.exists(filepath):
                csv_files.append(filepath)
        
        # Add other fresh CSV files
        for filename in os.listdir(self.results_dir):
            if (filename.endswith('.csv') and 
                'fresh-dubai-businesses' in filename and 
                filename not in priority_files):
                filepath = os.path.join(self.results_dir, filename)
                csv_files.append(filepath)
                
        return csv_files
    
    def clean_lead_data(self, lead_data):
        """Clean and format lead data for webhook"""
        
        # Map various field names to standard format
        field_mapping = {
            'Name': ['Name', 'Company Name', 'Business Name', 'name'],
            'Category': ['Category', 'Business Category', 'Type', 'category'],
            'Phone': ['Phone', 'Phone Number', 'Contact Number', 'phone'],
            'Email': ['Email', 'Email Address', 'email'],
            'Website': ['Website', 'Website URL', 'URL', 'website'],
            'Address': ['Address', 'Location', 'Street', 'address'],
            'Priority': ['Priority', 'Lead Priority', 'priority'],
            'Quality Score': ['Quality Score', 'Score', 'Rating', 'quality']
        }
        
        cleaned = {}
        
        # Extract data using field mapping
        for standard_field, possible_fields in field_mapping.items():
            value = ''
            for field in possible_fields:
                if field in lead_data and lead_data[field]:
                    value = str(lead_data[field]).strip()
                    break
            cleaned[standard_field] = value
        
        # Clean contact fields
        invalid_values = ['Contact via website', 'Not available', 'N/A', '', 'None']
        for field in ['Phone', 'Email', 'Website']:
            if cleaned[field] in invalid_values:
                cleaned[field] = ''
        
        # Set intelligent priority if missing
        if not cleaned['Priority'] or cleaned['Priority'] in invalid_values:
            if cleaned['Email'] and cleaned['Website'] and cleaned['Phone']:
                cleaned['Priority'] = 'URGENT'
            elif cleaned['Email'] and (cleaned['Website'] or cleaned['Phone']):
                cleaned['Priority'] = 'HIGH'
            elif cleaned['Email'] or cleaned['Website']:
                cleaned['Priority'] = 'MEDIUM'
            else:
                cleaned['Priority'] = 'LOW'
        
        # Calculate quality score if missing
        if not cleaned['Quality Score'] or cleaned['Quality Score'] in invalid_values:
            score = 4  # Base score
            if cleaned['Phone']: score += 2
            if cleaned['Website']: score += 2
            if cleaned['Email']: score += 1
            if cleaned['Category']: score += 1
            cleaned['Quality Score'] = str(min(score, 10))
        
        # Add metadata
        cleaned['Data Source'] = 'Dubai SME Historical Import'
        cleaned['Search Term'] = 'historical leads import'
        cleaned['Timestamp'] = datetime.now().strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
        
        return cleaned
    
    def send_lead_to_webhook(self, lead_data, source_file=""):
        """Send individual lead to webhook"""
        
        try:
            # Clean the lead data
            cleaned_lead = self.clean_lead_data(lead_data)
            
            # Skip if no company name
            if not cleaned_lead['Name']:
                return False, "No company name"
            
            # Send to webhook
            response = requests.post(
                self.webhook_url,
                json=cleaned_lead,
                timeout=15,
                headers={
                    'Content-Type': 'application/json',
                    'User-Agent': 'Dubai-SME-Bulk-Importer/1.0'
                }
            )
            
            if response.status_code == 200:
                self.success_count += 1
                self.processed_leads.append({
                    'company': cleaned_lead['Name'],
                    'priority': cleaned_lead['Priority'],
                    'quality': cleaned_lead['Quality Score'],
                    'email': cleaned_lead['Email'],
                    'phone': cleaned_lead['Phone']
                })
                return True, "Success"
            else:
                self.error_count += 1
                return False, f"HTTP {response.status_code}: {response.text}"
                
        except Exception as e:
            self.error_count += 1
            return False, f"Exception: {str(e)}"
    
    def process_csv_file(self, csv_file):
        """Process individual CSV file"""
        
        print(f"\n📄 Processing: {os.path.basename(csv_file)}")
        
        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                leads_in_file = 0
                successful_in_file = 0
                
                for row in reader:
                    leads_in_file += 1
                    
                    # Skip empty rows
                    if not any(row.values()) or not row.get('Name'):
                        continue
                    
                    # Send to webhook
                    success, message = self.send_lead_to_webhook(row, csv_file)
                    
                    if success:
                        successful_in_file += 1
                        company = row.get('Name', 'Unknown')[:35]
                        priority = self.processed_leads[-1]['priority']
                        quality = self.processed_leads[-1]['quality']
                        print(f"✅ {company} | Priority: {priority} | Quality: {quality}/10")
                    else:
                        company = row.get('Name', 'Unknown')[:35]
                        print(f"❌ {company} - {message[:30]}")
                    
                    # Small delay to avoid overwhelming webhook
                    time.sleep(0.3)
                
                print(f"📊 File Summary: {successful_in_file}/{leads_in_file} leads sent successfully")
                return leads_in_file, successful_in_file
                
        except Exception as e:
            print(f"❌ Error processing {csv_file}: {e}")
            return 0, 0
    
    def run_bulk_import(self):
        """Main function to import all leads"""
        
        print("=" * 80)
        print("🚀 DUBAI SME LEADS - BULK CRM IMPORT")
        print("=" * 80)
        print(f"🌐 Webhook URL: {self.webhook_url}")
        print(f"📁 Results Directory: {self.results_dir}")
        print(f"⏰ Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Get all CSV files
        csv_files = self.get_all_csv_files()
        
        if not csv_files:
            print("❌ No CSV files found!")
            return
        
        print(f"\n📋 Found {len(csv_files)} CSV files to process:")
        for i, csv_file in enumerate(csv_files, 1):
            file_size = os.path.getsize(csv_file) / 1024  # KB
            print(f"   {i}. {os.path.basename(csv_file)} ({file_size:.1f} KB)")
        
        print(f"\n🚀 Starting bulk import...")
        
        total_leads = 0
        
        # Process each CSV file
        for csv_file in csv_files:
            leads_count, success_count = self.process_csv_file(csv_file)
            total_leads += leads_count
        
        # Final summary
        print("\n" + "=" * 80)
        print("📊 BULK IMPORT SUMMARY")
        print("=" * 80)
        print(f"📄 Files Processed: {len(csv_files)}")
        print(f"📈 Total Leads Found: {total_leads}")
        print(f"✅ Successfully Sent: {self.success_count}")
        print(f"❌ Failed: {self.error_count}")
        
        if total_leads > 0:
            success_rate = (self.success_count / total_leads * 100)
            print(f"📊 Success Rate: {success_rate:.1f}%")
        
        # Show top quality leads
        if self.processed_leads:
            print(f"\n🏆 TOP QUALITY LEADS SENT TO CRM:")
            # Sort by quality score, then by priority
            priority_order = {'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1}
            sorted_leads = sorted(
                self.processed_leads, 
                key=lambda x: (int(x['quality']), priority_order.get(x['priority'], 0)), 
                reverse=True
            )[:10]
            
            for i, lead in enumerate(sorted_leads, 1):
                email_status = "📧" if lead['email'] else "  "
                phone_status = "📱" if lead['phone'] else "  "
                print(f"   {i:2d}. {lead['company'][:35]:<35} | {lead['priority']:6} | {lead['quality']:2}/10 | {email_status}{phone_status}")
        
        print(f"\n⏰ Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)
        
        if self.success_count > 0:
            print("🎉 SUCCESS! Your old leads have been sent to Odoo CRM!")
            print("📋 Check your CRM pipeline for the imported leads")
            print("🔧 If webhook errors occurred, fix the webhook configuration and retry")
        else:
            print("⚠️  No leads were successfully sent. Check webhook configuration!")

def main():
    """Main function"""
    print("🔥 SENDING ALL OLD LEADS TO CRM...")
    importer = DubaiLeadsBulkImporter()
    importer.run_bulk_import()

if __name__ == "__main__":
    main()