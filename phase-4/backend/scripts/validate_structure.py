#!/usr/bin/env python3
"""
Project Structure Validation Script
Validates that all required files and directories exist for MCP Agent Integration
"""
import os
import sys
from pathlib import Path

def check_file_exists(path: Path, description: str) -> bool:
    """Check if a file exists and print result."""
    exists = path.exists()
    status = "✅" if exists else "❌"
    print(f"{status} {description}: {path}")
    return exists

def check_dir_exists(path: Path, description: str) -> bool:
    """Check if a directory exists and print result."""
    exists = path.exists() and path.is_dir()
    status = "✅" if exists else "❌"
    print(f"{status} {description}: {path}")
    return exists

def main():
    """Main validation function."""
    print("🔍 Validating MCP Agent Integration Project Structure")
    print("=" * 60)

    # Base paths
    backend_root = Path("/mnt/d/coding Q4/hackathon-2/save-27-phase-3/hackathon-todo/phase-3/backend")
    frontend_root = Path("/mnt/d/coding Q4/hackathon-2/save-27-phase-3/hackathon-todo/phase-3/frontend")

    all_checks_passed = True

    # Phase 1: Agent Foundation
    print("\n📋 Phase 1: Agent Foundation")
    print("-" * 30)

    # Backend structure
    all_checks_passed &= check_dir_exists(backend_root, "Backend root")
    all_checks_passed &= check_dir_exists(backend_root / "src" / "backend", "Backend source")

    # Required existing files
    all_checks_passed &= check_file_exists(backend_root / "src" / "backend" / "main.py", "Main FastAPI app")
    all_checks_passed &= check_file_exists(backend_root / "src" / "backend" / "database.py", "Database connection")
    all_checks_passed &= check_file_exists(backend_root / "src" / "backend" / "config.py", "Configuration")
    all_checks_passed &= check_file_exists(backend_root / "src" / "backend" / "models" / "task.py", "Task model")
    all_checks_passed &= check_file_exists(backend_root / "src" / "backend" / "middleware" / "auth.py", "Auth middleware")

    # Phase 1 new files (to be created)
    print("\n📝 Phase 1 New Files (to be created):")
    all_checks_passed &= check_file_exists(backend_root / "src" / "backend" / "agents.py", "Agent system")
    all_checks_passed &= check_file_exists(backend_root / "scripts" / "test_agents.py", "Agent tests")

    # Phase 2: MCP Integration
    print("\n📋 Phase 2: MCP Integration")
    print("-" * 30)

    all_checks_passed &= check_file_exists(backend_root / "src" / "backend" / "services" / "task_service.py", "Task service")
    all_checks_passed &= check_file_exists(backend_root / "task_serves_mcp_tools.py", "MCP server")

    # Phase 3: Frontend
    print("\n📋 Phase 3: Frontend UI")
    print("-" * 30)

    all_checks_passed &= check_dir_exists(frontend_root, "Frontend root")
    all_checks_passed &= check_file_exists(frontend_root / "src" / "app" / "chatbot" / "page.tsx", "Chatbot page")
    all_checks_passed &= check_file_exists(frontend_root / "src" / "app" / "api" / "chat" / "route.ts", "Frontend API route")

    # Environment check
    print("\n🔐 Environment Variables")
    print("-" * 30)

    backend_env = backend_root / ".env"
    if backend_env.exists():
        with open(backend_env, 'r') as f:
            content = f.read()
            has_xiaomi = "XIAOMI_API_KEY" in content
            print(f"{'✅' if has_xiaomi else '❌'} XIAOMI_API_KEY in backend .env")
            if not has_xiaomi:
                print("   ⚠️  Add: XIAOMI_API_KEY=your_key_here")
                all_checks_passed = False
    else:
        print("❌ Backend .env file missing")
        all_checks_passed = False

    # Summary
    print("\n" + "=" * 60)
    if all_checks_passed:
        print("✅ All validation checks passed!")
        print("Ready to proceed with implementation.")
        return 0
    else:
        print("❌ Some validation checks failed.")
        print("Please ensure all required files exist before proceeding.")
        return 1

if __name__ == "__main__":
    sys.exit(main())