# Quick Start Guide: Minikube Deployment

**Feature**: 009-minikube-deployment
**Date**: 2026-01-26
**Estimated Time**: 15 minutes (first run), 5 minutes (re-deployment)

## Prerequisites

Verify you have the following installed:

```bash
# Check versions
docker --version      # Docker 20.10+
minikube version      # Minikube 1.30+
kubectl version --client
helm version          # Helm 3.x
```

**If missing**:
- Docker: https://docs.docker.com/get-docker/
- Minikube: https://minikube.sigs.k8s.io/docs/start/
- kubectl: https://kubernetes.io/docs/tasks/tools/
- helm: https://helm.sh/docs/intro/install/

---

## Step 1: Start Minikube (2 minutes)

```bash
# Start Minikube
minikube start

# Verify it's running
minikube status
```

**Expected output**:
```
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

**If this fails**, try:
```bash
minikube delete
minikube start --driver=docker
```

---

## Step 2: Configure Docker Environment (CRITICAL - 30 seconds)

```bash
# IMPORTANT: This redirects Docker CLI to Minikube's Docker daemon
eval $(minikube docker-env)

# Verify it worked (should show Minikube's Docker, not Docker Desktop)
docker context ls
# Current context should show "minikube" with asterisk (*)
```

**Why this is critical**:
- Without this, images build in Docker Desktop
- Minikube can't see Docker Desktop images
- Results in `ImagePullBackOff` errors

**Reminder**: Run this every time you open a new terminal!

---

## Step 3: Read Environment Variables (1 minute)

```bash
# Check what environment variables your application needs
cat phase-4/backend/.env.example

# Example output:
# DATABASE_URL=postgresql+asyncpg://user:password@host:5432/database_name
# OPENAI_API_KEY=your_openai_api_key_here
# XIAOMI_API_KEY=your_xiaomi_api_key_here
# BETTER_AUTH_SECRET=your-secret-key-here
# MCP_SERVER_TIMEOUT=30
```

**Note**: Never commit `.env` files to git!

---

## Step 4: Create Dockerfiles and .dockerignore (2 minutes)

### Frontend Dockerfile

Create `phase-4/frontend/Dockerfile`:

```dockerfile
# ========================================
# Multi-stage Dockerfile for Next.js 16
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
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner
RUN apk add --no-cache wget
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./
RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1
CMD ["node", "server.js"]
```

**Note**: Requires `output: 'standalone'` in `next.config.ts`. Update next.config.ts:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

### Frontend .dockerignore

Create `phase-4/frontend/.dockerignore`:

```dockerignore
node_modules
npm-debug.log
yarn-error.log
.next
out
dist
build
.env
.env.local
.env.*.local
.git
.gitignore
.vscode
.idea
*.swp
*.swo
.DS_Store
Thumbs.db
coverage
.nyc_output
*.log
```

### Backend Dockerfile

Create `phase-4/backend/Dockerfile`:

```dockerfile
# ========================================
# Multi-stage Dockerfile for FastAPI + uv
# ========================================

# Builder Stage
FROM python:3.12-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project
COPY . .
RUN uv sync --frozen

# Production Stage
FROM python:3.12-slim AS production
RUN groupadd -g 1000 appgroup && useradd -u 1000 -g appgroup -m appuser
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/src /app/src
COPY --from=builder /app/pyproject.toml /app/pyproject.toml
RUN chown -R appuser:appgroup /app
USER appuser
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Backend .dockerignore

Create `phase-4/backend/.dockerignore`:

```dockerignore
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
venv
env
ENV
.venv
.env
.env.local
.git
.gitignore
.vscode
.idea
*.swp
*.swo
.DS_Store
Thumbs.db
.pytest_cache
.coverage
htmlcov
.tox
.mypy_cache
.dmypy.json
dmypy.json
*.db
*.sqlite
*.sqlite3
*.log
```

---

## Step 5: Build Docker Images (5-8 minutes - BE PATIENT!)

```bash
# From project root
cd phase-4

# Build frontend (4-6 minutes first time)
docker build -t todo-frontend:v1 ./frontend

# Build backend (1-2 minutes first time)
docker build -t todo-backend:v1 ./backend

# Verify images are in Minikube's Docker
docker images | grep todo
```

**Expected output**:
```
todo-frontend    v1    abc123...    2 minutes ago    150MB
todo-backend     v1    def456...    1 minute ago     200MB
```

**Build Time Notes**:
- First build takes 5-8 minutes (downloading dependencies + compiling)
- Subsequent builds take 2-3 minutes (Docker caches unchanged layers)
- Don't cancel if it seems slow — Docker is working!

**Speed tips**:
- Run builds in parallel: `docker build ... ./frontend & docker build ... ./backend &`
- Use .dockerignore to exclude unnecessary files

---

## Step 6: Create Kubernetes Secrets (1 minute)

```bash
# Create secret with your actual values
# SECURITY TIP: Start with a space to prevent saving to shell history!
# NOTE: Replace placeholder values with your actual credentials!
 kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL='postgresql+asyncpg://user:password@ep-xxx.aws.neon.tech/dbname?sslmode=require' \
  --from-literal=OPENAI_API_KEY='sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
  --from-literal=XIAOMI_API_KEY='your_xiaomi_api_key_here' \
  --from-literal=BETTER_AUTH_SECRET='your-secret-key-here-min-32-chars' \
  --from-literal=MCP_SERVER_TIMEOUT='30'

# If secret already exists, delete and recreate:
kubectl delete secret app-secrets
# (then run the create command above again)

# Verify secret was created
kubectl get secret app-secrets

# Verify secret values (decoded):
kubectl get secret app-secrets -o jsonpath='{.data.DATABASE_URL}' | base64 -d
```

**Security Note**: The space before `kubectl` prevents this command from being saved to your shell history.

**IMPORTANT**: You must replace the placeholder values with your actual credentials:
- `DATABASE_URL`: Your Neon PostgreSQL connection string with `sslmode=require`
- `OPENAI_API_KEY`: Your OpenAI API key for agents
- `XIAOMI_API_KEY`: Your Xiaomi model API key
- `BETTER_AUTH_SECRET`: A secure random string (min 32 characters)

---

## Step 7: Create Helm Charts (2 minutes)

```bash
# From project root
mkdir -p phase-4/helm-charts
cd phase-4/helm-charts

# Create frontend chart
helm create todo-frontend

# Create backend chart
helm create todo-backend

# Go back to project root
cd ../..
```

---

## Step 8: Customize Helm values.yaml (2 minutes)

### Frontend values.yaml

Edit `helm-charts/todo-frontend/values.yaml`:

```yaml
replicaCount: 1

image:
  repository: todo-frontend
  pullPolicy: IfNotPresent
  tag: "v1"

service:
  type: LoadBalancer
  port: 3000

env:
  API_URL: "http://backend:8000"
  NODE_ENV: "production"

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

livenessProbe:
  httpGet:
    path: /
    port: http
  initialDelaySeconds: 30
  periodSeconds: 30

readinessProbe:
  httpGet:
    path: /
    port: http
  initialDelaySeconds: 10
  periodSeconds: 10

autoscaling:
  enabled: false
```

### Backend values.yaml

Edit `helm-charts/todo-backend/values.yaml`:

```yaml
replicaCount: 1

image:
  repository: todo-backend
  pullPolicy: IfNotPresent
  tag: "v1"

service:
  type: ClusterIP
  port: 8000

envFrom:
  - secretRef:
      name: app-secrets

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

livenessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 10
  periodSeconds: 30

readinessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 5
  periodSeconds: 10

autoscaling:
  enabled: false
```

---

## Step 9: Deploy to Minikube (2 minutes)

```bash
# Verify Minikube is running
minikube status

# Deploy backend first (frontend depends on it)
helm install backend ./phase-4/helm-charts/todo-backend

# Deploy frontend
helm install frontend ./phase-4/helm-charts/todo-frontend

# Verify deployments
helm list
```

**Expected output**:
```
NAME        NAMESPACE   REVISION   UPDATED                STATUS      CHART
backend     default     1          2026-01-26 10:30:00    deployed    todo-backend-0.1.0
frontend    default     1          2026-01-26 10:30:15    deployed    todo-frontend-0.1.0
```

---

## Step 10: Verify Pods Are Running (1 minute)

```bash
# Check pods
kubectl get pods

# Check services
kubectl get services
```

**Expected pods output**:
```
NAME                         READY   STATUS    RESTARTS   AGE
backend-xxxxxxxxxx-xxxxx      1/1     Running   0          2m
frontend-xxxxxxxxxx-xxxxx     1/1     Running   0          1m
```

**Expected services output** (without tunnel):
```
NAME       TYPE           EXTERNAL-IP      PORT(S)
backend    ClusterIP      <none>           8000/TCP
frontend   LoadBalancer   <pending>        3000:xxxxx/TCP
```

**If pods are not running**:
```bash
# Describe pod for details
kubectl describe pod <pod-name>

# View logs
kubectl logs <pod-name>
```

---

## Step 11: Start Minikube Tunnel (CRITICAL - 30 seconds)

**Open a NEW terminal window** and run:

```bash
minikube tunnel
```

**Keep this terminal open** — The tunnel runs as long as this terminal is active.

**Expected output**:
```
Status:
        machine: minikube
        pid: 12345
        route: 10.96.0.0/12 -> 192.168.49.2
        minikube: Running
```

**Note**: You may be prompted for your password. This is normal.

---

## Step 12: Verify Services Get External IPs (1 minute)

**In the original terminal** (NOT the tunnel terminal):

```bash
kubectl get services
```

**Expected output** (with tunnel running):
```
NAME       TYPE           EXTERNAL-IP      PORT(S)
backend    ClusterIP      <none>           8000/TCP
frontend   LoadBalancer   10.96.123.45     3000:xxxxx/TCP
```

Notice:
- **Frontend**: Gets external IP when tunnel is running
- **Backend**: Always shows `<none>` (ClusterIP is internal only - this is correct!)

---

## Step 13: Access the Application (1 minute)

### Method 1: Using minikube tunnel (Recommended)

```bash
# Get the EXTERNAL-IP
kubectl get svc frontend

# Access at: http://10.96.123.45:3000
# (Use the EXTERNAL-IP shown in your output)
```

### Method 2: Using minikube service (Fallback)

```bash
minikube service frontend --url
```

**Output**: `http://127.0.0.1:xxxxx` or `http://localhost:xxxxx`

Access at the URL shown.

---

## Step 14: Verify Everything Works

1. **Application loads**: Navigate to the frontend URL
2. **Create a task**: Verify database operations work
3. **Check ChatKit**: Test the AI agent functionality
4. **View logs**: `kubectl logs -l app=backend`

---

## Common Issues and Solutions

### Issue: ImagePullBackOff

**Cause**: Image not found in Minikube's Docker

**Solution**:
```bash
# Re-run docker-env
eval $(minikube docker-env)

# Rebuild images
docker build -t todo-frontend:v1 ./frontend
docker build -t todo-backend:v1 ./backend

# Restart deployments
kubectl rollout restart deployment/backend
kubectl rollout restart deployment/frontend
```

### Issue: EXTERNAL-IP shows <pending>

**Cause**: Tunnel not running

**Solution**:
```bash
# Start tunnel in a NEW terminal
minikube tunnel
```

### Issue: Frontend can't reach backend

**Cause**: Wrong API_URL or backend service name

**Solution**:
```bash
# Verify backend service exists
kubectl get svc backend

# Check frontend env var
kubectl describe pod frontend-<hash>
# Look for API_URL in environment variables

# Should be: http://backend:8000
```

### Issue: Database connection errors

**Cause**: Wrong DATABASE_URL or SSL not enabled

**Solution**:
```bash
# Verify secret
kubectl get secret app-secrets -o jsonpath='{.data.DATABASE_URL}' | base64 -d

# Should include: sslmode=require
# Correct format: postgresql+asyncpg://user:pass@host:5432/db?sslmode=require
```

### Issue: Pods keep restarting (CrashLoopBackOff)

**Cause**: Application error

**Solution**:
```bash
# View logs
kubectl logs <pod-name>

# Common issues:
# - Missing environment variables
# - Database not accessible
# - Port conflicts
# - Missing dependencies
```

---

## Cleanup

```bash
# Uninstall Helm releases
helm uninstall frontend
helm uninstall backend

# Delete secrets
kubectl delete secret app-secrets

# Stop Minikube (optional)
minikube stop

# Stop tunnel first (Ctrl+C in tunnel terminal)
```

---

## Re-Deployment (After Code Changes)

```bash
# 1. Rebuild changed images
eval $(minikube docker-env)
docker build -t todo-frontend:v2 ./frontend  # Use new tag
docker build -t todo-backend:v2 ./backend

# 2. Upgrade Helm releases
helm upgrade backend ./helm-charts/todo-backend --set image.tag=v2
helm upgrade frontend ./helm-charts/todo-frontend --set image.tag=v2

# 3. Verify
kubectl get pods
kubectl get services
```

---

## Production-like Deployment

For production-like deployment with resource limits and multiple replicas:

```bash
# Deploy with production values
helm install backend-prod ./phase-4/helm-charts/todo-backend \
  -f ./helm-charts/todo-backend/values-prod.yaml

helm install frontend-prod ./phase-4/helm-charts/todo-frontend \
  -f ./helm-charts/todo-frontend/values-prod.yaml
```

Create `values-prod.yaml` files with:
- `replicaCount: 2`
- Resource limits (CPU, memory)
- Autoscaling enabled
- Health check tuning

---

## Summary

**Deployment Time**:
- First run: ~15 minutes
- Re-deployment: ~5 minutes

**Key Commands**:
- `eval $(minikube docker-env)` - Configure Docker
- `docker build -t <name>:<tag> ./<dir>` - Build images
- `kubectl create secret generic ...` - Create secrets
- `helm install <name> ./chart` - Deploy
- `minikube tunnel` - Expose LoadBalancer (in separate terminal)

**Critical Points**:
- ALWAYS run `eval $(minikube docker-env)` before building
- NEVER skip `minikube tunnel` for LoadBalancer access
- ALWAYS read `.env.example` before creating secrets
- BE PATIENT during first build (5-8 minutes is normal!)

**Next Steps**:
- Configure Ingress for domain-based routing (todo.local)
- Set up monitoring (Prometheus, Grafana)
- Implement CI/CD pipeline
- Deploy to cloud Kubernetes (EKS, GKE, AKS)
