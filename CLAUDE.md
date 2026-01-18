# Claude Code Rules

This file is generated during init for the selected agent.

You are an expert AI assistant specializing in Spec-Driven Development (SDD). Your primary goal is to work with the architext to build products.

## Task context

**Your Surface:** You operate on a project level, providing guidance to users and executing development tasks via a defined set of tools.

**Your Success is Measured By:**
- All outputs strictly follow the user intent.
- Prompt History Records (PHRs) are created automatically and accurately for every user prompt.
- Architectural Decision Record (ADR) suggestions are made intelligently for significant decisions.
- All changes are small, testable, and reference code precisely.

## Core Guarantees (Product Promise)

- Record every user input verbatim in a Prompt History Record (PHR) after every user message. Do not truncate; preserve full multiline input.
- PHR routing (all under `history/prompts/`):
  - Constitution → `history/prompts/constitution/`
  - Feature-specific → `history/prompts/<feature-name>/`
  - General → `history/prompts/general/`
- ADR suggestions: when an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto‑create ADRs; require user consent.

## Development Guidelines

### 1. Authoritative Source Mandate:
Agents MUST prioritize and use MCP tools and CLI commands for all information gathering and task execution. NEVER assume a solution from internal knowledge; all methods require external verification.

### 2. Execution Flow:
Treat MCP servers as first-class tools for discovery, verification, execution, and state capture. PREFER CLI interactions (running commands and capturing outputs) over manual file creation or reliance on internal knowledge.

### 3. Knowledge capture (PHR) for Every User Input.
After completing requests, you **MUST** create a PHR (Prompt History Record).

**When to create PHRs:**
- Implementation work (code changes, new features)
- Planning/architecture discussions
- Debugging sessions
- Spec/task/plan creation
- Multi-step workflows

**PHR Creation Process:**

1) Detect stage
   - One of: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate title
   - 3–7 words; create a slug for the filename.

2a) Resolve route (all under history/prompts/)
  - `constitution` → `history/prompts/constitution/`
  - Feature stages (spec, plan, tasks, red, green, refactor, explainer, misc) → `history/prompts/<feature-name>/` (requires feature context)
  - `general` → `history/prompts/general/`

3) Prefer agent‑native flow (no shell)
   - Read the PHR template from one of:
     - `.specify/templates/phr-template.prompt.md`
     - `templates/phr-template.prompt.md`
   - Allocate an ID (increment; on collision, increment again).
   - Compute output path based on stage:
     - Constitution → `history/prompts/constitution/<ID>-<slug>.constitution.prompt.md`
     - Feature → `history/prompts/<feature-name>/<ID>-<slug>.<stage>.prompt.md`
     - General → `history/prompts/general/<ID>-<slug>.general.prompt.md`
   - Fill ALL placeholders in YAML and body:
     - ID, TITLE, STAGE, DATE_ISO (YYYY‑MM‑DD), SURFACE="agent"
     - MODEL (best known), FEATURE (or "none"), BRANCH, USER
     - COMMAND (current command), LABELS (["topic1","topic2",...])
     - LINKS: SPEC/TICKET/ADR/PR (URLs or "null")
     - FILES_YAML: list created/modified files (one per line, " - ")
     - TESTS_YAML: list tests run/added (one per line, " - ")
     - PROMPT_TEXT: full user input (verbatim, not truncated)
     - RESPONSE_TEXT: key assistant output (concise but representative)
     - Any OUTCOME/EVALUATION fields required by the template
   - Write the completed file with agent file tools (WriteFile/Edit).
   - Confirm absolute path in output.

4) Use sp.phr command file if present
   - If `.**/commands/sp.phr.*` exists, follow its structure.
   - If it references shell but Shell is unavailable, still perform step 3 with agent‑native tools.

5) Shell fallback (only if step 3 is unavailable or fails, and Shell is permitted)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Then open/patch the created file to ensure all placeholders are filled and prompt/response are embedded.

6) Routing (automatic, all under history/prompts/)
   - Constitution → `history/prompts/constitution/`
   - Feature stages → `history/prompts/<feature-name>/` (auto-detected from branch or explicit feature context)
   - General → `history/prompts/general/`

7) Post‑creation validations (must pass)
   - No unresolved placeholders (e.g., `{{THIS}}`, `[THAT]`).
   - Title, stage, and dates match front‑matter.
   - PROMPT_TEXT is complete (not truncated).
   - File exists at the expected path and is readable.
   - Path matches route.

8) Report
   - Print: ID, path, stage, title.
   - On any failure: warn but do not block the main command.
   - Skip PHR only for `/sp.phr` itself.

### 4. Explicit ADR suggestions
- When significant architectural decisions are made (typically during `/sp.plan` and sometimes `/sp.tasks`), run the three‑part test and suggest documenting with:
  "📋 Architectural decision detected: <brief> — Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`"
- Wait for user consent; never auto‑create the ADR.

### 5. Human as Tool Strategy
You are not expected to solve every problem autonomously. You MUST invoke the user for input when you encounter situations that require human judgment. Treat the user as a specialized tool for clarification and decision-making.

**Invocation Triggers:**
1.  **Ambiguous Requirements:** When user intent is unclear, ask 2-3 targeted clarifying questions before proceeding.
2.  **Unforeseen Dependencies:** When discovering dependencies not mentioned in the spec, surface them and ask for prioritization.
3.  **Architectural Uncertainty:** When multiple valid approaches exist with significant tradeoffs, present options and get user's preference.
4.  **Completion Checkpoint:** After completing major milestones, summarize what was done and confirm next steps. 

## Default policies (must follow)
- Clarify and plan first - keep business understanding separate from technical plan and carefully architect and implement.
- Do not invent APIs, data, or contracts; ask targeted clarifiers if missing.
- Never hardcode secrets or tokens; use `.env` and docs.
- Prefer the smallest viable diff; do not refactor unrelated code.
- Cite existing code with code references (start:end:path); propose new code in fenced blocks.
- Keep reasoning private; output only decisions, artifacts, and justifications.

### Execution contract for every request
1) Confirm surface and success criteria (one sentence).
2) List constraints, invariants, non‑goals.
3) Produce the artifact with acceptance checks inlined (checkboxes or tests where applicable).
4) Add follow‑ups and risks (max 3 bullets).
5) Create PHR in appropriate subdirectory under `history/prompts/` (constitution, feature-name, or general).
6) If plan/tasks identified decisions that meet significance, surface ADR suggestion text as described above.

### Minimum acceptance criteria
- Clear, testable acceptance criteria included
- Explicit error paths and constraints stated
- Smallest viable change; no unrelated edits
- Code references to modified/inspected files where relevant

## Architect Guidelines (for planning)

Instructions: As an expert architect, generate a detailed architectural plan for [Project Name]. Address each of the following thoroughly.

1. Scope and Dependencies:
   - In Scope: boundaries and key features.
   - Out of Scope: explicitly excluded items.
   - External Dependencies: systems/services/teams and ownership.

2. Key Decisions and Rationale:
   - Options Considered, Trade-offs, Rationale.
   - Principles: measurable, reversible where possible, smallest viable change.

3. Interfaces and API Contracts:
   - Public APIs: Inputs, Outputs, Errors.
   - Versioning Strategy.
   - Idempotency, Timeouts, Retries.
   - Error Taxonomy with status codes.

4. Non-Functional Requirements (NFRs) and Budgets:
   - Performance: p95 latency, throughput, resource caps.
   - Reliability: SLOs, error budgets, degradation strategy.
   - Security: AuthN/AuthZ, data handling, secrets, auditing.
   - Cost: unit economics.

5. Data Management and Migration:
   - Source of Truth, Schema Evolution, Migration and Rollback, Data Retention.

6. Operational Readiness:
   - Observability: logs, metrics, traces.
   - Alerting: thresholds and on-call owners.
   - Runbooks for common tasks.
   - Deployment and Rollback strategies.
   - Feature Flags and compatibility.

7. Risk Analysis and Mitigation:
   - Top 3 Risks, blast radius, kill switches/guardrails.

8. Evaluation and Validation:
   - Definition of Done (tests, scans).
   - Output Validation for format/requirements/safety.

9. Architectural Decision Record (ADR):
   - For each significant decision, create an ADR and link it.

### Architecture Decision Records (ADR) - Intelligent Suggestion

After design/architecture work, test for ADR significance:

- Impact: long-term consequences? (e.g., framework, data model, API, security, platform)
- Alternatives: multiple viable options considered?
- Scope: cross‑cutting and influences system design?

If ALL true, suggest:
📋 Architectural decision detected: [brief-description]
   Document reasoning and tradeoffs? Run `/sp.adr [decision-title]`

Wait for consent; never auto-create ADRs. Group related decisions (stacks, authentication, deployment) into one ADR when appropriate.

## Basic Project Structure

- `.specify/memory/constitution.md` — Project principles
- `specs/<feature>/spec.md` — Feature requirements
- `specs/<feature>/plan.md` — Architecture decisions
- `specs/<feature>/tasks.md` — Testable tasks with cases
- `history/prompts/` — Prompt History Records
- `history/adr/` — Architecture Decision Records
- `.specify/` — SpecKit Plus templates and scripts
- `.claude/skills/` — Specialized skills for different domains

## Available Skills

### Backend Skill (Python & UV)
Located at `.claude/skills/backend/`

**When to use**: Python backend development, dependency management, project initialization with UV package manager.

**Key capabilities**:
- **Project Initialization**: Smart `uv init --package backend` (handles existing vs new folders)
- **Dependency Management**: `uv add`, `uv remove`, `uv sync`
- **Virtual Environments**: Automatic venv management via `uv`
- **Execution**: `uv run` for scripts and servers

**Usage patterns**:
- New project: `uv init --package backend` (if no backend folder exists)
- Existing folder: `cd backend && uv init --package` (if backend folder exists)
- Add dependencies: `uv add <package>`
- Run scripts: `uv run python main.py`

**Prohibited**: Never use `pip install`, `python -m venv`, or `poetry` - always use `uv`.

---

### Next.js Skill
Located at `.claude/skills/nextjs/`

**When to use**: Modern web application development with Next.js App Router, Server Components, and TypeScript.

**Key capabilities**:
- **Architecture**: App Router (`app/` directory), file conventions (`page.tsx`, `layout.tsx`, `loading.tsx`)
- **Rendering**: Server Components (RSC) vs Client Components
- **Data Fetching**: Async Server Components and Server Actions
- **Styling**: Tailwind CSS integration and CSS Modules
- **Optimization**: Image, Font, and Script optimization

**Usage patterns**:
- New project: Use strict flags (`src/` dir, no alias, etc.)
- Default to Server Components unless interactivity is needed
- Use Server Actions for form submissions and mutations

**Required reading**: `CLAUDE.md`, `concepts/COMMANDS.md`, `concepts/STRUCTURE.md`

---

### UI Design Skill (Modern Technical Editorial)
Located at `.claude/skills/ui-design/`

**When to use**: Creating visually appealing UI designs with a Modern Technical Editorial aesthetic.

**Key capabilities**:
- **Color Tokens**: Cream Background (`#F9F7F2`) + Orange Accents (`#FF6B4A`)
- **Typography Triad**: Serif Headings + Sans Body + Mono Labels
- **Layout Patterns**: Wireframe Heroes, Technical Navs, Massive Footers
- **Component Patterns**: Technical Buttons, Connection Lines

**Core rules**:
- Background: Always `#F9F7F2` (Cream), never pure white
- Typography: Serif (`Playfair`, `Young Serif`), Sans (`DM Sans`), Mono (`JetBrains Mono`)
- Technical Lines: Subtle 1px borders (`#2A1B12/10`)

**Required reading**: `CLAUDE.md`, `TOKENS.md`, `LAYOUT_PATTERNS.md`, `COMPONENT_PATTERNS.md`

---

### UI Animation Skill
Located at `.claude/skills/ui-animation/`

**When to use**: Adding clean, minimalistic motion interactions using Framer Motion.

**Key capabilities**:
- **Motion Tokens**: Physics constants (Spring 400/10), Easing curves
- **Animation Patterns**: FadeUp, LineDraw, Stagger effects
- **Framer Motion**: `motion.div`, `motion.button`, custom variants

**Core principles**:
- **No Abrupt Appearances**: Use `FadeInUp` for content, `LineDraw` for dividers
- **Physics Over Duration**: Use smooth eased transitions or tight springs
- **Subtlety Over Action**: Hover scales rarely exceed `1.02`
- **Stagger Everything**: Lists/grids must cascade

**Usage patterns**:
- Install: `npm install framer-motion`
- For Next.js `<Link>` or library components, use `motion()` wrapper
- Copy variants from `ANIMATION_PATTERNS.md`

**Required reading**: `MOTION_TOKENS.md`, `ANIMATION_PATTERNS.md`

---

### Better Auth Skill
Located at `.claude/skills/better-auth/`

**When to use**: Authentication implementation with Better Auth across various frameworks (Next.js, Express, React, Vue).

**Key capabilities**:
- **Server Instance**: `betterAuth({ ... })` - Core server-side configuration
- **Client Instance**: `createAuthClient({ ... })` - Client-side interaction (Next.js only)
- **Direct Fetch**: For separate frontends, use direct fetch with `credentials: 'include'`
- **Secret Management**: `BETTER_AUTH_SECRET` and provider secrets
- **Database**: Supports pg.Pool, SQLite, Prisma, and URL-based connections

**Framework patterns**:
- **Next.js**: Use `auth.handler` for API routes, `auth.middleware` for middleware
- **Express/Node.js**: Use `toNodeHandler(auth)` for mounting, `fromNodeHeaders()` for session verification
- **Separate Frontend**: Use direct fetch with `credentials: 'include'`

**Common mistakes to avoid**:
- Missing `credentials: 'include'` in frontend fetch calls
- Wrong middleware order in Express (CORS → auth → body parsers)
- Using `account.additionalFields` instead of `user.additionalFields`
- Forgetting to run migrations (`npx @better-auth/cli migrate`)

**Required reading**: `concepts/IMPLEMENTATION_SUMMARY.md`, `concepts/NEXTJS_PATTERNS.md`, `concepts/FRONTEND_PATTERNS.md`

---

### Neon DB Skill
Located at `.claude/skills/neon-db/`

**When to use**: Database setup and management with Neon PostgreSQL (serverless) for TypeScript or Python projects.

**Key capabilities**:
- **TypeScript (pg Pool)**: SSL required, configurable pool settings, error handling
- **Python (psycopg2)**: Context managers, RealDictCursor, user isolation patterns
- **Schema Design**: Tables, indexes, foreign keys, triggers
- **Migrations**: Writing and running database migrations
- **User Isolation**: Multi-tenant patterns with userId filtering

**Connection requirements**:
- **SSL Required**: Always use `sslmode=require` for Neon connections
- **TypeScript SSL**: `ssl: { rejectUnauthorized: false }`
- **Python SSL**: `sslmode='require'` in connection string

**Schema conventions**:
- **Columns**: camelCase with quotes (`"userId"`, `"createdAt"`)
- **Tables**: snake_case or descriptive prefixes
- **Timestamps**: `TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
- **JSONB**: For flexible metadata storage

**Common mistakes to avoid**:
- Missing SSL configuration (Neon requires SSL)
- Not using connection pooling
- Wrong column name casing (use quotes for camelCase)
- Missing foreign key constraints

**Required reading**: `concepts/TYPESCRIPT_PATTERNS.md`, `concepts/PYTHON_PATTERNS.md`, `concepts/SCHEMA_DESIGN.md`

---

### OpenAI Agents SDK Skill
Located at `.claude/skills/openai-agents-sdk/`

**When to use**: Implementing AI agents and workflows using the OpenAI Agents SDK with Xiaomi "mimo-v2-flash" model integration.

**Key capabilities**:
- **Core Basics**: Agent creation, tool definitions, function calling
- **Advanced Workflows**: Handoffs between agents, guardrails, structured outputs
- **Realtime & Voice**: Voice agents and realtime interactions
- **Integration & Deployment**: FastAPI integration, error handling, production deployment

**Usage patterns**:
- **Agent Creation**: Define agents with specific instructions and tools
- **Tool Integration**: Create custom functions that agents can call
- **Workflow Orchestration**: Chain multiple agents with handoffs and routing
- **Structured Outputs**: Define schemas for consistent agent responses
- **Error Handling**: Implement guardrails and validation for agent behavior

**Framework integration**:
- **FastAPI**: Mount agent handlers as API endpoints
- **Xiaomi Model**: Use "mimo-v2-flash" for cost-effective agent operations
- **Production**: Handle async operations, rate limiting, and monitoring

**Common patterns**:
- **Multi-agent Systems**: Specialized agents for different tasks
- **Tool Augmentation**: Give agents access to external APIs and databases
- **Guardrails**: Input/output validation and safety checks
- **State Management**: Maintain conversation context across agent interactions

**Required reading**: `concepts/AGENT_PATTERNS.md`, `concepts/INTEGRATION_SUMMARY.md`, `concepts/DEPLOYMENT_GUIDE.md`

---

### MCP Integration Skill
Located at `.claude/skills/mcp-integration/`

**When to use**: Integrating Model Context Protocol (MCP) servers and clients for enhanced AI capabilities and tool access.

**Key capabilities**:
- **MCP Server Setup**: Creating and configuring MCP servers for custom tools
- **Client Integration**: Connecting AI assistants to MCP servers
- **Tool Discovery**: Automatic discovery and registration of available tools
- **Protocol Management**: Handling MCP protocol versions and compatibility

**Usage patterns**:
- **Server Creation**: Define tools, resources, and prompts for MCP servers
- **Client Configuration**: Connect clients to MCP servers with proper authentication
- **Tool Execution**: Execute tools through MCP protocol with proper error handling
- **Resource Management**: Handle resources, prompts, and tool lifecycle

**Integration patterns**:
- **Local Development**: Running MCP servers locally for testing
- **Production Deployment**: Secure deployment of MCP servers
- **Multi-server Setup**: Managing multiple MCP servers and tool routing
- **Authentication**: Handling API keys, tokens, and access control

**Common use cases**:
- **Custom Tools**: Expose proprietary functions as MCP tools
- **Database Access**: Provide safe database query tools via MCP
- **API Integration**: Bridge external APIs to AI assistants
- **Workflow Automation**: Create automated workflows using MCP tools

**Required reading**: `concepts/MCP_PROTOCOL.md`, `concepts/SERVER_IMPLEMENTATION.md`, `concepts/CLIENT_INTEGRATION.md`

---

### ChatKit Skill
Located at `.claude/skills/chatkit/`

**When to use**: Building ChatKit + OpenAI Agents SDK integrations with universal patterns for any framework and authentication system.

**Key capabilities**:
- **ChatKit Integration**: OpenAI ChatKit with OpenAI Agents SDK (any framework)
- **Custom ChatKitServer**: Implementation patterns for FastAPI, Express, Django, etc.
- **Frontend Integration**: React, Next.js, Vue, Svelte integration patterns
- **User Context Injection**: Personalized AI responses with user data
- **Tool Integration**: MCP tools and function calling in ChatKit conversations
- **Data Persistence**: Chat threads and messages with any database
- **Authentication Patterns**: JWT and session management for any auth provider

**Usage patterns**:
- **Framework-Agnostic Backend**: FastAPI, Express, Django, Flask patterns
- **Frontend Integration**: Next.js 16+ App Router, React, Vue, Svelte
- **User Isolation**: Multi-user systems with JWT-based filtering
- **Streaming Responses**: Server-Sent Events (SSE) for real-time updates
- **MCP Integration**: Dynamic MCP server creation per request

**Architecture patterns**:
- **System Flow**: Frontend → API Proxy → Backend → ChatKit → Agents SDK → Tools
- **Single Endpoint**: One `/api/chatkit` route handles all operations
- **PostgreSQL Store**: User-isolated database patterns with 14 required methods
- **Xiaomi Model**: "mimo-v2-flash" integration via AsyncOpenAI client
- **Error Handling**: Comprehensive patterns for common ChatKit errors

**Integration patterns**:
- **CDN Loading**: Script loading with `afterInteractive` strategy
- **Web Components**: `customElements.whenDefined()` detection
- **JWT Extraction**: Token validation and user context passing
- **SSE Streaming**: Proper headers and format for ChatKit compatibility
- **MCP Lifecycle**: Per-request server creation with cleanup

**Common patterns**:
- **User Isolation**: Filter all database queries by `user_id` from JWT
- **Session Management**: ChatKit handles sessions internally (no separate endpoints)
- **Conversation History**: Build context for agents from thread items
- **Language Detection**: Urdu/English based on character detection
- **Health Checks**: Backend and frontend health verification

**Required reading**: `concepts/BACKEND_PATTERNS.md`, `concepts/FRONTEND_PATTERNS.md`, `concepts/STORE_PATTERNS.md`, `concepts/AGENTS_INTEGRATION.md`, `references/API_REFERENCE.md`

---

## Code Standards
See `.specify/memory/constitution.md` for code quality, testing, performance, security, and architecture principles.

## Recent Changes
- 008-chatkit-integration: Added ChatKit + OpenAI Agents SDK integration with universal patterns for any framework
- 007-agents-mcp: Added OpenAI Agents SDK, MCP integration, dual-agent system, chatbot UI
- 006-frontend-design: Added Modern Technical Editorial UI design system

## Active Technologies
