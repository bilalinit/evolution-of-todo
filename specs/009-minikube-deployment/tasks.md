# Tasks: Minikube Deployment for Phase-4 Application

**Input**: Design documents from `/specs/009-minikube-deployment/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No test tasks specified - validation through deployment verification and manual testing as specified in success criteria.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `phase-4/frontend/`
- **Backend**: `phase-4/backend/`
- **Helm Charts**: `phase-4/helm-charts/`
- **Documentation**: `specs/009-minikube-deployment/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create Helm charts directory structure and validate Minikube prerequisites

- [X] T001 Verify Minikube, Docker, kubectl, and Helm are installed and running
- [X] T002 Create phase-4/helm-charts directory structure
- [X] T003 [P] Start Minikube cluster with default configuration
- [X] T004 [P] Verify phase-4/.env.example files exist for environment reference

**Checkpoint**: Infrastructure ready - chart generation can begin

---

## Phase 2: Foundational (Container Images)

**Purpose**: Create Dockerfiles and .dockerignore files - REQUIRED before any Helm chart deployment

**⚠️ CRITICAL**: No deployment can proceed until container images are built successfully

- [X] T005 Update phase-4/frontend/next.config.ts to enable standalone output mode
- [X] T006 [P] Create phase-4/frontend/Dockerfile with multi-stage Next.js build
- [X] T007 [P] Create phase-4/frontend/.dockerignore with build exclusions
- [X] T008 [P] Create phase-4/backend/Dockerfile with multi-stage FastAPI build
- [X] T009 [P] Create phase-4/backend/.dockerignore with build exclusions
- [X] T010 Configure Docker environment for Minikube (eval $(minikube docker-env))
- [X] T011 Build frontend container image (todo-frontend:v1) in Minikube Docker
- [X] T012 Build backend container image (todo-backend:v1) in Minikube Docker
- [X] T013 Verify images exist in Minikube Docker (docker images | grep todo)

**Checkpoint**: Container images ready - Helm chart generation can begin

---

## Phase 3: User Story 1 - Local Development Environment Setup (Priority: P1) 🎯 MVP

**Goal**: Deploy phase-4 application to local Minikube cluster for development and testing in production-like Kubernetes environment

**Independent Test**: Deploy both frontend and backend to Minikube, access via LoadBalancer IP with minikube tunnel, verify basic CRUD operations work

### Implementation for User Story 1

- [X] T014 [P] [US1] Generate frontend Helm chart using helm create todo-frontend
- [X] T015 [P] [US1] Generate backend Helm chart using helm create todo-backend
- [X] T016 [US1] Customize phase-4/helm-charts/todo-frontend/values.yaml for LoadBalancer service
- [X] T017 [US1] Customize phase-4/helm-charts/todo-backend/values.yaml for ClusterIP service
- [X] T018 [US1] Create Kubernetes Secret (app-secrets) with DATABASE_URL, OPENAI_API_KEY, XIAOMI_API_KEY, BETTER_AUTH_SECRET
- [X] T019 [US1] Create Kubernetes ConfigMap (backend-config) with HOST, PORT, DEBUG, CORS_ORIGINS
- [X] T020 [US1] Deploy backend to Minikube using helm install backend ./helm-charts/todo-backend
- [X] T021 [US1] Deploy frontend to Minikube using helm install frontend ./helm-charts/todo-frontend
- [X] T022 [US1] Verify pods are running (kubectl get pods - both Running status)
- [X] T023 [US1] Start minikube tunnel in separate terminal for LoadBalancer external access
- [X] T024 [US1] Verify LoadBalancer service has external IP assigned
- [X] T025 [US1] Access frontend application via external IP and port 3000
- [X] T026 [US1] Verify frontend-to-backend communication (API_URL: http://backend:8000)
- [X] T027 [US1] Test basic CRUD operation (create task persists to database)
- [X] T028 [US1] Verify ChatKit integration works with backend agents in Minikube environment

**Checkpoint**: At this point, User Story 1 (Local Development Environment) should be fully functional and testable independently

---

## Phase 4: User Story 2 - Staging Environment Deployment (Priority: P2)

**Goal**: Deploy to staging-like environment in Minikube for validating changes without affecting development environment

**Independent Test**: Deploy with staging configuration values (staging namespace, staging resource limits) and verify application works independently from dev environment

### Implementation for User Story 2

- [ ] T029 [P] [US2] Create staging namespace in Kubernetes (kubectl create namespace staging)
- [ ] T030 [P] [US2] Create phase-4/helm-charts/todo-backend/values-staging.yaml
- [ ] T031 [P] [US2] Create phase-4/helm-charts/todo-frontend/values-staging.yaml
- [ ] T032 [US2] Deploy backend to staging namespace using helm install backend-staging ./helm-charts/todo-backend --namespace staging -f values-staging.yaml
- [ ] T033 [US2] Deploy frontend to staging namespace using helm install frontend-staging ./helm-charts/todo-frontend --namespace staging -f values-staging.yaml
- [ ] T034 [US2] Verify staging resources created in staging namespace (kubectl get all -n staging)
- [ ] T035 [US2] Access staging frontend and verify it uses staging backend
- [ ] T036 [US2] Make changes to staging deployment and verify development environment remains unaffected

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently (dev and staging)

---

## Phase 5: User Story 3 - Production-Like Environment Deployment (Priority: P3)

**Goal**: Deploy to production-like environment in Minikube to validate resource limits, health checks, and production configurations

**Independent Test**: Deploy with production values (resource limits, multiple replicas, health probes) and verify application handles stress appropriately

### Implementation for User Story 3

- [ ] T037 [P] [US3] Create production namespace in Kubernetes (kubectl create namespace production)
- [ ] T038 [P] [US3] Create phase-4/helm-charts/todo-backend/values-prod.yaml with resource limits and replica count
- [ ] T039 [P] [US3] Create phase-4/helm-charts/todo-frontend/values-prod.yaml with resource limits and replica count
- [ ] T040 [US3] Enable horizontal pod autoscaling in production values (minReplicas: 2, maxReplicas: 5)
- [ ] T041 [US3] Deploy backend to production namespace with production values
- [ ] T042 [US3] Deploy frontend to production namespace with production values
- [ ] T043 [US3] Verify pods have configured resource limits (kubectl describe pod -n production)
- [ ] T044 [US3] Test pod crash recovery by killing a pod and verifying Kubernetes restarts it
- [ ] T045 [US3] Verify horizontal pod autoscaling works under load (if enabled)

**Checkpoint**: All user stories (1, 2, 3) should now be independently functional

---

## Phase 6: User Story 4 - Rollback and Re-deployment (Priority: P2)

**Goal**: Enable easy rollback and re-deployment for quick iteration on changes without manual cleanup

**Independent Test**: Deploy, make breaking change, rollback via Helm, verify previous version is restored

### Implementation for User Story 4

- [X] T046 [US4] Document Helm rollback procedure in quickstart.md troubleshooting section
- [X] T047 [US4] Test helm rollback by deploying v2, rolling back to v1
- [X] T048 [US4] Verify helm history shows all deployment versions
- [X] T049 [US4] Test helm uninstall and redeploy workflow for broken deployments
- [X] T050 [US4] Document common rollback scenarios and resolution steps

**Checkpoint**: All user stories (1, 2, 3, 4) should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation updates, troubleshooting guides, and validation of deployment process

- [ ] T051 [P] Add edge case handling to quickstart.md (resource exhaustion, database failures, tunnel issues)
- [X] T052 [P] Add troubleshooting section for common Minikube errors (ImagePullBackOff, EXTERNAL-IP pending, database connection)
- [X] T053 Document re-deployment workflow for code changes (build, tag, helm upgrade)
- [ ] T054 Validate quickstart.md by following steps on fresh Minikube installation
- [X] T055 Add resource requirement documentation (CPU, memory, disk) for each deployment stage
- [X] T056 Document secret rotation procedure (delete and recreate secrets)
- [ ] T057 [P] Create ADR for minikube service architecture decision (if approved)
- [ ] T058 [P] Create ADR for docker multi-stage builds decision (if approved)
- [ ] T059 [P] Create ADR for kubernetes secrets management decision (if approved)
- [ ] T060 Run end-to-end validation: deploy all stages, verify isolation, test rollback

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories (container images required)
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1) can proceed after Phase 2
  - User Stories 2, 3, 4 can proceed after Phase 2 (independent of US1)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 (uses separate namespace)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2 (uses separate namespace)
- **User Story 4 (P2)**: Can start after User Story 1 is deployed - Requires active deployment to test rollback

### Within Each User Story

- Helm chart generation [P] can run in parallel
- values customization [P] can run in parallel
- Secrets/ConfigMaps creation before deployment
- Backend deployment before frontend deployment (frontend depends on backend)
- Verification tasks after deployment

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- T014-T015 (Helm chart generation) can run in parallel
- T016-T017 (values customization) can run in parallel
- T029-T031 (staging values creation) can run in parallel
- T037-T039 (production values creation) can run in parallel
- T051-T052, T057-T059 (polish documentation) can run in parallel
- User Stories 2 and 3 can be worked on in parallel after US1 is complete

---

## Parallel Example: User Story 1 (Local Development)

```bash
# Launch Helm chart generation together:
Task: "Generate frontend Helm chart using helm create todo-frontend"
Task: "Generate backend Helm chart using helm create todo-backend"

# Launch values customization together:
Task: "Customize phase-4/helm-charts/todo-frontend/values.yaml for LoadBalancer service"
Task: "Customize phase-4/helm-charts/todo-backend/values.yaml for ClusterIP service"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - builds container images)
3. Complete Phase 3: User Story 1 (Local Development Environment)
4. **STOP and VALIDATE**: Test deployment independently
5. Deploy/demo if ready

**MVP Deliverable**: Working local Minikube deployment with frontend and backend accessible via LoadBalancer

### Incremental Delivery

1. Complete Setup + Foundational → Container images ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Staging environment)
4. Add User Story 3 → Test independently → Deploy/Demo (Production-like environment)
5. Add User Story 4 → Test rollback functionality → Deploy/Demo
6. Add Polish → Complete documentation and ADRs
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Local Development)
   - Developer B: User Story 2 (Staging) - can start after US1 basics
   - Developer C: User Story 3 (Production-like) - can start after US1 basics
3. Developer D: User Story 4 (Rollback) - requires US1 deployment
4. All: Polish phase documentation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently deployable and testable
- Critical path: Setup → Foundational (container images) → US1 → (US2, US3, US4 in parallel)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: skipping eval $(minikube docker-env), using imagePullPolicy: Always, hardcoding secrets in values.yaml
- Remember: First Docker build takes 5-8 minutes - this is NORMAL
- minikube tunnel must run in separate terminal for LoadBalancer access
- Backend uses ClusterIP (internal only) - this is correct security practice
