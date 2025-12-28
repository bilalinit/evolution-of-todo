---
id: 2
title: update claude md skill docs
stage: general
date: 2025-12-28
surface: agent
model: claude-sonnet-4-5
feature: none
branch: 001-cli-todo
user: user
command: i have added a new backend skill @.claude/skills/backend/ understand the skill and also update the @CLAUDE.md file in the root about the skill
labels: ["documentation", "skills", "backend", "uv"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/skills/backend/SKILL.md
  - .claude/skills/backend/CLAUDE.md
  - .claude/skills/backend/concepts/UV_WORKFLOW.md
  - .claude/skills/backend/concepts/STRUCTURE.md
  - CLAUDE.md
tests: []

---

## Prompt

i have added a new backend skill @.claude/skills/backend/ understand the skill and also update the @CLAUDE.md file in the root about the skill

## Response snapshot

✅ **Backend Skill Successfully Integrated and Documented**

## Skill Analysis

The `.claude/skills/backend/` skill provides specialized expertise for Python backend development using the **UV** package manager. Key components:

### Core Capabilities
- **Smart Project Initialization**: Handles both fresh starts and existing folders
- **UV-Based Dependency Management**: `uv add`, `uv remove`, `uv sync`
- **Automatic Virtual Environment Management**: No manual venv handling needed
- **Performance**: Rust-based speed for package operations

### Critical Workflow Rules
1. **Initialization Logic**:
   - No `backend/` folder → `uv init --package backend`
   - Existing `backend/` folder → `cd backend && uv init --package`

2. **Prohibited Commands**:
   - ❌ `pip install` → Use `uv add`
   - ❌ `python -m venv` → Let `uv` handle it
   - ❌ `poetry` → Use `uv` exclusively

3. **Execution Pattern**: Always use `uv run <command>`

### Project Structure
The skill creates a package-based layout:
```
backend/
├── pyproject.toml
├── README.md
└── src/
    └── backend/
        ├── __init__.py
        └── py.typed
```

## Updated CLAUDE.md

Added comprehensive backend skill documentation to the main CLAUDE.md file including:
- Skill location and purpose
- When to use it (Python/UV projects)
- Key capabilities overview
- Usage patterns with examples
- Prohibited commands

The documentation now provides clear guidance for leveraging the backend skill in future development work.

## Next Steps
The backend skill is now ready for use in projects like the CLI Todo Application (001-cli-todo) we just specified. When implementation begins, this skill will handle all Python/UV setup automatically.

---

## Outcome

- ✅ Impact: High - Documentation now complete for backend skill usage
- 🧪 Tests: All skill files reviewed and main CLAUDE.md updated
- 📁 Files: 5 files processed (4 skill files + 1 main doc)
- 🔁 Next prompts: Ready to use backend skill for implementation
- 🧠 Reflection: Skill integration followed documentation standards - clear separation between skill-specific rules and project-wide guidance

## Evaluation notes (flywheel)

- Failure modes observed: None - skill files were well-structured and clear
- Graders run and results (PASS/FAIL): PASS - Documentation meets standards
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Use backend skill to initialize the CLI todo project