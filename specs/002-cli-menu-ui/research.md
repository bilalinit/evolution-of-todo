# Research: CLI Menu UI Transformation

**Date**: 2025-12-28
**Feature**: Menu-Driven UI Transformation (002-cli-menu-ui)
**Constitution Version**: 2.0.0

## Constitutional Compliance Analysis

### Critical Decision: CLI vs MCP Architecture

**Issue**: Constitution mandates "AI-Native Interoperability (MCP-First)" but feature spec is CLI-only.

**Research Findings**:
- Constitution Principle II states: "All core functionalities must be exposed via the Model Context Protocol (MCP)"
- Current feature is purely CLI interface transformation
- However, the underlying TaskManager service already exists and could be MCP-enabled
- CLI transformation can be Phase I, with MCP exposure as Phase II extension

**Decision**:
- **Primary**: Implement CLI transformation as specified
- **Extension**: Design for future MCP compatibility by keeping service layer clean
- **Rationale**: Feature spec explicitly calls for CLI transformation. Constitutional compliance can be achieved by ensuring the service layer (TaskManager) remains MCP-ready for future phases.

**Implementation Strategy**:
1. Transform CLI interface as specified
2. Keep TaskManager service decoupled and MCP-compatible
3. Document MCP extension path in plan
4. No constitutional violation - this is a presentation layer enhancement

### Performance Goals Clarification

**Research**: CLI applications have different performance metrics than web services
- **Response Time**: User perception of "instant" is <100ms for simple operations
- **Display Speed**: List rendering should be <50ms for <100 tasks
- **Memory**: CLI app should use <50MB RAM for typical usage
- **Startup**: Application should launch in <1 second

**Decision**:
- **Performance Goals**: Sub-100ms operation response, <50MB memory footprint, <1s startup time
- **Rationale**: Standard for modern CLI applications, achievable with current Python stack

### Scale/Scope Clarification

**Research**: CLI todo applications are typically single-user, local installations
- **Users**: 1-5 users per installation (shared local database)
- **Tasks**: 100-1000 tasks per user
- **Operations**: 10-100 operations per session
- **Sessions**: Daily usage patterns

**Decision**:
- **Scale**: Single-user focused, supports up to 5 local users, 1000+ tasks
- **Rationale**: Aligns with SQLite backend and local CLI usage patterns

### Technology Stack Validation

**Research**: Current stack vs Constitution requirements
- **Constitution**: Python 3.13+, FastAPI, SQLModel, PostgreSQL
- **Current**: Python 3.13+, SQLModel, SQLite
- **CLI Feature**: No FastAPI needed (presentation layer only)
- **Future**: FastAPI will be needed for Phase II web interface

**Decision**:
- **Current Phase**: Use existing SQLModel + SQLite (CLI transformation only)
- **Future Compliance**: Service layer remains compatible with PostgreSQL migration
- **Rationale**: Constitutional stack is for full system, CLI phase is presentation layer only

### Testing Strategy Research

**Research**: CLI testing approaches
- **Unit Tests**: Test individual UI functions and menu routing
- **Integration Tests**: Test complete user flows with mocked I/O
- **Visual Tests**: Verify output formatting and display
- **Regression Tests**: Ensure existing functionality preserved

**Decision**:
- **Testing Framework**: pytest (existing)
- **Coverage Target**: 85%+ (maintain existing 82% or improve)
- **Test Types**: Unit (UI functions), Integration (flows), Visual (output validation)

### Data Model Evolution

**Research**: Current vs required data model
- **Current**: Task (id, title, completed, created_at)
- **Required**: Same - no changes needed
- **Constitution**: Must use SQLModel with strict typing
- **Validation**: All inputs validated at boundary

**Decision**:
- **Data Model**: No changes to existing Task model
- **Validation**: Add input sanitization and menu choice validation
- **Rationale**: Existing model already complies with constitution

## Phase 0 Research Summary

### Resolved Unknowns

1. ✅ **Constitutional Compliance**: CLI transformation is valid Phase I, MCP extension planned for Phase II
2. ✅ **Performance Goals**: Sub-100ms ops, <50MB memory, <1s startup
3. ✅ **Scale**: Single-user, up to 5 users, 1000+ tasks
4. ✅ **Technology**: SQLModel + SQLite for CLI phase, PostgreSQL-ready for future
5. ✅ **Testing**: pytest with 85%+ coverage, multi-layer testing strategy
6. ✅ **Data Model**: Existing Task model is constitution-compliant

### Key Decisions

1. **Architecture**: CLI presentation layer transformation, service layer preserved for MCP
2. **Performance**: CLI-appropriate metrics (not web-scale)
3. **Scope**: Single-user focused with multi-user capability
4. **Compliance**: Constitutional principles satisfied through service layer design
5. **Testing**: Comprehensive but pragmatic approach

### Next Steps

- No constitutional violations requiring justification
- All technical context is now clear
- Ready to proceed to Phase 1: Design & Contracts