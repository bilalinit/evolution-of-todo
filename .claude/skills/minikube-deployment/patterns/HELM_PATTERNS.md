# Helm Chart Patterns

Standard Helm chart customization patterns for Minikube deployments. Start with `helm create <name>` and modify `values.yaml`.

---

## Chart Generation

```bash
# From helm-charts directory
helm create <project>-frontend
helm create <project>-backend
```

---

## Frontend values.yaml Customization

### Key Fields to Modify

```yaml
# ========================================
# Frontend values.yaml
# ========================================

replicaCount: 1

image:
  repository: <project>-frontend    # CHANGE: Match docker build name
  pullPolicy: IfNotPresent           # IMPORTANT: Not Always for local builds
  tag: "v1"                          # CHANGE: Match docker build tag

service:
  type: LoadBalancer                 # CHANGE: For external access via minikube tunnel
  port: 3000                         # CHANGE: Match app port

# Environment variables
env:
  API_URL: "http://<project>-backend:8000"   # CHANGE: Backend service name

# Health probes (customize paths)
livenessProbe:
  httpGet:
    path: /                          # CHANGE: Actual health path
    port: http
readinessProbe:
  httpGet:
    path: /                          # CHANGE: Actual health path
    port: http
```

### Complete Frontend values.yaml Example

```yaml
replicaCount: 1

image:
  repository: myapp-frontend
  pullPolicy: IfNotPresent
  tag: "v1"

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  automount: true
  annotations: {}
  name: ""

podAnnotations: {}
podLabels: {}

podSecurityContext: {}
securityContext: {}

service:
  type: LoadBalancer
  port: 3000

env:
  API_URL: "http://myapp-backend:8000"
  # Add more env vars as needed
  # NODE_ENV: "production"

ingress:
  enabled: false

resources: {}
  # limits:
  #   cpu: 500m
  #   memory: 512Mi
  # requests:
  #   cpu: 250m
  #   memory: 256Mi

livenessProbe:
  httpGet:
    path: /
    port: http
readinessProbe:
  httpGet:
    path: /
    port: http

autoscaling:
  enabled: false

volumes: []
volumeMounts: []

nodeSelector: {}
tolerations: []
affinity: {}
```

---

## Backend values.yaml Customization

### Key Fields to Modify

```yaml
# ========================================
# Backend values.yaml
# ========================================

replicaCount: 1

image:
  repository: <project>-backend      # CHANGE: Match docker build name
  pullPolicy: IfNotPresent           # IMPORTANT: Not Always for local builds
  tag: "v1"                          # CHANGE: Match docker build tag

service:
  type: ClusterIP                    # CHANGE: Internal only
  port: 8000                         # CHANGE: Match app port

# Environment variables
env:
  DATABASE_URL: "postgresql://..."   # CHANGE: As needed
  # Add more env vars

# Health probes (customize paths)
livenessProbe:
  httpGet:
    path: /health                    # CHANGE: Actual health path
    port: http
readinessProbe:
  httpGet:
    path: /health                    # CHANGE: Actual health path
    port: http
```

### Complete Backend values.yaml Example

```yaml
replicaCount: 1

image:
  repository: myapp-backend
  pullPolicy: IfNotPresent
  tag: "v1"

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  automount: true
  annotations: {}
  name: ""

podAnnotations: {}
podLabels: {}

podSecurityContext: {}
securityContext: {}

service:
  type: ClusterIP
  port: 8000

env:
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db"
  # Add more env vars as needed
  # JWT_SECRET: "your-secret"
  # LOG_LEVEL: "info"

ingress:
  enabled: false

resources: {}
  # limits:
  #   cpu: 500m
  #   memory: 512Mi
  # requests:
  #   cpu: 250m
  #   memory: 256Mi

livenessProbe:
  httpGet:
    path: /health
    port: http
readinessProbe:
  httpGet:
    path: /health
    port: http

autoscaling:
  enabled: false

volumes: []
volumeMounts: []

nodeSelector: {}
tolerations: []
affinity: {}
```

---

## Service Types

| Type | Use Case | External Access |
|------|----------|-----------------|
| **ClusterIP** | Backend, internal services | No (within cluster only) |
| **NodePort** | Alternative for Minikube | Yes (via `minikube service`) |
| **LoadBalancer** | Frontend, web apps (production-like) | Yes (via `minikube tunnel`) |

### Why LoadBalancer for Frontend, ClusterIP for Backend?

This architecture simulates **production cloud environments**:

| Component | Service Type | Reason |
|-----------|--------------|--------|
| **Frontend** | LoadBalancer | Public-facing, needs external access |
| **Backend** | ClusterIP | Internal only, security best practice |

**How frontend communicates with backend:**
- Frontend uses Kubernetes DNS internally: `http://<backend-service-name>:<port>`
- Backend is NOT accessible externally (by design)
- This is the professional/production-like architecture

### Important: Service DNS Names

The backend service DNS name matches your Helm release name:

```bash
# If you install with:
helm install backend ./helm-charts/backend
# Then frontend uses: http://backend:8000

# If you install with:
helm install myapp-backend ./helm-charts/backend
# Then frontend uses: http://myapp-backend:8000
```

**Recommendation:** Use simple names without prefixes:
- `helm install frontend ./helm-charts/frontend`
- `helm install backend ./helm-charts/backend`

This makes the DNS names clean and predictable.

For Minikube: Use **LoadBalancer** for frontend (with `minikube tunnel`), **ClusterIP** for backend.

---

## Ingress Pattern (Optional - For Nice URLs)

### What is Ingress?

Ingress is an API object that manages external access to services in a cluster, typically HTTP/HTTPS. It provides:
- **Nice URLs** (e.g., `todo.local` instead of `10.96.123.45:3000`)
- **Routing by domain name** (one LoadBalancer for all services)
- **Production-ready pattern** (used in AWS, Oracle, GKE, Azure)

### When to Use Ingress vs LoadBalancer?

| LoadBalancer | Ingress |
|--------------|---------|
| One LoadBalancer per service | One LoadBalancer for ALL services |
| Access via IP:port | Access via domain name |
| Expensive in production ($$$ per service) | Cheaper in production ($$ for all) |
| Simpler setup | More setup, but production-standard |

### values.yaml Configuration

#### Frontend with Ingress

```yaml
# helm-charts/frontend/values.yaml

service:
  type: ClusterIP  # Change from LoadBalancer to ClusterIP
  port: 3000

ingress:
  enabled: true
  className: "nginx"
  annotations: {
    nginx.ingress.kubernetes.io/rewrite-target: /
  }
  hosts:
    - host: todo.local
      paths:
        - path: /
          pathType: Prefix
  tls: []
```

#### Backend with Ingress (Optional - for API access)

```yaml
# helm-charts/backend/values.yaml

service:
  type: ClusterIP  # Change from LoadBalancer to ClusterIP
  port: 8000

ingress:
  enabled: true
  className: "nginx"
  annotations: {
    nginx.ingress.kubernetes.io/rewrite-target: /
  }
  hosts:
    - host: api.todo.local
      paths:
        - path: /
          pathType: Prefix
  tls: []
```

### Architecture Comparison

**With LoadBalancer:**
```
Internet → [Frontend LB] → Frontend Service → Pods
         → [Backend LB]  → Backend Service  → Pods
(2 LoadBalancers needed)
```

**With Ingress:**
```
Internet → [Ingress LB] → [Routes by domain] → Frontend Service → Pods
                                        → Backend Service  → Pods
(1 LoadBalancer for all services)
```

### Production vs Local Domains

| Environment | Domain Example |
|-------------|----------------|
| **Local (Minikube)** | `todo.local`, `api.todo.local` |
| **Production** | `your-app.com`, `api.your-app.com` |

Same pattern, different domains!

### Complete Example: Frontend values.yaml with Ingress

```yaml
replicaCount: 1

image:
  repository: myapp-frontend
  pullPolicy: IfNotPresent
  tag: "v1"

service:
  type: ClusterIP     # ClusterIP when using Ingress
  port: 3000

env:
  API_URL: "http://backend:8000"

ingress:
  enabled: true
  className: "nginx"
  annotations: {
    nginx.ingress.kubernetes.io/rewrite-target: /
  }
  hosts:
    - host: todo.local
      paths:
        - path: /
          pathType: ImplementationSpecific
  tls: []

livenessProbe:
  httpGet:
    path: /
    port: http
readinessProbe:
  httpGet:
    path: /
    port: http

resources: {}
autoscaling:
  enabled: false
```

### Ingress Annotations (Advanced)

Common NGINX Ingress annotations:

```yaml
annotations: {
  # Rewrite target path
  nginx.ingress.kubernetes.io/rewrite-target: /,

  # Enable CORS
  nginx.ingress.kubernetes.io/enable-cors: "true",
  nginx.ingress.kubernetes.io/cors-allow-origin: "*",

  # Proxy buffer size
  nginx.ingress.kubernetes.io/proxy-buffer-size: "128k",

  # Timeouts
  nginx.ingress.kubernetes.io/proxy-connect-timeout: "600",
  nginx.ingress.kubernetes.io/proxy-send-timeout: "600",
  nginx.ingress.kubernetes.io/proxy-read-timeout: "600"
}
```

---

## Environment Variables Pattern

### In values.yaml

```yaml
env:
  API_URL: "http://backend:8000"
  DATABASE_URL: "postgresql://..."
  FEATURE_FLAG_X: "true"
```

### In deployment.yaml template

```yaml
env:
  {{- range $key, $value := .Values.env }}
  - name: {{ $key }}
    value: {{ $value | quote }}
  {{- end }}
```

This is already included in standard `helm create` templates.

---

## Secrets Pattern (Recommended for Production)

**Why use secrets?**
- Never hardcode sensitive data (DB URLs, API keys) in values.yaml
- Same approach works for local Minikube AND production (Oracle/AWS)
- Keeps secrets out of git

### Step 1: Read Your Project's .env File

First, check what environment variables your application needs:

```bash
# Read the backend .env file
cat backend/.env

# Example output:
# DATABASE_URL=postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require
# API_KEY=sk-xxxxxx
# REDIS_URL=redis://localhost:6379
```

**Important:** Never commit `.env` files to git!

### Step 2: Create Kubernetes Secret

Use the values from your .env file to create a secret:

```bash
# Create secret with your actual values
# SECURITY TIP: Start command with a space to prevent saving to shell history!
# (The space before 'kubectl' won't be saved in your command history)
 kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL='postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require' \
  --from-literal=API_KEY='sk-xxxxxx' \
  --from-literal=REDIS_URL='redis://redis:6379'

# Verify secret was created
kubectl get secret app-secrets
```

**Security Note:** Notice the space before `kubectl` — this prevents the secret from being saved to your shell history (bash/zsh). Press Up Arrow and you won't see this command!
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL='postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require' \
  --from-literal=API_KEY='sk-xxxxxx' \
  --from-literal=REDIS_URL='redis://redis:6379'

# Verify secret was created
kubectl get secret app-secrets
```

### Step 3: Reference Secret in values.yaml

```yaml
# helm-charts/backend/values.yaml

# Remove or comment out direct env values
# env:
#   DATABASE_URL: "..."  # Don't hardcode!

# Use secret instead:
envFrom:
  - secretRef:
      name: app-secrets
```

### Step 4: Deploy

```bash
# Deploy (same command for local and production)
helm install backend ./helm-charts/backend
```

### Quick Example with Neon DB

```bash
# 1. Create secret with Neon connection string
# (Space before kubectl prevents saving to history)
 kubectl create secret generic neon-db \
  --from-literal=DATABASE_URL='postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require'

# 2. In backend/values.yaml, add:
envFrom:
  - secretRef:
      name: neon-db

# 3. Deploy
helm install backend ./helm-charts/backend
```

### Viewing Secret Values (for debugging)

```bash
# Decode and view secret values
kubectl get secret app-secrets -o jsonpath='{.data}'
# Returns base64 encoded values

# Or decode specific key
kubectl get secret app-secrets -o jsonpath='{.data.DATABASE_URL}' | base64 -d
```

### Managing Secrets Across Environments

| Environment | Secret Name | Command |
|-------------|-------------|---------|
| **Local Minikube** | `app-secrets` | `kubectl create secret generic app-secrets ...` |
| **Production (Oracle/AWS)** | `app-secrets` | Same command! |

**Best practice:** Use the same secret name across environments. Only the secret values change.

### Updating Secrets

```bash
# Delete and recreate (secrets are immutable)
# Remember: Start with a space to keep secrets out of history!
kubectl delete secret app-secrets
 kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL='new-connection-string'

# Restart deployment to pick up changes
kubectl rollout restart deployment/backend
```

---

## Common Customizations

### Add Resource Limits

```yaml
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
```

### Enable Horizontal Pod Autoscaler

```yaml
autoscaling:
  enabled: true
  minReplicas: 1
  maxReplicas: 5
  targetCPUUtilizationPercentage: 80
```

### Add Volume Mounts

```yaml
volumes:
  - name: data
    emptyDir: {}

volumeMounts:
  - name: data
    mountPath: /app/data
```

---

## Chart.yaml Customization

```yaml
apiVersion: v2
name: myapp-frontend
description: A Helm chart for MyApp Frontend
type: application
version: 0.1.0
appVersion: "1.0"
```

Keep `appVersion` in sync with your application version.
