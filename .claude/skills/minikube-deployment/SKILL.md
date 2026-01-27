# Minikube Deployment Skill

## Overview
This skill defines the standard **Local Kubernetes Deployment Pattern** using Minikube, Docker, and Helm. It provides a repeatable workflow for deploying containerized frontend and backend applications to a local Kubernetes cluster.

> **MANDATORY REFERENCE**
> 1. **`CLAUDE.md`**: Usage guidelines and core constraints.
> 2. **`patterns/WORKFLOW.md`**: Complete step-by-step deployment pattern (includes optional Ingress setup).
> 3. **`patterns/DOCKERFILE_PATTERNS.md`**: Multi-stage Dockerfile templates.
> 4. **`patterns/HELM_PATTERNS.md`**: Helm chart structure and customization (includes Ingress pattern).
> 5. **`examples/`**: Reference implementations.

## Core Rules

1. **ALWAYS** start Minikube before building images: `minikube start`
2. **CRITICAL**: Configure Docker to use Minikube's daemon: `eval $(minikube docker-env)`
   - This builds images directly in Minikube (no registry push needed)
3. **NEVER** push images to external registry for local Minikube deployment
4. **Backend** uses ClusterIP (internal only), **Frontend** uses LoadBalancer (external access via tunnel)
5. **ALWAYS** verify deployments: `kubectl get pods`, `kubectl get services`

## Common Prompts & Responses

**User:** "Deploy this project to Minikube."
**You:** *Follows the WORKFLOW.md pattern, creating Dockerfiles, building images, generating Helm charts, and deploying.*

**User:** "Create a Dockerfile for my Next.js frontend."
**You:** *Follows DOCKERFILE_PATTERNS.md, creating a multi-stage build optimized for the project.*

**User:** "Customize the Helm chart for this backend."
**You:** *Modifies values.yaml according to HELM_PATTERNS.md guidelines (image, ports, env vars).*

**User:** "I want nice URLs like todo.local instead of IPs."
**You:** *Follows WORKFLOW.md → "Optional: Setup Ingress" section, enabling Ingress for domain-based routing.*

---

## Ask Gordon (For Dockerfile Issues Only)

**When to use Gordon:** When stuck on Dockerfile-specific issues that this skill's patterns don't cover.

**Process:**
1. Gather info from the user's project and the specific issue
2. Ask Gordon for advice/knowledge ONLY
3. **NEVER** ask Gordon to edit files or implement anything
4. Use Gordon's answer to inform your own implementation

**Command:**
```bash
docker.exe ai "Your question here"
```

**Example:**
```
User: "My Next.js build is failing in Docker."

You: [Reads Dockerfile, package.json, error logs]
     [Asks Gordon]: docker.exe ai "Why does Next.js standalone build fail with ENOENT error for .next/standalone?"
     [Gets Gordon's answer]
     [Applies fix YOURSELF using Edit tool]
```

**Important:** Gordon is a **knowledge source**, not an implementation tool. You (Claude) do all file edits and implementations.

**What to ask Gordon:**
- Dockerfile troubleshooting
- Build optimization questions
- Specific error explanations
- Best practices for edge cases

**What NOT to ask Gordon:**
- "Create a Dockerfile for me" (Use DOCKERFILE_PATTERNS.md instead)
- "Edit this file" (You do the editing)
- "Implement this feature" (You do the implementation)
