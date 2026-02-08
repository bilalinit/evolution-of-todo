# Feature Specification: Event-Driven Microservices with Dapr

**Feature Branch**: `011-microservices-dapr`
**Created**: 2026-02-04
**Status**: Draft
**Input**: User description: "name the new branch '011-microservices-dapr' and here are the specs: Transform the monolithic todo application into an event-driven microservices architecture using Dapr runtime, implementing real-time task synchronization across devices, automatic recurring task generation, reminder notifications, and audit logging with at-least-once event delivery guarantees"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time Task Updates Across Devices (Priority: P1)

As a user managing tasks across multiple devices, I want my task changes to appear instantly on all my connected sessions so I never work with stale data.

**Why this priority**: Core value proposition - real-time synchronization is the primary benefit of the event-driven architecture. Without this, there's no visible improvement over the monolith.

**Independent Test**: Create a task on Device A while having Device B open; verify the task appears on Device B within 2 seconds without manual refresh.

**Acceptance Scenarios**:

1. **Given** I have two browser tabs open, **When** I create a task in Tab A, **Then** the task appears in Tab B within 2 seconds
2. **Given** I complete a task on mobile, **When** I check my desktop, **Then** the task shows as completed without refresh
3. **Given** I delete a task, **When** other sessions receive the event, **Then** the task is removed from all views

---

### User Story 2 - Automatic Recurring Task Generation (Priority: P1)

As a user with recurring tasks (daily standup, weekly reports), I want the system to automatically create the next occurrence when I complete the current one, so I never miss a scheduled task.

**Why this priority**: Automation of repetitive task management is a key productivity feature that directly benefits users and demonstrates microservices independence.

**Independent Test**: Complete a recurring task and verify a new task with the next due date is created within 5 seconds.

**Acceptance Scenarios**:

1. **Given** I have a daily recurring task, **When** I mark it complete, **Then** a new task for tomorrow is automatically created
2. **Given** I have a weekly recurring task due Monday, **When** I complete it, **Then** a new task for next Monday appears
3. **Given** the recurring service is temporarily unavailable, **When** it comes back online, **Then** it processes any missed completions

---

### User Story 3 - Timely Reminder Notifications (Priority: P2)

As a busy user, I want to receive notifications when my task reminders are due, so I don't miss important deadlines.

**Why this priority**: Reminders enhance task management but are secondary to core task operations. Users can still manage tasks without reminders.

**Independent Test**: Set a reminder for 1 minute in the future; verify notification appears at the correct time.

**Acceptance Scenarios**:

1. **Given** I set a reminder for a task at 3:00 PM, **When** the time reaches 3:00 PM, **Then** I receive a notification
2. **Given** I'm actively using the app, **When** a reminder is due, **Then** I see an in-app notification immediately
3. **Given** multiple reminders are due at the same time, **When** processed, **Then** all notifications are delivered

---

### User Story 4 - Complete Audit Trail (Priority: P2)

As a team lead or compliance officer, I want a complete history of all task changes, so I can track who did what and when for accountability purposes.

**Why this priority**: Audit logging is essential for enterprise use cases but doesn't block core functionality for individual users.

**Independent Test**: Perform CRUD operations on tasks; verify all events are logged with timestamps and user IDs.

**Acceptance Scenarios**:

1. **Given** a user creates a task, **When** the audit service receives the event, **Then** a log entry is recorded with user ID, timestamp, and task details
2. **Given** a task is updated, **When** querying audit logs, **Then** both old and new values are visible
3. **Given** a task is deleted, **When** reviewing audit history, **Then** the deletion event and who deleted it are recorded

---

### User Story 5 - Resilient Service Operation (Priority: P3)

As a system administrator, I want individual services to fail gracefully without bringing down the entire application, so users experience minimal disruption.

**Why this priority**: Infrastructure resilience is important for production readiness but users don't directly interact with this capability.

**Independent Test**: Stop the audit-service; verify task creation still works and events are processed when service recovers.

**Acceptance Scenarios**:

1. **Given** the notification-service is down, **When** I create tasks, **Then** task creation succeeds and notifications are queued
2. **Given** a service crashes and restarts, **When** it comes back online, **Then** it processes pending events without duplicates
3. **Given** high load on one service, **When** events are published, **Then** other services continue operating normally

---

### Edge Cases

- What happens when the message broker is unavailable?
- How does the system handle duplicate events (idempotency)?
- What happens when a reminder is set in the past?
- How does the system behave when database connection fails mid-transaction?
- What happens when a user completes a task while offline?
- What happens when multiple services fail simultaneously?
- How are events ordered when multiple users modify the same task concurrently?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST publish events to message broker topics when tasks are created, updated, completed, or deleted
- **FR-002**: System MUST process events asynchronously without blocking the main API response
- **FR-003**: System MUST guarantee at-least-once delivery of events to all subscribed services
- **FR-004**: System MUST deduplicate events using idempotency keys to prevent duplicate processing
- **FR-005**: System MUST automatically create next recurring task when a recurring task is completed
- **FR-006**: System MUST check for due reminders every minute using scheduled bindings
- **FR-007**: System MUST broadcast task updates to connected WebSocket clients in real-time
- **FR-008**: System MUST log all task events to the audit service with full context
- **FR-009**: System MUST maintain authentication across all microservices using shared JWT validation
- **FR-010**: Frontend MUST route all API calls through API routes to service sidecars
- **FR-011**: System MUST queue events when message broker is temporarily unavailable
- **FR-012**: System MUST handle reminder processing for tasks with past due dates gracefully
- **FR-013**: System MUST preserve event order per task to prevent race conditions
- **FR-014**: Services MUST implement circuit breakers for downstream service calls
- **FR-015**: System MUST provide health endpoints for all microservices

### Key Entities

- **Task**: Core entity with title, description, priority, due date, reminder, recurrence pattern, and completion status
- **Event**: Published message containing event type, payload, timestamp, user ID, and idempotency key
- **Notification**: Generated alert with message, type, read status, and link to related task
- **AuditLog**: Immutable record of system changes with actor, action, entity, old values, new values, and timestamp
- **ProcessedEvent**: Tracking table for idempotency containing event ID, service name, and processing timestamp
- **WebSocketConnection**: Active client connection mapping for real-time broadcasts per user

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All service components run successfully with sidecar containers
- **SC-002**: Task creation returns success response within 500ms while events are processed asynchronously
- **SC-003**: Real-time updates appear on connected clients within 2 seconds of the originating action
- **SC-004**: Recurring tasks are created within 5 seconds of completing the parent task
- **SC-005**: Reminders are processed within 60 seconds of their due time
- **SC-006**: No direct service-to-service calls exist in primary API (only event publishing)
- **SC-007**: System continues operating when any single microservice is unavailable
- **SC-008**: Zero duplicate processing when the same event is delivered multiple times
- **SC-009**: All task events are captured in audit logs with 100% accuracy
- **SC-010**: Deployment succeeds with single command per service

### Non-Functional Requirements

- **Reliability**: System maintains 99.5% uptime during individual service failures
- **Performance**: Event processing latency remains under 100ms at 100 events/second
- **Scalability**: System supports horizontal scaling of individual services based on load
- **Observability**: All services expose metrics for event throughput, processing latency, and error rates

## Out of Scope

- Multi-region deployment or disaster recovery across data centers
- Message broker clustering and high-availability configuration
- Advanced retry policies with exponential backoff configuration
- Event schema evolution and backward compatibility strategies
- Dead letter queue processing and manual intervention workflows
- WebSocket reconnection strategies beyond basic exponential backoff
- Rate limiting and quota management per user
- Event replay and time-travel debugging capabilities
- Service mesh advanced features (traffic shifting, canary deployments)
- Complex recurrence patterns beyond daily/weekly/monthly intervals

## Assumptions

- Message broker (Redpanda) runs as a single-instance deployment for development
- JWT tokens contain user ID in a standard claim for authentication propagation
- Database connections use connection pooling with appropriate limits
- Events are JSON-encoded with consistent schema across services
- Clock synchronization exists across all service containers
- Network latency between services is under 10ms in local deployment
- Users primarily interact through web browser clients
- Task recurrence follows simple patterns (daily, weekly, monthly) without complex exceptions

## Dependencies

- Existing monolithic todo application with task CRUD operations
- Working authentication system issuing JWT tokens
- Container orchestration platform (Minikube) available for deployment
- Message broker software compatible with Kafka protocol
- PostgreSQL database for persistent data storage
- Existing frontend framework with WebSocket support
