# ADR-003: Constitution Exception Management

> **Scope**: Decision cluster for managing Constitutional compliance exceptions during phased development.

- **Status:** Accepted
- **Date:** 2025-12-28
- **Feature:** 001-cli-todo
- **Context**: User requirement for in-memory storage conflicts with Constitution Principle III (Strict Statelessness)

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

**Constitution Principle III Violation**:
- **Principle**: "All state must be persisted immediately to the database (Neon PostgreSQL)"
- **Violation**: Phase I uses in-memory storage (no database)
- **Scope**: Phase I CLI only, single-user, local development

**Exception Management Framework**:
1. **Documentation**: This ADR serves as formal exception record
2. **Time-Bound**: Exception expires at Phase II implementation
3. **Justification**: User requirement + development velocity
4. **Re-evaluation**: Must be revisited before Phase II merge
5. **Migration Path**: Clear database transition strategy defined

**Compliance in Other Areas**:
- ✅ **Principle I**: Logic decoupled (models/services/cli separation)
- ✅ **Principle II**: MCP-ready architecture (services can be exposed)
- ✅ **Principle IV**: Sync operations acceptable for CLI context
- ✅ **Principle V**: Ready for user scoping (interface designed for it)

## Consequences

### Positive
- **Development Speed**: No Constitutional compliance overhead in Phase I
- **User Satisfaction**: Meets explicit Phase I requirements
- **Focus**: Team concentrates on core functionality first
- **Learning**: Understand system before adding Constitutional complexity
- **Flexibility**: Can adjust Constitutional approach based on Phase I feedback

### Negative
- **Temporary Non-Compliance**: System is not Constitution-compliant during Phase I
- **Documentation Burden**: Must maintain exception records
- **Re-evaluation Risk**: Phase II may require significant changes
- **Team Confusion**: New members may question Constitutional commitment
- **Technical Debt**: Phase II must address compliance gap

## Alternatives Considered

**Alternative A: Constitutional Compliance from Start**
- **Approach**: Use SQLite immediately to satisfy Principle III
- **Why Rejected**: User requirement for no databases in Phase I

**Alternative B: Constitutional Waiver for Entire Project**
- **Approach**: Abandon Constitutional principles for this feature
- **Why Rejected**: Would undermine entire architecture governance

**Alternative C: Constitutional Compliance with User Override**
- **Approach**: Implement database but allow user to override with in-memory
- **Why Rejected**: Adds unnecessary complexity, violates simplicity goal

## References

- Feature Spec: [specs/001-cli-todo/spec.md](../specs/001-cli-todo/spec.md)
- Implementation Plan: [specs/001-cli-todo/plan.md](../specs/001-cli-todo/plan.md) - Constitution Check section
- Research: [specs/001-cli-todo/research.md](../specs/001-cli-todo/research.md) - Decision 1
- Constitution: [.specify/memory/constitution.md](../.specify/memory/constitution.md) - Principle III
- Related ADRs: ADR-001, ADR-002
- Evaluator Evidence: [history/prompts/001-cli-todo/3-plan-cli-todo.plan.prompt.md](../history/prompts/001-cli-todo/3-plan-cli-todo.plan.prompt.md)

## Review Requirements

**Phase II Gate**: This exception MUST be reviewed before Phase II implementation
- [ ] Verify Phase I CLI meets all user requirements
- [ ] Confirm Phase II database strategy is viable
- [ ] Update Constitution compliance status
- [ ] Archive this ADR or extend exception
