# Helm Values Reference

**Feature**: 009-minikube-deployment
**Date**: 2026-01-26

Complete reference for Helm chart `values.yaml` configuration files.

---

## Overview

Helm charts use `values.yaml` files to configure Kubernetes resources. This document provides a complete reference of all configurable values for the frontend and backend charts.

---

## Frontend Chart Values

### File Location
`helm-charts/todo-frontend/values.yaml`

### Complete Values Reference

```yaml
# ========================================
# Frontend Helm Chart Values Reference
# ========================================

# ----------------------------------------
# Deployment Configuration
# ----------------------------------------
replicaCount: 1

# ----------------------------------------
# Image Configuration
# ----------------------------------------
image:
  repository: todo-frontend
  pullPolicy: IfNotPresent
  tag: "v1"

# Image pull secrets (for private registries)
imagePullSecrets: []

# ----------------------------------------
# Pod Override Configuration
# ----------------------------------------
nameOverride: ""
fullnameOverride: ""

# ----------------------------------------
# Service Account Configuration
# ----------------------------------------
serviceAccount:
  create: true
  automount: true
  annotations: {}
  name: ""

# ----------------------------------------
# Pod Configuration
# ----------------------------------------
podAnnotations: {}
podLabels: {}
podSecurityContext: {}
  # fsGroup: 2000

securityContext: {}
  # capabilities:
  #   drop:
  #   - ALL
  # readOnlyRootFilesystem: true
  # runAsNonRoot: true
  # runAsUser: 1001

# ----------------------------------------
# Service Configuration
# ----------------------------------------
service:
  type: LoadBalancer
  port: 3000
  annotations: {}

# ----------------------------------------
# Ingress Configuration
# ----------------------------------------
ingress:
  enabled: false
  className: "nginx"
  annotations: {}
    # kubernetes.io/ingress.class: nginx
    # nginx.ingress.kubernetes.io/rewrite-target: /
  hosts:
    - host: todo.local
      paths:
        - path: /
          pathType: Prefix
  tls: []
  #  - secretName: todo-tls
  #    hosts:
  #      - todo.local

# ----------------------------------------
# Environment Variables
# ----------------------------------------
env:
  API_URL: "http://backend:8000"
  NODE_ENV: "production"
  PORT: "3000"

# Additional environment variables from ConfigMaps/Secrets
envFrom: []

# ----------------------------------------
# Resource Limits
# ----------------------------------------
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

# ----------------------------------------
# Horizontal Pod Autoscaler
# ----------------------------------------
autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 5
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80

# ----------------------------------------
# Health Probes
# ----------------------------------------
livenessProbe:
  httpGet:
    path: /
    port: http
  initialDelaySeconds: 30
  periodSeconds: 30
  timeoutSeconds: 5
  successThreshold: 1
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /
    port: http
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  successThreshold: 1
  failureThreshold: 3

# ----------------------------------------
# Volume Mounts
# ----------------------------------------
volumes: []
volumeMounts: []

# ----------------------------------------
# Node Selector
# ----------------------------------------
nodeSelector: {}

# ----------------------------------------
# Tolerations
# ----------------------------------------
tolerations: []

# ----------------------------------------
# Affinity
# ----------------------------------------
affinity: {}
```

---

## Backend Chart Values

### File Location
`helm-charts/todo-backend/values.yaml`

### Complete Values Reference

```yaml
# ========================================
# Backend Helm Chart Values Reference
# ========================================

# ----------------------------------------
# Deployment Configuration
# ----------------------------------------
replicaCount: 1

# ----------------------------------------
# Image Configuration
# ----------------------------------------
image:
  repository: todo-backend
  pullPolicy: IfNotPresent
  tag: "v1"

# Image pull secrets (for private registries)
imagePullSecrets: []

# ----------------------------------------
# Pod Override Configuration
# ----------------------------------------
nameOverride: ""
fullnameOverride: ""

# ----------------------------------------
# Service Account Configuration
# ----------------------------------------
serviceAccount:
  create: true
  automount: true
  annotations: {}
  name: ""

# ----------------------------------------
# Pod Configuration
# ----------------------------------------
podAnnotations: {}
podLabels: {}
podSecurityContext: {}
  # fsGroup: 2000

securityContext: {}
  # capabilities:
  #   drop:
  #   - ALL
  # readOnlyRootFilesystem: true
  # runAsNonRoot: true
  # runAsUser: 1000

# ----------------------------------------
# Service Configuration
# ----------------------------------------
service:
  type: ClusterIP
  port: 8000
  annotations: {}

# ----------------------------------------
# Ingress Configuration
# ----------------------------------------
ingress:
  enabled: false
  className: "nginx"
  annotations: {}
    # kubernetes.io/ingress.class: nginx
    # nginx.ingress.kubernetes.io/rewrite-target: /
  hosts:
    - host: api.todo.local
      paths:
        - path: /
          pathType: Prefix
  tls: []
  #  - secretName: api-todo-tls
  #    hosts:
  #      - api.todo.local

# ----------------------------------------
# Environment Variables from Secrets/ConfigMaps
# ----------------------------------------
envFrom:
  - secretRef:
      name: app-secrets
  - configMapRef:
      name: backend-config

# Additional environment variables
env: {}

# ----------------------------------------
# Resource Limits
# ----------------------------------------
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

# ----------------------------------------
# Horizontal Pod Autoscaler
# ----------------------------------------
autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 5
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80

# ----------------------------------------
# Health Probes
# ----------------------------------------
livenessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 10
  periodSeconds: 30
  timeoutSeconds: 5
  successThreshold: 1
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 5
  successThreshold: 1
  failureThreshold: 3

# ----------------------------------------
# Volume Mounts
# ----------------------------------------
volumes:
  - name: tmp
    emptyDir: {}

volumeMounts:
  - name: tmp
    mountPath: /tmp

# ----------------------------------------
# Node Selector
# ----------------------------------------
nodeSelector: {}

# ----------------------------------------
# Tolerations
# ----------------------------------------
tolerations: []

# ----------------------------------------
# Affinity
# ----------------------------------------
affinity: {}
```

---

## Stage-Specific Values Files

### Staging Configuration

**File**: `helm-charts/todo-frontend/values-staging.yaml`

```yaml
replicaCount: 1

image:
  tag: "v1-staging"

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

env:
  NODE_ENV: "staging"
```

**File**: `helm-charts/todo-backend/values-staging.yaml`

```yaml
replicaCount: 1

image:
  tag: "v1-staging"

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
```

### Production-like Configuration

**File**: `helm-charts/todo-frontend/values-prod.yaml`

```yaml
replicaCount: 2

image:
  tag: "v1"
  pullPolicy: IfNotPresent

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 5
  targetCPUUtilizationPercentage: 80

livenessProbe:
  initialDelaySeconds: 60
  periodSeconds: 60

readinessProbe:
  initialDelaySeconds: 30
  periodSeconds: 30

env:
  NODE_ENV: "production"
```

**File**: `helm-charts/todo-backend/values-prod.yaml`

```yaml
replicaCount: 2

image:
  tag: "v1"
  pullPolicy: IfNotPresent

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 5
  targetCPUUtilizationPercentage: 80

livenessProbe:
  initialDelaySeconds: 30
  periodSeconds: 30

readinessProbe:
  initialDelaySeconds: 10
  periodSeconds: 10
```

---

## Environment Variable Patterns

### Frontend Environment Variables

| Variable | Type | Example Value | Purpose |
|----------|------|---------------|---------|
| `API_URL` | Direct | `http://backend:8000` | Backend API endpoint |
| `NODE_ENV` | Direct | `production` | Node environment |
| `PORT` | Direct | `3000` | Application port |

### Backend Environment Variables

| Variable | Type | Example Value | Purpose |
|----------|------|---------------|---------|
| `DATABASE_URL` | Secret | `postgresql+asyncpg://...` | Neon connection |
| `OPENAI_API_KEY` | Secret | `sk-...` | OpenAI API key |
| `XIAOMI_API_KEY` | Secret | `your-key` | Xiaomi API key |
| `BETTER_AUTH_SECRET` | Secret | `min-32-chars` | JWT signing |
| `MCP_SERVER_TIMEOUT` | Secret | `30` | MCP timeout |
| `HOST` | ConfigMap | `0.0.0.0` | Server bind address |
| `PORT` | ConfigMap | `8000` | Server port |
| `DEBUG` | ConfigMap | `false` | Debug mode |
| `CORS_ORIGINS` | ConfigMap | `http://...` | Allowed origins |

---

## Service Type Comparison

| Type | External Access | Use Case | Minikube Setup |
|------|-----------------|----------|----------------|
| **LoadBalancer** | Yes (via tunnel) | Frontend, public services | `minikube tunnel` required |
| **ClusterIP** | No | Backend, internal services | No special setup |
| **NodePort** | Yes (via node IP) | Development, testing | `minikube service --url` |

---

## Image Pull Policy Comparison

| Policy | Behavior | Use Case |
|--------|----------|----------|
| **IfNotPresent** | Pull if image not present locally | Local builds (Minikube) |
| **Always** | Always pull image | Remote registries |
| **Never** | Never pull, use local only | Local development only |

**For Minikube local builds**: Use `IfNotPresent`

---

## Resource Limit Guidelines

### Development
```yaml
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
```

### Staging
```yaml
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
```

### Production
```yaml
resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 500m
    memory: 512Mi
```

---

## Health Probe Guidelines

### Frontend (Next.js)
```yaml
livenessProbe:
  initialDelaySeconds: 30  # Give Next.js time to start
  periodSeconds: 30
  timeoutSeconds: 5

readinessProbe:
  initialDelaySeconds: 10  # Ready sooner
  periodSeconds: 10
  timeoutSeconds: 5
```

### Backend (FastAPI)
```yaml
livenessProbe:
  initialDelaySeconds: 10  # FastAPI starts quickly
  periodSeconds: 30
  timeoutSeconds: 5

readinessProbe:
  initialDelaySeconds: 5   # Ready almost immediately
  periodSeconds: 10
  timeoutSeconds: 5
```

---

## Autoscaling Configuration

### Enable Autoscaling
```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 5
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80
```

### Disable Autoscaling
```yaml
autoscaling:
  enabled: false
```

---

## Ingress Configuration

### Enable Ingress
```yaml
ingress:
  enabled: true
  className: "nginx"
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
  hosts:
    - host: todo.local
      paths:
        - path: /
          pathType: Prefix
```

### Disable Ingress
```yaml
ingress:
  enabled: false
```

---

## Value Override Methods

### Method 1: Command-line Flags
```bash
helm install frontend ./chart --set image.tag=v2 --set replicaCount=2
```

### Method 2: Multiple Values Files
```bash
helm install frontend ./chart -f values.yaml -f values-staging.yaml
```

### Method 3: Inline YAML
```bash
helm install frontend ./chart --set-file env.CONFIG=./config.yaml
```

---

## Common Overrides

### Change Image Tag
```bash
helm upgrade frontend ./chart --set image.tag=v2
```

### Change Replica Count
```bash
helm upgrade frontend ./chart --set replicaCount=3
```

### Enable Autoscaling
```bash
helm upgrade frontend ./chart --set autoscaling.enabled=true
```

### Update Resource Limits
```bash
helm upgrade frontend ./chart --set resources.limits.cpu=1000m
```

### Set Environment Variable
```bash
helm upgrade backend ./chart --set env.NEW_VAR=value
```

---

## Secret and ConfigMap References

### Using Secrets
```yaml
envFrom:
  - secretRef:
      name: app-secrets
```

### Using Specific Secret Keys
```yaml
env:
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: app-secrets
        key: DATABASE_URL
```

### Using ConfigMaps
```yaml
envFrom:
  - configMapRef:
      name: backend-config
```

---

## Summary

This reference provides complete documentation for all Helm chart values. Key points:

- **Frontend**: LoadBalancer service, external access
- **Backend**: ClusterIP service, internal only
- **Image Pull Policy**: Use `IfNotPresent` for local builds
- **Resources**: Configure limits per deployment stage
- **Health Probes**: Tune delays per application startup time
- **Autoscaling**: Optional for production-like deployments
- **Ingress**: Optional for domain-based routing
