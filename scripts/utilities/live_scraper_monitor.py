#!/usr/bin/env python3
"""
🔍 LIVE SCRAPER MONITOR
Real-time monitoring of Google Maps scraper progress
"""

import time
import os
import json
from datetime import datetime
import psutil
import sys

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
    except:
        return 0

def check_scraper_process():
    """Check if scraper is running"""
    for proc in psutil.process_iter(['name', 'cmdline']):
        try:
            if 'python' in proc.info['name'].lower():
                cmdline = ' '.join(proc.info['cmdline'] or [])
                if 'google_maps_scraper.py' in cmdline:
                    return proc
        except:
            continue
    return None

def format_time_diff(start_time):
    """Format time difference"""
    diff = datetime.now() - start_time
    minutes = int(diff.total_seconds() / 60)
    seconds = int(diff.total_seconds() % 60)
    return f"{minutes:02d}:{seconds:02d}"

def main():
    print("🔍 LIVE SCRAPER MONITOR")
    print("=" * 50)
    print("Monitoring Google Maps scraper progress...")
    print("Press Ctrl+C to stop monitoring\n")
    
    start_monitor_time = datetime.now()
    last_count = 0
    
    try:
        while True:
            # Clear screen
            os.system('cls' if os.name == 'nt' else 'clear')
            
            print("🔍 LIVE SCRAPER MONITOR")
            print("=" * 50)
            
            # Check if scraper is running
            scraper_proc = check_scraper_process()
            
            if scraper_proc:
                print("🟢 Scraper Status: RUNNING")
                try:
                    cpu_percent = scraper_proc.cpu_percent()
                    memory_mb = scraper_proc.memory_info().rss / 1024 / 1024
                    print(f"💻 CPU Usage: {cpu_percent:.1f}%")
                    print(f"🧠 Memory Usage: {memory_mb:.1f} MB")
                except:
                    print("💻 Process monitoring: Limited access")
            else:
                print("🔴 Scraper Status: NOT RUNNING")
            
            # Find and monitor CSV file
            latest_csv = find_latest_csv()
            
            if latest_csv:
                current_count = count_csv_lines(latest_csv)
                leads_per_minute = 0
                
                if last_count > 0:
                    time_diff = (datetime.now() - start_monitor_time).total_seconds() / 60
                    if time_diff > 0:
                        leads_per_minute = (current_count - last_count) / time_diff
                
                print(f"\n📊 PROGRESS TRACKING")
                print("-" * 30)
                print(f"📁 Current File: {latest_csv}")
                print(f"📈 Total Leads: {current_count}")
                print(f"⚡ Rate: {leads_per_minute:.1f} leads/minute")
                
                # Show recent growth
                if current_count > last_count:
                    new_leads = current_count - last_count
                    print(f"🆕 New Leads: +{new_leads}")
                
                last_count = current_count
                
                # File timestamp
                try:
                    file_time = datetime.fromtimestamp(os.path.getmtime(latest_csv))
                    time_since_update = datetime.now() - file_time
                    print(f"⏰ Last Updated: {format_time_diff(file_time)} ago")
                except:
                    pass
                    
            else:
                print(f"\n📊 PROGRESS TRACKING")
                print("-" * 30)
                print("📁 No CSV files found yet")
                print("⏳ Waiting for scraper to create data...")
            
            # Monitor time
            monitor_runtime = format_time_diff(start_monitor_time)
            print(f"\n🕐 Monitor Runtime: {monitor_runtime}")
            print(f"🔄 Next Update: 10 seconds")
            print("\nPress Ctrl+C to stop monitoring")
            
            time.sleep(10)
            
    except KeyboardInterrupt:
        print(f"\n\n✅ Monitor stopped after {format_time_diff(start_monitor_time)}")
        
        if latest_csv:
            final_count = count_csv_lines(latest_csv)
            print(f"📊 Final Count: {final_count} leads")
            print(f"📁 Data File: {latest_csv}")

if __name__ == "__main__":
    main()