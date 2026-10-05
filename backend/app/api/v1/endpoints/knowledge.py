"""
Knowledge Base and Scoped RAG Endpoints
"""
import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.db.models.knowledge import (
    KnowledgeDocument,
    ConfidentialityLevel,
)
from backend.app.db.models.requirement import IQSECPillar
from backend.app.schemas.rag import (
    ScopedSearchQuery,
    ScopedRAGResponse,
    KnowledgeDocumentUploadResponse,
)
from backend.app.services.knowledge_service import knowledge_service
from backend.app.services.hybrid_retriever import hybrid_retriever

router = APIRouter()


@router.post("/upload", response_model=KnowledgeDocumentUploadResponse)
async def upload_knowledge_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    pillar: IQSECPillar = Form(IQSECPillar.SOC_SIEM),
    confidentiality: ConfidentialityLevel = Form(ConfidentialityLevel.INTERNAL_IQSEC),
    customer_scope: str = Form("ALL_CUSTOMERS"),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload an IQSEC whitepaper, proposal, or datasheet:
    1. Parses layout with Hybrid Parser.
    2. Embeds chunks with Amazon Titan Embeddings v2 (1024 dims).
    3. Indexes to OpenSearch Serverless with customer & NDA scope.
    4. Persists metadata in RDS PostgreSQL.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for knowledge base.")

    upload_dir = os.path.join(tempfile.gettempdir(), "iqsec_knowledge_uploads")
    os.makedirs(upload_dir, exist_ok=True)
    temp_path = os.path.join(upload_dir, f"{uuid.uuid4().hex[:8]}_{file.filename}")

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        kdoc = knowledge_service.ingest_pdf_document(
            file_path=temp_path,
            title=title,
            pillar=pillar,
            confidentiality=confidentiality,
            customer_scope=customer_scope,
            db=db,
            description=description
        )

        return KnowledgeDocumentUploadResponse(
            document_id=kdoc.id,
            title=kdoc.title,
            pillar=kdoc.pillar,
            confidentiality=kdoc.confidentiality,
            customer_scope=kdoc.customer_scope,
            chunk_count=kdoc.chunk_count,
            message="Knowledge document ingested, embedded, and indexed successfully."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Knowledge ingestion error: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.post("/search", response_model=ScopedRAGResponse)
def search_scoped_knowledge(
    query: ScopedSearchQuery,
    db: Session = Depends(get_db)
):
    """
    Executes Scoped Hybrid RAG search against IQSEC Knowledge Base:
    - Pre-filters by customer_id and NDA confidentiality.
    - Runs Dense k-NN (Titan v2) + Lexical BM25 search.
    - Cross-Encoder Reranks candidates down to Top-3 high-precision evidence citations.
    """
    # Ensure baseline knowledge is seeded if empty
    knowledge_service.seed_default_iqsec_knowledge(db)
    
    response = hybrid_retriever.retrieve_evidence_for_requirement(query)
    return response


@router.post("/seed")
def seed_knowledge_base(db: Session = Depends(get_db)):
    """Seeds default IQSEC MSSP knowledge catalog into OpenSearch and PostgreSQL"""
    knowledge_service.seed_default_iqsec_knowledge(db)
    return {"message": "IQSEC default knowledge catalog seeded successfully."}


@router.get("/documents")
def list_knowledge_documents(
    pillar: Optional[IQSECPillar] = None,
    customer_scope: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Lists indexed knowledge documents in the knowledge base"""
    stmt = select(KnowledgeDocument)
    if pillar:
        stmt = stmt.where(KnowledgeDocument.pillar == pillar)
    if customer_scope:
        stmt = stmt.where(KnowledgeDocument.customer_scope == customer_scope)

    stmt = stmt.offset(skip).limit(limit)
    docs = db.execute(stmt).scalars().all()

    return [
        {
            "id": d.id,
            "title": d.title,
            "description": d.description,
            "pillar": d.pillar,
            "confidentiality": d.confidentiality,
            "customer_scope": d.customer_scope,
            "chunk_count": d.chunk_count,
            "created_at": d.created_at
        }
        for d in docs
    ]


@router.get("/products")
def list_products():
    """Lists available products, services, and OEM partner solutions in the IQSEC catalog"""
    return [
        {
            "id": "prod-1",
            "name": "Product ABC (OT Security Suite)",
            "category": "OT Infrastructure / SCADA",
            "sku": "IQ-OT-DEF-9000-E",
            "version": "v4.2 Enterprise",
            "manufacturer": "XYZ Technologies / IQSEC Solutions",
            "tier": "Tier-1 Certified OEM Partner",
            "capabilities": "Continuous OT monitoring, DPI for Modbus/DNP3, 15-min automated incident triage, zero network disruption.",
            "status": "Available"
        },
        {
            "id": "prod-2",
            "name": "IQSEC NextGen SOC MDR",
            "category": "SOC & SIEM Operations",
            "sku": "IQ-SOC-247-ENT",
            "version": "v2026.1",
            "manufacturer": "IQSEC Cybersecurity Services",
            "tier": "Proprietary Managed Service",
            "capabilities": "24/7/365 active monitoring, ISO 27001 / CMMI Nivel 3 certified, SLA 15-min Sev-1 response, redundant Tier-3 data centers.",
            "status": "Available"
        },
        {
            "id": "prod-3",
            "name": "IQSEC CloudGuard Multicloud CSPM/CWPP",
            "category": "Cloud Security",
            "sku": "IQ-CLD-SEC-PRO",
            "version": "v3.8",
            "manufacturer": "IQSEC Cloud Security Alliance",
            "tier": "AWS & Azure Premier Partner",
            "capabilities": "Native ingestion of CloudTrail, VPC Flow Logs, and Azure Activity Logs, automated CIS & CNBV compliance mapping.",
            "status": "Available"
        },
        {
            "id": "prod-4",
            "name": "IQSEC Privileged Access Manager (PAM)",
            "category": "Identity & Access Management",
            "sku": "IQ-PAM-VAULT-800",
            "version": "v14.0 Enterprise",
            "manufacturer": "CyberArk / IQSEC Solutions",
            "tier": "Platinum Certified Partner",
            "capabilities": "RDP/SSH video session recording, credential auto-rotation, WORM immutable storage, active directory integration.",
            "status": "Available"
        },
        {
            "id": "prod-5",
            "name": "IQSEC Cyber Threat Intelligence (CTI)",
            "category": "Threat Intelligence",
            "sku": "IQ-CTI-STIX-20",
            "version": "v5.0",
            "manufacturer": "Mandiant / IQSEC Labs",
            "tier": "Strategic Partner",
            "capabilities": "Commercial & national feeds (CERT-MX, FIRST), automated STIX/TAXII ingestion, contextual MITRE ATT&CK v14 correlation.",
            "status": "Available"
        }
    ]


