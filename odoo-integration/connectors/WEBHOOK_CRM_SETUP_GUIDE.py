# ================================================================
# 🚀 WEBHOOK_CRM CONFIGURATION GUIDE
# ================================================================

"""
✅ GOOD NEWS: webhook_crm module is working (no more 404 errors)
❌ ISSUE: 500 error means field mapping needs configuration

Follow these steps to configure webhook_crm properly:
"""

# ================================================================
# STEP 1: ACCESS WEBHOOK_CRM CONFIGURATION
# ================================================================

"""
1. Go to your Odoo instance
2. Navigate to one of these locations:
   - Apps > Search "webhook" > Webhook CRM > Configure
   - Settings > Technical > Automation > Webhooks
   - CRM > Configuration > Webhooks
   - Or check the module settings directly

3. Look for webhook configuration with URL ending in:
   22c7e29b-1d45-4ec8-93cc-fe62708bddc7
"""

# ================================================================
# STEP 2: CONFIGURE FIELD MAPPING
# ================================================================

"""
Set up field mapping to handle our Google Maps scraper data:

OUR SCRAPER SENDS          →    ODOO CRM FIELD
=================               ===============
Name                       →    name (Lead Name)
Name                       →    partner_name (Company Name)
Phone                      →    phone
Email                      →    email_from  
Website                    →    website
Address                    →    street
Category                   →    description (part of)
Priority                   →    priority
Quality Score              →    description (part of)

PRIORITY MAPPING:
LOW → 0, MEDIUM → 1, HIGH → 2, URGENT → 3
"""

# ================================================================
# STEP 3: WEBHOOK_CRM JSON CONFIGURATION
# ================================================================

webhook_crm_json_config = {
    "webhook_url": "/web/hook/22c7e29b-1d45-4ec8-93cc-fe62708bddc7",
    "model": "crm.lead",
    "method": "create", 
    "field_mapping": {
        "Name": "partner_name",
        "Phone": "phone", 
        "Email": "email_from",
        "Website": "website",
        "Address": "street"
    },
    "default_values": {
        "city": "Dubai",
        "type": "opportunity",
        "user_id": 1
    },
    "preprocessing": {
        "clean_phone": True,
        "clean_email": True,
        "set_priority": True
    }
}

# ================================================================
# STEP 4: CUSTOM PREPROCESSING (if webhook_crm supports it)
# ================================================================

"""
If webhook_crm allows custom preprocessing, add this code:
"""

def preprocess_google_maps_data(data):
    """
    Preprocess Google Maps scraper data before creating CRM lead
    """
    
    # Clean contact fields
    if data.get('Phone') in ['Contact via website', 'Not available', '']:
        data['Phone'] = False
    if data.get('Email') in ['Not available', '']:
        data['Email'] = False
    if data.get('Website') in ['Not available', '']:
        data['Website'] = False
    
    # Set priority
    priority_map = {'LOW': '0', 'MEDIUM': '1', 'HIGH': '2', 'URGENT': '3'}
    if 'Priority' in data:
        data['priority'] = priority_map.get(data['Priority'].upper(), '1')
    
    # Create lead name
    company_name = data.get('Name', 'Unknown Company')
    data['name'] = f"{company_name} - Dubai SME Lead"
    
    # Create description
    description = f"""Dubai SME Lead - {data.get('Category', 'Business')}

Company: {company_name}
Category: {data.get('Category', 'N/A')}
Quality Score: {data.get('Quality Score', 'N/A')}/10
Priority: {data.get('Priority', 'N/A')}
Search Term: {data.get('Search Term', 'N/A')}

Contact Information:
Phone: {data.get('Phone', 'N/A')}
Email: {data.get('Email', 'N/A')}
Website: {data.get('Website', 'N/A')}
Address: {data.get('Address', 'N/A')}

Business Potential:
• ERP Implementation Ready
• Automation & AI Potential  
• Digital Transformation Candidate
• SME Scaling Opportunities

Source: Google Maps Scraper
Timestamp: {data.get('Timestamp', '')}
"""
    
    data['description'] = description
    
    return data

# ================================================================
# STEP 5: SIMPLE WEBHOOK_CRM SETUP (Alternative)
# ================================================================

"""
If webhook_crm is too complex, create a simple webhook receiver:

1. Go to Settings > Technical > Automation > Server Actions
2. Create new Server Action:
   - Name: "Process Google Maps Leads"  
   - Model: Server Actions (ir.actions.server)
   - Action Type: Execute Python Code
   
3. Copy this code:
"""

simple_webhook_handler = '''
# Simple webhook handler for Google Maps scraper
import json

# Get webhook payload (this depends on how webhook_crm passes data)
# You might need to adjust this based on webhook_crm's implementation
payload = json.loads(request.httprequest.data.decode('utf-8'))

# Extract data
company_name = payload.get('Name', 'Unknown Company')
phone = payload.get('Phone', '')
email = payload.get('Email', '')
website = payload.get('Website', '')
address = payload.get('Address', '')
category = payload.get('Category', 'Business Services')
priority = payload.get('Priority', 'MEDIUM')

# Clean data
if phone in ['Contact via website', 'Not available', '']:
    phone = False
if email in ['Not available', '']:
    email = False
if website in ['Not available', '']:
    website = False

# Create partner
partner = env['res.partner'].create({
    'name': company_name,
    'phone': phone,
    'email': email,
    'website': website,
    'street': address,
    'city': 'Dubai',
    'is_company': True
})

# Set priority
priority_map = {'LOW': '0', 'MEDIUM': '1', 'HIGH': '2', 'URGENT': '3'}
lead_priority = priority_map.get(priority.upper(), '1')

# Create lead
lead = env['crm.lead'].create({
    'name': company_name + ' - Dubai SME Lead',
    'partner_id': partner.id,
    'type': 'opportunity',
    'phone': phone,
    'email_from': email,
    'website': website,
    'street': address,
    'city': 'Dubai',
    'priority': lead_priority,
    'description': f"Category: {category}\\nSource: Google Maps Scraper"
})

# Return success
return {"status": "success", "lead_id": lead.id}
'''

print("✅ Webhook_CRM configuration guide created!")
print("📋 Follow the steps above to configure field mapping")
print("🔧 The 500 error will be fixed once field mapping is set up correctly")