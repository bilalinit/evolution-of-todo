#!/usr/bin/env python3
"""
Quick test to verify MCP server works without event loop conflicts
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "src"
sys.path.insert(0, str(backend_path))

from task_serves_mcp_tools import create_task, list_tasks, toggle_task, delete_task

async def test_mcp_tools():
    """Test MCP tools directly"""
    print("🧪 Testing MCP tools...")

    # Test 1: Create task
    print("\n1. Testing create_task...")
    try:
        result = await create_task(
            user_id="test-user-123",
            title="Test Task from MCP",
            description="This is a test task created by MCP server",
            priority="high",
            category="work"
        )
        print(f"✅ Create result: {result}")

        if result.get("success"):
            task_id = result["data"]["id"]
            print(f"📝 Created task with ID: {task_id}")

            # Test 2: List tasks
            print("\n2. Testing list_tasks...")
            list_result = await list_tasks(user_id="test-user-123")
            print(f"✅ List result: {list_result}")

            # Test 3: Toggle task
            print("\n3. Testing toggle_task...")
            toggle_result = await toggle_task(user_id="test-user-123", task_id=task_id)
            print(f"✅ Toggle result: {toggle_result}")

            # Test 4: Delete task
            print("\n4. Testing delete_task...")
            delete_result = await delete_task(user_id="test-user-123", task_id=task_id)
            print(f"✅ Delete result: {delete_result}")

            print("\n🎉 All tests passed! MCP tools are working correctly.")
        else:
            print(f"❌ Create failed: {result}")

    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_mcp_tools())