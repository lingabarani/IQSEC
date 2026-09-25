"""
OpenSearch Serverless Stack:
- Environment-aware Amazon OpenSearch Serverless Vector Collection.
"""

import json
from aws_cdk import (
    aws_opensearchserverless as aoss,
    aws_kms as kms,
    aws_iam as iam
)
from constructs import Construct


class OpenSearchConstruct(Construct):
    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        encryption_key: kms.IKey,
        stage: str = "dev",
        **kwargs
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        collection_name = f"iqsec-{stage}-kb"

        # 1. Encryption Security Policy (KMS)
        encryption_policy = aoss.CfnSecurityPolicy(
            self, "IQSECOpenSearchEncryptionPolicy",
            name=f"{collection_name}-enc-policy",
            type="encryption",
            description=f"KMS encryption policy for OpenSearch Serverless collection [{stage.upper()}]",
            policy=json.dumps({
                "Rules": [
                    {
                        "ResourceType": "collection",
                        "Resource": [f"collection/{collection_name}"]
                    }
                ],
                "AWSOwnedKey": True
            })
        )

        # 2. Network Security Policy
        network_policy = aoss.CfnSecurityPolicy(
            self, "IQSECOpenSearchNetworkPolicy",
            name=f"{collection_name}-net-policy",
            type="network",
            description=f"Network policy for OpenSearch Serverless collection [{stage.upper()}]",
            policy=json.dumps([
                {
                    "Rules": [
                        {
                            "ResourceType": "collection",
                            "Resource": [f"collection/{collection_name}"]
                        },
                        {
                            "ResourceType": "dashboard",
                            "Resource": [f"collection/{collection_name}"]
                        }
                    ],
                    "AllowFromPublic": True
                }
            ])
        )

        # 3. Vector Collection
        self.collection = aoss.CfnCollection(
            self, "IQSECOpenSearchCollection",
            name=collection_name,
            type="VECTORSEARCH",
            description=f"Vector and Hybrid RAG Search Collection for IQSEC [{stage.upper()}]"
        )
        self.collection.add_resource_dependency(encryption_policy)
        self.collection.add_resource_dependency(network_policy)

        # 4. Data Access Policy for IAM Principal
        current_account = iam.AccountPrincipal(iam.AccountRootPrincipal().account_id or "*")
        data_access_policy = aoss.CfnAccessPolicy(
            self, "IQSECOpenSearchDataAccessPolicy",
            name=f"{collection_name}-data-policy",
            type="data",
            description=f"Data access policy for indexing and searching vectors [{stage.upper()}]",
            policy=json.dumps([
                {
                    "Rules": [
                        {
                            "ResourceType": "collection",
                            "Resource": [f"collection/{collection_name}"],
                            "Permission": [
                                "aoss:CreateCollectionItems",
                                "aoss:DeleteCollectionItems",
                                "aoss:UpdateCollectionItems",
                                "aoss:DescribeCollectionItems"
                            ]
                        },
                        {
                            "ResourceType": "index",
                            "Resource": [f"index/{collection_name}/*"],
                            "Permission": [
                                "aoss:CreateIndex",
                                "aoss:DeleteIndex",
                                "aoss:UpdateIndex",
                                "aoss:DescribeIndex",
                                "aoss:ReadDocument",
                                "aoss:WriteDocument"
                            ]
                        }
                    ],
                    "Principal": [
                        current_account.arn if hasattr(current_account, "arn") else "*"
                    ]
                }
            ])
        )
        data_access_policy.add_resource_dependency(self.collection)
