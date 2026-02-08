# CLAUDE.md - Minikube Deployment Skill

## Usage Guidelines
This skill MUST be consulted when the user requests:
- "Deploy to Minikube"
- "Set up local Kubernetes"
- "Create Helm charts for X"
- "Containerize and deploy this project"

## Core Constraints

1. **NEVER** skip `eval $(minikube docker-env)` — this is the most critical step
2. **NEVER** use `imagePullPolicy: Always` for local Minikube builds (use `IfNotPresent`)
3. **ALWAYS** create Dockerfiles based on the project's specific requirements
4. **ALWAYS** create `.dockerignore` files alongside Dockerfiles to exclude unnecessary files
5. **ALWAYS** use `helm create` as a starting point, then customize `values.yaml`
6. **NEVER** hardcode image names like `todo-frontend` — use project-specific names
7. **ALWAYS** read the project's `.env` file first to understand what env vars are needed
8. **NEVER** hardcode secrets (DB URLs, API keys) in values.yaml — use Kubernetes Secrets
9. **BE PATIENT** — First Docker build takes 5-8 minutes (downloading deps + compiling), this is NORMAL

## Discovery
- **Workflow**: `patterns/WORKFLOW.md` (Start here for full deployment flow)
- **Dockerfiles**: `patterns/DOCKERFILE_PATTERNS.md` (Templates for Next.js, FastAPI, etc.)
- **Helm**: `patterns/HELM_PATTERNS.md` (values.yaml customization guide)
- **Examples**: `examples/` (Reference implementations)

## When to Ask Gordon (Docker AI)

Use Gordon ONLY when:
- Stuck on Dockerfile-specific issues not covered in patterns
- Need to troubleshoot Docker build errors
- Want to understand a specific Docker concept

**Process:**
1. Gather project info (Dockerfile, error logs, package.json, etc.)
2. Ask Gordon: `docker.exe ai "Your question"`
3. Use Gordon's answer as knowledge
4. **YOU implement the fix** (not Gordon)

**Remember:** Gordon is a knowledge source, NOT an implementation tool. YOU do all file edits.

## Common Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|----------------|------------------|
| Building images without `eval $(minikube docker-env)` | Images built in Docker Desktop, not Minikube | Always run `eval $(minikube docker-env)` before `docker build` |
| Using `LoadBalancer` without `minikube tunnel` | EXTERNAL-IP stays `<pending>` | Run `minikube tunnel` in separate terminal |
| Hardcoding image names in Helm charts | Not reusable across projects | Use chart name/templates in `values.yaml` |
| Forgetting to set `API_URL` env var | Frontend can't reach backend | Set `API_URL: "http://<backend-service>:<port>"` |
| Stopping tunnel without knowing | Services lose external access | Press Ctrl+C in tunnel terminal; EXTERNAL-IP returns to `<pending>` |
| Hardcoding secrets in values.yaml | Security risk, secrets in git | Use Kubernetes Secrets (`kubectl create secret`) |
| Not reading .env file first | Don't know what env vars are needed | Always `cat backend/.env` to understand requirements |
| Forgetting .dockerignore | Slow builds, copies node_modules/.git, security risk | Always create `.dockerignore` alongside Dockerfile |
| Cancelling build thinking it's stuck | First build takes 5-8 min, this is NORMAL | Be patient — Docker is downloading deps and compiling |

## Project Structure Expectation
```
project-root/
├── frontend/          # Frontend application
│   ├── Dockerfile    # Multi-stage, project-specific
│   ├── .dockerignore # Exclude unnecessary files from build
│   ├── package.json
│   └── ...
├── backend/           # Backend application
│   ├── Dockerfile    # Multi-stage, project-specific
│   ├── .dockerignore # Exclude unnecessary files from build
│   ├── pyproject.toml / requirements.txt
│   ├── .env          # Environment variables (READ THIS FIRST!)
│   └── ...
└── helm-charts/       # Created by this pattern
    ├── frontend/
    │   ├── Chart.yaml
    │   ├── values.yaml    # Customize: image, port, env
    │   └── templates/
    └── backend/
        ├── Chart.yaml
        ├── values.yaml    # Customize: image, port, env
        └── templates/
```

**IMPORTANT:** Always read `backend/.env` (or `frontend/.env`) first to understand what environment variables the application needs. Then create Kubernetes Secrets for sensitive values.
