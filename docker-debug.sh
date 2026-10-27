#!/usr/bin/env bash
set -euo pipefail

echo "=================================================="
echo " first-dotnet - Ubuntu Docker debug & reset"
echo "=================================================="

cd "$(dirname "$0")"

echo "[1/6] Converting Windows CRLF line endings to Unix LF (if dos2unix available)..."
if command -v dos2unix >/dev/null 2>&1; then
  dos2unix -q .env docker-compose.yml docker-compose.override.yml 2>/dev/null || true
  dos2unix -q server/Dockerfile client/Dockerfile client/nginx.conf 2>/dev/null || true
  dos2unix -q server/Api/Program.cs server/Api/appsettings.Development.json 2>/dev/null || true
  dos2unix -q Makefile client/vite.config.ts 2>/dev/null || true
  echo "   dos2unix done"
else
  echo "   dos2unix not found; skipping (install: sudo apt install dos2unix)"
fi

echo "[2/6] Stopping & removing old containers..."
docker compose down --remove-orphans --volumes 2>/dev/null || true

echo "[3/6] Removing old images (force rebuild)..."
docker compose rm -f 2>/dev/null || true
docker image rm first-dotnet-api 2>/dev/null || true
docker image rm first-dotnet-frontend 2>/dev/null || true

echo "[4/6] Validating docker-compose.yml..."
docker compose config --quiet && echo "   compose config OK"

echo "[5/6] Building & starting everything..."
docker compose up --build -d

echo "[6/6] Waiting for services (15s)..."
sleep 15

echo ""
echo "=================================================="
echo " Container status:"
echo "=================================================="
docker compose ps

echo ""
echo "=================================================="
echo " Backend API health:"
echo "=================================================="
curl -sS --max-time 10 http://localhost:5080/api/products || echo "   (API not reachable yet - check logs below)"
echo ""

echo "=================================================="
echo " Swagger UI:"
echo "=================================================="
curl -sS --max-time 10 -o /dev/null -w "   HTTP %{http_code}\n" http://localhost:5080/swagger || true

echo "=================================================="
echo " Frontend:"
echo "=================================================="
curl -sS --max-time 10 -o /dev/null -w "   HTTP %{http_code}\n" http://localhost:5173 || true

echo ""
echo "=================================================="
echo " If anything failed, run:  docker compose logs"
echo "=================================================="
