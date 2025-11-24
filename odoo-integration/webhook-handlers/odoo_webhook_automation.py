# ====================================================================
# ODOO 17/18 WEBHOOK AUTOMATION RULE FOR LEAD RECEPTION
# Copy and paste this code into Odoo Automation Rules
# ====================================================================

"""
STEP 1: Create Webhook Endpoint in Odoo
Path: Settings > Technical > Automation > Automated Actions
"""

# ====================================================================
# AUTOMATION RULE 1: Webhook Controller (Server Action)
# Name: "Receive Dubai SME Leads via Webhook"
# Model: CRM Lead
# Trigger: On Create
# ====================================================================

import json
import logging
from odoo import http, fields
from odoo.http import request
import datetime

class DubaiSMEWebhookController(http.Controller):
    
    @http.route('/web/hook/1342d838-a97c-466c-99f1-8ae3222f38ce', 
                type='json', auth='none', methods=['POST'], csrf=False)
    def receive_dubai_sme_lead(self, **kwargs):
        """
        Webhook endpoint to receive leads from Dubai SME Scraper
        Copy this method into a Server Action with Python Code
        """
        
        try:
            # Get JSON data from request
            lead_data = request.jsonrequest or kwargs
            
            # Log incoming data
            _logger = logging.getLogger(__name__)
            _logger.info(f"Received lead data: {lead_data}")
            
            # Validate required fields
            if not lead_data.get('Name'):
                return {'status': 'error', 'message': 'Name is required'}
            
            # Find or create partner
            partner_id = self._find_or_create_partner(lead_data)
            
            # Create lead in CRM
            lead_id = self._create_crm_lead(lead_data, partner_id)
            
            return {
                'status': 'success',
                'message': 'Lead created successfully',
                'lead_id': lead_id,
                'partner_id': partner_id
            }
            
        except Exception as e:
            _logger.error(f"Webhook error: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    
    def _find_or_create_partner(self, lead_data):
        """Find existing partner or create new one"""
        Partner = request.env['res.partner'].sudo()
        
        # Search for existing partner
        partner = Partner.search([('name', '=', lead_data.get('Name'))], limit=1)
        
        if partner:
            # Update existing partner
            partner.write({
                'phone': lead_data.get('Phone') if lead_data.get('Phone') not in ['Contact via website', 'Not available'] else False,
                'email': lead_data.get('Email') if lead_data.get('Email') != 'Not available' else False,
                'website': lead_data.get('Website') if lead_data.get('Website') != 'Not available' else False,
                'street': lead_data.get('Address', ''),
                'city': 'Dubai',
                'country_id': request.env.ref('base.ae').id,  # UAE
            })
            return partner.id
        else:
            # Create new partner
            partner_vals = {
                'name': lead_data.get('Name'),
                'phone': lead_data.get('Phone') if lead_data.get('Phone') not in ['Contact via website', 'Not available'] else False,
                'email': lead_data.get('Email') if lead_data.get('Email') != 'Not available' else False,
                'website': lead_data.get('Website') if lead_data.get('Website') != 'Not available' else False,
                'street': lead_data.get('Address', ''),
                'city': 'Dubai',
                'country_id': request.env.ref('base.ae').id,  # UAE
                'is_company': True,
                'company_type': 'company',
                'comment': f"Created from Dubai SME Scraper - {lead_data.get('Category', '')}"
            }
            
            partner = Partner.create(partner_vals)
            return partner.id
    
    def _create_crm_lead(self, lead_data, partner_id):
        """Create CRM lead/opportunity"""
        Lead = request.env['crm.lead'].sudo()
        
        # Get or create tags
        tag_ids = self._get_or_create_tags([
            'Dubai SME Scraper',
            lead_data.get('Category', 'Business Services'),
            f"Priority: {lead_data.get('Priority', 'MEDIUM')}",
            lead_data.get('Search Term', '')
        ])
        
        # Map priority
        priority_map = {
            'URGENT': '3',
            'HIGH': '2', 
            'MEDIUM': '1',
            'LOW': '0'
        }
        
        # Create lead
        lead_vals = {
            'name': f"{lead_data.get('Name')} - Dubai Lead",
            'partner_id': partner_id,
            'type': 'opportunity',
            'phone': lead_data.get('Phone') if lead_data.get('Phone') not in ['Contact via website', 'Not available'] else False,
            'email_from': lead_data.get('Email') if lead_data.get('Email') != 'Not available' else False,
            'website': lead_data.get('Website') if lead_data.get('Website') != 'Not available' else False,
            'street': lead_data.get('Address', ''),
            'city': 'Dubai',
            'country_id': request.env.ref('base.ae').id,
            'priority': priority_map.get(lead_data.get('Priority', 'MEDIUM'), '1'),
            'tag_ids': [(6, 0, tag_ids)],
            'description': f"""Lead from Dubai SME Scraper

Category: {lead_data.get('Category', 'N/A')}
Search Term: {lead_data.get('Search Term', 'N/A')}
Quality Score: {lead_data.get('Quality Score', 'N/A')}/10
Data Source: {lead_data.get('Data Source', 'N/A')}

Contact Information:
Phone: {lead_data.get('Phone', 'N/A')}
Email: {lead_data.get('Email', 'N/A')}
Website: {lead_data.get('Website', 'N/A')}
Address: {lead_data.get('Address', 'N/A')}

Scraped At: {lead_data.get('Timestamp', 'N/A')}
Import Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
""",
            'user_id': request.env.user.id,
        }
        
        lead = Lead.create(lead_vals)
        return lead.id
    
    def _get_or_create_tags(self, tag_names):
        """Get or create CRM tags"""
        Tag = request.env['crm.tag'].sudo()
        tag_ids = []
        
        for tag_name in tag_names:
            if tag_name and tag_name.strip():
                tag = Tag.search([('name', '=', tag_name.strip())], limit=1)
                if not tag:
                    tag = Tag.create({'name': tag_name.strip()})
                tag_ids.append(tag.id)
        
        return tag_ids


# ====================================================================
# SERVER ACTION CODE (For Copy-Paste into Odoo UI)
# Path: Settings > Technical > Automation > Server Actions
# Name: "Process Dubai SME Webhook Lead"
# Model: crm.lead
# ====================================================================

"""
PYTHON CODE FOR SERVER ACTION:
Copy this code into a Server Action in Odoo
"""

import json
import logging
from datetime import datetime

# This code runs when webhook receives data
def process_webhook_lead(lead_data):
    """
    Process incoming lead from Dubai SME Scraper webhook
    """
    
    try:
        # Log the incoming data
        _logger.info(f"Processing Dubai SME lead: {lead_data.get('Name')}")
        
        # Find or create partner
        partner_obj = env['res.partner']
        existing_partner = partner_obj.search([('name', '=', lead_data.get('Name'))], limit=1)
        
        if existing_partner:
            partner = existing_partner
            # Update partner info
            partner.write({
                'phone': lead_data.get('Phone') if lead_data.get('Phone') not in ['Contact via website', 'Not available'] else False,
                'email': lead_data.get('Email') if lead_data.get('Email') != 'Not available' else False,
                'website': lead_data.get('Website') if lead_data.get('Website') != 'Not available' else False,
                'street': lead_data.get('Address', ''),
                'city': 'Dubai',
            })
        else:
            # Create new partner
            partner = partner_obj.create({
                'name': lead_data.get('Name'),
                'phone': lead_data.get('Phone') if lead_data.get('Phone') not in ['Contact via website', 'Not available'] else False,
                'email': lead_data.get('Email') if lead_data.get('Email') != 'Not available' else False,
                'website': lead_data.get('Website') if lead_data.get('Website') != 'Not available' else False,
                'street': lead_data.get('Address', ''),
                'city': 'Dubai',
                'country_id': env.ref('base.ae').id,
                'is_company': True,
                'company_type': 'company',
            })
        
        # Create or find tags
        tag_obj = env['crm.tag']
        tag_names = [
            'Dubai SME Scraper',
            lead_data.get('Category', 'Business Services'),
            f"Priority: {lead_data.get('Priority', 'MEDIUM')}",
        ]
        
        tag_ids = []
        for tag_name in tag_names:
            if tag_name:
                tag = tag_obj.search([('name', '=', tag_name)], limit=1)
                if not tag:
                    tag = tag_obj.create({'name': tag_name})
                tag_ids.append(tag.id)
        
        # Priority mapping
        priority_map = {
            'URGENT': '3',
            'HIGH': '2',
            'MEDIUM': '1', 
            'LOW': '0'
        }
        
        # Create the lead
        lead_obj = env['crm.lead']
        new_lead = lead_obj.create({
            'name': f"{lead_data.get('Name')} - Dubai SME Lead",
            'partner_id': partner.id,
            'type': 'opportunity',
            'phone': lead_data.get('Phone') if lead_data.get('Phone') not in ['Contact via website', 'Not available'] else False,
            'email_from': lead_data.get('Email') if lead_data.get('Email') != 'Not available' else False,
            'website': lead_data.get('Website') if lead_data.get('Website') != 'Not available' else False,
            'street': lead_data.get('Address', ''),
            'city': 'Dubai',
            'country_id': env.ref('base.ae').id,
            'priority': priority_map.get(lead_data.get('Priority', 'MEDIUM'), '1'),
            'tag_ids': [(6, 0, tag_ids)],
            'description': f"""Lead from Dubai SME Scraper

Category: {lead_data.get('Category', 'N/A')}
Search Term: {lead_data.get('Search Term', 'N/A')}
Quality Score: {lead_data.get('Quality Score', 'N/A')}/10
Data Source: {lead_data.get('Data Source', 'N/A')}

Contact Information:
Phone: {lead_data.get('Phone', 'N/A')}
Email: {lead_data.get('Email', 'N/A')}  
Website: {lead_data.get('Website', 'N/A')}
Address: {lead_data.get('Address', 'N/A')}

Scraped At: {lead_data.get('Timestamp', 'N/A')}
Import Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

=== AUTOMATION LOG ===
Processed by: Dubai SME Webhook Automation
Created on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
User: {env.user.name}
""",
            'user_id': env.user.id,
        })
        
        # Log success
        _logger.info(f"Successfully created lead #{new_lead.id} for {lead_data.get('Name')}")
        
        return {
            'status': 'success',
            'lead_id': new_lead.id,
            'partner_id': partner.id,
            'message': f"Lead created successfully for {lead_data.get('Name')}"
        }
        
    except Exception as e:
        _logger.error(f"Error processing Dubai SME lead: {str(e)}")
        raise


# ====================================================================
# WEBHOOK ROUTE REGISTRATION (Add to __manifest__.py if creating module)
# ====================================================================

{
    'name': 'Dubai SME Lead Webhook',
    'version': '1.0',
    'depends': ['crm', 'base'],
    'data': [
        'data/webhook_automation.xml',
    ],
    'installable': True,
    'auto_install': False,
}


# ====================================================================
# XML DATA FILE (webhook_automation.xml)
# Place in data folder if creating a custom module
# ====================================================================

<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Automated Action for Dubai SME Webhook -->
    <record id="dubai_sme_webhook_action" model="ir.actions.server">
        <field name="name">Process Dubai SME Webhook Lead</field>
        <field name="model_id" ref="crm.model_crm_lead"/>
        <field name="state">code</field>
        <field name="code">
# Paste the server action code here
process_webhook_lead(records)
        </field>
    </record>
    
    <!-- URL Route for Webhook -->
    <record id="dubai_sme_webhook_route" model="ir.http.route">
        <field name="name">Dubai SME Webhook Route</field>
        <field name="route">/web/hook/1342d838-a97c-466c-99f1-8ae3222f38ce</field>
        <field name="method">POST</field>
        <field name="type">json</field>
        <field name="auth">none</field>
        <field name="csrf">False</field>
    </record>
</odoo>


# ====================================================================
# QUICK SETUP INSTRUCTIONS FOR ODOO UI
# ====================================================================

"""
STEP-BY-STEP SETUP IN ODOO UI:

1. Go to Settings > Technical > Automation > Server Actions
2. Click "New" 
3. Fill in:
   - Name: "Dubai SME Webhook Handler"
   - Model: CRM Lead (crm.lead)
   - Action Type: Python Code
   - Python Code: [Copy the server action code above]

4. Go to Settings > Technical > Automation > Automated Actions  
5. Click "New"
6. Fill in:
   - Name: "Dubai SME Lead Automation"
   - Model: CRM Lead
   - Trigger: On Create
   - Apply on: All Records
   - Action: Execute Server Action > Select "Dubai SME Webhook Handler"

5. Create webhook endpoint in custom module or use existing webhook framework

6. Test webhook with:
   curl -X POST https://scholarixglobal.com/web/hook/1342d838-a97c-466c-99f1-8ae3222f38ce \
   -H "Content-Type: application/json" \
   -d '{"Name":"Test Company","Category":"Testing","Phone":"+971501234567"}'

WEBHOOK URL: https://scholarixglobal.com/web/hook/1342d838-a97c-466c-99f1-8ae3222f38ce
"""

# ====================================================================
# SIMPLE CONTROLLER FOR IMMEDIATE COPY-PASTE
# ====================================================================

from odoo import http, fields
from odoo.http import request
import json
import logging

class SMEWebhookController(http.Controller):
    
    @http.route('/web/hook/1342d838-a97c-466c-99f1-8ae3222f38ce', 
                type='json', auth='none', methods=['POST'], csrf=False)
    def sme_webhook(self, **kwargs):
        try:
            data = request.jsonrequest
            
            # Create partner
            partner = request.env['res.partner'].sudo().create({
                'name': data.get('Name'),
                'phone': data.get('Phone') if data.get('Phone') != 'Contact via website' else False,
                'email': data.get('Email') if data.get('Email') != 'Not available' else False,
                'website': data.get('Website') if data.get('Website') != 'Not available' else False,
                'street': data.get('Address', ''),
                'city': 'Dubai',
                'is_company': True,
            })
            
            # Create lead
            lead = request.env['crm.lead'].sudo().create({
                'name': f"{data.get('Name')} - Dubai Lead",
                'partner_id': partner.id,
                'phone': data.get('Phone') if data.get('Phone') != 'Contact via website' else False,
                'email_from': data.get('Email') if data.get('Email') != 'Not available' else False,
                'description': f"Category: {data.get('Category')}\nSource: Dubai SME Scraper",
            })
            
            return {'status': 'success', 'lead_id': lead.id}
            
        except Exception as e:
            return {'status': 'error', 'message': str(e)}