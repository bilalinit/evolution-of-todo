# ChatKit Environment Variables

## Required Variables

### Database
```bash
# PostgreSQL connection string (for production)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

### AI Provider (choose one)

**OpenAI:**
```bash
OPENAI_API_KEY="sk-..."
```
> **Required for ChatKit session management** - even if using other providers for chat

**Gemini:**
```bash
GEMINI_API_KEY="..."
```

**Anthropic:**
```bash
ANTHROPIC_API_KEY="..."
```

---

## Optional Variables

### Server Configuration
```bash
# Server port (default: 8000)
PORT=8000

# Environment
NODE_ENV=production
```

### CORS / Frontend
```bash
# Frontend URL for CORS
FRONTEND_URL="http://localhost:3000"

# Production frontend
FRONTEND_URL="https://your-app.com"
```

### RAG / Vector Search (if using)
```bash
# Qdrant
QDRANT_URL="http://localhost:6333"
QDRANT_API_KEY="..."
QDRANT_COLLECTION_NAME="your_collection"

# Search settings
SEARCH_LIMIT=5
SCORE_THRESHOLD=0.5
```

### Authentication (if using)
```bash
# JWT secret for auth tokens
JWT_SECRET="your-secret-key-32-chars-min"

# Auth server URL
AUTH_SERVER_URL="http://localhost:3001"
```

---

## Example .env File

```bash
# Required
OPENAI_API_KEY="sk-..."  # Required for ChatKit session management
DATABASE_URL="postgresql://user:pass@host:5432/mydb?sslmode=require"
GEMINI_API_KEY="your-gemini-api-key"  # Optional: for chat model

# Optional
PORT=8000
FRONTEND_URL="http://localhost:3000"

# RAG (optional)
QDRANT_URL="http://localhost:6333"
QDRANT_COLLECTION_NAME="book_content"
SEARCH_LIMIT=5

# Production
NODE_ENV=production
```

---

## Environment by Context

### Development (MemoryStore)
```bash
OPENAI_API_KEY="sk-..."  # Required for session management
GEMINI_API_KEY="..."     # Optional: for chat model
# No DATABASE_URL needed for MemoryStore
```

### Production (PostgreSQL)
```bash
OPENAI_API_KEY="sk-..."  # Required for session management
DATABASE_URL="postgresql://..."
GEMINI_API_KEY="..."     # Optional: for chat model
FRONTEND_URL="https://your-app.com"
NODE_ENV=production
```

### With Authentication
```bash
OPENAI_API_KEY="sk-..."  # Required for session management
DATABASE_URL="postgresql://..."
GEMINI_API_KEY="..."     # Optional: for chat model
JWT_SECRET="..."
AUTH_SERVER_URL="http://localhost:3001"
```

---

## Security Notes

> ⚠️ **Important**
> - Never commit `.env` files to version control
> - Use different API keys for development and production
> - Set `sslmode=require` for production PostgreSQL
> - Keep JWT secrets at least 32 characters
