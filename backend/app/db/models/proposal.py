"""
Proposal and Deliverable Database Models
Tracks generated proposals, 2-Stage human approval workflows, and exported artifact files.
"""
from datetime import datetime
from enum import Enum
from typing import Optional, List
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Enum as SQLEnum, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base, TimestampMixin


class DeliverableType(str, Enum):
    SABANA_XLSX = "SABANA_XLSX"
    TECHNICAL_DOCX = "TECHNICAL_DOCX"
    EXECUTIVE_PPTX = "EXECUTIVE_PPTX"


class SabanaApprovalStatus(str, Enum):
    PENDING_REVIEW = "PENDING_REVIEW"
    SABANA_APPROVED = "SABANA_APPROVED"
    SABANA_REJECTED = "SABANA_REJECTED"


class ProposalLifecycleStatus(str, Enum):
    DRAFT = "DRAFT"
    SABANA_VALIDATED = "SABANA_VALIDATED"
    PROPOSAL_IN_REVIEW = "PROPOSAL_IN_REVIEW"
    PROPOSAL_APPROVED = "PROPOSAL_APPROVED"
    FINAL_SIGN_OFF = "FINAL_SIGN_OFF"


class Proposal(Base, TimestampMixin):
    __tablename__ = "proposals"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    rfp_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("rfp_documents.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(64), default="DRAFT") # Legacy status field
    
    # Quantitative Metrics
    total_requirements: Mapped[int] = mapped_column(Integer, default=0)
    compliant_count: Mapped[int] = mapped_column(Integer, default=0)
    exception_count: Mapped[int] = mapped_column(Integer, default=0)
    non_compliant_count: Mapped[int] = mapped_column(Integer, default=0)
    overall_compliance_rate: Mapped[float] = mapped_column(Float, default=0.0)
    model_provider_used: Mapped[str] = mapped_column(String(64), default="SELF_HOSTED_QWEN")

    # Stage 1: Humano 1 (Sábana Matrix Validation)
    sabana_status: Mapped[SabanaApprovalStatus] = mapped_column(
        SQLEnum(SabanaApprovalStatus), default=SabanaApprovalStatus.PENDING_REVIEW, nullable=False
    )
    sabana_approved_by: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    sabana_approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    sabana_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Stage 2: Humano 2 (Final Technical & Executive Proposal Sign-Off)
    lifecycle_status: Mapped[ProposalLifecycleStatus] = mapped_column(
        SQLEnum(ProposalLifecycleStatus), default=ProposalLifecycleStatus.DRAFT, nullable=False
    )
    final_signoff_by: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    final_signoff_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    final_signoff_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Deliverables relationship
    deliverables: Mapped[List["ProposalDeliverable"]] = relationship(
        "ProposalDeliverable", back_populates="proposal", cascade="all, delete-orphan"
    )


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

    proposal: Mapped["Proposal"] = relationship(
        "Proposal", back_populates="deliverables"
    )
