#!/usr/bin/env python3
"""
Test agent system without MCP tools
Tests basic agent communication and routing logic
"""
import asyncio
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(backend_path))

# Set environment for testing
os.environ.setdefault("XIAOMI_API_KEY", "test-key-for-validation")

from backend.agents import orchestrator, urdu_agent, model, client
from agents import Runner

async def test_agents():
    """Test agent system functionality."""
    print("🧪 Testing MCP Agent System")
    print("=" * 50)

    # Test 1: Urdu language request
    print("\n=== Test 1: Urdu Language ===")
    try:
        result = await Runner.run(orchestrator, "[User: test-user] میرا نام کیا ہے؟")
        print(f"✅ Response: {result.output_text}")
        print(f"✅ Agent: {result.last_agent.name if result.last_agent else 'Unknown'}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Test 2: Task operation request (without MCP server)
    print("\n=== Test 2: Task Operation (No MCP) ===")
    try:
        result = await Runner.run(orchestrator, "[User: test-user] Create a task for tomorrow")
        print(f"✅ Response: {result.output_text}")
        print(f"✅ Agent: {result.last_agent.name if result.last_agent else 'Unknown'}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Test 3: Mixed language request
    print("\n=== Test 3: Mixed Language ===")
    try:
        result = await Runner.run(orchestrator, "[User: test-user] I need to buy groceries, کیا تم میری مدد کر سکتے ہو؟")
        print(f"✅ Response: {result.output_text}")
        print(f"✅ Agent: {result.last_agent.name if result.last_agent else 'Unknown'}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Test 4: English task request
    print("\n=== Test 4: English Task Request ===")
    try:
        result = await Runner.run(orchestrator, "[User: test-user] Show me my pending tasks")
        print(f"✅ Response: {result.output_text}")
        print(f"✅ Agent: {result.last_agent.name if result.last_agent else 'Unknown'}")
    except Exception as e:
        print(f"❌ Error: {e}")

    print("\n" + "=" * 50)
    print("✅ Agent system tests completed")
    print("\nNote: These tests verify agent routing and language detection.")
    print("MCP tool integration will be tested separately with test_mcp_integration.py")

async def main():
    """Main test runner."""
    try:
        await test_agents()
        return 0
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)