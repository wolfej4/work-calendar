#!/usr/bin/env sh
# Build (or rebuild) the work-calendar Docker image.
# Run this on the Docker host before deploying the stack in Portainer.
#
# Usage:
#   chmod +x build.sh
#   ./build.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Building work-calendar image..."
docker build -t work-calendar:latest .
echo ""
echo "Done. You can now deploy the stack in Portainer using docker-compose.yml."
