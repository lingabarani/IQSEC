"""
AgentCore: Master Multi-Agent Orchestrator
Coordinates Triage, Delta, Hunter, Auditor, and Writer agents across full RFP lifecycles.
"""
import asyncio
import time
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.app.agents.triage_agent import triage_agent
from backend.app.agents.delta_agent import delta_agent
from backend.app.agents.evidence_hunter_agent import evidence_hunter_agent
from backend.app.agents.compliance_auditor_agent import compliance_auditor_agent
from backend.app.agents.proposal_writer_agent import proposal_writer_agent
from backend.app.db.models.requirement import RFPRequirement, ComplianceStatus
from backend.app.db.models.proposal import Proposal, SabanaApprovalStatus, ProposalLifecycleStatus
from backend.app.db.models.rfp import RFPDocument
from backend.app.db.models.knowledge import ConfidentialityLevel
from backend.app.schemas.addendum import AddendumClarificationItem
from backend.app.schemas.compliance import ProposalSummaryResponse

logger = logging.getLogger("iqsec.orchestrator")
logger.setLevel(logging.INFO)


class AgentCoreOrchestrator:
    """
    Master Multi-Agent Orchestrator for IQSEC Tender Proposals.
    """

    def __init__(self):
        self.triage = triage_agent
        self.delta = delta_agent
        self.hunter = evidence_hunter_agent
        self.auditor = compliance_auditor_agent
        self.writer = proposal_writer_agent

    async def run_single_requirement_workflow(
        self,
        req: RFPRequirement,
        customer_id: str,
        confidentiality_level: ConfidentialityLevel,
        clarifications: Optional[List[AddendumClarificationItem]] = None
    ) -> Dict[str, Any]:
        """
        Executes collaborative multi-agent pipeline for an individual requirement:
        TriageAgent -> DeltaAgent -> EvidenceHunterAgent -> ComplianceAuditorAgent -> ProposalWriterAgent
        """
        state: Dict[str, Any] = {
            "requirement_id": req.id,
            "requirement_code": req.requirement_code,
            "section_code": req.section_code,
            "section_title": req.section_title,
            "raw_text": req.original_text,
            "original_text": req.original_text,
            "effective_text": req.effective_text,
            "customer_id": customer_id,
            "confidentiality_level": confidentiality_level,
            "clarifications": clarifications or [],
            "iqsec_pillar": req.iqsec_pillar,
            "requirement_type": req.requirement_type,
            "is_mandatory": req.is_mandatory
        }

        # 1. Triage Agent (Taxonomy & Pillar)
        state = await self.triage.run(state)

        # 2. Delta Agent (Junta de Aclaraciones reconciliation)
        state = await self.delta.run(state)

        # 3. Evidence Hunter Agent (Scoped RAG)
        state = await self.hunter.run(state)

        # 4. Compliance Auditor Agent (Anti-hallucination groundedness)
        state = await self.auditor.run(state)

        # 5. Proposal Writer Agent (Legal Spanish narrative & citations)
        state = await self.writer.run(state)

        return state

    async def execute_batch_proposal_generation(
        self,
        rfp_id: str,
        customer_id: str,
        db: Session,
        proposal_title: Optional[str] = None,
        confidentiality_level: ConfidentialityLevel = ConfidentialityLevel.INTERNAL_IQSEC,
        batch_size: int = 16,
        model_provider: str = "SELF_HOSTED_QWEN"
    ) -> ProposalSummaryResponse:
        """
        Executes end-to-end multi-agent proposal generation across all RFP requirements in 16x parallel batches.
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
            raise ValueError(f"RFP '{rfp_id}' contains no extracted requirements.")

        logger.info(f"AgentCore starting multi-agent workflow for {total_reqs} requirements (Tender: {rfp.tender_number})")

        # Process in batches
        all_results: List[Dict[str, Any]] = []
        for i in range(0, total_reqs, batch_size):
            batch_reqs = requirements[i:i + batch_size]
            tasks = [
                self.run_single_requirement_workflow(
                    req=r,
                    customer_id=customer_id,
                    confidentiality_level=confidentiality_level
                )
                for r in batch_reqs
            ]
            batch_outputs = await asyncio.gather(*tasks)
            all_results.extend(batch_outputs)

        # Update DB Records
        compliant_count = 0
        exception_count = 0
        non_compliant_count = 0
        not_enough_evidence_count = 0
        auto_approved_count = 0

        for req, state in zip(requirements, all_results):
            req.effective_text = state.get("effective_text", req.effective_text)
            req.is_modified_by_addendum = state.get("is_modified_by_addendum", False)
            req.addendum_reference = state.get("addendum_reference")
            req.addendum_question_num = state.get("addendum_question_num")
            req.addendum_page_num = state.get("addendum_page_num")
            req.modification_notes = state.get("modification_notes")
            req.iqsec_pillar = state.get("iqsec_pillar", req.iqsec_pillar)
            req.requirement_type = state.get("requirement_type", req.requirement_type)
            req.is_mandatory = state.get("is_mandatory", req.is_mandatory)

            status = state.get("compliance_status", ComplianceStatus.NOT_EVALUATED)
            confidence = state.get("confidence_score", 0.0)
            req.compliance_status = status
            req.technical_response = state.get("technical_response")
            req.compliance_rationale = state.get("compliance_rationale")
            req.confidence_score = confidence

            evidences = state.get("evidences", [])
            req.exact_citations = [e.model_dump() for e in evidences]

            # Smart Triage Auto-Approval rule (confidence >= 0.95 and CUMPLE)
            if confidence >= 0.95 and status == ComplianceStatus.COMPLIES:
                req.human_approved = True
                req.reviewed_by = "AGENTCORE_AUTO_APPROVED"
                auto_approved_count += 1

            if status == ComplianceStatus.COMPLIES:
                compliant_count += 1
            elif status == ComplianceStatus.COMPLIES_WITH_EXCEPTION:
                exception_count += 1
            elif status == ComplianceStatus.DOES_NOT_COMPLY:
                non_compliant_count += 1
            elif status == ComplianceStatus.NOT_ENOUGH_EVIDENCE:
                not_enough_evidence_count += 1

        compliance_rate = round((compliant_count / total_reqs) * 100.0, 2)

        # Create / Update Proposal Record
        import uuid
        prop_id = f"prop_{uuid.uuid4().hex[:12]}"
        title = proposal_title or f"Propuesta Técnica y Económica - {rfp.title}"
        proposal = Proposal(
            id=prop_id,
            rfp_id=rfp_id,
            title=title,
            version=1,
            status="IN_REVIEW",
            total_requirements=total_reqs,
            compliant_count=compliant_count,
            exception_count=exception_count,
            non_compliant_count=non_compliant_count,
            overall_compliance_rate=compliance_rate,
            model_provider_used=model_provider,
            sabana_status=SabanaApprovalStatus.PENDING_REVIEW,
            lifecycle_status=ProposalLifecycleStatus.DRAFT
        )
        db.add(proposal)
        db.commit()

        duration = round(time.time() - start_time, 2)
        logger.info(
            f"AgentCore proposal generation completed in {duration}s. "
            f"Compliance: {compliance_rate}% ({compliant_count}/{total_reqs}), Auto-Approved: {auto_approved_count}"
        )

        return ProposalSummaryResponse(
            proposal_id=prop_id,
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


agent_orchestrator = AgentCoreOrchestrator()
