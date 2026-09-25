"""
Proposal Generation and Smart Triage Human-in-the-Loop Review Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.app.db.session import get_db
from backend.app.db.models.rfp import RFPDocument
from backend.app.db.models.proposal import Proposal
from backend.app.db.models.requirement import RFPRequirement, ComplianceStatus
from backend.app.db.models.knowledge import ConfidentialityLevel
from backend.app.schemas.compliance import (
    ProposalGenerateRequest,
    BatchApproveRequest,
    ProposalSummaryResponse,
)
from backend.app.schemas.rfp import RFPRequirementResponse
from backend.app.services.proposal_generator import proposal_generator

router = APIRouter()


@router.post("/generate/{rfp_id}", response_model=ProposalSummaryResponse)
async def generate_proposal_for_rfp(
    rfp_id: str,
    request: ProposalGenerateRequest = Body(default=ProposalGenerateRequest()),
    db: Session = Depends(get_db)
):
    """
    Executes full automated proposal generation:
    1. Dispatches 16x parallel async tasks across all requirements.
    2. Performs Scoped Hybrid RAG (Titan v2 + OpenSearch) + Cross-Encoder Reranking.
    3. Runs LLM evaluation with Pydantic guardrails.
    4. Applies Smart Triage auto-approval for >= 0.95 confidence.
    """
    rfp = db.get(RFPDocument, rfp_id)
    if not rfp:
        raise HTTPException(status_code=404, detail="RFP document not found.")

    try:
        summary = await proposal_generator.generate_full_proposal(
            rfp_id=rfp_id,
            customer_id=request.customer_id,
            db=db,
            proposal_title=request.proposal_title,
            confidentiality_level=ConfidentialityLevel.INTERNAL_IQSEC,
            batch_size=request.batch_size
        )
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proposal generation failed: {str(e)}")


@router.get("/{proposal_id}")
def get_proposal_details(proposal_id: str, db: Session = Depends(get_db)):
    """Retrieves proposal metrics and progress"""
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
        "created_at": prop.created_at
    }


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
    Human-in-the-Loop Smart Triage Review:
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

