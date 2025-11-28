# Deployment Scripts

This directory contains scripts for deploying the site to the server.

## Local Deployment

Deploy from the local machine using the same strategy as GitHub Actions.

### Quick Start

1. **Set up environment variables** (one-time setup):

   ```bash
   export ALFRED_DEPLOY_VPS_HOST="server-ip"
   export ALFRED_DEPLOY_VPS_USER="deploy"
   export ALFRED_DEPLOY_SSH_KEY="$HOME/.ssh/github_actions_deploy"
   ```

   Or create a config file:

   ```bash
   cp scripts/deploy/deploy-config.example.sh scripts/deploy/deploy-config.sh
   # Edit deploy-config.sh with settings
   source scripts/deploy/deploy-config.sh
   ```

2. **Deploy**:

   ```bash
   npm run deploy
   ```

   Or directly:

   ```bash
   bash scripts/deploy/deploy.sh
   ```

### What the script does:

1. Builds the site (`npm run build`)
2. Syncs `_site/*` with `rsync` with the remote folder
3. And that's it, site deployed!

### Environment Variables

- `ALFRED_DEPLOY_VPS_HOST`
- `ALFRED_DEPLOY_VPS_USER` (optional, default: `deploy`)
- `ALFRED_DEPLOY_SSH_KEY` (optional, default: `~/.ssh/github_actions_deploy`): Path to SSH private key
- `DEPLOY_DIR` (optional, default: `/var/www/alfredbaudisch.com`):
- `BUILD_DIR` (optional, default: `_site`)

### Example Usage

```bash
# Using environment variables
export ALFRED_DEPLOY_VPS_HOST="ip"
npm run deploy

# Using a config file
source scripts/deploy/deploy-config.sh
npm run deploy

# With custom SSH key
ALFRED_DEPLOY_SSH_KEY="$HOME/.ssh/my_custom_key" npm run deploy
```

## VPS Setup

See `setup-deploy-user.sh` for setting up the deployment user on the server.

## GitHub Actions Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) uses the same deployment strategy automatically on push to `master`.

### Setting up GitHub Secrets

1. Go to GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

   - **VPS_HOST**: VPS IP address or domain
   - **VPS_USER**: `deploy`
   - **VPS_SSH_KEY**: Copy the **entire contents** of the private SSH key file

   To get the private key content:
   ```bash
   cat ~/.ssh/github_actions_deploy
   ```
   
   Copy everything including:
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   ...
   -----END OPENSSH PRIVATE KEY-----
   ```
   
   **Important**: Include the entire key, including the BEGIN and END lines, and all the content in between. Paste it exactly as-is into the GitHub secret value field.

