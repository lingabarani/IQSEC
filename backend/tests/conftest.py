"""
Pytest Central Configuration & SQLite Test Database Fixtures
"""
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from backend.main import app
from backend.app.db.base import Base
import backend.app.db.models  # Register all models on Base
from backend.app.db.session import get_db

TEST_DB_FILE = "/tmp/test_iqsec_proposals.db"
TEST_DB_URL = f"sqlite:///{TEST_DB_FILE}"

engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Create all tables once for the test session"""
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass


@pytest.fixture(autouse=True)
def override_database_dependency():
    """Ensure every test uses the SQLite database session"""
    def _get_test_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _get_test_db
    yield


@pytest.fixture
def db_session():
    """Provide a direct DB session to test functions"""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def test_client():
    """Provide a FastAPI TestClient instance"""
    return TestClient(app)
