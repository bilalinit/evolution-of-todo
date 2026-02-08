# ========================================
# Multi-stage Dockerfile for FastAPI + uv
# ========================================

# Builder Stage (for uv and dependencies)
FROM python:3.12-slim AS builder
# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app
# Copy dependency files
COPY pyproject.toml uv.lock ./
# Install dependencies (including dev for potential build steps)
RUN uv sync --frozen --no-install-project
# Copy the entire project
COPY . .
# Install the project
RUN uv sync --frozen

# Production Stage
FROM python:3.12-slim AS production
# Create non-root user for security
RUN groupadd -g 1000 appgroup && useradd -u 1000 -g appgroup -m appuser
# Install uv (binary only)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app
# Copy installed dependencies from builder
COPY --from=builder /app/.venv /app/.venv
# Copy application source and root files
COPY --from=builder /app/src /app/src
COPY --from=builder /app/pyproject.toml /app/pyproject.toml
# Copy MCP tools and root files needed at runtime
COPY --from=builder /app/README.md /app/README.md
COPY --from=builder /app/task_serves_mcp_tools.py /app/task_serves_mcp_tools.py
RUN chown -R appuser:appgroup /app
USER appuser
# Add .venv/bin to PATH
ENV PATH="/app/.venv/bin:$PATH"
# Default port (can be overridden)
EXPOSE 8000
# Health checks (port is variable)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1
# Default entrypoint: backend-api
# Override with CMD in Helm charts for other services:
# - recurring-service: uvicorn backend.services.microservices.recurring_service:app --port 8001
# - notification-service: uvicorn backend.services.microservices.notification_service:app --port 8002
# - audit-service: uvicorn backend.services.microservices.audit_service:app --port 8003
# - websocket-service: uvicorn backend.services.microservices.websocket_service:app --port 8004
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
