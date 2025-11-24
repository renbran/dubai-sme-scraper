#!/usr/bin/env python3
# =================================================================
# 🧪 TEST FILTERING LOGIC - Validate CRM push filtering
# =================================================================

def should_push_to_crm(lead_data: dict) -> bool:
    """Check if lead should be pushed to CRM (must have either email OR phone)"""
    phone = lead_data.get('Phone', '').strip()
    email = lead_data.get('Email', '').strip()
    
    # Must have either phone OR email, and they must not be "Not available"
    has_phone = phone and phone != "Not available" and phone != "Contact via website"
    has_email = email and email != "Not available" and "@" in email
    
    if has_phone or has_email:
        contact_info = []
        if has_phone:
            contact_info.append(f"Phone: {phone}")
        if has_email:
            contact_info.append(f"Email: {email}")
        print(f"✅ CRM PUSH QUALIFIED: {lead_data['Name']} - {' | '.join(contact_info)}")
        return True
    else:
        print(f"⏭️ CRM PUSH SKIPPED: {lead_data['Name']} - Missing both phone AND email")
        return False

# Test cases
test_leads = [
    {
        "Name": "Complete Lead LLC",
        "Phone": "+971 4 123 4567", 
        "Email": "info@complete.ae"
    },
    {
        "Name": "No Phone Lead LLC",
        "Phone": "Not available",
        "Email": "info@nophone.ae" 
    },
    {
        "Name": "No Email Lead LLC", 
        "Phone": "+971 4 123 4567",
        "Email": "Not available"
    },
    {
        "Name": "Contact Website Lead LLC",
        "Phone": "Contact via website",
        "Email": "info@website.ae"
    },
    {
        "Name": "Empty Fields Lead LLC",
        "Phone": "",
        "Email": ""
    },
    {
        "Name": "Invalid Email Lead LLC",
        "Phone": "+971 4 123 4567",
        "Email": "invalid-email"
    }
]

print("🧪 TESTING CRM FILTERING LOGIC - UPDATED")
print("📋 NEW RULE: Leads need EITHER phone OR email (not both)")
print("=" * 60)

qualified_count = 0
for lead in test_leads:
    if should_push_to_crm(lead):
        qualified_count += 1

print("=" * 60)
print(f"📊 SUMMARY: {qualified_count}/{len(test_leads)} leads qualified for CRM push")
print("✅ Leads with EITHER valid phone OR email will be pushed to Odoo")
print("📂 ALL leads will still be saved to CSV files")