# Neon PostgreSQL Environment Variables

## Required Variables

### Database Connection
```bash
# PostgreSQL connection string (required for Neon)
# Format: postgresql://user:password@host:5432/database?sslmode=require
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech:5432/neondb?sslmode=require"
```

> ⚠️ **IMPORTANT**: Always include `?sslmode=require` for Neon connections.

---

## Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require
```

| Component | Description | Example |
|-----------|-------------|---------|
| `user` | Database username | `neondb_owner` |
| `password` | Database password | `abc123xyz` |
| `host` | Neon endpoint | `ep-xxx.us-east-1.aws.neon.tech` |
| `port` | Database port | `5432` |
| `database` | Database name | `neondb` |
| `sslmode` | SSL mode | `require` (mandatory) |

---

## Optional Variables

### Pool Configuration
```bash
# Maximum pool connections (default: 20)
DB_POOL_MAX=20

# Idle timeout in ms (default: 30000)
DB_IDLE_TIMEOUT=30000

# Connection timeout in ms (default: 2000)
DB_CONNECTION_TIMEOUT=2000
```

### Server Configuration
```bash
# Server port (default: 8000 for backend, 3001 for auth-server)
PORT=8000

# Environment
NODE_ENV=production
```

---

## Example .env Files

### Auth Server (TypeScript)
```bash
# Database
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech:5432/neondb?sslmode=require"

# Auth
JWT_SECRET="your-secret-key-32-chars-minimum"
BETTER_AUTH_SECRET="same-as-jwt-secret"

# CORS
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:8000"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### Backend (Python/FastAPI)
```bash
# Database
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech:5432/neondb?sslmode=require"

# AI
GEMINI_API_KEY="your-gemini-api-key"

# Vector Search
QDRANT_URL="https://your-cluster.qdrant.io"
QDRANT_API_KEY="your-qdrant-key"
QDRANT_COLLECTION_NAME="book_content"

# Server
PORT=8000
FRONTEND_URL="http://localhost:3000"
```

---

## Environment by Context

### Development
```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech:5432/dev_db?sslmode=require"
NODE_ENV=development
```

### Production
```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech:5432/prod_db?sslmode=require"
NODE_ENV=production
```

---

## Security Notes

> ⚠️ **Important Security Practices**
>
> - Never commit `.env` files to version control
> - Use different databases for development and production
> - Always use `sslmode=require` for Neon connections
> - Keep secrets at least 32 characters long
> - Rotate credentials periodically
> - Use environment-specific connection strings

---

## Neon Console

Get your connection string from the Neon Console:
1. Go to [console.neon.tech](https://console.neon.tech)
2. Select your project
3. Click "Connection Details"
4. Copy the connection string (includes password)
