"""
Parallel Proposal Generator Service
Coordinates Scoped Hybrid RAG and 16x Parallel LLM inference across all RFP requirements.
Enforces smart triage auto-approval for high-confidence responses (>= 0.95).
"""
import asyncio
import time
import uuid
import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.app.db.models.rfp import RFPDocument
from backend.app.db.models.requirement import RFPRequirement, ComplianceStatus
from backend.app.db.models.proposal import Proposal
from backend.app.db.models.knowledge import ConfidentialityLevel
from backend.app.schemas.rag import ScopedSearchQuery
from backend.app.schemas.compliance import (
    ProposalSummaryResponse,
    ComplianceEvaluationResult,
)
from backend.app.services.hybrid_retriever import hybrid_retriever
from backend.app.services.llm_engine import llm_engine

logger = logging.getLogger("iqsec.proposal_generator")
logger.setLevel(logging.INFO)


class ProposalGenerator:
    """
    High-Performance Batch Proposal Generator with Smart Triage and RAG Evidence Fusion.
    """

    async def generate_full_proposal(
        self,
        rfp_id: str,
        customer_id: str,
        db: Session,
        proposal_title: Optional[str] = None,
        confidentiality_level: ConfidentialityLevel = ConfidentialityLevel.INTERNAL_IQSEC,
        batch_size: int = 16
    ) -> ProposalSummaryResponse:
        """
        Executes end-to-end proposal generation across all RFP requirements:
        1. Fetches requirements from DB.
        2. Dispatches 16x concurrent async tasks (Hybrid RAG + LLM).
        3. Applies Smart Triage auto-approval (confidence >= 0.95).
        4. Saves compliance results & citations into PostgreSQL.
        """
        start_time = time.time()

        rfp = db.get(RFPDocument, rfp_id)
        if not rfp:
            raise ValueError(f"RFP document '{rfp_id}' not found.")

        requirements = db.execute(
            select(RFPRequirement).where(RFPRequirement.rfp_id == rfp_id)
        ).scalars().all()

        total_reqs = len(requirements)
        if total_reqs == 0:
            raise ValueError(f"RFP '{rfp_id}' has no extracted requirements.")

        logger.info(f"Starting 16x parallel proposal generation for {total_reqs} requirements (RFP: {rfp.filename})")

        # Process requirements in chunks of batch_size
        results: List[ComplianceEvaluationResult] = []
        for i in range(0, total_reqs, batch_size):
            chunk = requirements[i:i + batch_size]
            tasks = [
                self._evaluate_single_requirement(req, customer_id, confidentiality_level)
                for req in chunk
            ]
            batch_results = await asyncio.gather(*tasks)
            results.extend(batch_results)

        # Update Database with evaluation results
        compliant_count = 0
        exception_count = 0
        non_compliant_count = 0
        not_enough_evidence_count = 0
        auto_approved_count = 0

        for req, eval_res in zip(requirements, results):
            req.compliance_status = eval_res.compliance_status
            req.technical_response = eval_res.technical_response
            req.compliance_rationale = eval_res.compliance_rationale
            req.confidence_score = eval_res.confidence_score
            req.exact_citations = [c.model_dump() for c in eval_res.exact_citations]

            # Smart Triage Auto-Approval rule (confidence >= 0.95 and CUMPLE)
            if eval_res.confidence_score >= 0.95 and eval_res.compliance_status == ComplianceStatus.COMPLIES:
                req.human_approved = True
                req.reviewed_by = "AI_AUTO_APPROVAL_TIER1"
                auto_approved_count += 1

            if eval_res.compliance_status == ComplianceStatus.COMPLIES:
                compliant_count += 1
            elif eval_res.compliance_status == ComplianceStatus.COMPLIES_WITH_EXCEPTION:
                exception_count += 1
            elif eval_res.compliance_status == ComplianceStatus.DOES_NOT_COMPLY:
                non_compliant_count += 1
            elif eval_res.compliance_status == ComplianceStatus.NOT_ENOUGH_EVIDENCE:
                not_enough_evidence_count += 1

        compliance_rate = round((compliant_count / total_reqs) * 100.0, 2)

        # Create Proposal record
        proposal_id = f"prop_{uuid.uuid4().hex[:12]}"
        title = proposal_title or f"Propuesta Técnica y Económica - {rfp.title}"
        proposal = Proposal(
            id=proposal_id,
            rfp_id=rfp_id,
            title=title,
            version=1,
            status="IN_REVIEW",
            total_requirements=total_reqs,
            compliant_count=compliant_count,
            exception_count=exception_count,
            non_compliant_count=non_compliant_count,
            overall_compliance_rate=compliance_rate
        )
        db.add(proposal)
        db.commit()

        duration = round(time.time() - start_time, 2)
        logger.info(
            f"Proposal generation completed in {duration}s. "
            f"Compliance Rate: {compliance_rate}% ({compliant_count}/{total_reqs}), "
            f"Auto-Approved: {auto_approved_count}"
        )

        return ProposalSummaryResponse(
            proposal_id=proposal_id,
            rfp_id=rfp_id,
            title=title,
            total_requirements=total_reqs,
            compliant_count=compliant_count,
            exception_count=exception_count,
            non_compliant_count=non_compliant_count,
            not_enough_evidence_count=not_enough_evidence_count,
            overall_compliance_rate=compliance_rate,
            auto_approval_eligible_count=auto_approved_count,
            human_review_required_count=total_reqs - auto_approved_count,
            generation_time_seconds=duration,
            status="IN_REVIEW"
        )

    async def _evaluate_single_requirement(
        self,
        req: RFPRequirement,
        customer_id: str,
        confidentiality_level: ConfidentialityLevel
    ) -> ComplianceEvaluationResult:
        """Runs Scoped Hybrid RAG retrieval + LLM evaluation for a single requirement"""
        # 1. Scoped Hybrid Retrieval
        query = ScopedSearchQuery(
            query_text=req.effective_text,
            customer_id=customer_id,
            confidentiality_level=confidentiality_level,
            pillar=req.iqsec_pillar,
            top_k=15,
            final_top_k=3
        )
        rag_response = hybrid_retriever.retrieve_evidence_for_requirement(query)

        # 2. LLM Compliance Synthesis
        evaluation = await llm_engine.evaluate_requirement(
            requirement_code=req.requirement_code,
            requirement_text=req.effective_text,
            pillar=req.iqsec_pillar,
            evidences=rag_response.top_evidences
        )

        return evaluation


proposal_generator = ProposalGenerator()

