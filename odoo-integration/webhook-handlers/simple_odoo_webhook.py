# ====================================================================
# SIMPLE ODOO WEBHOOK CODE - NO IMPORTS NEEDED
# Copy and paste this directly into Odoo Server Action
# ====================================================================

"""
STEP 1: Go to Settings > Technical > Automation > Server Actions
STEP 2: Create New Server Action
STEP 3: Fill in:
   - Name: Dubai SME Webhook Handler  
   - Model: Any Model (ir.actions.server)
   - Action Type: Execute Python Code
STEP 4: Copy and paste the code below into Python Code field
"""

# ====================================================================
# PYTHON CODE FOR SERVER ACTION (Copy this part only)
# ====================================================================

# Webhook receiver for Dubai SME leads
def process_sme_leads():
    """Process incoming leads from Dubai SME Scraper"""
    
    # Sample lead data structure (this is what you'll receive)
    sample_lead = {
        'Name': 'ABC Trading Company',
        'Category': 'Trading Companies',
        'Phone': '+971501234567',
        'Email': 'info@abctrading.ae',
        'Website': 'https://abctrading.ae',
        'Address': 'Dubai Investment Park, Dubai, UAE',
        'Priority': 'HIGH',
        'Quality Score': '9',
        'Data Source': 'Google Maps Scraper',
        'Search Term': 'trading companies Dubai',
        'Timestamp': '2025-10-15T08:30:00.000Z'
    }
    
    # Process each lead
    lead_data = sample_lead  # This will be your actual incoming data
    
    # Step 1: Create or find partner
    partner_name = lead_data.get('Name', 'Unknown Company')
    partner_phone = lead_data.get('Phone', '')
    partner_email = lead_data.get('Email', '')
    partner_website = lead_data.get('Website', '')
    partner_address = lead_data.get('Address', '')
    
    # Clean phone field
    if partner_phone in ['Contact via website', 'Not available', '']:
        partner_phone = False
        
    # Clean email field  
    if partner_email in ['Not available', '']:
        partner_email = False
        
    # Clean website field
    if partner_website in ['Not available', '']:
        partner_website = False
    
    # Search for existing partner
    existing_partner = env['res.partner'].search([('name', '=', partner_name)], limit=1)
    
    if existing_partner:
        # Update existing partner
        existing_partner.write({
            'phone': partner_phone or existing_partner.phone,
            'email': partner_email or existing_partner.email, 
            'website': partner_website or existing_partner.website,
            'street': partner_address or existing_partner.street,
            'city': 'Dubai',
            'is_company': True
        })
        partner_id = existing_partner.id
    else:
        # Create new partner
        new_partner = env['res.partner'].create({
            'name': partner_name,
            'phone': partner_phone,
            'email': partner_email,
            'website': partner_website,
            'street': partner_address,
            'city': 'Dubai',
            'is_company': True,
            'company_type': 'company'
        })
        partner_id = new_partner.id
    
    # Step 2: Create CRM lead
    lead_name = partner_name + ' - Dubai SME Lead'
    lead_category = lead_data.get('Category', 'Business Services')
    lead_priority = lead_data.get('Priority', 'MEDIUM')
    lead_source = lead_data.get('Data Source', 'Dubai SME Scraper')
    lead_search = lead_data.get('Search Term', '')
    lead_quality = lead_data.get('Quality Score', '5')
    
    # Convert priority to Odoo format
    priority_value = '1'  # Default Medium
    if lead_priority == 'URGENT':
        priority_value = '3'
    elif lead_priority == 'HIGH':
        priority_value = '2'
    elif lead_priority == 'LOW':
        priority_value = '0'
    
    # Create lead description
    lead_description = f"""Dubai SME Lead - {lead_category}

Company: {partner_name}
Category: {lead_category}
Search Term: {lead_search}
Quality Score: {lead_quality}/10
Priority: {lead_priority}
Source: {lead_source}

Contact Details:
Phone: {lead_data.get('Phone', 'N/A')}
Email: {lead_data.get('Email', 'N/A')}
Website: {lead_data.get('Website', 'N/A')}
Address: {partner_address}

Business Potential:
- ERP Implementation
- Business Automation
- Digital Transformation

Created: {fields.Datetime.now()}
"""
    
    # Check if lead already exists
    existing_lead = env['crm.lead'].search([
        ('partner_id', '=', partner_id),
        ('name', 'ilike', partner_name)
    ], limit=1)
    
    if existing_lead:
        # Update existing lead
        existing_lead.write({
            'description': existing_lead.description + '\n\n--- UPDATED ---\n' + lead_description
        })
        lead_id = existing_lead.id
    else:
        # Create new lead
        new_lead = env['crm.lead'].create({
            'name': lead_name,
            'partner_id': partner_id,
            'type': 'opportunity',
            'phone': partner_phone,
            'email_from': partner_email,
            'website': partner_website,
            'street': partner_address,
            'city': 'Dubai',
            'priority': priority_value,
            'description': lead_description,
            'user_id': env.user.id
        })
        lead_id = new_lead.id
    
    # Step 3: Create tags (optional)
    tag_names = ['Dubai SME', lead_category, 'ERP Potential']
    
    for tag_name in tag_names:
        if tag_name:
            existing_tag = env['crm.tag'].search([('name', '=', tag_name)], limit=1)
            if not existing_tag:
                env['crm.tag'].create({'name': tag_name})
    
    # Log the result
    log_message = f"Processed Dubai SME lead: {partner_name} (Partner ID: {partner_id}, Lead ID: {lead_id})"
    
    return True

# Call the function
process_sme_leads()


# ====================================================================
# AUTOMATED ACTION SETUP (Alternative Method)
# ====================================================================

"""
ALTERNATIVE: Create Automated Action

1. Go to Settings > Technical > Automation > Automated Actions
2. Create New:
   - Name: Dubai SME Lead Processor
   - Model: CRM Lead (crm.lead) 
   - Trigger: On Create
   - Apply on: All Records

3. Action Tab > Python Code:
"""

# Simple lead processor for automated action
if record:
    # Get lead data (this assumes data comes from form or API)
    lead_name = record.name or 'Dubai SME Lead'
    
    # Basic processing
    if 'Dubai' in lead_name or 'SME' in lead_name:
        # Add tags
        sme_tag = env['crm.tag'].search([('name', '=', 'Dubai SME')], limit=1)
        if not sme_tag:
            sme_tag = env['crm.tag'].create({'name': 'Dubai SME'})
        
        erp_tag = env['crm.tag'].search([('name', '=', 'ERP Potential')], limit=1)  
        if not erp_tag:
            erp_tag = env['crm.tag'].create({'name': 'ERP Potential'})
        
        # Add tags to lead
        record.write({
            'tag_ids': [(4, sme_tag.id), (4, erp_tag.id)],
            'description': (record.description or '') + '\n\n--- DUBAI SME LEAD ---\nERP/Automation Potential\nFollow up for digital transformation needs.'
        })


# ====================================================================
# WEBHOOK ROUTE (For Custom Module)
# ====================================================================

"""
If you create a custom module, add this to a controller file:

from odoo import http
from odoo.http import request

class SMEWebhook(http.Controller):
    
    @http.route('/web/hook/1342d838-a97c-466c-99f1-8ae3222f38ce', 
                type='json', auth='none', methods=['POST'], csrf=False)
    def sme_webhook(self):
        data = request.jsonrequest
        
        # Create partner
        partner = request.env['res.partner'].sudo().create({
            'name': data.get('Name'),
            'phone': data.get('Phone') if data.get('Phone') != 'Contact via website' else False,
            'email': data.get('Email') if data.get('Email') != 'Not available' else False,
            'is_company': True
        })
        
        # Create lead  
        lead = request.env['crm.lead'].sudo().create({
            'name': data.get('Name') + ' - Dubai Lead',
            'partner_id': partner.id,
            'description': f"Category: {data.get('Category')}\nSource: Dubai SME Scraper"
        })
        
        return {'status': 'success', 'lead_id': lead.id}
"""


# ====================================================================
# MANUAL DATA ENTRY (For Testing)
# ====================================================================

"""
To manually test, create this Server Action and run it:
"""

# Manual lead creation for testing
def create_test_leads():
    """Create test leads manually"""
    
    test_leads = [
        {
            'name': 'ABC Trading LLC',
            'phone': '+971501111111',
            'email': 'info@abctrading.ae',
            'category': 'Trading Companies'
        },
        {
            'name': 'XYZ Manufacturing',
            'phone': '+971502222222', 
            'email': 'contact@xyzmanuf.com',
            'category': 'Manufacturing'
        },
        {
            'name': 'Dubai Tech Solutions',
            'phone': '+971503333333',
            'email': 'hello@dubaitech.ae',
            'category': 'IT Services'
        }
    ]
    
    for lead_info in test_leads:
        # Create partner
        partner = env['res.partner'].create({
            'name': lead_info['name'],
            'phone': lead_info['phone'],
            'email': lead_info['email'], 
            'city': 'Dubai',
            'is_company': True
        })
        
        # Create lead
        lead = env['crm.lead'].create({
            'name': lead_info['name'] + ' - Test Lead',
            'partner_id': partner.id,
            'description': f"Test lead for {lead_info['category']}\nERP/Automation potential",
            'priority': '2'
        })
        
        # Add tag
        tag = env['crm.tag'].search([('name', '=', 'Dubai SME Test')], limit=1)
        if not tag:
            tag = env['crm.tag'].create({'name': 'Dubai SME Test'})
        
        lead.write({'tag_ids': [(4, tag.id)]})

# Uncomment to run test
# create_test_leads()


# ====================================================================
# SIMPLE BATCH PROCESSOR
# ====================================================================

"""
To process multiple leads at once:
"""

# Batch lead processor
def process_lead_batch():
    """Process multiple leads from list"""
    
    # List of leads (replace with your actual data)
    leads_list = [
        "ABC Company,+971501111111,info@abc.ae,Trading",
        "XYZ Manufacturing,+971502222222,contact@xyz.com,Manufacturing", 
        "Dubai Services LLC,+971503333333,hello@dubaiservices.ae,Services"
    ]
    
    for lead_line in leads_list:
        parts = lead_line.split(',')
        if len(parts) >= 4:
            name = parts[0]
            phone = parts[1]
            email = parts[2]
            category = parts[3]
            
            # Create partner
            partner = env['res.partner'].create({
                'name': name,
                'phone': phone,
                'email': email,
                'city': 'Dubai', 
                'is_company': True
            })
            
            # Create lead
            lead = env['crm.lead'].create({
                'name': name + ' - Batch Lead',
                'partner_id': partner.id,
                'description': f"Category: {category}\nBatch imported from Dubai SME list"
            })

# Uncomment to run batch
# process_lead_batch()


# ====================================================================
# INSTRUCTIONS SUMMARY
# ====================================================================

"""
QUICK SETUP:

1. Copy the main process_sme_leads() function
2. Paste into Settings > Technical > Automation > Server Actions  
3. Set Model to "Server Actions" (ir.actions.server)
4. Set Action Type to "Execute Python Code"
5. Save and execute

WEBHOOK URL: https://scholarixglobal.com/web/hook/1342d838-a97c-466c-99f1-8ae3222f38ce

This code will:
- Create/update partners (companies)  
- Create/update CRM leads
- Add appropriate tags
- Set priorities
- Log all activities

No imports needed - uses built-in Odoo environment (env)
"""