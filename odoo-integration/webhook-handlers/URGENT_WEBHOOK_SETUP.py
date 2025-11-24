# ================================================================
# 🚨 IMMEDIATE ACTION REQUIRED - WEBHOOK_CRM SETUP
# ================================================================

"""
STATUS: webhook_crm module is installed and responding ✅
ISSUE: Field mapping not configured (500 errors) ❌
SOLUTION: Configure webhook_crm in your Odoo instance 🔧

Follow these EXACT steps:
"""

# ================================================================
# 🔧 STEP-BY-STEP WEBHOOK_CRM CONFIGURATION
# ================================================================

"""
1. LOGIN TO YOUR ODOO INSTANCE
   - Go to https://scholarixglobal.com
   - Login as administrator

2. FIND WEBHOOK_CRM CONFIGURATION
   Try these locations (in order):
   
   Option A: Apps Menu
   - Go to Apps
   - Search for "webhook"
   - Click on "webhook_crm" 
   - Click "Configure" or "Settings"
   
   Option B: Settings Menu  
   - Go to Settings
   - Look for "Webhooks" in left menu
   - Or Settings > Technical > Automation > Webhooks
   
   Option C: CRM Menu
   - Go to CRM
   - Configuration > Webhooks
   
   Option D: Developer Mode
   - Enable Developer Mode (Settings > Activate Developer Mode)
   - Settings > Technical > Webhooks

3. CREATE/EDIT WEBHOOK CONFIGURATION
   Look for webhook with this ID: 22c7e29b-1d45-4ec8-93cc-fe62708bddc7
   
   If not found, create new webhook with these settings:
"""

# ================================================================
# 🎯 WEBHOOK CONFIGURATION SETTINGS
# ================================================================

webhook_settings = {
    "name": "Dubai SME Lead Webhook",
    "url_path": "/web/hook/22c7e29b-1d45-4ec8-93cc-fe62708bddc7",
    "model": "crm.lead",
    "method": "create",
    "active": True
}

# ================================================================
# 🗺️ FIELD MAPPING (MOST IMPORTANT!)
# ================================================================

"""
Configure these field mappings in webhook_crm:

WEBHOOK FIELD (from our scraper) → ODOO FIELD (in CRM)
==========================================
Name                            → partner_name
Phone                           → phone  
Email                           → email_from
Website                         → website
Address                         → street
Priority                        → priority

DEFAULT VALUES TO SET:
===================
city        → "Dubai"
type        → "opportunity"  
user_id     → 1 (or your user ID)

PREPROCESSING RULES:
==================
- Clean Phone: Remove "Contact via website", "Not available"
- Clean Email: Remove "Not available"  
- Clean Website: Remove "Not available"
- Priority Mapping: LOW→0, MEDIUM→1, HIGH→2, URGENT→3
"""

# ================================================================
# 🧪 TEST CONFIGURATION
# ================================================================

"""
After configuring webhook_crm, test with this data:

TEST PAYLOAD:
{
    "Name": "Test Company LLC",
    "Phone": "+971501234567", 
    "Email": "test@company.ae",
    "Website": "https://company.ae",
    "Address": "Dubai Investment Park",
    "Priority": "HIGH"
}

EXPECTED RESULT IN CRM:
- Lead Name: "Test Company LLC - Dubai SME Lead"
- Company: Test Company LLC
- Phone: +971501234567
- Email: test@company.ae
- Website: https://company.ae
- Address: Dubai Investment Park
- City: Dubai
- Priority: High (2)
- Type: Opportunity
"""

# ================================================================
# 🚀 ALTERNATIVE: QUICK FIX METHOD
# ================================================================

"""
If webhook_crm configuration is too complex, try this simpler approach:

1. Go to Settings > Technical > Automation > Server Actions
2. Create new Server Action:
   - Name: "Dubai SME Webhook Handler"
   - Model: Server Actions (ir.actions.server)
   - Action Type: Execute Python Code

3. Paste this code:
"""

quick_fix_code = '''
import json
import logging

_logger = logging.getLogger(__name__)

try:
    # Get the webhook payload
    if hasattr(request, 'httprequest') and request.httprequest.data:
        payload = json.loads(request.httprequest.data.decode('utf-8'))
    else:
        # Fallback - you might need to adjust this based on how data is passed
        payload = {}
    
    _logger.info(f"Webhook received: {payload}")
    
    # Extract data from our scraper format
    company_name = payload.get('Name', 'Unknown Company')
    phone = payload.get('Phone', '')
    email = payload.get('Email', '')
    website = payload.get('Website', '') 
    address = payload.get('Address', '')
    priority = payload.get('Priority', 'MEDIUM')
    
    # Clean data
    if phone in ['Contact via website', 'Not available', '']:
        phone = False
    if email in ['Not available', '']:
        email = False
    if website in ['Not available', '']:
        website = False
    
    # Priority mapping
    priority_map = {'LOW': '0', 'MEDIUM': '1', 'HIGH': '2', 'URGENT': '3'}
    lead_priority = priority_map.get(priority.upper(), '1')
    
    # Create partner (company)
    partner = env['res.partner'].create({
        'name': company_name,
        'phone': phone,
        'email': email,
        'website': website,
        'street': address,
        'city': 'Dubai',
        'is_company': True
    })
    
    # Create CRM lead
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
        'description': f"Category: {payload.get('Category', 'N/A')}\\nQuality: {payload.get('Quality Score', 'N/A')}/10\\nSource: Google Maps Scraper"
    })
    
    _logger.info(f"Lead created successfully: {lead.id}")
    
except Exception as e:
    _logger.error(f"Webhook error: {str(e)}")
    raise
'''

print("🎯 IMMEDIATE ACTIONS:")
print("1. Configure webhook_crm field mapping in Odoo")
print("2. Test with provided payload")  
print("3. If successful, restart our scraper")
print("4. If too complex, use the Server Action quick fix")
print()
print("💡 The webhook_crm module is working - we just need proper field mapping!")