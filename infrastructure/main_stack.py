"""
Master Infrastructure Stack for IQSEC GenAI Proposal Automation Platform
Environment-Aware (dev / staging / prod).
"""

from aws_cdk import (
    Stack,
    CfnOutput
)
from constructs import Construct

from stacks.security_stack import SecurityConstruct
from stacks.networking_stack import NetworkingConstruct
from stacks.storage_stack import StorageConstruct
from stacks.database_stack import DatabaseConstruct
from stacks.opensearch_stack import OpenSearchConstruct
from stacks.pipeline_stack import PipelineConstruct


class IQSECPlatformStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, stage: str = "dev", **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        self.stage = stage

        # 1. Security & Identity Layer
        security = SecurityConstruct(self, f"{stage}-Security", stage=stage)

        # 2. Networking Layer (VPC & Security Groups)
        networking = NetworkingConstruct(self, f"{stage}-Networking", stage=stage)

        # 3. Storage Layer (Amazon S3 Buckets)
        storage = StorageConstruct(
            self, f"{stage}-Storage",
            encryption_key=security.encryption_key,
            stage=stage
        )

        # 4. Database Layer (Amazon RDS PostgreSQL)
        database = DatabaseConstruct(
            self, f"{stage}-Database",
            vpc=networking.vpc,
            db_security_group=networking.db_security_group,
            db_secret=security.db_secret,
            encryption_key=security.encryption_key,
            stage=stage
        )

        # 5. Search Layer (Amazon OpenSearch Serverless)
        opensearch = OpenSearchConstruct(
            self, f"{stage}-OpenSearch",
            encryption_key=security.encryption_key,
            stage=stage
        )

        # 6. Orchestration Layer (AWS Step Functions State Machine)
        pipeline = PipelineConstruct(self, f"{stage}-Pipeline", stage=stage)

        # ----------------------------------------------------------------------
        # Stack Outputs for Backend & Frontend Integration
        # ----------------------------------------------------------------------
        CfnOutput(
            self, "EnvironmentStage",
            value=stage,
            description="Active Deployment Environment Stage (dev/staging/prod)"
        )

        CfnOutput(
            self, "CognitoUserPoolId",
            value=security.user_pool.user_pool_id,
            description="Amazon Cognito User Pool ID"
        )

        CfnOutput(
            self, "CognitoClientId",
            value=security.user_pool_client.user_pool_client_id,
            description="Amazon Cognito App Client ID"
        )

        CfnOutput(
            self, "RFPBucketName",
            value=storage.rfp_bucket.bucket_name,
            description="S3 Bucket for Customer RFP Uploads"
        )

        CfnOutput(
            self, "KnowledgeBucketName",
            value=storage.knowledge_bucket.bucket_name,
            description="S3 Bucket for IQSEC Knowledge Base"
        )

        CfnOutput(
            self, "DeliverablesBucketName",
            value=storage.deliverables_bucket.bucket_name,
            description="S3 Bucket for Generated Deliverables"
        )

        CfnOutput(
            self, "RDSEndpoint",
            value=database.db_instance.db_instance_endpoint_address,
            description="Amazon RDS PostgreSQL Endpoint Address"
        )

        CfnOutput(
            self, "OpenSearchCollectionId",
            value=opensearch.collection.attr_id,
            description="Amazon OpenSearch Serverless Collection ID"
        )

        CfnOutput(
            self, "StepFunctionsArn",
            value=pipeline.state_machine.state_machine_arn,
            description="AWS Step Functions State Machine ARN"
        )
