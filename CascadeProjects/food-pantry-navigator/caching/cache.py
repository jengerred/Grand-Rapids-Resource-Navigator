import redis
import json
from typing import Any, Optional, Dict
from datetime import datetime, timedelta
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Cache:
    def __init__(self):
        """Initialize cache"""
        # Redis configuration
        self.redis_host = os.getenv('REDIS_HOST', 'localhost')
        self.redis_port = int(os.getenv('REDIS_PORT', 6379))
        self.redis_db = int(os.getenv('REDIS_DB', 1))  # Use different DB than rate limiter
        self.redis_password = os.getenv('REDIS_PASSWORD')
        
        # Connect to Redis
        self.redis = redis.Redis(
            host=self.redis_host,
            port=self.redis_port,
            db=self.redis_db,
            password=self.redis_password
        )
        
        # Cache configuration
        self.cache_config = {
            'service_locations': {
                'ttl': int(os.getenv('CACHE_SERVICE_LOCATIONS_TTL', 3600)),  # 1 hour
                'refresh_interval': int(os.getenv('CACHE_SERVICE_LOCATIONS_REFRESH', 300)),  # 5 minutes
                'max_size': int(os.getenv('CACHE_SERVICE_LOCATIONS_MAX_SIZE', 1000))
            },
            'route_optimization': {
                'ttl': int(os.getenv('CACHE_ROUTE_OPTIMIZATION_TTL', 300)),  # 5 minutes
                'refresh_interval': int(os.getenv('CACHE_ROUTE_OPTIMIZATION_REFRESH', 60)),  # 1 minute
                'max_size': int(os.getenv('CACHE_ROUTE_OPTIMIZATION_MAX_SIZE', 100))
            },
            'weather_data': {
                'ttl': int(os.getenv('CACHE_WEATHER_DATA_TTL', 3600)),  # 1 hour
                'refresh_interval': int(os.getenv('CACHE_WEATHER_DATA_REFRESH', 300)),  # 5 minutes
                'max_size': int(os.getenv('CACHE_WEATHER_DATA_MAX_SIZE', 10))
            }
        }
        
        # Set up logger
        self.logger = logging.getLogger(__name__)

    def _get_cache_key(self, cache_type: str, key: str) -> str:
        """Generate Redis key for cache"""
        return f"cache:{cache_type}:{key}"

    def set(self, cache_type: str, key: str, value: Any) -> bool:
        """Set a value in cache"""
        try:
            if cache_type not in self.cache_config:
                raise ValueError(f"Unknown cache type: {cache_type}")
                
            cache_key = self._get_cache_key(cache_type, key)
            
            # Convert to JSON if not already
            if not isinstance(value, str):
                value = json.dumps(value)
                
            # Set value with TTL
            self.redis.set(
                cache_key,
                value,
                ex=self.cache_config[cache_type]['ttl']
            )
            
            self.logger.info(
                "Cache set",
                cache_type=cache_type,
                key=key,
                ttl=self.cache_config[cache_type]['ttl']
            )
            
            return True
            
        except Exception as e:
            self.logger.error(
                "Error setting cache",
                cache_type=cache_type,
                key=key,
                error=str(e)
            )
            return False

    def get(self, cache_type: str, key: str) -> Optional[Any]:
        """Get a value from cache"""
        try:
            if cache_type not in self.cache_config:
                raise ValueError(f"Unknown cache type: {cache_type}")
                
            cache_key = self._get_cache_key(cache_type, key)
            
            value = self.redis.get(cache_key)
            if value:
                # Try to parse JSON if possible
                try:
                    return json.loads(value)
                except json.JSONDecodeError:
                    return value.decode('utf-8')
            
            self.logger.debug(
                "Cache miss",
                cache_type=cache_type,
                key=key
            )
            
            return None
            
        except Exception as e:
            self.logger.error(
                "Error getting cache",
                cache_type=cache_type,
                key=key,
                error=str(e)
            )
            return None

    def delete(self, cache_type: str, key: str) -> bool:
        """Delete a value from cache"""
        try:
            if cache_type not in self.cache_config:
                raise ValueError(f"Unknown cache type: {cache_type}")
                
            cache_key = self._get_cache_key(cache_type, key)
            
            self.redis.delete(cache_key)
            
            self.logger.info(
                "Cache deleted",
                cache_type=cache_type,
                key=key
            )
            
            return True
            
        except Exception as e:
            self.logger.error(
                "Error deleting cache",
                cache_type=cache_type,
                key=key,
                error=str(e)
            )
            return False

    def clear_cache(self, cache_type: str = None) -> int:
        """Clear all cache or cache of specific type"""
        try:
            if cache_type and cache_type not in self.cache_config:
                raise ValueError(f"Unknown cache type: {cache_type}")
                
            pattern = f"cache:*" if not cache_type else f"cache:{cache_type}:*"
            
            keys = self.redis.keys(pattern)
            if keys:
                self.redis.delete(*keys)
                
            self.logger.info(
                "Cache cleared",
                cache_type=cache_type,
                keys_cleared=len(keys)
            )
            
            return len(keys)
            
        except Exception as e:
            self.logger.error(
                "Error clearing cache",
                cache_type=cache_type,
                error=str(e)
            )
            return 0

    def get_cache_stats(self) -> Dict:
        """Get cache statistics"""
        try:
            stats = {}
            for cache_type, config in self.cache_config.items():
                pattern = f"cache:{cache_type}:*"
                keys = self.redis.keys(pattern)
                stats[cache_type] = {
                    'key_count': len(keys),
                    'ttl': config['ttl'],
                    'max_size': config['max_size']
                }
            
            self.logger.info(
                "Cache stats retrieved",
                stats=stats
            )
            
            return stats
            
        except Exception as e:
            self.logger.error(
                "Error getting cache stats",
                error=str(e)
            )
            return {}

    def should_refresh(self, cache_type: str, key: str) -> bool:
        """Check if cache should be refreshed"""
        try:
            if cache_type not in self.cache_config:
                raise ValueError(f"Unknown cache type: {cache_type}")
                
            cache_key = self._get_cache_key(cache_type, key)
            
            # Check if key exists
            if not self.redis.exists(cache_key):
                return True
                
            # Get time since last update
            last_update = self.redis.get(cache_key + ':timestamp')
            if not last_update:
                return True
                
            last_update = float(last_update)
            refresh_interval = self.cache_config[cache_type]['refresh_interval']
            
            return (time.time() - last_update) > refresh_interval
            
        except Exception as e:
            self.logger.error(
                "Error checking cache refresh",
                cache_type=cache_type,
                key=key,
                error=str(e)
            )
            return True

if __name__ == "__main__":
    # Example usage
    cache = Cache()
    
    # Test caching
    cache_type = "service_locations"
    key = "grand_rapids"
    value = {
        "location": "Grand Rapids",
        "services": [
            {"name": "Feeding WM", "type": "food_pantry"},
            {"name": "Salvation Army", "type": "shelter"}
        ]
    }
    
    # Set cache
    cache.set(cache_type, key, value)
    
    # Get from cache
    cached_value = cache.get(cache_type, key)
    print(f"Cached value: {cached_value}")
    
    # Get cache stats
    stats = cache.get_cache_stats()
    print(f"Cache stats: {stats}")
