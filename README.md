# Hackathon Todo Project

A Spec-Driven Development (SDD) project implementing a CLI todo application with a clear evolution path toward a full-stack system.

## Project Overview

This project follows a **feature-driven development approach** with sequential branching and comprehensive documentation at every stage.

## 🚀 Current Status

- **Feature Branch**: `001-cli-todo` ✅ Complete
- **Base Branch**: `main` (stable)
- **Status**: CLI todo application with 91 tests, 82%+ coverage

## 📋 Project Structure

```
.
├── main                          # Stable base branch
├── 001-cli-todo/                 # Current feature branch ✅
│   ├── backend/                  # Python CLI application
│   ├── specs/001-cli-todo/       # Feature specifications
│   └── history/prompts/001-cli-todo/ # Development history
├── GIT_WORKFLOW.md               # Branching strategy
└── CLAUDE.md                     # Development rules
```

## 🌟 Features Implemented (001-cli-todo)

### Core CLI Commands
- ✅ `add` - Create tasks with validation
- ✅ `list` - View formatted task table
- ✅ `update` - Modify task titles
- ✅ `delete` - Remove tasks
- ✅ `toggle` - Mark complete/incomplete

### Quality Features
- ✅ 91 unit & integration tests
- ✅ 82%+ code coverage
- ✅ Type checking with mypy
- ✅ Linting with ruff
- ✅ Pydantic validation
- ✅ Smart error handling & suggestions

## 📖 Documentation

### Development Workflow
- **[GIT_WORKFLOW.md](GIT_WORKFLOW.md)** - Complete branching strategy and workflow
- **[CLAUDE.md](CLAUDE.md)** - Development rules and SDD principles

### Feature Documentation
- **[backend/README.md](backend/README.md)** - CLI application documentation
- **[specs/001-cli-todo/](specs/001-cli-todo/)** - Complete spec, plan, and tasks

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
git checkout 001-cli-todo

# Run the CLI application
cd backend
uv run backend
```

## 🔄 Next Features (Planned)

- **002-database-persistence** - SQLite with SQLModel
- **003-web-interface** - FastAPI REST API
- **004-mcp-server** - MCP protocol integration
- **005-multi-user** - Authentication & authorization

## 🎯 Development Principles

- ✅ **Spec-Driven**: Every feature starts with specs
- ✅ **Sequential Branching**: `001-`, `002-`, `003-` pattern
- ✅ **Test-First**: Comprehensive testing at every stage
- ✅ **Documentation**: PHRs for every user interaction
- ✅ **Type Safety**: Full mypy compliance
- ✅ **Quality Gates**: Linting, formatting, coverage

## 📊 Metrics

- **Branches**: `main` + feature branches
- **Tests**: 91 total
- **Coverage**: 82%+
- **Type Safety**: 100% mypy compliant
- **Code Quality**: 100% ruff compliant

## 🤝 Contributing

This project uses Spec-Driven Development:

1. Create spec with `/sp.specify`
2. Plan architecture with `/sp.plan`
3. Generate tasks with `/sp.tasks`
4. Work on `###-feature-name` branch
5. Create PHRs for each stage
6. Document decisions with ADRs

---

**Built with**: Python 3.13+, UV, SQLModel, Pydantic, pytest, ruff, mypy
**Methodology**: Spec-Driven Development (SDD)
**Branching**: Sequential feature branches from main