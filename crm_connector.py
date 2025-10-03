import logging
from typing import Dict, List

logger = logging.getLogger(__name__)

class CRMConnector:
    """Base CRM connector class"""
    
    def push_lead(self, lead_data: Dict) -> bool:
        """Push a single lead to CRM"""
        raise NotImplementedError
    
    def push_leads_batch(self, leads: List[Dict]) -> Dict:
        """Push multiple leads to CRM"""
        raise NotImplementedError

def get_crm_connector(crm_type: str, **credentials):
    """Factory function to get appropriate CRM connector"""
    
    if crm_type.lower() in ['odoo17', 'odoo18']:
        from odoo_crm_connector import OdooCRMConnector
        return OdooCRMConnector(
            url=credentials.get('url'),
            db=credentials.get('db'),
            username=credentials.get('username'),
            password=credentials.get('password')
        )
    
    raise ValueError(f"Unsupported CRM type: {crm_type}")
    
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
                    "notes": f"Source: {lead_data.get('Data Source')} | Search: {lead_data.get('Search Term')}"
                }
            }
            
            response = requests.post(url, headers=self.headers, json=payload)
            
            if response.status_code in [200, 201]:
                logger.info(f"✓ Pushed to HubSpot: {lead_data.get('Name')}")
                return True
            else:
                logger.error(f"HubSpot error: {response.status_code} - {response.text}")
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


class SalesforceCon(CRMConnector):
    """Salesforce CRM connector"""
    
    def __init__(self, instance_url: str, access_token: str):
        self.instance_url = instance_url
        self.access_token = access_token
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
    
    def push_lead(self, lead_data: Dict) -> bool:
        """Push single lead to Salesforce"""
        try:
            url = f"{self.instance_url}/services/data/v58.0/sobjects/Lead"
            
            payload = {
                "Company": lead_data.get('Name'),
                "Phone": lead_data.get('Phone'),
                "Website": lead_data.get('Website'),
                "Street": lead_data.get('Address'),
                "Industry": lead_data.get('Category'),
                "Rating": lead_data.get('Priority'),
                "Status": "Open - Not Contacted",
                "LeadSource": lead_data.get('Data Source'),
                "Description": f"Search Term: {lead_data.get('Search Term')}"
            }
            
            response = requests.post(url, headers=self.headers, json=payload)
            
            if response.status_code in [200, 201]:
                logger.info(f"✓ Pushed to Salesforce: {lead_data.get('Name')}")
                return True
            else:
                logger.error(f"Salesforce error: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error pushing to Salesforce: {e}")
            return False
    
    def push_leads_batch(self, leads: List[Dict]) -> Dict:
        """Push multiple leads to Salesforce"""
        results = {"success": 0, "failed": 0}
        
        for lead in leads:
            if self.push_lead(lead):
                results["success"] += 1
            else:
                results["failed"] += 1
        
        return results


class ZohoCRMConnector(CRMConnector):
    """Zoho CRM connector"""
    
    def __init__(self, access_token: str, api_domain: str = "https://www.zohoapis.com"):
        self.access_token = access_token
        self.api_domain = api_domain
        self.headers = {
            "Authorization": f"Zoho-oauthtoken {access_token}",
            "Content-Type": "application/json"
        }
    
    def push_lead(self, lead_data: Dict) -> bool:
        """Push single lead to Zoho CRM"""
        try:
            url = f"{self.api_domain}/crm/v3/Leads"
            
            payload = {
                "data": [{
                    "Company": lead_data.get('Name'),
                    "Phone": lead_data.get('Phone'),
                    "Website": lead_data.get('Website'),
                    "Street": lead_data.get('Address'),
                    "Industry": lead_data.get('Category'),
                    "Lead_Status": "Not Contacted",
                    "Lead_Source": lead_data.get('Data Source'),
                    "Rating": lead_data.get('Priority'),
                    "Description": f"Search Term: {lead_data.get('Search Term')}\nQuality Score: {lead_data.get('Quality Score')}"
                }]
            }
            
            response = requests.post(url, headers=self.headers, json=payload)
            
            if response.status_code in [200, 201]:
                logger.info(f"✓ Pushed to Zoho CRM: {lead_data.get('Name')}")
                return True
            else:
                logger.error(f"Zoho CRM error: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error pushing to Zoho CRM: {e}")
            return False
    
    def push_leads_batch(self, leads: List[Dict]) -> Dict:
        """Push multiple leads to Zoho CRM"""
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
                logger.error(f"Webhook error: {response.status_code} - {response.text}")
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
                logger.error(f"Webhook batch error: {response.status_code}")
                return {"success": 0, "failed": len(leads)}
                
        except Exception as e:
            logger.error(f"Error pushing batch via webhook: {e}")
            return {"success": 0, "failed": len(leads)}


def get_crm_connector(crm_type: str, **credentials):
    """Factory function to get appropriate CRM connector"""
    
    if crm_type.lower() == 'odoo17':
        from odoo_crm_connector import OdooCRMConnector
        return OdooCRMConnector(
            url=credentials.get('url'),
            db=credentials.get('db'),
            username=credentials.get('username'),
            password=credentials.get('password')
        )
    
    connectors = {
        "hubspot": HubSpotConnector,
        "salesforce": SalesforceCon,
        "zoho": ZohoCRMConnector,
        "webhook": GenericWebhookConnector
    }
    
    connector_class = connectors.get(crm_type.lower())
    
    if not connector_class:
        raise ValueError(f"Unsupported CRM type: {crm_type}")
    
    return connector_class(**credentials)
