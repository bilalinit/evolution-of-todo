#!/usr/bin/env python3
"""
Add performance indexes to the task table.
"""
import asyncio
from sqlalchemy import create_engine, text
from backend.config import settings


async def add_indexes():
    """Add performance indexes to task table."""
    print("🔄 Adding performance indexes...")

    try:
        # Convert async URL to sync URL
        sync_url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")

        # Create sync engine
        engine = create_engine(sync_url, echo=settings.debug)

        with engine.connect() as conn:
            # Add indexes as specified in data model
            indexes = [
                "CREATE INDEX IF NOT EXISTS idx_task_completed ON task(completed)",
                "CREATE INDEX IF NOT EXISTS idx_task_priority ON task(priority)",
                "CREATE INDEX IF NOT EXISTS idx_task_category ON task(category)",
                "CREATE INDEX IF NOT EXISTS idx_task_due_date ON task(due_date)"
            ]

            for index_sql in indexes:
                print(f"  Creating index: {index_sql}")
                conn.execute(text(index_sql))

            conn.commit()

        print("✅ All indexes created successfully!")
        engine.dispose()

    except Exception as e:
        print(f"❌ Error adding indexes: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(add_indexes())