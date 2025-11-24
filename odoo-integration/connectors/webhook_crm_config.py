# ================================================================
# 🚀 WEBHOOK_CRM MODULE CONFIGURATION
# ================================================================

"""
GREAT! You installed webhook_crm module.
Now we need to configure it to handle our Google Maps scraper data.

Our scraper sends this data format:
{
    "Name": "Company LLC",
    "Category": "Manufacturing", 
    "Phone": "+971501234567",
    "Email": "info@company.ae",
    "Website": "https://company.ae",
    "Address": "Dubai Investment Park",
    "Priority": "HIGH",
    "Quality Score": "9",
    "Data Source": "Google Maps Scraper",
    "Search Term": "manufacturing companies",
    "Timestamp": "2025-10-15T08:30:15.123Z"
}
"""

# ================================================================
# STEP 1: CONFIGURE WEBHOOK_CRM MODULE
# ================================================================

"""
🔧 CONFIGURATION STEPS:

1. Go to your Odoo instance
2. Navigate to: CRM > Configuration > Webhooks (or Settings > Technical > Webhooks)
3. Create a new webhook with these settings:

WEBHOOK SETTINGS:
- Name: "Dubai SME Lead Webhook"
- URL Path: /web/hook/22c7e29b-1d45-4ec8-93cc-fe62708bddc7
- Model: crm.lead (CRM Lead)
- Method: CREATE
- Active: ✓ Enabled

FIELD MAPPING:
Map our scraper fields to Odoo CRM fields:

name → Name (lead name)
partner_name → Name (company name)  
phone → Phone
email_from → Email
website → Website
street → Address
description → Description (auto-generated)
priority → Priority
stage_id → Default stage
user_id → Assigned user
"""

# ================================================================
# STEP 2: FIELD MAPPING CONFIGURATION
# ================================================================

webhook_field_mapping = {
    # Our Scraper Field → Odoo CRM Field
    "Name": "partner_name",           # Company name
    "Phone": "phone",                 # Phone number
    "Email": "email_from",            # Email address
    "Website": "website",             # Website URL
    "Address": "street",              # Street address
    "Category": "description",        # Will be part of description
    "Priority": "priority",           # Lead priority
    "Quality Score": "description",   # Will be part of description
    "Search Term": "description",     # Will be part of description
    "Timestamp": "description"        # Will be part of description
}

# ================================================================
# STEP 3: WEBHOOK HANDLER CODE (if needed)
# ================================================================

"""
If webhook_crm module doesn't automatically handle the mapping,
you may need to customize the webhook handler.

Add this code to handle our specific data format:
"""

def process_google_maps_lead(data):
    """
    Custom processor for Google Maps scraper data
    Add this to your webhook_crm configuration
    """
    
    # Extract and clean data
    company_name = data.get('Name', 'Unknown Company')
    phone = data.get('Phone', '')
    email = data.get('Email', '')
    website = data.get('Website', '')
    address = data.get('Address', '')
    category = data.get('Category', 'Business Services')
    priority = data.get('Priority', 'MEDIUM')
    quality_score = data.get('Quality Score', '5')
    search_term = data.get('Search Term', '')
    timestamp = data.get('Timestamp', '')
    
    # Clean up contact fields
    if phone in ['Contact via website', 'Not available', '']:
        phone = False
    if email in ['Not available', '']:
        email = False
    if website in ['Not available', '']:
        website = False
    
    # Set priority value
    priority_map = {'LOW': '0', 'MEDIUM': '1', 'HIGH': '2', 'URGENT': '3'}
    lead_priority = priority_map.get(priority.upper(), '1')
    
    # Create description
    description = f"""Dubai SME Lead - {category}

Company: {company_name}
Category: {category}
Quality Score: {quality_score}/10
Priority: {priority}
Search Term: {search_term}

Contact Information:
Phone: {data.get('Phone', 'N/A')}
Email: {data.get('Email', 'N/A')}
Website: {data.get('Website', 'N/A')}
Address: {address}

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
Timestamp: {timestamp}
"""

    # Return processed data for Odoo CRM
    return {
        'name': f"{company_name} - Dubai SME Lead",
        'partner_name': company_name,
        'phone': phone,
        'email_from': email,
        'website': website,
        'street': address,
        'city': 'Dubai',
        'priority': lead_priority,
        'description': description,
        'type': 'opportunity',
        'tag_ids': [(6, 0, [])],  # Will add tags separately
    }

# ================================================================
# STEP 4: TEST THE WEBHOOK
# ================================================================

test_payload = {
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

print("✅ Webhook_CRM configuration created!")
print("📋 Follow the configuration steps above")
print("🔗 Test with the sample payload")