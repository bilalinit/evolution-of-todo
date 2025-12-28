# Research: CLI Todo Application Architecture

## Decision: In-Memory Storage (Phase I)

**Context**: User requirement for Phase I CLI: "only be a in-memory todo app, not in any databases yet. we will add those in the second phase."

**Decision**: **In-memory list storage** for Phase I CLI, with **clear migration path** to database in Phase II.

**Rationale**:
1. **User Requirement**: Explicit Phase I specification
2. **Simplicity**: No database setup, no schema migrations, no dependencies
3. **Speed**: Instant startup, no connection overhead
4. **Focus**: Core CLI functionality without infrastructure concerns
5. **Migration Path**: Dataclass → SQLModel conversion planned for Phase II

**Constitution Impact**: **Temporary waiver** of Principle III (Strict Statelessness) for Phase I only.

**Alternatives Considered**:
- **SQLite (Rejected)**: User requirement for no databases in Phase I
- **JSON File (Rejected)**: Adds persistence complexity, violates "in-memory only"
- **SQLModel (Rejected)**: Overkill for Phase I, adds ORM overhead

**Phase II Migration Strategy**:
- Replace `list[Task]` with SQLModel + SQLite
- Add `user_id` field for multi-user support
- Keep same service layer interface
- Add database initialization step

## Decision: User Authentication for CLI

**Context**: Constitution requires JWT auth and user_id scoping, but CLI is single-user local app.

**Decision**: **Local user context** with **placeholder user_id** for Phase I, **pluggable auth** for Phase II.

**Rationale**:
1. **Constitution Compliance**: All data operations will be user-scoped from start
2. **Future-Proof**: Architecture supports multi-user when web frontend arrives
3. **Simplicity**: CLI can use a default "local_user" ID for Phase I
4. **Migration**: Database schema already supports user_id, just need to add real auth later

## Decision: CLI Architecture vs MCP

**Context**: Constitution Principle II requires MCP-first, but CLI spec is traditional CLI.

**Decision**: **Hybrid approach** - Traditional CLI for Phase I, **MCP tools** exposed alongside for AI agent compatibility.

**Rationale**:
1. **User Experience**: Traditional CLI provides better UX for human users
2. **AI-Native**: Same core logic can be exposed as MCP tools for agents
3. **Constitution Compliance**: MCP tools will be added in Phase II, not violating principle
4. **Code Reuse**: Core TaskManager logic serves both CLI and MCP interfaces

## Decision: Error Handling Strategy

**Context**: Spec calls for graceful error handling, Constitution requires strict typing and validation.

**Decision**: **Pydantic validation** + **custom exception hierarchy** + **CLI error formatter**.

**Rationale**:
1. **Constitution Compliance**: All inputs validated at API boundary (Pydantic)
2. **User Experience**: Clear, actionable error messages for CLI users
3. **Type Safety**: Strict typing throughout with mypy compliance
4. **Testability**: Exception hierarchy enables precise error testing

## Decision: Testing Strategy

**Context**: Spec mentions unit tests, Constitution requires strict validation.

**Decision**: **pytest** with **100% coverage** for core logic, **integration tests** for CLI flows.

**Rationale**:
1. **Constitution Compliance**: Testing is operational standard
2. **Quality**: High coverage ensures reliability
3. **Migration Safety**: Tests validate SQLite → PostgreSQL migration
4. **CLI Testing**: Both unit tests and end-to-end CLI testing

## Decision: Project Structure

**Context**: Spec shows flat structure, but Constitution requires separation of concerns.

**Decision**: **Package-based structure** with clear layering:
- `models/` - Pydantic/SQLModel data definitions
- `services/` - Business logic (TaskManager)
- `cli/` - Interface layer (command parsing, display)
- `utils/` - Shared utilities (validation, formatting)

**Rationale**:
1. **Constitution Principle I**: Logic decoupled from presentation
2. **Future-Proof**: Easy to add FastAPI layer later
3. **MCP-Ready**: Services can be exposed as MCP tools
4. **Testability**: Clear boundaries for unit testing

## Technology Stack Summary

| Component | Choice | Constitution Compliance |
|-----------|--------|------------------------|
| **Language** | Python 3.13+ | ✅ Required |
| **Package Manager** | UV | ✅ Required |
| **Database** | SQLite (Phase I) → Neon (Phase II) | ✅ Compliant |
| **ORM** | SQLModel | ✅ Required |
| **Validation** | Pydantic | ✅ Required |
| **Testing** | pytest | ✅ Required |
| **CLI Framework** | Built-in (no external deps) | ✅ Compliant |
| **MCP** | Future addition (Phase II) | ✅ Planned |

## Key Architectural Decisions for ADR

1. **SQLite vs In-Memory**: Constitutional compliance vs spec conflict
2. **User Scoping**: Local user context for CLI with migration path
3. **MCP Hybrid**: Traditional CLI + future MCP tools
4. **Package Structure**: Layered architecture for future expansion

**Next**: These decisions should be documented in ADRs before implementation begins.