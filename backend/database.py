"""
Database configuration and connection module
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
import mysql.connector
from mysql.connector import Error


class Settings(BaseSettings):
    """Application settings"""
    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "warung_hpp"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    
    # Application
    APP_NAME: str = "Warung HPP API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

# SQLAlchemy setup
DATABASE_URL = f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    echo=settings.DEBUG
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Session:
    """
    Dependency for getting database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_connection():
    """
    Get raw MySQL connection for direct queries
    """
    try:
        connection = mysql.connector.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None


def test_connection() -> bool:
    """
    Test database connection
    """
    try:
        connection = get_connection()
        if connection and connection.is_connected():
            connection.close()
            return True
        return False
    except Error as e:
        print(f"Database connection test failed: {e}")
        return False


def init_database():
    """
    Initialize database tables
    """
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully")


# CORS settings
def get_cors_origins():
    """Parse CORS origins from settings"""
    return [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
