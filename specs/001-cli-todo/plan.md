# Implementation Plan: CLI Todo Application

**Branch**: `001-cli-todo` | **Date**: 2025-12-28 | **Spec**: [specs/001-cli-todo/spec.md](spec.md)
**Input**: Feature specification from `/specs/001-cli-todo/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a command-line todo application with 5 core operations (add, list, update, delete, toggle) using Python 3.13+, UV package manager, and **in-memory storage**. The application will follow Spec-Driven Development principles. This is Phase I foundation for the Evolution of Todo system, with database persistence planned for Phase II.

## Technical Context

**Language/Version**: Python 3.13+ (required by spec)
**Primary Dependencies**: Pydantic (validation), UV (package manager) - **No ORM needed**
**Storage**: In-memory list (Phase I) → Database persistence (Phase II)
**Testing**: pytest with 90%+ coverage, mypy for type checking, ruff for linting
**Target Platform**: Local CLI application (cross-platform: Linux, macOS, Windows)
**Project Type**: Single project with package-based structure
**Performance Goals**: <100ms response time for all operations, <50MB memory footprint
**Constraints**: No external dependencies in Phase I, graceful error handling, never crash on user input
**Scale/Scope**: Single-user local CLI, ready for multi-user web expansion (Phase II)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ⚠️ CONSTITUTION COMPLIANCE REVIEW NEEDED

**Constitution Principle III (Strict Statelessness)** states: "All state must be persisted immediately to the database (Neon PostgreSQL)".

**Phase I Requirement**: In-memory storage (user requirement, no databases yet).

**Resolution**: **Temporary constitutional exception** for Phase I CLI only.

**Justification**:
- **User requirement**: "Phase 1 should only be in-memory, not databases yet"
- **Phase planning**: Database persistence explicitly planned for Phase II
- **Scope**: Single-user local CLI, no distributed state concerns
- **Migration path**: Clear path to database in Phase II

**This exception requires ADR documentation** (see Complexity Tracking below).

**Constitution Check**: ⚠️ **WAIVED for Phase I** - Must be revisited in Phase II

## Project Structure

### Documentation (this feature)

```text
specs/001-cli-todo/
├── plan.md              # This file - implementation plan
├── research.md          # Phase 0 - architectural decisions
├── data-model.md        # Phase 1 - SQLModel schemas & relationships
├── quickstart.md        # Phase 1 - setup & development guide
├── contracts/           # Phase 1 - API & MCP specifications
│   ├── openapi.yaml     # REST API contract (Phase II)
│   └── mcp-tools.md     # MCP tools specification (Phase III)
└── tasks.md             # Phase 2 - implementation tasks (to be created)
```

### Source Code (repository root)

```text
backend/
├── pyproject.toml              # UV project config + dependencies
├── README.md                   # Project documentation
├── .gitignore                  # Git ignore patterns
├── .python-version             # Python version specification
├── uv.lock                     # Dependency lock file
└── src/
    └── backend/
        ├── __init__.py         # Package initialization
        ├── models.py           # Dataclass definitions (Task)
        ├── services.py         # TaskManager + business logic
        ├── cli.py              # CLI interface & command handlers
        ├── utils.py            # Validation & formatting helpers
        ├── main.py             # Entry point & main loop
        └── exceptions.py       # Custom exception hierarchy

tests/
├── unit/
│   ├── test_models.py         # Dataclass tests
│   ├── test_services.py       # TaskManager unit tests
│   ├── test_cli.py            # CLI command tests
│   └── test_utils.py          # Utility function tests
├── integration/
│   └── test_cli_flow.py       # End-to-end CLI flow tests

docs/
└── architecture/              # Future: detailed architecture docs
```

**Structure Decision**: Package-based layout with clear layering (models → services → cli). This enables:
- **Constitution Principle I**: Logic decoupled from presentation
- **Future expansion**: Easy to add FastAPI layer (Phase II)
- **MCP integration**: Services can be exposed as tools (Phase III)
- **Testability**: Clear boundaries for unit testing

## Complexity Tracking

> **Architectural decisions requiring ADR documentation**

| Decision | Why Significant | Simpler Alternative |
|-----------|----------------|---------------------|
| **In-Memory Storage (Phase I)** | Constitutional exception, clear migration path needed | Database from start (rejected per user requirement) |
| **Dataclass vs SQLModel** | Phase I simplicity vs Phase II migration complexity | SQLModel (rejected - overkill for in-memory) |
| **Package Structure** | Future-proofing for Phase II expansion | Flat structure (rejected - limits future growth) |
| **No User Scoping** | Phase I single-user scope, Phase II multi-user ready | User scoping from start (rejected - unnecessary complexity) |

**Required ADRs**:
1. **Phase I Storage Strategy**: In-memory with Phase II database migration plan
2. **Constitution Exception**: Temporary waiver for Principle III
3. **Architecture Evolution**: Simple Phase I → Complex Phase II approach

## Implementation Phases

### Phase 0: Research ✅ COMPLETE
- **Duration**: 1 session
- **Output**: `research.md` with architectural decisions
- **Key Decisions**: SQLite vs in-memory, user scoping, MCP strategy

### Phase 1: Design & Contracts ✅ COMPLETE
- **Duration**: 1 session
- **Outputs**: `data-model.md`, `quickstart.md`, `contracts/`
- **Key Artifacts**: SQLModel schemas, OpenAPI spec, MCP tools

### Phase 2: Implementation (Next)
- **Duration**: 2-3 sessions
- **Tasks**: Create `tasks.md` via `/sp.tasks`
- **Key Deliverables**: Working CLI application with all 5 operations

### Phase 3: Testing & Validation
- **Duration**: 1-2 sessions
- **Focus**: 90%+ coverage, manual flow testing, Constitution re-check

### Phase 4: Documentation & ADRs
- **Duration**: 1 session
- **Focus**: Create ADRs for architectural decisions, update all docs

## Next Steps

1. **Generate Tasks**: Run `/sp.tasks` to create implementation checklist
2. **Create ADRs**: Document storage and architecture decisions
3. **Implement**: Follow tasks.md for coding
4. **Test**: Validate against Constitution and spec
5. **Review**: Final Constitution check before merge

## Dependencies & Risks

### External Dependencies
- **None for Phase I**: All local development
- **Phase II**: Neon PostgreSQL, FastAPI
- **Phase III**: MCP SDK, OpenAI Agents SDK

### Technical Risks
- **Low**: SQLite → PostgreSQL migration is straightforward with SQLModel
- **Medium**: CLI UX complexity (handled by clear spec)
- **Low**: Test coverage (pytest standard)

### Constitutional Risks
- **None**: All principles addressed in architecture

## Success Criteria

- [ ] All 5 CLI commands work as specified
- [ ] 90%+ test coverage with pytest
- [ ] Constitution compliance verified
- [ ] All Phase 1 artifacts generated
- [ ] ADRs created for key decisions
- [ ] Ready for Phase 2 task implementation
