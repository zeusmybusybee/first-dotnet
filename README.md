# first-dotnet

A fullstack starter template: **.NET 10 (Minimal API)** backend + **React + Vite** frontend, backed by **PostgreSQL**. Everything runs inside Docker Compose.

## Project layout

| Path | Purpose |
| --- | --- |
| `server/Api` | .NET 10 Minimal API (EF Core + Npgsql) |
| `client` | React 19 + Vite + TypeScript SPA |
| `docker-compose.yml` | Defines `db`, `api`, `frontend` services |
| `Makefile` | Cross-platform dev commands |
| `server/Dockerfile` | Builds & runs the .NET backend image |
| `client/Dockerfile` | Builds & serves the frontend with nginx |

## Prerequisites

- **Docker** + **Docker Compose** installed on your machine (Linux, macOS, or Windows with WSL2).
- `make` available in your terminal (macOS/Linux: built in; Windows: `choco install make` or use Git Bash / WSL).

## Quick start

```bash
# 1. Copy the example env file to .env
cp .env.example .env

# 2. Build & start everything (PostgreSQL + .NET API + React frontend)
make dev-up

# 3. Open your browser
#    Frontend: http://localhost:5173
#    Backend API: http://localhost:5080/api/products
```

## Common commands

```bash
make help                  # show all available targets

# --- Lifecycle ---
make dev-up                # build + start db, api, frontend  (first time ~2-4 min)
make dev-down              # stop and remove all containers
make dev-restart           # pull, rebuild, and restart
make dev-logs              # follow logs of all containers
make dev-ps                # list running containers

# --- Debug ---
make dev-shell             # open a shell inside the backend container
make dev-db-shell          # open psql inside the PostgreSQL container

# --- Database ---
make dev-migrate           # add + apply EF Core migrations
make dev-reset             # drop + recreate the DB and apply migrations

# --- Smoke test ---
make dev-smoke             # curl the API to verify it is up
```

## How the services talk to each other

- `db` listens on `5432` (mapped to host `HOST_DB_PORT`, default `5432`).
- `api` listens on `BACKEND_PORT` (default `8080`) inside the container, mapped to host `HOST_BACKEND_PORT` (default `5080`), so call the API at `http://localhost:5080/api/products`.
- `frontend` (nginx serving the built React app) listens on `FRONTEND_PORT` (default `5173`).

## Environment variables (`.env`)

| Variable | Default | Description |
| --- | --- | --- |
| `BACKEND_PORT` | `8080` | Backend internal port (where the .NET app listens) |
| `HOST_BACKEND_PORT` | `5080` | Host port mapped to backend (reach the API at `http://localhost:5080`) |
| `FRONTEND_PORT` | `5173` | Frontend internal + host port |
| `DB_HOST` | `db` | PostgreSQL service name |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `firsatdotnet_db` | Database name |
| `DB_USER` / `DB_PASSWORD` | `firstdotnet` / `myapp_pw` | DB credentials |
| `VITE_API_URL` | `/api` | Frontend base URL for API calls |

## Useful notes

- The backend uses **EF Core migrations**. On first run, `docker compose up` boots the DB. Then run `make dev-migrate` to create the schema. If you change models, run `dotnet ef migrations add <Name>` locally and `make dev-restart` to rebuild.
- The frontend is built into a static bundle (nginx) at image build time. It is served on port `5173`.
- The backend runs the published `Api.dll` from `/app`. No hot-reload of C# code in the container; change a model and rebuild with `make dev-restart`.
