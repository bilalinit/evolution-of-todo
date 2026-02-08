# Next.js + FastAPI Example

Reference implementation from a real project deployed to Minikube.

## Files

| File | Description |
|------|-------------|
| `Dockerfile.nextjs` | Multi-stage Next.js Dockerfile (standalone mode) |
| `Dockerfile.fastapi` | Multi-stage FastAPI Dockerfile (with uv) |
| `values.frontend.yaml` | Frontend Helm chart values (LoadBalancer service) |
| `values.backend.yaml` | Backend Helm chart values (ClusterIP service) |

## Quick Reference

### Frontend Dockerfile Highlights
- Base: `node:20-alpine`
- Multi-stage: deps → build → runner
- Standalone output for production
- Non-root user: `nextjs:nodejs`
- Port: 3000

### Backend Dockerfile Highlights
- Base: `python:3.13-slim`
- Multi-stage: builder → production
- Uses `uv` for dependency management
- Non-root user: `appuser:appgroup`
- Port: 8000

### Frontend values.yaml
- Service type: `LoadBalancer` (external access)
- Image: `nextjs-frontend:latest`
- Port: 3000
- Env var: `API_URL: "http://backend:8000"`

### Backend values.yaml
- Service type: `ClusterIP` (internal only)
- Image: `python-backend:latest`
- Port: 8000
- Health probes: `/health`

## Architecture

| Component | Service Type | Access |
|-----------|--------------|--------|
| Frontend | LoadBalancer | External (see methods below) |
| Backend | ClusterIP | Internal only (frontend reaches via `http://backend:8000`) |

This simulates production cloud architecture where:
- Frontend is publicly accessible
- Backend is internal-only (security best practice)

## Deployment Commands

```bash
# From project root
minikube start
eval $(minikube docker-env)
docker build -t nextjs-frontend:v1 ./frontend
docker build -t python-backend:v1 ./backend
helm install frontend ./helm-charts/frontend
helm install backend ./helm-charts/backend
```

## Accessing the Application

### Method 1: Using minikube tunnel (Recommended)

```bash
# In a NEW terminal:
minikube tunnel

# Note: If your environment requires sudo, use:
# sudo minikube tunnel

# Get the EXTERNAL-IP:
kubectl get svc frontend

# Output:
# NAME       TYPE           EXTERNAL-IP     PORT(S)
# frontend   LoadBalancer   10.96.123.45    3000:xxxxx/TCP
#                            ↑↑↑↑↑↑↑↑↑↑↑↑↑

# Access at:
http://10.96.123.45:3000
```

### Method 2: Using minikube service (Fallback)

```bash
# If tunnel doesn't work, use this fallback:
minikube service frontend --url

# Output:
# http://127.0.0.1:xxxxx

# Access at the URL shown
```

| Method | Pros | Cons |
|--------|------|------|
| **minikube tunnel** | Production-like, stable port (3000) | Requires separate terminal, sudo |
| **minikube service** | Simple, no sudo needed | Random port, less production-like |
| **Ingress** | Nice URLs (todo.local), production pattern | More setup, requires hosts file edit |

---

### Method 3: Using Ingress (Production Pattern - Optional)

This gives you nice URLs like `http://todo.local` instead of IP addresses.

```bash
# 1. Enable ingress addon
minikube addons enable ingress

# 2. Update frontend values.yaml with Ingress:
# ingress.enabled: true
# service.type: ClusterIP
# See values.frontend.ingress.yaml for full example

# 3. Upgrade the release
helm upgrade frontend ./helm-charts/frontend

# 4. Add to hosts file
echo "$(minikube ip) todo.local" | sudo tee -a /etc/hosts

# 5. Access at:
http://todo.local
```

**Benefits:**
- Nice URL (`todo.local` instead of `10.96.123.45:3000`)
- Production-ready pattern (same approach used in AWS, Oracle, etc.)
- No tunnel needed
- Cheaper in production (one LoadBalancer for all services)

**See:** `WORKFLOW.md` → "Optional: Setup Ingress" for complete guide.
