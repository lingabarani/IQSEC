"""
Unit Tests for Batch Proposal Generator & Smart Triage
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.db.base import Base
import backend.app.db.models
from backend.app.db.models.rfp import RFPDocument, DocumentType, ProcessingStatus
from backend.app.db.models.requirement import RFPRequirement, RequirementType, ComplianceStatus, IQSECPillar
from backend.app.db.models.knowledge import ConfidentialityLevel
from backend.app.services.proposal_generator import proposal_generator
from backend.app.services.vector_store import vector_store
from backend.app.services.embedding_service import embedding_service


@pytest.fixture
def db_session_with_rfp():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSession()

    # Seed Knowledge
    vector_store.index_chunk(
        chunk_id="chunk_soc_test",
        doc_id="doc_soc_catalog",
        doc_title="IQSEC Catálogo de Servicios SOC",
        page_number=1,
        section_title="1.1 Monitoreo Continuo 24/7",
        pillar=IQSECPillar.SOC_SIEM,
        customer_scope="ALL_CUSTOMERS",
        confidentiality=ConfidentialityLevel.PUBLIC,
        text="IQSEC opera un SOC 24/7 certificado ISO 27001 con analistas N1, N2 y N3.",
        vector=embedding_service.generate_embedding("SOC 24/7 certificado ISO 27001 analistas N1 N2 N3")
    )

    # Create RFP Document
    rfp = RFPDocument(
        id="rfp_batch_test",
        customer_id="TEST_CLIENT",
        tender_number="LIC-BATCH-001",
        title="Licitación SOC 2026",
        filename="bases_soc.pdf",
        doc_type=DocumentType.ORIGINAL_RFP,
        s3_bucket="test-bucket",
        s3_key="test/bases.pdf",
        page_count=5,
        status=ProcessingStatus.COMPLETED
    )
    db.add(rfp)

    # Add 4 requirements
    for i in range(1, 5):
        req = RFPRequirement(
            id=f"req_test_{i}",
            rfp_id="rfp_batch_test",
            page_number=i,
            page_end=i,
            section_code=f"3.{i}",
            section_title=f"3.{i} Especificación Técnica",
            section_hierarchy=["3. Requerimientos", f"3.{i} Especificación"],
            requirement_code=f"REQ-00{i}",
            original_text=f"El licitante deberá proporcionar monitoreo SOC 24/7 con analistas nivel {i}.",
            effective_text=f"El licitante deberá proporcionar monitoreo SOC 24/7 con analistas nivel {i}.",
            is_mandatory=True,
            requirement_type=RequirementType.TECHNICAL,
            iqsec_pillar=IQSECPillar.SOC_SIEM,
            compliance_status=ComplianceStatus.NOT_EVALUATED
        )
        db.add(req)

    db.commit()
    yield db
    db.close()


@pytest.mark.asyncio
async def test_generate_full_proposal_batches_and_aggregates(db_session_with_rfp):
    summary = await proposal_generator.generate_full_proposal(
        rfp_id="rfp_batch_test",
        customer_id="TEST_CLIENT",
        db=db_session_with_rfp,
        batch_size=2
    )

    assert summary.total_requirements == 4
    assert summary.compliant_count >= 1
    assert summary.overall_compliance_rate > 0.0
    assert summary.generation_time_seconds >= 0.0
    assert summary.status == "IN_REVIEW"

