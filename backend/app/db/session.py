"""
Database Session and Engine setup
"""
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from backend.app.core.config import settings

# Synchronous Engine for standard operations & migrations
db_url = settings.get_database_url()
engine_args = {
    "pool_pre_ping": True,
    "echo": settings.DEBUG
}
if db_url.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}
else:
    engine_args["pool_size"] = 10
    engine_args["max_overflow"] = 20

engine = create_engine(db_url, **engine_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency for FastAPI endpoints to get DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

