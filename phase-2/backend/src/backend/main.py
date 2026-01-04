"""
FastAPI application entry point.
Configures CORS, includes routers, and sets up startup/shutdown events.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.database import init_db, close_db
from backend.routes import tasks, profile
from backend.exceptions import validation_exception_handler, http_exception_handler
from pydantic import ValidationError
from fastapi import HTTPException


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    await init_db()
    print("✅ Database initialized")

    yield

    # Shutdown
    await close_db()
    print("✅ Database connections closed")


# Create FastAPI application
app = FastAPI(
    title="Todo Backend API",
    description="FastAPI backend for Todo application with Better Auth integration",
    version="0.1.0",
    lifespan=lifespan
)

# Configure CORS
from backend.config import settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring.
    """
    return {
        "status": "healthy",
        "service": "todo-backend",
        "version": "0.1.0"
    }


@app.get("/")
async def root():
    """
    Root endpoint with API information.
    """
    return {
        "message": "Todo Backend API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health"
    }


# Include routers
app.include_router(tasks.router, prefix="/api/{user_id}", tags=["tasks"])
app.include_router(profile.router, prefix="/api/{user_id}", tags=["profile"])

# Add exception handlers
app.add_exception_handler(ValidationError, validation_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)


if __name__ == "__main__":
    import uvicorn
    from backend.config import settings

    uvicorn.run(
        "backend.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )