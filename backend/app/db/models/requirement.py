"""
RFP Requirement Database Model
Holds individual extracted requirements, sections, tables, addendum delta states, and compliance status.
"""
from enum import Enum
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base, TimestampMixin


class RequirementType(str, Enum):
    TECHNICAL = "TECHNICAL"
    SLA = "SLA"
    ECONOMIC = "ECONOMIC"
    ADMINISTRATIVE = "ADMINISTRATIVE"
    CERTIFICATION = "CERTIFICATION"
    STAFFING = "STAFFING"
    OTHER = "OTHER"


class ComplianceStatus(str, Enum):
    NOT_EVALUATED = "NOT_EVALUATED"
    COMPLIES = "CUMPLE"
    COMPLIES_WITH_EXCEPTION = "CUMPLE_CON_EXCEPCION"
    DOES_NOT_COMPLY = "NO_CUMPLE"
    NOT_ENOUGH_EVIDENCE = "NOT_ENOUGH_EVIDENCE"


class IQSECPillar(str, Enum):
    SOC_SIEM = "SOC_SIEM"
    CLOUD_SECURITY = "CLOUD_SECURITY"
    IAM = "IDENTITY_ACCESS_MGMT"
    VULN_MGMT = "VULNERABILITY_MGMT"
    INCIDENT_RESPONSE = "INCIDENT_RESPONSE"
    GRC = "GRC_COMPLIANCE"
    GENERAL = "GENERAL_MSSP"


class RFPRequirement(Base, TimestampMixin):
    __tablename__ = "rfp_requirements"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    rfp_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("rfp_documents.id"), nullable=False, index=True
    )
    
    # Structural Context & Location
    page_number: Mapped[int] = mapped_column(Integer, nullable=False)
    page_end: Mapped[int] = mapped_column(Integer, nullable=False)
    section_code: Mapped[Optional[str]] = mapped_column(String(64), index=True, nullable=True)
    section_title: Mapped[str] = mapped_column(String(512), nullable=False)
    section_hierarchy: Mapped[List[str]] = mapped_column(JSON, default=list)
    bounding_box: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Table Context (if requirement originated from a table)
    is_table_row: Mapped[bool] = mapped_column(Boolean, default=False)
    table_headers: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    table_markdown: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Requirement Content & Semantics
    requirement_code: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    original_text: Mapped[str] = mapped_column(Text, nullable=False)
    effective_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True)
    requirement_type: Mapped[RequirementType] = mapped_column(
        SQLEnum(RequirementType), default=RequirementType.TECHNICAL, nullable=False
    )
    iqsec_pillar: Mapped[IQSECPillar] = mapped_column(
        SQLEnum(IQSECPillar), default=IQSECPillar.SOC_SIEM, nullable=False
    )

    # Addendum Delta Engine Modifications
    is_modified_by_addendum: Mapped[bool] = mapped_column(Boolean, default=False)
    addendum_doc_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    addendum_reference: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    addendum_question_num: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    addendum_page_num: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    modification_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Compliance & AI Evaluation (Populated in Phase 3/4)
    compliance_status: Mapped[ComplianceStatus] = mapped_column(
        SQLEnum(ComplianceStatus), default=ComplianceStatus.NOT_EVALUATED, nullable=False
    )
    technical_response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    compliance_rationale: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)
    exact_citations: Mapped[Optional[List[dict]]] = mapped_column(JSON, default=list)
    human_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    reviewed_by: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    # Relationships
    rfp_document: Mapped["RFPDocument"] = relationship(
        "RFPDocument", back_populates="requirements"
    )

