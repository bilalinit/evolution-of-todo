# ADR-002: Architecture Evolution Approach

> **Scope**: Decision cluster for progressive architecture evolution from simple Phase I to complex Phase II+ system.

- **Status:** Accepted
- **Date:** 2025-12-28
- **Feature:** 001-cli-todo
- **Context**: Need to deliver Phase I CLI quickly while ensuring smooth path to Phase II database + web frontend

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

**Phase I Architecture (Current)**:
- **Structure**: Package-based with clear layering
  - `models.py`: Dataclass definitions
  - `services.py`: Business logic (TaskManager)
  - `cli.py`: Interface layer
  - `utils.py`: Helpers
- **Dependencies**: Minimal (Pydantic + UV only)
- **Testing**: Unit tests + integration tests
- **No Database**: In-memory storage only

**Phase II Architecture (Future)**:
- **Structure**: Same package structure, enhanced capabilities
  - `models.py`: SQLModel entities (add `user_id`)
  - `services.py`: Same interface, database backend
  - `cli.py`: Unchanged (interface compatibility)
  - `utils.py`: Enhanced with auth helpers
- **Dependencies**: Add SQLModel, database drivers
- **Testing**: Add database integration tests
- **Database**: SQLite → PostgreSQL migration path

**Evolution Principles**:
1. **Backward Compatibility**: Service layer interface preserved
2. **Incremental Enhancement**: Add, don't replace
3. **Clear Boundaries**: Layer separation maintained
4. **Migration Ready**: Data conversion strategy defined

## Consequences

### Positive
- **Speed**: Phase I delivered quickly without infrastructure overhead
- **Quality**: Clean architecture enables reliable testing
- **Flexibility**: Easy to pivot based on Phase I feedback
- **Future-Proof**: Package structure supports Phase II expansion
- **Team Learning**: Developers learn system before adding complexity

### Negative
- **Migration Effort**: Phase II requires data model changes
- **Temporary Debt**: Some Phase I patterns will need refactoring
- **Delayed Validation**: Database concerns not tested until Phase II
- **User Impact**: Phase I users lose data between sessions

## Alternatives Considered

**Alternative A: Database from Start**
- **Approach**: Use SQLModel + SQLite immediately
- **Why Rejected**: User requirement for Phase I simplicity, slower development

**Alternative B: Flat Structure**
- **Approach**: Single file or minimal structure
- **Why Rejected**: Limits Phase II expansion, violates separation of concerns

**Alternative C: Microservices from Start**
- **Approach**: Separate CLI, API, and services immediately
- **Why Rejected**: Over-engineering for Phase I, unnecessary complexity

## References

- Feature Spec: [specs/001-cli-todo/spec.md](../specs/001-cli-todo/spec.md)
- Implementation Plan: [specs/001-cli-todo/plan.md](../specs/001-cli-todo/plan.md)
- Research: [specs/001-cli-todo/research.md](../specs/001-cli-todo/research.md)
- Related ADRs: ADR-001, ADR-003
- Evaluator Evidence: [history/prompts/001-cli-todo/3-plan-cli-todo.plan.prompt.md](../history/prompts/001-cli-todo/3-plan-cli-todo.plan.prompt.md)
