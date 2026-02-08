# Dockerfile Patterns

Multi-stage Dockerfile templates for common frameworks. **Always customize according to project requirements.**

## General Principles

1. **Multi-stage builds** — Smaller final images, separate build/deps concerns
2. **Non-root user** — Security best practice
3. **Health checks** — Kubernetes liveness/readiness probes
4. **Alpine base** — Smaller image size where possible
5. **.dockerignore** — Exclude unnecessary files from build context

---

## .dockerignore Pattern

**What is it?** A file that tells Docker what to exclude when building images (like .gitignore for Git).

**Why use it?**
- Faster builds (smaller build context)
- Smaller images
- Prevents copying sensitive files
- Avoids including node_modules, .git, etc.

### Frontend .dockerignore (Next.js, React, etc.)

```dockerignore
# Dependencies
node_modules
npm-debug.log
yarn-error.log

# Build output (will be built in container)
.next
out
dist
build

# Environment files (may contain secrets)
.env
.env.local
.env.*.local

# Git
.git
.gitignore

# IDE
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage
.nyc_output

# Misc
*.log
```

### Backend .dockerignore (Python, FastAPI, etc.)

```dockerignore
# Python
__pycache__
*.pyc
*.pyo
*.pyd
.Python
*.so
*.egg
*.egg-info
dist
build

# Virtual environments
venv
env
ENV
.venv

# Environment files (may contain secrets)
.env
.env.local

# Git
.git
.gitignore

# IDE
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
.pytest_cache
.coverage
htmlcov
.tox

# MyPy
.mypy_cache
.dmypy.json
dmypy.json

# Databases
*.db
*.sqlite
*.sqlite3

# Logs
*.log
```

### Where to Put It

```
project-root/
├── frontend/
│   ├── .dockerignore    ← Put here
│   ├── Dockerfile
│   └── ...
└── backend/
    ├── .dockerignore    ← Put here
    ├── Dockerfile
    └── ...
```

---

## Next.js Frontend Pattern

```dockerfile
# ========================================
# Multi-stage Dockerfile for Next.js
# ========================================

# Dependencies Stage
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund && npm cache clean --force
COPY . .
# Build with standalone output for production
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner
RUN apk add --no-cache wget
# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs
WORKDIR /app
# Copy standalone output
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./
RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
# Health check (customize path as needed)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
CMD ["node", "server.js"]
```

### Next.js Requirements
- `output: 'standalone'` in `next.config.js`
- Health check endpoint at `/api/health` (or customize)

---

## FastAPI Backend Pattern

```dockerfile
# ========================================
# Multi-stage Dockerfile for FastAPI
# ========================================

# Builder Stage (for uv and dependencies)
FROM python:3.13-slim AS builder
# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app
# Copy dependency files
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project
# Copy the entire project
COPY . .
RUN uv sync --frozen

# Production Stage
FROM python:3.13-slim AS production
# Create non-root user
RUN groupadd -g 1000 appgroup && useradd -u 1000 -g appgroup -m appuser
# Install uv (binary only)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app
# Copy installed dependencies from builder
COPY --from=builder /app/.venv /app/.venv
# Copy application source
COPY --from=builder /app/src /app/src
COPY --from=builder /app/pyproject.toml /app/pyproject.toml
RUN chown -R appuser:appgroup /app
USER appuser
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1
CMD ["uvicorn", "backend:app", "--host", "0.0.0.0", "--port", "8000"]
```

### FastAPI Requirements
- App instance named `backend` in main module (or customize CMD)
- Health check endpoint at `/health`

---

## React (Vite) Frontend Pattern

```dockerfile
# ========================================
# Multi-stage Dockerfile for React + Vite
# ========================================

# Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
RUN npm run build

# Production Stage (serve with nginx)
FROM nginx:alpine AS production
# Copy nginx config (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Django Backend Pattern

```dockerfile
# ========================================
# Multi-stage Dockerfile for Django
# ========================================

# Builder Stage
FROM python:3.13-slim AS builder
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir --user -r requirements.txt
COPY . .

# Production Stage
FROM python:3.13-slim AS production
RUN groupadd -g 1000 appgroup && useradd -u 1000 -g appgroup -m appuser
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY --from=builder /app /app
RUN chown -R appuser:appgroup /app
USER appuser
ENV PATH="/root/.local/bin:$PATH"
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health/')" || exit 1
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

---

## Express.js Backend Pattern

```dockerfile
# ========================================
# Multi-stage Dockerfile for Express.js
# ========================================

# Dependencies Stage
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# Production Stage
FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S express -u 1001 -G nodejs
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY . .
RUN chown -R express:nodejs /app
USER express
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
CMD ["node", "server.js"]
```

---

## Customization Guidelines

### Things to Customize Per Project

| Setting | What to Change |
|---------|----------------|
| Node version | Match project's `.nvmrc` or `package.json` |
| Python version | Match project's runtime |
| Port number | Match application's actual port |
| Health check path | Use actual health endpoint |
| Build command | Match `package.json` scripts |
| User/group IDs | Can use any, just keep consistent |

### Security Checklist

- [ ] Non-root user defined and used
- [ ] Only necessary files copied (no `.git`, cache, etc.)
- [ ] No secrets in Dockerfile
- [ ] Minimal base image (alpine/slim)
- [ ] Health check configured
