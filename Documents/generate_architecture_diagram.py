#!/usr/bin/env python3
"""
========================================================================================
IQSEC GenAI Technical & Economic Proposal Automation Platform
Advanced Architecture Diagram Generator
Includes:
  1. Hybrid Document Parsing (PyMuPDF + PaddleOCR/Textract Fallback + Addendum Delta Overwrite)
  2. Scoped Hybrid RAG with Local Cross-Encoder Reranking (Top-25 -> Top-3)
  3. High-Throughput Parallel Batching (Step Functions Distributed Map + Concurrent LLM)
  4. Smart Human-in-the-Loop Triage (Confidence Sorting & Batch Approval >= 0.95)
  5. AWS CDK, Amazon Cognito & Amazon RDS PostgreSQL
========================================================================================
"""

import sys
import os

# Automatically add workspace / user-space Graphviz binary & library paths if present
script_dir = os.path.dirname(os.path.abspath(__file__))
workspace_gv_bin = os.path.join(script_dir, ".graphviz/usr/bin")
workspace_gv_lib = os.path.join(script_dir, ".graphviz/usr/lib/x86_64-linux-gnu")
local_gv_bin = os.path.expanduser("~/.local/graphviz/usr/bin")
local_gv_lib = os.path.expanduser("~/.local/graphviz/usr/lib/x86_64-linux-gnu")

for gv_bin in [workspace_gv_bin, local_gv_bin]:
    if os.path.exists(gv_bin) and gv_bin not in os.environ.get("PATH", ""):
        os.environ["PATH"] = f"{gv_bin}:{os.environ.get('PATH', '')}"

for gv_lib in [workspace_gv_lib, local_gv_lib]:
    if os.path.exists(gv_lib) and gv_lib not in os.environ.get("LD_LIBRARY_PATH", ""):
        os.environ["LD_LIBRARY_PATH"] = f"{gv_lib}:{os.environ.get('LD_LIBRARY_PATH', '')}"

# Verify dependencies before importing diagrams
try:
    import diagrams
except ImportError:
    print("\n" + "=" * 70)
    print("ERROR: Missing required Python package 'diagrams'.")
    print("Please install it by running: pip install diagrams")
    print("=" * 70 + "\n")
    sys.exit(1)

from diagrams import Diagram, Cluster, Edge

# AWS Architecture Icons
from diagrams.aws.storage import S3
from diagrams.aws.integration import StepFunctions
try:
    from diagrams.aws.analytics import AmazonOpensearchService as OpenSearchService
except ImportError:
    try:
        from diagrams.aws.analytics import OpenSearchService
    except ImportError:
        from diagrams.aws.analytics import ElasticsearchService as OpenSearchService

from diagrams.aws.ml import Bedrock
from diagrams.aws.database import RDS, RDSPostgresqlInstance
from diagrams.aws.management import Cloudwatch
from diagrams.aws.security import IAM, KMS, SecretsManager, Cognito
from diagrams.aws.devtools import CloudDevelopmentKit as CDK

try:
    from diagrams.aws.general import General as GeneralNode
except ImportError:
    from diagrams.generic.blank import Blank as GeneralNode

# Application, Framework & On-Premise Icons
try:
    from diagrams.programming.framework import React, FastAPI
except ImportError:
    from diagrams.onprem.client import Client as React
    from diagrams.onprem.compute import Server as FastAPI

try:
    from diagrams.onprem.client import User, Users
except ImportError:
    from diagrams.aws.general import User, Users

try:
    from diagrams.onprem.vcs import Github
    from diagrams.onprem.ci import GithubActions
except ImportError:
    from diagrams.generic.blank import Blank as Github
    from diagrams.generic.blank import Blank as GithubActions

try:
    from diagrams.onprem.monitoring import Opentelemetry
except ImportError:
    from diagrams.aws.management import Cloudwatch as Opentelemetry

try:
    from diagrams.onprem.compute import Server
except ImportError:
    from diagrams.generic.compute import Rack as Server

try:
    from diagrams.generic.storage import Storage
except ImportError:
    from diagrams.aws.storage import S3 as Storage


def generate_architecture_diagram(output_format="png"):
    """
    Constructs an aligned, balanced, enterprise-grade architecture diagram
    organized in a clean Left-to-Right (LR) flow featuring advanced pipeline upgrades.
    """
    filename = "iqsec_proposal_automation_architecture"
    
    graph_attr = {
        "fontsize": "32",
        "fontname": "Helvetica-Bold",
        "bgcolor": "#F8FAFC",
        "pad": "0.8",
        "nodesep": "0.75",
        "ranksep": "1.15",
        "splines": "spline",
        "dpi": "300",
        "center": "true",
        "concentrate": "false",
    }
    
    node_attr = {
        "fontsize": "12",
        "fontname": "Helvetica-Bold",
        "height": "1.5",
        "width": "1.95",
        "margin": "0.12",
    }
    
    edge_attr = {
        "fontsize": "10",
        "fontname": "Helvetica-Bold",
        "color": "#334155",
        "fontcolor": "#0F172A",
        "penwidth": "2.0",
    }

    cluster_font = {"fontsize": "16", "fontname": "Helvetica-Bold"}

    print(f"Generating enhanced architecture diagram in {output_format.upper()} format: '{filename}.{output_format}'...")

    with Diagram(
        name="IQSEC GenAI Technical & Economic Proposal Automation — Advanced Architecture",
        filename=filename,
        outformat=output_format,
        show=False,
        direction="LR",
        graph_attr=graph_attr,
        node_attr=node_attr,
        edge_attr=edge_attr,
    ):
        # ----------------------------------------------------------------------
        # COLUMN 1: USERS & CLIENT INTERFACE
        # ----------------------------------------------------------------------
        with Cluster("1. ACTORS & CLIENT INTERFACE", graph_attr={"bgcolor": "#EFF6FF", "pencolor": "#3B82F6", **cluster_font}):
            with Cluster("IQSEC Stakeholders", graph_attr={"bgcolor": "#DBEAFE", "pencolor": "#60A5FA", "fontsize": "13", "fontname": "Helvetica-Bold"}):
                presales_user = User("Pre-Sales / Licitation\nAnalyst")
                commercial_user = User("Commercial\nManager")
            
            web_app = React("React / Next.js Web App\n(Smart Focus & Batch UI)")

        # ----------------------------------------------------------------------
        # COLUMN 2: SECURITY GATE & ORCHESTRATION
        # ----------------------------------------------------------------------
        with Cluster("2. IDENTITY, API & ORCHESTRATION", graph_attr={"bgcolor": "#FEF2F2", "pencolor": "#EF4444", **cluster_font}):
            cognito_auth = Cognito("Amazon Cognito\n(Identity & User Pools)")
            security_gate = IAM("RBAC & Scoped\nAuthorization Gate")
            api_gateway = FastAPI("FastAPI Backend API\n(Async Dispatcher)")
            orchestrator = StepFunctions("AWS Step Functions\n(Distributed Map Pipeline)")

        # ----------------------------------------------------------------------
        # COLUMN 3: HYBRID INGESTION & ADDENDUM OVERWRITE ENGINE
        # ----------------------------------------------------------------------
        with Cluster("3. HYBRID INGESTION & DOCUMENT INTEL", graph_attr={"bgcolor": "#FFFBEB", "pencolor": "#F59E0B", **cluster_font}):
            with Cluster("Amazon S3 Repositories", graph_attr={"bgcolor": "#FEF3C7", "pencolor": "#FBBF24", "fontsize": "13", "fontname": "Helvetica-Bold"}):
                s3_rfp = S3("Amazon S3\n(RFP, Annexes & Minutes)")
                s3_knowledge = S3("Amazon S3\n(IQSEC Knowledge Base)")
            
            hybrid_parser = Server("Hybrid Layout Parser\n(PyMuPDF + PaddleOCR)")
            addendum_engine = GeneralNode("Addendum Delta Checker\n(Clarification Overwrite)")
            chunk_metadata = GeneralNode("Chunking & Metadata\n(Doc → Page → Section)")

        # ----------------------------------------------------------------------
        # COLUMN 4: AUTHORIZED RAG & CROSS-ENCODER RERANKING
        # ----------------------------------------------------------------------
        with Cluster("4. SCOPED RAG & CROSS-ENCODER", graph_attr={"bgcolor": "#F1F5F9", "pencolor": "#475569", **cluster_font}):
            titan_embeddings = Bedrock("Amazon Titan\nEmbeddings v2")
            opensearch_rag = OpenSearchService("Amazon OpenSearch\n(k-NN + BM25 Hybrid)")
            reranker = Server("Cross-Encoder Reranker\n(Top-25 → Top-3 Best)")

        # ----------------------------------------------------------------------
        # COLUMN 5: HIGH-THROUGHPUT PRIVATE AI & GUARDRAILS
        # ----------------------------------------------------------------------
        with Cluster("5. HIGH-THROUGHPUT PRIVATE AI", graph_attr={"bgcolor": "#FAF5FF", "pencolor": "#9333EA", **cluster_font}):
            parallel_executor = Server("Concurrent Streamer\n(16x Parallel Workers)")
            local_llm = Server("Ollama / vLLM Engine\n(~12B-14B Open Model)")
            guardrails = GeneralNode("AI Guardrail Validator\n(NOT_ENOUGH_EVIDENCE)")

        # ----------------------------------------------------------------------
        # COLUMN 6: SMART HUMAN-IN-THE-LOOP & DELIVERABLES
        # ----------------------------------------------------------------------
        with Cluster("6. SMART TRIAGE & DELIVERABLES", graph_attr={"bgcolor": "#ECFDF5", "pencolor": "#059669", **cluster_font}):
            human_validation = Users("Smart Triage Reviewer\n(Batch Approve >=0.95)")
            sabana_matrix = GeneralNode("Validated Sábana de\nRequerimientos Matrix")
            proposal_gen = Server("Multi-Deliverable Engine\n(Template Synthesizer)")
            deliverables = Storage("Final Deliverables\n(XLSX / DOCX / PPTX)")

        # ----------------------------------------------------------------------
        # BOTTOM ROW: CROSS-CUTTING SHARED PLATFORM SERVICES
        # ----------------------------------------------------------------------
        with Cluster("7. ENTERPRISE PLATFORM SERVICES (PERSISTENCE, OBSERVABILITY, KMS & CDK)", graph_attr={"bgcolor": "#F8FAFC", "pencolor": "#334155", **cluster_font}):
            metadata_db = RDSPostgresqlInstance("Amazon RDS\nPostgreSQL")
            otel_collector = Opentelemetry("OpenTelemetry\nCollector")
            cloudwatch = Cloudwatch("Amazon CloudWatch &\nAudit Trail")
            kms_keys = KMS("AWS Key Management\nService (KMS)")
            secrets_mgr = SecretsManager("AWS Secrets\nManager")
            github_actions = GithubActions("GitHub Actions\nCI/CD")
            cdk_iac = CDK("AWS Cloud Development\nKit (AWS CDK)")

        # ======================================================================
        # PIPELINE FLOW EDGES (LEFT TO RIGHT)
        # ======================================================================
        # Ingress & Auth
        presales_user >> Edge(label="Upload / Review", color="#2563EB") >> web_app
        commercial_user >> Edge(label="Approve & Export", color="#2563EB") >> web_app
        web_app >> Edge(label="AuthN", color="#DC2626") >> cognito_auth
        cognito_auth >> Edge(label="Scoped Token", color="#DC2626") >> security_gate
        web_app >> Edge(label="HTTPS / REST", color="#0284C7") >> api_gateway
        security_gate >> Edge(label="Scope Gate", style="dashed", color="#DC2626") >> api_gateway
        api_gateway >> Edge(label="Trigger MapRun", color="#16A34A") >> orchestrator

        # Ingestion, OCR & Addendum Overwrite
        s3_rfp >> Edge(color="#D97706") >> hybrid_parser
        s3_knowledge >> Edge(color="#D97706") >> hybrid_parser
        hybrid_parser >> Edge(label="Raw Chunks & Tables", color="#D97706") >> addendum_engine
        addendum_engine >> Edge(label="Resolved Amendments", color="#475569") >> chunk_metadata
        chunk_metadata >> Edge(label="Vectors", color="#6366F1") >> titan_embeddings
        titan_embeddings >> Edge(label="Index", color="#6366F1") >> opensearch_rag

        # Scoped Search & Reranking
        orchestrator >> Edge(label="500 Reqs Batch", color="#16A34A") >> opensearch_rag
        security_gate >> Edge(label="NDA / Tenant Pre-Filter", color="#DC2626", style="dashed") >> opensearch_rag
        opensearch_rag >> Edge(label="Top-25 Candidates", color="#475569") >> reranker
        reranker >> Edge(label="Top-3 Best Evidence", color="#9333EA") >> parallel_executor
        parallel_executor >> Edge(label="16x Parallel Streams", color="#9333EA") >> local_llm

        # AI Reasoning & Smart Human Triage
        local_llm >> Edge(label="Draft JSON + Conf.", color="#E11D48") >> guardrails
        guardrails >> Edge(label="Score & Citation Check", color="#059669") >> human_validation
        human_validation >> Edge(label="One-Click Batch Approval", color="#059669") >> sabana_matrix
        sabana_matrix >> Edge(label="Validated Matrix", color="#15803D") >> proposal_gen
        proposal_gen >> Edge(label="Generate Files", color="#15803D") >> deliverables
        deliverables >> Edge(label="Download Package", style="dashed", color="#2563EB") >> web_app

        # Shared Platform Connections
        api_gateway >> Edge(style="dotted", color="#64748B") >> metadata_db
        orchestrator >> Edge(style="dotted", color="#64748B") >> metadata_db
        otel_collector >> Edge(color="#0284C7") >> cloudwatch
        github_actions >> Edge(color="#475569") >> cdk_iac

    print(f"✓ Advanced diagram successfully generated: {filename}.{output_format}")


def main():
    """Main entry point generating aligned PNG and SVG diagrams."""
    print("=" * 80)
    print("IQSEC GenAI Proposal Automation Platform — Advanced Architecture Generator")
    print("=" * 80)
    
    generate_architecture_diagram(output_format="png")
    generate_architecture_diagram(output_format="svg")

    print("\nGeneration complete!")
    print("Generated files:")
    if os.path.exists("iqsec_proposal_automation_architecture.png"):
        print("  - iqsec_proposal_automation_architecture.png")
    if os.path.exists("iqsec_proposal_automation_architecture.svg"):
        print("  - iqsec_proposal_automation_architecture.svg")
    print("=" * 80)


if __name__ == "__main__":
    main()
