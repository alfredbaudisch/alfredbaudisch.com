#!/bin/bash

# Local deployment script for 11ty static site
# Deploys the built site to VPS using the same strategy as GitHub Actions

set -e

# Configuration - can be overridden by environment variables
VPS_HOST="${ALFRED_DEPLOY_VPS_HOST:-}"
VPS_USER="${ALFRED_DEPLOY_VPS_USER:-deploy}"
SSH_KEY="${ALFRED_DEPLOY_SSH_KEY:-$HOME/.ssh/github_actions_deploy}"
DEPLOY_DIR="${DEPLOY_DIR:-/var/www/alfredbaudisch.com}"
BUILD_DIR="${BUILD_DIR:-_site}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
error() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

info() {
    echo -e "${GREEN}$1${NC}"
}

warn() {
    echo -e "${YELLOW}$1${NC}"
}

# Check if VPS_HOST is set
if [ -z "$VPS_HOST" ]; then
    error "ALFRED_DEPLOY_VPS_HOST environment variable is not set. Please set it:\n  export ALFRED_DEPLOY_VPS_HOST=ip"
fi

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    error "SSH key not found at: $SSH_KEY\n  Please set SSH_KEY environment variable or ensure the key exists."
fi

# Set correct permissions on SSH key
chmod 600 "$SSH_KEY"

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    warn "Build directory '$BUILD_DIR' not found. Building site..."
    npm run build
fi

info "Building site..."
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    error "Build failed: '$BUILD_DIR' directory not found after build"
fi

info "Deploying to VPS..."
info "  Host: $VPS_HOST"
info "  User: $VPS_USER"
info "  Target: $DEPLOY_DIR/_site"

# Sync files to VPS using rsync
# Use --no-owner and --no-group to prevent rsync from preserving ownership
info "Syncing files to $VPS_USER@$VPS_HOST:$DEPLOY_DIR/_site/..."
rsync -avz --delete --no-owner --no-group \
    -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
    "$BUILD_DIR/" "$VPS_USER@$VPS_HOST:$DEPLOY_DIR/_site/"

if [ $? -ne 0 ]; then
    error "Failed to sync files to VPS"
fi

info "Files synced successfully"

info "Deployment completed successfully!"
info "  URL: https://alfredbaudisch.com"

