"""
Database connection module for Neon PostgreSQL.
Uses SQLModel with asyncpg for async operations.
"""
from sqlmodel import SQLModel, create_engine
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from backend.config import settings


# Create async engine for asyncpg
# Remove query parameters and convert to asyncpg URL
db_url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://")
if "?" in db_url:
    db_url = db_url.split("?")[0]

# Use Neon's connection pooler by adding -pooler to hostname
# This handles connection caching on Neon's side, avoiding InvalidCachedStatementError
if "-pooler" not in db_url and ".neon.tech" in db_url:
    # Add -pooler to the hostname: ep-xxx.region.neon.tech -> ep-xxx-pooler.region.neon.tech
    import re
    db_url = re.sub(r'(ep-[^.]+)(\.)', r'\1-pooler\2', db_url)

# Now we can use standard pooling since Neon pooler handles the caching
engine = create_async_engine(
    db_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_recycle=300,  # Recycle connections every 5 minutes
)


# Create async session factory
async_session_factory = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def get_session() -> AsyncSession:
    """
    Dependency for FastAPI routes to get database session.
    Yields AsyncSession and closes it after use.
    """
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """
    Initialize database - create all tables.
    Call this on application startup.
    """
    async with engine.begin() as conn:
        # Create tables if they don't exist (don't drop in debug mode to persist data)
        await conn.run_sync(SQLModel.metadata.create_all)
    print("✅ Database initialized")


async def close_db():
    """
    Close database connections.
    Call this on application shutdown.
    """
    await engine.dispose()