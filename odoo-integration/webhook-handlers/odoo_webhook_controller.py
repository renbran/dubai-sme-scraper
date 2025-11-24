# ====================================================================
# ODOO 17/18 WEBHOOK CONTROLLER FOR DUBAI SME LEADS
# Copy this code into your Odoo custom module or server action
# ====================================================================

from odoo import http
from odoo.http import request
import json
import logging
from datetime import datetime

_logger = logging.getLogger(__name__)

class DubaiSMEWebhookController(http.Controller):
    
    @http.route('/web/hook/1342d838-a97c-466c-99f1-8ae3222f38ce', 
                type='json', auth='none', methods=['POST'], csrf=False)
    def receive_sme_lead(self, **kwargs):
        """
        Webhook endpoint to receive leads from Dubai SME Scraper
        URL: https://scholarixglobal.com/web/hook/1342d838-a97c-466c-99f1-8ae3222f38ce
        """
        
        try:
            # Get JSON data from request
            lead_data = request.jsonrequest or kwargs
            
            _logger.info(f"Received Dubai SME lead: {lead_data.get('Name', 'Unknown')}")
            
            # Validate required fields
            if not lead_data.get('Name'):
                return {'status': 'error', 'message': 'Company name is required'}
            
            # Process the lead
            result = self._process_lead_data(lead_data)
            
            return result
            
        except Exception as e:
            _logger.error(f"Dubai SME webhook error: {str(e)}")
            return {'status': 'error', 'message': f'Processing failed: {str(e)}'}
    
    def _process_lead_data(self, lead_data):
        """Process and create lead/partner in Odoo"""
        
        # Find or create partner
        partner_id = self._find_or_create_partner(lead_data)
        
        # Create CRM lead
        lead_id = self._create_crm_lead(lead_data, partner_id)
        
        return {
            'status': 'success',
            'message': f"Lead created successfully for {lead_data.get('Name')}",
            'lead_id': lead_id,
            'partner_id': partner_id
        }
    
    def _find_or_create_partner(self, lead_data):
        """Find existing partner or create new one"""
        
        Partner = request.env['res.partner'].sudo()
        
        # Search for existing partner by name
        partner = Partner.search([('name', '=', lead_data.get('Name'))], limit=1)
        
        # Prepare contact fields
        phone = lead_data.get('Phone', '') if lead_data.get('Phone') not in ['Contact via website', 'Not available', ''] else False
        email = lead_data.get('Email', '') if lead_data.get('Email') not in ['Not available', ''] else False
        website = lead_data.get('Website', '') if lead_data.get('Website') not in ['Not available', ''] else False
        
        if partner:
            # Update existing partner with new info
            partner.write({
                'phone': phone or partner.phone,
                'email': email or partner.email,
                'website': website or partner.website,
                'street': lead_data.get('Address', '') or partner.street,
                'city': 'Dubai',
                'comment': f"Updated from Dubai SME Scraper - {lead_data.get('Category', '')}"
            })
            _logger.info(f"Updated existing partner: {partner.name}")
            return partner.id
        else:
            # Create new partner
            partner_vals = {
                'name': lead_data.get('Name'),
                'phone': phone,
                'email': email,
                'website': website,
                'street': lead_data.get('Address', ''),
                'city': 'Dubai',
                'country_id': request.env.ref('base.ae').id,  # UAE
                'is_company': True,
                'company_type': 'company',
                'comment': f"Created from Dubai SME Scraper - {lead_data.get('Category', '')}"
            }
            
            partner = Partner.create(partner_vals)
            _logger.info(f"Created new partner: {partner.name}")
            return partner.id
    
    def _create_crm_lead(self, lead_data, partner_id):
        """Create CRM lead/opportunity"""
        
        Lead = request.env['crm.lead'].sudo()
        
        # Check if lead already exists for this partner
        existing_lead = Lead.search([
            ('partner_id', '=', partner_id),
            ('name', 'ilike', lead_data.get('Name', ''))
        ], limit=1)
        
        if existing_lead:
            # Update existing lead
            existing_lead.write({
                'description': f"""{existing_lead.description or ''}

--- UPDATED FROM DUBAI SME SCRAPER ---
Update Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Category: {lead_data.get('Category', 'N/A')}
Search Term: {lead_data.get('Search Term', 'N/A')}
Quality Score: {lead_data.get('Quality Score', 'N/A')}/10
Data Source: {lead_data.get('Data Source', 'Dubai SME Scraper')}
"""
            })
            _logger.info(f"Updated existing lead: {existing_lead.name}")
            return existing_lead.id
        
        # Get or create tags
        tag_ids = self._get_or_create_tags([
            'Dubai SME Scraper',
            lead_data.get('Category', 'Business Services'),
            f"Priority: {lead_data.get('Priority', 'MEDIUM')}",
            'ERP/Automation Potential'
        ])
        
        # Map priority to Odoo values
        priority_map = {
            'URGENT': '3',  # Very High
            'HIGH': '2',    # High
            'MEDIUM': '1',  # Medium
            'LOW': '0'      # Low
        }
        
        # Prepare contact fields
        phone = lead_data.get('Phone', '') if lead_data.get('Phone') not in ['Contact via website', 'Not available', ''] else False
        email = lead_data.get('Email', '') if lead_data.get('Email') not in ['Not available', ''] else False
        website = lead_data.get('Website', '') if lead_data.get('Website') not in ['Not available', ''] else False
        
        # Create new lead
        lead_vals = {
            'name': f"{lead_data.get('Name')} - Dubai SME Lead",
            'partner_id': partner_id,
            'type': 'opportunity',
            'phone': phone,
            'email_from': email,
            'website': website,
            'street': lead_data.get('Address', ''),
            'city': 'Dubai',
            'country_id': request.env.ref('base.ae').id,
            'priority': priority_map.get(lead_data.get('Priority', 'MEDIUM'), '1'),
            'tag_ids': [(6, 0, tag_ids)],
            'description': f"""🚀 LEAD FROM DUBAI SME SCRAPER

📊 COMPANY DETAILS:
• Category: {lead_data.get('Category', 'N/A')}
• Search Term: {lead_data.get('Search Term', 'N/A')}
• Quality Score: {lead_data.get('Quality Score', 'N/A')}/10
• Priority Level: {lead_data.get('Priority', 'MEDIUM')}

📞 CONTACT INFORMATION:
• Phone: {lead_data.get('Phone', 'N/A')}
• Email: {lead_data.get('Email', 'N/A')}
• Website: {lead_data.get('Website', 'N/A')}
• Address: {lead_data.get('Address', 'N/A')}

🎯 BUSINESS POTENTIAL:
• ERP Implementation Ready
• Automation & AI Potential
• Digital Transformation Candidate
• SME Scaling Phase

📝 TECHNICAL INFO:
• Data Source: {lead_data.get('Data Source', 'Dubai SME Scraper')}
• Scraped At: {lead_data.get('Timestamp', 'N/A')}
• Import Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
• Processed By: Dubai SME Webhook Automation

💼 NEXT ACTIONS:
• Schedule discovery call
• Assess ERP/automation needs  
• Prepare solution proposal
• Follow up within 24-48 hours
""",
            'user_id': request.env.user.id,
        }
        
        lead = Lead.create(lead_vals)
        _logger.info(f"Created new lead #{lead.id}: {lead.name}")
        return lead.id
    
    def _get_or_create_tags(self, tag_names):
        """Get or create CRM tags"""
        
        Tag = request.env['crm.tag'].sudo()
        tag_ids = []
        
        for tag_name in tag_names:
            if tag_name and tag_name.strip():
                tag = Tag.search([('name', '=', tag_name.strip())], limit=1)
                if not tag:
                    tag = Tag.create({
                        'name': tag_name.strip(),
                        'color': 2  # Green color for Dubai SME tags
                    })
                    _logger.info(f"Created new tag: {tag_name}")
                tag_ids.append(tag.id)
        
        return tag_ids


# ====================================================================
# INSTALLATION INSTRUCTIONS FOR ODOO
# ====================================================================

"""
STEP 1: Copy this controller code to a Python file in your custom module
File path: /your_module/controllers/sme_webhook.py

STEP 2: Add to your module's __init__.py:
from . import controllers

STEP 3: Add to controllers/__init__.py:
from . import sme_webhook

STEP 4: Update your module and restart Odoo

STEP 5: Test the webhook:
curl -X POST https://scholarixglobal.com/web/hook/1342d838-a97c-466c-99f1-8ae3222f38ce \
-H "Content-Type: application/json" \
-d '{
  "Name": "Test Company LLC",
  "Category": "Manufacturing",
  "Phone": "+971501234567",
  "Email": "contact@testcompany.ae",
  "Website": "https://testcompany.ae",
  "Address": "Dubai Investment Park, Dubai",
  "Priority": "HIGH",
  "Quality Score": "9",
  "Data Source": "Dubai SME Scraper",
  "Search Term": "manufacturing companies Dubai",
  "Timestamp": "2025-10-15T08:30:00.000Z"
}'

WEBHOOK ENDPOINT: /web/hook/1342d838-a97c-466c-99f1-8ae3222f38ce
FULL URL: https://scholarixglobal.com/web/hook/1342d838-a97c-466c-99f1-8ae3222f38ce
"""