# ADR-001: Phase I Storage Strategy

> **Scope**: Decision cluster for storage approach, including data persistence strategy and migration path.

- **Status:** Accepted
- **Date:** 2025-12-28
- **Feature:** 001-cli-todo
- **Context:** User requirement for Phase I CLI: "only be a in-memory todo app, not in any databases yet. we will add those in the second phase."

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

**Phase I (CLI)**: Use Python `dataclass` with in-memory `list[Task]` storage
- **Storage**: Global list variable in TaskManager
- **Data Model**: Simple `@dataclass` with no ORM dependencies
- **Scope**: Single-user, session-only (data lost on app exit)
- **Validation**: Pydantic schemas for input validation

**Phase II (Future)**: Migrate to SQLModel + SQLite/PostgreSQL
- **Migration**: Replace `list[Task]` with database queries
- **Add**: `user_id` field for multi-user support
- **Preserve**: Same service layer interface
- **Timeline**: After Phase I CLI is complete and tested

**Technology Stack**:
- **Phase I**: Python 3.13+, Pydantic, UV package manager
- **Phase II**: Add SQLModel, database connection, user authentication

## Consequences

### Positive
- **Simplicity**: No database setup, schema migrations, or external dependencies
- **Speed**: Instant startup, zero connection overhead, fast operations
- **Focus**: Development concentrates on CLI functionality, not infrastructure
- **Testability**: Easy unit testing without database fixtures
- **User Requirement**: Directly satisfies Phase I specification

### Negative
- **Constitution Violation**: Temporary waiver of Principle III (Strict Statelessness)
- **Data Loss**: Tasks lost when application exits (by design for Phase I)
- **Migration Complexity**: Phase II will require data migration and code changes
- **No Persistence**: Users must re-enter tasks each session
- **Limited Scope**: Single-user only, no multi-user support

## Alternatives Considered

**Alternative A: SQLite from Start**
- **Approach**: Use SQLModel + SQLite for Phase I
- **Why Rejected**: User requirement explicitly stated "not in any databases yet"

**Alternative B: JSON File Storage**
- **Approach**: Save tasks to local JSON file
- **Why Rejected**: Violates "in-memory only" requirement, adds persistence complexity

**Alternative C: SQLModel with In-Memory SQLite**
- **Approach**: Use SQLModel but with in-memory SQLite database
- **Why Rejected**: Overkill for Phase I, adds ORM overhead without benefit

## References

- Feature Spec: [specs/001-cli-todo/spec.md](../specs/001-cli-todo/spec.md)
- Implementation Plan: [specs/001-cli-todo/plan.md](../specs/001-cli-todo/plan.md)
- Research: [specs/001-cli-todo/research.md](../specs/001-cli-todo/research.md)
- Related ADRs: ADR-002, ADR-003
- Evaluator Evidence: [history/prompts/001-cli-todo/3-plan-cli-todo.plan.prompt.md](../history/prompts/001-cli-todo/3-plan-cli-todo.plan.prompt.md)
