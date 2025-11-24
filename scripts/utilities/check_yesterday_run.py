import json
import os
from odoo_crm_connector import OdooCRMConnector
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_yesterday_performance():
    """Check yesterday's scraping performance from Odoo"""
    
    # Load config
    config_path = "d:/apify/apify_actor/crm_config.json"
    
    if not os.path.exists(config_path):
        logger.error("CRM config file not found!")
        return
    
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    # Connect to Odoo
    try:
        odoo = OdooCRMConnector(
            url=config['credentials']['url'],
            db=config['credentials']['db'],
            username=config['credentials']['username'],
            password=config['credentials']['password']
        )
        
        # Get yesterday's stats
        stats = odoo.get_yesterday_stats()
        
        print("\n" + "="*60)
        print("📊 YESTERDAY'S SCRAPING PERFORMANCE")
        print("="*60)
        print(f"Date: {stats['date']}")
        print(f"Total Leads Scraped: {stats['total_leads']}")
        print("="*60)
        
        if stats['leads']:
            print("\nTop 10 Leads:")
            for idx, lead in enumerate(stats['leads'][:10], 1):
                print(f"{idx}. {lead.get('name')} - Stage: {lead.get('stage_id', ['N/A'])[1]} - Priority: {lead.get('priority')}")
        else:
            print("\nNo leads found from yesterday's run.")
        
        print("\n" + "="*60)
        print("🚀 Starting today's 1-hour scraping session...")
        print("="*60 + "\n")
        
        return stats
        
    except Exception as e:
        logger.error(f"Error checking yesterday's run: {e}")
        return None

if __name__ == "__main__":
    check_yesterday_performance()
