# Tasks: Advanced Task Features

**Input**: Design documents from `/specs/010-features/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml

**Tests**: Integration tests defined per quickstart.md. Unit tests at developer discretion.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `phase-5/backend/src/`, `phase-5/frontend/src/`
- Paths shown below use the web application structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and prepare development environment

- [X] T001 Add python-dateutil dependency to phase-5/backend/pyproject.toml for recurring date calculation
- [X] T002 [P] Verify database connection and SSL settings in phase-5/backend/.env for Neon PostgreSQL

**Checkpoint**: Dependencies ready, database accessible

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Create database migration SQL in phase-5/backend/migrations/002_phase5_features.sql with task table extensions, audit_logs table, and notifications table
- [X] T004 [P] Create AuditLog model with EventType enum in phase-5/backend/src/backend/models/audit_log.py
- [X] T005 [P] Create Notification model with response schemas in phase-5/backend/src/backend/models/notification.py
- [X] T006 Extend Task model in phase-5/backend/src/backend/models/task.py with recurring_rule, recurring_end_date, parent_task_id, reminder_at, reminder_sent, tags fields
- [X] T007 Update TaskCreate and TaskUpdate Pydantic models in phase-5/backend/src/backend/models/task.py to include new optional fields
- [X] T008 Update to_dict() method in phase-5/backend/src/backend/models/task.py to serialize new fields
- [X] T009 Update TaskResponse.from_task() in phase-5/backend/src/backend/models/task.py to include new fields in responses
- [X] T010 Create AuditService in phase-5/backend/src/backend/services/audit_service.py with log_event() method and stderr fallback
- [X] T011 Create NotificationService in phase-5/backend/src/backend/services/notification_service.py with create(), list(), and mark_read() methods
- [X] T012 Create ReminderService in phase-5/backend/src/backend/services/reminder_service.py with asyncio scheduler and process_due_reminders() method

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Recurring Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can create tasks that automatically repeat on a schedule without manually recreating them

**Independent Test**: Create a daily recurring task, mark it complete, and verify the next instance is automatically created with the correct due date

### Implementation for User Story 1

- [X] T013 [P] [US1] Add _calculate_next_due_date() method using dateutil.relativedelta in phase-5/backend/src/backend/services/task_service.py
- [X] T014 [US1] Add create_next_recurring_task() method in phase-5/backend/src/backend/services/task_service.py that checks recurring_end_date and creates next instance
- [X] T015 [US1] Modify toggle() method in phase-5/backend/src/backend/services/task_service.py to call create_next_recurring_task() when completing recurring tasks
- [X] T016 [US1] Add validation in phase-5/backend/src/backend/services/task_service.py create() method to require due_date when recurring_rule is set
- [X] T017 [US1] Add validation in phase-5/backend/src/backend/services/task_service.py to ensure recurring_end_date is after due_date
- [X] T018 [US1] Update create_task() route in phase-5/backend/src/backend/routes/tasks.py to accept recurring_rule, recurring_end_date parameters
- [X] T019 [US1] Update update_task() route in phase-5/backend/src/backend/routes/tasks.py to accept recurring_rule, recurring_end_date parameters
- [X] T025 [P] [US1] Add recurring_rule, recurring_end_date, parent_task_id to Task interface in phase-5/frontend/src/types/task.ts
- [X] T026 [US1] Add recurring_rule, recurring_end_date parameters to create_task tool in phase-5/backend/task_serves_mcp_tools.py
- [X] T020 [US1] Add recurring_rule dropdown to phase-5/frontend/src/components/tasks/TaskForm.tsx with options: daily, weekly, monthly, yearly
- [X] T021 [US1] Add recurring end date picker to phase-5/frontend/src/components/tasks/TaskForm.tsx
- [X] T022 [US1] Add validation in phase-5/frontend/src/components/tasks/TaskForm.tsx to require due_date when recurring_rule is selected
- [X] T023 [US1] Add validation in phase-5/frontend/src/components/tasks/TaskForm.tsx to ensure recurring_end_date is after due_date
- [X] T024 [P] [US1] Display 🔄 recurring indicator in phase-5/frontend/src/components/tasks/TaskItem.tsx when recurring_rule is set

**Checkpoint**: User Story 1 complete - recurring tasks fully functional and testable independently

---

## Phase 4: User Story 2 - Due Dates & Reminders (Priority: P2)

**Goal**: Users can set optional reminder times for tasks and receive in-app notifications when reminders are due

**Independent Test**: Create a task with reminder_at in the near future, wait for that time, and verify a notification is created in the database

### Implementation for User Story 2

- [X] T027 [P] [US2] Update create_task() route in phase-5/backend/src/backend/routes/tasks.py to accept reminder_at parameter
- [X] T028 [P] [US2] Update update_task() route in phase-5/backend/src/backend/routes/tasks.py to accept reminder_at parameter
- [X] T029 [US2] Integrate AuditService with TaskService in phase-5/backend/src/backend/services/task_service.py for audit logging on task operations
- [X] T030 [US2] Call audit_service.log_event(TASK_CREATED) in phase-5/backend/src/backend/routes/tasks.py after task creation
- [X] T031 [US2] Call audit_service.log_event(TASK_UPDATED) in phase-5/backend/src/backend/routes/tasks.py on task updates
- [X] T032 [US2] Call audit_service.log_event(TASK_COMPLETED) in phase-5/backend/src/backend/routes/tasks.py on task completion
- [X] T033 [US2] Call audit_service.log_event(TASK_DELETED) in phase-5/backend/src/backend/routes/tasks.py before task deletion
- [X] T034 [P] [US2] Update toggle_complete() route in phase-5/backend/src/backend/routes/tasks.py to integrate recurring task logic
- [X] T035 [US2] Integrate NotificationService and AuditService in phase-5/backend/src/backend/services/notification_service.py constructor
- [X] T036 [US2] Create notifications router in phase-5/backend/src/backend/routes/notifications.py with GET /notifications endpoint
- [X] T037 [US2] Add POST /notifications/{id}/read endpoint to phase-5/backend/src/backend/routes/notifications.py for marking notifications as read
- [X] T038 [US2] Create NotificationPanel component in phase-5/frontend/src/components/notifications/NotificationPanel.tsx with bell icon and dropdown
- [X] T039 [P] [US2] Create NotificationItem component in phase-5/frontend/src/components/notifications/NotificationItem.tsx for single notification display
- [X] T040 [US2] Add notification bell icon to phase-5/frontend/src/components/layout/Header.tsx with unread count badge
- [X] T041 [P] [US2] Add reminder_at field to Task interface in phase-5/frontend/src/types/task.ts
- [X] T042 [US2] Add reminder datetime picker to phase-5/frontend/src/components/tasks/TaskForm.tsx
- [X] T043 [P] [US2] Display 🔔 reminder indicator in phase-5/frontend/src/components/tasks/TaskItem.tsx when reminder_at is set
- [X] T044 [US2] Add reminder_at parameter to create_task tool in phase-5/backend/task_serves_mcp_tools.py
- [X] T045 [US2] Add reminder_at parameter to update_task tool in phase-5/backend/task_serves_mcp_tools.py
- [X] T046 [US2] Integrate ReminderService with NotificationService in phase-5/backend/src/backend/main.py lifespan startup
- [X] T047 [US2] Add await reminder_service.start() call to phase-5/backend/src/backend/main.py lifespan startup
- [X] T048 [US2] Add await reminder_service.stop() call to phase-5/backend/src/backend/main.py lifespan shutdown
- [X] T049 [US2] Include notifications router in phase-5/backend/src/backend/main.py via app.include_router()
- [X] T050 [US2] Include audit router in phase-5/backend/src/backend/main.py via app.include_router()
- [X] T051 [P] [US2] Add NotificationResponse and AuditLogResponse interfaces to phase-5/frontend/src/lib/api/types.ts
- [X] T052 [P] [US2] Add create notification API call to phase-5/frontend/src/lib/api/todos.ts
- [X] T053 [P] [US2] Add mark notification as read API call to phase-5/frontend/src/lib/api/todos.ts

**Checkpoint**: User Story 2 complete - reminders and notifications fully functional

---

## Phase 5: User Story 3 - Tags (Priority: P3)

**Goal**: Users can add custom labels to tasks for organization and filtering

**Independent Test**: Create a task with multiple tags, then filter/search by those tags to verify the task appears in results

### Implementation for User Story 3

- [X] T054 [P] [US3] Add tags input (comma-separated) to phase-5/frontend/src/components/tasks/TaskForm.tsx
- [X] T055 [P] [US3] Create TagBadge component in phase-5/frontend/src/components/tasks/TagBadge.tsx for displaying tags as colored pills
- [X] T056 [US3] Add tags array display to phase-5/frontend/src/components/tasks/TaskItem.tsx using TagBadge components
- [X] T057 [P] [US3] Add tags field to Task interface in phase-5/frontend/src/types/task.ts
- [X] T058 [US3] Add tags parameter to create_task tool in phase-5/backend/task_serves_mcp_tools.py
- [X] T059 [US3] Add tags parameter to update_task tool in phase-5/backend/task_serves_mcp_tools.py
- [X] T060 [US3] Update create_task() route in phase-5/backend/src/backend/routes/tasks.py to accept tags parameter (comma-separated to JSONB array)
- [X] T061 [US3] Update update_task() route in phase-5/backend/src/backend/routes/tasks.py to accept tags parameter (comma-separated to JSONB array)
- [X] T062 [US3] Add tag filter query parameter support to get_tasks() route in phase-5/backend/src/backend/routes/tasks.py
- [X] T063 [US3] Implement tag filtering logic in phase-5/backend/src/backend/services/task_service.py list() method using JSONB @> operator
- [X] T064 [US3] Add tag filter dropdown to phase-5/frontend/src/components/tasks/TaskFilters.tsx
- [X] T065 [US3] Update search in phase-5/backend/src/backend/services/task_service.py list() method to include tags field in ILIKE search

**Checkpoint**: User Story 3 complete - tags fully functional for organization and filtering

---

## Phase 6: User Story 4 - Audit Trail (Priority: P4)

**Goal**: All task operations are logged with timestamps, user context, and data snapshots

**Independent Test**: Perform various task operations and then query the audit log to verify each operation was captured

### Implementation for User Story 4

- [X] T066 [P] [US4] Create audit router in phase-5/backend/src/backend/routes/audit.py with GET /audit endpoint
- [X] T067 [US4] Add query parameters (limit, event_type) to GET /audit endpoint in phase-5/backend/src/backend/routes/audit.py
- [X] T068 [US4] Implement audit log retrieval with pagination in phase-5/backend/src/backend/routes/audit.py ordered by timestamp desc
- [X] T069 [P] [US4] Add audit log data fetching API call to phase-5/frontend/src/lib/api/todos.ts

**Checkpoint**: User Story 4 complete - audit trail fully functional for all task operations

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

**Status**: Backend complete, Frontend UI components remaining

- [ ] T070 [P] Create integration tests in phase-5/backend/tests/test_phase5_features.py for recurring task creation and next-instance generation
- [ ] T071 [P] Create integration test in phase-5/backend/tests/test_phase5_features.py for reminder creation and notification generation
- [ ] T072 [P] Create integration test in phase-5/backend/tests/test_phase5_features.py for tag filtering
- [ ] T073 [P] Create integration test in phase-5/backend/tests/test_phase5_features.py for audit log verification
- [ ] T074 [P] Create integration test in phase-5/backend/tests/test_phase5_features.py for missed reminder recovery on scheduler startup
- [ ] T075 Run quickstart.md validation per phase-5/specs/010-features/quickstart.md
- [ ] T076 [P] Manually test recurring task creation per quickstart.md Step 5.1
- [ ] T077 [P] Manually test reminder triggering per quickstart.md Step 5.2
- [ ] T078 [P] Manually test tag filtering per quickstart.md Step 5.3
- [ ] T079 [P] Manually test audit log per quickstart.md Step 5.4

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1) can start after Foundational - No dependencies on other stories
  - User Story 2 (P2) can start after Foundational - Integrates with US1 but independently testable
  - User Story 3 (P3) can start after Foundational - Integrates with existing components
  - User Story 4 (P4) can start after Foundational - Integrates with all task operations
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Recurring Tasks**: Independent after Foundational phase
- **User Story 2 (P2) - Reminders**: Integrates with US1 (TaskService modifications) but independently testable
- **User Story 3 (P3) - Tags**: Independent after Foundational phase
- **User Story 4 (P4) - Audit Trail**: Integrates with all task operations but independently testable

### Within Each User Story

- Models before services
- Services before endpoints/routes
- Backend before frontend (for type safety)
- Core implementation before integration

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T001, T002 can run in parallel

**Foundational Phase (Phase 2)**:
- T004, T005, T006 can run in parallel (different model files)
- T007, T008, T009 can run in parallel (same file, sequential within file)

**User Story 1 (Phase 3)**:
- T020, T021, T022 can run in parallel (frontend form)
- T024, T025 can run in parallel (frontend)
- T013, T014, T015, T016, T017 must be sequential (service logic dependencies)

**User Story 2 (Phase 4)**:
- T027, T028, T034 can run in parallel (routes, same file, sequential within file)
- T038, T039, T040 can run in parallel (different frontend files)
- T041, T042, T043 can run in parallel (frontend)
- T044, T045 can run in parallel (MCP tools)

**User Story 3 (Phase 5)**:
- T054, T055, T056 can run in parallel (frontend components)
- T058, T059 can run in parallel (MCP tools)

**User Story 4 (Phase 6)**:
- T066, T067, T068 must be sequential (same file, logic dependencies)

**Polish Phase (Phase 7)**:
- T070-T074 can run in parallel (different test cases)
- T076-T079 can run in parallel (manual testing)

---

## Parallel Example: User Story 1

```bash
# Launch frontend components together (after backend models are complete):
Task: "Add recurring_rule dropdown to phase-5/frontend/src/components/tasks/TaskForm.tsx with options: daily, weekly, monthly, yearly"
Task: "Add recurring end date picker to phase-5/frontend/src/components/tasks/TaskForm.tsx"
Task: "Add validation in phase-5/frontend/src/components/tasks/TaskForm.tsx to require due_date when recurring_rule is selected"

# Launch visual indicator updates together:
Task: "Display 🔄 recurring indicator in phase-5/frontend/src/components/tasks/TaskItem.tsx when recurring_rule is set"
Task: "Add recurring_rule, recurring_end_date, parent_task_id to Task interface in phase-5/frontend/src/types/task.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Recurring Tasks)
   - Developer B: User Story 2 (Reminders)
   - Developer C: User Story 3 (Tags)
3. Developer D: User Story 4 (Audit Trail) after task routes are stable
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Database migration (T003) must be run before any backend code changes
- Background scheduler (T046-T047) must be tested carefully to ensure proper startup/shutdown
- All tasks use absolute paths from repository root: phase-5/backend/ or phase-5/frontend/
