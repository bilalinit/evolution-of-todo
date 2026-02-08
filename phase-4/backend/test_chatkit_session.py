#!/usr/bin/env python3
"""
Test script to verify ChatKit session endpoint.
"""
import requests
import jwt
from datetime import datetime
from backend.config import settings

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

def test_chatkit_session():
    """Test the ChatKit session creation endpoint."""
    print("🔄 Testing ChatKit session endpoint...")

    # Create test JWT
    test_token = create_test_jwt(TEST_USER_ID)
    print(f"✅ Created test JWT for user: {TEST_USER_ID}")

    # Test the backend endpoint directly
    backend_url = "http://localhost:8000/api/chatkit/session"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {test_token}"
    }

    print(f"🔄 Calling backend: {backend_url}")
    start_time = datetime.now()

    try:
        response = requests.post(backend_url, headers=headers, timeout=30)
        duration = (datetime.now() - start_time).total_seconds()

        print(f"✅ Backend response received in {duration:.2f} seconds")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")

        if response.status_code == 200:
            print("✅ SUCCESS: ChatKit session created!")
            data = response.json()
            print(f"Session ID: {data.get('session_id')}")
            print(f"User ID: {data.get('user_id')}")
            print(f"Expires at: {data.get('expires_at')}")
        else:
            print("❌ FAILED: ChatKit session creation failed")

    except requests.exceptions.Timeout:
        print("❌ TIMEOUT: Request took longer than 30 seconds")
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Could not connect to backend")
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_chatkit_session()