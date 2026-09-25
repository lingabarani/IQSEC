"""
Proposal Multi-Format Export API Endpoints (.xlsx, .docx, .pptx, .zip)
"""
import os
import zipfile
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.app.db.session import get_db
from backend.app.db.models.proposal import Proposal
from backend.app.db.models.rfp import RFPDocument
from backend.app.db.models.requirement import RFPRequirement
from backend.app.services.export_sabana_xlsx import sabana_exporter
from backend.app.services.export_technical_docx import technical_docx_exporter
from backend.app.services.export_executive_pptx import executive_pptx_exporter

router = APIRouter()
EXPORT_DIR = "/tmp/iqsec_exports"


@router.get("/{proposal_id}/sabana-xlsx")
def download_sabana_xlsx(proposal_id: str, db: Session = Depends(get_db)):
    """Downloads the official color-coded Sábana Matrix in Excel (.xlsx) format"""
    prop = db.get(Proposal, proposal_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found.")

    rfp = db.get(RFPDocument, prop.rfp_id)
    reqs = db.execute(
        select(RFPRequirement).where(RFPRequirement.rfp_id == prop.rfp_id)
    ).scalars().all()

    filename = f"IQSEC_Sabana_Cumplimiento_{rfp.tender_number}_{proposal_id[:8]}.xlsx"
    filepath = os.path.join(EXPORT_DIR, filename)

    sabana_exporter.generate_sabana_workbook(
        rfp_title=rfp.title,
        tender_number=rfp.tender_number,
        requirements=reqs,
        output_filepath=filepath
    )

    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


@router.get("/{proposal_id}/technical-docx")
def download_technical_docx(proposal_id: str, db: Session = Depends(get_db)):
    """Downloads the formal Technical Proposal in Word (.docx) format"""
    prop = db.get(Proposal, proposal_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found.")

    rfp = db.get(RFPDocument, prop.rfp_id)
    reqs = db.execute(
        select(RFPRequirement).where(RFPRequirement.rfp_id == prop.rfp_id)
    ).scalars().all()

    filename = f"IQSEC_Propuesta_Tecnica_{rfp.tender_number}_{proposal_id[:8]}.docx"
    filepath = os.path.join(EXPORT_DIR, filename)

    technical_docx_exporter.generate_technical_proposal(
        rfp_title=rfp.title,
        tender_number=rfp.tender_number,
        customer_name=rfp.customer_id,
        requirements=reqs,
        output_filepath=filepath
    )

    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )


@router.get("/{proposal_id}/executive-pptx")
def download_executive_pptx(proposal_id: str, db: Session = Depends(get_db)):
    """Downloads the Executive Slide Deck in PowerPoint (.pptx) format"""
    prop = db.get(Proposal, proposal_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found.")

    rfp = db.get(RFPDocument, prop.rfp_id)

    filename = f"IQSEC_Presentacion_Ejecutiva_{rfp.tender_number}_{proposal_id[:8]}.pptx"
    filepath = os.path.join(EXPORT_DIR, filename)

    executive_pptx_exporter.generate_executive_deck(
        proposal=prop,
        tender_number=rfp.tender_number,
        customer_name=rfp.customer_id,
        output_filepath=filepath
    )

    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )


@router.get("/{proposal_id}/bundle-zip")
def download_proposal_bundle_zip(proposal_id: str, db: Session = Depends(get_db)):
    """Bundles all 3 deliverables (.xlsx, .docx, .pptx) into a single downloadable zip file"""
    prop = db.get(Proposal, proposal_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found.")

    rfp = db.get(RFPDocument, prop.rfp_id)
    reqs = db.execute(
        select(RFPRequirement).where(RFPRequirement.rfp_id == prop.rfp_id)
    ).scalars().all()

    xlsx_path = os.path.join(EXPORT_DIR, f"IQSEC_Sabana_Cumplimiento_{rfp.tender_number}.xlsx")
    docx_path = os.path.join(EXPORT_DIR, f"IQSEC_Propuesta_Tecnica_{rfp.tender_number}.docx")
    pptx_path = os.path.join(EXPORT_DIR, f"IQSEC_Presentacion_Ejecutiva_{rfp.tender_number}.pptx")

    sabana_exporter.generate_sabana_workbook(rfp.title, rfp.tender_number, reqs, xlsx_path)
    technical_docx_exporter.generate_technical_proposal(rfp.title, rfp.tender_number, rfp.customer_id, reqs, docx_path)
    executive_pptx_exporter.generate_executive_deck(prop, rfp.tender_number, rfp.customer_id, pptx_path)

    zip_filename = f"IQSEC_Paquete_Propuesta_{rfp.tender_number}_{proposal_id[:8]}.zip"
    zip_filepath = os.path.join(EXPORT_DIR, zip_filename)

    with zipfile.ZipFile(zip_filepath, 'w') as z:
        z.write(xlsx_path, arcname=os.path.basename(xlsx_path))
        z.write(docx_path, arcname=os.path.basename(docx_path))
        z.write(pptx_path, arcname=os.path.basename(pptx_path))

    return FileResponse(
        path=zip_filepath,
        filename=zip_filename,
        media_type="application/zip"
    )

