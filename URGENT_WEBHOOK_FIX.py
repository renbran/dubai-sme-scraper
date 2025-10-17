# ================================================================
# 🚨 URGENT: WEBHOOK FIX INSTRUCTIONS
# ================================================================

"""
ERROR ANALYSIS:
Your webhook is failing because it's using:
model.env[payload.get('_model')].browse(int(payload.get('_id')))

But our scraper sends:
{
    "Name": "Company LLC",
    "Category": "Manufacturing", 
    "Phone": "+971501234567",
    "Email": "info@company.ae"
}

There are NO _model or _id fields!
"""

# ================================================================
# 🔧 IMMEDIATE FIX STEPS
# ================================================================

"""
STEP 1: Go to your Odoo instance
1. Open https://scholarixglobal.com
2. Login as administrator
3. Go to Settings > Technical > Automation > Webhooks
4. Find webhook with ID: 22c7e29b-1d45-4ec8-93cc-fe62708bddc7

STEP 2: Fix the record_getter field
CURRENT (WRONG):
model.env[payload.get('_model')].browse(int(payload.get('_id')))

CHANGE TO (CORRECT):
env['crm.lead']

OR LEAVE EMPTY/BLANK

STEP 3: Configure the webhook action
Set the webhook to create a new CRM lead with these field mappings:

WEBHOOK FIELD    →    ODOO FIELD
=============         ===========
Name             →    name (lead name)  
Name             →    partner_name (company name)
Phone            →    phone
Email            →    email_from
Website          →    website  
Address          →    street
Category         →    description (part of)
Priority         →    priority

DEFAULT VALUES:
city = "Dubai"
type = "opportunity"
"""

# ================================================================
# 🧪 TEST DATA TO USE
# ================================================================

test_webhook_data = {
    "Name": "Arwani Trading Company L.L.C",
    "Category": "Industrial Equipment Supplier",
    "Phone": "04 282 8223",
    "Email": "leads@arwani.ae", 
    "Website": "http://www.arwani.ae/",
    "Address": "Ground Floor Lootah Building Street, Airport Road, Al Garhoud, Dubai",
    "Priority": "URGENT",
    "Quality Score": "10",
    "Data Source": "Google Maps Scraper",
    "Search Term": "manufacturing companies Dubai",
    "Timestamp": "2025-10-15T09:10:27.933Z"
}

# ================================================================
# 🎯 EXPECTED RESULT IN ODOO CRM
# ================================================================

expected_crm_result = {
    "name": "Arwani Trading Company L.L.C - Dubai SME Lead",
    "partner_name": "Arwani Trading Company L.L.C",
    "phone": "04 282 8223",
    "email_from": "leads@arwani.ae",
    "website": "http://www.arwani.ae/",
    "street": "Ground Floor Lootah Building Street, Airport Road, Al Garhoud, Dubai", 
    "city": "Dubai",
    "type": "opportunity",
    "priority": "3",  # URGENT = 3
    "description": "Dubai SME Lead - Industrial Equipment Supplier\n\nCompany: Arwani Trading Company L.L.C\nCategory: Industrial Equipment Supplier\nQuality Score: 10/10\nPriority: URGENT\n..."
}

print("🚨 URGENT: Fix the webhook record_getter field!")
print("📋 Follow the steps above to fix the webhook configuration")
print("🧪 Use the test data to verify the fix works")
print("✅ Once fixed, leads will appear in your Odoo CRM immediately!")