# Research: Minikube Deployment for Phase-4 Application

**Feature**: 009-minikube-deployment
**Date**: 2026-01-26
**Phase**: Phase 0 - Research & Technical Decisions

## Overview

This document captures the research findings and technical decisions for deploying the phase-4 application to a local Minikube cluster. All decisions align with the minikube-deployment skill patterns and the project's constitution principles.

---

## 1. Docker Image Design

### Decision: Multi-stage Dockerfiles with Alpine Base

**Frontend (Next.js 16)**:
- **Base Image**: `node:20-alpine`
- **Stages**: deps → build → runner
- **Output Mode**: Standalone (requires `output: 'standalone'` in next.config.ts)
- **Rationale**:
  - Alpine images are ~50MB smaller than standard Node images
  - Multi-stage builds exclude dev dependencies from final image
  - Standalone output creates minimal production bundle
- **Trade-offs**:
  - First build takes 4-6 minutes (downloading + compiling)
  - Subsequent builds cache layers and take 1-2 minutes
  - Slightly more complex Dockerfile than single-stage

**Backend (FastAPI + uv)**:
- **Base Image**: `python:3.12-slim`
- **Stages**: builder → production
- **Package Manager**: uv (fast Python package installer)
- **Rationale**:
  - Slim images are smaller than full Python images
  - uv is significantly faster than pip for dependency installation
  - Multi-stage separates build dependencies from runtime
- **Trade-offs**:
  - First build takes 1-2 minutes
  - Requires uv to be available (copied from official image)
  - Non-root user adds security but increases complexity

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Single-stage builds** | Larger final images, includes dev tools |
| **Standard Node/Python images** | Images 2-3x larger (500MB vs 150MB) |
| **Distroless images** | Harder to debug, no shell for troubleshooting |

---

## 2. Helm Chart Configuration

### Decision: helm create with Custom values.yaml

**Chart Generation**:
- Start with `helm create <chart-name>` for both frontend and backend
- Customize `values.yaml` for project-specific configuration
- Keep default templates (deployment, service, ingress, etc.)

**Frontend values.yaml Customization**:
```yaml
replicaCount: 1
image:
  repository: todo-frontend  # Project-specific name
  pullPolicy: IfNotPresent    # CRITICAL: Not Always for local builds
  tag: "v1"
service:
  type: LoadBalancer         # External access via minikube tunnel
  port: 3000
env:
  API_URL: "http://backend:8000"  # Use backend service DNS
```

**Backend values.yaml Customization**:
```yaml
replicaCount: 1
image:
  repository: todo-backend
  pullPolicy: IfNotPresent    # CRITICAL: Not Always for local builds
  tag: "v1"
service:
  type: ClusterIP            # Internal only (security best practice)
  port: 8000
envFrom:
  - secretRef:
      name: app-secrets      # Load secrets from Kubernetes Secret
```

### Rationale

- **LoadBalancer for Frontend**: Provides production-like external access pattern
- **ClusterIP for Backend**: Security best practice (internal services not exposed)
- **IfNotPresent**: Prevents Kubernetes from trying to pull from remote registry (images are local)
- **Service DNS Names**: Helm release names become Kubernetes DNS names (e.g., `http://backend:8000`)

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **NodePort for frontend** | Less production-like, random ports |
| **LoadBalancer for backend** | Security risk (exposes internal API) |
| **imagePullPolicy: Always** | Causes ImagePullBackOff for local builds |

---

## 3. Service Discovery

### Decision: Kubernetes DNS with Service Name Resolution

**Frontend → Backend Communication**:
- Frontend uses environment variable `API_URL=http://backend:8000`
- Kubernetes DNS resolves `backend` to the backend service's ClusterIP
- No need for hardcoded IPs or localhost references

**How It Works**:
1. Backend deployed with Helm release name: `helm install backend ./helm-charts/backend`
2. Kubernetes creates service named `backend`
3. Frontend pods can reach backend at: `http://backend:8000`

### Rationale

- **Production-like**: Same pattern used in cloud Kubernetes (EKS, GKE, AKS)
- **Dynamic**: IP changes don't break communication (DNS resolves to current ClusterIP)
- **Isolated**: Backend not accessible from outside cluster (ClusterIP only)

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **localhost:8000** | Fails in Kubernetes (pods have different localhost) |
| **Pod IP addresses** | Dynamic IPs change on pod restart |
| **Hardcoded ClusterIP** | Not portable across clusters |

---

## 4. Database Connection

### Decision: External Neon PostgreSQL with Kubernetes Secrets

**Connection String**:
```
postgresql://user:password@ep-xxx.aws.neon.tech/dbname?sslmode=require
```

**Secret Management**:
```bash
# Create Kubernetes Secret
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL='postgresql://...'
```

**Backend values.yaml**:
```yaml
envFrom:
  - secretRef:
      name: app-secrets
```

### Rationale

- **No Database Pod**: Neon is managed service, no need for PostgreSQL in Minikube
- **SSL Required**: Neon enforces SSL, connection string must include `sslmode=require`
- **Kubernetes Secrets**: Same pattern works for local Minikube AND production clouds
- **Portability**: Credentials managed via Secrets, not hardcoded in values.yaml

### SSL Configuration

**asyncpg Connection (Backend)**:
```python
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db?ssl=require
# Or with explicit SSL mode:
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db?sslmode=require
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **PostgreSQL pod in Minikube** | Adds complexity, not production-like (uses Neon in production) |
| **Hardcoded DATABASE_URL** | Security risk, commits secrets to git |
| **ConfigMap for credentials** | Less secure than Secrets (base64 encoded, not encrypted) |

---

## 5. Health Checks

### Decision: Kubernetes Liveness and Readiness Probes

**Backend Health Check**:
- **Endpoint**: `/health` (already exists in main.py:86)
- **Liveness Probe**: `httpGet: { path: /health, port: 8000 }`
- **Readiness Probe**: `httpGet: { path: /health, port: 8000 }`
- **Configuration**:
  ```yaml
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
  ```

**Frontend Health Check**:
- **Endpoint**: `/` (root path, returns Next.js page)
- **Liveness Probe**: `httpGet: { path: /, port: 3000 }`
- **Readiness Probe**: `httpGet: { path: /, port: 3000 }`
- **Configuration**:
  ```yaml
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
  ```

### Rationale

- **Automatic Restart**: Kubernetes restarts failed pods based on liveness probe
- **Traffic Control**: Readiness probe prevents traffic until app is ready
- **Production-like**: Same probes used in cloud Kubernetes

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **No health checks** | Failed pods not detected, no auto-restart |
| **TCP socket probes** | Doesn't verify app is actually working |
| **exec command probes** | Less portable, requires specific container setup |

---

## 6. Build Context

### Decision: eval $(minikube docker-env) Before Building Images

**Critical Step**:
```bash
# Configure Docker CLI to use Minikube's Docker daemon
eval $(minikube docker-env)

# Build images (they go to Minikube's Docker, not Docker Desktop)
docker build -t todo-frontend:v1 ./frontend
docker build -t todo-backend:v1 ./backend
```

### How It Works

1. **Default Behavior**: `docker build` uses Docker Desktop's Docker daemon
2. **Problem**: Minikube can't see images built in Docker Desktop
3. **Solution**: `eval $(minikube docker-env)` redirects Docker CLI to Minikube's Docker
4. **Result**: Images built directly in Minikube, no registry push needed

### Rationale

- **No Registry**: Don't need to push to Docker Hub or private registry
- **Faster**: Images available immediately in Minikube
- **Production-like**: Simulates remote registry workflow

### Build Time Estimates

| Build Type | Frontend (Next.js) | Backend (FastAPI) | Total |
|------------|-------------------|-------------------|-------|
| **First build** | 4-6 minutes | 1-2 minutes | **5-8 minutes** |
| **Cached rebuild** | 1-2 minutes | 30-60 seconds | **2-3 minutes** |

**What affects build time**:
- Downloading dependencies (npm install, uv sync)
- Compiling Next.js (can take 3-4 minutes first time)
- CPU speed and available RAM
- .dockerignore (saves time by excluding node_modules)

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Push to Docker Hub** | Slower, requires registry, public images |
| **LoadBalancer imagePullPolicy: Always** | Causes ImagePullBackOff for local builds |
| **minikube image load** | Extra step, easier to forget than docker-env |

---

## 7. Environment Variable Strategy

### Decision: Kubernetes Secrets for Sensitive Data

**Sensitive Variables** (via Secrets):
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key for agents
- `XIAOMI_API_KEY` - Xiaomi model API key
- `BETTER_AUTH_SECRET` - JWT signing secret

**Non-Sensitive Variables** (via values.yaml):
- `HOST` - Backend host (0.0.0.0)
- `PORT` - Backend port (8000)
- `DEBUG` - Debug flag (true/false)
- `API_URL` - Frontend backend URL (http://backend:8000)

### Secret Creation

```bash
# Read .env.example to understand required variables
cat backend/.env.example

# Create secret with actual values
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL='postgresql://...' \
  --from-literal=OPENAI_API_KEY='sk-...' \
  --from-literal=XIAOMI_API_KEY='...'

# Verify secret created
kubectl get secret app-secrets
```

### values.yaml Configuration

```yaml
# Backend values.yaml
envFrom:
  - secretRef:
      name: app-secrets

# OR for individual variables:
env:
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: app-secrets
        key: DATABASE_URL
```

### Rationale

- **Security**: Secrets are base64 encoded and stored separately
- **Portability**: Same pattern for local Minikube and production clouds
- **Git Safety**: Secrets never committed to git (created via kubectl)

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **values.yaml for secrets** | Security risk, commits secrets to git |
| **ConfigMap for credentials** | Less secure, visible in plain text |
| **External secrets operator** | Overkill for local development |

---

## 8. Deployment Stages

### Decision: Helm Values Files per Stage

**Stage Structure**:
```
helm-charts/
├── backend/
│   ├── values.yaml          # Default (dev) configuration
│   ├── values-staging.yaml  # Staging overrides
│   └── values-prod.yaml     # Production-like overrides
└── frontend/
    ├── values.yaml          # Default (dev) configuration
    ├── values-staging.yaml  # Staging overrides
    └── values-prod.yaml     # Production-like overrides
```

**values-staging.yaml** (Backend):
```yaml
replicaCount: 1
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
```

**values-prod.yaml** (Backend):
```yaml
replicaCount: 2  # Multiple replicas for production
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 5
  targetCPUUtilizationPercentage: 80
resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 500m
    memory: 512Mi
```

### Deployment Commands

```bash
# Dev (default)
helm install backend ./helm-charts/backend
helm install frontend ./helm-charts/frontend

# Staging
helm install backend-staging ./helm-charts/backend -f ./helm-charts/backend/values-staging.yaml
helm install frontend-staging ./helm-charts/frontend -f ./helm-charts/frontend/values-staging.yaml

# Production-like
helm install backend-prod ./helm-charts/backend -f ./helm-charts/backend/values-prod.yaml
helm install frontend-prod ./helm-charts/frontend -f ./helm-charts/frontend/values-prod.yaml
```

### Rationale

- **Separation**: Each stage has isolated configuration
- **Resource Limits**: Production gets more resources and replicas
- **Testing**: Staging validates before production-like deployment

---

## 9. Minikube Tunnel Requirement

### Decision: minikube tunnel for LoadBalancer External IPs

**Why Tunnel Is Needed**:
- Minikube doesn't automatically assign external IPs to LoadBalancer services
- `minikube tunnel` creates network route to expose LoadBalancer locally
- Only LoadBalancer services get external IPs (ClusterIP stays internal)

**How to Use**:
```bash
# Terminal 1: Start tunnel (keep this terminal open)
minikube tunnel

# Terminal 2: Deploy and access services
helm install backend ./helm-charts/backend
helm install frontend ./helm-charts/frontend
kubectl get svc  # Frontend shows EXTERNAL-IP
```

**Expected Output**:
```
NAME       TYPE           EXTERNAL-IP      PORT(S)
backend    ClusterIP      <none>           8000/TCP
frontend   LoadBalancer   10.96.123.45     3000:xxxxx/TCP
```

### Rationale

- **Production-like**: LoadBalancer is the standard service type for cloud deployments
- **Stable Port**: Frontend always accessible on port 3000 (not random NodePort)
- **Real Testing**: Validates LoadBalancer behavior before cloud deployment

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **NodePort service** | Less production-like, random port assignment |
| **minikube service --url** | Temporary proxy, not production-like |
| **Ingress controller** | More complex setup for basic scenario |

---

## 10. .dockerignore Files

### Decision: Create .dockerignore Alongside Dockerfiles

**Frontend .dockerignore**:
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

**Backend .dockerignore**:
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
.venv/
```

### Rationale

- **Faster Builds**: Excludes node_modules, __pycache__, .venv from build context
- **Smaller Images**: Prevents copying unnecessary files into images
- **Security**: Excludes .env files (may contain secrets)
- **Clean Builds**: Excludes build artifacts (.next, dist, build)

---

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Docker Base** | node:20-alpine, python:3.12-slim | Smaller images, multi-stage builds |
| **Helm Charts** | helm create + customize values.yaml | Standard pattern, maintainable |
| **Frontend Service** | LoadBalancer | External access, production-like |
| **Backend Service** | ClusterIP | Security best practice (internal only) |
| **Image Pull Policy** | IfNotPresent | Prevents ImagePullBackOff for local builds |
| **Service Discovery** | Kubernetes DNS | Production-like, dynamic resolution |
| **Database** | External Neon + Secrets | Managed service, portable credentials |
| **Health Checks** | HTTP probes (/health, /) | Auto-restart, traffic control |
| **Build Context** | eval $(minikube docker-env) | Images built in Minikube Docker |
| **Secrets** | Kubernetes Secrets | Security, portability |
| **Deployment Stages** | values-staging.yaml, values-prod.yaml | Isolated configurations |
| **LoadBalancer Access** | minikube tunnel | External IPs for LoadBalancer |
| **Build Exclusions** | .dockerignore files | Faster builds, smaller images |

---

## Next Steps

1. **Phase 1**: Create data-model.md with Kubernetes resource specifications
2. **Phase 1**: Create contracts/k8s-resources.yaml with complete resource definitions
3. **Phase 1**: Create quickstart.md with step-by-step deployment guide
4. **Phase 1**: Update agent context with Kubernetes and Helm technology
