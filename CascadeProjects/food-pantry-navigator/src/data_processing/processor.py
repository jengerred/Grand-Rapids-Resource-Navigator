import pandas as pd
import numpy as np
from geopy.geocoders import Nominatim
import logging
from typing import List, Dict, Optional
import json
import os
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize geolocator
geolocator = Nominatim(user_agent="food_pantry_navigator")

class DataProcessor:
    def __init__(self):
        """Initialize the data processor"""
        load_dotenv()
        self.default_city = "Grand Rapids"
        self.default_state = "MI"
        self.default_country = "USA"

    def standardize_address(self, address: str) -> Dict:
        """Standardize address format"""
        try:
            location = geolocator.geocode(address)
            if location:
                return {
                    'address': location.address,
                    'latitude': location.latitude,
                    'longitude': location.longitude,
                    'city': location.raw.get('city', self.default_city),
                    'state': location.raw.get('state', self.default_state),
                    'zip_code': location.raw.get('postcode', '')
                }
            return {
                'address': address,
                'latitude': None,
                'longitude': None,
                'city': self.default_city,
                'state': self.default_state,
                'zip_code': ''
            }
        except Exception as e:
            logger.error(f"Error standardizing address {address}: {str(e)}")
            return {
                'address': address,
                'latitude': None,
                'longitude': None,
                'city': self.default_city,
                'state': self.default_state,
                'zip_code': ''
            }

    def standardize_hours(self, hours: str) -> Dict:
        """Standardize business hours format"""
        if not hours:
            return {'monday': '', 'tuesday': '', 'wednesday': '', 'thursday': '', 
                    'friday': '', 'saturday': '', 'sunday': ''}
            
        # Split hours by days
        days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        standardized = {day: '' for day in days}
        
        # This is a simple implementation - you may want to add more sophisticated parsing
        if '24 hours' in hours.lower():
            for day in days:
                standardized[day] = '24 hours'
        elif 'closed' in hours.lower():
            return standardized
        else:
            # Try to parse hours in format like "9am-5pm"
            try:
                for day in days:
                    standardized[day] = hours
            except:
                pass
        
        return standardized

    def standardize_services(self, services: List[str]) -> List[str]:
        """Standardize service categories"""
        # Define standardized service categories
        service_map = {
            'food assistance': ['food pantry', 'food bank', 'food distribution'],
            'housing': ['shelter', 'housing assistance', 'rental assistance'],
            'medical': ['medical', 'healthcare', 'clinic'],
            'employment': ['job assistance', 'employment services', 'career center'],
            'education': ['education', 'training', 'tutoring'],
            'legal': ['legal aid', 'legal assistance', 'attorney'],
            'financial': ['financial assistance', 'cash assistance', 'food stamps']
        }
        
        standardized = []
        for service in services:
            service_lower = service.lower()
            added = False
            for category, keywords in service_map.items():
                if any(keyword in service_lower for keyword in keywords):
                    standardized.append(category)
                    added = True
            if not added:
                standardized.append(service)
        
        return list(set(standardized))

    def process_data(self, data: List[Dict]) -> List[Dict]:
        """Process and standardize the entire dataset"""
        processed_data = []
        
        for record in data:
            try:
                # Standardize address
                address_data = self.standardize_address(record['address'])
                
                # Standardize hours
                hours_data = self.standardize_hours(record['hours'])
                
                # Standardize services
                services = self.standardize_services(record['services'])
                
                processed_record = {
                    'source': record['source'],
                    'name': record['name'],
                    'address': address_data['address'],
                    'latitude': address_data['latitude'],
                    'longitude': address_data['longitude'],
                    'city': address_data['city'],
                    'state': address_data['state'],
                    'zip_code': address_data['zip_code'],
                    'services': services,
                    'hours': hours_data,
                    'phone': record.get('phone', ''),
                    'website': record.get('website', ''),
                    'last_updated': record.get('last_updated', datetime.now().isoformat())
                }
                
                processed_data.append(processed_record)
                
            except Exception as e:
                logger.error(f"Error processing record {record['name']}: {str(e)}")
                continue
        
        return processed_data

    def save_processed_data(self, data: List[Dict], filename: Optional[str] = None) -> None:
        """Save the processed data to files"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"processed_social_services_{timestamp}"
            
        # Save as CSV
        df = pd.DataFrame(data)
        df.to_csv(f"../data/{filename}.csv", index=False)
        
        # Save as JSON
        with open(f"../data/{filename}.json", 'w') as f:
            json.dump(data, f, indent=2)
            
        logger.info(f"Saved processed data to {filename}.csv and {filename}.json")

    def run(self, input_file: str):
        """Run the complete data processing pipeline"""
        logger.info("Starting data processing pipeline...")
        
        try:
            # Load input data
            with open(input_file, 'r') as f:
                data = json.load(f)
            
            # Process data
            processed_data = self.process_data(data)
            
            # Save processed data
            self.save_processed_data(processed_data)
            
            logger.info(f"Data processing complete. Processed {len(processed_data)} records")
            
        except Exception as e:
            logger.error(f"Error in data processing pipeline: {str(e)}")

if __name__ == "__main__":
    # Example usage
    processor = DataProcessor()
    processor.run("../data/social_services_20240518_201534.json")  # Replace with actual filename
