import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
import json
import logging
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ServiceFeeder:
    def __init__(self):
        """Initialize the service feeder"""
        load_dotenv()
        self.base_headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.timeout = 10

    def get_feeding_wm_data(self) -> List[Dict]:
        """Scrape data from Feeding America West Michigan"""
        try:
            url = "https://www.feedwm.org/food-pantries/"
            response = requests.get(url, headers=self.base_headers, timeout=self.timeout)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            pantries = []
            
            # This is a placeholder - actual scraping logic will depend on website structure
            # You'll need to inspect the website and adjust the selectors accordingly
            
            return pantries
            
        except Exception as e:
            logger.error(f"Error collecting Feeding WM data: {str(e)}")
            return []

    def get_salvation_army_data(self) -> List[Dict]:
        """Scrape data from Salvation Army Kent County"""
        try:
            url = "https://centralusa.salvationarmy.org/kentcounty/cure-hunger/"
            response = requests.get(url, headers=self.base_headers, timeout=self.timeout)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            locations = []
            
            # This is a placeholder - actual scraping logic will depend on website structure
            
            return locations
            
        except Exception as e:
            logger.error(f"Error collecting Salvation Army data: {str(e)}")
            return []

    def get_dhhs_data(self) -> List[Dict]:
        """Get DHHS office locations from API or public dataset"""
        try:
            # This would typically require an API or public dataset
            # For now, we'll create mock data
            return [
                {
                    "name": "Kent County DHHS",
                    "address": "701 Ball Ave NE, Grand Rapids, MI 49503",
                    "services": ["Food Assistance", "Cash Assistance", "Medicaid"],
                    "hours": "8:00 AM - 5:00 PM",
                    "phone": "(616) 632-7000",
                    "website": "https://www.accesskent.com/",
                    "last_updated": datetime.now().isoformat()
                }
            ]
            
        except Exception as e:
            logger.error(f"Error collecting DHHS data: {str(e)}")
            return []

    def get_ywca_data(self) -> List[Dict]:
        """Scrape data from YWCA Grand Rapids"""
        try:
            url = "https://www.ywcagrandrapids.org/programs/"
            response = requests.get(url, headers=self.base_headers, timeout=self.timeout)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            programs = []
            
            # This is a placeholder - actual scraping logic will depend on website structure
            
            return programs
            
        except Exception as e:
            logger.error(f"Error collecting YWCA data: {str(e)}")
            return []

    def standardize_data(self, data: List[Dict], source: str) -> List[Dict]:
        """Standardize the data format across all sources"""
        standardized = []
        
        for item in data:
            standardized_item = {
                'source': source,
                'name': item.get('name', ''),
                'address': item.get('address', ''),
                'city': item.get('city', ''),
                'state': item.get('state', ''),
                'zip_code': item.get('zip_code', ''),
                'services': item.get('services', []),
                'hours': item.get('hours', ''),
                'phone': item.get('phone', ''),
                'website': item.get('website', ''),
                'last_updated': item.get('last_updated', datetime.now().isoformat())
            }
            standardized.append(standardized_item)
            
        return standardized

    def collect_all_data(self) -> List[Dict]:
        """Collect and standardize data from all sources"""
        all_data = []
        
        # Collect from each source
        sources = {
            'feeding_wm': self.get_feeding_wm_data(),
            'salvation_army': self.get_salvation_army_data(),
            'dhhs': self.get_dhhs_data(),
            'ywca': self.get_ywca_data()
        }
        
        # Process each source
        for source_name, source_data in sources.items():
            standardized = self.standardize_data(source_data, source_name)
            all_data.extend(standardized)
            
            logger.info(f"Collected {len(standardized)} records from {source_name}")
        
        return all_data

    def save_data(self, data: List[Dict], filename: Optional[str] = None) -> None:
        """Save the collected data to files"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"social_services_{timestamp}"
            
        # Save as CSV
        df = pd.DataFrame(data)
        df.to_csv(f"../data/{filename}.csv", index=False)
        
        # Save as JSON
        with open(f"../data/{filename}.json", 'w') as f:
            json.dump(data, f, indent=2)
            
        logger.info(f"Saved data to {filename}.csv and {filename}.json")

    def run(self):
        """Run the complete data collection pipeline"""
        logger.info("Starting data collection pipeline...")
        
        # Collect data
        data = self.collect_all_data()
        
        # Save data
        self.save_data(data)
        
        logger.info(f"Data collection complete. Collected {len(data)} records")

if __name__ == "__main__":
    feeder = ServiceFeeder()
    feeder.run()
