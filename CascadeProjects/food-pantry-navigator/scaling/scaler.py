import boto3
import logging
from typing import Dict, Optional
from datetime import datetime, timedelta
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AutoScaler:
    def __init__(self):
        """Initialize auto scaler"""
        # AWS configuration
        self.aws_region = os.getenv('AWS_REGION', 'us-east-1')
        
        # Initialize AWS clients
        self.asg = boto3.client('autoscaling', region_name=self.aws_region)
        self.cloudwatch = boto3.client('cloudwatch', region_name=self.aws_region)
        
        # Scaling configuration
        self.scaling_config = {
            'asg': {
                'enabled': os.getenv('ENABLE_ASG_SCALING', 'true').lower() == 'true',
                'group_name': os.getenv('ASG_GROUP_NAME'),
                'min_size': int(os.getenv('ASG_MIN_SIZE', 2)),
                'max_size': int(os.getenv('ASG_MAX_SIZE', 10)),
                'desired_size': int(os.getenv('ASG_DESIRED_SIZE', 3))
            },
            'cpu': {
                'enabled': os.getenv('ENABLE_CPU_SCALING', 'true').lower() == 'true',
                'target_utilization': float(os.getenv('CPU_TARGET_UTILIZATION', 70.0)),
                'scale_up_threshold': float(os.getenv('CPU_SCALE_UP_THRESHOLD', 80.0)),
                'scale_down_threshold': float(os.getenv('CPU_SCALE_DOWN_THRESHOLD', 30.0))
            },
            'memory': {
                'enabled': os.getenv('ENABLE_MEMORY_SCALING', 'true').lower() == 'true',
                'target_utilization': float(os.getenv('MEMORY_TARGET_UTILIZATION', 70.0)),
                'scale_up_threshold': float(os.getenv('MEMORY_SCALE_UP_THRESHOLD', 80.0)),
                'scale_down_threshold': float(os.getenv('MEMORY_SCALE_DOWN_THRESHOLD', 30.0))
            },
            'request_rate': {
                'enabled': os.getenv('ENABLE_REQUEST_RATE_SCALING', 'true').lower() == 'true',
                'target_rps': int(os.getenv('REQUEST_RATE_TARGET', 100)),
                'scale_up_threshold': int(os.getenv('REQUEST_RATE_SCALE_UP_THRESHOLD', 150)),
                'scale_down_threshold': int(os.getenv('REQUEST_RATE_SCALE_DOWN_THRESHOLD', 50))
            }
        }
        
        # Set up logger
        self.logger = logging.getLogger(__name__)

    def get_current_metrics(self) -> Dict:
        """Get current metrics from CloudWatch"""
        try:
            # Define metric queries
            queries = [
                {
                    'Id': 'cpu_utilization',
                    'MetricStat': {
                        'Metric': {
                            'Namespace': 'AWS/EC2',
                            'MetricName': 'CPUUtilization',
                            'Dimensions': [{'Name': 'AutoScalingGroupName', 'Value': self.scaling_config['asg']['group_name']}]
                        },
                        'Period': 300,
                        'Stat': 'Average'
                    }
                },
                {
                    'Id': 'memory_utilization',
                    'MetricStat': {
                        'Metric': {
                            'Namespace': 'System/Linux',
                            'MetricName': 'MemoryUtilization',
                            'Dimensions': [{'Name': 'AutoScalingGroupName', 'Value': self.scaling_config['asg']['group_name']}]
                        },
                        'Period': 300,
                        'Stat': 'Average'
                    }
                },
                {
                    'Id': 'request_rate',
                    'MetricStat': {
                        'Metric': {
                            'Namespace': 'Custom/Application',
                            'MetricName': 'RequestRate',
                            'Dimensions': [{'Name': 'Service', 'Value': 'API'}]
                        },
                        'Period': 300,
                        'Stat': 'Sum'
                    }
                }
            ]
            
            # Get metrics
            response = self.cloudwatch.get_metric_data(
                MetricDataQueries=queries,
                StartTime=datetime.now() - timedelta(minutes=5),
                EndTime=datetime.now()
            )
            
            # Process results
            metrics = {}
            for result in response['MetricDataResults']:
                if result['Id'] == 'cpu_utilization':
                    metrics['cpu'] = result['Values'][-1] if result['Values'] else 0.0
                elif result['Id'] == 'memory_utilization':
                    metrics['memory'] = result['Values'][-1] if result['Values'] else 0.0
                elif result['Id'] == 'request_rate':
                    metrics['request_rate'] = result['Values'][-1] if result['Values'] else 0.0
            
            self.logger.info(
                "Metrics retrieved",
                metrics=metrics
            )
            
            return metrics
            
        except Exception as e:
            self.logger.error(
                "Error getting metrics",
                error=str(e)
            )
            return {}

    def scale_asg(self, desired_capacity: int) -> bool:
        """Scale Auto Scaling Group"""
        try:
            if not self.scaling_config['asg']['enabled']:
                self.logger.info("ASG scaling disabled")
                return False
                
            # Update ASG
            self.asg.update_auto_scaling_group(
                AutoScalingGroupName=self.scaling_config['asg']['group_name'],
                MinSize=self.scaling_config['asg']['min_size'],
                MaxSize=self.scaling_config['asg']['max_size'],
                DesiredCapacity=desired_capacity
            )
            
            self.logger.info(
                "ASG scaled",
                desired_capacity=desired_capacity
            )
            
            return True
            
        except Exception as e:
            self.logger.error(
                "Error scaling ASG",
                error=str(e)
            )
            return False

    def scale_based_on_cpu(self, current_cpu: float) -> bool:
        """Scale based on CPU utilization"""
        if not self.scaling_config['cpu']['enabled']:
            self.logger.info("CPU scaling disabled")
            return False
            
        try:
            current_instances = self.get_current_instance_count()
            
            if current_cpu > self.scaling_config['cpu']['scale_up_threshold'] and \
               current_instances < self.scaling_config['asg']['max_size']:
                # Scale up
                new_instances = min(
                    current_instances + 1,
                    self.scaling_config['asg']['max_size']
                )
                return self.scale_asg(new_instances)
                
            elif current_cpu < self.scaling_config['cpu']['scale_down_threshold'] and \
                 current_instances > self.scaling_config['asg']['min_size']:
                # Scale down
                new_instances = max(
                    current_instances - 1,
                    self.scaling_config['asg']['min_size']
                )
                return self.scale_asg(new_instances)
                
            return False
            
        except Exception as e:
            self.logger.error(
                "Error scaling based on CPU",
                error=str(e)
            )
            return False

    def scale_based_on_memory(self, current_memory: float) -> bool:
        """Scale based on memory utilization"""
        if not self.scaling_config['memory']['enabled']:
            self.logger.info("Memory scaling disabled")
            return False
            
        try:
            current_instances = self.get_current_instance_count()
            
            if current_memory > self.scaling_config['memory']['scale_up_threshold'] and \
               current_instances < self.scaling_config['asg']['max_size']:
                # Scale up
                new_instances = min(
                    current_instances + 1,
                    self.scaling_config['asg']['max_size']
                )
                return self.scale_asg(new_instances)
                
            elif current_memory < self.scaling_config['memory']['scale_down_threshold'] and \
                 current_instances > self.scaling_config['asg']['min_size']:
                # Scale down
                new_instances = max(
                    current_instances - 1,
                    self.scaling_config['asg']['min_size']
                )
                return self.scale_asg(new_instances)
                
            return False
            
        except Exception as e:
            self.logger.error(
                "Error scaling based on memory",
                error=str(e)
            )
            return False

    def scale_based_on_request_rate(self, current_rate: float) -> bool:
        """Scale based on request rate"""
        if not self.scaling_config['request_rate']['enabled']:
            self.logger.info("Request rate scaling disabled")
            return False
            
        try:
            current_instances = self.get_current_instance_count()
            
            if current_rate > self.scaling_config['request_rate']['scale_up_threshold'] and \
               current_instances < self.scaling_config['asg']['max_size']:
                # Scale up
                new_instances = min(
                    current_instances + 1,
                    self.scaling_config['asg']['max_size']
                )
                return self.scale_asg(new_instances)
                
            elif current_rate < self.scaling_config['request_rate']['scale_down_threshold'] and \
                 current_instances > self.scaling_config['asg']['min_size']:
                # Scale down
                new_instances = max(
                    current_instances - 1,
                    self.scaling_config['asg']['min_size']
                )
                return self.scale_asg(new_instances)
                
            return False
            
        except Exception as e:
            self.logger.error(
                "Error scaling based on request rate",
                error=str(e)
            )
            return False

    def get_current_instance_count(self) -> int:
        """Get current instance count in ASG"""
        try:
            response = self.asg.describe_auto_scaling_groups(
                AutoScalingGroupNames=[self.scaling_config['asg']['group_name']]
            )
            
            if not response['AutoScalingGroups']:
                raise ValueError(f"Auto Scaling Group {self.scaling_config['asg']['group_name']} not found")
                
            asg = response['AutoScalingGroups'][0]
            return len(asg['Instances'])
            
        except Exception as e:
            self.logger.error(
                "Error getting instance count",
                error=str(e)
            )
            return 0

    def run_scaling_decision(self) -> Dict:
        """Run scaling decision process"""
        try:
            # Get current metrics
            metrics = self.get_current_metrics()
            
            # Make scaling decisions
            decisions = {
                'cpu': self.scale_based_on_cpu(metrics.get('cpu', 0.0)),
                'memory': self.scale_based_on_memory(metrics.get('memory', 0.0)),
                'request_rate': self.scale_based_on_request_rate(metrics.get('request_rate', 0.0))
            }
            
            self.logger.info(
                "Scaling decisions made",
                decisions=decisions
            )
            
            return {
                'metrics': metrics,
                'decisions': decisions,
                'current_instances': self.get_current_instance_count()
            }
            
        except Exception as e:
            self.logger.error(
                "Error running scaling decision",
                error=str(e)
            )
            return {}

    def create_scaling_policies(self) -> Dict:
        """Create scaling policies"""
        try:
            # Create CPU scaling policy
            cpu_policy = self.asg.put_scaling_policy(
                AutoScalingGroupName=self.scaling_config['asg']['group_name'],
                PolicyName='CPUUtilizationScaling',
                PolicyType='TargetTrackingScaling',
                TargetTrackingConfiguration={
                    'PredefinedMetricSpecification': {
                        'PredefinedMetricType': 'ASGAverageCPUUtilization'
                    },
                    'TargetValue': self.scaling_config['cpu']['target_utilization']
                }
            )
            
            # Create Memory scaling policy
            memory_policy = self.asg.put_scaling_policy(
                AutoScalingGroupName=self.scaling_config['asg']['group_name'],
                PolicyName='MemoryUtilizationScaling',
                PolicyType='TargetTrackingScaling',
                TargetTrackingConfiguration={
                    'PredefinedMetricSpecification': {
                        'PredefinedMetricType': 'ASGAverageMemoryUtilization'
                    },
                    'TargetValue': self.scaling_config['memory']['target_utilization']
                }
            )
            
            # Create Request Rate scaling policy
            request_policy = self.asg.put_scaling_policy(
                AutoScalingGroupName=self.scaling_config['asg']['group_name'],
                PolicyName='RequestRateScaling',
                PolicyType='TargetTrackingScaling',
                TargetTrackingConfiguration={
                    'CustomizedMetricSpecification': {
                        'MetricName': 'RequestRate',
                        'Namespace': 'Custom/Application',
                        'Dimensions': [{'Name': 'Service', 'Value': 'API'}],
                        'Statistic': 'Sum'
                    },
                    'TargetValue': self.scaling_config['request_rate']['target_rps']
                }
            )
            
            self.logger.info(
                "Scaling policies created",
                cpu_policy=cpu_policy['PolicyARN'],
                memory_policy=memory_policy['PolicyARN'],
                request_policy=request_policy['PolicyARN']
            )
            
            return {
                'cpu_policy': cpu_policy,
                'memory_policy': memory_policy,
                'request_policy': request_policy
            }
            
        except Exception as e:
            self.logger.error(
                "Error creating scaling policies",
                error=str(e)
            )
            return {}

if __name__ == "__main__":
    # Example usage
    scaler = AutoScaler()
    
    # Create scaling policies
    policies = scaler.create_scaling_policies()
    
    # Run scaling decision
    decision = scaler.run_scaling_decision()
    
    # Print results
    print(f"Scaling decision: {decision}")
