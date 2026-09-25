#!/usr/bin/env python3
"""
CDK App Entrypoint for IQSEC GenAI Proposal Automation Platform.
Supports multi-environment deployments (dev / staging / prod).
Usage:
    cdk synth -c env=dev
    cdk deploy --all -c env=dev
    cdk deploy --all -c env=prod
"""

import os
import aws_cdk as cdk
from main_stack import IQSECPlatformStack

app = cdk.App()

# Read target environment from CDK Context or Environment Variable (default: dev)
stage = app.node.try_get_context("env") or os.getenv("ENVIRONMENT", "dev").lower()
if stage not in ["dev", "staging", "prod"]:
    print(f"Warning: Unknown stage '{stage}', defaulting to 'dev'")
    stage = "dev"

env = cdk.Environment(
    account=os.getenv("CDK_DEFAULT_ACCOUNT", os.getenv("AWS_ACCOUNT_ID")),
    region=os.getenv("CDK_DEFAULT_REGION", os.getenv("AWS_REGION", "us-east-1"))
)

stack_name = f"IQSEC-{stage.capitalize()}-Proposal-Automation-Stack"

IQSECPlatformStack(
    app, stack_name,
    stage=stage,
    env=env,
    description=f"IQSEC GenAI Proposal Automation Platform [{stage.upper()}] Infrastructure"
)

app.synth()
