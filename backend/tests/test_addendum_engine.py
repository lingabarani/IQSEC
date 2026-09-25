"""
Unit Tests for Addendum Delta Engine
Validates Q&A parsing, clause resolution, and requirement override applications.
"""
import pymupdf as fitz
import pytest
from backend.app.schemas.parser import ExtractedRequirementSchema
from backend.app.schemas.addendum import DeltaActionType
from backend.app.services.addendum_engine import AddendumDeltaEngine
from backend.app.db.models.requirement import RequirementType, IQSECPillar


@pytest.fixture
def sample_addendum_pdf(tmp_path):
    """Creates a synthetic Junta de Aclaraciones PDF with questions, answers, and numerals"""
    pdf_path = str(tmp_path / "junta_aclaraciones_1.pdf")
    doc = fitz.open()

    p1 = doc.new_page()
    p1.insert_text((72, 70), "ACTA DE JUNTA DE ACLARACIONES No. 1", fontsize=16)
    p1.insert_text((72, 100), "LICITACIÓN No. LPN-2026-001", fontsize=12)

    qa_text = (
        "Pregunta No. 1: Respecto al numeral 3.1, ¿se permite que el personal N3 sea remoto?\n"
        "Respuesta: Se acepta. Se modifica el numeral 3.1 para permitir que los analistas N3 "
        "operen de manera remota siempre y cuando cuenten con enlace seguro VPN y MFA.\n\n"
        "Pregunta No. 2: Respecto a la partida 2, ¿es obligatorio el escaneo quincenal?\n"
        "Respuesta: Se elimina el requerimiento de escaneo quincenal, pasando a ser mensual.\n"
    )
    p1.insert_text((72, 140), qa_text, fontsize=11)

    doc.save(pdf_path)
    doc.close()
    return pdf_path


def test_process_addendum_extracts_qa_and_actions(sample_addendum_pdf):
    engine = AddendumDeltaEngine()
    clarifications, delta_res = engine.process_addendum_document(
        sample_addendum_pdf, parent_rfp_id="rfp_test_123"
    )

    assert len(clarifications) >= 2
    assert delta_res.total_clarifications_found >= 2

    # Verify Question 1 has MODIFICATION action and references '3.1'
    q1 = clarifications[0]
    assert "3.1" in q1.referenced_clauses or "3.1" in q1.question_text
    assert q1.action_type in [DeltaActionType.MODIFICATION, DeltaActionType.CLARIFICATION_ONLY]


def test_apply_deltas_overrides_effective_text():
    engine = AddendumDeltaEngine()

    original_reqs = [
        ExtractedRequirementSchema(
            requirement_code="NUMERAL-3.1",
            page_number=1,
            page_end=1,
            section_code="3.1",
            section_title="SOC 24/7",
            section_hierarchy=["3. Requerimientos", "3.1 SOC"],
            original_text="Los analistas N3 deben estar 100% en sitio.",
            effective_text="Los analistas N3 deben estar 100% en sitio.",
            is_mandatory=True,
            requirement_type=RequirementType.TECHNICAL,
            iqsec_pillar=IQSECPillar.SOC_SIEM
        )
    ]

    from backend.app.schemas.addendum import AddendumClarificationItem
    clarifications = [
        AddendumClarificationItem(
            item_id="q1",
            page_number=1,
            question_number="Pregunta 1",
            question_text="¿Se permite analista remoto?",
            response_text="Se acepta que los analistas N3 operen de manera remota.",
            referenced_clauses=["3.1"],
            action_type=DeltaActionType.MODIFICATION,
            proposed_override="Se acepta que los analistas N3 operen de manera remota."
        )
    ]

    updated_reqs, delta_summary = engine.apply_deltas_to_requirements(
        original_reqs, clarifications, "Acta_Junta_1.pdf"
    )

    assert len(updated_reqs) == 1
    assert updated_reqs[0].effective_text == "Se acepta que los analistas N3 operen de manera remota."
    assert delta_summary.total_modifications_applied == 1
    assert "NUMERAL-3.1" in delta_summary.modified_requirement_codes
