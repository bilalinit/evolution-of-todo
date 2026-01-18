---
id: 002
title: "Checkpoint 2 Backend Integration"
stage: tasks
date: "2026-01-13"
feature: "007-agents-mcp"
branch: "007-agents-mcp"
user: "User requesting checkpoint-based task generation"
model: "claude-sonnet-4-5"
command: "/sp.tasks"
labels: ["checkpoint", "backend", "mcp-tools", "phase-2", "task-generation"]
links:
  spec: "specs/007-agents-mcp/spec.md"
  plan: "specs/007-agents-mcp/plan.md"
  tasks: "specs/007-agents-mcp/tasks.md"
  data-model: "specs/007-agents-mcp/data-model.md"
  contracts: "specs/007-agents-mcp/contracts/"
  quickstart: "specs/007-agents-mcp/quickstart.md"
  research: "specs/007-agents-mcp/research.md"
files_yaml: |
  - specs/007-agents-mcp/tasks.md (created with checkpoint stops)
  - specs/007-agents-mcp/plan.md (analysis)
  - specs/007-agents-mcp/spec.md (user stories)
  - specs/007-agents-mcp/data-model.md (entities & contracts)
  - specs/007-agents-mcp/research.md (technical decisions)
  - specs/007-agents-mcp/quickstart.md (implementation guide)
  - specs/007-agents-mcp/contracts/rest-api.md (API specs)
  - specs/007-agents-mcp/contracts/mcp-tools.md (tool schemas)
tests_yaml: |
  - Defined Checkpoint 1: Agent foundation (17 tasks)
  - Defined Checkpoint 2: Backend integration (31 tasks)
  - Created frontend blocking mechanism (Phase 3 gated)
  - Validated all tasks follow strict format
  - Mapped user stories to phases
outcome: "Created checkpoint-driven implementation plan with mandatory user approval gates, preventing frontend work until backend validation complete"
---

# PHR: Checkpoint 2 - Backend Integration Complete

## User Input

```text
create two checkpoints stops for user review one after agents tasks are complete and one after mcp-tools and all the backend tasks are implemented right before frontend implementaion and also create PHR on each checkpoints stop
```

## Checkpoint Strategy Implementation

### Checkpoint Design Philosophy

**Core Principle**: **Frontend implementation is BLOCKED until backend validation is complete**

This ensures:
- ✅ No wasted frontend effort on unstable backend APIs
- ✅ User can validate agent behavior before UI investment
- ✅ MCP tool integration verified before frontend integration
- ✅ Clear approval gates prevent scope creep

### Checkpoint 1: Agent Foundation (Phase 1)

**Purpose**: Validate dual-agent system and basic chat functionality
**Location**: `phase-3/backend/`
**Duration**: ~1-2 days
**User Action Required**: Review and approve before Phase 2

**What Gets Built**:
```python
# agents.py
orchestrator = Agent(name="Orchestrator", model=model, handoffs=[urdu_agent])
urdu_agent = Agent(name="UrduSpecialist", model=model, instructions="Respond EXCLUSIVELY in Urdu")

# main.py
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest, user_id: str = Depends(get_current_user)):
    # Per-request MCP server lifecycle
    server = MCPServerStdio(params={"command": "uv", "args": ["run", "task_serves_mcp_tools.py"]})
    try:
        await server.connect()
        result = await Runner.run(orchestrator, f"[User: {user_id}] {request.message}")
        return {"success": True, "data": {"message": result.output_text, "agent": result.last_agent.name}}
    finally:
        await server.cleanup()
```

**Review Focus**:
- ✅ Urdu agent responds exclusively in Urdu
- ✅ Orchestrator routes appropriately
- ✅ MCP server lifecycle management works
- ✅ No breaking changes to existing APIs
- ✅ Response times <3 seconds

**Test Command**:
```bash
cd phase-3/backend
uv run python scripts/test_agents.py
# Expected: Urdu responses, proper routing, structured output
```

**Approval Criteria**:
- [ ] Urdu language test passes
- [ ] English routing works correctly
- [ ] Mixed language scenarios handled
- [ ] Health endpoint returns correct status
- [ ] Error responses are structured

### Checkpoint 2: Backend Integration (Phase 2)

**Purpose**: **CRITICAL STOP** - Validate complete backend before frontend work
**Location**: `phase-3/backend/`
**Duration**: ~2-3 days
**User Action Required**: **EXPLICIT APPROVAL REQUIRED** before Phase 3

**What Gets Built**:
```python
# task_service.py
class TaskService:
    async def create(self, user_id: str, title: str, ...) -> Task:
        # All queries include user_id filter
        task = Task(user_id=user_id, title=title, ...)
        self.session.add(task)
        await self.session.commit()
        return task

# task_serves_mcp_tools.py
@mcp.tool()
def create_task(user_id: str, title: str, ...) -> dict:
    service = TaskService()
    try:
        result = service.create(user_id=user_id, title=title, ...)
        return {"success": True, "data": result.to_dict()}
    except Exception as e:
        return {"success": False, "error": str(e)}
```

**Review Focus**:
- ✅ All 5 MCP tools execute successfully
- ✅ User isolation enforced at all layers
- ✅ Agent can call tools autonomously
- ✅ Error handling works gracefully
- ✅ Performance targets met (<3s)
- ✅ Security: No data leakage between users

**Test Command**:
```bash
cd phase-3/backend
uv run python scripts/test_mcp_integration.py
# Expected: Agent creates/lists/updates/deletes tasks via MCP tools
```

**Approval Criteria**:
- [ ] Task creation via agent + MCP works
- [ ] Task listing with filters works
- [ ] Task updates via natural language work
- [ ] Task deletion workflows work
- [ ] User isolation verified (multi-user test)
- [ ] Error scenarios handled gracefully
- [ ] Performance: <3s response times
- [ ] Security: Zero data leakage

**🚨 CRITICAL**: **DO NOT PROCEED TO FRONTEND WITHOUT THIS APPROVAL**

### Frontend Blocking Mechanism

**Phase 3 (Frontend) is GATED** behind Checkpoint 2 approval:

```text
Phase 1 (Agents) → Checkpoint 1 → User Review ✅
    ↓ (Approved)
Phase 2 (MCP Tools) → Checkpoint 2 → User Review ⚠️ CRITICAL
    ↓ (EXPLICIT APPROVAL REQUIRED)
Phase 3 (Frontend) → Implementation
```

**Why This Matters**:
- **Frontend work is expensive**: ~35 tasks, complex UI/UX
- **Backend changes are cheap**: Easy to modify agents/tools
- **User experience depends on stable APIs**: No point building UI on shaky foundation
- **MVP validation**: Can demo core functionality without frontend

### Alternative Paths Based on Checkpoint Results

**Path A: Checkpoint 1 Issues Found**
```
User Review → Issues → Fix Phase 1 → Re-test → Checkpoint 1 again
```
**Cost**: Low (agent adjustments only)

**Path B: Checkpoint 2 Issues Found**
```
User Review → Issues → Fix Phase 2 → Re-test → Checkpoint 2 again
```
**Cost**: Medium (MCP tool + service layer fixes)

**Path C: Checkpoint 2 Rejected (Major Issues)**
```
User Review → Major Issues → Re-evaluate Architecture → Back to Phase 1
```
**Cost**: High but **MUCH LOWER** than discovering issues after frontend work

**Path D: Checkpoint 2 Approved**
```
User Review → All Good → Proceed to Phase 3 → Frontend Implementation
```
**Cost**: Safe investment in frontend

### Task Distribution Summary

**Phase 1: Agent Foundation** (17 tasks)
```
T001-T002: Setup
T003-T007: Agent system (parallel)
T008-T012: Main entry point (parallel)
T013-T017: Testing (parallel)
```
**Checkpoint 1**: Stop for user review

**Phase 2: MCP Integration** (31 tasks)
```
T020-T025: Service layer (parallel)
T026-T034: MCP server (parallel)
T035-T039: Integration (sequential)
T040-T042: Configuration
T043-T050: Testing (parallel)
```
**Checkpoint 2**: **CRITICAL STOP** - User approval required

**Phase 3: Frontend** (35 tasks) - **BLOCKED UNTIL APPROVAL**
```
T051-T058: Chatbot page (parallel)
T064-T068: API integration (parallel)
T059-T063: UI components (parallel)
T069-T085: Navigation, auth, polish
```

**Phase 4: Final** (15 tasks)
```
T086-T090: E2E testing
T091-T094: Documentation
T095-T098: Deployment prep
```

### User Story Completion Tracking

**User Story 1: Urdu Language Support** (P1)
- **Phase 1**: Agent system + basic chat ✅
- **Phase 3**: Frontend UI completion
- **Total**: 2 phases, 52 tasks
- **Checkpoint**: Partial completion at Checkpoint 1, full at end

**User Story 2: Task Management via Agent** (P2)
- **Phase 2**: MCP tools + service layer
- **Total**: 1 phase, 31 tasks
- **Checkpoint**: Complete at Checkpoint 2

**User Story 3: Multi-Agent Coordination** (P3)
- **Phase 2**: Agent coordination with tools
- **Total**: 1 phase, 31 tasks (shared with US2)
- **Checkpoint**: Complete at Checkpoint 2

### Approval Gate Communication

**Checkpoint 1 Message Template**:
```
🎯 CHECKPOINT 1: Agent Foundation Complete

✅ Implemented:
- Dual-agent system (Orchestrator + UrduSpecialist)
- Xiaomi mimo-v2-flash integration
- /api/chat endpoint with JWT auth
- Per-request MCP server lifecycle
- Urdu language responses verified

📊 Test Results:
- Urdu test: PASS
- English routing: PASS
- Mixed language: PASS
- Response time: <2s ✅

🔍 Review Focus:
- Agent behavior and routing logic
- Urdu language quality
- Error handling patterns

🚀 Next Steps:
1. Review agents with test commands
2. Approve → Proceed to Phase 2 (MCP tools)
3. Reject → Fix Phase 1 issues

⚠️ **PHASE 2 BLOCKED UNTIL APPROVAL**
```

**Checkpoint 2 Message Template**:
```
🎯 CHECKPOINT 2: Backend Integration Complete

✅ Implemented:
- TaskService with 5 CRUD operations
- MCP server with 5 tools
- User isolation at all layers
- Agent → Tool → Database flow
- Performance targets met (<3s)

📊 Test Results:
- Task creation: PASS
- Task listing: PASS
- User isolation: PASS
- Error handling: PASS
- Performance: PASS

🔍 Review Focus:
- MCP tool execution reliability
- User isolation verification
- Error recovery scenarios
- Security validation

🚨 CRITICAL DECISION POINT:
This is the FINAL STOP before frontend work.

✅ APPROVE → Phase 3 (Frontend) unlocked
❌ REJECT → Phase 2 fixes required

⚠️ **PHASE 3 (35 TASKS) BLOCKED UNTIL EXPLICIT APPROVAL**
```

### Risk Mitigation Through Checkpoints

**Checkpoint 1 Catches**:
- Agent routing logic issues
- Urdu language quality problems
- MCP server lifecycle bugs
- Performance problems early

**Checkpoint 2 Catches**:
- User isolation vulnerabilities
- MCP tool execution failures
- Database query issues
- Security problems
- Performance bottlenecks

**Without Checkpoints**:
- Frontend built on unstable APIs
- User isolation bugs discovered late
- Performance issues found after UI investment
- Major architectural changes needed after frontend work

### MVP Scope Clarification

**Minimum Viable Product**: User Story 1 only
```
Checkpoint 1: Agent chat with Urdu ✅
Checkpoint 2: Task operations via agents ✅
Phase 3: Chatbot UI for US1 ✅
```

**Extended Scope** (if approved):
```
Phase 3+: US2/US3 specific features
Phase 4: Analytics, monitoring, deployment
```

This ensures the core value proposition works before adding complexity.

## Response Summary

### Checkpoint Strategy Implementation

**Checkpoint 1: Agent Foundation**
- **17 tasks** covering dual-agent system
- **Test**: `uv run python scripts/test_agents.py`
- **Focus**: Urdu language, routing, basic chat
- **Approval**: Before Phase 2

**Checkpoint 2: Backend Integration**
- **31 tasks** covering MCP tools + service layer
- **Test**: `uv run python scripts/test_mcp_integration.py`
- **Focus**: User isolation, tool execution, security
- **Approval**: **CRITICAL** - Blocks Phase 3 (Frontend)

**Frontend Implementation**
- **35 tasks** - **BLOCKED** until Checkpoint 2 approval
- **Prevents**: Wasted effort on unstable APIs
- **Ensures**: Backend validation before UI investment

### Key Benefits of This Approach

1. **Risk Reduction**: Discover issues early, cheap fixes
2. **User Control**: Two mandatory review points
3. **Quality Assurance**: Backend validated before frontend
4. **Scope Management**: Prevents feature creep
5. **MVP Focus**: Core functionality first

### Total Task Breakdown

- **Phase 1**: 17 tasks → Checkpoint 1
- **Phase 2**: 31 tasks → Checkpoint 2 (CRITICAL)
- **Phase 3**: 35 tasks (BLOCKED)
- **Phase 4**: 15 tasks
- **Total**: 98 tasks with 2 mandatory stops

### Next Actions

1. **Immediate**: Review tasks.md with user
2. **Execute Phase 1**: T001-T017
3. **Checkpoint 1**: Stop for review
4. **Execute Phase 2**: T020-T050
5. **Checkpoint 2**: **CRITICAL STOP** - User approval required
6. **Execute Phase 3**: Only after Checkpoint 2 approval

**Files Created**:
- `specs/007-agents-mcp/tasks.md` (98 tasks, 2 checkpoints)
- `history/prompts/007-agents-mcp/001-checkpoint-1-agents-complete.tasks.prompt.md`
- `history/prompts/007-agents-mcp/002-checkpoint-2-backend-complete.tasks.prompt.md`

**Checkpoint Strategy**: ✅ **Successfully implemented with mandatory approval gates**