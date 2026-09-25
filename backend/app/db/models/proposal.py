"""
Proposal and Deliverable Database Models
Tracks generated proposals, approval workflows, and exported artifact files.
"""
from enum import Enum
from typing import Optional
from sqlalchemy import String, Integer, Float, ForeignKey, Enum as SQLEnum, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.db.base import Base, TimestampMixin


class DeliverableType(str, Enum):
    SABANA_XLSX = "SABANA_XLSX"
    TECHNICAL_DOCX = "TECHNICAL_DOCX"
    EXECUTIVE_PPTX = "EXECUTIVE_PPTX"


class Proposal(Base, TimestampMixin):
    __tablename__ = "proposals"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    rfp_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("rfp_documents.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(64), default="DRAFT") # DRAFT, IN_REVIEW, APPROVED, EXPORTED
    total_requirements: Mapped[int] = mapped_column(Integer, default=0)
    compliant_count: Mapped[int] = mapped_column(Integer, default=0)
    exception_count: Mapped[int] = mapped_column(Integer, default=0)
    non_compliant_count: Mapped[int] = mapped_column(Integer, default=0)
    overall_compliance_rate: Mapped[float] = mapped_column(Float, default=0.0)


class ProposalDeliverable(Base, TimestampMixin):
    __tablename__ = "proposal_deliverables"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    proposal_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("proposals.id"), nullable=False, index=True
    )
    deliverable_type: Mapped[DeliverableType] = mapped_column(
        SQLEnum(DeliverableType), nullable=False
    )
    filename: Mapped[str] = mapped_column(String(256), nullable=False)
    s3_bucket: Mapped[str] = mapped_column(String(128), nullable=False)
    s3_key: Mapped[str] = mapped_column(String(512), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    download_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
