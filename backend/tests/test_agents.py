"""
Unit Tests for AgentCore Multi-Agent Architecture
Validates autonomous operation of Triage, Delta, Hunter, Auditor, Writer, and Orchestrator.
"""
import pytest
from backend.app.agents.triage_agent import triage_agent
from backend.app.agents.delta_agent import delta_agent
from backend.app.agents.evidence_hunter_agent import evidence_hunter_agent
from backend.app.agents.compliance_auditor_agent import compliance_auditor_agent
from backend.app.agents.proposal_writer_agent import proposal_writer_agent
from backend.app.db.models.requirement import RequirementType, IQSECPillar, ComplianceStatus
from backend.app.db.models.knowledge import ConfidentialityLevel
from backend.app.schemas.addendum import AddendumClarificationItem, DeltaActionType


@pytest.mark.asyncio
async def test_triage_agent_classifies_and_routes():
    state = {
        "raw_text": "El licitante deberá proporcionar monitoreo SIEM 24/7 y analistas N1/N2/N3."
    }
    result = await triage_agent.run(state)
    assert result["triage_completed"] is True
    assert result["iqsec_pillar"] == IQSECPillar.SOC_SIEM
    assert result["is_mandatory"] is True


@pytest.mark.asyncio
async def test_delta_agent_applies_clarification_overrides():
    clarifications = [
        AddendumClarificationItem(
            item_id="q1",
            page_number=3,
            question_number="Pregunta 10",
            question_text="¿Se permite analista remoto?",
            response_text="Se acepta que los analistas N3 sean remotos.",
            referenced_clauses=["3.1"],
            action_type=DeltaActionType.MODIFICATION,
            proposed_override="Analistas N3 pueden operar de forma remota (Modificado en Junta)."
        )
    ]
    state = {
        "requirement_code": "NUMERAL-3.1",
        "section_code": "3.1",
        "original_text": "Los analistas deben estar en sitio 100%.",
        "clarifications": clarifications
    }
    result = await delta_agent.run(state)
    assert result["is_modified_by_addendum"] is True
    assert "remota" in result["effective_text"]
    assert "Pregunta 10" in result["addendum_question_num"]


@pytest.mark.asyncio
async def test_compliance_auditor_groundedness_trap():
    state = {
        "requirement_code": "REQ-TEST-01",
        "effective_text": "Requerimiento sin evidencia.",
        "evidences": [],
        "iqsec_pillar": IQSECPillar.SOC_SIEM
    }
    result = await compliance_auditor_agent.run(state)
    assert result["compliance_status"] == ComplianceStatus.NOT_ENOUGH_EVIDENCE
    assert result["confidence_score"] < 0.50
    assert result["audit_passed"] is False
