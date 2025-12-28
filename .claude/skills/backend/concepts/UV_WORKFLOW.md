# UV Workflow Guide

## Standard Commands

### 1. Initialization
**Scenario A: Fresh Start (No folder)**
```bash
uv init --package backend
```
*Creates `backend/` directory with package layout.*

**Scenario B: Existing Folder (Backend folder exists)**
```bash
cd backend
uv init --package
```
*Initializes the current directory without creating a nested subfolder.*

### 2. Adding Dependencies
Add standard production dependencies:
```bash
uv add fastapi uvicorn
```
Add development dependencies (linting, testing):
```bash
uv add --dev pytest ruff
```

### 3. Running Code
Execute typical backend servers or scripts:
```bash
# Run a FastAPI dev server
uv run fastapi dev api/main.py

# Run a generic script
uv run python scripts/setup_db.py
```

### 4. Environment Management
- `uv` automatically creates a `.venv` in the project root.
- To sync dependencies (e.g., after pulling code):
```bash
uv sync
```
- To update packages:
```bash
uv lock --upgrade
# or specific package
uv add --upgrade <package>
```

### 5. Why UV?
- **Speed**: significantly faster than pip/poetry.
- **determinism**: `uv.lock` ensures consistent installs.
- **Unified Tool**: Replaces pip, pip-tools, and venv management.
