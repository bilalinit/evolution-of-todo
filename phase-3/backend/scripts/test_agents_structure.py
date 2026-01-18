#!/usr/bin/env python3
"""
Test agent system structure and configuration
Verifies that all components are properly set up without making API calls
"""
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(backend_path))

# Set environment for testing
os.environ.setdefault("XIAOMI_API_KEY", "test-key-for-validation")

def test_imports():
    """Test that all required imports work."""
    print("🔍 Testing imports...")
    try:
        from backend.agents import orchestrator, urdu_agent, model, client
        from agents import Runner
        from agents.mcp import MCPServerStdio
        print("✅ All imports successful")
        return True
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False

def test_agent_structure():
    """Test agent configuration."""
    print("\n🔍 Testing agent structure...")
    try:
        from backend.agents import orchestrator, urdu_agent, model, client

        # Check agents exist
        assert orchestrator is not None, "Orchestrator agent missing"
        assert urdu_agent is not None, "Urdu agent missing"

        # Check agent properties
        assert orchestrator.name == "Orchestrator", f"Orchestrator name wrong: {orchestrator.name}"
        assert urdu_agent.name == "UrduSpecialist", f"Urdu agent name wrong: {urdu_agent.name}"

        # Check model configuration
        assert model is not None, "Model missing"
        assert client is not None, "Client missing"

        # Check handoff configuration
        assert len(orchestrator.handoffs) > 0, "Orchestrator should have handoffs"

        print("✅ Agent structure valid")
        return True
    except Exception as e:
        print(f"❌ Agent structure test failed: {e}")
        return False

def test_instructions():
    """Test that agent instructions are properly configured."""
    print("\n🔍 Testing agent instructions...")
    try:
        from backend.agents import orchestrator, urdu_agent

        # Check Urdu agent has Urdu instructions
        urdu_instructions = urdu_agent.instructions.lower()
        assert "urdu" in urdu_instructions, "Urdu agent should mention Urdu language"

        # Check orchestrator has routing instructions
        orch_instructions = orchestrator.instructions.lower()
        assert "route" in orch_instructions or "handoff" in orch_instructions, "Orchestrator should have routing logic"

        print("✅ Agent instructions configured")
        return True
    except Exception as e:
        print(f"❌ Instructions test failed: {e}")
        return False

def test_main_endpoints():
    """Test that main.py has the required endpoints."""
    print("\n🔍 Testing main.py endpoints...")
    try:
        # Check main.py file exists and has the right content
        main_file = backend_path / "backend" / "main.py"
        assert main_file.exists(), "main.py file missing"

        content = main_file.read_text()

        # Check for key components
        assert "MCPServerStdio" in content, "MCPServerStdio import missing"
        assert "orchestrator" in content, "Orchestrator reference missing"
        assert "urdu_agent" in content, "Urdu agent reference missing"
        assert "@app.post(\"/api/chat\")" in content, "Chat endpoint missing"
        assert "@app.get(\"/api/chat/health\")" in content, "Health endpoint missing"

        print("✅ Main endpoints configured")
        return True
    except Exception as e:
        print(f"❌ Main endpoints test failed: {e}")
        return False

def test_config():
    """Test configuration settings."""
    print("\n🔍 Testing configuration...")
    try:
        from backend.config import settings

        # Check agent-related config exists
        assert hasattr(settings, 'xiaomi_api_key'), "Xiaomi API key config missing"
        assert hasattr(settings, 'mcp_server_timeout'), "MCP timeout config missing"

        print("✅ Configuration valid")
        return True
    except Exception as e:
        print(f"❌ Config test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("🧪 Testing MCP Agent System Structure")
    print("=" * 50)

    tests = [
        test_imports,
        test_agent_structure,
        test_instructions,
        test_main_endpoints,
        test_config
    ]

    results = []
    for test in tests:
        results.append(test())

    print("\n" + "=" * 50)
    if all(results):
        print("✅ All structure tests passed!")
        print("\n📋 Summary:")
        print("- Agent system properly configured")
        print("- Dual-agent architecture ready")
        print("- MCP integration points established")
        print("- Main endpoints configured")
        print("- Environment configuration valid")
        print("\n⚠️  Note: Actual API calls require valid XIAOMI_API_KEY")
        return 0
    else:
        print("❌ Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())