"""
Integration Tests for Proposal Generation and Smart Triage Endpoints
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
from backend.app.db.session import get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_rfp_data():
    db = TestingSessionLocal()
    rfp = db.get(RFPDocument, "rfp_api_test")
    if not rfp:
        rfp = RFPDocument(
            id="rfp_api_test",
            customer_id="API_CLIENT",
            tender_number="LIC-API-001",
            title="Licitación API Test",
            filename="test.pdf",
            doc_type=DocumentType.ORIGINAL_RFP,
            s3_bucket="bkt",
            s3_key="k",
            page_count=2,
            status=ProcessingStatus.COMPLETED
        )
        db.add(rfp)

        req = RFPRequirement(
            id="req_api_1",
            rfp_id="rfp_api_test",
            page_number=1,
            page_end=1,
            section_title="Sección 1",
            requirement_code="REQ-API-001",
            original_text="Monitoreo 24/7",
            effective_text="Monitoreo 24/7",
            is_mandatory=True,
            requirement_type=RequirementType.TECHNICAL,
            iqsec_pillar=IQSECPillar.SOC_SIEM,
            compliance_status=ComplianceStatus.NOT_EVALUATED
        )
        db.add(req)
        db.commit()
    db.close()


def test_generate_proposal_api():
    response = client.post(
        "/api/v1/proposal/generate/rfp_api_test",
        json={"customer_id": "API_CLIENT", "batch_size": 4}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["rfp_id"] == "rfp_api_test"
    assert data["total_requirements"] == 1
    assert data["status"] == "IN_REVIEW"


def test_review_and_override_requirement_api():
    patch_payload = {
        "compliance_status": "CUMPLE",
        "technical_response": "Respuesta validada por el ingeniero de preventa.",
        "human_approved": True,
        "reviewer_name": "Senior_SOC_Architect"
    }
    response = client.patch(
        "/api/v1/proposal/requirement/req_api_1/review",
        json=patch_payload
    )
    assert response.status_code == 200
    data = response.json()
    assert data["compliance_status"] == "CUMPLE"
    assert data["human_approved"] is True
    assert data["reviewed_by"] == "Senior_SOC_Architect"

