# Quickstart: CLI Todo Application

## Prerequisites

- **Python 3.13+** (required by spec)
- **UV package manager** (project standard)
- **Git** (for version control)

## Installation & Setup

### 1. Initialize Project Structure
```bash
# From project root
cd /mnt/e/coding/hackathon-2/save-3/hackathon-todo

# Create backend package using UV
uv init --package backend
cd backend

# Add development dependencies
uv add --dev pytest pytest-cov ruff mypy
```

### 2. Install Core Dependencies
```bash
# From backend directory
uv add sqlmodel pydantic
```

### 3. Project Structure Created
```
backend/
├── pyproject.toml
├── README.md
└── src/
    └── backend/
        ├── __init__.py
        ├── models.py          # Task & User models
        ├── services.py        # TaskManager + business logic
        ├── cli.py             # CLI interface
        ├── utils.py           # Validation & formatting
        └── main.py            # Entry point
```

## Development Workflow

### Running the Application
```bash
# From backend directory
uv run python -m backend.main

# Or use the UV run command
uv run backend
```

### Testing
```bash
# Run all tests
uv run pytest

# With coverage
uv run pytest --cov=src/backend --cov-report=html

# Specific test file
uv run pytest tests/unit/test_task_manager.py
```

### Code Quality
```bash
# Format code
uv run ruff format src/

# Lint code
uv run ruff check src/

# Type check
uv run mypy src/
```

## Architecture Overview

### Core Components

1. **Models** (`models.py`)
   - SQLModel definitions for User and Task
   - Pydantic validation schemas
   - Database relationships

2. **Services** (`services.py`)
   - `TaskManager`: Core business logic (CRUD + toggle)
   - User-scoped operations
   - Transaction management

3. **CLI** (`cli.py`)
   - Command parsing and routing
   - User input handling
   - Formatted output display

4. **Utils** (`utils.py`)
   - Input validation helpers
   - Table formatting
   - Error message formatting

5. **Main** (`main.py`)
   - Application entry point
   - Main command loop
   - Signal handling (Ctrl+C)

### Data Flow

```
User Input → CLI Parser → TaskManager → SQLModel → SQLite DB
     ↑           ↓              ↓           ↓         ↓
   Output    Error Handling  Validation  Models   Persistence
```

## Key Features Implemented

### 1. Task Operations
- ✅ Add task with validation
- ✅ List tasks with formatted table
- ✅ Update task titles
- ✅ Delete tasks
- ✅ Toggle completion status

### 2. Error Handling
- ✅ Graceful error messages
- ✅ Input validation
- ✅ User-friendly feedback
- ✅ Never crashes on bad input

### 3. User Experience
- ✅ Color-coded output (success/error)
- ✅ Command aliases (add/a/new/create)
- ✅ Help system
- ✅ Clean exit (Ctrl+C)

## Configuration

### Database
- **Phase I**: SQLite (`todo.db` in project root)
- **Phase II**: Neon PostgreSQL (connection string in env)

### Environment Variables
```bash
# Optional - override defaults
DATABASE_URL=sqlite:///todo.db
LOG_LEVEL=INFO
```

## Testing the Complete Flow

### Manual Test Script
```bash
# Start application
uv run python -m backend.main

# Test commands in sequence:
# 1. help
# 2. add "Buy groceries"
# 3. add "Complete homework"
# 4. list
# 5. toggle 1
# 6. update 2 "Finish Python project"
# 7. list
# 8. delete 1
# 9. list
# 10. exit
```

### Expected Output
```
═══════════════════════════════════════════
         📋 TODO APPLICATION
═══════════════════════════════════════════

Available Commands:
  add     - Create a new task
  list    - View all tasks
  update  - Modify a task's title
  delete  - Remove a task
  toggle  - Mark task complete/incomplete
  help    - Show this menu
  exit    - Quit the application

Enter command: add
Enter task title: Buy groceries
✓ Task added successfully! (ID: 1)
```

## Phase Migration Path

### Phase I → Phase II (Web)
1. **Database**: Switch SQLite → Neon PostgreSQL
2. **API**: Add FastAPI layer using same services
3. **Auth**: Add JWT authentication
4. **Frontend**: Next.js app consuming API

### Phase II → Phase III (AI Agents)
1. **MCP**: Expose TaskManager as MCP tools
2. **Agent**: Connect OpenAI agents to MCP server
3. **Natural Language**: Add NLP parsing layer

### Phase III → Phase IV (Kubernetes)
1. **Containerize**: Docker images for all services
2. **Orchestrate**: Kubernetes manifests
3. **Observability**: Add logging/metrics

### Phase IV → Phase V (Scaling)
1. **Event Bus**: Add Kafka for async operations
2. **Microservices**: Split services
3. **CD**: Automated deployment pipeline

## Troubleshooting

### Common Issues

**UV not found**
```bash
# Install UV
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Python version error**
```bash
# Check version
python --version  # Must be 3.13+

# Install correct version
uv python install 3.13
```

**Database locked**
```bash
# Close other instances
ps aux | grep backend.main
kill <pid>

# Or delete and restart
rm todo.db
```

## Success Criteria Checklist

- [ ] Application starts without errors
- [ ] All 5 core commands work
- [ ] Error handling works (empty title, invalid ID)
- [ ] Table formatting displays correctly
- [ ] Ctrl+C exits gracefully
- [ ] Unit tests pass (90%+ coverage)
- [ ] Code passes linting and type checking

## Next Steps

1. **Implement**: Follow the implementation checklist in spec.md
2. **Test**: Run manual flow and unit tests
3. **Validate**: Check Constitution compliance
4. **Document**: Update this quickstart with any changes
5. **Plan**: Prepare for Phase II (web frontend)

## Support

For issues or questions:
- Check `research.md` for architectural decisions
- Review `data-model.md` for database questions
- See `contracts/` for API specifications
- Run `uv run pytest -v` for test details