# Deployment Workflow

Complete step-by-step pattern for deploying frontend + backend to Minikube.

## Prerequisites
- Docker installed
- Minikube installed
- kubectl installed
- helm installed
- Project with frontend/ and backend/ directories

---

## Step 1: Verify Project Structure

```bash
# Navigate to project root
cd /path/to/your/project

# Expected structure:
# project-root/
# ├── frontend/
# ├── backend/
# └── (helm-charts/ will be created here)
```

---

## Step 2: Create Dockerfiles and .dockerignore

Dockerfiles are **ALWAYS** built according to project requirements. See `DOCKERFILE_PATTERNS.md` for templates.

**Frontend:**
- Create `frontend/Dockerfile`
- Create `frontend/.dockerignore` (See `DOCKERFILE_PATTERNS.md` for templates)

**Backend:**
- Create `backend/Dockerfile`
- Create `backend/.dockerignore` (See `DOCKERFILE_PATTERNS.md` for templates)

**Why .dockerignore?**
- Faster builds (excludes node_modules, .git, etc.)
- Prevents copying sensitive files (.env)
- Smaller build context

---

## Step 3: Start Minikube

```bash
# Start Minikube
minikube start

# Verify it's running
minikube status
```

**Expected output:**
```
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

---

## Step 4: Configure Docker (CRITICAL STEP)

```bash
# IMPORTANT: Configure Docker to use Minikube's Docker daemon
# This builds images directly in Minikube (no need to push to registry)
eval $(minikube docker-env)
```

**What this does:** Tells your Docker CLI to talk to Minikube's Docker instead of Docker Desktop.

---

## Step 5: Build Docker Images

```bash
# From project root
docker build -t <project-name>-frontend:v1 ./frontend
docker build -t <project-name>-backend:v1 ./backend

# Verify images are built in Minikube's Docker
docker images | grep <project-name>
```

**Build Time Estimates:**

| Build Type | Frontend (Next.js) | Backend (FastAPI) | Total |
|------------|-------------------|-------------------|-------|
| **First build** | 4-6 minutes | 1-2 minutes | **5-8 minutes** |
| **Cached rebuild** | 1-2 minutes | 30-60 seconds | **2-3 minutes** |

**What affects build time:**
- Downloading dependencies (npm install, pip install)
- Compiling Next.js (can take 3-4 minutes)
- CPU speed and RAM
- .dockerignore (saves time by excluding node_modules)

**IMPORTANT:** First build takes time — this is NORMAL! Don't cancel if it seems slow. Docker is downloading dependencies and compiling your code.

**Speed tips:**
- Run builds in parallel: `docker build ... ./frontend & docker build ... ./backend &`
- Use .dockerignore to exclude unnecessary files
- Subsequent builds are faster (Docker caches unchanged layers)

**Expected output:**
```
<project>-frontend    v1    abc123...    2 minutes ago    50MB
<project>-backend     v1    def456...    1 minute ago     150MB
```

---

## Step 6: Create Helm Charts Directory

```bash
# Create helm-charts directory at project root
mkdir -p helm-charts

cd helm-charts

# Generate frontend chart
helm create <project>-frontend

# Generate backend chart
helm create <project>-backend

# Go back to project root
cd ..
```

---

## Step 7: Customize Helm Charts

Modify `values.yaml` in each chart according to project needs. See `HELM_PATTERNS.md` for details.

**Frontend values.yaml:**
- `image.repository: <project>-frontend`
- `image.tag: v1`
- `service.type: LoadBalancer` (for external access via tunnel)
- `service.port: <frontend-port>`
- `env.API_URL: "http://backend:<backend-port>"` ← Use the backend's Helm release name

**Backend values.yaml:**
- `image.repository: <project>-backend`
- `image.tag: v1`
- `service.type: ClusterIP` (internal only)
- `service.port: <backend-port>`
- `livenessProbe.httpGet.path: /health`
- `readinessProbe.httpGet.path: /health`

**Note:** The `API_URL` must match the backend's Helm release name. If you install with `helm install backend`, use `http://backend:8000`. If you use `helm install myapp-backend`, use `http://myapp-backend:8000`.

---

## Step 7.5: Set Up Environment Variables (Secrets)

**First, read your project's .env file to understand what env vars are needed:**

```bash
# Check what environment variables your app needs
cat backend/.env

# Example output:
# DATABASE_URL=postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require
# API_KEY=sk-xxxxxx
```

**Then create Kubernetes Secrets (recommended for sensitive data):**

```bash
# Create secret with your actual values
# SECURITY TIP: Start with a space to prevent saving to shell history!
 kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL='postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require' \
  --from-literal=API_KEY='sk-xxxxxx'

# Verify secret was created
kubectl get secret app-secrets
```

**Security Tip:** Notice the space before `kubectl` — this prevents the secret from being saved to your shell history. Works in bash/zsh/WSL!

**Update backend values.yaml to use the secret:**

```yaml
# helm-charts/backend/values.yaml
envFrom:
  - secretRef:
      name: app-secrets
```

**This approach works for BOTH local Minikube and production (Oracle/AWS)!**

See `HELM_PATTERNS.md` → "Secrets Pattern" for more details.

---

---

## Step 8: Deploy to Minikube

```bash
# Verify Minikube is running
minikube status

# Deploy backend first (frontend depends on it)
# Use simple names for clean DNS names
helm install backend ./helm-charts/backend

# Deploy frontend
helm install frontend ./helm-charts/frontend

# Verify deployments
helm list
```

**Important:** The Helm release name becomes the Kubernetes DNS name. Use simple names:
- `helm install backend` → DNS: `http://backend:8000`
- `helm install myapp-backend` → DNS: `http://myapp-backend:8000`

Make sure your frontend's `API_URL` env var matches the backend's Helm release name.

**Expected output:**
```
NAME              NAMESPACE   REVISION   UPDATED                STATUS      CHART
<project>-backend default     1          2026-01-22 10:30:00    deployed    <project>-backend-0.1.0
<project>-frontend default     1          2026-01-22 10:30:15    deployed    <project>-frontend-0.1.0
```

---

## Step 9: Verify Everything is Running

```bash
# Check pods
kubectl get pods

# Check services
kubectl get services

# Check deployments
kubectl get deployments
```

**Expected pods output:**
```
NAME                             READY   STATUS    RESTARTS   AGE
<project>-backend-xxxx-yyyy       1/1     Running   0          2m
<project>-frontend-xxxx-bbbb      1/1     Running   0          1m
```

**Expected services output (without tunnel):**
```
NAME              TYPE           EXTERNAL-IP      PORT(S)        AGE
<project>-backend ClusterIP      <none>           <backend-port>/TCP   2m
<project>-frontend LoadBalancer   <pending>        3000:<node-port>/TCP   1m
```

**Expected services output (with tunnel running):**
```
NAME              TYPE           EXTERNAL-IP      PORT(S)        AGE
<project>-backend ClusterIP      <none>           <backend-port>/TCP   2m
<project>-frontend LoadBalancer   10.96.xxx.xxx    3000:<node-port>/TCP   1m
```

---

## Step 9.5: Start Minikube Tunnel (CRITICAL for LoadBalancer)

```bash
# Open a NEW terminal window and run:
minikube tunnel

# Note: If your environment requires sudo, use:
# sudo minikube tunnel
```

**What this does:**
- Creates a network route to expose LoadBalancer services locally
- Only LoadBalancer services get an external IP (frontend)
- ClusterIP services remain internal (backend - this is correct!)

**Keep this terminal open** — The tunnel runs as long as this terminal is active.

**Note:** You may be prompted for your password. This is normal — tunnel requires network setup permissions.

**Expected output:**
```
Status:
        machine: minikube
        pid: 12345
        route: 10.96.0.0/12 -> 192.168.49.2
        minikube: Running
```

---

## Step 10: Verify Services Get External IPs

```bash
# Check services (in original terminal, NOT the tunnel terminal)
kubectl get services
```

**Without tunnel:**
```
NAME              TYPE           EXTERNAL-IP      PORT(S)
<project>-backend ClusterIP      <none>           8000/TCP
<project>-frontend LoadBalancer   <pending>        3000:xxxxx/TCP
```

**With tunnel running:**
```
NAME              TYPE           EXTERNAL-IP      PORT(S)
<project>-backend ClusterIP      <none>           8000/TCP
<project>-frontend LoadBalancer   10.96.xxx.xxx    3000:xxxxx/TCP
```

Notice:
- **Frontend**: Gets external IP when tunnel is running
- **Backend**: Always shows `<none>` (ClusterIP is internal only - this is correct!)

---

## Step 11: Access the Application

### Method 1: Using minikube tunnel (Recommended - Production-like)

With tunnel running, get the EXTERNAL-IP:

```bash
kubectl get svc frontend
```

**Output:**
```
NAME       TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)
frontend   LoadBalancer   10.96.123.45    10.96.123.45    3000:xxxxx/TCP
                                           ↑↑↑↑↑↑↑↑↑↑↑↑↑
                                           Use this IP!
```

Access at: `http://10.96.123.45:3000` (use the EXTERNAL-IP shown)

---

### Method 2: Using minikube service (Fallback - If tunnel fails)

If tunnel doesn't work or you prefer a simpler method:

```bash
minikube service frontend --url
```

**Output:**
```
http://127.0.0.1:xxxxx
```

Access at the URL shown (typically `http://127.0.0.1:xxxxx` or `http://localhost:xxxxx`)

**Note:** This method uses a temporary proxy and assigns a random port.

---

### Which method to use?

| Method | Pros | Cons |
|--------|------|------|
| **minikube tunnel** | Production-like, stable port (3000) | Requires separate terminal, sudo |
| **minikube service** | Simple, no sudo needed | Random port, less production-like |

**How frontend reaches backend internally:**
- Frontend uses Kubernetes DNS: `http://backend:8000` (or your backend's Helm release name)
- Backend is NOT accessible externally (security - ClusterIP only)
- This is the production-like architecture!

---

## Troubleshooting

### Pods not running?

```bash
# Check specific pod details
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `ImagePullBackOff` | Image not found in Minikube's Docker | Re-run `eval $(minikube docker-env)` and rebuild |
| `CrashLoopBackOff` | Application error | Check logs with `kubectl logs <pod-name>` |
| Frontend can't reach backend | Wrong `API_URL` | Verify `API_URL` uses service name, not localhost |

### Useful Commands

```bash
# Restart a deployment
kubectl rollout restart deployment/<project>-backend

# Delete a release
helm uninstall <project>-backend

# View all resources
kubectl get all

# Port forward to a pod
kubectl port-forward <pod-name> 8080:3000
```

---

## Minikube Tunnel Troubleshooting

### Common Tunnel Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| EXTERNAL-IP shows `<pending>` | Tunnel not running | Run `minikube tunnel` in separate terminal |
| Password prompt | Normal for tunnel setup | Enter your user password (needed for network setup) |
| Lost external access | Tunnel stopped (Ctrl+C) | Restart `minikube tunnel` |
| Only frontend gets IP | Backend is ClusterIP | This is correct! Backend should be internal-only |
| Can't access via EXTERNAL-IP | Tunnel/routing issues | Use fallback: `minikube service frontend --url` |

### Verifying Tunnel is Working

```bash
# Check if tunnel is running (in another terminal)
ps aux | grep "minikube tunnel"

# Check services have external IPs
kubectl get services
# Frontend should show EXTERNAL-IP (not <pending>)
# Backend should show <none> (this is correct!)
```

### Stopping the Tunnel

```bash
# In the tunnel terminal, press:
Ctrl+C

# Services will return to <pending> state
kubectl get services
```

This is normal — restart the tunnel to regain external access.

---

## Cleanup

```bash
# Uninstall Helm releases
helm uninstall <project>-frontend
helm uninstall <project>-backend

# Stop Minikube (optional)
minikube stop

# Stop tunnel first (Ctrl+C in tunnel terminal)
```

---

# Optional: Setup Ingress for Nice URLs

**This section is optional!** Skip if you're happy with IP-based access.

## Why Use Ingress?

| Without Ingress | With Ingress |
|-----------------|--------------|
| `http://10.96.123.45:3000` | `http://todo.local` |
| One LoadBalancer per service | One LoadBalancer for all services |
| More expensive in production | Cheaper in production |
| Good for local testing | **Production-ready pattern** |

**Ingress is used in:** AWS EKS, Oracle OKE, Google GKE, Azure AKS — this is a real production skill!

---

## Step 1: Enable NGINX Ingress Controller in Minikube

```bash
# Enable the ingress addon
minikube addons enable ingress

# Verify ingress controller is running
kubectl get pods -n ingress-nginx
```

**Expected output:**
```
NAME                                        READY   STATUS    RESTARTS   AGE
ingress-nginx-controller-xxxxxx             1/1     Running   0          2m
```

---

## Step 2: Update Helm Charts with Ingress

### Frontend values.yaml

Edit `helm-charts/frontend/values.yaml`:

```yaml
# Enable Ingress
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

### Backend values.yaml (Optional - if you want external API access)

Edit `helm-charts/backend/values.yaml`:

```yaml
# Enable Ingress for API
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

---

## Step 3: Upgrade Helm Releases

```bash
# Upgrade frontend with Ingress
helm upgrade frontend ./helm-charts/frontend

# Upgrade backend with Ingress (optional)
helm upgrade backend ./helm-charts/backend

# Verify Ingress resources
kubectl get ingress
```

**Expected output:**
```
NAME       CLASS   HOSTS            ADDRESS        PORTS   AGE
frontend   nginx   todo.local       192.168.49.2   80      1m
```

---

## Step 4: Add Domain to Hosts File

**On Linux/Mac/WSL:**
```bash
# Get Minikube IP
minikube ip

# Add to hosts file
echo "$(minikube ip) todo.local api.todo.local" | sudo tee -a /etc/hosts
```

**On Windows:**
1. Run: `notepad C:\Windows\System32\drivers\etc\hosts`
2. Add line: `192.168.49.2 todo.local api.todo.local` (use Minikube IP)

---

## Step 5: Access Your Application

```bash
# Access frontend
http://todo.local

# Access backend API (if enabled)
http://api.todo.local
```

No tunnel needed! The Ingress controller routes traffic automatically.

---

## Ingress vs LoadBalancer Summary

| Method | Access URL | Tunnel Needed | Production Use |
|--------|------------|---------------|----------------|
| **LoadBalancer** | `http://10.96.123.45:3000` | Yes (minikube tunnel) | Yes (costs more) |
| **Ingress** | `http://todo.local` | No | Yes (cheaper) |

---

## Troubleshooting Ingress

### Issue: Can't access todo.local

**Check 1:** Is Ingress controller running?
```bash
kubectl get pods -n ingress-nginx
```

**Check 2:** Is Ingress resource created?
```bash
kubectl get ingress
```

**Check 3:** Is domain in hosts file?
```bash
# Linux/Mac/WSL:
cat /etc/hosts | grep todo.local

# Windows:
type C:\Windows\System32\drivers\etc\hosts | findstr todo.local
```

**Check 4:** Does Minikube IP match hosts file?
```bash
minikube ip
# Should match IP in /etc/hosts
```

---

## Cleanup Ingress

To remove Ingress and revert to LoadBalancer:

```bash
# Disable Ingress in values.yaml (set ingress.enabled: false)
# Then upgrade:
helm upgrade frontend ./helm-charts/frontend

# Remove from hosts file
sudo nano /etc/hosts
# Delete the todo.local line
```

---

## Production Note

In production (AWS, Oracle, etc.):
- Same Ingress pattern
- Use real domains instead of `.local`
- Example: `your-app.com` instead of `todo.local`
- The Ingress controller will be provisioned as a LoadBalancer automatically
