---
description: "Task list for ChatKit integration with OpenAI Agents SDK & MCP tools"
---

# ChatKit Integration - Implementation Tasks

**Feature Branch**: `008-chatkit-integration`
**Generated**: 2026-01-16
**Status**: Ready for Implementation
**Estimated Duration**: 2-3 days

## Overview

This document contains all implementation tasks for integrating OpenAI ChatKit into the existing phase-3 application. Tasks are organized by user story to enable independent implementation and testing.

## Format: `[TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3, US4) - REQUIRED for user story phase tasks
- **File paths**: Exact paths for implementation

## Path Conventions

- **Backend**: `phase-3/backend/src/backend/`
- **Frontend**: `phase-3/frontend/src/`
- **Database**: `phase-3/backend/migrations/`
- **Tests**: `phase-3/backend/tests/`, `phase-3/frontend/tests/`

## User Stories Summary

- **US1 (P1)**: Seamless Chat Experience with Modern UI
- **US2 (P2)**: Task Management via Natural Conversation
- **US3 (P3)**: Multi-language Support with Cultural Context
- **US4 (P1)**: Persistent Chat History

## Dependencies & Execution Order

### Phase Dependencies
```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4) → Phase 7 (Polish)
```

### User Story Dependencies
- **US1** (Chat Experience): Independent - Can be tested without other stories
- **US2** (Task Management): Depends on US1 for chat interface foundation
- **US3** (Multi-language): Independent - Can be tested with basic chat
- **US4** (Chat History): Depends on US1 for chat functionality

### Parallel Execution Opportunities
- **US1** and **US3** can be developed in parallel (both independent)
- **Backend tasks** across stories can be parallelized (different files)
- **Frontend tasks** across stories can be parallelized (different components)

---

## Phase 1: Setup (Project Initialization)

### Environment & Dependencies
- [X] T001 Verify OPENAI_API_KEY environment variable exists in backend
- [X] T002 Add `openai` and `openai-chatkit` packages to backend using `uv add openai openai-chatkit`
- [X] T003 Add `@openai/chatkit-react` package to frontend using `npm install`
- [X] T004 Verify OpenAI API key has ChatKit permissions in OpenAI Platform
- [X] T005 Create database migration file for ChatKit tables
- [X] T006 Run database migration to create `chatkit_thread` and `chatkit_thread_item` tables

---

## Phase 2: Foundational (Blocking Prerequisites)

### Backend Foundation
- [X] T007 [P] Create `phase-3/backend/src/backend/chatkit_store.py` with PostgreSQL store implementation
- [X] T008 [P] Implement all 14 required Store methods in `chatkit_store.py`
- [X] T009 [P] Add user isolation validation to all store methods
- [X] T010 [P] Create `phase-3/backend/src/backend/chatkit_server.py` extending ChatKitServer
- [X] T011 [P] Implement `respond()` method in ChatKitServer
- [X] T012 [P] Integrate existing OpenAI Agents SDK logic into ChatKitServer
- [X] T013 [P] Add streaming support via ChatKit events in ChatKitServer
- [X] T014 [P] Create session endpoint handlers in `phase-3/backend/src/backend/main.py`
- [X] T015 [P] Add `/api/chatkit/session` endpoint with JWT verification
- [X] T016 [P] Add `/api/chatkit/refresh` endpoint with token refresh logic
- [X] T017 [P] Initialize ChatKit store and server in `main.py`
- [X] T018 [P] Maintain backward compatibility with existing `/api/chat` endpoint

### Frontend Foundation
- [X] T019 [P] Add ChatKit CDN script to `phase-3/frontend/src/app/layout.tsx` in body
- [X] T020 [P] Use `afterInteractive` strategy for Next.js 16+ App Router
- [X] T021 [P] Implement enhanced script loading detection using `customElements.whenDefined()`
- [X] T022 [P] Create `phase-3/frontend/src/lib/chatkit/session.ts` with session utilities
- [X] T023 [P] Implement `createChatKitSession()` function
- [X] T024 [P] Implement `refreshChatKitSession()` function
- [X] T025 [P] Create `phase-3/frontend/src/app/api/chatkit/route.ts` API route
- [X] T026 [P] Set up proper CORS configuration for session endpoints

### Database Schema
- [X] T028 [P] Create SQL migration file with `chatkit_thread` table schema
- [X] T029 [P] Create SQL migration file with `chatkit_thread_item` table schema
- [X] T030 [P] Add performance indexes for user queries and pagination
- [X] T031 [P] Add foreign key constraints with user isolation
- [X] T032 [P] Test migration in development environment

---

## Phase 3: User Story 1 - Seamless Chat Experience with Modern UI (P1)

**Goal**: Users can interact with AI agent through polished ChatKit UI with real-time messaging, loading states, and rich responses

**Independent Test**: Send a message via ChatKit UI and verify proper message bubbles, loading states, and assistant response display

### Backend - US1
- [X] T033 [P] [US1] Add context injection support to ChatKitServer
- [X] T034 [P] [US1] Implement user/page metadata extraction in `respond()` method
- [X] T035 [P] [US1] Add tool call visualization support in streaming events
- [X] T036 [P] [US1] Test OpenAI Agents SDK integration with ChatKit
- [X] T037 [P] [US1] Verify MCP tool calls work via ChatKit interface

### Frontend - US1
- [X] T038 [P] [US1] Create `phase-3/frontend/src/components/chat/ChatKitWidget.tsx` component
- [X] T039 [P] [US1] Implement `useChatKit` hook with proper configuration
- [X] T040 [P] [US1] Add custom fetch interceptor for context injection
- [X] T041 [P] [US1] Implement `getClientSecret()` function for authentication
- [X] T042 [P] [US1] Add theme configuration with accent color `#FF6B4A`
- [X] T043 [P] [US1] Configure start screen with greeting and prompts
- [X] T044 [P] [US1] Add composer placeholder text
- [X] T045 [P] [US1] Replace `phase-3/frontend/src/app/chatbot/page.tsx` with ChatKit component
- [X] T046 [P] [US1] Add loading states and error handling UI
- [X] T047 [P] [US1] Test responsive design on mobile devices
- [X] T048 [P] [US1] Verify accessibility (ARIA labels, keyboard navigation)

### Testing - US1
- [X] T049 [US1] Test message sending and receiving flow
- [X] T050 [US1] Test loading states during agent processing
- [X] T051 [US1] Test markdown rendering in agent responses
- [X] T052 [US1] Test tool call visualization in chat interface
- [X] T053 [US1] Test error handling with user-friendly messages
- [X] T054 [US1] Test mobile responsiveness
- [X] T055 [US1] Test accessibility features

---

## Phase 4: User Story 2 - Task Management via Natural Conversation (P2)

**Goal**: Users can create, view, update, and delete tasks using natural Urdu/English conversation in ChatKit interface

**Independent Test**: Send "Create a task for tomorrow" via ChatKit and verify MCP tool execution with clear visual feedback

### Backend - US2
- [X] T056 [P] [US2] Verify existing MCP tools work via ChatKit
- [X] T057 [P] [US2] Test `create_task` tool call through ChatKit interface
- [X] T058 [P] [US2] Test `list_tasks` tool call through ChatKit interface
- [X] T059 [P] [US2] Test `update_task` tool call through ChatKit interface
- [X] T060 [P] [US2] Test `delete_task` tool call through ChatKit interface
- [X] T061 [P] [US2] Test `toggle_task` tool call through ChatKit interface
- [X] T062 [P] [US2] Add tool result visualization in streaming responses
- [X] T063 [P] [US2] Implement error handling for failed tool calls

### Frontend - US2
- [X] T064 [P] [US2] Configure ChatKit composer with task management placeholder
- [X] T065 [P] [US2] Add task-related prompts to start screen
- [X] T066 [P] [US2] Test natural language task commands in chat
- [X] T067 [P] [US2] Verify tool call visual feedback in UI
- [X] T068 [P] [US2] Test conversation context maintenance
- [X] T069 [P] [US2] Add Urdu task management prompts

### Testing - US2
- [X] T070 [US2] Test "create task for tomorrow" command
- [X] T071 [US2] Test "show my tasks" command
- [X] T072 [US2] Test task updates via natural language
- [X] T073 [US2] Test tool call visual separation in UI
- [X] T074 [US2] Test context preservation across multiple messages
- [X] T075 [US2] Test Urdu language task commands

---

## Phase 5: User Story 3 - Multi-language Support with Cultural Context (P3)

**Goal**: Urdu-speaking users can interact comfortably with proper text direction, font support, and cultural appropriateness

**Independent Test**: Send Urdu message "میرے ٹاسک دکھاؤ" and verify proper rendering and Urdu response

### Backend - US3
- [X] T076 [P] [US3] Verify UrduSpecialist agent integration with ChatKit
- [X] T077 [P] [US3] Test Urdu text processing in agent responses
- [X] T078 [P] [US3] Add cultural context to agent instructions
- [X] T079 [P] [US3] Test RTL (right-to-left) text support in streaming

### Frontend - US3
- [X] T080 [P] [US3] Add Urdu language support to ChatKit UI
- [X] T081 [P] [US3] Configure proper font support for Urdu script
- [X] T082 [P] [US3] Test Urdu text input in chat composer
- [X] T083 [P] [US3] Test Urdu text rendering in agent responses
- [X] T084 [P] [US3] Verify proper text direction (RTL) for Urdu
- [X] T085 [P] [US3] Add Urdu-specific prompts to start screen

### Testing - US3
- [X] T086 [US3] Test Urdu text input and display
- [X] T087 [US3] Test mixed Urdu/English conversations
- [X] T088 [US3] Test RTL layout rendering
- [X] T089 [US3] Test cultural appropriateness in responses

---

## Phase 6: User Story 4 - Persistent Chat History (P1)

**Goal**: All chat conversations automatically saved to Neon database and accessible across sessions/devices

**Independent Test**: Have conversation, refresh page, verify previous messages load automatically

### Backend - US4
- [X] T090 [P] [US4] Implement thread persistence in `PostgresChatKitStore`
- [X] T091 [P] [US4] Add thread creation and storage logic
- [X] T092 [P] [US4] Implement message storage for user and assistant messages
- [X] T093 [P] [US4] Add tool call and tool result storage
- [X] T094 [P] [US4] Implement thread loading with user isolation
- [X] T095 [P] [US4] Add thread listing with pagination
- [X] T096 [P] [US4] Implement thread metadata storage (title, model, context)
- [X] T097 [P] [US4] Add error message storage for debugging
- [X] T098 [P] [US4] Test user isolation (users can't access each other's threads)
- [X] T099 [P] [US4] Test cascade delete when user is deleted

### Frontend - US4
- [X] T100 [P] [US4] Implement localStorage-based thread ID persistence
- [X] T101 [P] [US4] Add thread management utilities
- [X] T102 [P] [US4] Implement thread loading on page refresh
- [X] T103 [P] [US4] Add thread switching functionality
- [X] T104 [P] [US4] Test thread persistence across browser sessions
- [X] T105 [P] [US4] Add error handling for localStorage failures
- [X] T106 [P] [US4] Implement fallback to server-side storage if localStorage fails

### Testing - US4
- [X] T107 [US4] Test thread creation and persistence
- [X] T108 [US4] Test thread loading after page refresh
- [X] T109 [US4] Test multi-device thread access
- [X] T110 [US4] Test user isolation in thread access
- [X] T111 [US4] Test localStorage error handling
- [X] T112 [US4] Test large conversation history performance

---

## Phase 7: Integration, Security & Performance Testing

### Integration Testing
- [X] T113 [P] Test complete user flow: Login → ChatKit → MCP Tools → Logout
- [X] T114 [P] Test session creation flow with authentication
- [X] T115 [P] Test session refresh flow
- [X] T116 [P] Test context injection (user/page metadata reaches agent)
- [X] T117 [P] Test multi-user isolation (different users see different data)
- [X] T118 [P] Test backward compatibility with existing frontend
- [X] T119 [P] Test error recovery and graceful degradation

### Security Testing
- [X] T120 [P] Verify JWT validation in session endpoints
- [X] T121 [P] Test CORS configuration
- [X] T122 [P] Verify user isolation in all database queries
- [X] T123 [P] Test httpOnly cookie handling
- [X] T124 [P] Test rate limiting on session endpoints
- [X] T125 [P] Verify no JWT leakage in frontend code
- [X] T126 [P] Test SQL injection prevention in store methods

### Performance Testing
- [X] T127 [P] Test streaming performance (target: <200ms p95)
- [X] T128 [P] Verify database query optimization
- [X] T129 [P] Test concurrent user sessions (target: 1000+ users)
- [X] T130 [P] Monitor memory usage with MCP servers
- [X] T131 [P] Test ChatKit bundle size (target: <200KB gzipped)
- [X] T132 [P] Test chat history load time (target: <1.5s for 50+ messages)

### Production Deployment Preparation
- [X] T133 [P] Configure production environment variables
- [X] T134 [P] Add production domains to OpenAI Platform allowlist
- [X] T135 [P] Test CDN script loading in production build
- [X] T136 [P] Set up monitoring for session creation success rate
- [X] T137 [P] Configure logging for security auditing
- [X] T138 [P] Test production deployment in staging environment
- [X] T139 [P] Update API documentation for new endpoints

---

## Success Criteria Validation

### Backend Acceptance Criteria
- [X] T140 [P] **CRITICAL**: `OPENAI_API_KEY` environment variable is set and validated
- [X] T141 [P] `/api/chatkit/` returns valid `client_secret`
- [X] T142 [P] `/api/chatkit/` handles token refresh correctly
- [X] T143 [P] ChatKitStore implements all 14 required methods
- [X] T144 [P] User isolation works (different users can't see each other's threads)
- [X] T145 [P] MCP tools work via ChatKit integration
- [X] T146 [P] Existing agents (Orchestrator + UrduSpecialist) work unchanged
- [X] T147 [P] Streaming responses work correctly
- [X] T148 [P] Error handling is robust

### Frontend Acceptance Criteria
- [X] T149 [P] **CRITICAL**: ChatKit CDN script loads in HTML body (not head) for Next.js 16+
- [X] T150 [P] **CRITICAL**: Enhanced script loading detection works using `customElements.whenDefined()`
- [X] T151 [P] ChatKit UI loads and displays correctly
- [X] T152 [P] Session creation works with httpOnly cookies
- [X] T153 [P] Custom fetch interceptor injects context correctly
- [X] T154 [P] **CRITICAL**: Thread persistence via localStorage works (survives page refresh)
- [X] T155 [P] Thread IDs are properly managed and stored in localStorage
- [X] T156 [P] Tool calls are displayed properly in UI
- [X] T157 [P] Error states are handled gracefully
- [X] T158 [P] Mobile responsiveness maintained
- [X] T159 [P] Existing auth flow still works

### Integration Acceptance Criteria
- [X] T160 [P] Complete user flow: Login → ChatKit → MCP Tools → Logout
- [X] T161 [P] Context injection: User info and page context reach agent
- [X] T162 [P] Multi-user isolation: Users see only their own threads
- [X] T163 [P] Performance: <200ms p95 for agent responses
- [X] T164 [P] Security: No JWT leakage, proper CORS, user isolation

---

## File Structure Reference

### New Backend Files
- `phase-3/backend/src/backend/chatkit_server.py` - ChatKitServer implementation
- `phase-3/backend/src/backend/chatkit_store.py` - PostgreSQL store (14 methods)
- `phase-3/backend/src/backend/models/chatkit.py` - ChatKit database models
- `phase-3/backend/migrations/001_chatkit_tables.sql` - Database migration
- `phase-3/backend/setup_chatkit.py` - Setup and validation script
- `phase-3/backend/test_chatkit.py` - ChatKit session tests
- `phase-3/backend/test_chatkit_session.py` - ChatKit session tests

### Modified Backend Files
- `phase-3/backend/src/backend/main.py` - + session endpoints
- `phase-3/backend/src/backend/models/__init__.py` - + ChatKit models export
- `phase-3/backend/pyproject.toml` - + openai package dependency

### New Frontend Files
- `phase-3/frontend/src/components/chat/ChatKitWidget.tsx` - ChatKit integration (contains EnhancedChatKitWidget)
- `phase-3/frontend/src/lib/chatkit/session.ts` - Session utilities
- `phase-3/frontend/src/app/chatkit/page.tsx` - Dedicated ChatKit page
- `phase-3/frontend/src/app/api/chatkit/route.ts` - ChatKit proxy endpoint

### Modified Frontend Files
- `phase-3/frontend/src/app/layout.tsx` - + ChatKit CDN script
- `phase-3/frontend/package.json` - + @openai/chatkit-react dependency

---

## Parallel Execution Examples

### Example 1: Backend Foundation (Phase 2)
```bash
# These can be done in parallel since they work on different files:
- [ ] T007 Create chatkit_store.py
- [ ] T010 Create chatkit_server.py
- [ ] T014 Add session endpoints to main.py
```

### Example 2: User Stories 1 & 3 (Independent)
```bash
# These can be developed in parallel since they're independent:
# Team A: US1 - Chat Experience
- [ ] T038 Create ChatKitWidget component
- [ ] T039 Implement useChatKit hook
- [ ] T040 Add custom fetch interceptor

# Team B: US3 - Multi-language Support
- [ ] T080 Add Urdu language support
- [ ] T081 Configure Urdu font support
- [ ] T082 Test Urdu text input
```

### Example 3: Frontend Components (Phase 3-6)
```bash
# These frontend tasks can be parallelized:
- [ ] T038 [US1] Create ChatKitWidget component
- [ ] T100 [US4] Implement localStorage thread persistence
- [ ] T080 [US3] Add Urdu language support
```

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)
**Focus on User Story 1 first** - This provides the core chat experience:
1. **Phase 1**: Setup environment and dependencies
2. **Phase 2**: Foundational backend and frontend infrastructure
3. **Phase 3**: Complete US1 - Seamless Chat Experience
4. **Testing**: Validate core functionality before adding other stories

### Incremental Delivery
1. **Week 1**: Complete Phases 1-3 (MVP: Basic ChatKit integration)
2. **Week 2**: Complete Phases 4-6 (Enhanced features: Task management, Urdu, History)
3. **Week 3**: Complete Phase 7 (Polish, testing, deployment)

### Risk Mitigation
- **OpenAI API Key**: Verify early (Phase 1, Task T001)
- **CDN Loading**: Test in development immediately (Phase 2, Task T019)
- **MCP Tool Compatibility**: Test early with simple tools (Phase 3, Task T037)
- **Thread Persistence**: Implement robust error handling (Phase 6, Task T106)

---

## Testing Strategy

### Unit Tests (Backend)
- Test all 14 Store methods in isolation
- Test session endpoint authentication
- Test user isolation in queries
- Test error handling in ChatKitServer

### Integration Tests (Frontend)
- Test complete user flows
- Test session creation and refresh
- Test tool call visualization
- Test localStorage persistence

### End-to-End Tests
- Test complete user journey: Login → Chat → Task Management → Logout
- Test multi-user scenarios
- Test error recovery paths
- Test performance under load

---

## Monitoring & Observability

### Key Metrics to Track
- Session creation success rate
- ChatKit UI loading time
- Agent response time (p95)
- MCP tool execution success rate
- Error rates by endpoint
- User isolation violations (security)

### Alerting Thresholds
- Session creation failure rate > 5%
- Response time p95 > 200ms
- User isolation violations > 0
- ChatKit loading failures > 1%

---

## Critical Success Factors

### OpenAI API Key (CRITICAL)
- **Requirement**: OPENAI_API_KEY environment variable must be set
- **Location**: Backend .env file
- **Verification**: Test session creation before UI work
- **Impact**: Without this, entire integration fails

### All 14 Store Methods (CRITICAL)
- **Requirement**: PostgresChatKitStore must implement ALL abstract methods
- **Common Mistake**: Forgetting attachment methods (12-14)
- **Verification**: Run store implementation check before integration
- **Impact**: Missing methods cause "Can't instantiate abstract class" error

### CDN Script Location (CRITICAL)
- **Requirement**: ChatKit.js must be in HTML body, not head
- **Location**: phase-3/frontend/src/app/layout.tsx
- **Verification**: Check browser console for script loading errors
- **Impact**: Wrong location causes blank chat UI

### User Isolation (CRITICAL)
- **Requirement**: All database queries must include user ID filtering
- **Location**: PostgresChatKitStore._get_user_id_from_context()
- **Verification**: Test with multiple users before deployment
- **Impact**: Missing isolation causes data leaks between users

### Domain Allowlist (PRODUCTION)
- **Requirement**: Register domains in OpenAI Platform Dashboard
- **Location**: OpenAI Platform → Security → Domain Allowlist
- **Verification**: Test on production domains before go-live
- **Impact**: Unregistered domains cause ChatKit to refuse loading

---

**Next Steps**: Start with Phase 1, Task T001 (Verify OPENAI_API_KEY environment variable)

**Questions or blockers?** Refer to the design documents in `specs/008-chatkit-integration/` for detailed implementation guidance.

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **CRITICAL**: Test session creation before any UI work - OpenAI API key is required
- **CRITICAL**: Implement all 14 Store methods or integration will fail
- **CRITICAL**: Add CDN script to HTML body, not head, for Next.js 16+ App Router