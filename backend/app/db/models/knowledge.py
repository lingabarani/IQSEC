"""
Knowledge Base Models
Stores IQSEC past proposals, whitepapers, service catalogs, and SLA datasheets.
Enforces multi-customer isolation and NDA confidentiality tiers.
"""
from enum import Enum
from typing import List, Optional
from sqlalchemy import String, Integer, Text, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base, TimestampMixin
from backend.app.db.models.requirement import IQSECPillar


class ConfidentialityLevel(str, Enum):
    PUBLIC = "PUBLIC"
    INTERNAL_IQSEC = "INTERNAL_IQSEC"
    RESTRICTED_NDA = "RESTRICTED_NDA"
    HIGHLY_CONFIDENTIAL = "HIGHLY_CONFIDENTIAL"


class KnowledgeDocument(Base, TimestampMixin):
    __tablename__ = "knowledge_documents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    pillar: Mapped[IQSECPillar] = mapped_column(
        SQLEnum(IQSECPillar), default=IQSECPillar.SOC_SIEM, nullable=False
    )
    confidentiality: Mapped[ConfidentialityLevel] = mapped_column(
        SQLEnum(ConfidentialityLevel), default=ConfidentialityLevel.INTERNAL_IQSEC, nullable=False
    )
    customer_scope: Mapped[str] = mapped_column(
        String(64), default="ALL_CUSTOMERS", index=True, nullable=False
    )
    s3_bucket: Mapped[str] = mapped_column(String(128), nullable=False)
    s3_key: Mapped[str] = mapped_column(String(512), nullable=False)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)

    chunks: Mapped[List["KnowledgeChunk"]] = relationship(
        "KnowledgeChunk", back_populates="document", cascade="all, delete-orphan"
    )


class KnowledgeChunk(Base, TimestampMixin):
    __tablename__ = "knowledge_chunks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    document_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("knowledge_documents.id"), nullable=False, index=True
    )
    page_number: Mapped[int] = mapped_column(Integer, nullable=False)
    section_title: Mapped[str] = mapped_column(String(512), nullable=False)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    vector_id: Mapped[Optional[str]] = mapped_column(String(128), index=True, nullable=True)
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)

    document: Mapped["KnowledgeDocument"] = relationship(
        "KnowledgeDocument", back_populates="chunks"
    )

