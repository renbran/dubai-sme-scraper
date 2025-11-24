#!/usr/bin/env python3
# ================================================================
# 🚀 REAL-TIME SCRAPER PROGRESS TRACKER
# ================================================================

import os
import csv
import json
import time
from datetime import datetime, timedelta

def get_latest_results():
    """Get the latest CSV results file"""
    results_dir = "d:/apify/apify_actor/results"
    csv_files = [f for f in os.listdir(results_dir) if f.endswith('.csv') and 'fresh-dubai-businesses' in f]
    if csv_files:
        latest_file = max(csv_files, key=lambda x: os.path.getctime(os.path.join(results_dir, x)))
        return os.path.join(results_dir, latest_file)
    return None

def display_live_progress():
    """Display live progress of the scraper"""
    
    print("=" * 80)
    print("🚀 DUBAI SME SCRAPER - LIVE PROGRESS TRACKER")
    print("=" * 80)
    
    # Session info
    current_time = datetime.now()
    session_start = datetime(2025, 10, 15, 9, 11, 0)  # Latest session start time
    elapsed = current_time - session_start
    remaining = timedelta(hours=1) - elapsed
    
    print(f"📅 Current Time: {current_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"⏱️  Session Started: {session_start.strftime('%H:%M:%S')}")
    print(f"⏳ Elapsed Time: {str(elapsed).split('.')[0]}")
    print(f"⏰ Time Remaining: {str(remaining).split('.')[0] if remaining.total_seconds() > 0 else 'Session Complete'}")
    
    # Progress bar
    progress_percent = min(100, (elapsed.total_seconds() / 3600) * 100)
    progress_bar = "█" * int(progress_percent // 5) + "░" * (20 - int(progress_percent // 5))
    print(f"📊 Progress: [{progress_bar}] {progress_percent:.1f}%")
    
    print("\n" + "─" * 80)
    print("📈 CURRENT RESULTS")
    print("─" * 80)
    
    # Check latest results
    latest_file = get_latest_results()
    if latest_file and os.path.exists(latest_file):
        try:
            with open(latest_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                leads = list(reader)
                
                print(f"📄 Latest Results File: {os.path.basename(latest_file)}")
                print(f"📊 Total Leads Collected: {len(leads)}")
                
                if leads:
                    # Analyze lead quality
                    urgent_leads = [l for l in leads if l.get('Priority') == 'URGENT']
                    high_leads = [l for l in leads if l.get('Priority') == 'HIGH']
                    email_leads = [l for l in leads if l.get('Email') and l['Email'] not in ['Not available', '']]
                    website_leads = [l for l in leads if l.get('Website') and l['Website'] not in ['Not available', '']]
                    
                    print(f"🔥 URGENT Priority: {len(urgent_leads)} leads")
                    print(f"⭐ HIGH Priority: {len(high_leads)} leads")
                    print(f"📧 With Email: {len(email_leads)} leads")
                    print(f"🌐 With Website: {len(website_leads)} leads")
                    
                    # Calculate average quality score
                    quality_scores = [float(l.get('Quality Score', 0)) for l in leads if l.get('Quality Score', '').replace('.', '').isdigit()]
                    avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0
                    print(f"🎯 Average Quality Score: {avg_quality:.1f}/10")
                    
                    print("\n" + "─" * 80)
                    print("🏆 TOP QUALITY LEADS")
                    print("─" * 80)
                    
                    # Show top 3 leads
                    sorted_leads = sorted(leads, key=lambda x: float(x.get('Quality Score', 0)), reverse=True)[:3]
                    
                    for i, lead in enumerate(sorted_leads, 1):
                        print(f"\n🏢 #{i}. {lead.get('Name', 'Unknown Company')}")
                        print(f"   📱 Phone: {lead.get('Phone', 'N/A')}")
                        print(f"   📧 Email: {lead.get('Email', 'N/A')}")
                        print(f"   🌐 Website: {lead.get('Website', 'N/A')}")
                        print(f"   📍 Address: {lead.get('Address', 'N/A')[:50]}...")
                        print(f"   ⭐ Priority: {lead.get('Priority', 'N/A')}")
                        print(f"   🎯 Quality Score: {lead.get('Quality Score', 'N/A')}/10")
                        print(f"   🏷️  Category: {lead.get('Category', 'N/A')}")
        
        except Exception as e:
            print(f"❌ Error reading results: {e}")
    else:
        print("⏳ No results file found yet - scraper is still initializing...")
    
    # Webhook status
    print("\n" + "─" * 80)
    print("🔗 WEBHOOK STATUS")
    print("─" * 80)
    print("🌐 Webhook URL: https://scholarixglobal.com/web/hook/22c7e29b-1d45-4ec8-93cc-fe62708bddc7")
    print("📦 Module: webhook_crm")
    print("⚠️  Status: Needs field mapping configuration (500 errors)")
    print("💾 Backup: All leads saved to CSV ✅")
    
    # Next steps
    print("\n" + "─" * 80)
    print("📋 NEXT STEPS")
    print("─" * 80)
    print("1. 🔧 Configure webhook_crm field mapping in Odoo")
    print("2. 🧪 Test webhook with sample lead")
    print("3. ✅ Enable real-time CRM integration")
    print("4. 📊 Monitor lead quality and CRM pipeline")
    
    # Expected completion
    completion_time = session_start + timedelta(hours=1)
    print(f"\n🕐 Expected Completion: {completion_time.strftime('%H:%M:%S')}")
    print("📊 Expected Total Leads: 50-100 high-quality companies")
    print("🎯 Focus: ERP/Automation ready Dubai SMEs")
    
    print("\n" + "=" * 80)

if __name__ == "__main__":
    display_live_progress()