"""
Unit Tests for Amazon Titan Embeddings Service
Validates 1024-dimensional dense vectors and unit normalization.
"""
import pytest
import numpy as np
from backend.app.services.embedding_service import embedding_service


def test_embedding_dimension_and_normalization():
    text = "Centro de Operaciones de Seguridad SOC 24/7 certificado ISO 27001"
    vec = embedding_service.generate_embedding(text)

    assert len(vec) == 1024
    norm = np.linalg.norm(vec)
    assert np.isclose(norm, 1.0, atol=1e-3)


def test_batch_embedding_generation():
    texts = [
        "Monitoreo SIEM y correlación de eventos",
        "Gestión de identidades privilegiadas PAM",
        "Seguridad Cloud en AWS y Azure"
    ]
    vectors = embedding_service.generate_embeddings_batch(texts)

    assert len(vectors) == 3
    for v in vectors:
        assert len(v) == 1024
        assert np.isclose(np.linalg.norm(v), 1.0, atol=1e-3)


def test_empty_text_handling():
    vec = embedding_service.generate_embedding("")
    assert len(vec) == 1024
    assert sum(vec) == 0.0

