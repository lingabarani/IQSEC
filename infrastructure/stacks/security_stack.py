"""
Security & Identity Stack:
- Environment-aware (dev/prod) naming & configuration.
- AWS KMS Customer-Managed Key with automated rotation.
- Amazon Cognito User Pool with RBAC Groups & Custom Security Claims.
"""

from aws_cdk import (
    RemovalPolicy,
    Duration,
    aws_kms as kms,
    aws_cognito as cognito,
    aws_secretsmanager as secretsmanager
)
from constructs import Construct


class SecurityConstruct(Construct):
    def __init__(self, scope: Construct, construct_id: str, stage: str = "dev", **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        is_prod = stage.lower() == "prod"
        removal_policy = RemovalPolicy.RETAIN if is_prod else RemovalPolicy.DESTROY

        # 1. Customer Managed KMS Key with rotation
        self.encryption_key = kms.Key(
            self, "IQSECMasterKmsKey",
            alias=f"alias/iqsec-{stage}-proposal-platform",
            enable_key_rotation=True,
            description=f"KMS Key for IQSEC [{stage.upper()}] Proposal Platform (S3, RDS, OpenSearch)",
            removal_policy=removal_policy
        )

        # 2. Amazon Cognito User Pool for Authentication & RBAC
        self.user_pool = cognito.UserPool(
            self, "IQSECUserPool",
            user_pool_name=f"iqsec-{stage}-proposal-user-pool",
            self_sign_up_enabled=False,
            sign_in_aliases=cognito.SignInAliases(email=True, username=False),
            auto_verify=cognito.AutoVerifiedAttrs(email=True),
            standard_attributes=cognito.StandardAttributes(
                fullname=cognito.StandardAttribute(required=True, mutable=True),
                email=cognito.StandardAttribute(required=True, mutable=False)
            ),
            custom_attributes={
                "customer_scopes": cognito.StringAttribute(mutable=True),
                "nda_level": cognito.StringAttribute(mutable=True)
            },
            password_policy=cognito.PasswordPolicy(
                min_length=12 if is_prod else 8,
                require_uppercase=True,
                require_lowercase=True,
                require_digits=True,
                require_symbols=is_prod,
                temp_password_validity=Duration.days(7)
            ),
            account_recovery=cognito.AccountRecovery.EMAIL_ONLY,
            removal_policy=removal_policy
        )

        # 3. RBAC Groups in Cognito
        self.group_presales = cognito.CfnUserPoolGroup(
            self, "GroupPreSalesAnalyst",
            user_pool_id=self.user_pool.user_pool_id,
            group_name=f"{stage.upper()}_PreSalesAnalyst" if stage != "prod" else "PreSalesAnalyst",
            description="Pre-Sales & Licitation Analysts: Can upload RFPs and edit compliance matrix",
            precedence=10
        )

        self.group_commercial = cognito.CfnUserPoolGroup(
            self, "GroupCommercialManager",
            user_pool_id=self.user_pool.user_pool_id,
            group_name=f"{stage.upper()}_CommercialManager" if stage != "prod" else "CommercialManager",
            description="Commercial Managers: Can approve proposals and trigger deliverable exports",
            precedence=5
        )

        self.group_soc_architect = cognito.CfnUserPoolGroup(
            self, "GroupSOCArchitect",
            user_pool_id=self.user_pool.user_pool_id,
            group_name=f"{stage.upper()}_SOCSolutionsArchitect" if stage != "prod" else "SOCSolutionsArchitect",
            description="SOC Solution Architects: Can manage IQSEC technical knowledge catalog",
            precedence=1
        )

        # 4. User Pool Client for Web Application
        self.user_pool_client = self.user_pool.add_client(
            "IQSECWebClient",
            user_pool_client_name=f"iqsec-{stage}-web-app-client",
            auth_flows=cognito.AuthFlow(
                user_srp=True,
                user_password=True
            ),
            prevent_user_existence_errors=True,
            generate_secret=False,
            access_token_validity=Duration.hours(1),
            id_token_validity=Duration.hours(1),
            refresh_token_validity=Duration.days(30)
        )

        # 5. Database Secret in AWS Secrets Manager
        self.db_secret = secretsmanager.Secret(
            self, "IQSECDbSecret",
            secret_name=f"iqsec/{stage}/rds/postgres-credentials",
            description=f"PostgreSQL credentials for IQSEC [{stage.upper()}] Proposal Platform",
            encryption_key=self.encryption_key,
            generate_secret_string=secretsmanager.SecretStringGenerator(
                secret_string_template='{"username":"iqsec_admin"}',
                generate_string_key="password",
                exclude_characters='"@/\\\' '
            ),
            removal_policy=removal_policy
        )
