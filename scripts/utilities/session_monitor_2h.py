#!/usr/bin/env python3
# =================================================================
# 📊 2-HOUR SCRAPING SESSION MONITOR
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
    except:
        return latest_file, 0

def format_time_remaining(start_time, duration_hours=2):
    """Calculate and format remaining time"""
    elapsed = datetime.now() - start_time
    total_duration = timedelta(hours=duration_hours)
    remaining = total_duration - elapsed
    
    if remaining.total_seconds() <= 0:
        return "Session Complete!", elapsed
    
    hours = int(remaining.total_seconds() // 3600)
    minutes = int((remaining.total_seconds() % 3600) // 60)
    
    return f"{hours}h {minutes}m remaining", elapsed

def main():
    print("📊 2-HOUR SCRAPING SESSION MONITOR")
    print("=" * 60)
    
    # Estimate start time (session started around 18:05:30)
    start_time = datetime.now() - timedelta(minutes=1)  # Adjust as needed
    
    print(f"🚀 Session Started: {start_time.strftime('%H:%M:%S')}")
    print(f"⏰ Expected End: {(start_time + timedelta(hours=2)).strftime('%H:%M:%S')}")
    print(f"🎯 Target Categories: Business Setup, Retail, Accounting, PRO Services")
    print(f"🔍 Filtering: Only leads with phone AND email pushed to CRM")
    print("=" * 60)
    
    try:
        while True:
            latest_file, lead_count = get_latest_results()
            time_status, elapsed = format_time_remaining(start_time)
            
            progress_hours = elapsed.total_seconds() / 3600
            estimated_rate = lead_count / progress_hours if progress_hours > 0 else 0
            
            print(f"\r⏱️  {time_status:<20} | 📋 {lead_count:>3} leads | 📈 {estimated_rate:.1f}/hour", end="", flush=True)
            
            if "Complete" in time_status:
                print("\n🎉 2-HOUR SESSION COMPLETED!")
                if latest_file:
                    print(f"📂 Final Results: {os.path.basename(latest_file)}")
                    print(f"📊 Total Leads Collected: {lead_count}")
                break
                
            time.sleep(30)  # Update every 30 seconds
            
    except KeyboardInterrupt:
        print("\n\n📊 MONITORING STOPPED")
        if latest_file:
            print(f"📂 Current Results: {os.path.basename(latest_file)}")
            print(f"📋 Leads So Far: {lead_count}")

if __name__ == "__main__":
    main()