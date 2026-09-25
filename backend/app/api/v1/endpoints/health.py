"""
Health and System Status Endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.core.config import settings
from backend.app.db.session import get_db

router = APIRouter()


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Checks application health and live RDS PostgreSQL connectivity"""
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "s3_rfp_bucket": settings.RFP_BUCKET_NAME,
        "s3_knowledge_bucket": settings.KNOWLEDGE_BUCKET_NAME,
        "s3_deliverables_bucket": settings.DELIVERABLES_BUCKET_NAME,
        "opensearch_collection_id": settings.OPENSEARCH_COLLECTION_ID,
        "version": "1.0.0"
    }

