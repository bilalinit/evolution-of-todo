---
id: 0002
title: MCP Agent Integration Plan
stage: plan
date_iso: 2026-01-13
surface: agent
model: claude-sonnet-4-5
feature: 007-agents-mcp
branch: 007-agents-mcp
user: User requested /sp.plan command for Phase 3 MCP Agent Integration
command: /sp.plan # Phase 3: MCP Agent Integration Specification

## Executive Summary
Build a dual-agent system with Urdu language specialization, integrate MCP tools for CRUD operations, and create a frontend chatbot interface. Three-phase approach: Agent foundation → MCP integration → UI development.

---

## Phase 1: Agent Foundation

### Business Objectives
- **Dual-Agent System**: Orchestrator agent + Urdu specialist agent
- **Single Entry Point**: One main.py file to start complete agent system
- **Agent Communication**: Orchestrator routes tasks to Urdu agent
- **Language Specialization**: Urdu agent responds exclusively in Urdu
- **API Ready**: Backend prepared for MCP integration

### Technical Architecture
- **Framework**: OpenAI Agents SDK with Xiaomi mimo-v2-flash model
- **Agent Structure**:
  - `agents.py`: Single file containing both orchestrator and Urdu agent
  - **Orchestrator Agent**: Main router with coordination logic
  - **Urdu Agent**: Urdu language specialist with cultural context
- **Main Entry**: `main.py` with FastAPI setup and agent registration
- **API Endpoint**: `/api/chat` for agent communication (placeholder for Phase 2)

### Success Criteria
- ✅ Single agents.py file created with both agents
- ✅ Orchestrator agent coordinates with Urdu agent collaboratively
- ✅ Urdu agent responds exclusively in Urdu language
- ✅ Single main.py starts complete agent system
- ✅ API endpoint structure ready for MCP integration

---

## Phase 2: MCP Integration

### Business Objectives
- **CRUD Operations**: All create, read, update, delete functionality
- **MCP Tools**: Single file containing all operational tools
- **Agent Enhancement**: Both agents gain tool-calling capabilities
- **User Isolation**: All operations scoped to individual users
- **Security**: JWT-based authentication and authorization

### Technical Architecture
- **MCP Server**: `task_serves_mcp_tools.py` with all CRUD operations
- **Tool Operations**:
  - **Create**: Add new items with user context
  - **Read**: Retrieve items with filtering and pagination
  - **Update**: Modify existing items
  - **Delete**: Remove items with validation
  - **List**: Search and filter user-specific items
- **Integration**: Connect MCP server to both agents
- **Security Layer**: JWT validation and user_id extraction

### Success Criteria
- ✅ MCP tools file contains all CRUD operations
- ✅ Both agents can call MCP tools
- ✅ User isolation works across all operations
- ✅ Structured responses with {success, data/error} format
- ✅ Main.py updated to include MCP server lifecycle

---

## Phase 3: Frontend UI Development

### Business Objectives
- **Chatbot Interface**: New page for user-agent interaction
- **Real-time Communication**: Connect to backend agent endpoint
- **User Experience**: Message input/output
- **Agent Visibility**: Show which agent is responding
- **Error Handling**: Graceful failure states and loading indicators

### Technical Architecture
- **Frontend**: Next.js App Router page at `/chatbot`
- **Integration**: Connects to `/api/chat` endpoint from Phase 1
- **Features**:
  - Message input component
  - Response display with agent attribution
  - Loading states and error boundaries
  - JWT authentication handling
- **Styling**: Consistent with existing project design

### Success Criteria
- ✅ New chatbot page created in frontend
- ✅ Successfully connects to backend agent endpoint
- ✅ Displays responses from both agents correctly
- ✅ Handles authentication and errors gracefully

---

## Implementation Roadmap

### Phase 1: Agent Foundation
1. Create `agents.py` with both orchestrator and Urdu agent
2. Build `main.py` with FastAPI + agent registration
3. Implement `/api/chat` endpoint structure
4. Test agent communication without tools

### Phase 2: MCP Integration
1. Create `task_serves_mcp_tools.py` with all CRUD operations
2. Update `main.py` to include MCP server lifecycle
3. Connect MCP tools to both agents
4. Implement JWT authentication and user isolation
5. Test CRUD operations through agents

### Phase 3: Frontend UI
1. Create `/chatbot` page in Next.js app
2. Build message input/output components
3. Connect to backend `/api/chat` endpoint
4. Implement agent response display
5. Add loading states and error handling

---

## File Structure

```
├── backend/
│   ├── main.py                    # Phase 1: API entry point
│   ├── agents.py                  # Phase 1: Both orchestrator + Urdu agent
│   └── task_serves_mcp_tools.py  # Phase 2: All CRUD operations
├── frontend/
    └── app/chatbot/page.tsx      # Phase 3: Chatbot interface
```

---

## Acceptance Criteria

### Phase 1 Complete When:
- [ ] `agents.py` created with both orchestrator and Urdu agent
- [ ] `main.py` starts complete agent system
- [ ] `/api/chat` endpoint responds with agent output
- [ ] Urdu agent responds exclusively in Urdu

### Phase 2 Complete When:
- [ ] `task_serves_mcp_tools.py` contains all CRUD operations
- [ ] MCP server integrated into main.py
- [ ] Both agents can perform CRUD via MCP tools
- [ ] User isolation works across all operations
- [ ] JWT authentication validates user context

### Phase 3 Complete When:
- [ ] `/chatbot` page created in frontend
- [ ] Page connects to backend `/api/chat` endpoint
- [ ] Message input/output interface functional
- [ ] Agent attribution displayed correctly
- [ ] Error handling and loading states implemented

---

## Key Business Requirements

### Single-File Backend
- **Constraint**: main.py must start complete system
- **Approach**: Import agents and MCP tools, register with FastAPI
- **Benefit**: Simplified deployment and debugging

### Dual-Agent Specialization
- **Orchestrator**: General purpose, task routing
- **Urdu Agent**: Language specialist, cultural context
- **Value**: Optimized responses for Urdu content

### MCP Tool Integration
- **Centralization**: All CRUD in single tools file
- **Reusability**: Both agents share same operations
- **Security**: User isolation at tool level

### Frontend Connectivity
- **Direct Connection**: Frontend → Backend API
- **Authentication**: JWT token handling
- **User Experience**: Real-time agent responses

---

## Risk Considerations

### Technical Risks
- **Agent Coordination**: Ensure proper routing between agents
- **MCP Lifecycle**: Manage server creation/cleanup per request
- **Language Quality**: Urdu agent output validation

### Mitigation Strategies
- **Testing**: Validate agent routing with sample queries
- **Monitoring**: Track MCP server instances and memory
- **Fallback**: Language detection and routing validation

---

## Next Steps
1. **Immediate**: Create Phase 1 agents.py and main.py
2. **Follow-up**: Implement Phase 2 MCP tools integration
3. **Final**: Build Phase 3 frontend chatbot interface
4. **Validation**: Test end-to-end user workflows
labels: ["phase-3", "mcp", "agents", "urdu", "implementation-plan"]
links:
  spec: specs/007-agents-mcp/spec.md
  ticket: null
  adr: null
  pr: null
files_yaml:
  - specs/007-agents-mcp/plan.md
  - specs/007-agents-mcp/research.md
  - specs/007-agents-mcp/data-model.md
  - specs/007-agents-mcp/quickstart.md
  - specs/007-agents-mcp/contracts/rest-api.md
  - specs/007-agents-mcp/contracts/mcp-tools.md
  - CLAUDE.md
tests_yaml: []
prompt_text: # Phase 3: MCP Agent Integration Specification

## Executive Summary
Build a dual-agent system with Urdu language specialization, integrate MCP tools for CRUD operations, and create a frontend chatbot interface. Three-phase approach: Agent foundation → MCP integration → UI development.

---

## Phase 1: Agent Foundation

### Business Objectives
- **Dual-Agent System**: Orchestrator agent + Urdu specialist agent
- **Single Entry Point**: One main.py file to start complete agent system
- **Agent Communication**: Orchestrator routes tasks to Urdu agent
- **Language Specialization**: Urdu agent responds exclusively in Urdu
- **API Ready**: Backend prepared for MCP integration

### Technical Architecture
- **Framework**: OpenAI Agents SDK with Xiaomi mimo-v2-flash model
- **Agent Structure**:
  - `agents.py`: Single file containing both orchestrator and Urdu agent
  - **Orchestrator Agent**: Main router with coordination logic
  - **Urdu Agent**: Urdu language specialist with cultural context
- **Main Entry**: `main.py` with FastAPI setup and agent registration
- **API Endpoint**: `/api/chat` for agent communication (placeholder for Phase 2)

### Success Criteria
- ✅ Single agents.py file created with both agents
- ✅ Orchestrator agent coordinates with Urdu agent collaboratively
- ✅ Urdu agent responds exclusively in Urdu language
- ✅ Single main.py starts complete agent system
- ✅ API endpoint structure ready for MCP integration

---

## Phase 2: MCP Integration

### Business Objectives
- **CRUD Operations**: All create, read, update, delete functionality
- **MCP Tools**: Single file containing all operational tools
- **Agent Enhancement**: Both agents gain tool-calling capabilities
- **User Isolation**: All operations scoped to individual users
- **Security**: JWT-based authentication and authorization

### Technical Architecture
- **MCP Server**: `task_serves_mcp_tools.py` with all CRUD operations
- **Tool Operations**:
  - **Create**: Add new items with user context
  - **Read**: Retrieve items with filtering and pagination
  - **Update**: Modify existing items
  - **Delete**: Remove items with validation
  - **List**: Search and filter user-specific items
- **Integration**: Connect MCP server to both agents
- **Security Layer**: JWT validation and user_id extraction

### Success Criteria
- ✅ MCP tools file contains all CRUD operations
- ✅ Both agents can call MCP tools
- ✅ User isolation works across all operations
- ✅ Structured responses with {success, data/error} format
- ✅ Main.py updated to include MCP server lifecycle

---

## Phase 3: Frontend UI Development

### Business Objectives
- **Chatbot Interface**: New page for user-agent interaction
- **Real-time Communication**: Connect to backend agent endpoint
- **User Experience**: Message input/output
- **Agent Visibility**: Show which agent is responding
- **Error Handling**: Graceful failure states and loading indicators

### Technical Architecture
- **Frontend**: Next.js App Router page at `/chatbot`
- **Integration**: Connects to `/api/chat` endpoint from Phase 1
- **Features**:
  - Message input component
  - Response display with agent attribution
  - Loading states and error boundaries
  - JWT authentication handling
- **Styling**: Consistent with existing project design

### Success Criteria
- ✅ New chatbot page created in frontend
- ✅ Successfully connects to backend agent endpoint
- ✅ Displays responses from both agents correctly
- ✅ Handles authentication and errors gracefully

---

## Implementation Roadmap

### Phase 1: Agent Foundation
1. Create `agents.py` with both orchestrator and Urdu agent
2. Build `main.py` with FastAPI + agent registration
3. Implement `/api/chat` endpoint structure
4. Test agent communication without tools

### Phase 2: MCP Integration
1. Create `task_serves_mcp_tools.py` with all CRUD operations
2. Update `main.py` to include MCP server lifecycle
3. Connect MCP tools to both agents
4. Implement JWT authentication and user isolation
5. Test CRUD operations through agents

### Phase 3: Frontend UI
1. Create `/chatbot` page in Next.js app
2. Build message input/output components
3. Connect to backend `/api/chat` endpoint
4. Implement agent response display
5. Add loading states and error handling

---

## File Structure

```
├── backend/
│   ├── main.py                    # Phase 1: API entry point
│   ├── agents.py                  # Phase 1: Both orchestrator + Urdu agent
│   └── task_serves_mcp_tools.py  # Phase 2: All CRUD operations
├── frontend/
    └── app/chatbot/page.tsx      # Phase 3: Chatbot interface
```

---

## Acceptance Criteria

### Phase 1 Complete When:
- [ ] `agents.py` created with both orchestrator and Urdu agent
- [ ] `main.py` starts complete agent system
- [ ] `/api/chat` endpoint responds with agent output
- [ ] Urdu agent responds exclusively in Urdu

### Phase 2 Complete When:
- [ ] `task_serves_mcp_tools.py` contains all CRUD operations
- [ ] MCP server integrated into main.py
- [ ] Both agents can perform CRUD via MCP tools
- [ ] User isolation works across all operations
- [ ] JWT authentication validates user context

### Phase 3 Complete When:
- [ ] `/chatbot` page created in frontend
- [ ] Page connects to backend `/api/chat` endpoint
- [ ] Message input/output interface functional
- [ ] Agent attribution displayed correctly
- [ ] Error handling and loading states implemented

---

## Key Business Requirements

### Single-File Backend
- **Constraint**: main.py must start complete system
- **Approach**: Import agents and MCP tools, register with FastAPI
- **Benefit**: Simplified deployment and debugging

### Dual-Agent Specialization
- **Orchestrator**: General purpose, task routing
- **Urdu Agent**: Language specialist, cultural context
- **Value**: Optimized responses for Urdu content

### MCP Tool Integration
- **Centralization**: All CRUD in single tools file
- **Reusability**: Both agents share same operations
- **Security**: User isolation at tool level

### Frontend Connectivity
- **Direct Connection**: Frontend → Backend API
- **Authentication**: JWT token handling
- **User Experience**: Real-time agent responses

---

## Risk Considerations

### Technical Risks
- **Agent Coordination**: Ensure proper routing between agents
- **MCP Lifecycle**: Manage server creation/cleanup per request
- **Language Quality**: Urdu agent output validation

### Mitigation Strategies
- **Testing**: Validate agent routing with sample queries
- **Monitoring**: Track MCP server instances and memory
- **Fallback**: Language detection and routing validation

---

## Next Steps
1. **Immediate**: Create Phase 1 agents.py and main.py
2. **Follow-up**: Implement Phase 2 MCP tools integration
3. **Final**: Build Phase 3 frontend chatbot interface
4. **Validation**: Test end-to-end user workflows
response_text: **Plan Created Successfully**

**Branch**: `007-agents-mcp` | **Date**: 2026-01-13 | **Spec**: [specs/007-agents-mcp/spec.md](specs/007-agents-mcp/spec.md)

## Summary
Complete implementation plan for Phase 3 MCP Agent Integration with three-phase approach: Agent Foundation → MCP Integration → Frontend UI.

## Key Deliverables Created
- ✅ `specs/007-agents-mcp/plan.md` - Complete implementation plan
- ✅ `specs/007-agents-mcp/research.md` - Resolved 7 technical unknowns
- ✅ `specs/007-agents-mcp/data-model.md` - Entity relationships and schemas
- ✅ `specs/007-agents-mcp/quickstart.md` - Step-by-step implementation guide
- ✅ `specs/007-agents-mcp/contracts/` - API and MCP tool specifications

## Architecture Highlights
- **Dual-Agent System**: Orchestrator + Urdu specialist with handoff
- **MCP-First**: All CRUD via Model Context Protocol
- **Per-Request Servers**: Dynamic MCP server lifecycle for security
- **User Isolation**: Multi-layer JWT validation + query filtering
- **Constitution Compliant**: All principles satisfied without violations

## Next Action
Run `/sp.tasks` to generate detailed implementation tasks for the 20-25 individual steps needed.

## Success Metrics
- Urdu language support (User Story 1)
- Task management via agents (User Story 2)
- Multi-agent coordination (User Story 3)
- All acceptance scenarios pass