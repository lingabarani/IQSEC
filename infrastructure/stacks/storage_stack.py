"""
Storage Stack:
- Environment-aware Amazon S3 Buckets for RFP Ingestion, Knowledge Base, and Deliverables.
- Auto-deletion of objects in dev for seamless teardowns; RETAIN in prod.
"""

from aws_cdk import (
    RemovalPolicy,
    Duration,
    aws_s3 as s3,
    aws_kms as kms
)
from constructs import Construct


class StorageConstruct(Construct):
    def __init__(self, scope: Construct, construct_id: str, encryption_key: kms.IKey, stage: str = "dev", **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        is_prod = stage.lower() == "prod"
        removal_policy = RemovalPolicy.RETAIN if is_prod else RemovalPolicy.DESTROY
        auto_delete = not is_prod

        # 1. Bucket for Customer RFP & Tender Ingestion
        self.rfp_bucket = s3.Bucket(
            self, "IQSECRFPBucket",
            encryption=s3.BucketEncryption.KMS,
            encryption_key=encryption_key,
            bucket_key_enabled=True,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            enforce_ssl=True,
            versioned=True,
            auto_delete_objects=auto_delete,
            lifecycle_rules=[
                s3.LifecycleRule(
                    id="TransitionOldRFPsToGlacier",
                    transitions=[
                        s3.Transition(
                            storage_class=s3.StorageClass.GLACIER_INSTANT_RETRIEVAL,
                            transition_after=Duration.days(90)
                        )
                    ]
                )
            ],
            removal_policy=removal_policy
        )

        # 2. Bucket for IQSEC Internal Knowledge Base (Datasheets, Catalogs, Manuals)
        self.knowledge_bucket = s3.Bucket(
            self, "IQSECKnowledgeBucket",
            encryption=s3.BucketEncryption.KMS,
            encryption_key=encryption_key,
            bucket_key_enabled=True,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            enforce_ssl=True,
            versioned=True,
            auto_delete_objects=auto_delete,
            removal_policy=removal_policy
        )

        # 3. Bucket for Generated Final Deliverables (XLSX, DOCX, PPTX)
        self.deliverables_bucket = s3.Bucket(
            self, "IQSECDeliverablesBucket",
            encryption=s3.BucketEncryption.KMS,
            encryption_key=encryption_key,
            bucket_key_enabled=True,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            enforce_ssl=True,
            versioned=True,
            auto_delete_objects=auto_delete,
            removal_policy=removal_policy
        )
