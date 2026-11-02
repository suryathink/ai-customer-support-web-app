#!/usr/bin/env bash
# Runs on the droplet (piped over SSH by the GitHub Actions workflow).
# Pulls the given backend image, swaps the container, and rolls back to the
# previous image if the new one doesn't pass the health check.
#
# Usage: deploy-server.sh <image:tag>
set -euo pipefail

IMAGE="${1:?Usage: deploy-server.sh <image:tag>}"
NAME="ai-support-server"
ENV_FILE="/opt/ai-support/server.env"
PORT=5000

run_container() {
  docker run -d \
    --name "$NAME" \
    --restart unless-stopped \
    --env-file "$ENV_FILE" \
    -p "127.0.0.1:${PORT}:${PORT}" \
    --memory 300m \
    "$1" >/dev/null
}

wait_healthy() {
  for _ in $(seq 1 30); do
    if curl -fsS "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  return 1
}

[ -f "$ENV_FILE" ] || { echo "❌ Missing $ENV_FILE"; exit 1; }

echo "🔄 Pulling $IMAGE"
docker pull "$IMAGE"

PREVIOUS_IMAGE="$(docker inspect -f '{{.Config.Image}}' "$NAME" 2>/dev/null || true)"

echo "🛑 Replacing container"
docker rm -f "$NAME" >/dev/null 2>&1 || true
run_container "$IMAGE"

if wait_healthy; then
  echo "✅ $IMAGE is healthy"
else
  echo "❌ New container failed the health check. Logs:"
  docker logs --tail 50 "$NAME" || true
  docker rm -f "$NAME" >/dev/null 2>&1 || true
  if [ -n "$PREVIOUS_IMAGE" ]; then
    echo "↩️  Rolling back to $PREVIOUS_IMAGE"
    run_container "$PREVIOUS_IMAGE"
    wait_healthy && echo "✅ Rollback healthy" || echo "❌ Rollback also unhealthy"
  fi
  exit 1
fi

echo "🧹 Removing old images of this app"
REPO="${IMAGE%:*}"
docker images "$REPO" --format '{{.Repository}}:{{.Tag}}' \
  | grep -vxF "$IMAGE" | grep -v ':latest$' \
  | xargs -r docker rmi >/dev/null 2>&1 || true
docker image prune -f >/dev/null
