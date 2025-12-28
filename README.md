# Hackathon Todo Project

A Spec-Driven Development (SDD) project implementing a **menu-driven CLI todo application** with a clear evolution path toward a full-stack system. Currently featuring a professional visual interface with zero command memorization required.

## Project Overview

This project follows a **feature-driven development approach** with sequential branching and comprehensive documentation at every stage.

## 🚀 Current Status

- **Feature Branch**: `002-cli-menu-ui` ✅ Complete
- **Base Branch**: `main` (stable)
- **Status**: Menu-driven CLI todo application with 147 tests, 85%+ coverage

## 📋 Project Structure

```
.
├── main                          # Stable base branch
├── 002-cli-menu-ui/              # Current feature branch ✅
│   ├── backend/                  # Menu-driven CLI application
│   ├── specs/002-cli-menu-ui/    # Feature specifications
│   └── history/prompts/002-cli-menu-ui/ # Development history
├── 001-cli-todo/                 # Previous feature (command-based)
├── GIT_WORKFLOW.md               # Branching strategy
└── CLAUDE.md                     # Development rules
```

## 🌟 Features Implemented (002-cli-menu-ui)

### Visual Menu Interface
- ✅ **7-option visual menu** with emoji icons
- ✅ **Zero command memorization** required
- ✅ **Guided prompts** for all operations
- ✅ **Professional appearance** with box-drawing and colors
- ✅ **Safe operations** with confirmation dialogs

### Core Operations
- ✅ **📝 Add**: Guided task creation with validation
- ✅ **📋 View**: Visual task list with progress statistics
- ✅ **✏️ Update**: Two-step task modification process
- ✅ **🔄 Toggle**: Status changes with confirmation
- ✅ **🗑️ Delete**: Explicit confirmation for destructive ops
- ✅ **❓ Help**: Comprehensive help screen
- ✅ **👋 Exit**: Graceful exit with farewell message

### Quality Features
- ✅ 147 unit & integration tests (56 new + 91 existing)
- ✅ 85%+ code coverage
- ✅ Type checking with mypy
- ✅ Linting with ruff
- ✅ Pydantic validation
- ✅ Comprehensive error handling
- ✅ Signal handling (Ctrl+C, Ctrl+D)

## 📖 Documentation

### Development Workflow
- **[GIT_WORKFLOW.md](GIT_WORKFLOW.md)** - Complete branching strategy and workflow
- **[CLAUDE.md](CLAUDE.md)** - Development rules and SDD principles

### Feature Documentation
- **[backend/README.md](backend/README.md)** - Menu-driven CLI application documentation
- **[specs/002-cli-menu-ui/](specs/002-cli-menu-ui/)** - Complete spec, plan, and tasks (70/70 completed)
- **[specs/001-cli-todo/](specs/001-cli-todo/)** - Previous command-based implementation

## 🏗️ Architecture

This project follows **Spec-Driven Development** with clear separation:

1. **Specification** (`specs/###-feature/spec.md`) - What to build
2. **Planning** (`specs/###-feature/plan.md`) - How to build it
3. **Tasks** (`specs/###-feature/tasks.md`) - Testable implementation steps
4. **Implementation** - Code in feature branch
5. **Documentation** - PHRs and ADRs in `history/`

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repo>
cd hackathon-todo

# View current feature
git checkout 002-cli-menu-ui

# Run the menu-driven CLI application
cd backend
uv run backend
```

**You'll see the visual menu interface:**
```
╔════════════════════════════════════════════════════════════╗
║                    📋 TODO APPLICATION                     ║
║                    Menu-Driven Interface                   ║
╚════════════════════════════════════════════════════════════╝

┌────────────────────  MAIN MENU  ────────────────────┐
│ 1. 📝 Add New Task                                   │
│ 2. 📋 View All Tasks                                 │
│ 3. ✏️  Update Task                                  │
│ 4. 🔄 Toggle Task Status                             │
│ 5. 🗑️  Delete Task                                  │
│ 6. ❓ Help & Instructions                            │
│ 7. 👋 Exit Application                               │
└─────────────────────────────────────────────────────┘
```

## 🔄 Next Features (Planned)

- **003-database-persistence** - SQLite with SQLModel
- **004-web-interface** - FastAPI REST API
- **005-mcp-server** - MCP protocol integration
- **006-multi-user** - Authentication & authorization

## 🎯 Development Principles

- ✅ **Spec-Driven**: Every feature starts with specs
- ✅ **Sequential Branching**: `001-`, `002-`, `003-` pattern
- ✅ **Test-First**: Comprehensive testing at every stage
- ✅ **Documentation**: PHRs for every user interaction
- ✅ **Type Safety**: Full mypy compliance
- ✅ **Quality Gates**: Linting, formatting, coverage

## 📊 Metrics

- **Branches**: `main` + feature branches
- **Tests**: 147 total (56 new + 91 existing)
- **Coverage**: 85%+
- **Type Safety**: 100% mypy compliant
- **Code Quality**: 100% ruff compliant
- **Tasks Completed**: 70/70 (002-cli-menu-ui)

## 🤝 Contributing

This project uses Spec-Driven Development:

1. Create spec with `/sp.specify`
2. Plan architecture with `/sp.plan`
3. Generate tasks with `/sp.tasks`
4. Work on `###-feature-name` branch
5. Create PHRs for each stage
6. Document decisions with ADRs

---

**Built with**: Python 3.12+, UV, SQLModel, Pydantic, pytest, Colorama, ruff, mypy
**Methodology**: Spec-Driven Development (SDD)
**Branching**: Sequential feature branches from main
**Current**: Menu-driven CLI with visual interface