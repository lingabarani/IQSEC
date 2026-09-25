"""
RFP Document Ingestion, Parsing, and Addendum API Endpoints
"""
import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
import boto3

from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.db.models.rfp import RFPDocument, DocumentType, ProcessingStatus
from backend.app.db.models.requirement import RFPRequirement, ComplianceStatus, IQSECPillar
from backend.app.schemas.rfp import (
    RFPDocumentResponse,
    RFPUploadResponse,
    RFPRequirementResponse,
)
from backend.app.schemas.addendum import AddendumDeltaResult
from backend.app.services.hybrid_parser import parser_service
from backend.app.services.addendum_engine import addendum_engine

router = APIRouter()

# Setup S3 Client (will upload if AWS credentials available, otherwise local cache)
s3_client = boto3.client("s3", region_name=settings.AWS_REGION)


@router.post("/upload", response_model=RFPUploadResponse)
async def upload_rfp_document(
    file: UploadFile = File(...),
    customer_id: str = Form("DEFAULT_CUSTOMER"),
    tender_number: str = Form("LIC-2026-001"),
    title: str = Form("Propuesta Técnica y Económica MSSP"),
    db: Session = Depends(get_db)
):
    """
    Upload an RFP PDF document:
    1. Saves file to local staging and S3 RFP bucket.
    2. Runs Hybrid Parser (PyMuPDF + OCR Fallback + Table Detection).
    3. Extracts atomic requirements and stores them in RDS PostgreSQL.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    doc_id = f"rfp_{uuid.uuid4().hex[:12]}"
    os.makedirs("/tmp/iqsec_uploads", exist_ok=True)
    temp_path = f"/tmp/iqsec_uploads/{doc_id}_{file.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 1. Attempt upload to S3 (non-blocking if local dev)
    s3_key = f"rfps/{customer_id}/{doc_id}/{file.filename}"
    try:
        s3_client.upload_file(temp_path, settings.RFP_BUCKET_NAME, s3_key)
    except Exception as e:
        # Fallback for local offline testing
        pass

    # 2. Register RFP Document in DB
    rfp_record = RFPDocument(
        id=doc_id,
        customer_id=customer_id,
        tender_number=tender_number,
        title=title,
        filename=file.filename,
        doc_type=DocumentType.ORIGINAL_RFP,
        s3_bucket=settings.RFP_BUCKET_NAME,
        s3_key=s3_key,
        status=ProcessingStatus.PARSING,
    )
    db.add(rfp_record)
    db.commit()

    # 3. Execute Hybrid Parsing
    try:
        parsed_result = parser_service.parse_pdf_file(temp_path, doc_id=doc_id)
        rfp_record.page_count = parsed_result.page_count
        rfp_record.status = ProcessingStatus.EXTRACTING_REQUIREMENTS

        # 4. Insert extracted requirements into DB
        for req in parsed_result.requirements:
            db_req = RFPRequirement(
                id=f"req_{uuid.uuid4().hex[:12]}",
                rfp_id=doc_id,
                page_number=req.page_number,
                page_end=req.page_end,
                section_code=req.section_code,
                section_title=req.section_title,
                section_hierarchy=req.section_hierarchy,
                bounding_box=req.bounding_box,
                is_table_row=req.is_table_row,
                table_headers=req.table_headers,
                table_markdown=req.table_markdown,
                requirement_code=req.requirement_code,
                original_text=req.original_text,
                effective_text=req.effective_text,
                is_mandatory=req.is_mandatory,
                requirement_type=req.requirement_type,
                iqsec_pillar=req.iqsec_pillar,
                compliance_status=ComplianceStatus.NOT_EVALUATED
            )
            db.add(db_req)

        rfp_record.status = ProcessingStatus.COMPLETED
        db.commit()

        return RFPUploadResponse(
            document_id=doc_id,
            filename=file.filename,
            status=ProcessingStatus.COMPLETED,
            message="RFP parsed and structured requirements extracted successfully.",
            page_count=parsed_result.page_count,
            extracted_requirements_count=len(parsed_result.requirements)
        )

    except Exception as e:
        rfp_record.status = ProcessingStatus.FAILED
        rfp_record.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Parsing error: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.post("/{rfp_id}/addendum", response_model=AddendumDeltaResult)
async def upload_addendum_document(
    rfp_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload an Addendum / Junta de Aclaraciones PDF:
    1. Parses questions, official answers, and referenced numerals.
    2. Reconciles deltas against the original RFP requirements.
    3. Updates effective_text and flags modified requirements in PostgreSQL.
    """
    rfp = db.get(RFPDocument, rfp_id)
    if not rfp:
        raise HTTPException(status_code=404, detail="Parent RFP document not found.")

    addendum_id = f"add_{uuid.uuid4().hex[:12]}"
    os.makedirs("/tmp/iqsec_uploads", exist_ok=True)
    temp_path = f"/tmp/iqsec_uploads/{addendum_id}_{file.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # 1. Parse Addendum Q&As
        clarifications, delta_res = addendum_engine.process_addendum_document(
            temp_path, parent_rfp_id=rfp_id, addendum_doc_id=addendum_id
        )

        # 2. Fetch existing requirements for this RFP
        existing_reqs = db.execute(
            select(RFPRequirement).where(RFPRequirement.rfp_id == rfp_id)
        ).scalars().all()

        modified_count = 0
        modified_codes = []

        # 3. Match and apply deltas
        for item in clarifications:
            for clause in item.referenced_clauses:
                for req in existing_reqs:
                    clean_clause = clause.lower().strip()
                    if clean_clause in req.requirement_code.lower() or (req.section_code and clean_clause in req.section_code.lower()):
                        req.is_modified_by_addendum = True
                        req.addendum_doc_id = addendum_id
                        req.addendum_reference = file.filename
                        req.addendum_question_num = item.question_number
                        req.addendum_page_num = item.page_number
                        req.modification_notes = f"Modificado por {item.question_number or 'Aclaración'}: {item.response_text}"
                        
                        if item.action_type.value == "DELETION":
                            req.effective_text = f"[CANCELADO EN JUNTA DE ACLARACIONES]: {req.original_text}"
                            req.is_mandatory = False
                        elif item.proposed_override:
                            req.effective_text = item.proposed_override

                        modified_count += 1
                        if req.requirement_code not in modified_codes:
                            modified_codes.append(req.requirement_code)

        db.commit()

        delta_res.total_modifications_applied = modified_count
        delta_res.modified_requirement_codes = modified_codes

        return delta_res

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Addendum processing failed: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.get("/{rfp_id}", response_model=RFPDocumentResponse)
def get_rfp_document(rfp_id: str, db: Session = Depends(get_db)):
    """Retrieves RFP document details and requirements count"""
    rfp = db.get(RFPDocument, rfp_id)
    if not rfp:
        raise HTTPException(status_code=404, detail="RFP document not found.")

    count = len(rfp.requirements)
    res = RFPDocumentResponse.model_validate(rfp)
    res.total_requirements = count
    return res


@router.get("/{rfp_id}/requirements", response_model=List[RFPRequirementResponse])
def get_rfp_requirements(
    rfp_id: str,
    pillar: Optional[IQSECPillar] = None,
    is_mandatory: Optional[bool] = None,
    is_modified: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Lists extracted requirements for an RFP with filters and pagination"""
    stmt = select(RFPRequirement).where(RFPRequirement.rfp_id == rfp_id)

    if pillar:
        stmt = stmt.where(RFPRequirement.iqsec_pillar == pillar)
    if is_mandatory is not None:
        stmt = stmt.where(RFPRequirement.is_mandatory == is_mandatory)
    if is_modified is not None:
        stmt = stmt.where(RFPRequirement.is_modified_by_addendum == is_modified)

    stmt = stmt.offset(skip).limit(limit)
    records = db.execute(stmt).scalars().all()
    return [RFPRequirementResponse.model_validate(r) for r in records]

