"""
AgentCore: Compliance Auditor & Anti-Hallucination Agent
Evaluates evidence groundedness and enforces zero unsupported 'CUMPLE' declarations.
"""
from typing import Dict, Any, List
from backend.app.agents.base import BaseAgent
from backend.app.db.models.requirement import ComplianceStatus, IQSECPillar
from backend.app.schemas.rag import EvidenceCitation


class ComplianceAuditorAgent(BaseAgent):
    """
    Autonomous Auditor that validates evidence strength, verifies groundedness,
    and assigns preliminary compliance status.
    """

    def __init__(self):
        super().__init__(
            name="ComplianceAuditorAgent",
            role="Audits compliance, enforces anti-hallucination guardrails, and validates evidence strength."
        )

    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Input state keys: 'effective_text', 'evidences', 'iqsec_pillar', 'requirement_code'
        Output state keys updated: 'compliance_status', 'confidence_score', 'audit_passed', 'auditor_rationale'
        """
        req_code = state.get("requirement_code", "REQ")
        effective_text = state.get("effective_text", "")
        evidences: List[EvidenceCitation] = state.get("evidences", [])
        pillar = state.get("iqsec_pillar", IQSECPillar.SOC_SIEM)

        # 1. Anti-Hallucination Groundedness Check
        if not evidences or len(evidences) == 0:
            self.logger.warning(f"Groundedness Trap triggered for {req_code}: ZERO evidence available.")
            state["compliance_status"] = ComplianceStatus.NOT_ENOUGH_EVIDENCE
            state["confidence_score"] = 0.35
            state["audit_passed"] = False
            state["auditor_rationale"] = "No se localizó evidencia autorizada en el acervo documental de IQSEC."
            return state

        top_evidence = evidences[0]
        relevance = top_evidence.relevance_score

        # Check lexical overlap and semantic alignment
        req_tokens = set(effective_text.lower().split())
        ev_tokens = set(top_evidence.exact_quote.lower().split())
        overlap = len(req_tokens.intersection(ev_tokens))

        if relevance >= 0.30 or overlap >= 3:
            status = ComplianceStatus.COMPLIES
            confidence = min(0.98, round(0.75 + (relevance * 0.23), 2))
            rationale = f"Acreditado mediante '{top_evidence.document_title}' (Pág. {top_evidence.page_number})."
            audit_passed = True
        elif relevance >= 0.15:
            status = ComplianceStatus.COMPLIES_WITH_EXCEPTION
            confidence = 0.72
            rationale = f"Cumplimiento parcial/alternativo sustentado en '{top_evidence.document_title}'."
            audit_passed = True
        else:
            status = ComplianceStatus.DOES_NOT_COMPLY
            confidence = 0.60
            rationale = "Capacidad fuera de especificación estándar de IQSEC."
            audit_passed = False

        state["compliance_status"] = status
        state["confidence_score"] = confidence
        state["audit_passed"] = audit_passed
        state["auditor_rationale"] = rationale

        self.logger.info(f"Auditor evaluation for {req_code}: {status.value} (Confidence: {confidence})")
        return state


compliance_auditor_agent = ComplianceAuditorAgent()
