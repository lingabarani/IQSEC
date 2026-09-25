"""
Configuration and Application Settings
Loads environment variables and sets defaults for dev and prod environments.
"""
from typing import Optional, Union, Any
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "IQSEC GenAI Proposal Automation Platform"
    ENVIRONMENT: str = "dev"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, v: Any) -> bool:
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            return v.lower() in ("true", "1", "yes", "debug", "dev")
        return bool(v)

    # AWS General
    AWS_REGION: str = "us-east-1"
    AWS_ACCOUNT_ID: str = "251388487610"

    # AWS Cognito
    COGNITO_USER_POOL_ID: str = "us-east-1_l67mWaQvB"
    COGNITO_CLIENT_ID: str = "4kcgnnb62ffsu3itgjksp4t685"

    # AWS S3 Buckets
    RFP_BUCKET_NAME: str = "iqsec-dev-proposal-automa-devstorageiqsecrfpbucket-jntyvvwazhwq"
    KNOWLEDGE_BUCKET_NAME: str = "iqsec-dev-proposal-automa-devstorageiqsecknowledge-9tyiddaz5xv3"
    DELIVERABLES_BUCKET_NAME: str = "iqsec-dev-proposal-automa-devstorageiqsecdeliverab-llujdzbmmc7a"

    # RDS PostgreSQL Database
    DB_HOST: str = "iqsec-dev-proposal-db.cov0kwyucgv0.us-east-1.rds.amazonaws.com"
    DB_PORT: int = 5432
    DB_NAME: str = "iqsec_dev_proposals"
    DB_USER: str = "iqsec_admin"
    DB_PASSWORD: str = "IQSECSecure2026!Dev"
    DATABASE_URL: Optional[str] = None

    # OpenSearch Serverless
    OPENSEARCH_COLLECTION_ID: str = "vn5jvxt3v3rj3hsmt4bj"
    OPENSEARCH_ENDPOINT: str = "https://vn5jvxt3v3rj3hsmt4bj.us-east-1.aoss.amazonaws.com"
    OPENSEARCH_INDEX_NAME: str = "iqsec-knowledge-index"

    # Local LLM & Embeddings (Free-Tier Optimized)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    LLM_MODEL_NAME: str = "qwen2.5:1.5b-instruct"
    EMBEDDING_MODEL_ID: str = "amazon.titan-embed-text-v2:0"
    EMBEDDING_DIMENSION: int = 1024

    # Parser & OCR
    OCR_FALLBACK_MIN_CHARS: int = 20
    OCR_DEFAULT_DPI: int = 300
    OCR_LANGUAGE: str = "spa+eng"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


settings = Settings()
