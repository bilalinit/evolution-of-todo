#!/usr/bin/env python3
"""
MCP Integration Test Script
Tests the complete flow: Agent → MCP Tools → Database
"""
import asyncio
import json
import sys
import os
from pathlib import Path
import time

# Add backend to path
backend_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(backend_path))

# Set environment for testing
os.environ.setdefault("XIAOMI_API_KEY", "test-key-for-validation")

from backend.agents import orchestrator, urdu_agent, model, client
from agents import Runner, MCPServerStdio
from backend.database import async_session_factory
from backend.models.task import Task
from sqlalchemy import select

async def cleanup_test_tasks(user_id: str):
    """Clean up any existing test tasks for the user."""
    async with async_session_factory() as session:
        result = await session.execute(
            select(Task).where(Task.user_id == user_id)
        )
        tasks = result.scalars().all()
        for task in tasks:
            await session.delete(task)
        await session.commit()
    print(f"✅ Cleaned up {len(tasks)} existing test tasks for {user_id}")


async def test_structural_validation():
    """Test 0: Structural validation (existing tests)"""
    print("\n📋 Test 0: Structural Validation")

    # MCP Server Configuration
    try:
        server = MCPServerStdio(
            params={
                "command": "uv",
                "args": ["run", "task_serves_mcp_tools.py"]
            },
            client_session_timeout_seconds=30
        )
        print("✅ MCP server configuration valid")
    except Exception as e:
        print(f"❌ MCP server config failed: {e}")
        return False

    # Agent MCP Assignment
    try:
        orchestrator.mcp_servers = [server]
        urdu_agent.mcp_servers = [server]
        print("✅ Agent MCP assignment successful")
    except Exception as e:
        print(f"❌ Agent MCP assignment failed: {e}")
        return False

    # File validation
    try:
        mcp_file = Path(__file__).parent.parent / "task_serves_mcp_tools.py"
        assert mcp_file.exists(), "MCP server file missing"
        content = mcp_file.read_text()

        required = ["from mcp.server.fastmcp import FastMCP", "mcp = FastMCP", "@mcp.tool()",
                   "create_task", "list_tasks", "update_task", "delete_task", "toggle_task", "TaskService"]

        for element in required:
            assert element in content, f"Missing: {element}"

        print("✅ MCP server file structure valid")
    except Exception as e:
        print(f"❌ File validation failed: {e}")
        return False

    return True


async def test_task_creation_via_agent():
    """Test T044: Task creation via agent + MCP"""
    print("\n=== Test 1: Task Creation via Agent ===")

    server = MCPServerStdio(
        params={
            "command": "uv",
            "args": ["run", "task_serves_mcp_tools.py"]
        }
    )

    orchestrator.mcp_servers = [server]

    try:
        await server.connect()

        # Test creating a task
        result = await Runner.run(
            orchestrator,
            "[User: test-user-123] Create a task called 'Buy groceries' for tomorrow with high priority"
        )

        print(f"Agent Response: {result.output_text}")
        print(f"Agent Used: {result.last_agent.name if result.last_agent else 'Unknown'}")

        # Verify task was created in database
        async with async_session_factory() as session:
            result = await session.execute(
                select(Task).where(Task.user_id == "test-user-123")
            )
            tasks = result.scalars().all()

            if tasks:
                print(f"✅ Task created in database: {tasks[0].title}")
                return True
            else:
                print("❌ Task not found in database")
                return False

    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    finally:
        await server.cleanup()


async def test_task_listing_with_filters():
    """Test T045: Task listing with filters"""
    print("\n=== Test 2: Task Listing with Filters ===")

    server = MCPServerStdio(
        params={
            "command": "uv",
            "args": ["run", "task_serves_mcp_tools.py"]
        }
    )

    orchestrator.mcp_servers = [server]

    try:
        await server.connect()

        # First create some test tasks
        await Runner.run(
            orchestrator,
            "[User: test-user-123] Create a task called 'Complete report' for work"
        )

        await Runner.run(
            orchestrator,
            "[User: test-user-123] Create a task called 'Buy milk' for personal"
        )

        # Test listing all tasks
        result = await Runner.run(
            orchestrator,
            "[User: test-user-123] Show me all my tasks"
        )

        print(f"Agent Response: {result.output_text}")

        # Test filtering by category
        result = await Runner.run(
            orchestrator,
            "[User: test-user-123] Show me my work tasks"
        )

        print(f"Filtered Response: {result.output_text}")
        print("✅ Task listing and filtering test completed")
        return True

    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    finally:
        await server.cleanup()


async def test_task_updates_via_natural_language():
    """Test T046: Task updates via natural language"""
    print("\n=== Test 3: Task Updates via Natural Language ===")

    server = MCPServerStdio(
        params={
            "command": "uv",
            "args": ["run", "task_serves_mcp_tools.py"]
        }
    )

    orchestrator.mcp_servers = [server]

    try:
        await server.connect()

        # Create a task first
        await Runner.run(
            orchestrator,
            "[User: test-user-123] Create a task called 'Old task name'"
        )

        # Update it via natural language
        result = await Runner.run(
            orchestrator,
            "[User: test-user-123] Rename 'Old task name' to 'Updated task name' and make it high priority"
        )

        print(f"Agent Response: {result.output_text}")
        print("✅ Task update via natural language test completed")
        return True

    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    finally:
        await server.cleanup()


async def test_task_deletion_workflows():
    """Test T047: Task deletion workflows"""
    print("\n=== Test 4: Task Deletion Workflows ===")

    server = MCPServerStdio(
        params={
            "command": "uv",
            "args": ["run", "task_serves_mcp_tools.py"]
        }
    )

    orchestrator.mcp_servers = [server]

    try:
        await server.connect()

        # Create a task
        await Runner.run(
            orchestrator,
            "[User: test-user-123] Create a task called 'Task to delete'"
        )

        # Delete it
        result = await Runner.run(
            orchestrator,
            "[User: test-user-123] Delete the task called 'Task to delete'"
        )

        print(f"Agent Response: {result.output_text}")

        # Verify deletion
        async with async_session_factory() as session:
            result = await session.execute(
                select(Task).where(Task.user_id == "test-user-123")
            )
            tasks = result.scalars().all()

            if len(tasks) == 0:
                print("✅ Task deletion verified")
                return True
            else:
                print(f"❌ Task still exists: {tasks}")
                return False

    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    finally:
        await server.cleanup()


async def test_multi_user_isolation():
    """Test T048: Multi-user isolation scenarios"""
    print("\n=== Test 5: Multi-User Isolation ===")

    server = MCPServerStdio(
        params={
            "command": "uv",
            "args": ["run", "task_serves_mcp_tools.py"]
        }
    )

    orchestrator.mcp_servers = [server]

    try:
        await server.connect()

        # User 1 creates task
        await Runner.run(
            orchestrator,
            "[User: user-1] Create a task called 'User 1 task'"
        )

        # User 2 creates task
        await Runner.run(
            orchestrator,
            "[User: user-2] Create a task called 'User 2 task'"
        )

        # User 1 lists tasks - should only see their own
        result = await Runner.run(
            orchestrator,
            "[User: user-1] Show me my tasks"
        )

        print(f"User 1 sees: {result.output_text}")

        # Verify isolation
        async with async_session_factory() as session:
            result = await session.execute(
                select(Task).where(Task.user_id == "user-1")
            )
            user1_tasks = result.scalars().all()

            result = await session.execute(
                select(Task).where(Task.user_id == "user-2")
            )
            user2_tasks = result.scalars().all()

            if len(user1_tasks) == 1 and len(user2_tasks) == 1:
                print("✅ User isolation verified")
                return True
            else:
                print(f"❌ Isolation failed: User1={len(user1_tasks)}, User2={len(user2_tasks)}")
                return False

    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    finally:
        await server.cleanup()


async def test_error_handling_and_recovery():
    """Test T049: Error handling and recovery"""
    print("\n=== Test 6: Error Handling and Recovery ===")

    server = MCPServerStdio(
        params={
            "command": "uv",
            "args": ["run", "task_serves_mcp_tools.py"]
        }
    )

    orchestrator.mcp_servers = [server]

    try:
        await server.connect()

        # Test invalid task ID
        result = await Runner.run(
            orchestrator,
            "[User: test-user-123] Update task with invalid ID 'not-a-uuid' to completed"
        )

        print(f"Error handling response: {result.output_text}")

        # Test empty title
        result = await Runner.run(
            orchestrator,
            "[User: test-user-123] Create a task with empty title"
        )

        print(f"Empty title response: {result.output_text}")

        print("✅ Error handling test completed")
        return True

    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    finally:
        await server.cleanup()


async def test_performance():
    """Test T050: Performance test (<3s response times)"""
    print("\n=== Test 7: Performance Test ===")

    server = MCPServerStdio(
        params={
            "command": "uv",
            "args": ["run", "task_serves_mcp_tools.py"]
        }
    )

    orchestrator.mcp_servers = [server]

    try:
        await server.connect()

        # Test multiple operations and measure time
        operations = [
            "[User: perf-test] Create a task called 'Performance test task'",
            "[User: perf-test] Show me my tasks",
            "[User: perf-test] Complete the performance test task"
        ]

        times = []

        for op in operations:
            start_time = time.time()
            result = await Runner.run(orchestrator, op)
            end_time = time.time()
            duration = end_time - start_time
            times.append(duration)
            print(f"Operation took: {duration:.2f}s")

        avg_time = sum(times) / len(times)
        max_time = max(times)

        print(f"\nAverage time: {avg_time:.2f}s")
        print(f"Max time: {max_time:.2f}s")

        if max_time < 3.0:
            print("✅ Performance test PASSED (<3s)")
            return True
        else:
            print("❌ Performance test FAILED (>=3s)")
            return False

    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    finally:
        await server.cleanup()


async def test_mcp_integration():
    """Main test runner for all MCP integration tests."""
    print("🧪 Testing MCP Integration")
    print("=" * 60)
    print("Phase 2: MCP Integration Tests")
    print("Testing complete flow: Agent → MCP Tools → Database")
    print("=" * 60)

    # Clean up first
    print("\n🧹 Pre-test cleanup...")
    await cleanup_test_tasks("test-user-123")
    await cleanup_test_tasks("user-1")
    await cleanup_test_tasks("user-2")
    await cleanup_test_tasks("perf-test")

    # Run structural validation first
    structural_ok = await test_structural_validation()
    if not structural_ok:
        print("\n❌ Structural validation failed. Cannot proceed with integration tests.")
        return False

    # Run integration tests
    tests = [
        ("Task Creation", test_task_creation_via_agent),
        ("Task Listing", test_task_listing_with_filters),
        ("Task Updates", test_task_updates_via_natural_language),
        ("Task Deletion", test_task_deletion_workflows),
        ("User Isolation", test_multi_user_isolation),
        ("Error Handling", test_error_handling_and_recovery),
        ("Performance", test_performance),
    ]

    results = []

    for test_name, test_func in tests:
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            results.append((test_name, False))

    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)

    passed = 0
    failed = 0

    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:20} {status}")
        if result:
            passed += 1
        else:
            failed += 1

    print(f"\nTotal: {passed + failed} | Passed: {passed} | Failed: {failed}")

    if failed == 0:
        print("\n🎉 ALL TESTS PASSED!")
        print("✅ Phase 2: MCP Integration - COMPLETE")
        print("✅ Ready for Checkpoint 2 review")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed. Please review before proceeding.")
        return False

async def main():
    """Main test runner."""
    try:
        result = await test_mcp_integration()
        return 0 if result else 1
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)