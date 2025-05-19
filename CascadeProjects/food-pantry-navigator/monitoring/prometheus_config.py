from prometheus_client import start_http_server, Gauge, Counter, Histogram
import logging
from typing import Dict
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class PrometheusMonitor:
    def __init__(self):
        """Initialize Prometheus monitor"""
        # Start Prometheus server
        port = int(os.getenv('PROMETHEUS_PORT', 8000))
        start_http_server(port)
        
        # Set up metrics
        self.metrics = {
            'data_collection_success': Gauge(
                'data_collection_success',
                'Success rate of data collection',
                ['service', 'location']
            ),
            'data_processing_time': Histogram(
                'data_processing_time_seconds',
                'Time taken to process data',
                ['service']
            ),
            'api_requests': Counter(
                'api_requests_total',
                'Total API requests',
                ['endpoint', 'status']
            ),
            'error_count': Counter(
                'error_count_total',
                'Total errors',
                ['service', 'type']
            )
        }
        
        # Set up logger
        self.logger = logging.getLogger(__name__)

    def track_data_collection(self, service: str, location: str, success: bool):
        """Track data collection success/failure"""
        self.metrics['data_collection_success'].labels(
            service=service,
            location=location
        ).set(1 if success else 0)
        
        self.logger.info(
            "Data collection tracked",
            service=service,
            location=location,
            success=success
        )

    def track_processing_time(self, service: str, duration: float):
        """Track data processing time"""
        self.metrics['data_processing_time'].labels(service=service).observe(duration)
        
        self.logger.info(
            "Processing time tracked",
            service=service,
            duration=duration
        )

    def track_api_request(self, endpoint: str, status: str):
        """Track API request"""
        self.metrics['api_requests'].labels(
            endpoint=endpoint,
            status=status
        ).inc()
        
        self.logger.info(
            "API request tracked",
            endpoint=endpoint,
            status=status
        )

    def track_error(self, service: str, error_type: str):
        """Track error occurrence"""
        self.metrics['error_count'].labels(
            service=service,
            type=error_type
        ).inc()
        
        self.logger.error(
            "Error tracked",
            service=service,
            type=error_type
        )

    def get_metric_value(self, metric_name: str, labels: Dict[str, str] = None) -> float:
        """Get current value of a metric"""
        try:
            metric = self.metrics.get(metric_name)
            if not metric:
                raise ValueError(f"Metric {metric_name} not found")
                
            if labels:
                return metric.labels(**labels)._value.get()
            return metric._value.get()
            
        except Exception as e:
            self.logger.error(
                "Error getting metric value",
                metric_name=metric_name,
                error=str(e)
            )
            return 0.0

if __name__ == "__main__":
    # Example usage
    monitor = PrometheusMonitor()
    
    # Track some metrics
    monitor.track_data_collection('FeedingWM', 'Grand Rapids', True)
    monitor.track_processing_time('DataProcessor', 0.5)
    monitor.track_api_request('/api/services', '200')
