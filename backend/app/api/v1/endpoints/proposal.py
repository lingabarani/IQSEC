"""
Proposal Generation and 2-Stage Human-in-the-Loop Governance Endpoints
Implements Humano 1 (Sábana Approval) and Humano 2 (Final Proposal Sign-Off).
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import select
from pydantic import BaseModel, Field

from backend.app.db.session import get_db
from backend.app.db.models.rfp import RFPDocument
from backend.app.db.models.proposal import (
    Proposal,
    SabanaApprovalStatus,
    ProposalLifecycleStatus,
)
from backend.app.db.models.requirement import RFPRequirement, ComplianceStatus
from backend.app.db.models.knowledge import ConfidentialityLevel
from backend.app.schemas.compliance import (
    ProposalGenerateRequest,
    BatchApproveRequest,
    ProposalSummaryResponse,
)
from backend.app.schemas.rfp import RFPRequirementResponse
from backend.app.agents.orchestrator import agent_orchestrator

router = APIRouter()


# Schemas for 2-Stage Governance
class Human1SabanaApprovalRequest(BaseModel):
    reviewer_name: str = Field(..., description="Name/Role of the Pre-Sales Engineer validating the Sábana")
    notes: Optional[str] = Field(None, description="Review observations, SLA checks, or delivery notes")
    override_all_pending_as_approved: bool = Field(True, description="Mark all verified requirements as human approved")


class Human2ProposalSignOffRequest(BaseModel):
    signer_name: str = Field(..., description="Name/Title of the Proposal Director or VP of Engineering")
    notes: Optional[str] = Field(None, description="Executive sign-off notes or commercial stipulations")
    signoff_statement: str = Field(
        "Certifico la revisión técnica, económica y regulatoria de la presente propuesta.",
        description="Formal sign-off legal statement"
    )


class GovernanceAuditTrailResponse(BaseModel):
    proposal_id: str
    rfp_id: str
    title: str
    total_requirements: int
    compliant_count: int
    overall_compliance_rate: float
    model_provider_used: str
    
    # Stage 1 Audit
    sabana_status: SabanaApprovalStatus
    sabana_approved_by: Optional[str] = None
    sabana_approved_at: Optional[datetime] = None
    sabana_notes: Optional[str] = None

    # Stage 2 Audit
    lifecycle_status: ProposalLifecycleStatus
    final_signoff_by: Optional[str] = None
    final_signoff_at: Optional[datetime] = None
    final_signoff_notes: Optional[str] = None


@router.post("/generate/{rfp_id}", response_model=ProposalSummaryResponse)
async def generate_proposal_for_rfp(
    rfp_id: str,
    request: ProposalGenerateRequest = Body(default=ProposalGenerateRequest()),
    db: Session = Depends(get_db)
):
    """
    Executes AgentCore Multi-Agent proposal generation:
    TriageAgent -> DeltaAgent -> EvidenceHunterAgent -> ComplianceAuditorAgent -> ProposalWriterAgent
    """
    rfp = db.get(RFPDocument, rfp_id)
    if not rfp:
        raise HTTPException(status_code=404, detail="RFP document not found.")

    try:
        summary = await agent_orchestrator.execute_batch_proposal_generation(
            rfp_id=rfp_id,
            customer_id=request.customer_id,
            db=db,
            proposal_title=request.proposal_title,
            confidentiality_level=ConfidentialityLevel.INTERNAL_IQSEC,
            batch_size=request.batch_size
        )
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AgentCore proposal generation error: {str(e)}")


@router.get("/{proposal_id}")
def get_proposal_details(proposal_id: str, db: Session = Depends(get_db)):
    """Retrieves proposal metrics and 2-stage governance state"""
    prop = db.get(Proposal, proposal_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found.")

    return {
        "id": prop.id,
        "rfp_id": prop.rfp_id,
        "title": prop.title,
        "status": prop.status,
        "version": prop.version,
        "total_requirements": prop.total_requirements,
        "compliant_count": prop.compliant_count,
        "exception_count": prop.exception_count,
        "non_compliant_count": prop.non_compliant_count,
        "overall_compliance_rate": prop.overall_compliance_rate,
        "model_provider_used": prop.model_provider_used,
        "sabana_status": prop.sabana_status,
        "sabana_approved_by": prop.sabana_approved_by,
        "sabana_approved_at": prop.sabana_approved_at,
        "lifecycle_status": prop.lifecycle_status,
        "final_signoff_by": prop.final_signoff_by,
        "final_signoff_at": prop.final_signoff_at,
        "created_at": prop.created_at
    }


@router.post("/{proposal_id}/human1-approve-sabana")
def human1_approve_sabana(
    proposal_id: str,
    payload: Human1SabanaApprovalRequest,
    db: Session = Depends(get_db)
):
    """
    Stage 1: Humano 1 (Sábana Matrix Validation)
    Pre-sales engineer verifies row-by-row citations and formally approves the Sábana matrix.
    """
    prop = db.get(Proposal, proposal_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found.")

    prop.sabana_status = SabanaApprovalStatus.SABANA_APPROVED
    prop.sabana_approved_by = payload.reviewer_name
    prop.sabana_approved_at = datetime.utcnow()
    prop.sabana_notes = payload.notes
    prop.lifecycle_status = ProposalLifecycleStatus.SABANA_VALIDATED
    prop.status = "SABANA_VALIDATED"

    if payload.override_all_pending_as_approved:
        reqs = db.execute(
            select(RFPRequirement).where(RFPRequirement.rfp_id == prop.rfp_id)
        ).scalars().all()
        for r in reqs:
            r.human_approved = True
            r.reviewed_by = payload.reviewer_name

    db.commit()

    return {
        "proposal_id": proposal_id,
        "sabana_status": prop.sabana_status,
        "sabana_approved_by": prop.sabana_approved_by,
        "lifecycle_status": prop.lifecycle_status,
        "message": f"Stage 1 Sábana Matrix successfully approved by {payload.reviewer_name}. Ready for final proposal sign-off."
    }


@router.post("/{proposal_id}/human2-signoff-proposal")
def human2_signoff_proposal(
    proposal_id: str,
    payload: Human2ProposalSignOffRequest,
    db: Session = Depends(get_db)
):
    """
    Stage 2: Humano 2 (Proposal & Executive Deck Final Sign-Off)
    Proposal Director performs final review and signs off for client delivery.
    """
    prop = db.get(Proposal, proposal_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found.")

    if prop.sabana_status != SabanaApprovalStatus.SABANA_APPROVED:
        raise HTTPException(
            status_code=400,
            detail="Cannot perform Stage 2 final sign-off before Stage 1 Sábana matrix is formally approved by Humano 1."
        )

    prop.lifecycle_status = ProposalLifecycleStatus.FINAL_SIGN_OFF
    prop.final_signoff_by = payload.signer_name
    prop.final_signoff_at = datetime.utcnow()
    prop.final_signoff_notes = f"{payload.signoff_statement} | Observaciones: {payload.notes or 'Ninguna'}"
    prop.status = "APPROVED_AND_RELEASED"

    db.commit()

    return {
        "proposal_id": proposal_id,
        "lifecycle_status": prop.lifecycle_status,
        "final_signoff_by": prop.final_signoff_by,
        "final_signoff_at": prop.final_signoff_at,
        "message": f"Stage 2 Final Sign-Off completed by {payload.signer_name}. Proposal is authorized and released for delivery."
    }


@router.get("/{proposal_id}/audit-trail", response_model=GovernanceAuditTrailResponse)
def get_governance_audit_trail(proposal_id: str, db: Session = Depends(get_db)):
    """
    Returns complete 2-stage governance audit trail with timestamps, reviewers, and notes.
    """
    prop = db.get(Proposal, proposal_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found.")

    return GovernanceAuditTrailResponse(
        proposal_id=prop.id,
        rfp_id=prop.rfp_id,
        title=prop.title,
        total_requirements=prop.total_requirements,
        compliant_count=prop.compliant_count,
        overall_compliance_rate=prop.overall_compliance_rate,
        model_provider_used=prop.model_provider_used,
        sabana_status=prop.sabana_status,
        sabana_approved_by=prop.sabana_approved_by,
        sabana_approved_at=prop.sabana_approved_at,
        sabana_notes=prop.sabana_notes,
        lifecycle_status=prop.lifecycle_status,
        final_signoff_by=prop.final_signoff_by,
        final_signoff_at=prop.final_signoff_at,
        final_signoff_notes=prop.final_signoff_notes
    )


@router.patch("/requirement/{requirement_id}/review", response_model=RFPRequirementResponse)
def review_and_override_requirement(
    requirement_id: str,
    compliance_status: Optional[ComplianceStatus] = Body(None),
    technical_response: Optional[str] = Body(None),
    human_approved: bool = Body(True),
    reviewer_name: str = Body("PreSales_Analyst"),
    db: Session = Depends(get_db)
):
    """
    Smart Triage Inline Review:
    Allows pre-sales engineers to approve, override, or refine AI-drafted responses.
    """
    req = db.get(RFPRequirement, requirement_id)
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found.")

    if compliance_status:
        req.compliance_status = compliance_status
    if technical_response:
        req.technical_response = technical_response

    req.human_approved = human_approved
    req.reviewed_by = reviewer_name
    db.commit()
    db.refresh(req)

    return RFPRequirementResponse.model_validate(req)


@router.post("/{proposal_id}/batch-approve")
def batch_approve_high_confidence(
    proposal_id: str,
    payload: BatchApproveRequest = Body(default=BatchApproveRequest()),
    db: Session = Depends(get_db)
):
    """
    Smart Triage Batch Approval:
    Instantly approves all requirements with confidence >= min_confidence (Default 0.95).
    """
    prop = db.get(Proposal, proposal_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found.")

    reqs = db.execute(
        select(RFPRequirement).where(
            RFPRequirement.rfp_id == prop.rfp_id,
            RFPRequirement.confidence_score >= payload.min_confidence,
            RFPRequirement.compliance_status == ComplianceStatus.COMPLIES
        )
    ).scalars().all()

    approved_count = 0
    for r in reqs:
        if not r.human_approved:
            r.human_approved = True
            r.reviewed_by = "BATCH_SMART_TRIAGE_APPROVED"
            approved_count += 1

    db.commit()

    return {
        "proposal_id": proposal_id,
        "batch_approved_count": approved_count,
        "message": f"Successfully approved {approved_count} high-confidence requirements (>= {payload.min_confidence * 100}%)."
    }
