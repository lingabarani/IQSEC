"""
AgentCore: Triage & Taxonomy Agent
Analyzes requirement clauses, detects mandatory criteria, classifies requirement types,
and routes to IQSEC Service Pillars.
"""
from typing import Dict, Any, List
from backend.app.agents.base import BaseAgent
from backend.app.db.models.requirement import RequirementType, IQSECPillar
from backend.app.services.hybrid_parser import parser_service


class TriageAgent(BaseAgent):
    """
    Autonomous Agent responsible for requirement classification, taxonomy tagging,
    and mandatory status evaluation.
    """

    def __init__(self):
        super().__init__(
            name="TriageAgent",
            role="Evaluates requirement taxonomy, mandatory phrasing, and maps to IQSEC service pillars."
        )

    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Input state keys: 'raw_text', 'page_number', 'section_title', 'requirement_code' (optional)
        Output state keys updated: 'requirement_type', 'iqsec_pillar', 'is_mandatory', 'triage_completed'
        """
        raw_text = state.get("raw_text", "")
        self.logger.info(f"Triaging requirement: '{raw_text[:60]}...'")

        # 1. Evaluate Requirement Type
        req_type = parser_service._classify_requirement_type(raw_text)

        # 2. Evaluate Mandatory Phrasing
        is_mandatory = parser_service._is_mandatory(raw_text)

        # 3. Route to IQSEC Service Pillar
        pillar = parser_service._classify_service_pillar(raw_text)

        state["requirement_type"] = req_type
        state["is_mandatory"] = is_mandatory
        state["iqsec_pillar"] = pillar
        state["triage_completed"] = True

        self.logger.info(
            f"Triage result -> Type: {req_type.value}, Pillar: {pillar.value}, Mandatory: {is_mandatory}"
        )
        return state


triage_agent = TriageAgent()
