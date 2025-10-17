# =================================================================
# SIMPLE WEBHOOK CODE FOR ODOO UI - COPY & PASTE
# =================================================================

# Copy this EXACT code into your Odoo webhook configuration:
# URL: /web/hook/22c7e29b-1d45-4ec8-93cc-fe62708bddc7

try:
    # Get lead data from webhook payload
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
    
    # Create or find partner (company)
    partner = env['res.partner'].search([('name', '=', company_name)], limit=1)
    
    if not partner:
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
    
    # Set priority level
    lead_priority = '1'  # Medium
    if company_priority == 'URGENT':
        lead_priority = '3'
    elif company_priority == 'HIGH':
        lead_priority = '2'
    elif company_priority == 'LOW':
        lead_priority = '0'
    
    # Create lead description
    description = f'''Dubai SME Lead - {company_category}

Company: {company_name}
Category: {company_category}
Quality: {quality_score}/10
Priority: {company_priority}
Phone: {payload.get("Phone", "N/A")}
Email: {payload.get("Email", "N/A")}
Website: {payload.get("Website", "N/A")}
Address: {company_address}

Source: Google Maps Scraper
Search: {search_term}'''
    
    # Check if lead exists
    existing_lead = env['crm.lead'].search([
        ('partner_id', '=', partner.id),
        ('name', 'ilike', company_name)
    ], limit=1)
    
    if not existing_lead:
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
            'description': description,
            'user_id': env.user.id
        })
        
        # Add tags
        tag_names = ['Dubai SME', company_category, 'Google Maps']
        for tag_name in tag_names:
            if tag_name:
                tag = env['crm.tag'].search([('name', '=', tag_name)], limit=1)
                if not tag:
                    tag = env['crm.tag'].create({'name': tag_name})
                new_lead.write({'tag_ids': [(4, tag.id)]})

except Exception as e:
    raise Exception(f'Webhook error: {str(e)}')