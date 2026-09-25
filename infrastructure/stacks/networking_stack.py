"""
Networking Stack:
- Environment-aware Multi-AZ VPC with Public, Private, and Isolated Subnets.
- Least-Privilege Security Groups.
"""

from aws_cdk import (
    aws_ec2 as ec2
)
from constructs import Construct


class NetworkingConstruct(Construct):
    def __init__(self, scope: Construct, construct_id: str, stage: str = "dev", **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        is_prod = stage.lower() == "prod"

        # 1. Multi-AZ VPC (1 NAT Gateway in dev to minimize cost, 2 in prod)
        self.vpc = ec2.Vpc(
            self, "IQSECVpc",
            max_azs=2,
            nat_gateways=2 if is_prod else 1,
            ip_addresses=ec2.IpAddresses.cidr("10.0.0.0/16"),
            subnet_configuration=[
                ec2.SubnetConfiguration(
                    name=f"{stage}-Public",
                    subnet_type=ec2.SubnetType.PUBLIC,
                    cidr_mask=24
                ),
                ec2.SubnetConfiguration(
                    name=f"{stage}-PrivateApp",
                    subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    cidr_mask=24
                ),
                ec2.SubnetConfiguration(
                    name=f"{stage}-IsolatedDatabase",
                    subnet_type=ec2.SubnetType.PRIVATE_ISOLATED,
                    cidr_mask=24
                )
            ]
        )

        # 2. Security Group for FastAPI Backend Service
        self.app_security_group = ec2.SecurityGroup(
            self, "IQSECAppSecurityGroup",
            vpc=self.vpc,
            description=f"Security Group for IQSEC [{stage.upper()}] Backend FastAPI Services",
            allow_all_outbound=True
        )

        # 3. Security Group for RDS PostgreSQL (Isolated Database)
        self.db_security_group = ec2.SecurityGroup(
            self, "IQSECDbSecurityGroup",
            vpc=self.vpc,
            description=f"Security Group for Amazon RDS PostgreSQL [{stage.upper()}]",
            allow_all_outbound=False
        )

        # Allow inbound connection on port 5432 strictly from App Security Group
        self.db_security_group.add_ingress_rule(
            peer=self.app_security_group,
            connection=ec2.Port.tcp(5432),
            description=f"Allow PostgreSQL connections strictly from App backend in {stage}"
        )
