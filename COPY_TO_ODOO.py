# ====================================================================
# FINAL VERSION - COPY THIS CODE INTO ODOO SERVER ACTION
# ====================================================================

# Process list of leads from Dubai SME Scraper
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

for lead_data in sample_leads:
    
    company_name = lead_data.get('Name', 'Unknown Company')
    company_phone = lead_data.get('Phone', '')
    company_email = lead_data.get('Email', '')
    company_website = lead_data.get('Website', '')
    company_address = lead_data.get('Address', '')
    company_category = lead_data.get('Category', 'Business Services')
    company_priority = lead_data.get('Priority', 'MEDIUM')
    quality_score = lead_data.get('Quality Score', '5')
    
    if company_phone in ['Contact via website', 'Not available', '']:
        company_phone = False
    if company_email in ['Not available', '']:
        company_email = False  
    if company_website in ['Not available', '']:
        company_website = False
        
    partner = env['res.partner'].search([('name', '=', company_name)], limit=1)
    
    if partner:
        partner.write({
            'phone': company_phone or partner.phone,
            'email': company_email or partner.email,
            'website': company_website or partner.website,
            'street': company_address or partner.street,
            'city': 'Dubai',
            'is_company': True
        })
    else:
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
    
    lead_priority = '1'
    if company_priority == 'URGENT':
        lead_priority = '3'
    elif company_priority == 'HIGH':
        lead_priority = '2'
    elif company_priority == 'LOW':
        lead_priority = '0'
    
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

    existing_lead = env['crm.lead'].search([
        ('partner_id', '=', partner.id),
        ('name', 'ilike', company_name)
    ], limit=1)
    
    if existing_lead:
        existing_lead.write({
            'description': existing_lead.description + '\n\n--- UPDATED ---\n' + lead_description,
            'priority': lead_priority
        })
        current_lead = existing_lead
    else:
        current_lead = env['crm.lead'].create({
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
    
    tag_names = ['Dubai SME', company_category, 'ERP Potential']
    
    for tag_name in tag_names:
        if tag_name:
            tag = env['crm.tag'].search([('name', '=', tag_name)], limit=1)
            if not tag:
                tag = env['crm.tag'].create({'name': tag_name})
            current_lead.write({'tag_ids': [(4, tag.id)]})

# ====================================================================
# SETUP INSTRUCTIONS:
# 1. Go to Settings > Technical > Automation > Server Actions
# 2. Create New Action
# 3. Name: Dubai SME Lead Processor  
# 4. Model: Server Actions (ir.actions.server)
# 5. Action Type: Execute Python Code
# 6. Copy the code above into Python Code field
# 7. Save and Run
# ====================================================================