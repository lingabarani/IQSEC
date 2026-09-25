"""
Integration Tests for Knowledge Base API Endpoints
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.db.base import Base
import backend.app.db.models  # Ensure all models are registered on Base
from backend.app.db.session import get_db
from backend.main import app

# Setup test in-memory SQLite engine with StaticPool so memory DB is preserved across connections
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_seed_knowledge_endpoint():
    response = client.post("/api/v1/knowledge/seed")
    assert response.status_code == 200
    data = response.json()
    assert "seeded successfully" in data["message"]


def test_search_knowledge_endpoint():
    payload = {
        "query_text": "Monitoreo de seguridad 24/7 y analistas de incidentes",
        "customer_id": "DEFAULT_CUSTOMER",
        "confidentiality_level": "PUBLIC",
        "top_k": 10,
        "final_top_k": 3
    }
    response = client.post("/api/v1/knowledge/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "top_evidences" in data
    assert len(data["top_evidences"]) > 0


def test_list_knowledge_documents_endpoint():
    response = client.get("/api/v1/knowledge/documents")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

