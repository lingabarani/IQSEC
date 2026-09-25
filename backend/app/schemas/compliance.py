"""
Pydantic Schemas for Compliance Evaluation and Proposal Generation
Enforces strict JSON schema validation and groundedness guardrails.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator
from backend.app.db.models.requirement import ComplianceStatus, IQSECPillar
from backend.app.schemas.rag import EvidenceCitation


class ComplianceEvaluationResult(BaseModel):
    requirement_code: str
    compliance_status: ComplianceStatus
    technical_response: str = Field(
        ...,
        description="Formal technical proposal response in Spanish stating compliance, delivery model, and technical parameters."
    )
    compliance_rationale: str = Field(
        ...,
        description="Direct rationale referencing the retrieved evidence."
    )
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence level between 0.0 and 1.0 based on evidence strength."
    )
    exact_citations: List[EvidenceCitation] = Field(default_factory=list)
    human_approved: bool = False

    @field_validator("compliance_status", mode="before")
    @classmethod
    def normalize_status(cls, v: Any) -> ComplianceStatus:
        if isinstance(v, ComplianceStatus):
            return v
        if isinstance(v, str):
            clean = v.strip().upper().replace(" ", "_")
            for status in ComplianceStatus:
                if status.value == clean or status.name == clean:
                    return status
            if "NO" in clean:
                return ComplianceStatus.DOES_NOT_COMPLY
            if "EXCEP" in clean:
                return ComplianceStatus.COMPLIES_WITH_EXCEPTION
            if "NOT_ENOUGH" in clean or "EVIDENCE" in clean:
                return ComplianceStatus.NOT_ENOUGH_EVIDENCE
            if "CUMPLE" in clean:
                return ComplianceStatus.COMPLIES
        return ComplianceStatus.NOT_ENOUGH_EVIDENCE

    model_config = ConfigDict(from_attributes=True)


class RequirementEvaluationRequest(BaseModel):
    requirement_id: str
    requirement_code: str
    effective_text: str
    iqsec_pillar: IQSECPillar
    customer_id: str = "DEFAULT_CUSTOMER"


class ProposalGenerateRequest(BaseModel):
    customer_id: str = "DEFAULT_CUSTOMER"
    proposal_title: Optional[str] = None
    batch_size: int = 16


class BatchApproveRequest(BaseModel):
    min_confidence: float = Field(default=0.95, ge=0.5, le=1.0)


class ProposalSummaryResponse(BaseModel):
    proposal_id: str
    rfp_id: str
    title: str
    total_requirements: int
    compliant_count: int
    exception_count: int
    non_compliant_count: int
    not_enough_evidence_count: int
    overall_compliance_rate: float
    auto_approval_eligible_count: int  # Requirements with confidence >= 0.95
    human_review_required_count: int
    generation_time_seconds: float
    status: str

    model_config = ConfigDict(from_attributes=True)

