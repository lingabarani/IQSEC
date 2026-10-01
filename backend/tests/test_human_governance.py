"""
Integration Tests for 2-Stage Human Governance (Humano 1 & Humano 2)
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.main import app
from backend.app.db.base import Base
import backend.app.db.models
from backend.app.db.models.rfp import RFPDocument, DocumentType, ProcessingStatus
from backend.app.db.models.requirement import RFPRequirement, RequirementType, ComplianceStatus, IQSECPillar
from backend.app.db.models.proposal import Proposal, SabanaApprovalStatus, ProposalLifecycleStatus
from backend.tests.conftest import engine, TestingSessionLocal



@pytest.fixture(autouse=True)
def setup_governance_env():
    db = TestingSessionLocal()
    # Clean prior test fixtures if any
    p = db.get(Proposal, "prop_gov_test")
    if p:
        db.delete(p)
    r = db.get(RFPRequirement, "req_gov_1")
    if r:
        db.delete(r)
    rf = db.get(RFPDocument, "prop_gov_rfp")
    if rf:
        db.delete(rf)
    db.commit()

    rfp = RFPDocument(
        id="prop_gov_rfp",
        customer_id="TEST_BANK",
        tender_number="LIC-GOV-001",
        title="Licitación Bancaria SOC",
        filename="bases.pdf",
        doc_type=DocumentType.ORIGINAL_RFP,
        s3_bucket="bkt",
        s3_key="k",
        page_count=3,
        status=ProcessingStatus.COMPLETED
    )
    db.add(rfp)

    req = RFPRequirement(
        id="req_gov_1",
        rfp_id="prop_gov_rfp",
        page_number=1,
        page_end=1,
        section_title="Sección 1",
        requirement_code="REQ-GOV-01",
        original_text="Monitoreo SOC 24/7",
        effective_text="Monitoreo SOC 24/7",
        is_mandatory=True,
        requirement_type=RequirementType.TECHNICAL,
        iqsec_pillar=IQSECPillar.SOC_SIEM,
        compliance_status=ComplianceStatus.COMPLIES,
        confidence_score=0.98
    )
    db.add(req)

    prop = Proposal(
        id="prop_gov_test",
        rfp_id="prop_gov_rfp",
        title="Propuesta Técnica SOC",
        total_requirements=1,
        compliant_count=1,
        overall_compliance_rate=100.0,
        sabana_status=SabanaApprovalStatus.PENDING_REVIEW,
        lifecycle_status=ProposalLifecycleStatus.DRAFT
    )
    db.add(prop)
    db.commit()
    db.close()
    yield


def test_stage2_fails_before_stage1_approval():
    """Stage 2 Final Sign-Off MUST fail if Stage 1 Sábana has not been approved yet"""
    client = TestClient(app)
    signoff_payload = {
        "signer_name": "Director_General",
        "notes": "Aprobación ejecutiva",
        "signoff_statement": "Certifico la revisión."
    }
    response = client.post("/api/v1/proposal/prop_gov_test/human2-signoff-proposal", json=signoff_payload)
    assert response.status_code == 400
    assert "Stage 1 Sábana matrix is formally approved" in response.json()["detail"]


def test_stage1_human1_sabana_approval():
    """Humano 1 approves the Sábana matrix"""
    client = TestClient(app)
    approval_payload = {
        "reviewer_name": "Ingeniero_Preventa_Senior",
        "notes": "Revisión celda por celda contra anexos completada satisfactoriamente.",
        "override_all_pending_as_approved": True
    }
    response = client.post("/api/v1/proposal/prop_gov_test/human1-approve-sabana", json=approval_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["sabana_status"] == SabanaApprovalStatus.SABANA_APPROVED.value
    assert data["sabana_approved_by"] == "Ingeniero_Preventa_Senior"
    assert data["lifecycle_status"] == ProposalLifecycleStatus.SABANA_VALIDATED.value


def test_stage2_human2_proposal_signoff_after_stage1():
    """Humano 2 performs final sign-off now that Stage 1 is validated"""
    client = TestClient(app)
    
    # 1. First Approve Stage 1
    client.post("/api/v1/proposal/prop_gov_test/human1-approve-sabana", json={
        "reviewer_name": "Ingeniero_Preventa_Senior",
        "notes": "Validado",
        "override_all_pending_as_approved": True
    })

    # 2. Perform Stage 2 Sign-off
    signoff_payload = {
        "signer_name": "Alejandro_Vergara_Director_IA",
        "notes": "Propuesta técnica aprobada para entrega formal.",
        "signoff_statement": "Certifico la revisión técnica, económica y regulatoria."
    }
    response = client.post("/api/v1/proposal/prop_gov_test/human2-signoff-proposal", json=signoff_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["lifecycle_status"] == ProposalLifecycleStatus.FINAL_SIGN_OFF.value
    assert data["final_signoff_by"] == "Alejandro_Vergara_Director_IA"


def test_governance_audit_trail_endpoint():
    """Retrieves full audit trail with Humano 1 and Humano 2 timestamps"""
    client = TestClient(app)
    
    # Approve Stage 1 & 2
    client.post("/api/v1/proposal/prop_gov_test/human1-approve-sabana", json={
        "reviewer_name": "Ingeniero_Preventa_Senior",
        "notes": "Validado",
        "override_all_pending_as_approved": True
    })
    client.post("/api/v1/proposal/prop_gov_test/human2-signoff-proposal", json={
        "signer_name": "Alejandro_Vergara_Director_IA",
        "notes": "Aprobado",
        "signoff_statement": "Certifico la revisión."
    })

    response = client.get("/api/v1/proposal/prop_gov_test/audit-trail")
    assert response.status_code == 200
    data = response.json()
    assert data["sabana_approved_by"] == "Ingeniero_Preventa_Senior"
    assert data["final_signoff_by"] == "Alejandro_Vergara_Director_IA"
    assert data["sabana_status"] == SabanaApprovalStatus.SABANA_APPROVED.value
    assert data["lifecycle_status"] == ProposalLifecycleStatus.FINAL_SIGN_OFF.value
