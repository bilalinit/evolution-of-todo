#!/usr/bin/env python3
"""
Test script to verify OpenAI ChatKit session creation works.
"""

import os
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_openai_client():
    """Test basic OpenAI client functionality."""
    print("Testing OpenAI client...")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ OPENAI_API_KEY not found in environment")
        return False

    print(f"✅ OPENAI_API_KEY found: {api_key[:8]}...")

    try:
        client = openai.OpenAI(api_key=api_key)
        print("✅ OpenAI client created successfully")

        # Test listing models to verify API access
        models = client.models.list()
        print(f"✅ Can list models: {len(list(models))} models available")

        return True
    except Exception as e:
        print(f"❌ OpenAI client test failed: {e}")
        return False

def test_chatkit_session():
    """Test creating a ChatKit session."""
    print("\nTesting ChatKit session creation...")

    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        print("Creating ChatKit session...")
        session = client.beta.chatkit.sessions.create(
            metadata={
                "user_id": "test-user-123",
                "test": True
            }
        )

        print(f"✅ ChatKit session created successfully!")
        print(f"   Session ID: {session.id}")
        print(f"   Has client_secret: {hasattr(session, 'client_secret')}")
        print(f"   Expires at: {session.expires_at}")

        if hasattr(session, 'client_secret'):
            print(f"   Client secret (first 20 chars): {session.client_secret[:20]}...")
            return True
        else:
            print("❌ Session created but no client_secret found")
            return False

    except Exception as e:
        print(f"❌ ChatKit session creation failed: {e}")
        print(f"   Error type: {type(e).__name__}")
        return False

def test_backend_endpoint():
    """Test the backend session endpoint directly."""
    print("\nTesting backend session endpoint...")

    try:
        import requests

        # First, we need a valid JWT token. Let's try to sign in.
        # This assumes you have a test user set up
        base_url = "http://localhost:8000"

        # Try health check first
        health_response = requests.get(f"{base_url}/health")
        if health_response.status_code != 200:
            print(f"❌ Backend health check failed: {health_response.status_code}")
            return False
        print("✅ Backend health check passed")

        # Try to create session without auth (should fail)
        session_response = requests.post(f"{base_url}/api/chatkit/session")
        if session_response.status_code == 401:
            print("✅ Session endpoint correctly requires authentication")
        else:
            print(f"⚠️  Session endpoint returned unexpected status: {session_response.status_code}")

        return True

    except Exception as e:
        print(f"❌ Backend endpoint test failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("ChatKit Integration Test")
    print("=" * 60)

    results = []

    # Run tests
    results.append(test_openai_client())
    results.append(test_chatkit_session())
    results.append(test_backend_endpoint())

    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)

    if all(results):
        print("✅ All tests passed!")
    else:
        print(f"❌ {results.count(False)} test(s) failed")

    print("=" * 60)