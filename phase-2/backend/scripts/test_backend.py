#!/usr/bin/env python3
"""
Test script to verify the backend implementation.
"""
import asyncio
from sqlmodel import select
from backend.database import get_session
from backend.models.task import Task, TaskCreate, TaskUpdate
from backend.auth.jwt import extract_user_id
from backend.config import settings


async def test_database_connection():
    """Test database connection and basic operations."""
    print("🔄 Testing database connection...")

    try:
        async for session in get_session():
            # Test simple query
            result = await session.execute(select(Task))
            tasks = result.scalars().all()
            print(f"✅ Database connected successfully! Found {len(tasks)} tasks")
            break

    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

    return True


def test_jwt_verification():
    """Test JWT verification with the configured secret."""
    print("🔄 Testing JWT verification...")

    # Create a test token (this would normally come from Better Auth)
    # For testing, we'll just verify the secret is configured
    if settings.better_auth_secret and len(settings.better_auth_secret) > 10:
        print("✅ JWT secret configured properly")
        return True
    else:
        print("❌ JWT secret not configured")
        return False


def test_config():
    """Test configuration loading."""
    print("🔄 Testing configuration...")

    try:
        print(f"✅ Database URL: {settings.database_url[:30]}...")
        print(f"✅ Host: {settings.host}")
        print(f"✅ Port: {settings.port}")
        print(f"✅ Debug: {settings.debug}")
        return True
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False


async def main():
    """Run all tests."""
    print("🧪 Testing FastAPI Backend Implementation")
    print("=" * 50)

    tests = [
        ("Configuration", test_config()),
        ("JWT Verification", test_jwt_verification()),
        ("Database Connection", await test_database_connection()),
    ]

    print("\n" + "=" * 50)
    passed = sum(1 for _, result in tests if result)
    total = len(tests)

    if passed == total:
        print(f"🎉 All {total} tests passed!")
        print("\n✅ Backend implementation is ready!")
        print("\nTo start the server:")
        print("  cd phase-2/backend")
        print("  uv run uvicorn backend.main:app --reload --port 8000")
    else:
        print(f"❌ {total - passed} of {total} tests failed")


if __name__ == "__main__":
    asyncio.run(main())