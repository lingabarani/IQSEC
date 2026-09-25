"""
Database Stack:
- Environment-aware Amazon RDS for PostgreSQL.
- Dev: db.t4g.micro/small with 20 GB storage, 1-day retention (Free Tier / Budget Friendly).
- Prod: db.t4g.medium with 50 GB storage, Multi-AZ, 7-day retention.
"""

from aws_cdk import (
    RemovalPolicy,
    Duration,
    aws_rds as rds,
    aws_ec2 as ec2,
    aws_kms as kms,
    aws_secretsmanager as secretsmanager
)
from constructs import Construct


class DatabaseConstruct(Construct):
    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        vpc: ec2.IVpc,
        db_security_group: ec2.ISecurityGroup,
        db_secret: secretsmanager.ISecret,
        encryption_key: kms.IKey,
        stage: str = "dev",
        **kwargs
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        is_prod = stage.lower() == "prod"
        removal_policy = RemovalPolicy.SNAPSHOT if is_prod else RemovalPolicy.DESTROY

        # 1. Custom PostgreSQL Parameter Group
        self.parameter_group = rds.ParameterGroup(
            self, "IQSECPostgresParams",
            engine=rds.DatabaseInstanceEngine.postgres(version=rds.PostgresEngineVersion.VER_16),
            description=f"Parameter group for IQSEC Proposal Platform [{stage.upper()}]",
            parameters={
                "shared_preload_libraries": "pg_stat_statements",
                "log_connections": "1",
                "log_disconnections": "1",
                "log_duration": "1"
            }
        )

        # 2. Sizing configuration based on environment
        instance_size = ec2.InstanceSize.MEDIUM if is_prod else ec2.InstanceSize.MICRO
        instance_type = ec2.InstanceType.of(
            ec2.InstanceClass.BURSTABLE4_GRAVITON,
            instance_size
        )
        allocated_storage = 50 if is_prod else 20
        max_allocated_storage = 200 if is_prod else 50
        backup_retention = Duration.days(7) if is_prod else Duration.days(1)
        multi_az = is_prod

        # 3. Amazon RDS for PostgreSQL Instance
        self.db_instance = rds.DatabaseInstance(
            self, "IQSECRDSPostgres",
            instance_identifier=f"iqsec-{stage}-proposal-db",
            engine=rds.DatabaseInstanceEngine.postgres(version=rds.PostgresEngineVersion.VER_16),
            instance_type=instance_type,
            vpc=vpc,
            vpc_subnets=ec2.SubnetSelection(subnet_type=ec2.SubnetType.PRIVATE_ISOLATED),
            security_groups=[db_security_group],
            credentials=rds.Credentials.from_secret(db_secret),
            database_name="iqsec_proposals",
            storage_encryption_key=encryption_key,
            allocated_storage=allocated_storage,
            max_allocated_storage=max_allocated_storage,
            storage_type=rds.StorageType.GP3,
            parameter_group=self.parameter_group,
            backup_retention=backup_retention,
            delete_automated_backups=not is_prod,
            auto_minor_version_upgrade=True,
            multi_az=multi_az,
            removal_policy=removal_policy
        )
