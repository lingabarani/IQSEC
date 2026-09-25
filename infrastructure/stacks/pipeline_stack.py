from aws_cdk import (
    Duration,
    RemovalPolicy,
    aws_stepfunctions as sfn,
    aws_logs as logs
)
from constructs import Construct


class PipelineConstruct(Construct):
    def __init__(self, scope: Construct, construct_id: str, stage: str = "dev", **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        is_prod = stage.lower() == "prod"

        # 1. CloudWatch Log Group for State Machine Execution Traces
        log_group = logs.LogGroup(
            self, "IQSECStateMachineLogs",
            retention=logs.RetentionDays.ONE_WEEK if not is_prod else logs.RetentionDays.ONE_MONTH,
            removal_policy=RemovalPolicy.RETAIN if is_prod else RemovalPolicy.DESTROY
        )

        # 2. Sequential Stages
        pass_register_opp = sfn.Pass(
            self, "1. Register Opportunity & Scopes",
            comment="Stage 1: Validates Cognito tokens and registers opportunity in RDS"
        )
        pass_ingest_docs = sfn.Pass(
            self, "2. Ingest S3 Documents",
            comment="Stage 2: Checks uploaded RFP documents in S3"
        )
        pass_ocr_chunk = sfn.Pass(
            self, "3. Hybrid OCR & Provenance Chunking",
            comment="Stage 3: Executes PyMuPDF + PaddleOCR fallback, emitting Doc-Page-Chunk hierarchy"
        )
        pass_extract_reqs = sfn.Pass(
            self, "4. Extract Requirements & Addendums",
            comment="Stage 4: Extracts discrete requirements and resolves clarification minutes amendments"
        )
        pass_classify_reqs = sfn.Pass(
            self, "5. Classify Requirements",
            comment="Stage 5: Categorizes requirements into SOC_CORE, SIEM, EDR, etc."
        )
        pass_scoped_rag = sfn.Pass(
            self, "6. Scoped RAG & Cross-Encoder Reranking",
            comment="Stage 6: Executes pre-filtered hybrid search on OpenSearch & reranks Top-25 to Top-3"
        )
        pass_match_catalog = sfn.Pass(
            self, "7. Match Product & Service Catalog",
            comment="Stage 7: Maps requirement to IQSEC solutions and manufacturer directory"
        )
        pass_ai_draft = sfn.Pass(
            self, "8. Private AI Reasoning & Guardrails",
            comment="Stage 8: Ollama/vLLM drafts compliance; guardrails flag NOT_ENOUGH_EVIDENCE"
        )
        human_validation_gate = sfn.Pass(
            self, "9. Human Validation Gate (Approve / Edit / Reject)",
            comment="Stage 9: Pauses state machine until Pre-Sales Analyst approves matrix via UI"
        )
        pass_commit_sabana = sfn.Pass(
            self, "10. Commit Validated Sábana Matrix",
            comment="Stage 10: Commits approved matrix into Amazon RDS PostgreSQL"
        )
        pass_generate_deliverables = sfn.Pass(
            self, "11. Generate Multi-Deliverables",
            comment="Stage 11: Generates XLSX Sábana, DOCX Proposal, and PPTX Presentation"
        )
        pass_audit_metrics = sfn.Pass(
            self, "12. Audit Trail & Metrics Telemetry",
            comment="Stage 12: Logs execution metrics to CloudWatch and marks opportunity COMPLETED"
        )

        # 3. Chain the 12 Stages
        definition = pass_register_opp \
            .next(pass_ingest_docs) \
            .next(pass_ocr_chunk) \
            .next(pass_extract_reqs) \
            .next(pass_classify_reqs) \
            .next(pass_scoped_rag) \
            .next(pass_match_catalog) \
            .next(pass_ai_draft) \
            .next(human_validation_gate) \
            .next(pass_commit_sabana) \
            .next(pass_generate_deliverables) \
            .next(pass_audit_metrics)

        # 4. Create State Machine
        self.state_machine = sfn.StateMachine(
            self, "IQSECProposalStateMachine",
            state_machine_name=f"IQSEC-{stage.capitalize()}-AI-Proposal-Workflow",
            definition_body=sfn.DefinitionBody.from_chainable(definition),
            timeout=Duration.hours(4),
            logs=sfn.LogOptions(
                destination=log_group,
                level=sfn.LogLevel.ALL,
                include_execution_data=True
            )
        )
