"""
Scoped Hybrid Retriever Service
Combines Titan v2 Vector Search, Lexical BM25, Multi-Tenant & NDA Scoping,
and Cross-Encoder Reranking to deliver authoritative evidence citations for RFPs.
"""
import logging
from typing import Optional
from backend.app.db.models.knowledge import ConfidentialityLevel
from backend.app.db.models.requirement import IQSECPillar
from backend.app.schemas.rag import ScopedSearchQuery, ScopedRAGResponse
from backend.app.services.embedding_service import embedding_service
from backend.app.services.vector_store import vector_store
from backend.app.services.reranker import reranker

logger = logging.getLogger("iqsec.retriever")
logger.setLevel(logging.INFO)


class ScopedHybridRetriever:
    """
    End-to-End Hybrid RAG Retriever with Scoped Isolation & Cross-Encoder Reranking.
    """

    def retrieve_evidence_for_requirement(
        self,
        query: ScopedSearchQuery
    ) -> ScopedRAGResponse:
        """
        Executes complete Scoped Hybrid RAG retrieval pipeline:
        1. Embeds query text with Titan v2 (1024 dims).
        2. Retrieves Top-25 candidates via OpenSearch Scoped Hybrid Search.
        3. Reranks Top-25 down to Top-3 high-precision evidence citations.
        """
        # 1. Generate Query Vector
        query_vector = embedding_service.generate_embedding(query.query_text)

        # 2. Scoped Hybrid Search (Enforcing multi-customer & NDA isolation)
        candidate_chunks = vector_store.scoped_hybrid_search(
            query_text=query.query_text,
            query_vector=query_vector,
            customer_id=query.customer_id,
            max_confidentiality=query.confidentiality_level,
            pillar_filter=query.pillar,
            top_k=query.top_k
        )

        logger.info(
            f"Retrieved {len(candidate_chunks)} candidate chunks for query: '{query.query_text[:50]}...'"
        )

        # 3. Cross-Encoder Reranking (Top-25 -> Top-3)
        top_citations = reranker.rerank(
            query=query.query_text,
            candidates=candidate_chunks,
            top_k=query.final_top_k
        )

        return ScopedRAGResponse(
            query=query.query_text,
            customer_id=query.customer_id,
            total_candidates_found=len(candidate_chunks),
            top_evidences=top_citations,
            retrieved_chunks=candidate_chunks[:query.final_top_k]
        )


hybrid_retriever = ScopedHybridRetriever()

