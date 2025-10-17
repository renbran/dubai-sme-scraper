# ====================================================================
# COPY-PASTE CODE FOR ODOO SERVER ACTION
# Go to Settings > Technical > Automation > Server Actions
# Create new action and paste this code in Python Code field
# ====================================================================

# Dubai SME Lead Processor - Simple Version
# This code processes incoming leads and creates partners + CRM opportunities

# Sample lead data (this represents what you'll receive)
sample_leads = [
    {
        'Name': 'ABC Trading LLC',
        'Category': 'Trading Companies', 
        'Phone': '+971501234567',
        'Email': 'info@abctrading.ae',
        'Website': 'https://abctrading.ae',
        'Address': 'Dubai Investment Park, Dubai',
        'Priority': 'HIGH',
        'Quality Score': '9'
    },
    {
        'Name': 'XYZ Manufacturing Co',
        'Category': 'Manufacturing',
        'Phone': '+971502345678', 
        'Email': 'contact@xyzmanuf.com',
        'Website': 'https://xyzmanuf.com',
        'Address': 'Jebel Ali Industrial Area, Dubai',
        'Priority': 'URGENT',
        'Quality Score': '10'
    },
    {
        'Name': 'Dubai Tech Solutions',
        'Category': 'IT Services',
        'Phone': 'Contact via website',
        'Email': 'hello@dubaitech.ae', 
        'Website': 'https://dubaitech.ae',
        'Address': 'Dubai Internet City, Dubai',
        'Priority': 'MEDIUM',
        'Quality Score': '7'
    }
]

# Process each lead
for lead_data in sample_leads:
    
    # Get lead information
    company_name = lead_data.get('Name', 'Unknown Company')
    company_phone = lead_data.get('Phone', '')
    company_email = lead_data.get('Email', '')
    company_website = lead_data.get('Website', '')
    company_address = lead_data.get('Address', '')
    company_category = lead_data.get('Category', 'Business Services')
    company_priority = lead_data.get('Priority', 'MEDIUM')
    quality_score = lead_data.get('Quality Score', '5')
    
    # Clean up contact fields
    if company_phone in ['Contact via website', 'Not available', '']:
        company_phone = False
    if company_email in ['Not available', '']:
        company_email = False  
    if company_website in ['Not available', '']:
        company_website = False
        
    # Step 1: Find or create partner (company)
    partner = env['res.partner'].search([('name', '=', company_name)], limit=1)
    
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
    
    # Step 2: Set priority for lead
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

Contact Information:
Phone: {lead_data.get('Phone', 'N/A')}
Email: {lead_data.get('Email', 'N/A')}
Website: {lead_data.get('Website', 'N/A')}
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

Source: Dubai SME Scraper
Created: {fields.Datetime.now()}
"""

    # Step 4: Check if lead already exists
    existing_lead = env['crm.lead'].search([
        ('partner_id', '=', partner.id),
        ('name', 'ilike', company_name)
    ], limit=1)
    
    if existing_lead:
        # Update existing lead
        existing_lead.write({
            'description': existing_lead.description + '\n\n--- UPDATED FROM DUBAI SME SCRAPER ---\n' + lead_description,
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
    
    # Step 5: Create and assign tags
    tag_names = ['Dubai SME', company_category, 'ERP Potential', 'High Priority']
    
    for tag_name in tag_names:
        if tag_name:
            # Find existing tag
            tag = env['crm.tag'].search([('name', '=', tag_name)], limit=1)
            if not tag:
                # Create new tag
                tag = env['crm.tag'].create({'name': tag_name})
            
            # Add tag to lead (if we created a new lead)
            if not existing_lead:
                new_lead.write({'tag_ids': [(4, tag.id)]})


# ====================================================================
# 🚀 WEBHOOK HANDLER - COPY THIS TO YOUR ODOO WEBHOOK
# ====================================================================

def process_webhook_lead(payload):
    """
    COPY THIS FUNCTION TO YOUR ODOO WEBHOOK HANDLER
    This processes data from our Google Maps scraper
    """
    
    # Get data from webhook payload (NOT _model and _id)
    lead_info = {
        'Name': payload.get('Name', 'Unknown Company'),
        'Category': payload.get('Category', 'Business Services'),
        'Phone': payload.get('Phone', ''), 
        'Email': payload.get('Email', ''),
        'Website': payload.get('Website', ''),
        'Address': payload.get('Address', ''),
        'Priority': payload.get('Priority', 'MEDIUM'),
        'Quality Score': payload.get('Quality Score', '5')
    }
    
    # Clean up contact fields
    if lead_info['Phone'] in ['Contact via website', 'Not available', '']:
        lead_info['Phone'] = False
    if lead_info['Email'] in ['Not available', '']:
        lead_info['Email'] = False
    if lead_info['Website'] in ['Not available', '']:
        lead_info['Website'] = False
    
    # Create partner
    partner = env['res.partner'].create({
        'name': lead_info['Name'],
        'phone': lead_info['Phone'],
        'email': lead_info['Email'],
        'website': lead_info['Website'], 
        'street': lead_info['Address'],
        'city': 'Dubai',
        'is_company': True
    })
    
    # Set priority
    priority_map = {'LOW': '0', 'MEDIUM': '1', 'HIGH': '2', 'URGENT': '3'}
    lead_priority = priority_map.get(lead_info['Priority'], '1')
    
    # Create lead
    lead = env['crm.lead'].create({
        'name': lead_info['Name'] + ' - Dubai SME Lead',
        'partner_id': partner.id,
        'type': 'opportunity',
        'phone': lead_info['Phone'],
        'email_from': lead_info['Email'],
        'website': lead_info['Website'],
        'street': lead_info['Address'],
        'city': 'Dubai',
        'description': f"Category: {lead_info['Category']}\nPriority: {lead_info['Priority']}\nQuality: {lead_info['Quality Score']}/10\nSource: Google Maps Scraper\nTimestamp: {payload.get('Timestamp', '')}",
        'priority': lead_priority
    })
    
    # Create tags
    tag_names = ['Dubai SME', lead_info['Category'], 'Google Maps', 'ERP Potential']
    for tag_name in tag_names:
        if tag_name:
            tag = env['crm.tag'].search([('name', '=', tag_name)], limit=1)
            if not tag:
                tag = env['crm.tag'].create({'name': tag_name})
            lead.write({'tag_ids': [(4, tag.id)]})
    
    return {"status": "success", "message": f"Lead created for {lead_info['Name']}"}

# ====================================================================
# ALTERNATIVE: SINGLE LEAD PROCESSOR
# Use this if you want to process one lead at a time
# ====================================================================

# Single lead processor
def process_single_lead():
    
    # Single lead data (modify as needed)
    lead_info = {
        'Name': 'Test Company LLC',
        'Category': 'Business Services',
        'Phone': '+971501234567', 
        'Email': 'test@company.ae',
        'Website': 'https://testcompany.ae',
        'Address': 'Business Bay, Dubai',
        'Priority': 'HIGH'
    }
    
    # Create partner
    partner = env['res.partner'].create({
        'name': lead_info['Name'],
        'phone': lead_info['Phone'],
        'email': lead_info['Email'],
        'website': lead_info['Website'], 
        'street': lead_info['Address'],
        'city': 'Dubai',
        'is_company': True
    })
    
    # Create lead
    lead = env['crm.lead'].create({
        'name': lead_info['Name'] + ' - SME Lead',
        'partner_id': partner.id,
        'type': 'opportunity',
        'phone': lead_info['Phone'],
        'email_from': lead_info['Email'],
        'description': f"Category: {lead_info['Category']}\nPriority: {lead_info['Priority']}\nSource: Dubai SME Scraper",
        'priority': '2'  # High priority
    })
    
    # Create tag
    tag = env['crm.tag'].search([('name', '=', 'Dubai SME')], limit=1)
    if not tag:
        tag = env['crm.tag'].create({'name': 'Dubai SME'})
    
    # Add tag to lead
    lead.write({'tag_ids': [(4, tag.id)]})

# Uncomment to run single lead processor
# process_single_lead()


# ====================================================================
# CSV IMPORT VERSION
# Use this to import from CSV data
# ====================================================================

# CSV lead processor
def process_csv_leads():
    
    # CSV data as string (one lead per line)
    csv_data = """ABC Trading LLC,Trading,+971501111111,info@abc.ae,https://abc.ae,Dubai Investment Park
XYZ Manufacturing,Manufacturing,+971502222222,contact@xyz.com,https://xyz.com,Jebel Ali Industrial
Dubai Services,Services,+971503333333,hello@services.ae,https://services.ae,Business Bay"""
    
    # Process each line
    for line in csv_data.split('\n'):
        if line.strip():
            parts = line.split(',')
            if len(parts) >= 6:
                name = parts[0]
                category = parts[1] 
                phone = parts[2]
                email = parts[3]
                website = parts[4]
                address = parts[5]
                
                # Create partner
                partner = env['res.partner'].create({
                    'name': name,
                    'phone': phone,
                    'email': email,
                    'website': website,
                    'street': address,
                    'city': 'Dubai',
                    'is_company': True
                })
                
                # Create lead
                lead = env['crm.lead'].create({
                    'name': name + ' - CSV Import',
                    'partner_id': partner.id,
                    'description': f"Category: {category}\nImported from CSV\nERP/Automation potential"
                })

# Uncomment to run CSV processor  
# process_csv_leads()


# ====================================================================
# INSTRUCTIONS FOR SETUP
# ====================================================================

"""
SETUP STEPS:

1. Login to your Odoo instance
2. Go to Settings > Technical > Automation > Server Actions  
3. Click "Create"
4. Fill in:
   - Name: Dubai SME Lead Processor
   - Model: Server Actions (ir.actions.server)
   - Action Type: Execute Python Code
5. Copy the main code above (from sample_leads = [...] to the end of the loop)
6. Paste into Python Code field
7. Click "Save"
8. Click "Run" to execute

The code will:
✓ Create companies as partners
✓ Create CRM leads/opportunities  
✓ Set proper priorities
✓ Add relevant tags
✓ Include detailed descriptions
✓ Handle duplicates

WEBHOOK ENDPOINT: /web/hook/1342d838-a97c-466c-99f1-8ae3222f38ce

To receive leads automatically, you'll need to create a webhook controller
or use Odoo's built-in webhook features.
"""