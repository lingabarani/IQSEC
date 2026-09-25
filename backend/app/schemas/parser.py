"""
Pydantic Schemas for Document Parsing and Structured Output
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from backend.app.db.models.requirement import RequirementType, IQSECPillar


class BoundingBox(BaseModel):
    x0: float
    y0: float
    x1: float
    y1: float


class ParsedTable(BaseModel):
    table_id: str
    page_number: int
    headers: List[str] = Field(default_factory=list)
    rows: List[List[str]] = Field(default_factory=list)
    markdown: str
    bounding_box: Optional[BoundingBox] = None


class ParsedTextBlock(BaseModel):
    block_id: str
    page_number: int
    text: str
    font_size: float = 12.0
    is_bold: bool = False
    is_header: bool = False
    bounding_box: Optional[BoundingBox] = None


class ParsedPage(BaseModel):
    page_number: int
    total_chars: int
    is_scanned: bool = False
    ocr_applied: bool = False
    text_blocks: List[ParsedTextBlock] = Field(default_factory=list)
    tables: List[ParsedTable] = Field(default_factory=list)
    full_text: str = ""


class ExtractedRequirementSchema(BaseModel):
    requirement_code: str
    page_number: int
    page_end: int
    section_code: Optional[str] = None
    section_title: str
    section_hierarchy: List[str] = Field(default_factory=list)
    original_text: str
    effective_text: str
    is_mandatory: bool = True
    requirement_type: RequirementType = RequirementType.TECHNICAL
    iqsec_pillar: IQSECPillar = IQSECPillar.SOC_SIEM
    is_table_row: bool = False
    table_headers: Optional[List[str]] = None
    table_markdown: Optional[str] = None
    bounding_box: Optional[Dict[str, float]] = None


class ParsedDocumentResult(BaseModel):
    document_id: str
    filename: str
    page_count: int
    pages: List[ParsedPage] = Field(default_factory=list)
    requirements: List[ExtractedRequirementSchema] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

