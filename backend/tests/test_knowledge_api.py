"""
Integration Tests for Knowledge Base API Endpoints
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app

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
