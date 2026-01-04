#!/usr/bin/env python3
"""
Integration test script to verify all backend endpoints.
Tests JWT authentication, CRUD operations, and profile endpoints.
"""
import asyncio
import json
from datetime import datetime
from uuid import UUID
from sqlmodel import select
from backend.database import get_session
from backend.models.task import Task, TaskCreate, TaskUpdate, Priority, Category
from backend.auth.jwt import extract_user_id
from backend.config import settings
from fastapi.testclient import TestClient
from backend.main import app
import jwt


# Test data
TEST_USER_ID = "test-user-123"
TEST_JWT_SECRET = settings.better_auth_secret


def create_test_jwt(user_id: str) -> str:
    """Create a test JWT token for the given user."""
    payload = {
        "sub": user_id,
        "email": "test@example.com",
        "exp": int((datetime.utcnow().timestamp() + 3600)),
        "iat": int(datetime.utcnow().timestamp())
    }
    return jwt.encode(payload, TEST_JWT_SECRET, algorithm="HS256")


async def test_database_operations():
    """Test database CRUD operations."""
    print("🔄 Testing database operations...")

    try:
        async for session in get_session():
            # Clean up any existing test tasks
            result = await session.execute(
                select(Task).where(Task.user_id == TEST_USER_ID)
            )
            existing_tasks = result.scalars().all()
            for task in existing_tasks:
                await session.delete(task)
            await session.commit()

            # Create a task
            task_data = TaskCreate(
                title="Test Task",
                description="Test Description",
                priority=Priority.HIGH,
                category=Category.WORK
            )
            task = Task(**task_data.dict(), user_id=TEST_USER_ID)
            session.add(task)
            await session.commit()
            await session.refresh(task)

            # Read the task
            result = await session.execute(
                select(Task).where(Task.id == task.id)
            )
            retrieved_task = result.scalar_one()
            assert retrieved_task.title == "Test Task"

            # Update the task
            retrieved_task.title = "Updated Task"
            retrieved_task.completed = True
            await session.commit()

            # Verify update
            result = await session.execute(
                select(Task).where(Task.id == task.id)
            )
            updated_task = result.scalar_one()
            assert updated_task.title == "Updated Task"
            assert updated_task.completed == True

            # Delete the task
            await session.delete(updated_task)
            await session.commit()

            print("✅ Database operations test passed")
            break

        return True

    except Exception as e:
        print(f"❌ Database operations test failed: {e}")
        return False


def test_jwt_creation():
    """Test JWT token creation and verification."""
    print("🔄 Testing JWT creation and verification...")

    try:
        # Create token
        token = create_test_jwt(TEST_USER_ID)
        assert token is not None
        assert len(token) > 0

        # Verify we can decode it
        payload = jwt.decode(token, TEST_JWT_SECRET, algorithms=["HS256"])
        assert payload["sub"] == TEST_USER_ID

        print("✅ JWT creation test passed")
        return True

    except Exception as e:
        print(f"❌ JWT creation test failed: {e}")
        return False


async def test_api_endpoints():
    """Test API endpoints using FastAPI TestClient."""
    print("🔄 Testing API endpoints...")

    try:
        client = TestClient(app)
        token = create_test_jwt(TEST_USER_ID)
        headers = {"Authorization": f"Bearer {token}"}

        # Test health endpoint
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

        # Test GET tasks (empty initially)
        response = client.get(f"/api/{TEST_USER_ID}/tasks", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "tasks" in data
        assert "total" in data

        # Test POST create task
        task_data = {
            "title": "API Test Task",
            "description": "Created via API",
            "priority": "medium",
            "category": "work"
        }
        response = client.post(
            f"/api/{TEST_USER_ID}/tasks",
            headers=headers,
            json=task_data
        )
        assert response.status_code == 201
        created_task = response.json()["task"]
        task_id = created_task["id"]

        # Test GET specific task
        response = client.get(f"/api/{TEST_USER_ID}/tasks/{task_id}", headers=headers)
        assert response.status_code == 200
        assert response.json()["task"]["id"] == task_id

        # Test GET tasks with filters
        response = client.get(
            f"/api/{TEST_USER_ID}/tasks?status=pending&priority=medium",
            headers=headers
        )
        assert response.status_code == 200

        # Test PUT update task
        update_data = {"title": "Updated via API", "completed": True}
        response = client.put(
            f"/api/{TEST_USER_ID}/tasks/{task_id}",
            headers=headers,
            json=update_data
        )
        assert response.status_code == 200
        assert response.json()["task"]["title"] == "Updated via API"
        assert response.json()["task"]["completed"] == True

        # Test PATCH toggle complete
        response = client.patch(
            f"/api/{TEST_USER_ID}/tasks/{task_id}/complete",
            headers=headers
        )
        assert response.status_code == 200
        assert response.json()["task"]["completed"] == False  # Should toggle back

        # Test GET profile
        response = client.get(f"/api/{TEST_USER_ID}/profile", headers=headers)
        assert response.status_code == 200
        profile_data = response.json()
        assert "user" in profile_data
        assert "stats" in profile_data
        assert profile_data["stats"]["total_tasks"] >= 1

        # Test DELETE task
        response = client.delete(f"/api/{TEST_USER_ID}/tasks/{task_id}", headers=headers)
        assert response.status_code == 204

        # Verify deletion
        response = client.get(f"/api/{TEST_USER_ID}/tasks/{task_id}", headers=headers)
        assert response.status_code == 404

        print("✅ API endpoints test passed")
        return True

    except Exception as e:
        print(f"❌ API endpoints test failed: {e}")
        return False


async def test_auth_failures():
    """Test authentication failure scenarios."""
    print("🔄 Testing authentication failures...")

    try:
        client = TestClient(app)

        # Test without token
        response = client.get(f"/api/{TEST_USER_ID}/tasks")
        assert response.status_code == 403  # Should require auth

        # Test with invalid token
        invalid_headers = {"Authorization": "Bearer invalid.token.here"}
        response = client.get(f"/api/{TEST_USER_ID}/tasks", headers=invalid_headers)
        assert response.status_code == 401

        # Test with wrong user_id (cross-user access)
        token = create_test_jwt("user-123")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/user-456/tasks", headers=headers)
        assert response.status_code == 403

        print("✅ Authentication failure tests passed")
        return True

    except Exception as e:
        print(f"❌ Authentication failure tests failed: {e}")
        return False


async def test_edge_cases():
    """Test edge cases and validation."""
    print("🔄 Testing edge cases...")

    try:
        client = TestClient(app)
        token = create_test_jwt(TEST_USER_ID)
        headers = {"Authorization": f"Bearer {token}"}

        # Test invalid task data
        invalid_data = {
            "title": "",  # Empty title should fail
            "priority": "invalid"  # Invalid priority should fail
        }
        response = client.post(
            f"/api/{TEST_USER_ID}/tasks",
            headers=headers,
            json=invalid_data
        )
        assert response.status_code == 422  # Validation error

        # Test non-existent task
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/{TEST_USER_ID}/tasks/{fake_uuid}", headers=headers)
        assert response.status_code == 404

        print("✅ Edge cases test passed")
        return True

    except Exception as e:
        print(f"❌ Edge cases test failed: {e}")
        return False


async def main():
    """Run all integration tests."""
    print("🧪 FastAPI Backend Integration Tests")
    print("=" * 60)

    tests = [
        ("Database Operations", await test_database_operations()),
        ("JWT Creation", test_jwt_creation()),
        ("API Endpoints", await test_api_endpoints()),
        ("Authentication Failures", await test_auth_failures()),
        ("Edge Cases", await test_edge_cases()),
    ]

    print("\n" + "=" * 60)
    passed = sum(1 for _, result in tests if result)
    total = len(tests)

    if passed == total:
        print(f"🎉 All {total} integration tests passed!")
        print("\n✅ Backend is fully functional and ready for production!")
        print("\n📋 Final Verification Checklist:")
        print("   ✅ GET /api/{user_id}/tasks - List tasks with filters")
        print("   ✅ GET /api/{user_id}/tasks/{task_id} - Get single task")
        print("   ✅ POST /api/{user_id}/tasks - Create task")
        print("   ✅ PUT /api/{user_id}/tasks/{task_id} - Update task")
        print("   ✅ PATCH /api/{user_id}/tasks/{task_id}/complete - Toggle completion")
        print("   ✅ DELETE /api/{user_id}/tasks/{task_id} - Delete task")
        print("   ✅ GET /api/{user_id}/profile - Get user profile and stats")
        print("   ✅ JWT authentication working")
        print("   ✅ User ownership enforcement working")
        print("   ✅ Input validation working")
        print("   ✅ Error handling working")

        print("\n🚀 To start the server:")
        print("   cd phase-2/backend")
        print("   uv run uvicorn backend.main:app --reload --port 8000")

        print("\n🔧 To test with frontend:")
        print("   1. Set NEXT_PUBLIC_DEMO_MODE=false in frontend .env.local")
        print("   2. Ensure NEXT_PUBLIC_API_URL=http://localhost:8000")
        print("   3. Login via Better Auth")
        print("   4. Test full CRUD flow")

    else:
        print(f"❌ {total - passed} of {total} tests failed")
        print("\n🔧 Troubleshooting:")
        print("   - Check DATABASE_URL in .env")
        print("   - Verify BETTER_AUTH_SECRET matches frontend")
        print("   - Ensure database tables exist")
        print("   - Check Neon PostgreSQL connection")


if __name__ == "__main__":
    asyncio.run(main())