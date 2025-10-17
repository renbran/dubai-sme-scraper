#!/usr/bin/env python3
"""
🔍 SIMPLE SCRAPER MONITOR
Real-time monitoring of Google Maps scraper progress
"""

import time
import os
from datetime import datetime

def find_latest_csv():
    """Find the most recent CSV file"""
    csv_files = [f for f in os.listdir('.') if f.startswith('dubai_sme_leads_') and f.endswith('.csv')]
    if not csv_files:
        return None
    return max(csv_files, key=os.path.getctime)

def count_csv_lines(filename):
    """Count lines in CSV file (excluding header)"""
    if not filename or not os.path.exists(filename):
        return 0
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            lines = sum(1 for line in f) - 1  # Exclude header
        return max(0, lines)
    except Exception:
        return 0

def format_time_diff(start_time):
    """Format time difference"""
    diff = datetime.now() - start_time
    minutes = int(diff.total_seconds() / 60)
    seconds = int(diff.total_seconds() % 60)
    return f"{minutes:02d}:{seconds:02d}"

def main():
    print("🔍 SIMPLE SCRAPER MONITOR")
    print("=" * 50)
    print("Monitoring Google Maps scraper progress...")
    print("Press Ctrl+C to stop monitoring\n")
    
    start_monitor_time = datetime.now()
    last_count = 0
    last_check_time = datetime.now()
    
    try:
        while True:
            # Clear screen
            os.system('cls' if os.name == 'nt' else 'clear')
            
            print("🔍 SIMPLE SCRAPER MONITOR")
            print("=" * 50)
            
            # Find and monitor CSV file
            latest_csv = find_latest_csv()
            
            if latest_csv:
                current_count = count_csv_lines(latest_csv)
                current_time = datetime.now()
                
                # Calculate rate
                time_diff_minutes = (current_time - last_check_time).total_seconds() / 60
                leads_per_minute = 0
                
                if last_count > 0 and time_diff_minutes > 0:
                    leads_per_minute = (current_count - last_count) / time_diff_minutes
                
                print("📊 PROGRESS TRACKING")
                print("-" * 30)
                print(f"📁 Current File: {latest_csv}")
                print(f"📈 Total Leads: {current_count}")
                
                if leads_per_minute > 0:
                    print(f"⚡ Rate: {leads_per_minute:.1f} leads/minute")
                
                # Show recent growth
                if current_count > last_count:
                    new_leads = current_count - last_count
                    print(f"🆕 New Leads: +{new_leads}")
                    last_check_time = current_time
                
                last_count = current_count
                
                # File timestamp
                try:
                    file_time = datetime.fromtimestamp(os.path.getmtime(latest_csv))
                    minutes_ago = int((datetime.now() - file_time).total_seconds() / 60)
                    print(f"⏰ Last Updated: {minutes_ago} minutes ago")
                except Exception:
                    pass
                    
            else:
                print("📊 PROGRESS TRACKING")
                print("-" * 30)
                print("📁 No CSV files found yet")
                print("⏳ Waiting for scraper to create data...")
            
            # Monitor time
            monitor_runtime = format_time_diff(start_monitor_time)
            print(f"\n🕐 Monitor Runtime: {monitor_runtime}")
            print("🔄 Next Update: 15 seconds")
            print("\nPress Ctrl+C to stop monitoring")
            
            time.sleep(15)
            
    except KeyboardInterrupt:
        print(f"\n\n✅ Monitor stopped after {format_time_diff(start_monitor_time)}")
        
        if latest_csv:
            final_count = count_csv_lines(latest_csv)
            print(f"📊 Final Count: {final_count} leads")
            print(f"📁 Data File: {latest_csv}")

if __name__ == "__main__":
    main()