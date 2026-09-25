"""
Unit Tests for LLM Inference Engine & Groundedness Guardrails
"""
import pytest
from backend.app.services.llm_engine import llm_engine
from backend.app.schemas.rag import EvidenceCitation
from backend.app.db.models.requirement import ComplianceStatus, IQSECPillar
from backend.app.db.models.knowledge import ConfidentialityLevel


@pytest.mark.asyncio
async def test_evaluate_requirement_with_strong_evidence():
    evidences = [
        EvidenceCitation(
            document_title="IQSEC SOC Datasheet",
            page_number=1,
            section_title="1.1 SOC 24/7/365",
            exact_quote="IQSEC opera un Centro de Operaciones de Seguridad (SOC) 24/7/365 certificado ISO 27001.",
            relevance_score=0.88,
            pillar=IQSECPillar.SOC_SIEM,
            confidentiality=ConfidentialityLevel.PUBLIC
        )
    ]

    result = await llm_engine.evaluate_requirement(
        requirement_code="REQ-SOC-001",
        requirement_text="El licitante deberá contar con un SOC 24/7 certificado ISO 27001.",
        pillar=IQSECPillar.SOC_SIEM,
        evidences=evidences
    )

    assert result.compliance_status == ComplianceStatus.COMPLIES
    assert result.confidence_score >= 0.80
    assert "IQSEC S.A. de C.V. CUMPLE" in result.technical_response
    assert len(result.exact_citations) == 1


@pytest.mark.asyncio
async def test_groundedness_trap_without_evidence_returns_not_enough_evidence():
    """
    Validates anti-hallucination guardrail: without evidence, the system MUST NOT hallucinate compliance.
    """
    result = await llm_engine.evaluate_requirement(
        requirement_code="REQ-OBSCURE-999",
        requirement_text="El licitante deberá contar con certificación de seguridad aeroespacial AS9100.",
        pillar=IQSECPillar.SOC_SIEM,
        evidences=[]
    )

    assert result.compliance_status == ComplianceStatus.NOT_ENOUGH_EVIDENCE
    assert result.confidence_score < 0.50
    assert "evidencia" in result.technical_response.lower() or "aclaraciones" in result.technical_response.lower()

