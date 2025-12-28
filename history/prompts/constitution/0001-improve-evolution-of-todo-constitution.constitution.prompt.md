---
id: 0001
title: Improve Evolution of Todo constitution
stage: constitution
date: 2025-12-28
surface: agent
model: claude-sonnet-4-5
feature: none
branch: master
user: user
command: /sp.constitution make constitution, improve it if needed
labels: ["constitution", "governance", "architecture"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md (updated)
tests:
  - No tests required for constitution changes
---

## Prompt

make constitution, improve it if needed

# [Evolution of Todo] Constitution

## Core Principles

### I. Universal Logic Decoupling
**Business logic must remain independent of the presentation layer.**
The core Todo management logic (CRUD, state transitions) must reside in a dedicated service layer or module, decoupled from the interface (CLI, REST API, or Chatbot). This ensures that the same logic powers the Phase I Console, the Phase II Web App, and the Phase III AI Agent without duplication or drift.

### II. AI-Native Interoperability (MCP-First)
**The system is architected for AI Agents as primary users.**
All core functionalities must be exposed via the **Model Context Protocol (MCP)**. Tools exposed to Agents must be stateless, strictly typed, and idempotent where possible. The system must support natural language processing by providing clear, distinct tool definitions (e.g., `add_task`, `list_tasks`) that map directly to business logic.

### III. Strict Statelessness
**Application services must be ephemeral and horizontally scalable.**
The backend (FastAPI) and AI Agents must never store conversation state or session data in local memory. All state must be persisted immediately to the database (Neon PostgreSQL) or the Event Bus (Kafka). This ensures the system can survive pod restarts in Kubernetes (Phase IV) and scale across multiple nodes (Phase V).

### IV. Event-Driven Decoupling
**Asynchronous communication takes precedence over direct coupling.**
For advanced features (Reminders, Auditing, Recurring Tasks), services must communicate via **Event Streams** (Kafka/Redpanda) abstracted through **Dapr Pub/Sub**. Direct synchronous HTTP calls between microservices are prohibited for non-critical path operations to prevent cascading failures.

### V. Zero-Trust Multi-Tenancy
**Data isolation is enforced at the query level.**
Every database query and API response must be scoped to the authenticated `user_id`. The system must enforce "Row Level Security" logic in the application layer, ensuring no user can access, modify, or delete another user's tasks. Authentication tokens (JWT) must be validated on every request.

## Technical Standards & Constraints

### Technology Stack Integrity
The project must strictly adhere to the defined Agentic Dev Stack. No unauthorized libraries may be introduced.
*   **Backend:** Python 3.13+, FastAPI, SQLModel.
*   **Frontend:** Next.js 16+ (App Router), TypeScript, Tailwind CSS.
*   **Database:** Neon Serverless PostgreSQL (via SQLModel/SQLAlchemy).
*   **AI/Agents:** OpenAI Agents SDK, Official MCP SDK, OpenAI ChatKit.
*   **Infrastructure:** Docker, Kubernetes (Minikube/DOKS), Helm, Dapr, Kafka (Redpanda).

### Data Consistency & Schema
*   **Typing:** Strict static typing is mandatory. Python must use Type Hints (`typing` module) and Pydantic models. Frontend must use TypeScript interfaces.
*   **Validation:** All inputs must be validated at the API boundary using Pydantic schemas before reaching business logic.
*   **Persistence:** Database schemas must be defined via SQLModel code-first approaches.

### Security Protocols
*   **Authentication:** Better Auth with JWT strategy.
*   **Secrets:** No hardcoded credentials. Secrets must be loaded from environment variables or (in later phases) Kubernetes/Dapr Secret Stores.
*   **Communication:** Internal service-to-service communication in Phase V must use mTLS (managed by Dapr sidecars).

## Operational Standards

### Observability & Auditing
Every state-changing operation (Create, Update, Delete) must be logged. In Phase V, these operations must emit distinct events (e.g., `task-created`, `task-completed`) to the Audit topic in Kafka, enabling a reconstructible history of user actions.

### Deployment Portability
The application must be container-native. Configuration must be injected via Environment Variables, allowing the same container image to run in Local Docker, Minikube, and Cloud Kubernetes without modification.

## Governance

### Architectural Supremacy
This Constitution defines the hard constraints of the "Evolution of Todo" system. In the event of a conflict between a specific Spec requirement and these Principles (e.g., a spec asking for in-memory session storage), this Constitution takes precedence (requiring DB persistence), and the Spec must be corrected.

**Version**: 2.0.0 | **Ratified**: 2025-12-28 | **Last Amended**: 2025-12-28

## Response snapshot

Successfully created a comprehensive constitution for the "Evolution of Todo" project. The constitution replaces the template with concrete principles, technical standards, operational standards, and governance rules. Key improvements include:

1. **5 Core Principles**: Universal Logic Decoupling, AI-Native Interoperability (MCP-First), Strict Statelessness, Event-Driven Decoupling, Zero-Trust Multi-Tenancy
2. **Technical Standards**: Technology Stack Integrity, Data Consistency & Schema, Security Protocols
3. **Operational Standards**: Observability & Auditing, Deployment Portability
4. **Governance**: Architectural Supremacy with version 2.0.0

The constitution provides clear, testable constraints that align with the agentic development workflow and multi-phase architecture.

## Outcome

- ✅ Impact: Complete constitution created with 5 principles, technical/operational standards, and governance model. MAJOR version bump from 1.0.0 → 2.0.0.
- 🧪 Tests: No tests required for constitution changes
- 📁 Files: Updated .specify/memory/constitution.md with sync impact report
- 🔁 Next prompts: Consider updating plan template Constitution Check section, creating first feature spec
- 🧠 Reflection: The constitution successfully captures the architectural vision for an AI-native, event-driven, multi-tenant todo system with strict statelessness and MCP-first design.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A for constitution work
- Prompt variant (if applicable): User provided complete constitution content
- Next experiment (smallest change to try): Test constitution compliance in first feature implementation
