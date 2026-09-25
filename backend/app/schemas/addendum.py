"""
Pydantic Schemas for Addendum Delta Engine
Tracks clarification minutes, questions, responses, and requirement overrides.
"""
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class DeltaActionType(str, Enum):
    MODIFICATION = "MODIFICATION"
    DELETION = "DELETION"
    ADDITION = "ADDITION"
    CLARIFICATION_ONLY = "CLARIFICATION_ONLY"
    NO_CHANGE = "NO_CHANGE"


class AddendumClarificationItem(BaseModel):
    item_id: str
    page_number: int
    question_number: Optional[str] = None
    question_text: str
    response_text: str
    referenced_clauses: List[str] = Field(default_factory=list)
    action_type: DeltaActionType = DeltaActionType.CLARIFICATION_ONLY
    proposed_override: Optional[str] = None


class AddendumDeltaResult(BaseModel):
    addendum_doc_id: str
    addendum_filename: str
    parent_rfp_id: str
    total_clarifications_found: int
    total_modifications_applied: int
    modified_requirement_codes: List[str] = Field(default_factory=list)
    clarification_items: List[AddendumClarificationItem] = Field(default_factory=list)

