"""Quick start script to run the Google Maps scraper"""
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from google_maps_scraper import GoogleMapsLeadScraper

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 GOOGLE MAPS LEAD SCRAPER - ODOO 17 INTEGRATION")
    print("="*60)
    print("Target: scholarixglobal.com")
    print("Database: scholarixv17")
    print("Duration: 1 hour")
    print("\n🎯 TARGETING HIGH-POTENTIAL COMPANIES:")
    print("   • Manufacturing & Trading (ERP needs)")
    print("   • Retail & E-commerce (Automation)")
    print("   • Construction & Real Estate (Project Mgmt)")
    print("   • Healthcare (Digital transformation)")
    print("   • Hospitality (Operations automation)")
    print("   • Professional Services (Growing SMEs)")
    print("   • Technology & Startups (Early adopters)")
    print("   • Financial Services (Compliance automation)")
    print("="*60 + "\n")
    
    # HIGH-POTENTIAL search queries for ERP, Automation & AI implementation
    search_queries = [
        # Manufacturing & Trading (High ERP potential)
        "manufacturing companies Dubai",
        "trading companies Dubai",
        "import export companies Dubai",
        "wholesale distributors Dubai",
        "logistics companies Dubai",
        "warehousing services Dubai",
        "supply chain companies Dubai",
        
        # Retail & E-commerce (Automation & ERP potential)
        "retail companies Dubai",
        "ecommerce businesses Dubai",
        "online stores Dubai",
        "distribution companies Dubai",
        "retail chains Dubai",
        
        # Construction & Real Estate (Project Management & ERP)
        "construction companies Dubai",
        "real estate developers Dubai",
        "property management Dubai",
        "facilities management Dubai",
        "contracting companies Dubai",
        
        # Healthcare (Digital transformation potential)
        "private hospitals Dubai",
        "medical centers Dubai",
        "dental clinics Dubai",
        "healthcare providers Dubai",
        "polyclinics Dubai",
        
        # Hospitality & Tourism (Operations automation)
        "hotels Dubai",
        "restaurants Dubai",
        "catering services Dubai",
        "travel agencies Dubai",
        "tourism companies Dubai",
        "event management Dubai",
        
        # Professional Services (Growing SMEs)
        "law firms Dubai",
        "consulting firms Dubai",
        "marketing agencies Dubai",
        "recruitment agencies Dubai",
        "training centers Dubai",
        "business services Dubai",
        
        # Technology & Innovation (Early adopters)
        "software companies Dubai",
        "IT companies Dubai",
        "digital agencies Dubai",
        "tech startups Dubai",
        "app developers Dubai",
        
        # Financial Services (Compliance & automation needs)
        "accounting firms Dubai",
        "auditing firms Dubai",
        "business consultants Dubai",
        "financial advisors Dubai",
        "CFO services Dubai",
        
        # Education (Digital transformation)
        "training institutes Dubai",
        "educational centers Dubai",
        "coaching centers Dubai",
        "language schools Dubai",
        
        # Automotive & Technical (Service management)
        "car dealerships Dubai",
        "auto service centers Dubai",
        "technical services Dubai",
        "maintenance companies Dubai"
    ]
    
    # Initialize and run scraper
    scraper = GoogleMapsLeadScraper(search_queries, duration_minutes=60)
    scraper.run()
    
    print("\n" + "="*60)
    print("✅ SCRAPING SESSION COMPLETED")
    print("="*60)
    input("\nPress Enter to exit...")
