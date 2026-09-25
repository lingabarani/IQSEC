"""
Unit Tests for OpenSearch Vector Store & Multi-Tenant Scoped Isolation
Validates mathematical pre-filtering preventing cross-customer data leakage and NDA violations.
"""
import pytest
from backend.app.services.vector_store import OpenSearchVectorStore
from backend.app.services.embedding_service import embedding_service
from backend.app.db.models.knowledge import ConfidentialityLevel
from backend.app.db.models.requirement import IQSECPillar


@pytest.fixture
def configured_vector_store():
    store = OpenSearchVectorStore()

    # 1. Public IQSEC General Chunk
    store.index_chunk(
        chunk_id="chunk_pub_1",
        doc_id="doc_pub",
        doc_title="IQSEC General SOC Datasheet",
        page_number=1,
        section_title="1.1 SOC 24/7 Overview",
        pillar=IQSECPillar.SOC_SIEM,
        customer_scope="ALL_CUSTOMERS",
        confidentiality=ConfidentialityLevel.PUBLIC,
        text="IQSEC opera un Centro de Operaciones de Seguridad SOC 24/7/365 en México.",
        vector=embedding_service.generate_embedding("SOC 24/7/365 operando en Mexico")
    )

    # 2. Confidential Bank Santander Chunk
    store.index_chunk(
        chunk_id="chunk_santander_1",
        doc_id="doc_santander",
        doc_title="Propuesta Confidencial Banco Santander",
        page_number=5,
        section_title="5. Precios Especiales Santander",
        pillar=IQSECPillar.SOC_SIEM,
        customer_scope="BANK_SANTANDER",
        confidentiality=ConfidentialityLevel.RESTRICTED_NDA,
        text="Precio confidencial exclusivo para Banco Santander con descuento del 25% en SIEM Splunk.",
        vector=embedding_service.generate_embedding("Precio confidencial Banco Santander descuento SIEM Splunk")
    )

    # 3. Confidential Bank Banorte Chunk
    store.index_chunk(
        chunk_id="chunk_banorte_1",
        doc_id="doc_banorte",
        doc_title="Propuesta Confidencial Banorte",
        page_number=3,
        section_title="3. Arquitectura Privada Banorte",
        pillar=IQSECPillar.SOC_SIEM,
        customer_scope="BANK_BANORTE",
        confidentiality=ConfidentialityLevel.RESTRICTED_NDA,
        text="Arquitectura privada de monitoreo para Banorte con enlace MPLS dedicado.",
        vector=embedding_service.generate_embedding("Arquitectura privada Banorte MPLS dedicado")
    )

    return store


def test_customer_isolation_prevents_data_leakage(configured_vector_store):
    """
    Ensures searching for Santander NEVER returns Banorte's chunks, even with high semantic similarity.
    """
    query_text = "Arquitectura de monitoreo y precios confidenciales de SOC"
    query_vec = embedding_service.generate_embedding(query_text)

    # Search on behalf of Santander
    santander_results = configured_vector_store.scoped_hybrid_search(
        query_text=query_text,
        query_vector=query_vec,
        customer_id="BANK_SANTANDER",
        max_confidentiality=ConfidentialityLevel.RESTRICTED_NDA,
        top_k=10
    )

    retrieved_scopes = [r.customer_scope for r in santander_results]
    assert "BANK_BANORTE" not in retrieved_scopes
    assert "BANK_SANTANDER" in retrieved_scopes or "ALL_CUSTOMERS" in retrieved_scopes


def test_nda_confidentiality_tier_filtering(configured_vector_store):
    """
    Ensures a PUBLIC request never accesses RESTRICTED_NDA documents.
    """
    query_text = "Precio confidencial con descuento exclusivo"
    query_vec = embedding_service.generate_embedding(query_text)

    public_results = configured_vector_store.scoped_hybrid_search(
        query_text=query_text,
        query_vector=query_vec,
        customer_id="BANK_SANTANDER",
        max_confidentiality=ConfidentialityLevel.PUBLIC,
        top_k=10
    )

    for r in public_results:
        assert r.confidentiality == ConfidentialityLevel.PUBLIC
        assert r.chunk_id != "chunk_santander_1"

