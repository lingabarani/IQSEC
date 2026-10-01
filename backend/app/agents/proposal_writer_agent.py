"""
AgentCore: Proposal Writer Agent
Generates formal technical proposal responses in Mexican legal tender Spanish,
binding exact document and page citations.
"""
from typing import Dict, Any, List
from backend.app.agents.base import BaseAgent
from backend.app.db.models.requirement import ComplianceStatus, IQSECPillar
from backend.app.schemas.rag import EvidenceCitation
from backend.app.schemas.compliance import ComplianceEvaluationResult
from backend.app.services.llm_engine import llm_engine


class ProposalWriterAgent(BaseAgent):
    """
    Autonomous Agent that drafts technical compliance narratives and formats deliverables.
    """

    def __init__(self):
        super().__init__(
            name="ProposalWriterAgent",
            role="Drafts formal technical proposal responses with exact legal citations."
        )

    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Input state keys: 'requirement_code', 'effective_text', 'iqsec_pillar', 'evidences', 'compliance_status'
        Output state keys updated: 'technical_response', 'compliance_rationale', 'final_evaluation'
        """
        req_code = state.get("requirement_code", "REQ")
        effective_text = state.get("effective_text", "")
        pillar = state.get("iqsec_pillar", IQSECPillar.SOC_SIEM)
        evidences: List[EvidenceCitation] = state.get("evidences", [])
        status = state.get("compliance_status", ComplianceStatus.COMPLIES)

        self.logger.info(f"Writing formal proposal narrative for {req_code} ({status.value})")

        # Invoke LLM Engine with formal system prompt & citations
        evaluation: ComplianceEvaluationResult = await llm_engine.evaluate_requirement(
            requirement_code=req_code,
            requirement_text=effective_text,
            pillar=pillar,
            evidences=evidences
        )

        state["technical_response"] = evaluation.technical_response
        state["compliance_rationale"] = evaluation.compliance_rationale
        state["confidence_score"] = evaluation.confidence_score
        state["compliance_status"] = evaluation.compliance_status
        state["final_evaluation"] = evaluation

        self.logger.info(f"Proposal draft generated for {req_code}.")
        return state


proposal_writer_agent = ProposalWriterAgent()
