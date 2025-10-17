# ================================================================
# 🚀 WEBHOOK_CRM MODULE CONFIGURATION FOR DUBAI SME SCRAPER
# ================================================================

"""
WEBHOOK_CRM MODULE SETUP GUIDE
Now that you have webhook_crm installed, let's configure it properly.

Current Status:
✅ webhook_crm module installed
✅ Webhook endpoint responding (no 404)
❌ Field mapping needs configuration (500 error)

Let's fix the field mapping!
"""

# ================================================================
# STEP 1: WEBHOOK_CRM CONFIGURATION IN ODOO
# ================================================================

"""
🔧 CONFIGURATION STEPS:

1. In Odoo, go to:
   - Apps > webhook_crm > Configure
   OR
   - Settings > Technical > Webhooks
   OR  
   - CRM > Configuration > Webhooks

2. Find or create webhook with URL:
   /web/hook/22c7e29b-1d45-4ec8-93cc-fe62708bddc7

3. Set these basic settings:
   - Name: "Dubai SME Lead Webhook"
   - Model: crm.lead
   - Method: create
   - Active: ✓ Enabled
"""

# ================================================================
# STEP 2: FIELD MAPPING FOR GOOGLE MAPS SCRAPER
# ================================================================

"""
Configure field mapping in webhook_crm:

OUR SCRAPER FIELD    →    ODOO CRM FIELD         →    FIELD TYPE
================          ===============             ===========
Name                 →    name                   →    Lead name (auto-generated)
Name                 →    partner_name           →    Company name  
Phone                →    phone                  →    Phone number
Email                →    email_from             →    Email address
Website              →    website                →    Website URL
Address              →    street                 →    Street address
Category             →    description            →    Part of description
Priority             →    priority               →    Lead priority (0-3)
Quality Score        →    description            →    Part of description
Search Term          →    description            →    Part of description
Timestamp            →    description            →    Part of description

DEFAULT VALUES:
city                 →    "Dubai"
type                 →    "opportunity" 
user_id              →    Current user or 1
"""

# ================================================================
# STEP 3: WEBHOOK_CRM JSON CONFIGURATION
# ================================================================

webhook_crm_config = {
    "name": "Dubai SME Lead Webhook",
    "url_path": "/web/hook/22c7e29b-1d45-4ec8-93cc-fe62708bddc7",
    "model": "crm.lead",
    "method": "create",
    "active": True,
    "field_mappings": [
        {
            "webhook_field": "Name",
            "odoo_field": "partner_name",
            "required": True
        },
        {
            "webhook_field": "Phone", 
            "odoo_field": "phone",
            "required": False
        },
        {
            "webhook_field": "Email",
            "odoo_field": "email_from", 
            "required": False
        },
        {
            "webhook_field": "Website",
            "odoo_field": "website",
            "required": False
        },
        {
            "webhook_field": "Address",
            "odoo_field": "street",
            "required": False
        }
    ],
    "default_values": {
        "city": "Dubai",
        "type": "opportunity",
        "user_id": 1
    },
    "preprocessing_rules": [
        {
            "field": "Phone",
            "rule": "clean_invalid",
            "invalid_values": ["Contact via website", "Not available", ""]
        },
        {
            "field": "Email", 
            "rule": "clean_invalid",
            "invalid_values": ["Not available", ""]
        },
        {
            "field": "Website",
            "rule": "clean_invalid", 
            "invalid_values": ["Not available", ""]
        }
    ]
}

# ================================================================
# STEP 4: CUSTOM LEAD NAME AND DESCRIPTION GENERATION
# ================================================================

"""
If webhook_crm supports custom field generation, configure:

LEAD NAME FORMULA:
{Name} + " - Dubai SME Lead"

DESCRIPTION TEMPLATE:
Dubai SME Lead - {Category}

Company: {Name}
Category: {Category}
Quality Score: {Quality Score}/10
Priority: {Priority}
Search Term: {Search Term}

Contact Information:
Phone: {Phone}
Email: {Email}
Website: {Website}
Address: {Address}

Business Potential:
• ERP Implementation Ready
• Automation & AI Potential  
• Digital Transformation Candidate
• SME Scaling Opportunities

Source: Google Maps Scraper
Timestamp: {Timestamp}
"""

# ================================================================
# STEP 5: PRIORITY MAPPING
# ================================================================

priority_mapping = {
    "webhook_field": "Priority",
    "odoo_field": "priority",
    "mapping_rules": {
        "LOW": "0",
        "MEDIUM": "1", 
        "HIGH": "2",
        "URGENT": "3"
    },
    "default": "1"
}

# ================================================================
# STEP 6: TEST DATA FOR VALIDATION
# ================================================================

test_webhook_payload = {
    "Name": "Test Manufacturing LLC",
    "Category": "Manufacturing",
    "Phone": "+971501234567",
    "Email": "test@manufacturing.ae", 
    "Website": "https://manufacturing.ae",
    "Address": "Jebel Ali Industrial Area, Dubai",
    "Priority": "HIGH",
    "Quality Score": "8",
    "Data Source": "Google Maps Scraper",
    "Search Term": "manufacturing companies dubai",
    "Timestamp": "2025-10-15T08:45:30.123Z"
}

# ================================================================
# STEP 7: EXPECTED ODOO CRM LEAD OUTPUT
# ================================================================

expected_crm_lead = {
    "name": "Test Manufacturing LLC - Dubai SME Lead",
    "partner_name": "Test Manufacturing LLC",
    "phone": "+971501234567",
    "email_from": "test@manufacturing.ae",
    "website": "https://manufacturing.ae",
    "street": "Jebel Ali Industrial Area, Dubai",
    "city": "Dubai",
    "type": "opportunity",
    "priority": "2",  # HIGH = 2
    "description": "Dubai SME Lead - Manufacturing\n\nCompany: Test Manufacturing LLC\n...",
    "user_id": 1
}

print("✅ webhook_crm configuration guide ready!")
print("🔧 Configure field mapping in your webhook_crm module")
print("🧪 Use the test payload to validate the setup")