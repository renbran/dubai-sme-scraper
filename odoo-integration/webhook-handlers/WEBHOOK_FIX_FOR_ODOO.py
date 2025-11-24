# ================================================================
# 🔧 WEBHOOK FIX FOR ODOO - COPY THIS CODE EXACTLY
# ================================================================

"""
PROBLEM: Your current webhook code has this line:
model.env[payload.get('_model')].browse(int(payload.get('_id')))

But our scraper sends this data format:
{
    "Name": "Company LLC",
    "Category": "Manufacturing", 
    "Phone": "+971501234567",
    "Email": "info@company.ae"
}

SOLUTION: Replace your webhook handler with the code below
"""

# ================================================================
# COPY THIS CODE TO YOUR ODOO WEBHOOK HANDLER
# Replace your existing webhook code with this:
# ================================================================

def handle_incoming_lead(payload):
    """
    COPY-PASTE THIS FUNCTION TO YOUR ODOO WEBHOOK HANDLER
    Replace your current webhook code with this exact code
    """
    
    try:
        # Extract data from our scraper format
        company_name = payload.get('Name', 'Unknown Company')
        company_phone = payload.get('Phone', '')
        company_email = payload.get('Email', '')
        company_website = payload.get('Website', '')
        company_address = payload.get('Address', '')
        company_category = payload.get('Category', 'Business Services')
        company_priority = payload.get('Priority', 'MEDIUM')
        quality_score = payload.get('Quality Score', '5')
        
        # Clean up contact fields
        if company_phone in ['Contact via website', 'Not available', '']:
            company_phone = False
        if company_email in ['Not available', '']:
            company_email = False  
        if company_website in ['Not available', '']:
            company_website = False
        
        # Step 1: Create or find partner
        partner = env['res.partner'].search([('name', '=', company_name)], limit=1)
        
        if not partner:
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
        lead_priority = '1'  # Medium
        if company_priority == 'URGENT':
            lead_priority = '3'
        elif company_priority == 'HIGH':
            lead_priority = '2'
        elif company_priority == 'LOW':
            lead_priority = '0'
        
        # Step 3: Create lead
        lead_description = f"""Dubai SME Lead - {company_category}

Company: {company_name}
Category: {company_category}
Quality Score: {quality_score}/10
Priority: {company_priority}

Contact Information:
Phone: {payload.get('Phone', 'N/A')}
Email: {payload.get('Email', 'N/A')}
Website: {payload.get('Website', 'N/A')}
Address: {company_address}

Business Potential:
• ERP Implementation Ready
• Automation & AI Potential  
• Digital Transformation Candidate

Source: Google Maps Scraper
Timestamp: {payload.get('Timestamp', '')}
"""

        # Step 4: Create new lead
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
            'user_id': env.user.id if hasattr(env, 'user') else 1
        })
        
        # Step 5: Add tags
        tag_names = ['Dubai SME', company_category, 'Google Maps', 'ERP Potential']
        
        for tag_name in tag_names:
            if tag_name:
                tag = env['crm.tag'].search([('name', '=', tag_name)], limit=1)
                if not tag:
                    tag = env['crm.tag'].create({'name': tag_name})
                
                new_lead.write({'tag_ids': [(4, tag.id)]})
        
        return {"status": "success", "message": f"Lead created for {company_name}"}
        
    except Exception as e:
        import logging
        _logger = logging.getLogger(__name__)
        _logger.error(f"Webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}


# ================================================================
# SETUP INSTRUCTIONS FOR YOUR ODOO INSTANCE
# ================================================================

"""
🔧 STEP-BY-STEP SETUP:

METHOD 1: Webhook Controller (Recommended)
-----------------------------------------
1. In your Odoo, create file: addons/webhook_handler/controllers/webhook.py

2. Copy this code:

from odoo import http
from odoo.http import request
import json
import logging

_logger = logging.getLogger(__name__)

class LeadWebhookController(http.Controller):
    
    @http.route('/web/hook/22c7e29b-1d45-4ec8-93cc-fe62708bddc7', 
                type='json', auth='none', methods=['POST'], csrf=False)
    def receive_lead(self, **kw):
        try:
            payload = request.get_json_data()
            
            # Use the handle_incoming_lead function from above
            result = self.process_lead(payload)
            
            return result
            
        except Exception as e:
            _logger.error(f"Webhook error: {e}")
            return {"status": "error", "message": str(e)}
    
    def process_lead(self, payload):
        # Copy the handle_incoming_lead function from above here
        # Replace 'env' with 'request.env'
        env = request.env
        
        # Then paste the entire handle_incoming_lead function body here
        pass

METHOD 2: Server Action (Easier)
-------------------------------
1. Go to Settings > Technical > Automation > Server Actions
2. Create new action: "Process Webhook Lead"
3. Model: Server Actions (ir.actions.server)  
4. Action Type: Execute Python Code
5. Copy the handle_incoming_lead function above
6. Save and test

METHOD 3: Direct Integration
---------------------------
If you have access to your webhook endpoint code, simply replace:

OLD CODE:
model.env[payload.get('_model')].browse(int(payload.get('_id')))

NEW CODE: 
# Copy the entire handle_incoming_lead function from above
"""

# ================================================================
# TEST DATA - This is what our scraper sends
# ================================================================

sample_webhook_data = {
    "Name": "Dubai Manufacturing Test LLC",
    "Category": "Manufacturing",
    "Phone": "+971501234567",
    "Email": "test@dubaimanuf.ae", 
    "Website": "https://dubaimanuf.ae",
    "Address": "Jebel Ali Industrial Area, Dubai",
    "Priority": "HIGH",
    "Quality Score": "9",
    "Data Source": "Google Maps Scraper",
    "Search Term": "manufacturing companies",
    "Timestamp": "2025-10-15T08:30:15.123Z"
}

print("✅ Webhook fix code created!")
print("📋 Copy the handle_incoming_lead function to your Odoo webhook handler")
print("🔗 Webhook URL: https://scholarixglobal.com/web/hook/22c7e29b-1d45-4ec8-93cc-fe62708bddc7")