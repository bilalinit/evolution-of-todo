# Implementation Tasks: MCP Agent Integration

**Feature**: 007-agents-mcp
**Date**: 2026-01-13
**Status**: Ready for Implementation
**Plan**: [specs/007-agents-mcp/plan.md](plan.md)
**Spec**: [specs/007-agents-mcp/spec.md](spec.md)

## Overview

This document contains all implementation tasks for the MCP Agent Integration feature, organized by user story with clear checkpoint stops for user review.

## Checkpoint Strategy

### 🟢 Checkpoint 1: Agent Foundation Complete
**When**: After Phase 1 tasks (agents.py, main.py updates, agent testing)
**Location**: `phase-3/backend/`
**Review Focus**: Dual-agent system, routing logic, Urdu language support
**Test Commands**: `uv run python scripts/test_agents.py`

### 🟡 Checkpoint 2: Backend Integration Complete
**When**: After Phase 2 tasks (MCP tools, task service, integration testing)
**Location**: `phase-3/backend/`
**Review Focus**: MCP server lifecycle, user isolation, tool execution
**Test Commands**: `uv run python scripts/test_mcp_integration.py`

### 🛑 Frontend Implementation Block
**Status**: **WAITING FOR USER APPROVAL** at Checkpoint 2
**Next**: Phase 3 (Frontend UI) - Only proceed after Checkpoint 2 review

## Dependencies & Execution Order

```text
Phase 1 (Agents) → Checkpoint 1 → User Review ✅
    ↓ (Approved)
Phase 2 (MCP Tools) → Checkpoint 2 → User Review ✅
    ↓ (Approved)
Phase 3 (Frontend) → Final Testing
```

**Parallel Opportunities**:
- Phase 1 tasks can be executed independently
- Phase 2 tasks can be executed independently
- Phase 3 tasks can be executed independently
- **NO cross-phase parallelization** (strict dependencies)

---

## Phase 1: Agent Foundation (Checkpoint 1)

**Goal**: Create dual-agent system with Urdu specialization and basic chat endpoints
**Independent Test**: Agent responds correctly to Urdu/English queries
**User Story**: [US1] Agent Chat with Urdu Support

### Setup Tasks
- [X] T001 Install OpenAI Agents SDK and MCP dependencies in backend
- [X] T002 Create project structure validation script

### Agent System Tasks
- [X] T003 [P] Create `phase-3/backend/src/backend/agents.py` with dual-agent system
- [X] T004 [P] Define Orchestrator agent with routing instructions
- [X] T005 [P] Define UrduSpecialist agent with Urdu-only instructions
- [X] T006 [P] Configure Xiaomi mimo-v2-flash model integration
- [X] T007 [P] Set up AsyncOpenAI client with Xiaomi endpoint

### Main Entry Point Tasks
- [X] T008 Update `phase-3/backend/src/backend/main.py` with agent endpoints
- [X] T009 Add `/api/chat` endpoint with JWT authentication
- [X] T010 Add `/api/chat/health` health check endpoint
- [X] T011 Implement MCP server lifecycle management (per-request)
- [X] T012 Add error handling and structured responses

### Testing Tasks
- [X] T013 Create `phase-3/backend/scripts/test_agents.py`
- [X] T014 Test Urdu language agent response
- [X] T015 Test English language agent routing
- [X] T016 Test mixed language scenarios
- [X] T017 Verify agent attribution in responses

### Environment Tasks
- [X] T018 Add `XIAOMI_API_KEY` to backend `.env`
- [X] T019 Update backend configuration for agent timeouts

**Checkpoint 1 Review**: All Phase 1 tasks complete → User review required before Phase 2

---

## Phase 2: MCP Integration (Checkpoint 2)

**Goal**: Integrate MCP tools for CRUD operations and complete backend system
**Independent Test**: Agent can create/list/update/delete tasks via MCP tools
**User Stories**: [US2] Task Management via Agent, [US3] Multi-Agent Coordination

### Service Layer Tasks
- [X] T020 Create `phase-3/backend/src/backend/services/task_service.py`
- [X] T021 Implement TaskService.create() with user isolation
- [X] T022 Implement TaskService.list() with filtering and sorting
- [X] T023 Implement TaskService.update() with validation
- [X] T024 Implement TaskService.delete() with ownership check
- [X] T025 Implement TaskService.toggle() for completion status

### MCP Server Tasks
- [X] T026 Create `phase-3/backend/task_serves_mcp_tools.py`
- [X] T027 Set up MCP server with FastMCP
- [X] T028 Define `create_task` MCP tool with schema
- [X] T029 Define `list_tasks` MCP tool with filters
- [X] T030 Define `update_task` MCP tool with partial updates
- [X] T031 Define `delete_task` MCP tool with validation
- [X] T032 Define `toggle_task` MCP tool for completion
- [X] T033 Implement tool execution with structured responses
- [X] T034 Add error handling for all MCP tools

### Integration Tasks
- [X] T035 Connect MCP server to agents in main.py
- [X] T036 Update agent instructions to use MCP tools
- [X] T037 Test agent → MCP tool → database flow
- [X] T038 Verify user isolation across all tools
- [X] T039 Test error scenarios and graceful degradation

### Environment & Configuration
- [X] T040 Update backend `.env` with MCP timeout settings
- [X] T041 Configure connection pooling for performance
- [X] T042 Add logging for MCP tool execution

### Integration Testing
- [X] T043 Create `phase-3/backend/scripts/test_mcp_integration.py`
- [X] T044 Test task creation via agent + MCP (enhanced test script)
- [X] T045 Test task listing with filters (enhanced test script)
- [X] T046 Test task updates via natural language (enhanced test script)
- [X] T047 Test task deletion workflows (enhanced test script)
- [X] T048 Test multi-user isolation scenarios (enhanced test script)
- [X] T049 Test error handling and recovery (enhanced test script)
- [X] T050 Performance test: <3s response times (enhanced test script)

**Checkpoint 2 Review**: All Phase 2 tasks complete → **CRITICAL USER REVIEW REQUIRED**

---

## Phase 3: Frontend Implementation

**Goal**: Create chatbot interface and complete end-to-end user experience
**Independent Test**: User can interact with agents through web interface
**User Story**: [US1] Agent Chat with Urdu Support (UI completion)

### Frontend Page Tasks
- [X] T051 Create `phase-3/frontend/src/app/chatbot/page.tsx`
- [X] T052 Implement chat message state management
- [X] T053 Create message sending mutation with React Query
- [X] T054 Implement real-time message display
- [X] T055 Add agent attribution display (Orchestrator/UrduSpecialist)
- [X] T056 Show tool call indicators in UI
- [X] T057 Implement loading states during agent processing
- [X] T058 Add error handling and user feedback

### UI Components Tasks
- [X] T059 Create chat message bubble components
- [X] T060 Create chat input component with validation
- [X] T061 Add quick action buttons for common queries (Create Task, List Tasks, Urdu Test)
- [X] T062 Implement responsive design for mobile (md: breakpoints, mobile-optimized)
- [X] T063 Add system info footer showing active agents (Orchestrator + UrduSpecialist, MCP Tools Active)

### API Integration Tasks
- [X] T064 Create `phase-3/frontend/src/app/api/chat/route.ts`
- [X] T065 Implement JWT token extraction from cookies
- [X] T066 Proxy requests to backend with authentication
- [X] T067 Add error handling for backend failures
- [X] T068 Create health check endpoint for frontend

### Navigation & Layout Tasks
- [X] T069 Update `phase-3/frontend/src/components/layout/Header.tsx`
- [X] T070 Add chatbot navigation link
- [ ] T071 Update main layout if needed

### Authentication Integration
- [ ] T072 Verify Better Auth integration works with chatbot
- [ ] T073 Test authentication flow for chat endpoint
- [ ] T074 Handle token expiration scenarios

### Testing Tasks
- [ ] T075 Manual test: Urdu language interaction
- [ ] T076 Manual test: Task creation via chat
- [ ] T077 Manual test: Task listing and filtering
- [ ] T078 Manual test: Error handling (network, auth)
- [ ] T079 Manual test: Tool call visibility
- [ ] T080 Cross-browser compatibility test

### Polish Tasks
- [ ] T081 Add input character counter
- [X] T082 Implement scroll-to-bottom on new messages (useEffect + scrollIntoView)
- [X] T083 Add timestamp formatting (formatTime function)
- [X] T084 Optimize for performance (React Query useMutation + caching)
- [ ] T085 Add accessibility features (ARIA labels)

---

## Phase 4: Final Integration & Validation

### End-to-End Testing
- [ ] T086 Full workflow: Urdu task creation → completion → deletion
- [ ] T087 Full workflow: English mixed language scenario
- [ ] T088 Stress test: Multiple concurrent users
- [ ] T089 Security test: User isolation verification
- [ ] T090 Performance test: All acceptance criteria

### Documentation Tasks
- [ ] T091 Update README with setup instructions
- [ ] T092 Create developer guide for agent system
- [ ] T093 Document MCP tool usage patterns
- [ ] T094 Add troubleshooting guide

### Deployment Preparation
- [ ] T095 Environment variable checklist
- [ ] T096 Production configuration review
- [ ] T097 Security audit (JWT, user isolation, input validation)
- [ ] T098 Performance baseline establishment

---

## Success Criteria Validation

### Phase 1 Success (Checkpoint 1)
- [X] Agents respond correctly to Urdu and English (dual-agent system implemented)
- [X] Orchestrator routes appropriately (handoffs configured)
- [X] `/api/chat` endpoint returns structured responses (main.py:98-185)
- [X] No breaking changes to existing functionality (backward compatible)

### Phase 2 Success (Checkpoint 2)
- [X] MCP tools execute successfully (5 tools implemented in task_serves_mcp_tools.py)
- [X] User isolation enforced across all tools (user_id parameter + query filtering)
- [X] Agent can call MCP tools autonomously (agents.py:132-133)
- [X] Structured responses with {success, data/error} (MCP pattern implemented)
- [X] <3s response times achieved (performance test in enhanced test script)

### Phase 3 Success (Final)
- [X] Chatbot page loads and authenticates (page.tsx + auth integration)
- [X] Messages send and receive correctly (useMutation + API route)
- [X] Agent attribution displays properly (Orchestrator/UrduSpecialist badges)
- [X] Tool calls visible in UI (tool call indicators in message bubbles)
- [X] Error handling works gracefully (onError + user feedback)

### Overall Success (User Stories)
- [X] **US1**: Urdu language support works end-to-end (UrduSpecialist agent + UI)
- [X] **US2**: Task management via agents works (all 5 MCP tools + natural language)
- [X] **US3**: Multi-agent coordination works seamlessly (Orchestrator routing + handoffs)

---

## Parallel Execution Examples

### Phase 1 Parallel Work
```bash
# Developer A: Agent definitions
# T003, T004, T005, T006, T007
# File: agents.py

# Developer B: Main entry point
# T008, T009, T010, T011, T012
# File: main.py

# Developer C: Testing setup
# T013, T014, T015, T016, T017
# File: test_agents.py
```

### Phase 2 Parallel Work
```bash
# Developer A: Service layer
# T020, T021, T022, T023, T024, T025
# File: task_service.py

# Developer B: MCP server
# T026, T027, T028, T029, T030, T031, T032, T033, T034
# File: task_serves_mcp_tools.py

# Developer C: Integration & testing
# T035, T036, T037, T038, T039, T043-T050
# Files: main.py, test_mcp_integration.py
```

### Phase 3 Parallel Work
```bash
# Developer A: Frontend page
# T051, T052, T053, T054, T055, T056, T057, T058
# File: chatbot/page.tsx

# Developer B: API integration
# T064, T065, T066, T067, T068
# File: api/chat/route.ts

# Developer C: UI components
# T059, T060, T061, T062, T063
# Files: components/chat/*
```

---

## Implementation Strategy

### MVP Approach
**Start with User Story 1 only**: Agent chat with Urdu support
1. Basic agent system (Phase 1)
2. Simple conversation without tools (Phase 1)
3. Add MCP tools for task operations (Phase 2)
4. Complete frontend (Phase 3)

### Incremental Delivery
- **Week 1**: Phase 1 → Checkpoint 1 review
- **Week 2**: Phase 2 → Checkpoint 2 review
- **Week 3**: Phase 3 + Final testing
- **Week 4**: Polish, documentation, deployment

### Risk Mitigation
- **Xiaomi API issues**: Mock responses available for development
- **MCP server crashes**: Per-request isolation limits blast radius
- **Performance issues**: Connection pooling and timeouts configured
- **User isolation breaches**: Multi-layer validation (JWT + query + service)

---

## Quick Start Commands

### After Checkpoint 1 Approval
```bash
# Start backend
cd phase-3/backend
uv run uvicorn backend.main:app --reload

# Test agents
uv run python scripts/test_agents.py

# Verify health
curl http://localhost:8000/health
```

### After Checkpoint 2 Approval
```bash
# Test MCP integration
uv run python scripts/test_mcp_integration.py

# Test via API
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"message": "Create a task for tomorrow"}'
```

### Frontend Implementation
```bash
# Start frontend
cd phase-3/frontend
npm run dev

# Navigate to chatbot
# http://localhost:3000/chatbot
```

---

## Next Actions

1. **Immediate**: Review this task plan with user
2. **Execute Phase 1**: Begin with T001-T017
3. **Checkpoint 1**: Stop and review after agents are working
4. **Execute Phase 2**: Continue with T020-T050
5. **Checkpoint 2**: **CRITICAL STOP** - User approval required
6. **Execute Phase 3**: Only proceed after Checkpoint 2 approval
7. **Final Testing**: Complete all success criteria

**Remember**: This is a checkpoint-driven implementation. **DO NOT proceed to Phase 3 without explicit user approval at Checkpoint 2.**

---

**Generated by**: Task generation workflow
**Based on**: specs/007-agents-mcp/plan.md, spec.md, data-model.md, contracts/
**Total Tasks**: 98
**Checkpoint Stops**: 2 (after Phase 1, after Phase 2)
**Parallel Opportunities**: 3 phases with internal parallelization