#!/bin/bash

# Setup script for creating a deployment user on Ubuntu VPS
# Run this script on the server as root or with sudo privileges

set -e

DEPLOY_USER="deploy"
DEPLOY_DIR="/var/www/alfredbaudisch.com"

echo "Setting up deployment user: $DEPLOY_USER"

# Create deployment user
if id "$DEPLOY_USER" &>/dev/null; then
    echo "User $DEPLOY_USER already exists. Skipping user creation."
else
    echo "Creating user $DEPLOY_USER..."
    sudo adduser --disabled-password --gecos "" $DEPLOY_USER
    echo "User $DEPLOY_USER created successfully."
fi

# Add user to www-data group
echo "Adding $DEPLOY_USER to www-data group..."
sudo usermod -aG www-data $DEPLOY_USER

# Create deployment directory structure
echo "Creating deployment directories..."
sudo mkdir -p $DEPLOY_DIR/{releases,current}
sudo chown -R $DEPLOY_USER:www-data $DEPLOY_DIR
sudo chmod -R 755 $DEPLOY_DIR

# Ensure deploy user can write to releases directory
sudo chmod -R u+w $DEPLOY_DIR/releases

# Create .ssh directory for deploy user
echo "Setting up SSH directory..."
sudo -u $DEPLOY_USER mkdir -p /home/$DEPLOY_USER/.ssh
sudo -u $DEPLOY_USER chmod 700 /home/$DEPLOY_USER/.ssh
sudo -u $DEPLOY_USER touch /home/$DEPLOY_USER/.ssh/authorized_keys
sudo -u $DEPLOY_USER chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys

echo "Configuring sudo access..."

# Create a wrapper script for chown
# Files need to be owned by deploy:www-data so nginx can read them
CHOWN_SCRIPT="/usr/local/bin/deploy-chown-releases.sh"
sudo tee "$CHOWN_SCRIPT" > /dev/null << SCRIPT_EOF
#!/bin/bash
# Wrapper script for chown on releases directory
# Set ownership to deploy:www-data so nginx (www-data) can read files
chown -R $DEPLOY_USER:www-data $DEPLOY_DIR
# Ensure group has read permissions
chmod -R g+r $DEPLOY_DIR
# Ensure directories are executable by group
find $DEPLOY_DIR -type d -exec chmod g+x {} \;
SCRIPT_EOF
sudo chmod 755 "$CHOWN_SCRIPT"

if ! sudo grep -q "^$DEPLOY_USER.*deploy-chown-releases" /etc/sudoers.d/deploy 2>/dev/null; then
    {
        echo "Defaults:$DEPLOY_USER !requiretty"
        echo "$DEPLOY_USER ALL=(ALL) NOPASSWD: $CHOWN_SCRIPT"
    } | sudo tee /etc/sudoers.d/deploy > /dev/null
    sudo chmod 440 /etc/sudoers.d/deploy
    # Validate sudoers syntax
    if sudo visudo -cf /etc/sudoers.d/deploy; then
        echo "Sudo access configured successfully."
    else
        echo "Error: Sudoers syntax error. Please check /etc/sudoers.d/deploy"
        exit 1
    fi
else
    # Check if requiretty is disabled
    if ! sudo grep -q "^Defaults:$DEPLOY_USER !requiretty" /etc/sudoers.d/deploy 2>/dev/null; then
        echo "Defaults:$DEPLOY_USER !requiretty" | sudo tee -a /etc/sudoers.d/deploy > /dev/null
        echo "Added !requiretty to sudo access."
    fi
    # Check if chown script is already in sudoers
    if ! sudo grep -q "^$DEPLOY_USER.*deploy-chown-releases" /etc/sudoers.d/deploy 2>/dev/null; then
        echo "$DEPLOY_USER ALL=(ALL) NOPASSWD: $CHOWN_SCRIPT" | sudo tee -a /etc/sudoers.d/deploy > /dev/null
        echo "Added chown script to sudo access."
    fi
    # Validate sudoers syntax
    if sudo visudo -cf /etc/sudoers.d/deploy; then
        echo "Sudo access configured successfully."
    else
        echo "Error: Sudoers syntax error. Please check /etc/sudoers.d/deploy"
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo "Setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Generate SSH key pair on your local machine:"
echo "   ssh-keygen -t ed25519 -C 'github-actions-deploy' -f ~/.ssh/github_actions_deploy"
echo "   (Press Enter when prompted for passphrase - no passphrase needed)"
echo ""
echo "2. Add the public key to the deploy user:"
echo "   cat ~/.ssh/github_actions_deploy.pub | ssh your-vps-user@your-vps-ip 'sudo -u deploy tee -a /home/deploy/.ssh/authorized_keys'"
echo ""
echo "   OR manually:"
echo "   - Copy the public key content from: cat ~/.ssh/github_actions_deploy.pub"
echo "   - SSH into your VPS"
echo "   - Run: sudo -u deploy nano /home/deploy/.ssh/authorized_keys"
echo "   - Paste the public key and save"
echo ""
echo "3. Add GitHub Secrets:"
echo "   - VPS_HOST: Your VPS IP or domain"
echo "   - VPS_USER: deploy"
echo "   - VPS_SSH_KEY: Contents of ~/.ssh/github_actions_deploy (private key)"
echo ""
echo "4. Test SSH connection:"
echo "   ssh -i ~/.ssh/github_actions_deploy deploy@your-vps-ip"
echo ""

