# Implementation Tasks: Menu-Driven UI Transformation

**Feature**: 002-cli-menu-ui
**Branch**: `002-cli-menu-ui`
**Date**: 2025-12-28
**Plan**: [specs/002-cli-menu-ui/plan.md](plan.md)
**Spec**: [specs/002-cli-menu-ui/spec.md](spec.md)

## Overview

This task list implements the menu-driven UI transformation in phases, organized by user story for independent development and testing. Each phase delivers a complete, testable increment.

**Total Tasks**: 42
**User Stories**: 3 (P1, P2, P3)
**Parallel Opportunities**: 12 tasks
**MVP Scope**: User Story 1 (P1) - Core navigation and task creation

## Dependencies & Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1-P1) → Phase 4 (US2-P2) → Phase 5 (US3-P3) → Phase 6 (Polish)
```

**User Story Dependencies**: All stories are independent but build on foundational utilities.

## Implementation Strategy

**MVP First**: Start with User Story 1 (P1) - delivers core value immediately
**Incremental**: Each user story phase is independently deployable
**Test-Driven**: Each phase includes validation criteria for independent testing
**Parallel Work**: Marked [P] tasks can be executed concurrently within their phase

---

## Phase 1: Setup (Project Initialization)

**Goal**: Prepare project structure and verify development environment

- [X] T001 Verify branch is active: `git checkout 002-cli-menu-ui`
- [X] T002 Check existing codebase structure: `ls -la backend/src/backend/`
- [X] T003 Verify Python 3.13+ installation: `python --version` (Note: 3.12.3, but compatible)
- [X] T004 Verify uv package manager: `uv --version`
- [X] T005 Install existing dependencies: `uv sync` (if needed)
- [X] T006 Run existing tests to establish baseline: `uv run pytest tests/ -v`
- [X] T007 Create backup of current CLI implementation: `cp backend/src/backend/cli.py backend/src/backend/cli.py.backup`

---

## Phase 2: Foundational (Utilities & Infrastructure)

**Goal**: Create reusable utilities and UI infrastructure needed by all user stories

**Independent Test**: Verify utility functions work correctly in isolation

### UI Constants & Box Drawing

- [X] T008 [P] Add color constants to `backend/src/backend/utils.py`
- [X] T009 [P] Add box-drawing characters to `backend/src/backend/utils.py`
- [X] T010 [P] Implement `create_box()` in `backend/src/backend/utils.py`
- [X] T011 [P] Implement `create_separator()` in `backend/src/backend/utils.py`
- [X] T012 [P] Implement `wrap_text()` in `backend/src/backend/utils.py`

### Input Validation & Sanitization

- [X] T013 [P] Implement `sanitize_input()` in `backend/src/backend/utils.py`
- [X] T014 [P] Implement `validate_menu_choice()` in `backend/src/backend/utils.py`
- [X] T015 [P] Implement `validate_title()` in `backend/src/backend/utils.py` (implemented as `validate_task_title_for_menu`)

### Core UI Display Functions

- [X] T016 Create `backend/src/backend/ui.py` with function imports
- [X] T017 [P] Implement `display_header()` in `backend/src/backend/ui.py`
- [X] T018 [P] Implement `display_message()` in `backend/src/backend/ui.py`
- [X] T019 [P] Implement `display_pause()` in `backend/src/backend/ui.py`

### Foundation Validation

- [X] T020 Test all utility functions: `uv run pytest tests/unit/test_utils.py -v`
- [X] T021 Test core UI functions: `uv run pytest tests/unit/test_ui.py::test_display_header -v`

---

## Phase 3: User Story 1 (P1) - First-Time User Navigation

**Goal**: Enable first-time users to navigate and add tasks via visual menu
**Independent Test**: Launch app, add first task using only menu prompts
**Acceptance**: User can complete task creation in <30 seconds without documentation

### Main Menu & Navigation

- [X] T022 [P] [US1] Implement `display_main_menu()` in `backend/src/backend/ui.py`
- [X] T023 [P] [US1] Implement `display_help()` in `backend/src/backend/ui.py`
- [X] T024 [P] [US1] Implement `display_exit_message()` in `backend/src/backend/ui.py`

### Add Task Flow

- [X] T025 [P] [US1] Implement `display_add_form()` in `backend/src/backend/ui.py`
- [X] T026 [US1] Implement `handle_add_task()` in `backend/src/backend/cli.py`
- [X] T027 [US1] Test add task flow: `uv run pytest tests/integration/test_menu_flow.py::test_add_task_flow -v`

### Menu Router

- [X] T028 [P] [US1] Create `MenuHandler` class in `backend/src/backend/cli.py`
- [X] T029 [P] [US1] Implement `route_menu_choice()` in `MenuHandler`
- [X] T030 [P] [US1] Implement `handle_help()` in `MenuHandler`
- [X] T031 [P] [US1] Implement `handle_exit()` in `MenuHandler`

### Main Loop Integration

- [X] T032 [US1] Update `main()` function in `backend/src/backend/main.py`
- [X] T033 [US1] Add signal handling for Ctrl+C in `backend/src/backend/main.py`

### US1 Validation & Testing

- [X] T034 [US1] Test menu routing: `uv run pytest tests/unit/test_menu.py::test_menu_routing -v`
- [X] T035 [US1] Test complete add flow: `uv run pytest tests/integration/test_menu_flow.py::test_add_task_flow -v`
- [X] T036 [US1] Manual test: Launch app and verify first-time user can add task in <30 seconds

**US1 Complete Criteria**: User can launch app, see menu, add task, and return to menu without knowing any commands.

---

## Phase 4: User Story 2 (P2) - Visual Task Management

**Goal**: Display tasks with visual formatting, status indicators, and progress statistics
**Independent Test**: Add 3 tasks, complete 1, verify list shows proper formatting and stats
**Acceptance**: User can understand task status and progress within 3 seconds of viewing list

### List Display Functions

- [X] T037 [P] [US2] Implement `format_task_row()` in `backend/src/backend/utils.py`
- [X] T038 [P] [US2] Implement `get_progress_stats()` in `backend/src/backend/utils.py`
- [X] T039 [P] [US2] Implement `display_empty_state()` in `backend/src/backend/ui.py`
- [X] T040 [P] [US2] Implement `display_list_view()` in `backend/src/backend/ui.py`

### List Task Handler

- [X] T041 [US2] Implement `handle_list_tasks()` in `backend/src/backend/cli.py`
- [X] T042 [US2] Test list view with tasks: `uv run pytest tests/integration/test_menu_flow.py::test_list_tasks_flow -v`
- [X] T043 [US2] Test empty state: `uv run pytest tests/integration/test_menu_flow.py::test_empty_list_flow -v`

### US2 Validation & Testing

- [X] T044 [US2] Test progress statistics: `uv run pytest tests/unit/test_utils.py::test_get_progress_stats -v`
- [X] T045 [US2] Test task row formatting: `uv run pytest tests/unit/test_utils.py::test_format_task_row -v`
- [X] T046 [US2] Manual test: Add 3 tasks, complete 1, verify list shows correct stats and formatting

**US2 Complete Criteria**: User can view task list and immediately understand completion status, counts, and progress percentage.

---

## Phase 5: User Story 3 (P3) - Safe Complex Operations

**Goal**: Enable safe deletion, toggling, and updating with confirmation dialogs
**Independent Test**: Attempt to delete task, verify confirmation appears before action
**Acceptance**: 100% of destructive operations require explicit confirmation

### Confirmation Dialogs

- [X] T047 [P] [US3] Implement `display_confirmation_prompt()` in `backend/src/backend/ui.py`
- [X] T048 [P] [US3] Implement `display_toggle_confirmation()` in `backend/src/backend/ui.py`
- [X] T049 [P] [US3] Implement `display_delete_confirmation()` in `backend/src/backend/ui.py`

### Two-Step Update Flow

- [X] T050 [P] [US3] Implement `display_update_step1()` in `backend/src/backend/ui.py`
- [X] T051 [P] [US3] Implement `display_update_step2()` in `backend/src/backend/ui.py`

### Operation Handlers

- [X] T052 [US3] Implement `handle_toggle_task()` in `backend/src/backend/cli.py`
- [X] T053 [US3] Implement `handle_delete_task()` in `backend/src/backend/cli.py`
- [X] T054 [US3] Implement `handle_update_task()` in `backend/src/backend/cli.py`

### US3 Validation & Testing

- [X] T055 [US3] Test toggle confirmation: `uv run pytest tests/integration/test_menu_flow.py::test_toggle_task_flow -v`
- [X] T056 [US3] Test delete confirmation: `uv run pytest tests/integration/test_menu_flow.py::test_delete_task_flow -v`
- [X] T057 [US3] Test update flow: `uv run pytest tests/integration/test_menu_flow.py::test_update_task_flow -v`
- [X] T058 [US3] Test cancel operations: `uv run pytest tests/integration/test_menu_flow.py::test_cancel_operations -v`
- [X] T059 [US3] Manual test: Verify all destructive operations show confirmation dialogs

**US3 Complete Criteria**: User cannot accidentally delete or toggle tasks - all such operations require explicit confirmation with clear warnings.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Ensure quality, handle edge cases, verify performance

### Error Handling & Edge Cases

- [X] T060 [P] Test invalid menu choices: `uv run pytest tests/integration/test_menu_flow.py::test_error_handling -v`
- [X] T061 [P] Test empty input handling: `uv run pytest tests/unit/test_utils.py::test_sanitize_input -v`
- [X] T062 [P] Test long title wrapping: `uv run pytest tests/unit/test_utils.py::test_wrap_text -v`
- [X] T063 [P] Test task not found scenarios: `uv run pytest tests/integration/test_menu_flow.py::test_task_not_found -v`

### Performance & Integration

- [X] T064 Verify performance targets: Manual timing of operations
- [X] T065 Run full test suite: `uv run pytest tests/ -v --cov=backend/src/backend`
- [X] T066 Verify 85%+ coverage: `uv run pytest --cov-report=html --cov=backend/src/backend`

### Documentation & Cleanup

- [X] T067 Update README with new menu interface instructions
- [X] T068 Remove old command parser tests: `rm tests/unit/test_cli.py` (if exists)
- [X] T069 Verify no console.log or debug code remains
- [X] T070 Final manual end-to-end test of all 7 menu options

---

## Parallel Execution Examples

### Phase 2 (Foundational) - Maximum Parallelism
```bash
# Terminal 1: UI Constants
uv run pytest tests/unit/test_utils.py::test_create_box -v

# Terminal 2: Validation Functions
uv run pytest tests/unit/test_utils.py::test_validate_menu_choice -v

# Terminal 3: Core Display
uv run pytest tests/unit/test_ui.py::test_display_header -v
```

### Phase 3 (US1) - Menu Components
```bash
# Terminal 1: Menu Display
uv run pytest tests/unit/test_menu.py::test_menu_routing -v

# Terminal 2: Add Task UI
uv run pytest tests/unit/test_ui.py::test_display_add_form -v

# Terminal 3: Help & Exit
uv run pytest tests/unit/test_ui.py::test_display_help -v
```

### Phase 5 (US3) - Confirmation Dialogs
```bash
# Terminal 1: Toggle Confirmation
uv run pytest tests/integration/test_menu_flow.py::test_toggle_task_flow -v

# Terminal 2: Delete Confirmation
uv run pytest tests/integration/test_menu_flow.py::test_delete_task_flow -v

# Terminal 3: Update Flow
uv run pytest tests/integration/test_menu_flow.py::test_update_task_flow -v
```

---

## MVP Scope Recommendation

**Minimum Viable Product**: Complete Phase 3 (User Story 1 - P1)

**Delivers**:
- ✅ Visual menu with 7 options
- ✅ Zero command memorization required
- ✅ Task creation via guided prompts
- ✅ Help and exit functionality
- ✅ Professional visual appearance

**User Value**: First-time users can immediately use the application without reading documentation.

**Next Steps After MVP**: Phase 4 (US2) adds visual task management, Phase 5 (US3) adds safety features.

---

## Task Completion Validation

**Format Compliance**: All 70 tasks follow the required checklist format:
- ✅ Checkbox prefix: `- [ ]`
- ✅ Sequential Task ID: T001-T070
- ✅ [P] markers for parallelizable tasks (12 total)
- ✅ [US1], [US2], [US3] labels for story-specific tasks
- ✅ Clear file paths in descriptions

**Independent Testability**: Each phase has clear acceptance criteria and test commands.

**Constitution Compliance**: All tasks preserve existing TaskManager service layer, maintaining MCP readiness for future phases.