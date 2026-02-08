# Phase 5: Local Development Setup

Complete guide for running the Phase 5 microservices application locally using Minikube.

---

## Quick Start (All Commands)

```bash
# Terminal 1: Start Minikube and tunnel (keep this open)
minikube start
eval $(minikube docker-env)
minikube tunnel

# Terminal 2: Deploy everything
cd phase-5

# Apply Dapr components
kubectl apply -f k8s-dapr/redis.yaml
kubectl apply -f k8s-dapr/components/
kubectl apply -f k8s-dapr/bindings/

# Create Kafka topics
kubectl exec -it redpanda-0 -- rpk topic create task-created
kubectl exec -it redpanda-0 -- rpk topic create task-completed
kubectl exec -it redpanda-0 -- rpk topic create task-deleted

# Create/Update app secrets (REQUIRED - see below)
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL="postgresql://user:password@host/database?sslmode=require" \
  --from-literal=OPENAI_API_KEY="sk-proj-your-openai-key-here" \
  --from-literal=XIAOMI_API_KEY="your-xiaomi-api-key-here" \
  --from-literal=PORT="8000" \
  --from-literal=HOST="0.0.0.0" \
  --from-literal=DEBUG="true" \
  --dry-run=client -o yaml | kubectl apply -f -

# Build images
docker build -t phase5-backend:v7 -f backend/Dockerfile backend
docker build -t todo-frontend:v2 \
  --build-arg NEXT_PUBLIC_WEBSOCKET_URL=ws://127.0.0.1:8004 \
  -f frontend/Dockerfile frontend

# Deploy services
helm upgrade --install backend-api helm-charts/todo-backend \
  --set image.repository=phase5-backend --set image.tag=v7
helm upgrade --install frontend helm-charts/todo-frontend \
  --set image.repository=todo-frontend --set image.tag=v2
helm upgrade --install recurring-service helm-charts/recurring-service
helm upgrade --install notification-service helm-charts/notification-service
helm upgrade --install audit-service helm-charts/audit-service
helm upgrade --install websocket-service helm-charts/websocket-service

# Wait for pods to be ready
kubectl get pods -w
```

---

## Environment Variables

### Required Environment Variables

You MUST create a Kubernetes secret with these values:

```yaml
# app-secrets secret
DATABASE_URL: "postgresql://user:password@host/database?sslmode=require"
OPENAI_API_KEY: "sk-proj-your-openai-key-here"
XIAOMI_API_KEY: "your-xiaomi-api-key-here"
PORT: "8000"
HOST: "0.0.0.0"
DEBUG: "true"
```

### How to Apply Environment Variables

**Option 1: Create Secret from Command Line**

```bash
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL="your-database-url" \
  --from-literal=OPENAI_API_KEY="your-openai-key" \
  --from-literal=XIAOMI_API_KEY="your-xiaomi-key" \
  --from-literal=PORT="8000" \
  --from-literal=HOST="0.0.0.0" \
  --from-literal=DEBUG="true" \
  --namespace default
```

**Option 2: Create Secret from File**

1. Create `phase-5/k8s-dapr/app-secrets.yaml`:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: default
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:password@host/database?sslmode=require"
  OPENAI_API_KEY: "sk-proj-your-openai-key-here"
  XIAOMI_API_KEY: "your-xiaomi-api-key-here"
  PORT: "8000"
  HOST: "0.0.0.0"
  DEBUG: "true"
```

2. Apply the secret:
```bash
kubectl apply -f phase-5/k8s-dapr/app-secrets.yaml
```

**Option 3: Update Existing Secret**

```bash
kubectl delete secret app-secrets -n default
# Then recreate using Option 1 or 2
```

---

## Current Running Configuration

### Backend Environment Variables

| Variable | Example Value | Source |
|----------|--------------|--------|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | Secret `app-secrets` |
| `OPENAI_API_KEY` | `sk-proj-...` | Secret `app-secrets` |
| `XIAOMI_API_KEY` | `your-key-here.aswxod4r...` | Secret `app-secrets` |
| `PORT` | `8000` | Secret `app-secrets` |
| `HOST` | `0.0.0.0` | Secret `app-secrets` |
| `DEBUG` | `true` | Secret `app-secrets` |
| `DAPR_HTTP_PORT` | `3500` | Auto (Dapr sidecar) |

### Frontend Environment Variables

| Variable | Value | Source |
|----------|-------|--------|
| `BACKEND_URL` | `http://backend-api-todo-backend:8000` | Helm values |
| `NEXT_PUBLIC_WEBSOCKET_URL` | `ws://127.0.0.1:8004` | Helm build args |
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:8000` | Helm values |
| `NEXT_PUBLIC_DEMO_MODE` | `false` | Helm values |

---

## Stopping and Starting

### Stop (End of Day)

```bash
# Stop minikube (this also stops the tunnel)
minikube stop
```

### Start (Next Day)

```bash
# Start minikube
minikube start

# Set Docker environment (IMPORTANT!)
eval $(minikube docker-env)

# Start tunnel in separate terminal
minikube tunnel

# Your deployments are still there! Check pods:
kubectl get pods
```

**Note:** Helm releases and secrets persist across Minikube restarts. You only need to rebuild images if you've made code changes.

---

## Rebuilding After Code Changes

```bash
cd phase-5
eval $(minikube docker-env)  # Always do this first!

# Build new version
docker build -t phase5-backend:v8 -f backend/Dockerfile backend

# Deploy
helm upgrade backend-api helm-charts/todo-backend \
  --set image.repository=phase5-backend \
  --set image.tag=v8
```

---

## Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://127.0.0.1:3000 |
| Backend API | http://127.0.0.1:8000 |
| Backend Health | http://127.0.0.1:8000/health |
| WebSocket | ws://127.0.0.1:8004 |

---

## Troubleshooting

### Services Not Accessible at 127.0.0.1

**Problem:** Can't access services

**Solution:**
```bash
# 1. Check tunnel is running
ps aux | grep "minikube tunnel"

# 2. If not running, start it
minikube tunnel

# 3. Check services have EXTERNAL-IP of 127.0.0.1
kubectl get svc
```

### Images Not Found

**Problem:** Pods crash with `ImagePullBackOff`

**Solution:**
```bash
# ALWAYS set docker env before building
eval $(minikube docker-env)

# Verify image exists
docker images | grep phase5-backend

# Rebuild and deploy
docker build -t phase5-backend:v8 -f backend/Dockerfile backend
helm upgrade backend-api helm-charts/todo-backend --set image.tag=v8
```

### Environment Variables Not Loading

**Problem:** Services can't connect to database or API keys missing

**Solution:**
```bash
# Check secret exists
kubectl get secret app-secrets -n default

# Check what's in the secret
kubectl get secret app-secrets -n default -o yaml

# Recreate secret if needed
kubectl delete secret app-secrets -n default
# Then recreate using options above
```

### Events Not Being Processed

**Problem:** Tasks created but recurring tasks don't generate, audit logs missing

**Solution:**
```bash
# Check if Dapr components are applied
kubectl get components

# Check Kafka topics exist
kubectl exec -it redpanda-0 -- rpk topic list

# Check microservice logs
kubectl logs -l app=recurring-service --tail=50
kubectl logs -l app=audit-service --tail=50
```

---

## Secrets Management for Cloud Deployment

For Oracle Cloud or AWS deployment:

### Current Approach (Kubernetes Secrets)
- Secrets stored in `app-secrets` Kubernetes secret
- Works for both local and cloud
- Simple, no code changes needed

### For Production (Recommended)
Use **External Secrets Operator** to sync from cloud secret managers:

```bash
# Install External Secrets Operator
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets

# Create SecretStore (AWS example)
kubectl apply -f - <<EOF
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
EOF
```

---

## Services Overview

| Service | Port | Description |
|---------|------|-------------|
| backend-api | 8000 | Main FastAPI backend with ChatKit + Agents |
| recurring-service | 8001 | Generates next recurring tasks |
| notification-service | 8002 | Creates reminder notifications |
| audit-service | 8003 | Logs all task events |
| websocket-service | 8004 | Real-time updates (WebSocket + SSE) |
| redis | 6379 | Dapr state store for idempotency |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Frontend (Next.js)                              │
│                         http://127.0.0.1:3000                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Dapr Pub/Sub (Kafka)                               │
│                        topics: task-created, task-completed                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
        ┌───────────────────┬───────────┴───────────┬───────────────────┐
        ▼                   ▼                       ▼                   ▼
┌──────────────┐   ┌──────────────┐      ┌──────────────┐   ┌──────────────┐
│   recurring  │   │ notification │      │     audit    │   │  websocket   │
│   -service   │   │   -service   │      │   -service   │   │  -service    │
│     :8001    │   │     :8002    │      │     :8003    │   │     :8004    │
└──────────────┘   └──────────────┘      └──────────────┘   └──────────────┘
```
