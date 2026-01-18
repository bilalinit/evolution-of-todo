"""Backend package for Todo API."""
from .main import app

__all__ = ["app"]


def main() -> None:
    """Entry point for the backend package."""
    print("Todo Backend API - Run with: uvicorn backend.main:app --reload")
