#!/usr/bin/env python3
# =================================================================
# 📊 LIVE SESSION MONITOR - Updated Filtering Logic
# =================================================================

import time
from datetime import datetime, timedelta
import os
import csv
import glob

def get_latest_results():
    """Get the latest CSV results file"""
    results_dir = "d:/apify/apify_actor/results"
    if not os.path.exists(results_dir):
        return None, 0
    
    csv_files = glob.glob(os.path.join(results_dir, "fresh-dubai-businesses-*.csv"))
    if not csv_files:
        return None, 0
    
    latest_file = max(csv_files, key=os.path.getctime)
    
    try:
        with open(latest_file, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            rows = list(reader)
            return latest_file, len(rows) - 1  # Subtract header row
    except Exception:
        return latest_file, 0

def format_time_remaining(start_time, duration_hours=2):
    """Calculate and format remaining time"""
    elapsed = datetime.now() - start_time
    total_duration = timedelta(hours=duration_hours)
    remaining = total_duration - elapsed
    
    if remaining.total_seconds() <= 0:
        return "🎉 Session Complete!", elapsed
    
    hours = int(remaining.total_seconds() // 3600)
    minutes = int((remaining.total_seconds() % 3600) // 60)
    
    return f"{hours}h {minutes}m remaining", elapsed

def main():
    print("🚀 NEW 2-HOUR SESSION MONITOR - UPDATED FILTERING")
    print("=" * 70)
    print("📋 NEW QUALIFICATION RULE: EITHER phone OR email required")
    print("🎯 Expected CRM Push Rate: 75-85% (vs previous 2%)")
    print("=" * 70)
    
    # Session started around 18:17:36
    start_time = datetime(2025, 10, 15, 18, 17, 36)
    
    print(f"🚀 Session Started: {start_time.strftime('%H:%M:%S')}")
    print(f"⏰ Expected End: {(start_time + timedelta(hours=2)).strftime('%H:%M:%S')}")
    print(f"📊 Categories: Business Setup, Retail, Accounting, PRO Services")
    print("=" * 70)
    
    try:
        last_count = 0
        while True:
            latest_file, lead_count = get_latest_results()
            time_status, elapsed = format_time_remaining(start_time)
            
            progress_hours = elapsed.total_seconds() / 3600
            estimated_rate = lead_count / progress_hours if progress_hours > 0 else 0
            
            # Show new leads
            new_leads = lead_count - last_count
            if new_leads > 0:
                print(f"\n🆕 +{new_leads} new leads collected!")
            
            print(f"\r⏱️  {time_status:<25} | 📋 {lead_count:>3} leads | 📈 {estimated_rate:.1f}/hr", end="", flush=True)
            
            if "Complete" in time_status:
                print("\n🎉 2-HOUR SESSION COMPLETED!")
                if latest_file:
                    print(f"📂 Final Results: {os.path.basename(latest_file)}")
                    print(f"📊 Total Leads: {lead_count}")
                    print(f"🎯 Expected CRM Qualified: ~{int(lead_count * 0.8)} leads")
                break
            
            last_count = lead_count
            time.sleep(20)  # Update every 20 seconds
            
    except KeyboardInterrupt:
        print("\n\n📊 MONITORING STOPPED")
        if latest_file:
            print(f"📂 Current Results: {os.path.basename(latest_file)}")
            print(f"📋 Leads So Far: {lead_count}")
            print(f"🎯 Expected CRM Qualified: ~{int(lead_count * 0.8)} leads")

if __name__ == "__main__":
    main()