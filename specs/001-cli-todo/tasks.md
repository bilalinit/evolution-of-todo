# Implementation Tasks: CLI Todo Application

**Feature**: 001-cli-todo
**Branch**: `001-cli-todo`
**Date**: 2025-12-28
**Plan**: [specs/001-cli-todo/plan.md](plan.md)
**Spec**: [specs/001-cli-todo/spec.md](spec.md)

## Overview

This document contains all implementation tasks for the CLI Todo Application. Tasks are organized by user story and follow a strict checklist format. Each task is independently testable and includes file paths for precise execution.

## Dependencies & Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (Polish)
```

**Parallel Opportunities**:
- US1 tasks can be implemented in parallel once models are created
- US2 and US3 are independent of each other
- Test tasks [P] can run parallel to implementation tasks

---

## Phase 1: Setup (Project Initialization)

**Goal**: Initialize UV project structure and install dependencies

- [X] T001 Use backend skill to understand current project structure and create backend package
- [X] T002 Initialize UV package in project root: `uv init --package backend`
- [X] T003 Navigate to backend directory and verify pyproject.toml creation
- [X] T004 Add core dependencies: `uv add sqlmodel pydantic`
- [X] T005 Add development dependencies: `uv add --dev pytest pytest-cov ruff mypy`
- [X] T006 Create basic project structure per plan.md (src/backend/ directories)
- [X] T007 Verify Python 3.13+ compatibility and UV lock file generation

---

## Phase 2: Foundational (Core Architecture)

**Goal**: Create shared infrastructure needed for all user stories

- [X] T008 [P] Create Task dataclass in `src/backend/models.py` with id, title, completed, created_at
- [X] T009 [P] Create Pydantic validation schemas in `src/backend/models.py` (TaskCreate, TaskUpdate)
- [X] T010 [P] Create custom exception hierarchy in `src/backend/exceptions.py`
- [X] T011 [P] Create validation utilities in `src/backend/utils.py` (validate_title, format_table)
- [X] T012 Create TaskManager class in `src/backend/services.py` with in-memory storage
- [X] T013 Create CLI command parser in `src/backend/cli.py` with command routing
- [X] T014 Create main entry point in `src/backend/main.py` with main loop and signal handling

---

## Phase 3: User Story 1 - Basic Task Management (P1)

**Goal**: Implement core CRUD + toggle operations

### US1 - Models & Services
- [X] T015 [P] [US1] Implement `add_task(title: str)` method in TaskManager
- [X] T016 [P] [US1] Implement `list_tasks()` method in TaskManager (sorted by ID)
- [X] T017 [P] [US1] Implement `update_task(task_id: int, new_title: str)` method in TaskManager
- [X] T018 [P] [US1] Implement `delete_task(task_id: int)` method in TaskManager
- [X] T019 [P] [US1] Implement `toggle_task(task_id: int)` method in TaskManager

### US1 - CLI Commands
- [X] T020 [US1] Implement `add` command handler in CLI (with aliases: a, new, create)
- [X] T021 [US1] Implement `list` command handler in CLI (with aliases: l, ls, show, view)
- [X] T022 [US1] Implement `update` command handler in CLI (with aliases: u, edit)
- [X] T023 [US1] Implement `delete` command handler in CLI (with aliases: d, remove)
- [X] T024 [US1] Implement `toggle` command handler in CLI (with aliases: t, complete)

### US1 - Integration
- [X] T025 [US1] Connect CLI handlers to TaskManager methods
- [X] T026 [US1] Implement formatted table display in utils.py for list command
- [X] T027 [US1] Add success/error message formatting in utils.py

---

## Phase 4: User Story 2 - Error Handling & Validation (P2)

**Goal**: Robust error handling for all user input scenarios

### US2 - Service Layer Validation
- [X] T028 [P] [US2] Add input validation to TaskManager methods (empty titles, invalid IDs)
- [X] T029 [P] [US2] Implement graceful error returns (no exceptions for user errors)
- [X] T030 [P] [US2] Add task ID existence checks in update/delete/toggle methods

### US2 - CLI Error Handling
- [X] T031 [US2] Implement error message formatting in CLI (user-friendly messages)
- [X] T032 [US2] Add command validation (unknown commands → helpful error)
- [X] T033 [US2] Add ID validation (non-numeric → "Please enter valid task ID")
- [X] T034 [US2] Add empty title validation (whitespace only → "Task title cannot be empty")
- [X] T035 [US2] Implement graceful error recovery (return to prompt, don't crash)

### US2 - Edge Case Handling
- [X] T036 [US2] Handle task not found scenarios (ID 99 when no tasks exist)
- [X] T037 [US2] Handle rapid consecutive invalid commands
- [X] T038 [US2] Handle very long task titles (truncation or wrapping in display)

---

## Phase 5: User Story 3 - Command Interface & Help (P3)

**Goal**: User-friendly command interface with help system

### US3 - Help System
- [X] T039 [P] [US3] Create help menu content with all commands and descriptions
- [X] T040 [P] [US3] Implement `help` command handler (with aliases: h, ?)
- [X] T041 [P] [US3] Add help display formatting (clear, readable layout)

### US3 - Exit & Control
- [X] T042 [US3] Implement `exit` command handler (with aliases: quit, q, bye)
- [X] T043 [US3] Add graceful exit with farewell message
- [X] T044 [US3] Handle Ctrl+C (SIGINT) with cleanup and farewell message
- [X] T045 [US3] Add application header/banner display

### US3 - Command Aliases & UX
- [X] T046 [US3] Verify all command aliases work correctly
- [X] T047 [US3] Add command suggestions for typos (e.g., "Unknown command 'ad'. Did you mean 'add'?")
- [X] T048 [US3] Implement empty input handling (show prompt again)

---

## Phase 6: Testing & Validation

**Goal**: Ensure 90%+ coverage and validate all acceptance criteria

### Unit Tests
- [X] T049 [P] Create unit tests for Task dataclass and validation in `tests/unit/test_models.py`
- [X] T050 [P] Create unit tests for TaskManager methods in `tests/unit/test_services.py`
- [X] T051 [P] Create unit tests for CLI command parsing in `tests/unit/test_cli.py`
- [X] T052 [P] Create unit tests for utility functions in `tests/unit/test_utils.py`

### Integration Tests
- [X] T053 Create integration test for complete user flow in `tests/integration/test_cli_flow.py`
- [X] T054 Test error scenarios (invalid ID, empty title, unknown command)
- [X] T055 Test edge cases (empty list, rapid commands, Ctrl+C simulation)

### Quality Assurance
- [X] T056 Run test suite and ensure 90%+ coverage
- [X] T057 Run mypy type checking and fix all issues
- [X] T058 Run ruff linting and fix all issues
- [X] T059 Run ruff formatting to ensure consistent style

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Finalize implementation and ensure compliance

### Documentation
- [X] T060 Update README.md in backend directory with usage examples
- [X] T061 Add docstrings to all public methods and classes
- [X] T062 Verify all file headers include proper copyright/licensing

### Final Validation
- [X] T063 Manually test all 5 core operations end-to-end
- [X] T064 Verify all acceptance scenarios from spec.md pass
- [X] T065 Test error handling scenarios from spec.md
- [X] T066 Verify help system and exit commands work correctly
- [X] T067 Test performance: <100ms response time, <50MB memory footprint

### Constitution Compliance
- [X] T068 Verify logic decoupled from presentation (models → services → cli)
- [X] T069 Verify strict typing throughout (no dynamic typing)
- [X] T070 Verify validation at boundaries (Pydantic + custom validation)
- [X] T071 Verify graceful error handling (no crashes on user input)

### Pre-Merge Checklist
- [X] T072 All tests pass with 90%+ coverage
- [X] T073 No mypy or ruff errors
- [X] T074 All user stories complete and independently testable
- [X] T075 All acceptance criteria met
- [X] T076 Ready for Phase II (database migration path documented)

---

## Parallel Execution Examples

### US1 Implementation (Core Operations)
```bash
# Terminal 1: Start with models
uv run python -c "from src.backend.models import Task; print('Models OK')"

# Terminal 2: Implement services in parallel
# T015, T016, T017, T018, T019 can be done simultaneously
# Each method is independent

# Terminal 3: Implement CLI handlers
# T020, T021, T022, T023, T024 can be done simultaneously
# Each command is independent
```

### Testing Execution
```bash
# Run unit tests in parallel
uv run pytest tests/unit/test_models.py &  # T049
uv run pytest tests/unit/test_services.py &  # T050
uv run pytest tests/unit/test_cli.py &  # T051
uv run pytest tests/unit/test_utils.py &  # T052

# Run integration tests
uv run pytest tests/integration/test_cli_flow.py  # T053
```

---

## Implementation Strategy

### MVP Approach
1. **Start with US1**: Implement basic add/list/toggle/update/delete operations
2. **Add US2**: Layer error handling on top of working core
3. **Complete with US3**: Add help system and polish UX

### Incremental Delivery
- Each user story phase produces a working increment
- Tests validate each phase independently
- No breaking changes between phases

### Risk Mitigation
- **Low Risk**: In-memory storage is simple and reversible
- **Medium Risk**: CLI UX complexity (mitigated by clear spec)
- **Low Risk**: Test coverage (pytest standard patterns)

### Success Validation
- All 5 CLI commands work as specified
- 90%+ test coverage achieved
- Constitution compliance verified
- Ready for Phase II database migration

---

## File Path Summary

### Source Code
- `src/backend/models.py` - Data models and validation schemas
- `src/backend/services.py` - TaskManager business logic
- `src/backend/cli.py` - Command parsing and display
- `src/backend/utils.py` - Validation and formatting helpers
- `src/backend/main.py` - Entry point and main loop
- `src/backend/exceptions.py` - Custom exception hierarchy

### Tests
- `tests/unit/test_models.py` - Model unit tests
- `tests/unit/test_services.py` - Service unit tests
- `tests/unit/test_cli.py` - CLI unit tests
- `tests/unit/test_utils.py` - Utility unit tests
- `tests/integration/test_cli_flow.py` - End-to-end flow tests

### Configuration
- `backend/pyproject.toml` - UV project config
- `backend/uv.lock` - Dependency lock file
- `backend/README.md` - Project documentation

---

**Total Tasks**: 76
**User Story 1 Tasks**: 13 (T015-T027)
**User Story 2 Tasks**: 11 (T028-T038)
**User Story 3 Tasks**: 10 (T039-T048)
**Parallel Opportunities**: 15+ tasks can be executed in parallel
**Estimated Duration**: 2-3 implementation sessions + 1-2 testing sessions

**Next Action**: Begin with Phase 1 Setup tasks (T001-T007)