# Data Model: Minikube Deployment for Phase-4 Application

**Feature**: 009-minikube-deployment
**Date**: 2026-01-26
**Phase**: Phase 1 - Design & Contracts

## Overview

This document defines the Kubernetes resource specifications, data flow, and deployment configuration for the phase-4 application in Minikube.

---

## 1. Kubernetes Resource Model

### 1.1 Namespace Strategy

| Stage | Namespace | Purpose |
|-------|-----------|---------|
| **Dev** | `default` | Primary development environment |
| **Staging** | `staging` | Pre-production testing |
| **Production-like** | `production` | Production simulation |

**Decision**: Use default namespace for simplicity in initial deployment. Namespaces can be added later for isolation.

### 1.2 Pod Specifications

#### Frontend Pod (Next.js)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: frontend-<hash>
  labels:
    app: frontend
    tier: web
spec:
  containers:
  - name: frontend
    image: todo-frontend:v1
    imagePullPolicy: IfNotPresent
    ports:
    - name: http
      containerPort: 3000
      protocol: TCP
    env:
    - name: API_URL
      value: "http://backend:8000"
    - name: NODE_ENV
      value: "production"
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
      timeoutSeconds: 5
      failureThreshold: 3
    readinessProbe:
      httpGet:
        path: /
        port: http
      initialDelaySeconds: 10
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3
    securityContext:
      runAsNonRoot: true
      runAsUser: 1001
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: false
```

#### Backend Pod (FastAPI)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: backend-<hash>
  labels:
    app: backend
    tier: api
spec:
  containers:
  - name: backend
    image: todo-backend:v1
    imagePullPolicy: IfNotPresent
    ports:
    - name: http
      containerPort: 8000
      protocol: TCP
    envFrom:
    - secretRef:
        name: app-secrets
    - configMapRef:
        name: backend-config
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
      timeoutSeconds: 5
      failureThreshold: 3
    readinessProbe:
      httpGet:
        path: /health
        port: http
      initialDelaySeconds: 5
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3
    securityContext:
      runAsNonRoot: true
      runAsUser: 1000
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: false
    volumeMounts:
    - name: tmp
      mountPath: /tmp
  volumes:
  - name: tmp
    emptyDir: {}
```

### 1.3 Service Specifications

#### Frontend Service (LoadBalancer)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
  labels:
    app: frontend
    tier: web
spec:
  type: LoadBalancer
  selector:
    app: frontend
  ports:
  - name: http
    protocol: TCP
    port: 3000
    targetPort: http
  sessionAffinity: None
```

**DNS Name**: `frontend.default.svc.cluster.local` (shorthand: `frontend`)

#### Backend Service (ClusterIP)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
  labels:
    app: backend
    tier: api
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
  - name: http
    protocol: TCP
    port: 8000
    targetPort: http
  sessionAffinity: None
```

**DNS Name**: `backend.default.svc.cluster.local` (shorthand: `backend`)

---

## 2. Secret Specifications

### 2.1 Application Secrets (app-secrets)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:
  # Database Connection (Neon PostgreSQL)
  DATABASE_URL: "postgresql+asyncpg://user:password@ep-xxx.aws.neon.tech/dbname?sslmode=require"

  # OpenAI API for Agents SDK
  OPENAI_API_KEY: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

  # Xiaomi Model API Key
  XIAOMI_API_KEY: "your_xiaomi_api_key_here"

  # Better Auth JWT Secret
  BETTER_AUTH_SECRET: "your-secret-key-here-min-32-chars"

  # MCP Server Configuration
  MCP_SERVER_TIMEOUT: "30"
```

### 2.2 Secret Creation Command

```bash
# Create secret with actual values
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL='postgresql+asyncpg://user:pass@ep-xxx.aws.neon.tech/db?sslmode=require' \
  --from-literal=OPENAI_API_KEY='sk-...' \
  --from-literal=XIAOMI_API_KEY='...' \
  --from-literal=BETTER_AUTH_SECRET='...' \
  --from-literal=MCP_SERVER_TIMEOUT='30'
```

---

## 3. ConfigMap Specifications

### 3.1 Backend Configuration (backend-config)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
data:
  # Server Configuration
  HOST: "0.0.0.0"
  PORT: "8000"
  DEBUG: "false"

  # CORS Configuration (for Minikube access)
  CORS_ORIGINS: "http://localhost:3000,http://frontend:3000"
```

---

## 4. Deployment Specifications

### 4.1 Frontend Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  labels:
    app: frontend
    tier: web
spec:
  replicas: 1
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
        tier: web
    spec:
      # (Pod specification from section 1.2)
```

### 4.2 Backend Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  labels:
    app: backend
    tier: api
spec:
  replicas: 1
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
        tier: api
    spec:
      # (Pod specification from section 1.2)
```

---

## 5. Data Flow Architecture

### 5.1 External Access Flow

```
User Browser
    ↓
minikube tunnel (network route)
    ↓
LoadBalancer Service (frontend)
    ↓ EXTERNAL-IP:3000
Frontend Pod (Next.js)
    ↓
Kubernetes DNS Resolution
    ↓ http://backend:8000
ClusterIP Service (backend)
    ↓
Backend Pod (FastAPI)
    ↓
Neon PostgreSQL (external, SSL)
```

### 5.2 Internal Service Communication

```
Frontend Pod → Service DNS → Backend Pod
     ↓               ↓              ↓
  API_URL       backend:8000    Port 8000
(env var)      (ClusterIP)    (Container)
```

### 5.3 Database Connection Flow

```
Backend Pod
    ↓ (asyncpg with SSL)
Neon PostgreSQL (external)
    ↓ sslmode=require
Encrypted Connection
```

---

## 6. Environment Variable Mapping

### 6.1 Frontend Environment Variables

| Variable | Source | Value | Purpose |
|----------|--------|-------|---------|
| `API_URL` | values.yaml | `http://backend:8000` | Backend API endpoint |
| `NODE_ENV` | values.yaml | `production` | Next.js environment |
| `PORT` | Container default | `3000` | Frontend port |

### 6.2 Backend Environment Variables

| Variable | Source | Value | Purpose |
|----------|--------|-------|---------|
| `DATABASE_URL` | Secret (app-secrets) | From Neon | PostgreSQL connection |
| `OPENAI_API_KEY` | Secret (app-secrets) | From OpenAI | Agents SDK API key |
| `XIAOMI_API_KEY` | Secret (app-secrets) | From Xiaomi | Model API key |
| `BETTER_AUTH_SECRET` | Secret (app-secrets) | Generated | JWT signing secret |
| `MCP_SERVER_TIMEOUT` | Secret (app-secrets) | `30` | MCP timeout (seconds) |
| `HOST` | ConfigMap (backend-config) | `0.0.0.0` | Server bind address |
| `PORT` | ConfigMap (backend-config) | `8000` | Server port |
| `DEBUG` | ConfigMap (backend-config) | `false` | Debug mode |
| `CORS_ORIGINS` | ConfigMap (backend-config) | Comma list | Allowed CORS origins |

---

## 7. Resource Requirements

### 7.1 Minimum Requirements (Dev)

| Component | CPU | Memory | Pods |
|-----------|-----|--------|------|
| Frontend | 250m / 500m | 256Mi / 512Mi | 1 |
| Backend | 250m / 500m | 256Mi / 512Mi | 1 |
| **Total** | **500m / 1** | **512Mi / 1Gi** | **2** |

### 7.2 Staging Requirements

| Component | CPU | Memory | Pods |
|-----------|-----|--------|------|
| Frontend | 250m / 500m | 256Mi / 512Mi | 1 |
| Backend | 250m / 500m | 256Mi / 512Mi | 1 |
| **Total** | **500m / 1** | **512Mi / 1Gi** | **2** |

### 7.3 Production-like Requirements

| Component | CPU | Memory | Pods | Autoscaling |
|-----------|-----|--------|------|-------------|
| Frontend | 500m / 1 | 512Mi / 1Gi | 2 | 2-5 replicas |
| Backend | 500m / 1 | 512Mi / 1Gi | 2 | 2-5 replicas |
| **Total** | **1 / 2** | **1Gi / 2Gi** | **4** | **4-10 replicas** |

### 7.4 Minikube Cluster Requirements

**Minimum for Dev**:
- CPUs: 2
- Memory: 4GB
- Disk: 20GB

**Recommended for Production-like**:
- CPUs: 4
- Memory: 8GB
- Disk: 40GB

---

## 8. Health Check Specifications

### 8.1 Frontend Health Checks

| Probe Type | Path | Port | Initial Delay | Period | Timeout | Threshold |
|------------|------|------|---------------|--------|---------|-----------|
| Liveness | `/` | 3000 | 30s | 30s | 5s | 3 |
| Readiness | `/` | 3000 | 10s | 10s | 5s | 3 |

### 8.2 Backend Health Checks

| Probe Type | Path | Port | Initial Delay | Period | Timeout | Threshold |
|------------|------|------|---------------|--------|---------|-----------|
| Liveness | `/health` | 8000 | 10s | 30s | 5s | 3 |
| Readiness | `/health` | 8000 | 5s | 10s | 5s | 3 |

### 8.3 Health Response Format

**Backend /health Endpoint**:
```json
{
  "status": "healthy",
  "service": "todo-backend",
  "version": "0.1.0"
}
```

---

## 9. Deployment Strategies

### 9.1 Rolling Update Configuration

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # Create 1 extra pod during update
    maxUnavailable: 0  # Never have 0 pods available
```

**Behavior**:
1. New pod created (maxSurge: 1)
2. New pod passes readiness checks
3. Old pod terminated
4. Zero downtime deployment

### 9.2 Rollback Strategy

```bash
# Helm rollback (preserves configuration)
helm rollback backend 1
helm rollback frontend 1

# Or Kubernetes rollout restart
kubectl rollout restart deployment/backend
kubectl rollout restart deployment/frontend
```

---

## 10. Resource Lifecycle

### 10.1 Pod Lifecycle

```
Pending → Running → Ready
    ↓
  (Terminating)
    ↓
   Succeeded / Failed
```

**Events**:
1. **Pod Scheduled**: Kubernetes assigns pod to node
2. **Pulling Image**: Image pulled (or found locally with IfNotPresent)
3. **Container Creating**: Container created
4. **Container Running**: Application starts
5. **Readiness Check**: Pod marked ready after probe passes

### 10.2 Service Lifecycle

```
Service Created → Endpoints Provisioned → DNS Registration → Traffic Routing
```

**Events**:
1. **Service Created**: LoadBalancer/ClusterIP allocated
2. **Endpoints Provisioned**: Service discovers matching pods
3. **DNS Registration**: DNS name registered (e.g., `backend.default.svc.cluster.local`)
4. **Traffic Routing**: Incoming traffic routed to pods

---

## 11. State Management

### 11.1 Stateless Application Design

**Frontend**:
- No local state storage
- All data from backend API
- Authentication via JWT tokens (stored in cookies/memory)

**Backend**:
- No in-memory session storage
- All state in Neon PostgreSQL
- ChatKit sessions stored in database
- Connection pooling via asyncpg

### 11.2 Pod Restart Behavior

**On Pod Restart**:
1. New pod created with same configuration
2. Database connections re-established
3. No data loss (state in database)
4. Brief downtime (rolling update prevents this)

**On Node Failure**:
1. Pods rescheduled to healthy nodes
2. Services updated with new pod IPs
3. No manual intervention required

---

## 12. Security Model

### 12.1 Network Security

| Service Type | External Access | Internal Access | Security |
|--------------|-----------------|-----------------|----------|
| Frontend (LoadBalancer) | Yes (via tunnel) | Yes | Standard HTTP |
| Backend (ClusterIP) | No | Yes | Internal only |

### 12.2 Pod Security

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: false  # Set to true if app supports it
```

### 12.3 Secret Management

**Best Practices**:
- Secrets stored in Kubernetes Secrets (base64 encoded)
- Secrets never committed to git
- Secrets mounted as environment variables
- Secret rotation supported (delete and recreate)

---

## 13. Monitoring and Observability

### 13.1 Pod Logs

```bash
# View frontend logs
kubectl logs -l app=frontend

# View backend logs
kubectl logs -l app=backend

# Follow logs (tail -f)
kubectl logs -f -l app=backend
```

### 13.2 Pod Events

```bash
# View pod events
kubectl describe pod <pod-name>

# View all pod events
kubectl get events --sort-by=.metadata.creationTimestamp
```

### 13.3 Service Endpoints

```bash
# View service endpoints (pod IPs)
kubectl get endpoints backend
kubectl get endpoints frontend
```

---

## 14. Migration and Data Management

### 14.1 Database Schema

**Existing Tables** (managed by backend):
- `users` - User accounts
- `tasks` - Task items
- `chatkit_threads` - ChatKit conversation threads
- `chatkit_messages` - ChatKit messages

**Migration Strategy**:
- Database schema managed by SQLModel (code-first)
- Migrations run via backend scripts (`scripts/init_db.py`)
- No separate migration pod required

### 14.2 Database Initialization

```bash
# Run database initialization (external to Minikube)
cd phase-4/backend
uv run scripts/init_db.py
```

---

## Summary

This data model defines the complete Kubernetes resource specifications for deploying the phase-4 application to Minikube. Key points:

- **2 Services**: Frontend (LoadBalancer), Backend (ClusterIP)
- **2 Deployments**: Frontend (Next.js), Backend (FastAPI)
- **1 External Database**: Neon PostgreSQL (SSL required)
- **Secrets**: Application credentials via Kubernetes Secrets
- **Health Checks**: Liveness and readiness probes on both services
- **Resource Limits**: Configurable CPU/memory per deployment stage
- **Stateless Design**: All state in database, pods can restart safely
