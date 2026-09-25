"""
Unit Tests for Hybrid Document Parser
Validates layout parsing, table extraction to Markdown, hierarchy, and clause classification.
"""
import os
import pymupdf as fitz
import pytest
from backend.app.services.hybrid_parser import HybridDocumentParser
from backend.app.db.models.requirement import RequirementType, IQSECPillar


@pytest.fixture
def sample_rfp_pdf(tmp_path):
    """Creates a temporary synthetic multi-page RFP PDF with headers, tables, and clauses"""
    pdf_path = str(tmp_path / "sample_rfp.pdf")
    doc = fitz.open()

    # Page 1: Cover & Intro
    p1 = doc.new_page()
    p1.insert_text((72, 100), "LICITACIÓN PÚBLICA NACIONAL No. LPN-2026-001", fontsize=16)
    p1.insert_text((72, 140), "ANEXO TÉCNICO - SERVICIO ADMINISTRADO DE SEGURIDAD (MSSP)", fontsize=14)
    p1.insert_text((72, 180), "3. ESPECIFICACIONES TÉCNICAS REQUERIDAS", fontsize=14)
    p1.insert_text(
        (72, 220),
        "3.1 Monitoreo y Detección en Centro de Operaciones de Seguridad (SOC)\n"
        "El proveedor deberá contar con un Centro de Operaciones de Seguridad (SOC) 24/7/365.\n"
        "Es mandatorio contar con personal certificado en análisis de incidentes (Analistas N1, N2, N3).",
        fontsize=11
    )

    # Page 2: Table of Requirements & SLAs
    p2 = doc.new_page()
    p2.insert_text((72, 70), "3.2 MATRIZ DE REQUERIMIENTOS Y NIVELES DE SERVICIO", fontsize=14)
    
    # Draw a table with lines so PyMuPDF table finder sees it
    # Draw table bounding box and cells
    p2.draw_rect(fitz.Rect(72, 100, 500, 200), color=(0, 0, 0), width=1)
    p2.draw_line(fitz.Point(72, 130), fitz.Point(500, 130), color=(0, 0, 0), width=1)
    p2.draw_line(fitz.Point(72, 165), fitz.Point(500, 165), color=(0, 0, 0), width=1)
    p2.draw_line(fitz.Point(150, 100), fitz.Point(150, 200), color=(0, 0, 0), width=1)
    p2.draw_line(fitz.Point(350, 100), fitz.Point(350, 200), color=(0, 0, 0), width=1)

    p2.insert_text((80, 120), "Partida", fontsize=10)
    p2.insert_text((160, 120), "Descripción del Servicio", fontsize=10)
    p2.insert_text((360, 120), "SLA Requerido", fontsize=10)

    p2.insert_text((80, 150), "1", fontsize=10)
    p2.insert_text((160, 150), "Monitoreo SIEM 24/7 de eventos", fontsize=10)
    p2.insert_text((360, 150), "Tiempo de respuesta: 15 min", fontsize=10)

    p2.insert_text((80, 185), "2", fontsize=10)
    p2.insert_text((160, 185), "Gestión de Vulnerabilidades Cloud", fontsize=10)
    p2.insert_text((360, 185), "Escaneo quincenal", fontsize=10)

    doc.save(pdf_path)
    doc.close()
    return pdf_path


def test_hybrid_parser_parses_pages_and_counts(sample_rfp_pdf):
    parser = HybridDocumentParser()
    result = parser.parse_pdf_file(sample_rfp_pdf)

    assert result.page_count == 2
    assert len(result.pages) == 2
    assert result.filename == "sample_rfp.pdf"
    assert len(result.requirements) >= 2


def test_hierarchy_and_clause_classification(sample_rfp_pdf):
    parser = HybridDocumentParser()
    result = parser.parse_pdf_file(sample_rfp_pdf)

    # Check SOC Pillar detection
    soc_reqs = [r for r in result.requirements if r.iqsec_pillar == IQSECPillar.SOC_SIEM]
    assert len(soc_reqs) > 0

    # Check mandatory detection
    mandatory_reqs = [r for r in result.requirements if r.is_mandatory]
    assert len(mandatory_reqs) > 0


def test_service_pillar_classifier():
    parser = HybridDocumentParser()
    assert parser._classify_service_pillar("Monitoreo SIEM 24/7 y correlación de alertas") == IQSECPillar.SOC_SIEM
    assert parser._classify_service_pillar("Postura de seguridad CSPM en AWS y Azure") == IQSECPillar.CLOUD_SECURITY
    assert parser._classify_service_pillar("Gestión de accesos privilegiados PAM y MFA") == IQSECPillar.IAM
    assert parser._classify_service_pillar("Escaneo de vulnerabilidades con Qualys y Nessus") == IQSECPillar.VULN_MGMT
