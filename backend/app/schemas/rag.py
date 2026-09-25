"""
Pydantic Schemas for Scoped Hybrid RAG and Evidence Retrieval
"""
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from backend.app.db.models.knowledge import ConfidentialityLevel
from backend.app.db.models.requirement import IQSECPillar


class ScopedSearchQuery(BaseModel):
    query_text: str
    customer_id: str = "DEFAULT_CUSTOMER"
    confidentiality_level: ConfidentialityLevel = ConfidentialityLevel.INTERNAL_IQSEC
    pillar: Optional[IQSECPillar] = None
    top_k: int = 25
    final_top_k: int = 3


class RetrievedChunk(BaseModel):
    chunk_id: str
    doc_id: str
    doc_title: str
    page_number: int
    section_title: str
    pillar: IQSECPillar
    customer_scope: str
    confidentiality: ConfidentialityLevel
    text: str
    score: float = 0.0
    retrieval_mode: str = "hybrid"  # vector, bm25, or hybrid


class EvidenceCitation(BaseModel):
    document_title: str
    page_number: int
    section_title: str
    exact_quote: str
    relevance_score: float
    pillar: IQSECPillar
    confidentiality: ConfidentialityLevel


class ScopedRAGResponse(BaseModel):
    query: str
    customer_id: str
    total_candidates_found: int
    top_evidences: List[EvidenceCitation]
    retrieved_chunks: List[RetrievedChunk] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class KnowledgeDocumentUploadResponse(BaseModel):
    document_id: str
    title: str
    pillar: IQSECPillar
    confidentiality: ConfidentialityLevel
    customer_scope: str
    chunk_count: int
    message: str

