"""
Knowledge Base Ingestion Service
Manages uploading, parsing, embedding, and vector indexing of IQSEC whitepapers,
service catalogs, SLAs, and previous winning proposals.
"""
import os
import uuid
import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.app.core.config import settings
from backend.app.db.models.knowledge import (
    KnowledgeDocument,
    KnowledgeChunk,
    ConfidentialityLevel,
)
from backend.app.db.models.requirement import IQSECPillar
from backend.app.schemas.parser import ParsedDocumentResult
from backend.app.services.hybrid_parser import parser_service
from backend.app.services.embedding_service import embedding_service
from backend.app.services.vector_store import vector_store

logger = logging.getLogger("iqsec.knowledge")
logger.setLevel(logging.INFO)


class KnowledgeService:
    """
    Ingestion & Indexing Pipeline for IQSEC Enterprise Knowledge
    """

    def ingest_pdf_document(
        self,
        file_path: str,
        title: str,
        pillar: IQSECPillar,
        confidentiality: ConfidentialityLevel,
        customer_scope: str,
        db: Session,
        description: Optional[str] = None,
        s3_bucket: Optional[str] = None,
        s3_key: Optional[str] = None
    ) -> KnowledgeDocument:
        """
        Parses a knowledge document PDF, generates Titan v2 embeddings,
        indexes into OpenSearch Serverless, and saves records in PostgreSQL.
        """
        doc_id = f"kdoc_{uuid.uuid4().hex[:12]}"
        filename = os.path.basename(file_path)

        # 1. Parse document structure
        parsed_doc: ParsedDocumentResult = parser_service.parse_pdf_file(file_path, doc_id=doc_id)

        # 2. Register Document in DB
        db_doc = KnowledgeDocument(
            id=doc_id,
            title=title,
            description=description or f"IQSEC {pillar.value} Document: {title}",
            pillar=pillar,
            confidentiality=confidentiality,
            customer_scope=customer_scope,
            s3_bucket=s3_bucket or settings.KNOWLEDGE_BUCKET_NAME,
            s3_key=s3_key or f"knowledge/{pillar.value}/{filename}",
            chunk_count=0
        )
        db.add(db_doc)
        db.commit()

        # 3. Create Chunks, Generate Embeddings, and Index
        created_chunks = []
        for page in parsed_doc.pages:
            for block in page.text_blocks:
                if len(block.text.strip()) < 35:
                    continue

                chunk_id = f"kchk_{uuid.uuid4().hex[:12]}"
                section_title = block.text[:80] if block.is_header else f"Página {page.page_number} - Sección Técnica"

                # Generate 1024-dim Titan Embedding
                vector = embedding_service.generate_embedding(
                    f"[{pillar.value}] [{title}] {block.text}"
                )

                # Index to OpenSearch Serverless
                vector_store.index_chunk(
                    chunk_id=chunk_id,
                    doc_id=doc_id,
                    doc_title=title,
                    page_number=page.page_number,
                    section_title=section_title,
                    pillar=pillar,
                    customer_scope=customer_scope,
                    confidentiality=confidentiality,
                    text=block.text,
                    vector=vector
                )

                # Save chunk record to DB
                db_chunk = KnowledgeChunk(
                    id=chunk_id,
                    document_id=doc_id,
                    page_number=page.page_number,
                    section_title=section_title,
                    chunk_text=block.text,
                    vector_id=chunk_id,
                    token_count=len(block.text.split()),
                    metadata_json={
                        "is_bold": block.is_bold,
                        "font_size": block.font_size
                    }
                )
                db.add(db_chunk)
                created_chunks.append(db_chunk)

        db_doc.chunk_count = len(created_chunks)
        db.commit()

        logger.info(f"Successfully indexed knowledge document '{title}' ({len(created_chunks)} chunks).")
        return db_doc

    def seed_default_iqsec_knowledge(self, db: Session):
        """
        Seeds standard baseline IQSEC service capabilities, certifications (ISO 27001, CNBV),
        and SLA datasheets into OpenSearch and PostgreSQL.
        """
        existing = db.execute(select(KnowledgeDocument)).scalars().first()
        if existing:
            logger.info("Knowledge base already initialized. Skipping seed.")
            return

        logger.info("Seeding baseline IQSEC MSSP knowledge catalog...")

        seed_data = [
            {
                "title": "IQSEC SOC 24/7/365 & Managed Detection and Response (MDR)",
                "pillar": IQSECPillar.SOC_SIEM,
                "confidentiality": ConfidentialityLevel.PUBLIC,
                "customer_scope": "ALL_CUSTOMERS",
                "chunks": [
                    (1, "1.1 Arquitectura del Centro de Operaciones de Seguridad (SOC)",
                     "IQSEC cuenta con un Centro de Operaciones de Seguridad (SOC) de última generación operando bajo esquema 24/7/365 en territorio nacional (CDMX y Monterrey), certificado bajo la norma internacional ISO/IEC 27001:2022 e ISO 22301 de Continuidad de Negocio."),
                    (1, "1.2 Modelo de Analistas y Niveles de Escalamiento",
                     "El servicio de SOC IQSEC incluye células dedicadas de Analistas Nivel 1 (Monitoreo y Triaje en tiempo real), Nivel 2 (Investigación avanzada y Correlación de eventos en SIEM/SOAR) y Nivel 3 (Threat Hunting, Análisis Forense y Respuesta a Incidentes Complejos)."),
                    (2, "1.3 Acuerdos de Nivel de Servicio (SLA) de Detección y Notificación",
                     "IQSEC garantiza tiempos de respuesta y atención estrictos: Notificación de incidentes críticos en menos de 15 minutos, contención inicial en menos de 30 minutos, y disponibilidad de plataforma del 99.95% mensual."),
                    (2, "1.4 Soporte a Plataformas SIEM Líderes",
                     "El SOC de IQSEC integra y gestiona de forma nativa las principales plataformas SIEM y XDR del mercado, incluyendo IBM QRadar, Splunk Enterprise Security, Microsoft Sentinel, Palo Alto Cortex XSOAR y Elastic Security.")
                ]
            },
            {
                "title": "IQSEC Cloud Security & Posture Management (CSPM/CWPP)",
                "pillar": IQSECPillar.CLOUD_SECURITY,
                "confidentiality": ConfidentialityLevel.PUBLIC,
                "customer_scope": "ALL_CUSTOMERS",
                "chunks": [
                    (1, "2.1 Seguridad Multicloud AWS, Azure y GCP",
                     "IQSEC ofrece servicios integrales de Cloud Security Posture Management (CSPM), Cloud Workload Protection (CWPP) y Cloud Infrastructure Entitlement Management (CIEM) para infraestructuras híbridas en AWS, Microsoft Azure y Google Cloud."),
                    (2, "2.2 Cumplimiento Normativo en Nube (CNBV, PCI-DSS)",
                     "Evaluaciones continuas automatizadas contra marcos de referencia regulatorios incluyendo Circular Única de Bancos CNBV, PCI-DSS v4.0, NIST Cybersecurity Framework y CIS Benchmarks.")
                ]
            },
            {
                "title": "IQSEC Gestión de Identidades y Accesos Privilegiados (IAM / PAM)",
                "pillar": IQSECPillar.IAM,
                "confidentiality": ConfidentialityLevel.PUBLIC,
                "customer_scope": "ALL_CUSTOMERS",
                "chunks": [
                    (1, "3.1 Protección de Cuentas Privilegiadas (PAM)",
                     "Implementación y administración delegada de soluciones PAM líderes (CyberArk, BeyondTrust) con bóveda de contraseñas, rotación automática de credenciales, grabación de sesiones y autenticación multifactor (MFA) adaptativa."),
                    (2, "3.2 Gobierno y Ciclo de Vida de Identidades (IGA)",
                     "Automatización de altas, bajas y cambios de usuarios (JML), recertificación periódica de privilegios y control de accesos basado en roles (RBAC) y atributos (ABAC).")
                ]
            },
            {
                "title": "IQSEC Gestión Continua de Vulnerabilidades y Pruebas de Penetración",
                "pillar": IQSECPillar.VULN_MGMT,
                "confidentiality": ConfidentialityLevel.PUBLIC,
                "customer_scope": "ALL_CUSTOMERS",
                "chunks": [
                    (1, "4.1 Escaneo y Priorización Basada en Riesgo (RBVM)",
                     "Escaneo recurrente de infraestructura interna, perimetral y aplicaciones web con tecnología Qualys, Tenable y Rapid7. Priorización de vulnerabilidades basada en exploitabilidad real (EPSS y CVSS v3.1)."),
                    (2, "4.2 Ethical Hacking y Pruebas de Penetración",
                     "Ejecución de pruebas de penetración periódicas de tipo Black Box, Grey Box y White Box ejecutadas por consultores certificados (OSCP, CEH, GXPN) con entrega de reportes ejecutivos y técnicos con planes de remediación.")
                ]
            }
        ]

        for doc_info in seed_data:
            doc_id = f"kdoc_{uuid.uuid4().hex[:12]}"
            db_doc = KnowledgeDocument(
                id=doc_id,
                title=doc_info["title"],
                pillar=doc_info["pillar"],
                confidentiality=doc_info["confidentiality"],
                customer_scope=doc_info["customer_scope"],
                s3_bucket=settings.KNOWLEDGE_BUCKET_NAME,
                s3_key=f"knowledge/seed/{doc_id}.pdf",
                chunk_count=len(doc_info["chunks"])
            )
            db.add(db_doc)

            for page_num, sec_title, text in doc_info["chunks"]:
                chunk_id = f"kchk_{uuid.uuid4().hex[:12]}"
                vec = embedding_service.generate_embedding(
                    f"[{doc_info['pillar'].value}] [{doc_info['title']}] {text}"
                )

                # Index to vector store
                vector_store.index_chunk(
                    chunk_id=chunk_id,
                    doc_id=doc_id,
                    doc_title=doc_info["title"],
                    page_number=page_num,
                    section_title=sec_title,
                    pillar=doc_info["pillar"],
                    customer_scope=doc_info["customer_scope"],
                    confidentiality=doc_info["confidentiality"],
                    text=text,
                    vector=vec
                )

                # Save DB chunk
                db_chunk = KnowledgeChunk(
                    id=chunk_id,
                    document_id=doc_id,
                    page_number=page_num,
                    section_title=sec_title,
                    chunk_text=text,
                    vector_id=chunk_id,
                    token_count=len(text.split()),
                    metadata_json={"seed": True}
                )
                db.add(db_chunk)

        db.commit()
        logger.info("Successfully seeded baseline IQSEC knowledge catalog.")


knowledge_service = KnowledgeService()

