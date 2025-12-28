# Backend (UV) for Claude

## When to Use This Skill
Use this skill when users ask to:
- Create a new Python/Backend project.
- Manage Python dependencies.
- Run Python scripts or servers.
- Debug Python environment issues.

## How to Respond

### 1. Initialization
**Check context first:**
- **If `backend/` directory DOES NOT exist**:
  ```bash
  uv init --package backend
  ```
- **If `backend/` directory ALREADY exists**:
  ```bash
  cd backend && uv init --package
  ```
  *(Do not use `uv init --package backend` inside an existing backend folder, as it creates nested `backend/backend`)*.

### 2. Dependency Management
- **Add**: Use `uv add <package>`.
- **Remove**: Use `uv remove <package>`.
- **Dev Dependencies**: Use `uv add --dev <package>`.
- **Sync/Install**: Use `uv sync` to install from `uv.lock`.

### 3. Execution
- Use `uv run <command>` to execute in the project's environment.
- Example: `uv run python main.py` or `uv run uvicorn main:app`.

### 4. Prohibited Commands
- ❌ `pip install` (Use `uv add`)
- ❌ `python -m venv` (Let `uv` manage it)
- ❌ `poetry init` (We are using `uv`)

## Best Practices
- Keep the `pyproject.toml` as the source of truth.
- Commit `uv.lock` to version control.
- Use `uv` for script execution to ensure the correct venv is active.
