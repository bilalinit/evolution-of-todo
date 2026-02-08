# Quickstart: Event-Driven Microservices with Dapr

**Feature**: 011-microservices-dapr
**Branch**: `011-microservices-dapr`
**Date**: 2026-02-04

## Prerequisites

- **Minikube** installed and running
- **Docker** installed
- **Helm 3+** installed
- **Dapr CLI** installed
- **kubectl** configured for Minikube

## 1. Local Development (Docker Compose)

### Start All Services

```bash
cd phase-5
docker-compose build
docker-compose up -d
```

### Verify Services

```bash
# Check all services are running
docker-compose ps

# Test backend health
curl http://localhost:8000/health

# Test frontend
curl http://localhost:3000
```

### Create a Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=<your-token>" \
  -d '{
    "title": "Test Task",
    "priority": "high"
  }'
```

### View Logs

```bash
# Backend API logs
docker-compose logs -f backend-api

# Event processing logs
docker-compose logs -f recurring-service
docker-compose logs -f audit-service
docker-compose logs -f websocket-service
```

### Stop Services

```bash
docker-compose down
```

## 2. Minikube Deployment

### Step 1: Start Minikube

```bash
minikube start
```

### Step 2: Configure Docker for Minikube

**CRITICAL**: Must run before building images

```bash
eval $(minikube docker-env)
```

### Step 3: Install Dapr

```bash
dapr init -k
```

### Step 4: Deploy Redpanda (Message Broker)

```bash
helm repo add redpanda https://charts.redpanda.com
helm install redpanda redpanda/redpanda \
  --set resources.cpu.cores=1 \
  --set resources.memory.container.max=1Gi
```

Wait for Redpanda to be ready:

```bash
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=redpanda --timeout=300s
```

### Step 5: Create Kafka Topics

```bash
kubectl exec -it redpanda-0 -- rpk topic create \
  task-created \
  task-completed \
  task-updated \
  task-deleted \
  reminder-due \
  task-updates
```

Verify topics:

```bash
kubectl exec -it redpanda-0 -- rpk topic list
```

### Step 6: Apply Dapr Components

```bash
kubectl apply -f k8s-dapr/components/
kubectl apply -f k8s-dapr/bindings/
```

### Step 7: Build Images

```bash
# Ensure Minikube Docker is still configured
eval $(minikube docker-env)

# Build images
docker build -t phase5-backend:v1 ./backend
docker build -t phase5-frontend:v1 ./frontend
```

### Step 8: Deploy Services

```bash
# Deploy backend API
helm install backend ./helm-charts/todo-backend

# Deploy frontend
helm install frontend ./helm-charts/todo-frontend

# Deploy microservices
helm install recurring-service ./helm-charts/recurring-service
helm install notification-service ./helm-charts/notification-service
helm install audit-service ./helm-charts/audit-service
helm install websocket-service ./helm-charts/websocket-service
```

### Step 9: Verify Deployment

```bash
# Check pods (should show 2/2 for each - app + Dapr sidecar)
kubectl get pods

# Check services
kubectl get services

# Expected output:
# NAME                    READY   STATUS    RESTARTS   AGE
# backend-...             2/2     Running   0          1m
# frontend-...            2/2     Running   0          1m
# recurring-service-...   2/2     Running   0          1m
# notification-service-... 2/2    Running   0          1m
# audit-service-...       2/2     Running   0          1m
# websocket-service-...   2/2     Running   0          1m
```

### Step 10: Access the Application

**Start tunnel in a separate terminal**:

```bash
minikube tunnel
```

**Get the external IP**:

```bash
kubectl get svc frontend
```

**Access in browser**: `http://<EXTERNAL-IP>:3000`

## 3. Testing Event Flow

### Create a Task

```bash
FRONTEND_IP=$(kubectl get svc frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

curl -X POST http://${FRONTEND_IP}:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=<your-token>" \
  -d '{
    "title": "Test Event Flow",
    "priority": "high"
  }'
```

### Verify Audit Service Received Event

```bash
kubectl logs -l app=audit-service --tail=50
# Should see: "Received task-created event"
```

### Verify WebSocket Service Broadcasted

```bash
kubectl logs -l app=websocket-service --tail=50
# Should see: "Broadcasting task-created to clients"
```

### Check Redpanda Topic

```bash
kubectl exec -it redpanda-0 -- rpk topic consume task-created --num 1
```

## 4. Troubleshooting

### Pod Not Starting?

```bash
# Describe pod for details
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>
kubectl logs <pod-name> -c daprd  # Dapr sidecar logs
```

### Service Not Accessible?

```bash
# Check service endpoints
kubectl get endpoints

# Port forward for debugging
kubectl port-forward svc/backend 8000:8000
```

### Events Not Flowing?

```bash
# Check Dapr components
kubectl get components

# Check Dapr subscriptions
kubectl get subscriptions

# Restart a deployment
kubectl rollout restart deployment/<service-name>
```

### Dapr Dashboard

```bash
dapr dashboard -k
# Opens dashboard in browser
```

## 5. Cleanup

### Delete Helm Releases

```bash
helm uninstall backend
helm uninstall frontend
helm uninstall recurring-service
helm uninstall notification-service
helm uninstall audit-service
helm uninstall websocket-service
```

### Delete Dapr Components

```bash
kubectl delete -f k8s-dapr/components/
kubectl delete -f k8s-dapr/bindings/
```

### Uninstall Redpanda

```bash
helm uninstall redpanda
```

### Uninstall Dapr

```bash
dapr uninstall -k
```

## 6. Environment Variables

### Required Secrets

Create Kubernetes secrets before deploying:

```bash
# Database connection
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL='postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require'

# API keys
kubectl create secret generic api-secrets \
  --from-literal=OPENAI_API_KEY='sk-...' \
  --from-literal=XIAOMI_API_KEY='...'
```

### Service Configuration

Each service needs these environment variables:

```yaml
DATABASE_URL: <from secret>
BETTER_AUTH_URL: "http://frontend:3000/"
DAPR_HOST: "localhost"
DAPR_HTTP_PORT: "3500"
CORS_ORIGINS: "http://localhost:3000"
```

## 7. Service Endpoints

| Service | Internal URL | External URL |
|---------|--------------|--------------|
| Frontend | `http://frontend:3000` | `http://<EXTERNAL-IP>:3000` |
| Backend API | `http://backend:8000` | ClusterIP only |
| Recurring Service | `http://recurring-service:8001` | ClusterIP only |
| Notification Service | `http://notification-service:8002` | ClusterIP only |
| Audit Service | `http://audit-service:8003` | ClusterIP only |
| WebSocket Service | `http://websocket-service:8004` | ClusterIP only |

## 8. WebSocket Connection

Connect to WebSocket service:

```javascript
const ws = new WebSocket('ws://<EXTERNAL-IP>:8004/ws?user_id=<user_id>');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Task update:', data);
};
```

## 9. Health Checks

All services expose a `/health` endpoint:

```bash
# Via kubectl port-forward
kubectl port-forward svc/backend 8000:8000
curl http://localhost:8000/health

# From within cluster
kubectl exec -it <pod-name> -- curl http://localhost:8000/health
```

## 10. Next Steps

1. Review the full [plan.md](./plan.md) for detailed architecture
2. Check [data-model.md](./data-model.md) for database schema
3. See [contracts/events.yaml](./contracts/events.yaml) for event definitions
4. Run `/sp.tasks` to generate implementation tasks
