import xmlrpc.client
import logging
from typing import Dict, List
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class OdooCRMConnector:
    """Odoo 17/18 CRM connector using XML-RPC API"""
    
    def __init__(self, url: str, db: str, username: str, password: str):
        """
        Initialize Odoo connection
        
        Args:
            url: Odoo server URL (e.g., 'https://scholarixglobal.com')
            db: Database name
            username: Odoo username (usually 'admin')
            password: Odoo API key or password
        """
        # Ensure URL has protocol
        if not url.startswith('http'):
            url = f'https://{url}'
        
        self.url = url.rstrip('/')
        self.db = db
        self.username = username
        self.password = password
        self.uid = None
        self.models = None
        
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with Odoo server"""
        try:
            common = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/common')
            
            # Get Odoo version
            version_info = common.version()
            logger.info(f"Connecting to Odoo version: {version_info.get('server_version', 'Unknown')}")
            
            # Authenticate
            self.uid = common.authenticate(self.db, self.username, self.password, {})
            
            if not self.uid:
                raise Exception("Authentication failed - Invalid credentials")
            
            self.models = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/object')
            logger.info(f"✓ Connected to Odoo - User ID: {self.uid}")
            
        except Exception as e:
            logger.error(f"Odoo authentication error: {e}")
            raise
    
    def _find_or_create_partner(self, lead_data: Dict) -> int:
        """Find existing partner or create new one"""
        try:
            # Search for existing partner by name
            partner_ids = self.models.execute_kw(
                self.db, self.uid, self.password,
                'res.partner', 'search',
                [[['name', '=', lead_data.get('Name')]]]
            )
            
            if partner_ids:
                logger.info(f"Found existing partner: {lead_data.get('Name')}")
                return partner_ids[0]
            
            # Prepare phone
            phone = lead_data.get('Phone', '')
            if phone in ['Contact via website', 'Not available', '']:
                phone = False
            
            # Prepare email
            email = lead_data.get('Email', '')
            if email in ['Not available', '']:
                email = False
            
            # Prepare website
            website = lead_data.get('Website', '')
            if website in ['Not available', '']:
                website = False
            
            # Create new partner
            partner_data = {
                'name': lead_data.get('Name'),
                'phone': phone,
                'email': email,
                'website': website,
                'street': lead_data.get('Address', ''),
                'city': 'Dubai',
                'country_id': self._get_country_id('United Arab Emirates'),
                'company_type': 'company',
                'is_company': True,
                'comment': f"Lead from Google Maps - Category: {lead_data.get('Category')}"
            }
            
            partner_id = self.models.execute_kw(
                self.db, self.uid, self.password,
                'res.partner', 'create',
                [partner_data]
            )
            
            logger.info(f"✓ Created new partner: {lead_data.get('Name')}")
            return partner_id
            
        except Exception as e:
            logger.error(f"Error managing partner: {e}")
            return None
    
    def _get_country_id(self, country_name: str) -> int:
        """Get country ID from Odoo"""
        try:
            country_ids = self.models.execute_kw(
                self.db, self.uid, self.password,
                'res.country', 'search',
                [[['name', '=', country_name]]]
            )
            return country_ids[0] if country_ids else False
        except:
            return False
    
    def _get_stage_id(self, stage_name: str = 'New') -> int:
        """Get CRM stage ID"""
        try:
            stage_ids = self.models.execute_kw(
                self.db, self.uid, self.password,
                'crm.stage', 'search',
                [[['name', '=', stage_name]]]
            )
            if stage_ids:
                return stage_ids[0]
            
            # If 'New' not found, get first stage
            stage_ids = self.models.execute_kw(
                self.db, self.uid, self.password,
                'crm.stage', 'search',
                [[]], {'limit': 1}
            )
            return stage_ids[0] if stage_ids else False
        except:
            return False
    
    def _map_priority(self, priority: str) -> str:
        """Map priority to Odoo priority values (Odoo 17/18 uses 0-3)"""
        priority_map = {
            'URGENT': '3',  # Very High
            'HIGH': '2',    # High
            'MEDIUM': '1',  # Medium
            'LOW': '0'      # Low
        }
        return priority_map.get(priority, '1')
    
    def _get_or_create_tags(self, tag_names: List[str]) -> List[int]:
        """Get or create CRM tags"""
        tag_ids = []
        
        try:
            for tag_name in tag_names:
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
                    logger.info(f"Created new tag: {tag_name}")
                    
        except Exception as e:
            logger.error(f"Error managing tags: {e}")
        
        return tag_ids
    
    def push_lead(self, lead_data: Dict) -> bool:
        """Push single lead to Odoo CRM"""
        try:
            # Create or find partner
            partner_id = self._find_or_create_partner(lead_data)
            
            if not partner_id:
                logger.error(f"Failed to create/find partner for: {lead_data.get('Name')}")
                return False
            
            # Check if lead already exists
            existing_lead = self.models.execute_kw(
                self.db, self.uid, self.password,
                'crm.lead', 'search',
                [[['partner_id', '=', partner_id]]]
            )
            
            if existing_lead:
                logger.info(f"Lead already exists for: {lead_data.get('Name')} - Updating...")
                # Update existing lead
                update_data = {
                    'description': f"""Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Category: {lead_data.get('Category')}
Search Term: {lead_data.get('Search Term')}
Quality Score: {lead_data.get('Quality Score')}/10
Priority: {lead_data.get('Priority')}

Contact Details:
Phone: {lead_data.get('Phone')}
Email: {lead_data.get('Email')}
Website: {lead_data.get('Website')}
Address: {lead_data.get('Address')}

Source: {lead_data.get('Data Source')}
Scraped At: {lead_data.get('Timestamp')}
"""
                }
                
                self.models.execute_kw(
                    self.db, self.uid, self.password,
                    'crm.lead', 'write',
                    [existing_lead, update_data]
                )
                logger.info(f"✓ Updated existing lead for: {lead_data.get('Name')}")
                return True
            
            # Prepare lead data for Odoo
            phone = lead_data.get('Phone', '')
            if phone in ['Contact via website', 'Not available', '']:
                phone = False
            
            email = lead_data.get('Email', '')
            if email in ['Not available', '']:
                email = False
            
            website = lead_data.get('Website', '')
            if website in ['Not available', '']:
                website = False
            
            # Get tags
            tags = [
                'Google Maps',
                lead_data.get('Category', 'Business Services'),
                f"Priority: {lead_data.get('Priority', 'MEDIUM')}"
            ]
            tag_ids = self._get_or_create_tags(tags)
            
            odoo_lead_data = {
                'name': f"{lead_data.get('Name')} - Dubai Lead",
                'partner_id': partner_id,
                'type': 'opportunity',
                'phone': phone,
                'email_from': email,
                'website': website,
                'street': lead_data.get('Address', ''),
                'city': 'Dubai',
                'country_id': self._get_country_id('United Arab Emirates'),
                'stage_id': self._get_stage_id('New'),
                'priority': self._map_priority(lead_data.get('Priority', 'MEDIUM')),
                'tag_ids': [(6, 0, tag_ids)] if tag_ids else False,
                'description': f"""Lead from Google Maps Scraper

Category: {lead_data.get('Category')}
Search Term: {lead_data.get('Search Term')}
Quality Score: {lead_data.get('Quality Score')}/10

Contact Details:
Phone: {lead_data.get('Phone')}
Email: {lead_data.get('Email')}
Website: {lead_data.get('Website')}
Address: {lead_data.get('Address')}

Data Source: {lead_data.get('Data Source')}
Scraped At: {lead_data.get('Timestamp')}
""",
                'user_id': self.uid,
            }
            
            # Create lead in Odoo
            lead_id = self.models.execute_kw(
                self.db, self.uid, self.password,
                'crm.lead', 'create',
                [odoo_lead_data]
            )
            
            logger.info(f"✓ Created Odoo lead #{lead_id}: {lead_data.get('Name')}")
            return True
            
        except Exception as e:
            logger.error(f"Error pushing lead to Odoo: {e}")
            logger.exception("Full traceback:")
            return False
    
    def push_leads_batch(self, leads: List[Dict]) -> Dict:
        """Push multiple leads to Odoo"""
        results = {"success": 0, "failed": 0}
        
        logger.info(f"Starting batch push of {len(leads)} leads to Odoo...")
        
        for idx, lead in enumerate(leads, 1):
            logger.info(f"Processing lead {idx}/{len(leads)}: {lead.get('Name')}")
            if self.push_lead(lead):
                results["success"] += 1
            else:
                results["failed"] += 1
        
        return results
    
    def get_yesterday_stats(self) -> Dict:
        """Get statistics from yesterday's scraping run"""
        try:
            yesterday = datetime.now() - timedelta(days=1)
            yesterday_start = yesterday.replace(hour=0, minute=0, second=0).strftime('%Y-%m-%d %H:%M:%S')
            yesterday_end = yesterday.replace(hour=23, minute=59, second=59).strftime('%Y-%m-%d %H:%M:%S')
            
            # Search for leads created yesterday
            lead_ids = self.models.execute_kw(
                self.db, self.uid, self.password,
                'crm.lead', 'search',
                [[
                    ['create_date', '>=', yesterday_start],
                    ['create_date', '<=', yesterday_end]
                ]]
            )
            
            if lead_ids:
                leads = self.models.execute_kw(
                    self.db, self.uid, self.password,
                    'crm.lead', 'read',
                    [lead_ids],
                    {'fields': ['name', 'partner_id', 'priority', 'stage_id', 'create_date']}
                )
            else:
                leads = []
            
            stats = {
                'total_leads': len(leads),
                'date': yesterday.strftime('%Y-%m-%d'),
                'leads': leads
            }
            
            logger.info(f"📊 Yesterday's stats ({stats['date']}): {len(leads)} leads found in Odoo")
            return stats
            
        except Exception as e:
            logger.error(f"Error getting yesterday's stats: {e}")
            return {'total_leads': 0, 'date': 'N/A', 'leads': []}
