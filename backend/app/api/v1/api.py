"""
API V1 Router Aggregator
"""
from fastapi import APIRouter
from backend.app.api.v1.endpoints import health, rfp, knowledge, proposal, export, benchmark

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(rfp.router, prefix="/rfp", tags=["RFP & Addendums"])
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["Knowledge Base & Scoped RAG"])
api_router.include_router(proposal.router, prefix="/proposal", tags=["Proposal Generation & 2-Stage Governance"])
api_router.include_router(benchmark.router, prefix="/benchmark", tags=["Model Abstraction Benchmark"])
api_router.include_router(export.router, prefix="/export", tags=["Multi-Format Deliverable Exporter"])
