# Minikube Deployment Guide

**Last Updated**: 2026-01-26
**Environment**: Local Minikube (Production-like Kubernetes)
**Estimated Time**: 15 minutes (first run), 5 minutes (re-deployment)

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start](#2-quick-start)
3. [Detailed Steps](#3-detailed-steps)
4. [Secrets Configuration](#4-secrets-configuration)
5. [Troubleshooting](#5-troubleshooting)
6. [Re-deployment](#6-re-deployment)
7. [Cleanup](#7-cleanup)

---

## 1. Prerequisites

### Required Tools

```bash
# Check versions
docker --version      # Docker 20.10+
minikube version      # Minikube 1.30+
kubectl version --client
helm version          # Helm 3.x
```

**Install if missing:**
- Docker: https://docs.docker.com/get-docker/
- Minikube: https://minikube.sigs.k8s.io/docs/start/
- kubectl: https://kubernetes.io/docs/tasks/tools/
- helm: https://helm.sh/docs/intro/install/

---

## 2. Quick Start

```bash
# 1. Start Minikube
minikube start

# 2. Configure Docker environment
eval $(minikube docker-env)

# 3. Create Kubernetes Secret with your credentials
 kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL='postgresql+asyncpg://user:password@ep-xxx.aws.neon.tech/db?sslmode=require' \
  --from-literal=DATABASE_URL_PG='postgresql://user:password@ep-xxx.aws.neon.tech/db?sslmode=require' \
  --from-literal=OPENAI_API_KEY='sk-xxxxxx' \
  --from-literal=XIAOMI_API_KEY='your_xiaomi_api_key' \
  --from-literal=BETTER_AUTH_SECRET='your-secret-key-min-32-chars' \
  --from-literal=MCP_SERVER_TIMEOUT='30'

# 4. Build Docker images (in phase-4 directory)
cd phase-4
docker build -t todo-frontend:latest ./frontend
docker build -t todo-backend:latest ./backend

# 5. Deploy with Helm
cd helm-charts
helm install backend ./todo-backend
helm install frontend ./todo-frontend

# 6. Start minikube tunnel (in a NEW terminal)
minikube tunnel

# 7. Access application
# Frontend: http://127.0.0.1:3000
# Backend:  http://127.0.0.1:8000
```

---

## 3. Detailed Steps

### Step 1: Start Minikube

```bash
minikube start

# Verify it's running
minikube status

# Expected output:
# minikube
# type: Control Plane
# host: Running
# kubelet: Running
# apiserver: Running
# kubeconfig: Configured
```

**If it fails:**
```bash
minikube delete
minikube start --driver=docker
```

---

### Step 2: Configure Docker Environment

**CRITICAL** - This redirects Docker CLI to Minikube's Docker daemon:

```bash
eval $(minikube docker-env)

# Verify (should show "minikube" with asterisk)
docker context ls
```

**Note:** Run this in every terminal where you run docker commands for Minikube.

---

### Step 3: Create Kubernetes Secrets

The application needs these secrets. Replace placeholder values with your actual credentials:

```bash
# SECURITY TIP: Space before kubectl prevents saving to shell history
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL='postgresql+asyncpg://user:password@ep-xxx.aws.neon.tech/dbname?sslmode=require' \
  --from-literal=DATABASE_URL_PG='postgresql://user:password@ep-xxx.aws.neon.tech/dbname?sslmode=require' \
  --from-literal=OPENAI_API_KEY='sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
  --from-literal=XIAOMI_API_KEY='sk-your_xiaomi_api_key' \
  --from-literal=BETTER_AUTH_SECRET='your-secret-key-min-32-chars' \
  --from-literal=MCP_SERVER_TIMEOUT='30'
```

#### Secret Values Explained

| Key | Purpose | Source |
|-----|---------|--------|
| `DATABASE_URL` | Backend database connection (SQLAlchemy format) | Your Neon database |
| `DATABASE_URL_PG` | Frontend database connection (pg library format) | Same as above, different format |
| `OPENAI_API_KEY` | OpenAI API for agents | https://platform.openai.com/api-keys |
| `XIAOMI_API_KEY` | Xiaomi model API key | Your Xiaomi API key |
| `BETTER_AUTH_SECRET` | JWT signing secret (min 32 chars) | Generate your own |
| `MCP_SERVER_TIMEOUT` | MCP server timeout in seconds | Default 30 is fine |

---

### Step 4: Build Docker Images

```bash
# From project root
cd phase-4

# Build frontend (4-6 minutes first time)
docker build -t todo-frontend:latest ./frontend

# Build backend (1-2 minutes first time)
docker build -t todo-backend:latest ./backend

# Verify images exist in Minikube Docker
docker images | grep todo
```

**Expected output:**
```
todo-frontend    latest    abc123...    2 minutes ago    150MB
todo-backend     latest    def456...    1 minute ago     200MB
```

---

### Step 5: Deploy with Helm

```bash
# From project root
cd phase-4/helm-charts

# Deploy backend first (frontend depends on it)
helm install backend ./todo-backend

# Deploy frontend
helm install frontend ./todo-frontend

# Verify deployments
helm list
kubectl get pods
kubectl get services
```

**Expected pods output:**
```
NAME                                      READY   STATUS    RESTARTS   AGE
backend-todo-backend-xxxxxxxxxx-xxxxx     1/1     Running   0          2m
frontend-todo-frontend-xxxxxxxxxx-xxxxx    1/1     Running   0          1m
```

**Expected services output (without tunnel):**
```
NAME       TYPE           EXTERNAL-IP      PORT(S)
backend    ClusterIP      <none>           8000/TCP
frontend   LoadBalancer   <pending>        3000:xxxxx/TCP
```

---

### Step 6: Start Minikube Tunnel

**IMPORTANT**: Run this in a **NEW terminal** and keep it running:

```bash
minikube tunnel
```

**Keep this terminal open** - The tunnel runs as long as this terminal is active.

**Expected output:**
```
Status:
        machine: minikube
        pid: 12345
        route: 10.96.0.0/12 -> 192.168.49.2
        minikube: Running
```

You may be prompted for your password - this is normal.

---

### Step 7: Access the Application

**In the original terminal** (NOT the tunnel terminal):

```bash
# Get the EXTERNAL-IP
kubectl get svc frontend

# Access at: http://<EXTERNAL-IP>:3000
# Or use: http://127.0.0.1:3000 (if tunnel is running)
```

| Service | URL | Status |
|----------|-----|--------|
| Frontend | http://127.0.0.1:3000 | ✅ Public |
| Backend | http://127.0.0.1:8000 | ✅ Public |

---

## 4. Secrets Configuration

### Getting Your Credentials

#### 1. Neon PostgreSQL Database

1. Go to https://console.neon.tech/
2. Select your project
3. Click "Connection Details"
4. Copy the connection string
5. For SQLAlchemy: `postgresql+asyncpg://...` format
6. For pg library: `postgresql://...` format

**Required format:** Must include `?sslmode=require`

#### 2. OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key or use existing
3. Copy the key (starts with `sk-proj-`)

#### 3. Xiaomi Model API Key

Your Xiaomi API key for the agents integration.

#### 4. Better Auth Secret

Generate a secure random string (minimum 32 characters):

```bash
# Generate a secure secret
openssl rand -base64 32
# Or use a password manager to generate
```

---

## 5. Troubleshooting

### Issue: ImagePullBackOff

**Cause:** Image not found in Minikube's Docker

**Solution:**
```bash
# Re-run docker-env
eval $(minikube docker-env)

# Rebuild images
cd phase-4
docker build -t todo-frontend:latest ./frontend
docker build -t todo-backend:latest ./backend

# Restart deployments
kubectl rollout restart deployment/backend
kubectl rollout restart deployment/frontend
```

### Issue: EXTERNAL-IP shows `<pending>`

**Cause:** Tunnel not running

**Solution:**
```bash
# Start tunnel in a NEW terminal
minikube tunnel
```

### Issue: Frontend can't reach backend (404/Connection Refused)

**Cause:** Backend service name mismatch

**Check:**
```bash
# Verify backend service exists
kubectl get svc backend

# Check frontend env var
kubectl describe pod frontend-<hash>
# Look for API_URL in environment variables

# Should be: http://backend:8000 (internal service name)
```

### Issue: Database connection errors

**Cause:** Wrong DATABASE_URL or SSL not enabled

**Solution:**
```bash
# Verify secret
kubectl get secret app-secrets -o jsonpath='{.data.DATABASE_URL}' | base64 -d

# Should include: sslmode=require
# Correct format: postgresql+asyncpg://user:pass@host:5432/db?sslmode=require
```

### Issue: Pods keep restarting (CrashLoopBackOff)

**Cause:** Application error

**Solution:**
```bash
# View logs
kubectl logs <pod-name>

# Common issues:
# - Missing environment variables
# - Database not accessible
# - Port conflicts
# - Missing dependencies
```

### Issue: 403 Forbidden on login

**Cause:** Missing trusted origin in Better Auth config

**Solution:** Already fixed in `src/lib/auth/auth.ts` - includes `127.0.0.1:3000`

### Issue: 401 Unauthorized on API calls

**Cause:** Missing `BETTER_AUTH_URL` in backend environment

**Solution:** Already fixed in Helm values - backend now has `BETTER_AUTH_URL=http://frontend-todo-frontend:3000/`

### Issue: ChatKit StreamError

**Cause:** Missing MCP tools file in Docker image

**Solution:** Already fixed in Dockerfile - now copies `task_serves_mcp_tools.py`

---

## 6. Re-deployment

After making code changes:

```bash
# 1. Configure Docker for Minikube
eval $(minikube docker-env)

# 2. Rebuild changed images
cd phase-4
docker build -t todo-frontend:latest ./frontend  # Use new tag if needed
docker build -t todo-backend:latest ./backend

# 3. Upgrade Helm releases
cd helm-charts
helm upgrade backend ./todo-backend
helm upgrade frontend ./todo-frontend

# 4. Verify
kubectl get pods
kubectl get services

# 5. If needed, restart specific deployment
kubectl rollout restart deployment/backend
kubectl rollout restart deployment/frontend
```

---

## 7. Cleanup

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

## Service Architecture

| Component | Service Type | Access Pattern | URL |
|-----------|--------------|----------------|-----|
| Frontend | LoadBalancer | Public | http://127.0.0.1:3000 |
| Backend | LoadBalancer | Public (for local) | http://127.0.0.1:8000 |

**Note:** For production, backend should be ClusterIP (internal-only) and frontend accessed via Ingress.

---

## Environment Variables Reference

### Frontend Environment

| Variable | Value | Scope |
|----------|-------|-------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Browser (client-side) |
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:8000` | Browser (client-side) |
| `NEXT_PUBLIC_CHATKIT_API_URL` | `http://localhost:8000/api/chatkit` | Browser (client-side) |
| `NEXT_PUBLIC_DEMO_MODE` | `false` | Browser (client-side) |
| `NEXT_PUBLIC_DEBUG` | `true` | Browser (client-side) |
| `BETTER_AUTH_URL` | `http://frontend-todo-frontend:3000/` | Server-side |
| `BACKEND_URL` | `http://backend-todo-backend:8000` | Server-side (internal) |
| `DATABASE_URL_PG` | From secret `app-secrets` | Server-side |
| `BETTER_AUTH_SECRET` | From secret `app-secrets` | Server-side |

### Backend Environment

| Variable | Value | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | From secret `app-secrets` | Database (SQLAlchemy format) |
| `OPENAI_API_KEY` | From secret `app-secrets` | OpenAI API |
| `XIAOMI_API_KEY` | From secret `app-secrets` | Xiaomi model API |
| `BETTER_AUTH_SECRET` | From secret `app-secrets` | JWT signing secret |
| `BETTER_AUTH_URL` | `http://frontend-todo-frontend:3000/` | Frontend Better Auth URL (for JWKS) |
| `MCP_SERVER_TIMEOUT` | From secret `app-secrets` | MCP timeout |
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8000` | Server port |
| `DEBUG` | `true` | Debug mode |

---

## Production Deployment Readiness

This Minikube deployment pattern directly transfers to production cloud providers:

| Concept | Minikube | Production (AWS EKS / Oracle OKE / GKE) |
|----------|----------|----------------------------------------|
| Helm Charts | Same | Same |
| Dockerfiles | Same | Same |
| Secrets | `kubectl create secret` | Same (or use sealed-secrets/vault) |
| ClusterIP | Internal services | Internal services |
| LoadBalancer | `minikube tunnel` | Cloud LoadBalancer (costs money) |
| Ingress | Nginx ingress addon | ALB/OCI Ingress Controller |

**For production:** Replace LoadBalancer with Ingress for cost-effective domain-based routing.

---

## Tips

1. **Build Time:** First build takes 5-8 minutes (downloading dependencies). Subsequent builds take 2-3 minutes (Docker caches unchanged layers).
2. **Parallel Builds:** Run frontend and backend builds in parallel: `docker build ... ./frontend & docker build ... ./backend &`
3. **Tunnel Stability:** The tunnel must stay running. If it stops, EXTERNAL-IP becomes `<pending>`.
4. **Secret Security:** The space before `kubectl` prevents saving to shell history but doesn't hide from process list.
5. **Docker Context:** Always run `eval $(minikube docker-env)` before building or running docker commands.

---

## Quick Reference Commands

```bash
# Start
minikube start
eval $(minikube docker-env)

# Check status
minikube status
kubectl get pods
kubectl get services

# View logs
kubectl logs -l app.kubernetes.io/name=todo-backend
kubectl logs -l app.kubernetes.io/name=todo-frontend

# Restart deployments
kubectl rollout restart deployment/backend
kubectl rollout restart deployment/frontend

# Get EXTERNAL-IP for frontend
kubectl get svc frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```
