# Neon DB Skill

## Overview
This skill provides comprehensive knowledge for working with Neon PostgreSQL - a serverless PostgreSQL database. It covers TypeScript/Node.js integration, Python/psycopg2 patterns, schema design, and connection pooling best practices.

> 🛑 **STOP! READ THIS FIRST!**
>
> You are **FORBIDDEN** from generating any plans or code until you have read and internalized the following files:
>
> 1. **`CLAUDE.md`** (Usage guidelines and framework-specific patterns)
> 2. **`concepts/TYPESCRIPT_PATTERNS.md`** (Node.js Pool, Better Auth integration)
> 3. **`concepts/PYTHON_PATTERNS.md`** (psycopg2, ChatKit NeonStore integration)
> 4. **`concepts/SCHEMA_DESIGN.md`** (Table design, indexes, triggers)
> 5. **`references/API_REFERENCE.md`** (Pool API, psycopg2 API)
> 6. **`references/ENVIRONMENT_VARIABLES.md`** (DATABASE_URL configuration)
>
> **Failure to read these files constitutes a failure of the task.**

## Capabilities
- **TypeScript/Node.js**: pg Pool with SSL, Better Auth adapter
- **Python/FastAPI**: psycopg2 with context managers, ChatKit Store interface
- **Schema Design**: JSONB metadata, indexes, triggers, foreign keys
- **Connection Pooling**: SSL configuration, timeout settings, error handling
- **User Isolation**: Multi-tenant data patterns with userId filtering

## Structure
- **concepts/**: Deep dives into implementation patterns
  - `TYPESCRIPT_PATTERNS.md`: Node.js pg Pool, Express integration
  - `PYTHON_PATTERNS.md`: psycopg2, async considerations
  - `SCHEMA_DESIGN.md`: Table design, migrations
- **references/**: API documentation and environment variables

## Common Usage
1. **Setup**: "How do I connect to Neon PostgreSQL from Node.js?"
2. **Python**: "Set up psycopg2 connection pooling with FastAPI"
3. **Schema**: "Create tables for user data with proper indexes"
4. **Migrations**: "Write a migration for chat history tables"
5. **Debug**: "Why am I getting SSL connection errors?"

## Technology Stack
- **TypeScript**: pg Pool, Better Auth
- **Python**: psycopg2, RealDictCursor
- **Database**: PostgreSQL (Neon serverless)
- **SSL**: Required for all Neon connections
