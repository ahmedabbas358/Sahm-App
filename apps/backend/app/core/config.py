"""
Sahm Backend — Application Configuration
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "Sahm API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://sahm_user:sahm_dev_password@localhost:5432/sahm"
    DATABASE_ECHO: bool = False

    # Auth / JWT
    SECRET_KEY: str = "sahm-dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Storage
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 20

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",  # Next.js Admin
        "http://localhost:8080",  # Flutter Web
    ]

    # Verification (Prompt 18)
    VERIFICATION_BASE_URL: str = "http://localhost:3000/v"
    VERIFICATION_SECRET_SALT: str = "sahm-verify-salt-change-in-production"
    VERIFICATION_RATE_LIMIT_PER_MINUTE: int = 60
    VERIFICATION_BURST_BLOCK_THRESHOLD: int = 100

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()
