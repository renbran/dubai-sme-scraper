#!/usr/bin/env python3
"""
Enhanced script to send old leads from CSV files to Odoo CRM via webhook
"""
import csv
import json
import os
import glob
import requests
import logging
from datetime import datetime
from typing import List, Dict

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class OldLeadsImporter:
    def __init__(self, webhook_url: str, results_dir: str = "d:/apify/apify_actor/results"):
        self.webhook_url = webhook_url
        self.results_dir = results_dir
        self.imported_count = 0
        self.failed_count = 0
        
    def get_latest_csv_files(self, count: int = 2) -> List[str]:
        """Get the latest CSV files from results directory"""
        try:
            csv_pattern = os.path.join(self.results_dir, "*.csv")
            csv_files = glob.glob(csv_pattern)
            
            # Sort by modification time (newest first)
            csv_files.sort(key=os.path.getmtime, reverse=True)
            
            latest_files = csv_files[:count]
            logger.info(f"Found {len(csv_files)} CSV files, selecting latest {count}:")
            
            for i, file in enumerate(latest_files, 1):
                filename = os.path.basename(file)
                mod_time = datetime.fromtimestamp(os.path.getmtime(file))
                logger.info(f"  {i}. {filename} (Modified: {mod_time.strftime('%Y-%m-%d %H:%M:%S')})")
            
            return latest_files
            
        except Exception as e:
            logger.error(f"Error getting CSV files: {e}")
            return []
    
    def read_csv_leads(self, csv_file: str) -> List[Dict]:
        """Read leads from CSV file"""
        leads = []
        
        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Clean and format the lead data
                    lead = {
                        'Name': row.get('Name', '').strip().strip('"'),
                        'Category': row.get('Category', '').strip().strip('"'),
                        'Phone': row.get('Phone', '').strip().strip('"'),
                        'Email': row.get('Email', 'Not available').strip().strip('"'),
                        'Website': row.get('Website', '').strip().strip('"'),
                        'Address': row.get('Address', '').strip().strip('"'),
                        'Priority': row.get('Priority', 'MEDIUM').strip().strip('"'),
                        'Quality Score': row.get('Quality Score', '5'),
                        'Data Source': f"Historical Import - {row.get('Data Source', 'Previous Run')}",
                        'Search Term': f"{row.get('Search Term', '').strip()} [Historical]",
                        'Timestamp': datetime.now().strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z',
                        'Import Source': os.path.basename(csv_file),
                        'Import Date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    }
                    
                    # Only add leads with valid names
                    if lead['Name'] and len(lead['Name']) > 2 and lead['Name'] != 'Name':
                        leads.append(lead)
            
            logger.info(f"Read {len(leads)} valid leads from {os.path.basename(csv_file)}")
            return leads
            
        except Exception as e:
            logger.error(f"Error reading CSV file {csv_file}: {e}")
            return []
    
    def send_lead_to_webhook(self, lead: Dict) -> bool:
        """Send single lead to Odoo webhook"""
        try:
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'Dubai-SME-Scraper/1.0'
            }
            
            response = requests.post(
                self.webhook_url,
                headers=headers,
                json=lead,
                timeout=30
            )
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"✓ Sent to Odoo: {lead['Name']}")
                return True
            else:
                logger.error(f"Webhook error {response.status_code}: {lead['Name']}")
                return False
                
        except requests.exceptions.Timeout:
            logger.error(f"Timeout sending lead: {lead['Name']}")
            return False
        except requests.exceptions.ConnectionError:
            logger.error(f"Connection error sending lead: {lead['Name']}")
            return False
        except Exception as e:
            logger.error(f"Error sending lead {lead['Name']}: {e}")
            return False
    
    def import_csv_file(self, csv_file: str):
        """Import all leads from a single CSV file"""
        logger.info(f"\n📁 Processing file: {os.path.basename(csv_file)}")
        
        leads = self.read_csv_leads(csv_file)
        
        if not leads:
            logger.warning(f"No leads found in {csv_file}")
            return
        
        logger.info(f"🚀 Importing {len(leads)} leads to Odoo...")
        
        success_count = 0
        
        for i, lead in enumerate(leads, 1):
            logger.info(f"Processing lead {i}/{len(leads)}: {lead['Name']}")
            
            if self.send_lead_to_webhook(lead):
                success_count += 1
                self.imported_count += 1
            else:
                self.failed_count += 1
            
            # Small delay to avoid overwhelming the webhook
            import time
            time.sleep(0.5)
        
        logger.info(f"✅ File completed: {success_count}/{len(leads)} leads imported successfully")
    
    def run(self, file_count: int = 2):
        """Main method to import old leads"""
        logger.info("🚀 STARTING OLD LEADS IMPORT TO ODOO CRM")
        logger.info("="*60)
        logger.info(f"Webhook URL: {self.webhook_url}")
        logger.info(f"Results Directory: {self.results_dir}")
        logger.info("="*60)
        
        # Get latest CSV files
        csv_files = self.get_latest_csv_files(file_count)
        
        if not csv_files:
            logger.error("No CSV files found to import!")
            return False
        
        # Import each file
        for csv_file in csv_files:
            self.import_csv_file(csv_file)
        
        # Final summary
        logger.info("\n" + "="*60)
        logger.info("📊 IMPORT SUMMARY")
        logger.info("="*60)
        logger.info(f"Total files processed: {len(csv_files)}")
        logger.info(f"✅ Successfully imported: {self.imported_count} leads")
        logger.info(f"❌ Failed imports: {self.failed_count} leads")
        if (self.imported_count + self.failed_count) > 0:
            success_rate = (self.imported_count/(self.imported_count+self.failed_count)*100)
            logger.info(f"📈 Success rate: {success_rate:.1f}%")
        logger.info("="*60)
        
        return True

def main():
    """Main execution function"""
    
    # Load webhook URL from config
    try:
        with open('d:/apify/apify_actor/crm_config.json', 'r') as f:
            config = json.load(f)
        webhook_url = config['credentials']['webhook_url']
        logger.info(f"✅ Loaded webhook URL from config")
    except Exception as e:
        logger.error(f"Error loading config: {e}")
        webhook_url = "http://scholarixglobal.com/web/hook/1342d838-a97c-466c-99f1-8ae3222f38ce"
        logger.info(f"✅ Using default webhook URL")
    
    # Initialize importer
    importer = OldLeadsImporter(webhook_url)
    
    # Run import
    success = importer.run(file_count=2)
    
    if success:
        print("\n✅ Old leads import completed successfully!")
        print("📤 All historical leads have been sent to Odoo CRM")
        return True
    else:
        print("\n❌ Import failed or no files found")
        return False

if __name__ == "__main__":
    main()