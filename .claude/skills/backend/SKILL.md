# Backend Skill (Python & UV)

## Overview
This skill provides expertise in Python backend development, specifically using the **uv** package manager. It streamlines the creation, management, and execution of Python projects.

> 🛑 **STOP! READ THIS FIRST!**
>
> You are **FORBIDDEN** from generating any plans or code until you have read and internalized the following files. These contain strict, non-negotiable project standards.
>
> 1. **`CLAUDE.md`** (Read this IMMEDIATELY for the correct `init` logic)
> 2. **`concepts/UV_WORKFLOW.md`** (Read for the `package` vs `non-package` workflow)
> 3. **`concepts/STRUCTURE.md`** (Read for the verified folder layout)
>
> **Failure to read these files constitutes a failure of the task.** Verify you have read them by explicitly confirming the `uv init` logic and *project structure* in your thought process.

## Capabilities
- **Project Initialization**: Smart startup with `uv init` (handles existing vs new folders).
- **Package Management**: adding (`uv add`), removing (`uv remove`), and syncing (`uv sync`) dependencies.
- **Virtual Environments**: Automatic venv management via `uv`.
- **Performance**: Leveraging uv's Rust-based speed for installs and resolution.

## Structure
- **Concepts**: `concepts/` contains detailed usage guides.
- **Workflow**: See `concepts/UV_WORKFLOW.md` for the standard commands.

## Common Usage
1. **New Project**: "Start a new backend project."
   -> `uv init --package backend` (or `uv init --package` if folder exists)
2. **Add Dependency**: "Install FastAPI."
   -> `uv add fastapi`
3. **Run Script**: "Run the dev server."
   -> `uv run fastapi dev` (or similar)

## Guidelines
- **Always use `uv`**: Do not mix with `pip` or `poetry` unless explicitly requested.
- **Init Pattern**: The preferred project structure is package-based.
