import redis
import time
from typing import Dict, Optional
from datetime import datetime, timedelta
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class RateLimiter:
    def __init__(self):
        """Initialize rate limiter"""
        # Redis configuration
        self.redis_host = os.getenv('REDIS_HOST', 'localhost')
        self.redis_port = int(os.getenv('REDIS_PORT', 6379))
        self.redis_db = int(os.getenv('REDIS_DB', 0))
        self.redis_password = os.getenv('REDIS_PASSWORD')
        
        # Connect to Redis
        self.redis = redis.Redis(
            host=self.redis_host,
            port=self.redis_port,
            db=self.redis_db,
            password=self.redis_password
        )
        
        # Rate limiting configuration
        self.limits = {
            'api': {
                'requests_per_minute': int(os.getenv('API_REQUESTS_PER_MINUTE', 1000)),
                'window_size_seconds': 60,
                'max_burst': int(os.getenv('API_MAX_BURST', 100))
            },
            'data_collection': {
                'requests_per_hour': int(os.getenv('DATA_COLLECTION_REQUESTS_PER_HOUR', 100)),
                'window_size_seconds': 3600,
                'max_burst': int(os.getenv('DATA_COLLECTION_MAX_BURST', 20))
            },
            'route_optimization': {
                'requests_per_minute': int(os.getenv('ROUTE_OPTIMIZATION_REQUESTS_PER_MINUTE', 500)),
                'window_size_seconds': 60,
                'max_burst': int(os.getenv('ROUTE_OPTIMIZATION_MAX_BURST', 50))
            }
        }
        
        # Set up logger
        self.logger = logging.getLogger(__name__)

    def _get_limit_key(self, client_id: str, service: str) -> str:
        """Generate Redis key for rate limiting"""
        return f"rate_limit:{service}:{client_id}:{int(time.time() // self.limits[service]['window_size_seconds'])}"

    def _get_burst_key(self, client_id: str, service: str) -> str:
        """Generate Redis key for burst tracking"""
        return f"burst_limit:{service}:{client_id}"

    def check_limit(self, client_id: str, service: str) -> bool:
        """Check if request is allowed based on rate limit"""
        try:
            if service not in self.limits:
                raise ValueError(f"Unknown service: {service}")
                
            limit_config = self.limits[service]
            
            # Get current count
            key = self._get_limit_key(client_id, service)
            current_count = int(self.redis.get(key) or 0)
            
            # Check if within burst limit
            burst_key = self._get_burst_key(client_id, service)
            burst_count = int(self.redis.get(burst_key) or 0)
            
            if burst_count >= limit_config['max_burst']:
                self.logger.warning(
                    "Burst limit exceeded",
                    client_id=client_id,
                    service=service,
                    burst_count=burst_count
                )
                return False
                
            # Check if within rate limit
            if current_count >= limit_config['requests_per_minute']:
                self.logger.warning(
                    "Rate limit exceeded",
                    client_id=client_id,
                    service=service,
                    current_count=current_count
                )
                return False
                
            # Increment counters
            self.redis.incr(key)
            self.redis.incr(burst_key)
            
            # Set expiration
            self.redis.expire(
                key,
                limit_config['window_size_seconds']
            )
            self.redis.expire(
                burst_key,
                limit_config['window_size_seconds']
            )
            
            return True
            
        except Exception as e:
            self.logger.error(
                "Error checking rate limit",
                client_id=client_id,
                service=service,
                error=str(e)
            )
            return False

    def reset_limit(self, client_id: str, service: str) -> None:
        """Reset rate limit for a client"""
        try:
            key = self._get_limit_key(client_id, service)
            burst_key = self._get_burst_key(client_id, service)
            
            self.redis.delete(key)
            self.redis.delete(burst_key)
            
            self.logger.info(
                "Rate limit reset",
                client_id=client_id,
                service=service
            )
            
        except Exception as e:
            self.logger.error(
                "Error resetting rate limit",
                client_id=client_id,
                service=service,
                error=str(e)
            )

    def get_limit_info(self, client_id: str, service: str) -> Dict:
        """Get current rate limit information"""
        try:
            if service not in self.limits:
                raise ValueError(f"Unknown service: {service}")
                
            limit_config = self.limits[service]
            
            # Get current counts
            key = self._get_limit_key(client_id, service)
            burst_key = self._get_burst_key(client_id, service)
            
            current_count = int(self.redis.get(key) or 0)
            burst_count = int(self.redis.get(burst_key) or 0)
            
            return {
                'service': service,
                'client_id': client_id,
                'current_count': current_count,
                'burst_count': burst_count,
                'limit': limit_config['requests_per_minute'],
                'max_burst': limit_config['max_burst'],
                'window_size': limit_config['window_size_seconds'],
                'reset_time': datetime.now() + timedelta(seconds=limit_config['window_size_seconds'])
            }
            
        except Exception as e:
            self.logger.error(
                "Error getting limit info",
                client_id=client_id,
                service=service,
                error=str(e)
            )
            return {
                'error': str(e)
            }

if __name__ == "__main__":
    # Example usage
    limiter = RateLimiter()
    
    # Test rate limiting
    client_id = "test_client"
    service = "api"
    
    # Check limit
    allowed = limiter.check_limit(client_id, service)
    print(f"Request allowed: {allowed}")
    
    # Get limit info
    info = limiter.get_limit_info(client_id, service)
    print(f"Limit info: {info}")
