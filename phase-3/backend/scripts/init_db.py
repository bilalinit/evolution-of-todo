#!/usr/bin/env python3
"""
Database initialization script.
Creates all tables in the Neon PostgreSQL database.
"""
import asyncio
from sqlmodel import SQLModel, create_engine
from sqlalchemy.ext.asyncio import AsyncEngine
from backend.models.task import Task
from backend.config import settings


async def init_database():
    """Initialize database tables."""
    print("🔄 Initializing database tables...")

    try:
        # Create a simple engine for initialization
        # Use psycopg2 for initialization since it's simpler
        from sqlalchemy import create_engine as sync_create_engine

        # Convert async URL to sync URL for initialization
        sync_url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")

        # Create sync engine
        sync_engine = sync_create_engine(
            sync_url,
            echo=settings.debug
        )

        # Create all tables
        print("✨ Creating tables...")
        SQLModel.metadata.create_all(sync_engine)

        print("✅ Database initialized successfully!")
        print("📋 Tables created: task")

        sync_engine.dispose()

    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(init_database())