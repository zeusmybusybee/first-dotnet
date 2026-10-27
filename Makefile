# ---------------------------------------------------------------------------
# first-dotnet development Makefile
#
# Quick start (Ubuntu, Docker + Docker Compose already installed):
#
#   cp .env.example .env
#   make dev-up          # build + start everything (db + backend + frontend)
#   make dev-down        # stop and remove containers
#   make dev-restart     # rebuild + restart
#   make dev-logs        # follow container logs
#   make dev-ps          # list running containers
#   make dev-shell       # open a shell inside the backend container
#   make dev-smoke       # curl the API to verify it is up
#
# Build the frontend static assets once, then serve them separately:
#   make dev-build-frontend-only
#   make serve-frontend
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Paths & commands
# ---------------------------------------------------------------------------
APP_NAME    ?= first-dotnet
APP_DIR     := $(CURDIR)
COMPOSE     := docker compose
COMPOSE_FILE:= -f docker-compose.yml
PROJECT     := --project-name $(APP_NAME)

# Compose command incl. project name + env file.
COMPOSE_DEV := $(COMPOSE) $(PROJECT) $(COMPOSE_FILE) --env-file .env

# ---------------------------------------------------------------------------
# Ports (must match .env.example)
# ---------------------------------------------------------------------------
FRONTEND_PORT ?= 5173
BACKEND_PORT  ?= 5080

# ---------------------------------------------------------------------------
# Docker Compose service names
# ---------------------------------------------------------------------------
DB_SERVICE   := db
API_SERVICE  := api
FRONTEND_SVC := frontend

# ---------------------------------------------------------------------------
# Help
# ---------------------------------------------------------------------------
.PHONY: help dev-up dev-down dev-start dev-stop dev-restart dev-logs dev-ps \
        dev-pull dev-build dev-build-backend dev-build-frontend dev-shell \
        dev-db-shell dev-migrate dev-reset dev-smoke serve-frontend

help:  ## Show this help message
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make <target>\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  %-20s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# ---------------------------------------------------------------------------
# Docker compose plumbing
# ---------------------------------------------------------------------------
compose-dev:
	$(COMPOSE_DEV)

# ---------------------------------------------------------------------------
# DEVELOPMENT - start everything
# ---------------------------------------------------------------------------
dev-up:  ## Build and start db, backend, and frontend
	$(COMPOSE_DEV) up --build -d

dev-down:  ## Stop and remove all containers (keeps volumes)
	$(COMPOSE_DEV) down

dev-stop:  ## Stop containers (keeps them so `up` is fast)
	$(COMPOSE_DEV) stop

dev-start: dev-up  ## Alias of dev-up

# ---------------------------------------------------------------------------
# Build targets
# ---------------------------------------------------------------------------
dev-build:  ## Build all services
	$(COMPOSE_DEV) build

dev-build-backend:  ## Build only the .NET backend image
	$(COMPOSE_DEV) build $(API_SERVICE)

dev-build-frontend:  ## Build the frontend static bundle
	$(COMPOSE_DEV) run --rm $(FRONTEND_SVC) sh -c "cd /app && pnpm run build"

# ---------------------------------------------------------------------------
# Shell / debugging
# ---------------------------------------------------------------------------
dev-shell:  ## Open a shell in the backend container
	$(COMPOSE_DEV) exec $(API_SERVICE) sh

dev-db-shell:  ## Open a shell in the postgres container
	$(COMPOSE_DEV) exec $(DB_SERVICE) psql -U $(DB_USER) -d $(DB_NAME)

# ---------------------------------------------------------------------------
# Database (run inside the backend container, which has EF Core)
# ---------------------------------------------------------------------------
# Ensure the database is up before running these.
dev-migrate:  ## Create + apply EF Core migrations
	$(COMPOSE_DEV) exec $(API_SERVICE) sh -c "dotnet ef migrations add InitialCreate --project /src/Api --no-build || true"
	$(COMPOSE_DEV) exec $(API_SERVICE) sh -c "dotnet ef database update --project /src/Api --no-build"

dev-reset:  ## Drop + recreate the database and apply migrations
	$(COMPOSE_DEV) exec $(API_SERVICE) sh -c "dotnet ef database update 0 --project /src/Api --no-build"
	$(COMPOSE_DEV) exec $(API_SERVICE) sh -c "dotnet ef database update --project /src/Api --no-build"

# ---------------------------------------------------------------------------
# Smoke tests / health checks
# ---------------------------------------------------------------------------
dev-smoke:  ## Verify the backend API responds
	@echo "Waiting for backend on port $(BACKEND_PORT)..."
	@for i in $$(seq 1 30); do \
		if curl -fsS http://localhost:$(BACKEND_PORT)/api/products >/dev/null 2>&1; then \
			echo "Backend is up!"; \
			curl -s http://localhost:$(BACKEND_PORT)/api/products; \
			exit 0; \
		fi; \
		sleep 1; \
	done
	@echo "ERROR: Backend did not become ready in 30s."
	$(COMPOSE_DEV) logs --tail 50
	exit 1

# ---------------------------------------------------------------------------
# Frontend (serve built assets)
# ---------------------------------------------------------------------------
dev-build-frontend-only:  ## Build frontend assets once (no docker)
	cd client && pnpm install --no-audit --no-fund
	cd client && pnpm run build

serve-frontend:  ## Serve the built frontend with a tiny static server
	cd client/dist && python3 -m http.server 5173


dev-restart:  ## Full restart: pull + build + recreate
	$(COMPOSE_DEV) pull
	$(COMPOSE_DEV) up --build -d --remove-orphans

dev-logs:  ## Follow logs of all containers
	$(COMPOSE_DEV) logs -f

dev-logs-api:  ## Follow only the backend logs
	$(COMPOSE_DEV) logs -f $(API_SERVICE)

dev-ps:  ## List running containers
	$(COMPOSE_DEV) ps

dev-pull:  ## Pull latest images
	$(COMPOSE_DEV) pull
