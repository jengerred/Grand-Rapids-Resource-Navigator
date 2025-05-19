from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_dynamodb as dynamodb,
    aws_s3 as s3,
    aws_s3_deployment as s3_deploy,
    aws_cloudfront as cloudfront,
    aws_route53 as route53,
    aws_certificatemanager as acm,
    aws_route53_targets as targets,
    aws_sns as sns,
    aws_sqs as sqs,
    aws_lambda_event_sources as lambda_event_sources,
    aws_events as events,
    aws_events_targets as targets,
)
from constructs import Construct
import aws_cdk as cdk

class FoodPantryNavigatorStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Create DynamoDB tables
        services_table = dynamodb.Table(
            self,
            "ServicesTable",
            partition_key=dynamodb.Attribute(
                name="id",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST
        )

        # Create S3 bucket for static assets
        assets_bucket = s3.Bucket(
            self,
            "AssetsBucket",
            versioned=True,
            removal_policy=cdk.RemovalPolicy.RETAIN
        )

        # Deploy static assets
        s3_deploy.BucketDeployment(
            self,
            "DeployAssets",
            sources=[s3_deploy.Source.asset("../frontend/dist")],
            destination_bucket=assets_bucket
        )

        # Create CloudFront distribution
        distribution = cloudfront.Distribution(
            self,
            "Distribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=cloudfront_origins.S3Origin(assets_bucket)
            ),
            domain_names=["foodpantrynavigator.com"],
            certificate=acm.DnsValidatedCertificate(
                self,
                "Certificate",
                domain_name="foodpantrynavigator.com",
                hosted_zone=route53.HostedZone.from_lookup(
                    self,
                    "HostedZone",
                    domain_name="foodpantrynavigator.com"
                )
            )
        )

        # Create Lambda functions
        data_collector = _lambda.Function(
            self,
            "DataCollector",
            runtime=_lambda.Runtime.PYTHON_3_9,
            code=_lambda.Code.from_asset("../src/data_collection"),
            handler="collector.lambda_handler",
            environment={
                "TABLE_NAME": services_table.table_name
            }
        )

        # Create SQS queue for data processing
        processing_queue = sqs.Queue(
            self,
            "ProcessingQueue",
            visibility_timeout=cdk.Duration.seconds(300)
        )

        # Create SNS topic for notifications
        notification_topic = sns.Topic(
            self,
            "NotificationTopic"
        )

        # Create Lambda function for processing
        processor = _lambda.Function(
            self,
            "Processor",
            runtime=_lambda.Runtime.PYTHON_3_9,
            code=_lambda.Code.from_asset("../src/data_processing"),
            handler="processor.lambda_handler",
            environment={
                "TABLE_NAME": services_table.table_name,
                "QUEUE_URL": processing_queue.queue_url
            }
        )

        # Set up event source for processor
        processor.add_event_source(
            lambda_event_sources.SqsEventSource(processing_queue)
        )

        # Set up scheduled data collection
        events.Rule(
            self,
            "ScheduleRule",
            schedule=events.Schedule.rate(cdk.Duration.hours(1)),
            targets=[targets.LambdaFunction(data_collector)]
        )

        # Grant permissions
        services_table.grant_read_write_data(data_collector)
        services_table.grant_read_write_data(processor)
        processing_queue.grant_send_messages(data_collector)
        notification_topic.grant_publish(processor)

        # Output the CloudFront distribution domain
        cdk.CfnOutput(
            self,
            "DistributionDomain",
            value=distribution.domain_name
        )
