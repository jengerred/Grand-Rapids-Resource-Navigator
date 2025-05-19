import boto3
from datetime import datetime, timedelta
import logging
from typing import Dict, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class CloudWatchMonitor:
    def __init__(self):
        """Initialize CloudWatch monitor"""
        self.cloudwatch = boto3.client('cloudwatch')
        self.log_group = os.getenv('CLOUDWATCH_LOG_GROUP', '/food-pantry-navigator')
        self.metrics_namespace = os.getenv('CLOUDWATCH_NAMESPACE', 'FoodPantryNavigator')
        
        # Set up logger
        self.logger = logging.getLogger(__name__)

    def put_metric(self, name: str, value: float, dimensions: Dict[str, str] = None):
        """Put a metric to CloudWatch"""
        try:
            self.cloudwatch.put_metric_data(
                Namespace=self.metrics_namespace,
                MetricData=[{
                    'MetricName': name,
                    'Dimensions': [{'Name': k, 'Value': v} for k, v in (dimensions or {}).items()],
                    'Timestamp': datetime.utcnow(),
                    'Value': value,
                    'Unit': 'Count'
                }]
            )
            self.logger.info(
                "Metric published",
                metric_name=name,
                value=value,
                dimensions=dimensions
            )
        except Exception as e:
            self.logger.error(
                "Error publishing metric",
                metric_name=name,
                error=str(e)
            )

    def get_metric_statistics(self, 
                            metric_name: str, 
                            dimensions: Dict[str, str],
                            period: int = 300,
                            start_time: datetime = None,
                            end_time: datetime = None) -> Dict:
        """Get metric statistics from CloudWatch"""
        if not start_time:
            start_time = datetime.utcnow() - timedelta(hours=1)
        if not end_time:
            end_time = datetime.utcnow()
            
        try:
            response = self.cloudwatch.get_metric_statistics(
                Namespace=self.metrics_namespace,
                MetricName=metric_name,
                Dimensions=[{'Name': k, 'Value': v} for k, v in dimensions.items()],
                StartTime=start_time,
                EndTime=end_time,
                Period=period,
                Statistics=['Average', 'Minimum', 'Maximum', 'SampleCount', 'Sum']
            )
            
            return {
                'timestamp': response['Label'],
                'statistics': response['Datapoints']
            }
        except Exception as e:
            self.logger.error(
                "Error getting metric statistics",
                metric_name=metric_name,
                error=str(e)
            )
            return {}

    def create_alarm(self, 
                    name: str, 
                    metric_name: str, 
                    threshold: float, 
                    comparison_operator: str,
                    evaluation_periods: int = 1,
                    period: int = 300,
                    dimensions: Dict[str, str] = None):
        """Create a CloudWatch alarm"""
        try:
            self.cloudwatch.put_metric_alarm(
                AlarmName=name,
                ComparisonOperator=comparison_operator,
                EvaluationPeriods=evaluation_periods,
                MetricName=metric_name,
                Namespace=self.metrics_namespace,
                Period=period,
                Statistic='Average',
                Threshold=threshold,
                ActionsEnabled=True,
                AlarmDescription=f'Alarm for {metric_name}',
                Dimensions=[{'Name': k, 'Value': v} for k, v in (dimensions or {}).items()],
                AlarmActions=[os.getenv('SNS_TOPIC_ARN')]
            )
            self.logger.info(
                "Alarm created",
                alarm_name=name,
                metric_name=metric_name,
                threshold=threshold
            )
        except Exception as e:
            self.logger.error(
                "Error creating alarm",
                alarm_name=name,
                error=str(e)
            )

    def create_dashboard(self, name: str, widgets: List[Dict]):
        """Create a CloudWatch dashboard"""
        try:
            self.cloudwatch.put_dashboard(
                DashboardName=name,
                DashboardBody=json.dumps({
                    'widgets': widgets
                })
            )
            self.logger.info(
                "Dashboard created",
                dashboard_name=name
            )
        except Exception as e:
            self.logger.error(
                "Error creating dashboard",
                dashboard_name=name,
                error=str(e)
            )

if __name__ == "__main__":
    # Example usage
    monitor = CloudWatchMonitor()
    
    # Put a sample metric
    monitor.put_metric(
        'DataCollectionSuccessRate',
        95.0,
        {'Service': 'DataCollector'}
    )
    
    # Create an alarm
    monitor.create_alarm(
        'HighErrorRate',
        'ErrorCount',
        10,
        'GreaterThanThreshold',
        dimensions={'Service': 'DataProcessor'}
    )
