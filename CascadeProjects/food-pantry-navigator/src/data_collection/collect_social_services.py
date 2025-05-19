import requests
from bs4 import BeautifulSoup
import pandas as pd
from geopy.geocoders import Nominatim
import time
from datetime import datetime
import json

# Initialize geolocator
geolocator = Nominatim(user_agent="food_pantry_navigator")

def get_geolocation(address):
    """Get latitude and longitude from address using geopy"""
    try:
        location = geolocator.geocode(address)
        if location:
            return location.latitude, location.longitude
        return None, None
    except:
        return None, None

def scrape_feeding_wm():
    """Scrape food pantry data from Feeding America West Michigan"""
    url = "https://www.feedwm.org/food-pantries/"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    pantries = []
    # This is a placeholder - actual scraping logic will depend on website structure
    # You'll need to inspect the website and adjust the selectors accordingly
    return pantries

def scrape_salvation_army():
    """Scrape Salvation Army locations"""
    url = "https://centralusa.salvationarmy.org/kentcounty/cure-hunger/"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    locations = []
    # This is a placeholder - actual scraping logic will depend on website structure
    return locations

def scrape_dhhs():
    """Scrape DHHS office locations"""
    # This would typically require an API or public dataset
    # For now, we'll create a mock dataset
    return [
        {
            "name": "Kent County DHHS",
            "address": "701 Ball Ave NE, Grand Rapids, MI 49503",
            "services": ["Food Assistance", "Cash Assistance", "Medicaid"]
        }
    ]

def scrape_ywca():
    """Scrape YWCA locations and services"""
    url = "https://www.ywcagrandrapids.org/programs/"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    locations = []
    # This is a placeholder - actual scraping logic will depend on website structure
    return locations

def collect_all_services():
    """Collect data from all sources and combine into a single DataFrame"""
    all_services = []
    
    # Collect from each source
    sources = {
        "food_pantry": scrape_feeding_wm(),
        "salvation_army": scrape_salvation_army(),
        "dhhs": scrape_dhhs(),
        "ywca": scrape_ywca()
    }
    
    # Process each source
    for source_name, source_data in sources.items():
        for service in source_data:
            lat, lon = get_geolocation(service.get('address', ''))
            service.update({
                'source': source_name,
                'latitude': lat,
                'longitude': lon,
                'last_updated': datetime.now().isoformat()
            })
            all_services.append(service)
    
    # Create DataFrame
    df = pd.DataFrame(all_services)
    
    # Save to CSV and JSON
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    df.to_csv(f"../data/social_services_{timestamp}.csv", index=False)
    df.to_json(f"../data/social_services_{timestamp}.json", orient='records')
    
    return df

if __name__ == "__main__":
    print("Starting data collection...")
    df = collect_all_services()
    print(f"Collected {len(df)} social service locations")
    print("Data collection complete!")
