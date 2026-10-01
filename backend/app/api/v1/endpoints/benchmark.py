"""
Model Abstraction Benchmark API Endpoints
Provides head-to-head comparison metrics between AWS Bedrock and Self-Hosted Qwen.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.app.db.session import get_db
from backend.app.db.models.requirement import RFPRequirement
from backend.app.db.models.rfp import RFPDocument
from backend.app.services.model_benchmark import (
    model_benchmark_service,
    ComparativeBenchmarkReport,
)

router = APIRouter()


@router.get("/summary", response_model=ComparativeBenchmarkReport)
async def get_benchmark_summary():
    """
    Returns baseline head-to-head benchmark metrics between AWS Bedrock (Claude 3.5)
    and Self-Hosted vLLM (Qwen 27B/14B) based on DPI test criteria.
    """
    sample_data = [{"req_id": f"req_{i}"} for i in range(20)]
    report = await model_benchmark_service.run_comparative_benchmark(sample_data)
    return report


@router.post("/run/{rfp_id}", response_model=ComparativeBenchmarkReport)
async def run_benchmark_on_rfp(
    rfp_id: str,
    db: Session = Depends(get_db)
):
    """
    Runs live model comparison against all extracted requirements of an active RFP.
    """
    rfp = db.get(RFPDocument, rfp_id)
    if not rfp:
        raise HTTPException(status_code=404, detail="RFP document not found.")

    reqs = db.execute(
        select(RFPRequirement).where(RFPRequirement.rfp_id == rfp_id)
    ).scalars().all()

    if not reqs:
        raise HTTPException(status_code=400, detail="RFP has no extracted requirements.")

    req_data = [{"req_id": r.id, "text": r.effective_text} for r in reqs]
    report = await model_benchmark_service.run_comparative_benchmark(req_data)
    report.tender_name = f"{rfp.tender_number} - {rfp.title}"
    return report
