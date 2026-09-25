"""
FastAPI Main Application Entrypoint
IQSEC GenAI Technical & Economic Proposal Automation Platform Backend
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.db.base import Base
from backend.app.db.session import engine
from backend.app.api.v1.api import api_router

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("iqsec.backend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB Tables if connected
    logger.info("Initializing IQSEC Platform Backend...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("PostgreSQL Database tables verified/initialized successfully.")
    except Exception as e:
        logger.warning(f"Database table auto-initialization notice: {e}")
    yield
    # Shutdown
    logger.info("Shutting down IQSEC Platform Backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "platform": "IQSEC GenAI Proposal Automation Platform",
        "version": "1.0.0",
        "docs": "/docs",
        "api": f"{settings.API_V1_STR}/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

