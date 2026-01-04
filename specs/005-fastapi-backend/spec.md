# Feature Specification: FastAPI Backend for Todo App

**Feature Branch**: `005-fastapi-backend`
**Created**: 2025-12-31
**Status**: Draft
**Input**: User description: "name the new branch "005-fastapi-backend" and here are the specs: # Feature Specification: FastAPI Backend for Todo App"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Tasks (Priority: P1) 🎯 MVP

A logged-in user wants to see all their tasks with filtering and sorting options.

**Why this priority**: Core MVP functionality - without viewing tasks, no other features matter.

**Independent Test**: Login on frontend → Navigate to /tasks → See task list from backend

**Acceptance Scenarios**:

1. **Given** user is logged in, **When** they access /tasks, **Then** they see their tasks sorted by creation date
2. **Given** user has tasks, **When** they filter by status=completed, **Then** only completed tasks appear
3. **Given** user has tasks, **When** they search "meeting", **Then** only tasks containing "meeting" appear

---

### User Story 2 - Create Task (Priority: P1) 🎯 MVP

A logged-in user wants to create a new task to track their work.

**Why this priority**: Core MVP - users need to add tasks to the system.

**Independent Test**: Click "Add Task" → Fill form → Submit → New task appears in list

**Acceptance Scenarios**:

1. **Given** user is on tasks page, **When** they submit a new task, **Then** task is created with their user_id
2. **Given** user submits task, **When** title is missing, **Then** validation error returned
3. **Given** user creates task, **When** request succeeds, **Then** 201 status with task object returned

---

### User Story 3 - Update Task (Priority: P1) 🎯 MVP

A logged-in user wants to edit an existing task to update details or mark as complete.

**Why this priority**: Core MVP - users need to modify their tasks.

**Independent Test**: Click task → Edit details → Save → Changes persisted

**Acceptance Scenarios**:

1. **Given** user owns a task, **When** they update it, **Then** changes are saved
2. **Given** user tries to update another user's task, **When** request is made, **Then** 403 Forbidden returned
3. **Given** user toggles completion, **When** /complete endpoint called, **Then** completed status flips

---

### User Story 4 - Delete Task (Priority: P2)

A logged-in user wants to delete a task they no longer need.

**Why this priority**: Important but not MVP-critical - users can live without delete initially.

**Independent Test**: Click delete on task → Confirm → Task removed from list

**Acceptance Scenarios**:

1. **Given** user owns a task, **When** they delete it, **Then** task is removed
2. **Given** user tries to delete another user's task, **When** request is made, **Then** 403 Forbidden

---

### User Story 5 - View Profile Stats (Priority: P3)

A logged-in user wants to see their profile with task statistics.

**Why this priority**: Nice-to-have feature, doesn't block core task management.

**Independent Test**: Navigate to /profile → See total/completed/pending task counts

**Acceptance Scenarios**:

1. **Given** user has tasks, **When** they view profile, **Then** stats show correct counts

---

### Edge Cases

- What happens when JWT token is expired? → 401 Unauthorized
- What happens when user_id in URL doesn't match JWT? → 403 Forbidden
- What happens when task_id doesn't exist? → 404 Not Found
- What happens when database connection fails? → 500 with error message

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST verify JWT tokens using shared BETTER_AUTH_SECRET
- **FR-002**: System MUST extract user_id from JWT and validate against URL user_id
- **FR-003**: System MUST only return tasks belonging to the authenticated user
- **FR-004**: System MUST support filtering by status, priority, category
- **FR-005**: System MUST support full-text search in title and description
- **FR-006**: System MUST support sorting by created_at, due_date, priority, title
- **FR-007**: System MUST validate task data before creation/update
- **FR-008**: System MUST use existing Neon PostgreSQL database (shared with Better Auth)
- **FR-009**: System MUST run on port 8000 (frontend configured to this)

### Key Entities

- **Task**: Core entity with id, title, description, completed, priority, category, due_date, user_id, created_at, updated_at
- **User**: Read-only - exists in Better Auth's "user" table (id, name, email, created_at)

## Data Models & API Contracts

### Key Data Structures

**Task Data**:
- Unique identifier
- Title (1-200 characters)
- Description (optional, up to 1000 characters)
- Completion status (default: not completed)
- Priority level (low/medium/high)
- Category (work/personal/shopping/health/other)
- Due date (optional)
- Owner identifier
- Creation and update timestamps

**User Profile Data**:
- User information (read-only from existing user system)
- Task statistics (total, completed, pending counts)

**Response Formats**:
- Task lists include pagination metadata and counts
- Single task responses include the task object
- Profile responses include user info and statistics
- Error responses include error code, message, and field-level details

### API Contract Requirements

The system must provide endpoints that support:

1. **Task Management**: Create, read, update, delete tasks
2. **Task Filtering**: Filter by status, priority, category
3. **Task Search**: Full-text search in title and description
4. **Task Sorting**: Sort by creation date, due date, priority, title
5. **Profile Statistics**: View user profile with task metrics

**Authentication**: All endpoints must verify user identity and ensure users can only access their own data.

**Error Handling**: System must return appropriate HTTP status codes and descriptive error messages for validation failures, unauthorized access, and missing resources.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view their complete task list with filtering and search capabilities
- **SC-002**: Users can create, update, and delete their own tasks through the interface
- **SC-003**: System prevents unauthorized access to other users' tasks
- **SC-004**: Task filtering returns correct subsets based on user criteria
- **SC-005**: Profile view displays accurate task statistics
- **SC-006**: All API responses match expected data formats for frontend integration
