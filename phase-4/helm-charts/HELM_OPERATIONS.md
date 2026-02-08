# Helm Operations Guide

**Last Updated**: 2026-01-28
**Purpose**: Rollback, recovery, troubleshooting, and maintenance for Helm deployments

---

## Table of Contents

1. [Helm Rollback Procedures](#1-helm-rollback-procedures)
2. [Re-deployment Workflow](#2-re-deployment-workflow)
3. [Common Rollback Scenarios](#3-common-rollback-scenarios)
4. [Resource Requirements](#4-resource-requirements)
5. [Secret Rotation](#5-secret-rotation)
6. [Troubleshooting Helm Issues](#6-troubleshooting-helm-issues)

---

## 1. Helm Rollback Procedures

### View Deployment History

```bash
# View all revisions for backend
helm history backend

# View all revisions for frontend
helm history frontend
```

**Expected output:**
```
REVISION  UPDATED                   STATUS      CHART                APP VERSION  DESCRIPTION
1         Mon Jan 27 10:00:00 2026  superseded  todo-backend-v1      1.0.0        Install complete
2         Mon Jan 27 11:30:00 2026  deployed    todo-backend-v1      1.0.0        Upgrade complete
```

### Rollback to Previous Version

```bash
# Rollback backend to previous revision
helm rollback backend

# Rollback frontend to previous revision
helm rollback frontend

# Rollback to specific revision
helm rollback backend 1

# Verify rollback
helm history backend
kubectl get pods
```

### Rollback Workflow Example

```bash
# 1. Current deployment is broken
kubectl get pods
# NAME                                      READY   STATUS             RESTARTS   AGE
# backend-todo-backend-7dc88c57f4-ljnfw     0/1     CrashLoopBackOff   5          2m

# 2. Check history to find last working version
helm history backend
# REVISION  UPDATED                   STATUS      CHART
# 1         Mon Jan 27 10:00:00 2026  superseded  todo-backend-v1
# 2         Mon Jan 27 11:30:00 2026  deployed    todo-backend-v1  <- Current (broken)

# 3. Rollback to revision 1
helm rollback backend 1

# 4. Verify pods are healthy
kubectl get pods
# NAME                                      READY   STATUS    RESTARTS   AGE
# backend-todo-backend-667c88b4df-67bvp     1/1     Running   0          30s
```

---

## 2. Re-deployment Workflow

### After Code Changes

```bash
# 1. Configure Docker for Minikube (CRITICAL - must do first)
eval $(minikube docker-env)

# 2. Rebuild changed images with new tag
cd phase-4
docker build -t todo-backend:v2 ./backend
docker build -t todo-frontend:v2 ./frontend

# 3. Verify images in Minikube Docker
docker images | grep todo

# 4. Upgrade Helm releases with new image tag
cd helm-charts
helm upgrade backend ./todo-backend --set image.tag=v2
helm upgrade frontend ./todo-frontend --set image.tag=v2

# 5. Watch rollout status
kubectl rollout status deployment/backend-todo-backend
kubectl rollout status deployment/frontend-todo-frontend

# 6. Verify pods are running
kubectl get pods
```

### Re-deployment with Values Changes

```bash
# Update values.yaml files, then:
helm upgrade backend ./todo-backend -f todo-backend/values.yaml
helm upgrade frontend ./todo-frontend -f todo-frontend/values.yaml
```

### Quick Re-deployment (No Code Changes)

```bash
# Force pod restart to pick up config changes
kubectl rollout restart deployment/backend-todo-backend
kubectl rollout restart deployment/frontend-todo-frontend
```

---

## 3. Common Rollback Scenarios

### Scenario 1: Broken Image Deployment

**Symptom**: `ImagePullBackOff` or `ErrImagePull`

**Cause**: Image tag doesn't exist or was built in wrong Docker context

**Resolution**:
```bash
# 1. Check what image the pod is trying to use
kubectl describe pod backend-xxx | grep Image

# 2. Verify image exists in Minikube Docker
eval $(minikube docker-env)
docker images | grep todo-backend

# 3. If image missing, rebuild with correct tag
cd phase-4
docker build -t todo-backend:v1 ./backend

# 4. Restart deployment
kubectl rollout restart deployment/backend-todo-backend
```

### Scenario 2: Configuration Error

**Symptom**: Pods run but crash with config-related errors

**Cause**: Wrong environment variable or missing secret

**Resolution**:
```bash
# 1. Check pod logs for error details
kubectl logs backend-xxx

# 2. Describe pod to see environment variables
kubectl describe pod backend-xxx | grep -A20 "Environment:"

# 3. Fix secret or values.yaml, then upgrade
helm upgrade backend ./todo-backend
```

### Scenario 3: Database Connection Failure

**Symptom**: `connection refused` or `SSL required` errors

**Cause**: Wrong DATABASE_URL or missing SSL mode

**Resolution**:
```bash
# 1. Verify secret has correct values
kubectl get secret app-secrets -o jsonpath='{.data.DATABASE_URL}' | base64 -d

# 2. Should include: sslmode=require
# Correct format: postgresql+asyncpg://user:pass@host:5432/db?sslmode=require

# 3. Delete and recreate secret if wrong
kubectl delete secret app-secrets
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL='postgresql+asyncpg://user:pass@host/db?sslmode=require' \
  --from-literal=DATABASE_URL_PG='postgresql://user:pass@host/db?sslmode=require' \
  --from-literal=OPENAI_API_KEY='sk-xxx' \
  --from-literal=XIAOMI_API_KEY='sk-xxx' \
  --from-literal=BETTER_AUTH_SECRET='xxx' \
  --from-literal=MCP_SERVER_TIMEOUT='30'

# 4. Restart deployments
kubectl rollout restart deployment/backend-todo-backend
kubectl rollout restart deployment/frontend-todo-frontend
```

### Scenario 4: CrashLoopBackOff

**Symptom**: Pod restarts repeatedly

**Cause**: Application error, missing dependency, or port conflict

**Resolution**:
```bash
# 1. View logs to identify error
kubectl logs backend-xxx --previous

# 2. Check if port is already in use
kubectl get svc

# 3. If code issue is recent, rollback to previous version
helm rollback backend

# 4. Otherwise, fix code and rebuild
eval $(minikube docker-env)
cd phase-4
docker build -t todo-backend:v1 ./backend
helm upgrade backend ./todo-backend
```

---

## 4. Resource Requirements

### Minikube Resource Allocation

| Component | CPU | Memory | Disk |
|-----------|-----|--------|------|
| **Minikube Node** | 2+ CPUs | 4+ GB | 30+ GB |
| **Frontend Pod** | 250m (request) / 500m (limit) | 256Mi (request) / 512Mi (limit) | - |
| **Backend Pod** | 250m (request) / 500m (limit) | 256Mi (request) / 512Mi (limit) | - |

### Starting Minikube with Sufficient Resources

```bash
# Stop Minikube first
minikube stop

# Start with adequate resources
minikube start --cpus=4 --memory=8192 --disk-size=50g
```

### Checking Resource Usage

```bash
# Check node resources
kubectl top nodes

# Check pod resource usage
kubectl top pods

# Describe pod for resource limits
kubectl describe pod backend-xxx | grep -A5 "Limits:"
```

### Adjusting Resource Limits

Edit `helm-charts/todo-backend/values.yaml` or `todo-frontend/values.yaml`:

```yaml
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
```

Then apply:
```bash
helm upgrade backend ./todo-backend
```

---

## 5. Secret Rotation

### Rotating a Single Secret Value

```bash
# 1. Get current secret value (optional - for reference)
kubectl get secret app-secrets -o jsonpath='{.data.OPENAI_API_KEY}' | base64 -d

# 2. Patch the secret with new value (base64 encoded)
kubectl patch secret app-secrets -p '{"data":{"OPENAI_API_KEY":"'$(echo -n 'sk-new-key-here' | base64)'"}}'

# 3. Restart deployments to pick up new value
kubectl rollout restart deployment/backend-todo-backend
kubectl rollout restart deployment/frontend-todo-frontend

# 4. Verify new value is in use
kubectl describe pod backend-xxx | grep OPENAI_API_KEY
```

### Recreating All Secrets

```bash
# 1. Delete existing secret
kubectl delete secret app-secrets

# 2. Create new secret with updated values
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL='postgresql+asyncpg://user:password@ep-xxx.aws.neon.tech/db?sslmode=require' \
  --from-literal=DATABASE_URL_PG='postgresql://user:password@ep-xxx.aws.neon.tech/db?sslmode=require' \
  --from-literal=OPENAI_API_KEY='sk-new-key' \
  --from-literal=XIAOMI_API_KEY='sk-new-key' \
  --from-literal=BETTER_AUTH_SECRET='new-secret-min-32-chars' \
  --from-literal=MCP_SERVER_TIMEOUT='30'

# 3. Verify secret created
kubectl get secret app-secrets

# 4. Restart deployments
kubectl rollout restart deployment/backend-todo-backend
kubectl rollout restart deployment/frontend-todo-frontend

# 5. Verify pods are healthy
kubectl get pods
```

### Rotating Database Credentials

**Important**: Update the database credentials in Neon first, then in Kubernetes:

```bash
# 1. Update credentials in Neon Console
# 2. Delete and recreate app-secrets with new DATABASE_URL
kubectl delete secret app-secrets
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL='postgresql+asyncpg://newuser:newpass@ep-xxx.aws.neon.tech/db?sslmode=require' \
  --from-literal=DATABASE_URL_PG='postgresql://newuser:newpass@ep-xxx.aws.neon.tech/db?sslmode=require' \
  --from-literal=OPENAI_API_KEY='sk-existing' \
  --from-literal=XIAOMI_API_KEY='sk-existing' \
  --from-literal=BETTER_AUTH_SECRET='existing-secret' \
  --from-literal=MCP_SERVER_TIMEOUT='30'

# 3. Restart deployments
kubectl rollout restart deployment/backend-todo-backend
kubectl rollout restart deployment/frontend-todo-frontend
```

---

## 6. Troubleshooting Helm Issues

### Issue: Helm install fails with "already exists"

**Cause**: Release name already in use

**Solution**:
```bash
# Check existing releases
helm list

# Upgrade existing release instead
helm upgrade backend ./todo-backend

# Or uninstall first, then reinstall
helm uninstall backend
helm install backend ./todo-backend
```

### Issue: Helm upgrade has no effect

**Cause**: Values didn't change or image tag same

**Solution**:
```bash
# Force upgrade by setting --reuse-values=false
helm upgrade backend ./todo-backend --reuse-values=false

# Or specify new image tag
helm upgrade backend ./todo-backend --set image.tag=v2

# Or add --force to recreate pods
helm upgrade backend ./todo-backend --force
```

### Issue: Cannot connect to Helm release

**Cause**: Release in different namespace

**Solution**:
```bash
# List releases in all namespaces
helm list -A

# Target specific namespace
helm list -n staging
helm upgrade backend ./todo-backend -n staging
```

### Issue: Helm history shows "pending-install" or "pending-upgrade"

**Cause**: Previous deployment was interrupted

**Solution**:
```bash
# Rollback to last good revision
helm rollback backend

# If rollback fails, uninstall and reinstall
helm uninstall backend
helm install backend ./todo-backend
```

---

## Quick Reference Commands

```bash
# Helm Release Management
helm list                              # List all releases
helm history backend                   # View release history
helm rollback backend                  # Rollback to previous version
helm rollback backend 1                # Rollback to specific revision
helm upgrade backend ./todo-backend    # Upgrade release
helm uninstall backend                 # Uninstall release

# Status & Verification
kubectl get pods                       # Check pod status
kubectl get svc                        # Check service status
kubectl describe pod <name>            # Detailed pod info
kubectl logs <pod-name>                # View pod logs
kubectl rollout status deployment/backend-todo-backend  # Check rollout

# Re-deployment
eval $(minikube docker-env)            # Configure Docker for Minikube
docker build -t todo-backend:v1 ./backend  # Build image
helm upgrade backend ./todo-backend    # Upgrade release
kubectl rollout restart deployment/backend-todo-backend  # Restart pods

# Secrets
kubectl get secrets                    # List secrets
kubectl describe secret app-secrets     # Secret details (values encoded)
kubectl get secret app-secrets -o jsonpath='{.data.DATABASE_URL}' | base64 -d  # Decode value
```

---

## Best Practices

1. **Always check history before rollback** - `helm history` shows you what versions exist
2. **Build images in Minikube Docker** - Never forget `eval $(minikube docker-env)`
3. **Use semantic versioning** - Tag images as v1, v2, v3 for clear rollback paths
4. **Test upgrades in staging first** - Don't break production with untested changes
5. **Keep secrets in sync** - When rotating secrets, restart all dependent pods
6. **Monitor resource usage** - Set appropriate limits to prevent resource exhaustion
7. **Document your rollback points** - Note which revisions correspond to working deployments
