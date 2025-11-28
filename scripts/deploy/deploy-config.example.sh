#!/bin/bash

# Example configuration file for local deployment
# Copy this file to deploy-config.sh and customize it
# Then source it before running deploy.sh:
#   source scripts/deploy/deploy-config.sh
#   bash scripts/deploy/deploy.sh

# VPS connection details
export ALFRED_DEPLOY_VPS_HOST="ip"
export ALFRED_DEPLOY_VPS_USER="deploy"

# SSH key path (defaults to ~/.ssh/github_actions_deploy if not set)
export ALFRED_DEPLOY_SSH_KEY="$HOME/.ssh/github_actions_deploy"

# Deployment directory on VPS (defaults to /var/www/alfredbaudisch.com if not set)
export DEPLOY_DIR="/var/www/alfredbaudisch.com"

# Build directory (defaults to _site if not set)
export BUILD_DIR="_site"