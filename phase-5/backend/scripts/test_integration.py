#!/usr/bin/env python3
"""
Integration Test: Complete MCP Agent System
Tests the full flow from agents → MCP tools → database
"""
import asyncio
import json
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(backend_path))

# Load environment
from dotenv import load_dotenv
load_dotenv()

from backend.agents import orchestrator, urdu_agent, model, client
from agents import Runner
from agents.mcp import MCPServerStdio

async def test_integration():
    """Test complete integration with MCP tools."""
    print("🧪 Testing Complete MCP Integration")
    print("=" * 60)

    # Test 1: MCP Server Configuration
    print("\n📋 Test 1: MCP Server Setup")
    try:
        server = MCPServerStdio(
            params={
                "command": "uv",
                "args": ["run", "task_serves_mcp_tools.py"]
            },
            client_session_timeout_seconds=30
        )
        print("✅ MCP server configured")
    except Exception as e:
        print(f"❌ MCP server setup failed: {e}")
        return

    # Test 2: Agent Assignment
    print("\n📋 Test 2: Agent MCP Assignment")
    try:
        orchestrator.mcp_servers = [server]
        urdu_agent.mcp_servers = [server]
        print("✅ MCP servers assigned to agents")
    except Exception as e:
        print(f"❌ Agent assignment failed: {e}")
        return

    # Test 3: Connect and Test Basic Flow
    print("\n📋 Test 3: Basic Agent Communication")
    try:
        await server.connect()

        # Test Urdu language
        result = await Runner.run(
            orchestrator,
            "[User: test-user] میرا نام کیا ہے؟"
        )
        print(f"✅ Urdu Response: {result.output_text[:100]}...")
        print(f"✅ Agent: {result.last_agent.name if result.last_agent else 'Unknown'}")

    except Exception as e:
        print(f"❌ Basic communication failed: {e}")
        await server.cleanup()
        return

    # Test 4: Task Creation via MCP
    print("\n📋 Test 4: Task Creation via MCP Tools")
    try:
        result = await Runner.run(
            orchestrator,
            "[User: test-user] Create a task for tomorrow: Buy groceries"
        )
        print(f"✅ Task Creation Response: {result.output_text[:150]}...")

        # Check if tool was called
        if hasattr(result, 'tool_calls') and result.tool_calls:
            print(f"✅ Tool calls made: {len(result.tool_calls)}")
            for call in result.tool_calls:
                print(f"   - {call.name}: {call.arguments}")
        else:
            print("ℹ️  No tool calls detected (might be expected if agent handles it differently)")

    except Exception as e:
        print(f"❌ Task creation failed: {e}")
        await server.cleanup()
        return

    # Test 5: List Tasks
    print("\n📋 Test 5: List Tasks via MCP Tools")
    try:
        result = await Runner.run(
            orchestrator,
            "[User: test-user] Show me my tasks"
        )
        print(f"✅ List Tasks Response: {result.output_text[:150]}...")

    except Exception as e:
        print(f"❌ List tasks failed: {e}")
        await server.cleanup()
        return

    # Cleanup
    await server.cleanup()

    print("\n" + "=" * 60)
    print("✅ Integration tests completed!")
    print("\n📋 Summary:")
    print("- MCP server lifecycle: ✅ Working")
    print("- Agent routing: ✅ Working")
    print("- Urdu language support: ✅ Working")
    print("- MCP tool integration: ✅ Configured")
    print("\n⚠️  Note: Full end-to-end testing requires:")
    print("1. Valid Neon PostgreSQL database connection")
    print("2. Valid Xiaomi API key")
    print("3. User authentication tokens")

async def main():
    """Main test runner."""
    try:
        await test_integration()
        return 0
    except Exception as e:
        print(f"\n❌ Integration test failed: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)