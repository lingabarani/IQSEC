"""
Pydantic Schemas for RFP Management and API Endpoints
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from backend.app.db.models.rfp import DocumentType, ProcessingStatus
from backend.app.db.models.requirement import (
    RequirementType,
    ComplianceStatus,
    IQSECPillar,
)


class RFPRequirementResponse(BaseModel):
    id: str
    rfp_id: str
    page_number: int
    page_end: int
    section_code: Optional[str] = None
    section_title: str
    section_hierarchy: List[str] = Field(default_factory=list)
    requirement_code: str
    original_text: str
    effective_text: str
    is_mandatory: bool
    requirement_type: RequirementType
    iqsec_pillar: IQSECPillar
    is_table_row: bool
    table_markdown: Optional[str] = None
    is_modified_by_addendum: bool
    addendum_reference: Optional[str] = None
    addendum_question_num: Optional[str] = None
    addendum_page_num: Optional[int] = None
    modification_notes: Optional[str] = None
    compliance_status: ComplianceStatus
    technical_response: Optional[str] = None
    compliance_rationale: Optional[str] = None
    confidence_score: float = 0.0
    exact_citations: Optional[List[Dict[str, Any]]] = None
    human_approved: bool = False
    reviewed_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RFPDocumentResponse(BaseModel):
    id: str
    customer_id: str
    tender_number: str
    title: str
    filename: str
    doc_type: DocumentType
    s3_bucket: str
    s3_key: str
    page_count: int
    status: ProcessingStatus
    error_message: Optional[str] = None
    parent_rfp_id: Optional[str] = None
    total_requirements: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RFPUploadResponse(BaseModel):
    document_id: str
    filename: str
    status: ProcessingStatus
    message: str
    page_count: int = 0
    extracted_requirements_count: int = 0
