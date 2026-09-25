"""
Unit Tests for Scoped Hybrid Retriever and Cross-Encoder Reranker
"""
import pytest
from backend.app.schemas.rag import ScopedSearchQuery
from backend.app.services.hybrid_retriever import hybrid_retriever
from backend.app.services.vector_store import vector_store
from backend.app.services.embedding_service import embedding_service
from backend.app.db.models.knowledge import ConfidentialityLevel
from backend.app.db.models.requirement import IQSECPillar


@pytest.fixture(autouse=True)
def seed_test_chunks():
    vector_store.index_chunk(
        chunk_id="chunk_soc_cert",
        doc_id="doc_soc_whitepaper",
        doc_title="IQSEC SOC Whitepaper",
        page_number=14,
        section_title="3.2 Certificaciones y Estándares Internacionales",
        pillar=IQSECPillar.SOC_SIEM,
        customer_scope="ALL_CUSTOMERS",
        confidentiality=ConfidentialityLevel.PUBLIC,
        text="El Centro de Operaciones de Seguridad de IQSEC cuenta con certificación vigente ISO/IEC 27001:2022 y personal con certificaciones CISM, CISSP y CEH.",
        vector=embedding_service.generate_embedding("SOC IQSEC certificacion ISO 27001 personal certificado CISM CISSP")
    )


def test_retrieve_evidence_returns_top_3_with_citations():
    query = ScopedSearchQuery(
        query_text="El licitante deberá acreditar certificación ISO 27001 en su SOC 24/7",
        customer_id="DEFAULT_CUSTOMER",
        confidentiality_level=ConfidentialityLevel.INTERNAL_IQSEC,
        pillar=IQSECPillar.SOC_SIEM,
        top_k=10,
        final_top_k=3
    )

    response = hybrid_retriever.retrieve_evidence_for_requirement(query)

    assert response.total_candidates_found >= 1
    assert len(response.top_evidences) <= 3
    
    top_ev = response.top_evidences[0]
    assert top_ev.document_title == "IQSEC SOC Whitepaper"
    assert top_ev.page_number == 14
    assert "ISO" in top_ev.exact_quote or "27001" in top_ev.exact_quote
    assert top_ev.relevance_score > 0.0

