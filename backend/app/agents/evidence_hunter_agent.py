"""
AgentCore: Evidence Hunter (Scoped RAG) Agent
Executes multi-query retrieval, enforces customer & NDA scoping, and extracts exact page citations.
"""
from typing import Dict, Any, List
from backend.app.agents.base import BaseAgent
from backend.app.db.models.knowledge import ConfidentialityLevel
from backend.app.db.models.requirement import IQSECPillar
from backend.app.schemas.rag import ScopedSearchQuery, EvidenceCitation
from backend.app.services.hybrid_retriever import hybrid_retriever


class EvidenceHunterAgent(BaseAgent):
    """
    Autonomous Agent that searches authorized IQSEC knowledge bases,
    enforces multi-tenant isolation, and extracts exact page-level evidence.
    """

    def __init__(self):
        super().__init__(
            name="EvidenceHunterAgent",
            role="Retrieves scoped authorized evidence from IQSEC knowledge base with strict NDA and multi-tenant isolation."
        )

    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Input state keys: 'effective_text', 'iqsec_pillar', 'customer_id', 'confidentiality_level'
        Output state keys updated: 'evidences', 'total_evidence_found', 'evidence_retrieval_completed'
        """
        effective_text = state.get("effective_text", state.get("original_text", ""))
        pillar = state.get("iqsec_pillar", IQSECPillar.SOC_SIEM)
        customer_id = state.get("customer_id", "ALL_CUSTOMERS")
        conf_level = state.get("confidentiality_level", ConfidentialityLevel.INTERNAL_IQSEC)

        self.logger.info(f"Hunting evidence for pillar '{pillar.value}' and customer '{customer_id}'")

        # Formulate query
        query = ScopedSearchQuery(
            query_text=effective_text,
            customer_id=customer_id,
            confidentiality_level=conf_level,
            pillar=pillar,
            top_k=20,
            final_top_k=3
        )

        rag_resp = hybrid_retriever.retrieve_evidence_for_requirement(query)
        evidences: List[EvidenceCitation] = rag_resp.top_evidences

        state["evidences"] = evidences
        state["total_evidence_found"] = len(evidences)
        state["evidence_retrieval_completed"] = True

        self.logger.info(f"Retrieved {len(evidences)} authoritative citations for requirement.")
        return state


evidence_hunter_agent = EvidenceHunterAgent()
