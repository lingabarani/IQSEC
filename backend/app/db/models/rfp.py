"""
RFP Document Database Model
Tracks uploaded tender documents, addendums, and processing state.
"""
from enum import Enum
from typing import List, Optional
from sqlalchemy import String, Integer, DateTime, Enum as SQLEnum, JSON, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base, TimestampMixin


class DocumentType(str, Enum):
    ORIGINAL_RFP = "ORIGINAL_RFP"
    TECHNICAL_ANNEX = "TECHNICAL_ANNEX"
    ADDENDUM_JUNTA = "ADDENDUM_JUNTA"
    PRICING_SHEET = "PRICING_SHEET"


class ProcessingStatus(str, Enum):
    PENDING = "PENDING"
    PARSING = "PARSING"
    EXTRACTING_REQUIREMENTS = "EXTRACTING_REQUIREMENTS"
    APPLYING_ADDENDUMS = "APPLYING_ADDENDUMS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class RFPDocument(Base, TimestampMixin):
    __tablename__ = "rfp_documents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    customer_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    tender_number: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    filename: Mapped[str] = mapped_column(String(256), nullable=False)
    doc_type: Mapped[DocumentType] = mapped_column(
        SQLEnum(DocumentType),
        default=DocumentType.ORIGINAL_RFP,
        nullable=False
    )
    s3_bucket: Mapped[str] = mapped_column(String(128), nullable=False)
    s3_key: Mapped[str] = mapped_column(String(512), nullable=False)
    page_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[ProcessingStatus] = mapped_column(
        SQLEnum(ProcessingStatus),
        default=ProcessingStatus.PENDING,
        nullable=False
    )
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)

    # Parent RFP relationship if this is an Addendum document
    parent_rfp_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("rfp_documents.id"), nullable=True
    )

    # Relationships
    requirements: Mapped[List["RFPRequirement"]] = relationship(
        "RFPRequirement", back_populates="rfp_document", cascade="all, delete-orphan"
    )
    addendums: Mapped[List["RFPDocument"]] = relationship(
        "RFPDocument", remote_side=[id], cascade="all"
    )

