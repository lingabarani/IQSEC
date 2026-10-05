"""
Database seed script for realistic CFE Proposal and Requirements.
Populates SQLite with real tender docket and requirements from Test_Dataset.
"""
import uuid
from datetime import datetime
from backend.app.db.session import SessionLocal
from backend.app.db.models.rfp import RFPDocument, DocumentType, ProcessingStatus
from backend.app.db.models.requirement import RFPRequirement, ComplianceStatus, IQSECPillar, RequirementType
from backend.app.db.models.proposal import Proposal, SabanaApprovalStatus, ProposalLifecycleStatus
from backend.app.core.config import settings

def seed_cfe_data():
    db = SessionLocal()
    try:
        # Check if proposal already exists
        existing = db.query(Proposal).filter(Proposal.title.like("%Tender ABC 2026%")).first()
        if existing:
            print("CFE Proposal already seeded with ID:", existing.id)
            return existing.id

        # 1. Create RFP Document
        rfp_id = "rfp_cfe_2026_001"
        rfp = db.get(RFPDocument, rfp_id)
        if not rfp:
            rfp = RFPDocument(
                id=rfp_id,
                customer_id="CFE Nacional MX",
                tender_number="ABC-2026-001",
                title="Tender ABC 2026 - Servicio Integral de Ciberseguridad y SOC",
                filename="Tender.pdf",
                doc_type=DocumentType.ORIGINAL_RFP,
                s3_bucket=settings.RFP_BUCKET_NAME,
                s3_key="rfps/CFE/rfp_cfe_2026_001/Tender.pdf",
                page_count=38,
                status=ProcessingStatus.COMPLETED
            )
            db.add(rfp)
            db.commit()

        # 2. Add realistic tender requirements matching the UI screenshots
        req_specs = [
            {
                "id": "req_cfe_001",
                "code": "R001",
                "section": "Sección 3.1 - Ingestión SIEM",
                "title": "SIEM Ingestion Rate & Multi-Cloud Connectors",
                "original": "System shall support minimum 12,000 EPS continuous ingestion rate across multicloud telemetry (AWS CloudTrail, Azure Activity, GCP).",
                "effective": "System shall support minimum 12,000 EPS continuous ingestion rate across multicloud telemetry with active encryption.",
                "status": ComplianceStatus.COMPLIES,
                "confidence": 0.98,
                "pillar": IQSECPillar.SOC_SIEM,
                "response": "IQSEC SOC architecture delivers high-throughput Elastic Security & Splunk ingest exceeding 25,000 EPS with TLS 1.3 encryption and KMS keys.",
                "citations": [{"doc": "01_Whitepaper_IQSEC_SOC_NextGen.pdf", "page": 4, "quote": "Ingesta distribuida con buffers Kafka y soporte para más de 30,000 EPS por nodo.", "score": 0.97}],
                "approved": True,
                "reviewer": "Alejandro Ruiz"
            },
            {
                "id": "req_cfe_002",
                "code": "R002",
                "section": "Clause REF: RFP-SEC-2026-4.1.2",
                "title": "15-min OT Containment across SCADA/OT Networks",
                "original": "System shall support 15-minute automated incident triage and endpoint containment across SCADA/OT networks.",
                "effective": "System shall support 15-minute automated incident triage and endpoint containment across SCADA/OT networks.",
                "status": ComplianceStatus.COMPLIES_WITH_EXCEPTION,
                "confidence": 0.84,
                "pillar": IQSECPillar.INCIDENT_RESPONSE,
                "response": "The proposed solution supports automated IT containment and standard EDR playbooks within 15 minutes, but requires manual gateway approval for legacy SCADA/OT serial bus segmentation to prevent network disruption.",
                "citations": [
                    {"doc": "Tender.pdf", "page": 18, "quote": "...el adjudicado deberá garantizar respuesta inmediata no mayor a 15 minutos en subestaciones y enlaces troncales...", "score": 0.968}
                ],
                "approved": False,
                "reviewer": None,
                "comment": "SLA verified with client; manual OT confirmation required prior to isolation to prevent emergency generator trip."
            },
            {
                "id": "req_cfe_003",
                "code": "R003",
                "section": "Sección 3.3 - Redes Aisladas",
                "title": "Air-Gapped Telemetry Physical Data Diodes",
                "original": "Hardware data diode deployment for unidirectional telemetry export on air-gapped critical substation buses.",
                "effective": "Hardware data diode deployment for unidirectional telemetry export on air-gapped critical substation buses.",
                "status": ComplianceStatus.DOES_NOT_COMPLY,
                "confidence": 0.72,
                "pillar": IQSECPillar.SOC_SIEM,
                "response": "IQSEC proposes certified software proxy isolation; physical hardware data diode appliances require specialized subcontractor procurement.",
                "citations": [{"doc": "02_Catalogo_Servicios_MSSP_2026.pdf", "page": 19, "quote": "Módulos de aislamiento perimetral mediante proxies de alta seguridad.", "score": 0.74}],
                "approved": False,
                "reviewer": "Carlos Mendez"
            },
            {
                "id": "req_cfe_004",
                "code": "R004",
                "section": "Sección 4.0 - Criptografía",
                "title": "FIPS 140-3 Cryptographic Module Encryption",
                "original": "All cryptographic keys and data in transit must utilize FIPS 140-3 validated cryptographic modules.",
                "effective": "All cryptographic keys and data in transit must utilize FIPS 140-3 validated cryptographic modules.",
                "status": ComplianceStatus.COMPLIES,
                "confidence": 0.99,
                "pillar": IQSECPillar.GRC,
                "response": "All IQSEC communications and telemetry endpoints enforce TLS 1.3 ciphers with HSM FIPS 140-3 Level 3 validation.",
                "citations": [{"doc": "03_Certificaciones_IQSEC_Oficial.pdf", "page": 2, "quote": "Módulos de cifrado certificados bajo estándares NIST FIPS 140-3 Nivel 3.", "score": 0.99}],
                "approved": True,
                "reviewer": "Alejandro Ruiz"
            },
            {
                "id": "req_cfe_005",
                "code": "R005",
                "section": "Sección 4.2 - Gestión de Accesos",
                "title": "Role-Based RBAC Sync with Active Directory / Azure AD",
                "original": "Automated role-based access synchronization with on-premise Active Directory and Microsoft Entra ID with SCIM v2.",
                "effective": "Automated role-based access synchronization with on-premise Active Directory and Microsoft Entra ID with SCIM v2.",
                "status": ComplianceStatus.COMPLIES,
                "confidence": 0.95,
                "pillar": IQSECPillar.IAM,
                "response": "Native SCIM 2.0 and SAML 2.0 connectors allow sub-second synchronization of group policies and JML lifecycle provisioning.",
                "citations": [{"doc": "02_Catalogo_Servicios_MSSP_2026.pdf", "page": 28, "quote": "Conectores bidireccionales SCIM 2.0 para directorios corporativos federados.", "score": 0.95}],
                "approved": False,
                "reviewer": None
            },
            {
                "id": "req_cfe_006",
                "code": "R006",
                "section": "Sección 5.1 - CTI Threat Intelligence",
                "title": "Alimentación de Inteligencia de Amenazas (CTI Sectorial)",
                "original": "Integración de feeds de Threat Intelligence comercial y sectorial nacional.",
                "effective": "Integración de feeds de Threat Intelligence comercial y sectorial nacional.",
                "status": ComplianceStatus.COMPLIES,
                "confidence": 0.96,
                "pillar": IQSECPillar.SOC_SIEM,
                "response": "La plataforma de IQSEC integra feeds CTI propietarios, feeds comerciales de primer nivel (Recorded Future, Mandiant) e indicadores del CERT-MX y FIRST.",
                "citations": [{"doc": "01_Whitepaper_IQSEC_SOC_NextGen.pdf", "page": 9, "quote": "Módulo CTI con ingestión automática de STIX/TAXII y correlación contextual con MITRE ATT&CK v14.", "score": 0.94}],
                "approved": True,
                "reviewer": "Alejandro Ruiz"
            },
            {
                "id": "req_cfe_007",
                "code": "R007",
                "section": "Sección 6.0 - Certificaciones",
                "title": "Certificación ISO 27001 y CMMI Nivel 3 o Superior",
                "original": "Certificación ISO 27001 y CMMI Nivel 5 obligatoria",
                "effective": "Se acepta ISO 27001 y CMMI Nivel 3 o superior para servicios de TI (Aclaración 22)",
                "status": ComplianceStatus.COMPLIES,
                "confidence": 0.99,
                "pillar": IQSECPillar.GRC,
                "response": "IQSEC cuenta con certificación ISO/IEC 27001:2022 vigente expedida por BSI con número de registro IS-784920, además de certificación CMMI-SVC v2.0 Nivel 3 vigente.",
                "citations": [{"doc": "03_Certificaciones_IQSEC_Oficial.pdf", "page": 2, "quote": "Certificado BSI ISO/IEC 27001:2022 alcance completo MSSP y Operaciones de Ciberseguridad.", "score": 0.99}],
                "approved": True,
                "reviewer": "Director_Cumplimiento"
            },
            {
                "id": "req_cfe_008",
                "code": "R008",
                "section": "Sección 6.3 - Retención de Logs",
                "title": "Almacenamiento y Retención de Logs en Caliente",
                "original": "Almacenamiento de logs en almacenamiento rápido durante 180 días continuos.",
                "effective": "Almacenamiento de logs en almacenamiento rápido durante 180 días continuos.",
                "status": ComplianceStatus.COMPLIES_WITH_EXCEPTION,
                "confidence": 0.88,
                "pillar": IQSECPillar.SOC_SIEM,
                "response": "IQSEC ofrece 90 días en almacenamiento ultra-rápido (SSD NVMe) y 275 días adicionales en almacenamiento warm de alta disponibilidad (S3 IA), cumpliendo con un ciclo total de 365 días a menor costo operativo.",
                "citations": [{"doc": "02_Catalogo_Servicios_MSSP_2026.pdf", "page": 22, "quote": "Arquitectura de almacenamiento tiering: 90 días hot, 275 días warm, 5 años cold para auditorías forenses.", "score": 0.89}],
                "approved": False,
                "reviewer": None
            },
            {
                "id": "req_cfe_009",
                "code": "R009",
                "section": "Sección 7.1 - Threat Hunting",
                "title": "Caza de Amenazas Proactiva (Threat Hunting Quincenal)",
                "original": "Campañas de Threat Hunting con periodicidad quincenal ejecutadas por analistas Senior.",
                "effective": "Campañas de Threat Hunting con periodicidad quincenal ejecutadas por analistas Senior.",
                "status": ComplianceStatus.COMPLIES,
                "confidence": 0.95,
                "pillar": IQSECPillar.SOC_SIEM,
                "response": "El equipo especializado de Threat Hunting de IQSEC realiza barridos proactivos quincenales basados en hipótesis de amenazas actuales, frameworks MITRE y tácticas de atacantes de estados-nación.",
                "citations": [{"doc": "01_Whitepaper_IQSEC_SOC_NextGen.pdf", "page": 12, "quote": "Metodología de Threat Hunting recurrente con entregable quincenal de hallazgos y mitigaciones.", "score": 0.93}],
                "approved": True,
                "reviewer": "Alejandro Ruiz"
            },
            {
                "id": "req_cfe_010",
                "code": "R010",
                "section": "Sección 8.0 - Grabación PAM",
                "title": "Gestión y Grabación de Accesos Privilegiados (PAM)",
                "original": "Grabación de sesiones RDP y SSH para todos los administradores del SOC.",
                "effective": "Grabación de sesiones RDP y SSH para todos los administradores del SOC.",
                "status": ComplianceStatus.COMPLIES,
                "confidence": 0.96,
                "pillar": IQSECPillar.IAM,
                "response": "Todas las sesiones de administración hacia la infraestructura de los clientes son grabadas en audio y video con marcas de tiempo inmutables y almacenamiento WORM bajo la plataforma PAM corporativa de IQSEC.",
                "citations": [{"doc": "02_Catalogo_Servicios_MSSP_2026.pdf", "page": 29, "quote": "Auditoría completa PAM con grabación indexada de sesiones interactivas RDP, SSH y web administrativa.", "score": 0.95}],
                "approved": True,
                "reviewer": "Alejandro Ruiz"
            }
        ]

        for s in req_specs:
            req = db.get(RFPRequirement, s["id"])
            if not req:
                req = RFPRequirement(
                    id=s["id"],
                    rfp_id=rfp_id,
                    page_number=18 if s["code"] == "R002" else 4,
                    page_end=18 if s["code"] == "R002" else 5,
                    section_code=s["code"],
                    section_title=s["section"],
                    requirement_code=s["code"],
                    original_text=s["original"],
                    effective_text=s["effective"],
                    is_mandatory=True,
                    requirement_type=RequirementType.TECHNICAL,
                    iqsec_pillar=s["pillar"],
                    compliance_status=s["status"],
                    technical_response=s["response"],
                    compliance_rationale=s.get("comment", s["response"]),
                    confidence_score=s["confidence"],
                    exact_citations=s["citations"],
                    human_approved=s["approved"],
                    reviewed_by=s["reviewer"],
                    modification_notes=s.get("comment")
                )
                db.add(req)
        db.commit()

        # 3. Create Proposal Record
        prop_id = "prop_cfe_2026_001"
        prop = db.get(Proposal, prop_id)
        if not prop:
            prop = Proposal(
                id=prop_id,
                rfp_id=rfp_id,
                title="Tender ABC 2026 (ABC-2026-001) - Propuesta Técnica y Económica",
                version=2,
                status="IN_REVIEW",
                total_requirements=150, # Representing full docket
                compliant_count=120,
                exception_count=18,
                non_compliant_count=12,
                overall_compliance_rate=82.0,
                model_provider_used="SELF_HOSTED_QWEN",
                sabana_status=SabanaApprovalStatus.SABANA_APPROVED,
                sabana_approved_by="Alejandro Ruiz",
                sabana_approved_at=datetime.utcnow(),
                lifecycle_status=ProposalLifecycleStatus.PROPOSAL_IN_REVIEW,
                final_signoff_by="Alejandro Ruiz",
                final_signoff_at=datetime.utcnow()
            )
            db.add(prop)
            db.commit()

        print(f"Successfully seeded CFE Proposal: {prop.id} with {len(req_specs)} initial requirements.")
        return prop.id
    finally:
        db.close()

if __name__ == "__main__":
    seed_cfe_data()
