import logging
import os
from dotenv import load_dotenv
from monitoring.logging_config import setup_monitoring
from monitoring.cloudwatch_config import CloudWatchMonitor
from monitoring.prometheus_config import PrometheusMonitor

# Load environment variables
load_dotenv()

class MonitoringConfig:
    def __init__(self):
        """Initialize monitoring configuration"""
        # Set up logging
        self.logger = setup_monitoring()
        
        # Initialize monitors
        self.cloudwatch = None
        self.prometheus = None
        
        # Configure monitors based on environment
        if os.getenv('ENABLE_CLOUDWATCH', 'true').lower() == 'true':
            self.cloudwatch = CloudWatchMonitor()
            self.logger.info("CloudWatch monitoring enabled")
        
        if os.getenv('ENABLE_PROMETHEUS', 'true').lower() == 'true':
            self.prometheus = PrometheusMonitor()
            self.logger.info("Prometheus monitoring enabled")
        
        # Set up alert thresholds
        self.alert_thresholds = {
            'error_rate': float(os.getenv('ERROR_RATE_THRESHOLD', '0.05')),
            'latency_threshold': float(os.getenv('LATENCY_THRESHOLD', '2.0')),
            'data_collection_failure_threshold': float(os.getenv('DATA_COLLECTION_FAILURE_THRESHOLD', '0.1'))
        }
        
        # Set up monitoring intervals
        self.monitoring_intervals = {
            'error_check': int(os.getenv('ERROR_CHECK_INTERVAL', '60')),
            'latency_check': int(os.getenv('LATENCY_CHECK_INTERVAL', '300')),
            'data_collection_check': int(os.getenv('DATA_COLLECTION_CHECK_INTERVAL', '3600'))
        }
        
        self.logger.info(
            "Monitoring configuration initialized",
            alert_thresholds=self.alert_thresholds,
            monitoring_intervals=self.monitoring_intervals
        )

    def track_data_collection(self, service: str, location: str, success: bool, duration: float):
        """Track data collection metrics"""
        try:
            if self.prometheus:
                self.prometheus.track_data_collection(service, location, success)
                self.prometheus.track_processing_time(service, duration)
            
            if self.cloudwatch:
                self.cloudwatch.put_metric(
                    'DataCollectionSuccessRate',
                    100.0 if success else 0.0,
                    {'Service': service, 'Location': location}
                )
                self.cloudwatch.put_metric(
                    'DataCollectionDuration',
                    duration,
                    {'Service': service, 'Location': location}
                )
            
            self.logger.info(
                "Data collection metrics tracked",
                service=service,
                location=location,
                success=success,
                duration=duration
            )
            
        except Exception as e:
            self.logger.error(
                "Error tracking data collection metrics",
                error=str(e)
            )

    def track_api_request(self, endpoint: str, status: str, duration: float):
        """Track API request metrics"""
        try:
            if self.prometheus:
                self.prometheus.track_api_request(endpoint, status)
                self.prometheus.track_processing_time('API', duration)
            
            if self.cloudwatch:
                self.cloudwatch.put_metric(
                    'APIRequestCount',
                    1.0,
                    {'Endpoint': endpoint, 'Status': status}
                )
                self.cloudwatch.put_metric(
                    'APIRequestDuration',
                    duration,
                    {'Endpoint': endpoint}
                )
            
            self.logger.info(
                "API request metrics tracked",
                endpoint=endpoint,
                status=status,
                duration=duration
            )
            
        except Exception as e:
            self.logger.error(
                "Error tracking API request metrics",
                error=str(e)
            )

    def check_alerts(self):
        """Check for alerts based on configured thresholds"""
        try:
            if self.cloudwatch:
                # Check error rate
                error_stats = self.cloudwatch.get_metric_statistics(
                    'ErrorCount',
                    {'Service': 'DataProcessor'}
                )
                if error_stats:
                    error_rate = sum(d['Sum'] for d in error_stats['statistics']) / len(error_stats['statistics'])
                    if error_rate > self.alert_thresholds['error_rate']:
                        self.logger.warning(
                            "High error rate detected",
                            error_rate=error_rate,
                            threshold=self.alert_thresholds['error_rate']
                        )
                        self.trigger_alert(
                            'HighErrorRate',
                            f"Error rate ({error_rate:.2f}) exceeds threshold ({self.alert_thresholds['error_rate']:.2f})"
                        )
            
            if self.prometheus:
                # Check latency
                latency = self.prometheus.get_metric_value('data_processing_time_seconds')
                if latency > self.alert_thresholds['latency_threshold']:
                    self.logger.warning(
                        "High latency detected",
                        latency=latency,
                        threshold=self.alert_thresholds['latency_threshold']
                    )
                    self.trigger_alert(
                        'HighLatency',
                        f"Processing latency ({latency:.2f}s) exceeds threshold ({self.alert_thresholds['latency_threshold']:.2f}s)"
                    )
            
        except Exception as e:
            self.logger.error(
                "Error checking alerts",
                error=str(e)
            )

    def trigger_alert(self, alert_type: str, message: str):
        """Trigger an alert through configured channels"""
        try:
            self.logger.warning(
                "Alert triggered",
                alert_type=alert_type,
                message=message
            )
            
            # Send to configured alert channels
            if os.getenv('ENABLE_SLACK_ALERTS', 'false').lower() == 'true':
                self.send_slack_alert(alert_type, message)
            
            if os.getenv('ENABLE_EMAIL_ALERTS', 'false').lower() == 'true':
                self.send_email_alert(alert_type, message)
            
        except Exception as e:
            self.logger.error(
                "Error triggering alert",
                error=str(e)
            )

    def send_slack_alert(self, alert_type: str, message: str):
        """Send alert to Slack"""
        try:
            # This would use a Slack webhook URL from environment variables
            webhook_url = os.getenv('SLACK_WEBHOOK_URL')
            if webhook_url:
                # Implementation would use requests to send to Slack
                pass
        except Exception as e:
            self.logger.error(
                "Error sending Slack alert",
                error=str(e)
            )

    def send_email_alert(self, alert_type: str, message: str):
        """Send alert via email"""
        try:
            # This would use SMTP configuration from environment variables
            smtp_host = os.getenv('SMTP_HOST')
            smtp_port = os.getenv('SMTP_PORT')
            if smtp_host and smtp_port:
                # Implementation would use smtplib to send email
                pass
        except Exception as e:
            self.logger.error(
                "Error sending email alert",
                error=str(e)
            )

if __name__ == "__main__":
    # Example usage
    monitoring = MonitoringConfig()
    
    # Track some metrics
    monitoring.track_data_collection('FeedingWM', 'Grand Rapids', True, 0.5)
    monitoring.track_api_request('/api/services', '200', 0.1)
    
    # Check for alerts
    monitoring.check_alerts()
