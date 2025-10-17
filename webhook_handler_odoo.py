# =================================================================
# CORRECT WEBHOOK HANDLER FOR ODOO
# Copy this code to your Odoo webhook controller
# =================================================================

"""
WEBHOOK ENDPOINT HANDLER
URL: /web/hook/22c7e29b-1d45-4ec8-93cc-fe62708bddc7

The scraper sends data in this format:
{
    "Name": "ABC Trading LLC",
    "Category": "Trading Companies", 
    "Phone": "+971501234567",
    "Email": "info@abctrading.ae",
    "Website": "https://abctrading.ae",
    "Address": "Dubai Investment Park, Dubai",
    "Priority": "HIGH",
    "Quality Score": "9",
    "Data Source": "Google Maps Scraper",
    "Search Term": "manufacturing companies",
    "Timestamp": "2025-10-15T08:30:15.123Z"
}
"""

# CORRECT WEBHOOK HANDLER CODE FOR ODOO:

def process_webhook_lead(payload):
    """
    This is the correct function to handle incoming webhook data
    Replace your current webhook handler with this code
    """
    
    try:
        # Extract data from payload (NOT _model and _id)
        company_name = payload.get('Name', 'Unknown Company')
        company_phone = payload.get('Phone', '')
        company_email = payload.get('Email', '')
        company_website = payload.get('Website', '')
        company_address = payload.get('Address', '')
        company_category = payload.get('Category', 'Business Services')
        company_priority = payload.get('Priority', 'MEDIUM')
        quality_score = payload.get('Quality Score', '5')
        search_term = payload.get('Search Term', '')
        
        # Clean up contact fields
        if company_phone in ['Contact via website', 'Not available', '']:
            company_phone = False
        if company_email in ['Not available', '']:
            company_email = False  
        if company_website in ['Not available', '']:
            company_website = False
        
        # Step 1: Create or find partner
        partner =         env['crm.lead']env['res.partner'].search([('name', '=', company_name)], limit=1)
        
        if partner:
            # Update existing partner
            partner.write({
                'phone': company_phone or partner.phone,
                'email': company_email or partner.email,
                'website': company_website or partner.website,
                'street': company_address or partner.street,
                'city': 'Dubai',
                'is_company': True
            })
        else:
            # Create new partner
            partner = env['res.partner'].create({
                'name': company_name,
                'phone': company_phone,
                'email': company_email,
                'website': company_website,
                'street': company_address,
                'city': 'Dubai',
                'is_company': True,
                'company_type': 'company'
            })
        
        # Step 2: Set priority
        lead_priority = '1'  # Default Medium
        if company_priority == 'URGENT':
            lead_priority = '3'
        elif company_priority == 'HIGH':
            lead_priority = '2'
        elif company_priority == 'LOW':
            lead_priority = '0'
        
        # Step 3: Create lead description
        lead_description = f"""Dubai SME Lead - {company_category}

Company: {company_name}
Category: {company_category}
Quality Score: {quality_score}/10
Priority: {company_priority}
Search Term: {search_term}

Contact Information:
Phone: {payload.get('Phone', 'N/A')}
Email: {payload.get('Email', 'N/A')}
Website: {payload.get('Website', 'N/A')}
Address: {company_address}

Business Potential:
• ERP Implementation Ready
• Automation & AI Potential  
• Digital Transformation Candidate
• SME Scaling Opportunities

Next Steps:
• Schedule discovery call
• Assess current systems
• Prepare solution proposal
• Follow up within 24-48 hours

Source: Google Maps Scraper
Timestamp: {payload.get('Timestamp', '')}
"""

        # Step 4: Check if lead already exists
        existing_lead = env['crm.lead'].search([
            ('partner_id', '=', partner.id),
            ('name', 'ilike', company_name)
        ], limit=1)
        
        if existing_lead:
            # Update existing lead
            existing_lead.write({
                'description': existing_lead.description + '\n\n--- UPDATED FROM SCRAPER ---\n' + lead_description,
                'priority': lead_priority
            })
        else:
            # Create new lead
            new_lead = env['crm.lead'].create({
                'name': company_name + ' - Dubai SME Lead',
                'partner_id': partner.id,
                'type': 'opportunity',
                'phone': company_phone,
                'email_from': company_email, 
                'website': company_website,
                'street': company_address,
                'city': 'Dubai',
                'priority': lead_priority,
                'description': lead_description,
                'user_id': env.user.id
            })
        
        # Step 5: Add tags
        tag_names = ['Dubai SME', company_category, 'Google Maps', 'ERP Potential']
        
        for tag_name in tag_names:
            if tag_name:
                tag = env['crm.tag'].search([('name', '=', tag_name)], limit=1)
                if not tag:
                    tag = env['crm.tag'].create({'name': tag_name})
                
                if not existing_lead:
                    new_lead.write({'tag_ids': [(4, tag.id)]})
        
        return {"status": "success", "message": f"Lead created for {company_name}"}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}


# =================================================================
# SETUP INSTRUCTIONS FOR ODOO WEBHOOK
# =================================================================

"""
SETUP STEPS:

1. Create Webhook Controller in Odoo:

Create a new file: addons/your_module/controllers/webhook.py

from odoo import http
from odoo.http import request
import json
import logging

_logger = logging.getLogger(__name__)

class WebhookController(http.Controller):
    
    @http.route('/web/hook/22c7e29b-1d45-4ec8-93cc-fe62708bddc7', 
                type='json', auth='none', methods=['POST'], csrf=False)
    def handle_lead_webhook(self, **kw):
        try:
            # Get the JSON payload
            payload = request.get_json_data()
            
            # Use the process_webhook_lead function above
            result = self.process_webhook_lead(payload)
            
            return result
            
        except Exception as e:
            _logger.error(f"Webhook error: {e}")
            return {"status": "error", "message": str(e)}
    
    def process_webhook_lead(self, payload):
        # Copy the process_webhook_lead function from above here
        pass

2. Alternative: Use Server Action

If you can't create a controller, create a Server Action:
- Go to Settings > Technical > Automation > Server Actions
- Create new action: "Process Webhook Lead"  
- Copy the process_webhook_lead function
- Call it from your webhook endpoint

3. Test the webhook:
- The scraper will now send data in the correct format
- No more _model and _id errors
- All leads will be processed correctly
"""