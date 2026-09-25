"""
Unit & Integration Tests for Multi-Format Exporter (.xlsx, .docx, .pptx)
"""
import os
import pytest
from backend.app.db.models.requirement import RFPRequirement, RequirementType, ComplianceStatus, IQSECPillar
from backend.app.db.models.proposal import Proposal
from backend.app.services.export_sabana_xlsx import sabana_exporter
from backend.app.services.export_technical_docx import technical_docx_exporter
from backend.app.services.export_executive_pptx import executive_pptx_exporter


@pytest.fixture
def mock_proposal_data():
    proposal = Proposal(
        id="prop_test_exp",
        rfp_id="rfp_test_exp",
        title="Licitación SOC y Ciberseguridad 2026",
        version=1,
        status="IN_REVIEW",
        total_requirements=3,
        compliant_count=2,
        exception_count=1,
        non_compliant_count=0,
        overall_compliance_rate=66.7
    )

    requirements = [
        RFPRequirement(
            id="req_1",
            rfp_id="rfp_test_exp",
            page_number=4,
            page_end=4,
            section_title="4.1 Monitoreo SOC 24/7",
            requirement_code="REQ-01",
            original_text="El licitante deberá contar con SOC 24/7.",
            effective_text="El licitante deberá contar con SOC 24/7.",
            is_mandatory=True,
            requirement_type=RequirementType.TECHNICAL,
            iqsec_pillar=IQSECPillar.SOC_SIEM,
            compliance_status=ComplianceStatus.COMPLIES,
            technical_response="IQSEC S.A. de C.V. CUMPLE cabalmente con esquema 24/7/365.",
            confidence_score=0.98,
            exact_citations=[{"document_title": "IQSEC SOC Whitepaper", "page_number": 14}]
        ),
        RFPRequirement(
            id="req_2",
            rfp_id="rfp_test_exp",
            page_number=6,
            page_end=6,
            section_title="4.2 SLAs de Notificación",
            requirement_code="REQ-02",
            original_text="Tiempo de respuesta en sitio menor a 15 min.",
            effective_text="Tiempo de respuesta remoto menor a 30 min (Modificado en Junta).",
            is_mandatory=True,
            is_modified_by_addendum=True,
            addendum_question_num="Pregunta 14",
            addendum_page_num=8,
            requirement_type=RequirementType.SLA,
            iqsec_pillar=IQSECPillar.SOC_SIEM,
            compliance_status=ComplianceStatus.COMPLIES_WITH_EXCEPTION,
            technical_response="IQSEC CUMPLE CON EXCEPCIÓN garantizando 30 min vía enlace seguro.",
            confidence_score=0.78,
            exact_citations=[]
        )
    ]

    return proposal, requirements


def test_export_sabana_xlsx(tmp_path, mock_proposal_data):
    proposal, requirements = mock_proposal_data
    out_file = str(tmp_path / "sabana_test.xlsx")

    res = sabana_exporter.generate_sabana_workbook(
        rfp_title=proposal.title,
        tender_number="LIC-EXP-001",
        requirements=requirements,
        output_filepath=out_file
    )

    assert os.path.exists(res)
    assert os.path.getsize(res) > 2000  # Non-empty valid excel workbook


def test_export_technical_docx(tmp_path, mock_proposal_data):
    proposal, requirements = mock_proposal_data
    out_file = str(tmp_path / "propuesta_tecnica.docx")

    res = technical_docx_exporter.generate_technical_proposal(
        rfp_title=proposal.title,
        tender_number="LIC-EXP-001",
        customer_name="CLIENTE_PRUEBA",
        requirements=requirements,
        output_filepath=out_file
    )

    assert os.path.exists(res)
    assert os.path.getsize(res) > 5000  # Non-empty valid docx document


def test_export_executive_pptx(tmp_path, mock_proposal_data):
    proposal, requirements = mock_proposal_data
    out_file = str(tmp_path / "presentacion_ejecutiva.pptx")

    res = executive_pptx_exporter.generate_executive_deck(
        proposal=proposal,
        tender_number="LIC-EXP-001",
        customer_name="CLIENTE_PRUEBA",
        output_filepath=out_file
    )

    assert os.path.exists(res)
    assert os.path.getsize(res) > 10000  # Non-empty valid pptx presentation

