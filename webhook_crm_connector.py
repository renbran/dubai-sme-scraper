import requests
import logging
from typing import Dict, List
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class OdooWebhookConnector:
    """Odoo webhook connector for lead management"""
    
    def __init__(self, webhook_url: str, auth_header: str = None):
        """
        Initialize Odoo webhook connector
        
        Args:
            webhook_url: Odoo webhook URL
            auth_header: Optional authorization header
        """
        self.webhook_url = webhook_url
        self.headers = {"Content-Type": "application/json"}
        
        if auth_header:
            self.headers["Authorization"] = auth_header
        
        logger.info(f"✓ Odoo webhook connector initialized: {webhook_url}")
    
    def push_lead(self, lead_data: Dict) -> bool:
        """Push single lead to Odoo via webhook"""
        try:
            # Format lead data for Odoo webhook
            formatted_lead = self._format_lead_for_odoo(lead_data)
            
            response = requests.post(
                self.webhook_url, 
                headers=self.headers, 
                json=formatted_lead, 
                timeout=30
            )
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"✓ Pushed to Odoo webhook: {lead_data.get('Name')}")
                return True
            else:
                logger.error(f"Odoo webhook error: {response.status_code} - {response.text}")
                return False
                
        except requests.exceptions.Timeout:
            logger.error("Webhook timeout - Odoo server may be slow")
            return False
        except requests.exceptions.ConnectionError:
            logger.error("Connection error - Check Odoo webhook URL")
            return False
        except Exception as e:
            logger.error(f"Error pushing to Odoo webhook: {e}")
            return False
    
    def push_leads_batch(self, leads: List[Dict]) -> Dict:
        """Push multiple leads to Odoo via webhook"""
        results = {"success": 0, "failed": 0}
        
        try:
            # Format all leads for batch processing
            formatted_leads = [self._format_lead_for_odoo(lead) for lead in leads]
            
            batch_payload = {
                "leads": formatted_leads,
                "batch": True,
                "count": len(formatted_leads),
                "timestamp": datetime.now().isoformat()
            }
            
            response = requests.post(
                self.webhook_url, 
                headers=self.headers, 
                json=batch_payload, 
                timeout=60
            )
            
            if response.status_code in [200, 201, 202]:
                results["success"] = len(leads)
                logger.info(f"✓ Pushed {len(leads)} leads to Odoo webhook (batch)")
            else:
                results["failed"] = len(leads)
                logger.error(f"Odoo webhook batch error: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Error pushing batch to Odoo webhook: {e}")
            results["failed"] = len(leads)
        
        return results
    
    def _format_lead_for_odoo(self, lead_data: Dict) -> Dict:
        """Format lead data for Odoo CRM webhook"""
        
        # Map priority to Odoo values
        priority_map = {
            'URGENT': '3',
            'HIGH': '2', 
            'MEDIUM': '1',
            'LOW': '0'
        }
        
        formatted = {
            # Lead information
            "name": f"{lead_data.get('Name')} - Google Maps Lead",
            "company_name": lead_data.get('Name'),
            "industry": lead_data.get('Category', 'Business Services'),
            
            # Contact information
            "phone": lead_data.get('Phone') if lead_data.get('Phone') not in ['Contact via website', 'Not available'] else None,
            "email": lead_data.get('Email') if lead_data.get('Email') not in ['Not available'] else None,
            "website": lead_data.get('Website') if lead_data.get('Website') not in ['Not available'] else None,
            
            # Address information
            "street": lead_data.get('Address', 'Dubai, UAE'),
            "city": "Dubai",
            "country": "United Arab Emirates",
            
            # Lead metadata
            "priority": priority_map.get(lead_data.get('Priority', 'MEDIUM'), '1'),
            "source": lead_data.get('Data Source', 'Google Maps Scraper'),
            "search_term": lead_data.get('Search Term'),
            "quality_score": lead_data.get('Quality Score', 5),
            
            # Tags and categorization
            "tags": [
                "Google Maps",
                lead_data.get('Category', 'Business Services'),
                f"Priority: {lead_data.get('Priority', 'MEDIUM')}",
                f"Quality: {lead_data.get('Quality Score', 5)}/10"
            ],
            
            # Description with all details
            "description": f"""Lead from Google Maps Scraper

Company: {lead_data.get('Name')}
Industry: {lead_data.get('Category')}
Search Term: {lead_data.get('Search Term')}
Quality Score: {lead_data.get('Quality Score')}/10
Priority: {lead_data.get('Priority')}

Contact Information:
Phone: {lead_data.get('Phone')}
Email: {lead_data.get('Email')}
Website: {lead_data.get('Website')}
Address: {lead_data.get('Address')}

Scraped: {lead_data.get('Timestamp')}
Source: {lead_data.get('Data Source')}
""",
            
            # Timestamps
            "scraped_at": lead_data.get('Timestamp'),
            "created_at": datetime.now().isoformat()
        }
        
        return formatted
    
    def get_yesterday_stats(self) -> Dict:
        """Get yesterday's stats (placeholder for webhook - Odoo would need to provide this via API)"""
        return {
            'total_leads': 0,
            'date': (datetime.now()).strftime('%Y-%m-%d'),
            'leads': [],
            'note': 'Stats not available via webhook - check Odoo CRM directly'
        }

def get_webhook_connector(webhook_url: str, auth_header: str = None) -> OdooWebhookConnector:
    """Factory function to get webhook connector"""
    return OdooWebhookConnector(webhook_url, auth_header)