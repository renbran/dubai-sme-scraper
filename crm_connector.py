import requests
import logging
from typing import Dict, List
import json
import xmlrpc.client

logger = logging.getLogger(__name__)

class CRMConnector:
    """Base CRM connector class"""
    
    def push_lead(self, lead_data: Dict) -> bool:
        """Push a single lead to CRM"""
        raise NotImplementedError
    
    def push_leads_batch(self, leads: List[Dict]) -> Dict:
        """Push multiple leads to CRM"""
        raise NotImplementedError


class Odoo17Connector(CRMConnector):
    """Odoo 17 CRM connector using XML-RPC API"""
    
    def __init__(self, url: str, db: str, username: str, password: str):
        self.url = url.rstrip('/')
        self.db = db
        self.username = username
        self.password = password
        self.uid = None
        self.models = None
        self.authenticate()
    
    def authenticate(self):
        """Authenticate with Odoo"""
        try:
            common = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/common')
            self.uid = common.authenticate(self.db, self.username, self.password, {})
            
            if self.uid:
                self.models = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/object')
                logger.info(f"✓ Authenticated with Odoo 17 as user ID: {self.uid}")
            else:
                logger.error("Failed to authenticate with Odoo 17")
                
        except Exception as e:
            logger.error(f"Odoo authentication error: {e}")
            raise
    
    def push_lead(self, lead_data: Dict) -> bool:
        """Push single lead to Odoo 17 CRM"""
        try:
            if not self.uid:
                logger.error("Not authenticated with Odoo")
                return False
            
            # Map scraper data to Odoo CRM lead fields
            odoo_lead = {
                'name': lead_data.get('Name'),
                'contact_name': lead_data.get('Name'),
                'phone': lead_data.get('Phone') if lead_data.get('Phone') != 'Contact via website' else False,
                'website': lead_data.get('Website') if lead_data.get('Website') != 'Not available' else False,
                'street': lead_data.get('Address'),
                'city': 'Dubai',
                'country_id': self._get_country_id('United Arab Emirates'),
                'type': 'opportunity',
                'priority': self._map_priority(lead_data.get('Priority')),
                'description': f"""
Lead Source: {lead_data.get('Data Source')}
Search Term: {lead_data.get('Search Term')}
Category: {lead_data.get('Category')}
Quality Score: {lead_data.get('Quality Score')}/10
Scraped: {lead_data.get('Timestamp')}
                """.strip(),
                'tag_ids': [(6, 0, self._get_or_create_tags([
                    lead_data.get('Category'),
                    'Google Maps Lead',
                    lead_data.get('Priority')
                ]))],
            }
            
            # Create lead in Odoo
            lead_id = self.models.execute_kw(
                self.db, self.uid, self.password,
                'crm.lead', 'create',
                [odoo_lead]
            )
            
            logger.info(f"✓ Pushed to Odoo 17 CRM - ID: {lead_id} - {lead_data.get('Name')}")
            return True
            
        except Exception as e:
            logger.error(f"Error pushing to Odoo 17: {e}")
            return False
    
    def push_leads_batch(self, leads: List[Dict]) -> Dict:
        """Push multiple leads to Odoo 17 CRM"""
        results = {"success": 0, "failed": 0}
        
        try:
            # Prepare batch data
            odoo_leads = []
            
            for lead_data in leads:
                odoo_lead = {
                    'name': lead_data.get('Name'),
                    'contact_name': lead_data.get('Name'),
                    'phone': lead_data.get('Phone') if lead_data.get('Phone') != 'Contact via website' else False,
                    'website': lead_data.get('Website') if lead_data.get('Website') != 'Not available' else False,
                    'street': lead_data.get('Address'),
                    'city': 'Dubai',
                    'country_id': self._get_country_id('United Arab Emirates'),
                    'type': 'opportunity',
                    'priority': self._map_priority(lead_data.get('Priority')),
                    'description': f"""
Lead Source: {lead_data.get('Data Source')}
Search Term: {lead_data.get('Search Term')}
Category: {lead_data.get('Category')}
Quality Score: {lead_data.get('Quality Score')}/10
                    """.strip(),
                }
                odoo_leads.append(odoo_lead)
            
            # Batch create in Odoo
            created_ids = self.models.execute_kw(
                self.db, self.uid, self.password,
                'crm.lead', 'create',
                [odoo_leads]
            )
            
            results["success"] = len(created_ids) if isinstance(created_ids, list) else 1
            logger.info(f"✓ Batch pushed {results['success']} leads to Odoo 17 CRM")
            
        except Exception as e:
            logger.error(f"Error in batch push to Odoo 17: {e}")
            # Fallback to individual push
            for lead in leads:
                if self.push_lead(lead):
                    results["success"] += 1
                else:
                    results["failed"] += 1
        
        return results
    
    def _get_country_id(self, country_name: str) -> int:
        """Get Odoo country ID"""
        try:
            country_ids = self.models.execute_kw(
                self.db, self.uid, self.password,
                'res.country', 'search',
                [[['name', '=', country_name]]]
            )
            return country_ids[0] if country_ids else False
        except:
            return False
    
    def _map_priority(self, priority_str: str) -> str:
        """Map priority string to Odoo priority"""
        priority_map = {
            'URGENT': '3',  # High
            'HIGH': '2',    # Medium
            'MEDIUM': '1',  # Low
        }
        return priority_map.get(priority_str, '1')
    
    def _get_or_create_tags(self, tag_names: List[str]) -> List[int]:
        """Get or create Odoo CRM tags"""
        tag_ids = []
        try:
            for tag_name in tag_names:
                if not tag_name:
                    continue
                
                # Search for existing tag
                existing_tags = self.models.execute_kw(
                    self.db, self.uid, self.password,
                    'crm.tag', 'search',
                    [[['name', '=', tag_name]]]
                )
                
                if existing_tags:
                    tag_ids.append(existing_tags[0])
                else:
                    # Create new tag
                    new_tag_id = self.models.execute_kw(
                        self.db, self.uid, self.password,
                        'crm.tag', 'create',
                        [{'name': tag_name}]
                    )
                    tag_ids.append(new_tag_id)
            
            return tag_ids
        except Exception as e:
            logger.warning(f"Error handling tags: {e}")
            return []


class HubSpotConnector(CRMConnector):
    """HubSpot CRM connector"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.hubapi.com"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def push_lead(self, lead_data: Dict) -> bool:
        """Push single lead to HubSpot"""
        try:
            url = f"{self.base_url}/crm/v3/objects/contacts"
            
            payload = {
                "properties": {
                    "company": lead_data.get('Name'),
                    "phone": lead_data.get('Phone'),
                    "website": lead_data.get('Website'),
                    "address": lead_data.get('Address'),
                    "industry": lead_data.get('Category'),
                    "hs_lead_status": lead_data.get('Priority'),
                }
            }
            
            response = requests.post(url, headers=self.headers, json=payload)
            
            if response.status_code in [200, 201]:
                logger.info(f"✓ Pushed to HubSpot: {lead_data.get('Name')}")
                return True
            else:
                logger.error(f"HubSpot error: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error pushing to HubSpot: {e}")
            return False
    
    def push_leads_batch(self, leads: List[Dict]) -> Dict:
        """Push multiple leads to HubSpot"""
        results = {"success": 0, "failed": 0}
        
        for lead in leads:
            if self.push_lead(lead):
                results["success"] += 1
            else:
                results["failed"] += 1
        
        return results


class GenericWebhookConnector(CRMConnector):
    """Generic webhook connector for custom CRMs"""
    
    def __init__(self, webhook_url: str, auth_header: str = None):
        self.webhook_url = webhook_url
        self.headers = {"Content-Type": "application/json"}
        
        if auth_header:
            self.headers["Authorization"] = auth_header
    
    def push_lead(self, lead_data: Dict) -> bool:
        """Push single lead via webhook"""
        try:
            response = requests.post(self.webhook_url, headers=self.headers, json=lead_data)
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"✓ Pushed via webhook: {lead_data.get('Name')}")
                return True
            else:
                logger.error(f"Webhook error: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error pushing via webhook: {e}")
            return False
    
    def push_leads_batch(self, leads: List[Dict]) -> Dict:
        """Push multiple leads via webhook"""
        try:
            response = requests.post(self.webhook_url, headers=self.headers, json={"leads": leads})
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"✓ Pushed {len(leads)} leads via webhook")
                return {"success": len(leads), "failed": 0}
            else:
                return {"success": 0, "failed": len(leads)}
                
        except Exception as e:
            logger.error(f"Error pushing batch via webhook: {e}")
            return {"success": 0, "failed": len(leads)}


def get_crm_connector(crm_type: str, **credentials) -> CRMConnector:
    """Factory function to get appropriate CRM connector"""
    
    connectors = {
        "odoo17": Odoo17Connector,
        "odoo": Odoo17Connector,
        "hubspot": HubSpotConnector,
        "webhook": GenericWebhookConnector
    }
    
    connector_class = connectors.get(crm_type.lower())
    
    if not connector_class:
        raise ValueError(f"Unsupported CRM type: {crm_type}")
    
    return connector_class(**credentials)
