import csv
import time
from datetime import datetime, timedelta
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import os
import json
import re
from webhook_crm_connector import get_webhook_connector

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class GoogleMapsLeadScraper:
    def __init__(self, search_queries, duration_minutes=60):
        self.search_queries = search_queries
        self.duration = timedelta(minutes=duration_minutes)
        self.start_time = datetime.now()
        self.results = []
        self.driver = None
        self.scraped_names = set()
        self.crm_connector = None
        self.crm_enabled = False
        self.load_crm_config()
        
    def load_crm_config(self):
        """Load CRM configuration from config file"""
        try:
            config_path = "d:/apify/apify_actor/crm_config.json"
            if os.path.exists(config_path):
                with open(config_path, 'r') as f:
                    config = json.load(f)
                
                if config.get('enabled', False):
                    crm_type = config.get('crm_type')
                    credentials = config.get('credentials', {})
                    self.push_settings = config.get('push_settings', {})
                    
                    # Initialize webhook connector
                    if crm_type.lower() == 'webhook':
                        self.crm_connector = get_webhook_connector(
                            webhook_url=credentials.get('webhook_url'),
                            auth_header=credentials.get('auth_header')
                        )
                        self.crm_enabled = True
                        logger.info(f"✓ Webhook CRM integration enabled: {credentials.get('webhook_url')}")
                    else:
                        logger.error(f"Unsupported CRM type: {crm_type}")
                        self.crm_enabled = False
                else:
                    logger.info("CRM integration disabled in config")
            else:
                logger.warning("CRM config file not found. CRM push disabled.")
        except Exception as e:
            logger.error(f"Error loading CRM config: {e}")
            self.crm_enabled = False
    
    def push_to_crm(self, lead_data: dict) -> bool:
        """Push single lead to CRM"""
        if not self.crm_enabled or not self.crm_connector:
            return False
        
        try:
            max_retries = self.push_settings.get('max_retries', 3)
            retry_count = 0
            
            while retry_count < max_retries:
                if self.crm_connector.push_lead(lead_data):
                    return True
                
                retry_count += 1
                if retry_count < max_retries and self.push_settings.get('retry_on_failure', True):
                    logger.info(f"Retrying CRM push ({retry_count}/{max_retries})...")
                    time.sleep(2)
            
            return False
            
        except Exception as e:
            logger.error(f"Error pushing to CRM: {e}")
            return False
    
    def should_push_to_crm(self, lead_data: dict) -> bool:
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
            logger.info(f"✅ CRM PUSH QUALIFIED: {lead_data['Name']} - {' | '.join(contact_info)}")
            return True
        else:
            logger.info(f"⏭️ CRM PUSH SKIPPED: {lead_data['Name']} - Missing both phone AND email")
            return False
        
    def setup_driver(self):
        """Setup Chrome driver with options"""
        chrome_options = Options()
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--start-maximized')
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        logger.info("Chrome driver initialized")
        
    def should_continue(self):
        """Check if scraping should continue based on time limit"""
        elapsed = datetime.now() - self.start_time
        remaining = self.duration - elapsed
        if remaining.total_seconds() <= 0:
            logger.info("Time limit reached (2 hours)")
            return False
        logger.info(f"Time remaining: {int(remaining.total_seconds() / 60)} minutes")
        return True
    
    def extract_email(self):
        """Extract email from business details"""
        try:
            # Try to find email in the page source
            page_source = self.driver.page_source
            
            # Look for email patterns
            import re
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            emails = re.findall(email_pattern, page_source)
            
            # Filter out common non-business emails
            excluded_domains = ['google.com', 'gmail.com', 'maps.google', 'gstatic.com', 'googleusercontent.com']
            
            for email in emails:
                domain = email.split('@')[1].lower()
                if not any(excluded in domain for excluded in excluded_domains):
                    logger.info(f"Found email: {email}")
                    return email
            
            # Try to find email button or link
            try:
                email_elements = self.driver.find_elements(By.XPATH, 
                    "//a[contains(@href, 'mailto:')]")
                if email_elements:
                    email_href = email_elements[0].get_attribute('href')
                    email = email_href.replace('mailto:', '').split('?')[0]
                    return email
            except:
                pass
            
        except Exception as e:
            logger.debug(f"Email extraction error: {e}")
        
        return "Not available"
    
    def extract_phone(self):
        """Extract phone number from business details"""
        try:
            phone_button = WebDriverWait(self.driver, 3).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'button[data-item-id*="phone"]'))
            )
            phone_button.click()
            time.sleep(1)
            
            phone_elements = self.driver.find_elements(By.CSS_SELECTOR, '[data-item-id*="phone"] [class*="fontBodyMedium"]')
            for elem in phone_elements:
                text = elem.text.strip()
                if text and (text.startswith('+') or text.startswith('0')):
                    return text
        except:
            pass
        return "Contact via website"
    
    def extract_website(self):
        """Extract website from business details"""
        try:
            website_elem = self.driver.find_element(By.CSS_SELECTOR, 'a[data-item-id*="authority"]')
            return website_elem.get_attribute('href')
        except:
            return "Not available"
    
    def extract_address(self):
        """Extract address from business details"""
        try:
            address_button = self.driver.find_element(By.CSS_SELECTOR, 'button[data-item-id*="address"]')
            address_text = address_button.get_attribute('aria-label')
            if address_text and 'Address:' in address_text:
                return address_text.replace('Address:', '').strip()
            return address_button.text.strip()
        except:
            return "Dubai, UAE"
    
    def calculate_priority(self, phone, website, email):
        """Calculate priority based on available data"""
        has_phone = phone not in ["Contact via website", "Not available"]
        has_website = website not in ["Not available", ""]
        has_email = email not in ["Not available", ""]
        
        contact_count = sum([has_phone, has_website, has_email])
        
        if contact_count >= 3:
            return "URGENT"
        elif contact_count >= 2:
            return "HIGH"
        elif contact_count >= 1:
            return "MEDIUM"
        else:
            return "LOW"
    
    def calculate_quality_score(self, phone, website, category, email):
        """Calculate quality score (1-10)"""
        score = 4
        
        if phone not in ["Contact via website", "Not available"]:
            score += 2
        if website not in ["Not available", ""]:
            score += 2
        if email not in ["Not available", ""]:
            score += 1
        if category and category != "N/A":
            score += 1
        
        return min(score, 10)
    
    def scrape_business_details(self, business_name, search_term):
        """Extract detailed business information after clicking on a listing"""
        try:
            time.sleep(2)
            
            # Extract name
            try:
                name_elem = WebDriverWait(self.driver, 5).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, 'h1.fontHeadlineLarge, h1.fontHeadlineSmall'))
                )
                name = name_elem.text.strip()
            except:
                name = business_name
            
            # Skip duplicates
            if name in self.scraped_names:
                logger.info(f"Skipping duplicate: {name}")
                return None
            
            # Extract category
            try:
                category_elem = self.driver.find_element(By.CSS_SELECTOR, 'button[jsaction*="category"]')
                category = category_elem.text.strip()
            except:
                category = "Business Services"
            
            # Extract contact details
            phone = self.extract_phone()
            website = self.extract_website()
            email = self.extract_email()
            address = self.extract_address()
            
            # Build result
            business_data = {
                'Name': name,
                'Category': category,
                'Phone': phone,
                'Email': email,
                'Website': website,
                'Address': address,
                'Priority': self.calculate_priority(phone, website, email),
                'Quality Score': self.calculate_quality_score(phone, website, category, email),
                'Data Source': 'Google Maps Scraper',
                'Search Term': search_term,
                'Timestamp': datetime.now().strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
            }
            
            self.scraped_names.add(name)
            
            # Push to CRM in real-time if enabled (only leads with email AND phone)
            if self.crm_enabled and self.push_settings.get('real_time', True):
                if self.should_push_to_crm(business_data):
                    self.push_to_crm(business_data)
            
            return business_data
            
        except Exception as e:
            logger.error(f"Error extracting business details: {e}")
            return None
    
    def search_and_scrape(self, query):
        """Search Google Maps and scrape results"""
        try:
            search_url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}+Dubai+UAE"
            self.driver.get(search_url)
            logger.info(f"Searching for: {query}")
            
            # Wait for results
            time.sleep(4)
            
            try:
                results_container = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, 'div[role="feed"]'))
                )
            except TimeoutException:
                logger.warning(f"No results found for: {query}")
                return
            
            # Scroll to load more results
            last_height = 0
            scroll_attempts = 0
            max_scrolls = 15
            
            while scroll_attempts < max_scrolls and self.should_continue():
                # Scroll down
                self.driver.execute_script(
                    'arguments[0].scrollTop = arguments[0].scrollHeight', 
                    results_container
                )
                time.sleep(2)
                
                new_height = self.driver.execute_script('return arguments[0].scrollHeight', results_container)
                if new_height == last_height:
                    break
                    
                last_height = new_height
                scroll_attempts += 1
            
            # Get all business listings
            business_elements = self.driver.find_elements(By.CSS_SELECTOR, 'div[role="feed"] > div > div > a')
            logger.info(f"Found {len(business_elements)} businesses for query: {query}")
            
            # Process each business
            for idx, business_elem in enumerate(business_elements[:30]):  # Limit per query
                if not self.should_continue():
                    break
                
                try:
                    # Get business name before clicking
                    business_name = business_elem.get_attribute('aria-label') or f"Business {idx+1}"
                    
                    # Click on business
                    self.driver.execute_script("arguments[0].click();", business_elem)
                    
                    # Scrape details
                    business_data = self.scrape_business_details(business_name, query)
                    
                    if business_data:
                        self.results.append(business_data)
                        logger.info(f"✓ Scraped ({len(self.results)}): {business_data['Name']} - Phone: {business_data['Phone']} - Email: {business_data['Email']}")
                    
                    time.sleep(1)  # Rate limiting
                    
                except Exception as e:
                    logger.error(f"Error processing business {idx+1}: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error in search_and_scrape for query '{query}': {e}")
    
    def save_results(self):
        """Save results to CSV file in the same format as the example"""
        timestamp = datetime.now().strftime('%Y-%m-%dT%H-%M-%S-%f')[:-3] + 'Z'
        filename = f"d:/apify/apify_actor/results/fresh-dubai-businesses-{timestamp}.csv"
        
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        if not self.results:
            logger.warning("No results to save")
            return
        
        # Write CSV with email field included
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['Name', 'Category', 'Phone', 'Email', 'Website', 'Address', 
                         'Priority', 'Quality Score', 'Data Source', 'Search Term', 'Timestamp']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(self.results)
            
        logger.info(f"✓ Saved {len(self.results)} leads to {filename}")
        return filename
    
    def run(self):
        """Main scraping loop - runs for 2 hours"""
        try:
            self.setup_driver()
            logger.info(f"🚀 Starting 2-hour scraping session...")
            logger.info(f"Start time: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
            
            if self.crm_enabled:
                logger.info(f"📤 CRM push enabled - Real-time: {self.push_settings.get('real_time', True)}")
            
            query_index = 0
            
            while self.should_continue():
                query = self.search_queries[query_index % len(self.search_queries)]
                self.search_and_scrape(query)
                query_index += 1
                
                if not self.should_continue():
                    break
                
                logger.info(f"Total leads collected so far: {len(self.results)}")
                time.sleep(3)
            
            elapsed = datetime.now() - self.start_time
            logger.info(f"✓ Scraping completed!")
            logger.info(f"Duration: {int(elapsed.total_seconds() / 60)} minutes")
            logger.info(f"Total leads collected: {len(self.results)}")
            
            # Push remaining leads in batch if enabled
            if self.crm_enabled and self.push_settings.get('batch_at_end', True) and self.results:
                logger.info("📤 Pushing leads batch to CRM...")
                results = self.crm_connector.push_leads_batch(self.results)
                logger.info(f"CRM Push Results - Success: {results['success']}, Failed: {results['failed']}")
            
        except KeyboardInterrupt:
            logger.info("Scraping interrupted by user")
        except Exception as e:
            logger.error(f"Error in main scraping loop: {e}")
        finally:
            if self.driver:
                self.driver.quit()
            
            if self.results:
                self.save_results()
            else:
                logger.warning("No results collected")

if __name__ == "__main__":
    # Search queries targeting BUSINESS SETUP, RETAIL, ACCOUNTING & PRO SERVICES
    search_queries = [
        # Business Setup Services (High-potential target clients)
        "business setup companies Dubai",
        "company formation Dubai",
        "business license services Dubai",
        "business setup consultants Dubai",
        "corporate services Dubai",
        "business incorporation Dubai",
        "mainland company setup Dubai",
        "freezone business setup Dubai",
        
        # Retail Businesses (E-commerce & operations optimization potential)
        "retail stores Dubai",
        "shopping centers Dubai",
        "retail chains Dubai",
        "fashion retailers Dubai",
        "electronics stores Dubai",
        "supermarkets Dubai",
        "department stores Dubai",
        "retail outlets Dubai",
        
        # Accounting Firms (Professional services, CRM & automation potential)
        "accounting firms Dubai",
        "chartered accountants Dubai",
        "audit firms Dubai",
        "tax consultants Dubai",
        "bookkeeping services Dubai",
        "financial advisors Dubai",
        "accounting services Dubai",
        "certified accountants Dubai",
        
        # PRO Services (Government relations & documentation services)
        "PRO services Dubai",
        "government relations Dubai",
        "visa services Dubai",
        "document clearing Dubai",
        "immigration services Dubai",
        "labor card services Dubai",
        "emirates id services Dubai",
        "ministry attestation Dubai",
        
        # Professional Services (Growing SMEs)
        "law firms Dubai",
        "consulting firms Dubai",
        "marketing agencies Dubai",
        "recruitment agencies Dubai",
        "training centers Dubai",
        
        # Technology & Innovation (Early adopters)
        "software companies Dubai",
        "IT companies Dubai",
        "digital agencies Dubai",
        "startups Dubai",
        
        # Financial Services (Compliance & automation needs)
        "accounting firms Dubai",
        "auditing firms Dubai",
        "business consultants Dubai",
        "financial advisors Dubai",
        "accounting services Dubai",
        "certified accountants Dubai",
        
        # PRO Services (Government relations & documentation services)
        "PRO services Dubai",
        "government relations Dubai",
        "visa services Dubai",
        "document clearing Dubai",
        "immigration services Dubai",
        "labor card services Dubai",
        "emirates id services Dubai",
        "ministry attestation Dubai"
    ]
    
    # Run for 2 hours (120 minutes)
    scraper = GoogleMapsLeadScraper(search_queries, duration_minutes=120)
    scraper.run()
