import asyncio
import aiohttp
import json
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import redis
from dotenv import load_dotenv
import pandas as pd
from geopy.geocoders import Nominatim

# Load environment variables
load_dotenv()

class RealTimeDataCollector:
    def __init__(self):
        """Initialize real-time data collector"""
        # Redis configuration
        self.redis_host = os.getenv('REDIS_HOST', 'localhost')
        self.redis_port = int(os.getenv('REDIS_PORT', 6379))
        self.redis_db = int(os.getenv('REDIS_DB', 0))
        self.redis = redis.Redis(
            host=self.redis_host,
            port=self.redis_port,
            db=self.redis_db
        )
        
        # API configuration
        self.api_config = {
            'foodbank_api': {
                'enabled': os.getenv('ENABLE_FOODBANK_API', 'true').lower() == 'true',
                'base_url': os.getenv('FOODBANK_API_URL'),
                'api_key': os.getenv('FOODBANK_API_KEY'),
                'update_interval': int(os.getenv('FOODBANK_UPDATE_INTERVAL', 300))  # 5 minutes
            },
            'weather_api': {
                'enabled': os.getenv('ENABLE_WEATHER_API', 'true').lower() == 'true',
                'base_url': os.getenv('WEATHER_API_URL'),
                'api_key': os.getenv('WEATHER_API_KEY'),
                'update_interval': int(os.getenv('WEATHER_UPDATE_INTERVAL', 3600))  # 1 hour
            },
            'queue_api': {
                'enabled': os.getenv('ENABLE_QUEUE_API', 'true').lower() == 'true',
                'base_url': os.getenv('QUEUE_API_URL'),
                'update_interval': int(os.getenv('QUEUE_UPDATE_INTERVAL', 60))  # 1 minute
            }
        }
        
        # Set up logger
        self.logger = logging.getLogger(__name__)
        
        # Initialize geocoding
        self.geolocator = Nominatim(user_agent="food_pantry_navigator")

    async def get_foodbank_data(self) -> Dict:
        """Get real-time food bank data"""
        if not self.api_config['foodbank_api']['enabled']:
            return {}
            
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_config['foodbank_api']['base_url']}/inventory",
                    headers={'Authorization': f"Bearer {self.api_config['foodbank_api']['api_key']}"}
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data
                    else:
                        self.logger.error(
                            "Failed to get foodbank data",
                            status=response.status
                        )
                        return {}
        except Exception as e:
            self.logger.error(
                "Error getting foodbank data",
                error=str(e)
            )
            return {}

    async def get_weather_data(self, location: str) -> Dict:
        """Get real-time weather data"""
        if not self.api_config['weather_api']['enabled']:
            return {}
            
        try:
            # Get coordinates from location
            location_data = self.geolocator.geocode(location)
            if not location_data:
                return {}
                
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_config['weather_api']['base_url']}/current",
                    params={
                        'lat': location_data.latitude,
                        'lon': location_data.longitude,
                        'appid': self.api_config['weather_api']['api_key']
                    }
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data
                    else:
                        self.logger.error(
                            "Failed to get weather data",
                            status=response.status
                        )
                        return {}
        except Exception as e:
            self.logger.error(
                "Error getting weather data",
                error=str(e)
            )
            return {}

    async def get_queue_data(self, location_id: str) -> Dict:
        """Get real-time queue data"""
        if not self.api_config['queue_api']['enabled']:
            return {}
            
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_config['queue_api']['base_url']}/queue/{location_id}",
                    headers={'Authorization': f"Bearer {self.api_config['queue_api']['api_key']}"}
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data
                    else:
                        self.logger.error(
                            "Failed to get queue data",
                            status=response.status
                        )
                        return {}
        except Exception as e:
            self.logger.error(
                "Error getting queue data",
                error=str(e)
            )
            return {}

    async def update_redis_cache(self, data: Dict, cache_key: str, ttl: int):
        """Update Redis cache with real-time data"""
        try:
            # Store data in Redis
            self.redis.set(cache_key, json.dumps(data))
            # Set expiration
            self.redis.expire(cache_key, ttl)
            
            self.logger.info(
                "Cache updated",
                cache_key=cache_key
            )
            
        except Exception as e:
            self.logger.error(
                "Error updating cache",
                error=str(e)
            )

    async def collect_realtime_data(self):
        """Collect all real-time data"""
        try:
            # Get food bank data
            foodbank_data = await self.get_foodbank_data()
            if foodbank_data:
                await self.update_redis_cache(
                    foodbank_data,
                    'foodbank:inventory',
                    self.api_config['foodbank_api']['update_interval']
                )
            
            # Get weather data for each location
            locations = self.redis.smembers('locations')
            for location in locations:
                weather_data = await self.get_weather_data(location)
                if weather_data:
                    await self.update_redis_cache(
                        weather_data,
                        f'weather:{location}',
                        self.api_config['weather_api']['update_interval']
                    )
            
            # Get queue data for each location
            location_ids = self.redis.smembers('location_ids')
            for location_id in location_ids:
                queue_data = await self.get_queue_data(location_id)
                if queue_data:
                    await self.update_redis_cache(
                        queue_data,
                        f'queue:{location_id}',
                        self.api_config['queue_api']['update_interval']
                    )
            
        except Exception as e:
            self.logger.error(
                "Error collecting real-time data",
                error=str(e)
            )

    async def run_data_collection(self):
        """Run continuous data collection"""
        while True:
            try:
                await self.collect_realtime_data()
                # Wait before next collection
                await asyncio.sleep(60)  # Check every minute
            except Exception as e:
                self.logger.error(
                    "Error in data collection loop",
                    error=str(e)
                )
                # Wait before retrying
                await asyncio.sleep(60)

    def start_data_collection(self):
        """Start the data collection process"""
        asyncio.run(self.run_data_collection())

if __name__ == "__main__":
    collector = RealTimeDataCollector()
    collector.start_data_collection()
