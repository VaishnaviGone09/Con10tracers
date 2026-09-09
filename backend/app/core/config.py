"""
Core Configuration Module
Handles environment variables and application settings
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application Settings"""
    
    # Application
    APP_NAME: str = "CON10TRACERS"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    DEMO_MODE: bool = True
    
    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    
    # Gemini API
    GEMINI_API_KEY: Optional[str] = None
    
    # Neo4j
    NEO4J_URI: Optional[str] = None
    NEO4J_USERNAME: Optional[str] = None
    NEO4J_PASSWORD: Optional[str] = None
    
    # PostgreSQL
    POSTGRES_URL: Optional[str] = None
    
    # Social APIs (placeholders for future authorized integrations)
    X_API_KEY: Optional[str] = None
    INSTAGRAM_API_KEY: Optional[str] = None
    TELEGRAM_API_KEY: Optional[str] = None
    LINKEDIN_API_KEY: Optional[str] = None
    FACEBOOK_API_KEY: Optional[str] = None
    
    # Monitoring
    MONITORING_ENABLED: bool = True
    MONITORING_INTERVAL_MINUTES: int = 30
    
    # File Upload
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_FILE_TYPES: list = ["pdf", "txt", "json", "csv"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()


def is_demo_mode() -> bool:
    """Check if running in demo mode"""
    return settings.DEMO_MODE or (
        not settings.GEMINI_API_KEY or
        not settings.NEO4J_URI or
        not settings.POSTGRES_URL
    )


def has_gemini() -> bool:
    """Check if Gemini API is available"""
    return bool(settings.GEMINI_API_KEY)


def has_neo4j() -> bool:
    """Check if Neo4j is available"""
    return bool(settings.NEO4J_URI and settings.NEO4J_USERNAME and settings.NEO4J_PASSWORD)


def has_postgres() -> bool:
    """Check if PostgreSQL is available"""
    return bool(settings.POSTGRES_URL)
