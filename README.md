# CTFd Whale Plugin - Complete Deployment Solution

**Version**: 2.0 Enhanced  
**CTFd Compatibility**: 3.8.1  
**Author**: fpclose  
**Last Updated**: 2025-11-15  
**License**: MIT  
**Repository**: https://github.com/fpclose/ctfd_3.8.1_whale  

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Architecture Overview](#architecture-overview)
4. [Installation Guide](#installation-guide)
5. [Configuration](#configuration)
6. [Plugin Development](#plugin-development)
7. [Challenge Creation](#challenge-creation)
8. [Troubleshooting](#troubleshooting)
9. [API Reference](#api-reference)
10. [Production Deployment](#production-deployment)

---

## Introduction

### Overview

CTFd Whale is a dynamic container management plugin for CTFd 3.8.1 that enables automated deployment and management of Docker-based CTF challenges. This enhanced version provides a complete, production-ready deployment solution with automated installation, comprehensive documentation, and battle-tested configurations.

### Key Features

- **Docker Swarm Orchestration**: Automated container lifecycle management with resource constraints
- **FRP Integration**: Support for HTTP, Direct-HTTP, and Direct (TCP) access methods
- **Dynamic Flag Generation**: Unique flags per user to prevent cheating
- **Automated Deployment**: One-click installation script for rapid setup
- **Resource Management**: CPU and memory limits, automatic timeout and cleanup
- **Network Isolation**: Separate networks for services and dynamic containers
- **Production Ready**: Includes monitoring, logging, and security best practices

### What's New in v2.0

This enhanced version includes:

1. **Automated Installation Script** (600+ lines)
   - One-command deployment
   - Automatic dependency installation
   - Configuration generation
   - Service initialization

2. **Configuration Templates**
   - docker-compose.yml template
   - FRP server/client templates
   - Nginx reverse proxy template

3. **Example Challenge**
   - Complete challenge implementation
   - Flag replacement mechanism
   - Writeup documentation

4. **Comprehensive Documentation**
   - Installation procedures
   - Configuration reference
   - Troubleshooting guide
   - API documentation

---

## System Requirements

### Hardware Requirements

- **CPU**: Minimum 2 cores (4+ cores recommended)
- **RAM**: Minimum 4GB (8GB+ recommended)
- **Storage**: Minimum 20GB available space
- **Network**: Public IP or accessible internal IP address

### Software Requirements

- **Operating System**: Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+)
- **Docker**: Version 20.10.0 or later
- **Docker Compose**: Version 2.0.0 or later
- **Git**: Any recent version
- **Python**: 3.9+ (included with CTFd)

### Network Ports

The following ports must be available:

| Port | Service | Description |
|------|---------|-------------|
| 80 | Nginx | HTTP reverse proxy |
| 8000 | CTFd | Direct CTFd access (optional) |
| 7400 | FRP Admin | FRP management API |
| 7897 | FRP Server | FRP main port |
| 8080 | FRP HTTP | HTTP virtual host port |
| 10000-10100 | Dynamic | Challenge container ports |

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────┐
│              User Access Layer               │
│         (HTTP/HTTPS via Nginx:80)           │
└────────────────┬────────────────────────────┘
                 │
         ┌───────▼────────┐
         │  Nginx (Proxy) │
         │   172.19.0.5   │
         └───────┬────────┘
                 │
         ┌───────▼────────┐
         │  CTFd Service  │
         │   172.19.0.4   │
         │  + Whale Plugin│
         └─┬────────────┬─┘
           │            │
    ┌──────▼───┐  ┌────▼─────┐
    │ MariaDB  │  │  Redis   │
    │172.19.0.3│  │172.19.0.2│
    └──────────┘  └──────────┘
           │
    ┌──────▼──────────────────┐
    │   Docker Swarm Cluster  │
    │  ┌──────┐  ┌──────┐     │
    │  │Chal 1│  │Chal 2│ ... │
    │  └──────┘  └──────┘     │
    └──────┬──────────────────┘
           │
    ┌──────▼──────┐
    │  FRP Client │
    │ 172.19.0.10 │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │  FRP Server │
    │ Host:7897   │
    └─────────────┘
```

### Network Architecture

**Internal Network (172.19.0.0/16)**:
- ctfd: 172.19.0.4
- nginx: 172.19.0.5
- db: 172.19.0.3
- cache: 172.19.0.2
- frpc: 172.19.0.10

**Dynamic Container Network (10.0.0.0/24)**:
- Overlay network for challenge containers
- Managed by Docker Swarm
- Isolated from internal services

### Access Methods

**1. Direct-HTTP (Recommended for Web Challenges)**
- Format: `http://SERVER_IP:PORT`
- Example: `http://192.168.1.100:10001`
- Advantages: No DNS dependency, fast, reliable
- Use case: Web-based challenges

**2. Direct (Recommended for PWN Challenges)**
- Format: `nc SERVER_IP PORT`
- Example: `nc 192.168.1.100 10001`
- Advantages: Direct TCP/UDP connection
- Use case: Binary exploitation, reverse engineering

**3. HTTP (Subdomain-based)**
- Format: `http://UUID.DOMAIN:8080`
- Example: `http://abc123.192.168.1.100.xip.io:8080`
- Advantages: Domain isolation, session management
- Use case: Challenges requiring subdomain separation
- Note: Requires stable DNS service or custom domain

---

## Installation Guide

### Quick Installation (Automated)

```bash
# 1. Clone CTFd 3.8.1
cd /opt
git clone https://github.com/CTFd/CTFd.git
cd CTFd && git checkout 3.8.1

# 2. Install Whale plugin
cd CTFd/plugins
git clone https://github.com/fpclose/ctfd_3.8.1_whale.git ctfd-whale-master

# 3. Run automated installation
cd ctfd-whale-master/deployment
chmod +x install_whale.sh
sudo ./install_whale.sh

# 4. Follow prompts to configure
# - Server IP address
# - Docker Swarm node name
# - FRP configuration (auto-generated)

# 5. Wait 5-10 minutes for completion
```

### Manual Installation

#### Step 1: Install Docker

**Ubuntu/Debian**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker repository
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version
docker compose version
```

**CentOS/RHEL**:
```bash
# Install dependencies
sudo yum install -y yum-utils

# Add Docker repository
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
```

#### Step 2: Initialize Docker Swarm

```bash
# Initialize Swarm
docker swarm init

# If multiple network interfaces, specify IP
# docker swarm init --advertise-addr YOUR_IP

# Get node name
docker node ls

# Add node label (required for scheduling)
NODE_NAME=$(docker node ls --format "{{.Hostname}}" | head -1)
docker node update --label-add name=$NODE_NAME $NODE_NAME

# Verify label
docker node inspect $NODE_NAME --format '{{ .Spec.Labels }}'
```

#### Step 3: Create Docker Networks

```bash
# Create overlay network for dynamic containers
docker network create \
  --driver overlay \
  --attachable \
  --subnet 10.0.0.0/24 \
  ctfd_frp-containers

# Verify network
docker network ls | grep frp-containers
```

#### Step 4: Install FRP Server

```bash
# Create FRP directory
sudo mkdir -p /usr/local/frp
cd /usr/local/frp

# Download FRP (version 0.52.3)
FRP_VERSION="0.52.3"
wget https://github.com/fatedier/frp/releases/download/v${FRP_VERSION}/frp_${FRP_VERSION}_linux_amd64.tar.gz

# Extract
tar -xzf frp_${FRP_VERSION}_linux_amd64.tar.gz
mv frp_${FRP_VERSION}_linux_amd64/* .
rm -rf frp_${FRP_VERSION}_linux_amd64*

# Create configuration
cat > frps.ini << 'EOF'
[common]
bind_addr = 0.0.0.0
bind_port = 7897
token = YOUR_SECURE_TOKEN_HERE
vhost_http_port = 8080
subdomain_host = YOUR_SERVER_IP.xip.io
dashboard_port = 7500
dashboard_user = admin
dashboard_pwd = admin
EOF

# Create systemd service
sudo cat > /etc/systemd/system/frps.service << 'EOF'
[Unit]
Description=FRP Server Service
After=network.target

[Service]
Type=simple
User=root
Restart=on-failure
RestartSec=5s
ExecStart=/usr/local/frp/frps -c /usr/local/frp/frps.ini
LimitNOFILE=1048576

[Install]
WantedBy=multi-user.target
EOF

# Start FRP server
sudo systemctl daemon-reload
sudo systemctl start frps
sudo systemctl enable frps

# Verify status
sudo systemctl status frps
```

#### Step 5: Deploy CTFd with Whale

```bash
# Clone CTFd
cd /opt
git clone https://github.com/CTFd/CTFd.git
cd CTFd && git checkout 3.8.1

# Install Whale plugin
cd CTFd/plugins
git clone https://github.com/fpclose/ctfd_3.8.1_whale.git ctfd-whale-master

# Create directories
cd /opt/CTFd
mkdir -p .data/CTFd/logs
mkdir -p .data/CTFd/uploads
mkdir -p .data/mysql
mkdir -p .data/redis
mkdir -p conf/nginx
mkdir -p conf/frp

# Copy configuration templates
cp CTFd/plugins/ctfd-whale-master/deployment/templates/nginx.template.conf conf/nginx/http.conf
cp CTFd/plugins/ctfd-whale-master/deployment/templates/frpc.template.ini conf/frp/frpc.ini
cp CTFd/plugins/ctfd-whale-master/deployment/templates/docker-compose.template.yml docker-compose.yml

# Edit configurations
# 1. Update conf/nginx/http.conf (already configured for 172.19.0.4)
# 2. Update conf/frp/frpc.ini (set token matching frps.ini)
# 3. Update docker-compose.yml (set network IPs)

# Start services
docker compose up -d

# Monitor logs
docker compose logs -f
```

---

## Configuration

### Whale Plugin Configuration

Access CTFd admin panel at `http://YOUR_IP/admin`, navigate to Plugins > ctfd-whale > Settings.

#### Docker Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Docker API URL | `unix:///var/run/docker.sock` | Docker socket path |
| Docker Swarm Mode | `enabled` | Enable Swarm orchestration |
| Docker Swarm Nodes | `YOUR_NODE_NAME` | Node name from `docker node ls` |
| Auto Connect Network | `ctfd_frp-containers` | Network for dynamic containers |
| Docker Max CPU | `0.5` | CPU limit per container (cores) |
| Docker Max Memory | `256m` | Memory limit per container |

#### FRP Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| FRP API URL | `http://172.19.0.10:7400` | FRP Admin API endpoint |
| FRP Server Address | `YOUR_SERVER_IP` | Server public/internal IP |
| FRP Server Port | `7897` | FRP server main port |
| FRP HTTP Domain Suffix | `YOUR_IP.xip.io` | Domain for HTTP challenges |
| FRP HTTP Port | `8080` | HTTP virtual host port |
| Direct IP Address | `YOUR_SERVER_IP` | IP for direct connections |
| Direct Port Minimum | `10000` | Minimum port for direct challenges |
| Direct Port Maximum | `10100` | Maximum port for direct challenges |

#### Container Limits

| Parameter | Recommended Value | Description |
|-----------|-------------------|-------------|
| Container Timeout | `3600` | Auto-destroy timeout (seconds) |
| Max Containers Per User | `3` | Concurrent containers limit |
| CPU Limit | `0.5` | Cores per container |
| Memory Limit | `256m` | RAM per container |

### Database Configuration

The plugin will automatically configure the database on first run. Manual configuration:

```sql
-- Access database
docker exec -it ctfd-db-1 mysql -uctfd -pctfd -D ctfd

-- Configure Whale settings
INSERT INTO config (`key`, value) VALUES 
  ('whale:docker_api_url', 'unix:///var/run/docker.sock'),
  ('whale:docker_swarm_nodes', 'YOUR_NODE_NAME'),
  ('whale:frp_api_url', 'http://172.19.0.10:7400'),
  ('whale:frp_direct_ip_address', 'YOUR_SERVER_IP'),
  ('whale:frp_direct_port_minimum', '10000'),
  ('whale:frp_direct_port_maximum', '10100'),
  ('whale:auto_connect_network', 'ctfd_frp-containers')
ON DUPLICATE KEY UPDATE value=VALUES(value);
```

---

## Plugin Development

### Frontend Customization

The plugin provides a modern, responsive interface built with vanilla JavaScript. Key files:

**Assets Structure**:
```
assets/
├── config.js         # Configuration page logic
├── containers.js     # Container management page
├── create.html       # Challenge creation form
├── create.js         # Creation form logic
├── update.html       # Challenge update form
├── update.js         # Update form logic
├── view.html         # Challenge view template
└── view.js           # View logic (user interface)
```

**Customizing the Challenge View**:

`assets/view.html` defines the challenge interface shown to users:

```html
<!-- Original template uses CTFd's styling -->
<div class="container-fluid">
  <div class="row">
    <div class="col-md-12">
      <!-- Challenge content -->
      <div id="whale-container-info">
        <!-- Container status and access info -->
      </div>
      <div id="whale-container-actions">
        <!-- Start/Stop buttons -->
      </div>
    </div>
  </div>
</div>
```

Modify `assets/view.js` to customize behavior:

```javascript
// Add custom container status polling
function updateContainerStatus() {
    fetch(`/api/v1/whale/container?challenge_id=${challengeId}`)
        .then(response => response.json())
        .then(data => {
            // Update UI based on container status
            if (data.success) {
                displayContainerInfo(data.data);
            }
        });
}

// Customize button actions
document.getElementById('start-container').addEventListener('click', async () => {
    // Custom pre-start validation
    if (!validateUserPermissions()) {
        showError('Permission denied');
        return;
    }
    
    // Start container
    await startContainer();
});
```

**Styling Customization**:

The plugin uses CTFd's base styles. To add custom styling:

1. Create `assets/custom.css`:
```css
/* Custom Whale plugin styles */
.whale-container-card {
    border: 2px solid #4CAF50;
    border-radius: 8px;
    padding: 20px;
    margin: 10px 0;
    background: #f9f9f9;
}

.whale-status-running {
    color: #4CAF50;
    font-weight: bold;
}

.whale-status-stopped {
    color: #f44336;
}
```

2. Register stylesheet in `__init__.py`:
```python
def load(app):
    # ... existing code ...
    
    # Register custom stylesheet
    app.register_blueprint(whale)
    
    @app.context_processor
    def inject_whale_assets():
        return dict(
            whale_css='/plugins/ctfd-whale-master/assets/custom.css'
        )
```

### Backend API Extensions

**Adding Custom Endpoints**:

Create new endpoints in `api.py`:

```python
from flask import Blueprint, request, jsonify
from CTFd.utils.decorators import authed_only

@whale_blueprint.route('/api/v1/whale/custom-action', methods=['POST'])
@authed_only
def custom_action():
    """
    Custom endpoint for extended functionality
    """
    user = get_current_user()
    data = request.get_json()
    
    # Implement custom logic
    result = perform_custom_action(user, data)
    
    return jsonify({
        'success': True,
        'data': result
    })
```

**Modifying Container Lifecycle**:

Extend `utils/control.py` to customize container behavior:

```python
class WhaleContainer:
    """Enhanced container controller"""
    
    def create(self, challenge_id, user_id):
        """
        Custom container creation logic
        """
        # Pre-creation validation
        if not self.validate_resources():
            raise InsufficientResourcesError()
        
        # Create container with custom labels
        container = self.docker_client.services.create(
            image=self.get_challenge_image(challenge_id),
            name=self.generate_container_name(user_id, challenge_id),
            labels={
                'whale.user_id': str(user_id),
                'whale.challenge_id': str(challenge_id),
                'whale.created_at': datetime.now().isoformat(),
                'custom.label': 'custom_value'
            },
            constraints=['node.labels.name=={}'.format(self.node_name)]
        )
        
        # Post-creation hooks
        self.register_container(container)
        self.setup_monitoring(container)
        
        return container
```

### Database Schema Extensions

**Adding Custom Fields**:

Modify `models.py` to extend challenge model:

```python
from CTFd.models import Challenges
from sqlalchemy import Column, Integer, String, Text

class DynamicDockerChallenge(Challenges):
    __tablename__ = 'dynamic_docker_challenge'
    __mapper_args__ = {'polymorphic_identity': 'dynamic_docker'}
    
    id = Column(Integer, ForeignKey('challenges.id'), primary_key=True)
    
    # Existing fields
    docker_image = Column(String(128))
    redirect_type = Column(String(16))
    redirect_port = Column(Integer)
    
    # Custom extensions
    custom_config = Column(Text)  # JSON configuration
    resource_tier = Column(String(16))  # 'small', 'medium', 'large'
    startup_timeout = Column(Integer, default=30)
```

**Migration**:

```python
# Create migration script: migrations/add_custom_fields.py
from CTFd.models import db

def upgrade():
    with db.engine.connect() as conn:
        conn.execute("""
            ALTER TABLE dynamic_docker_challenge 
            ADD COLUMN custom_config TEXT,
            ADD COLUMN resource_tier VARCHAR(16) DEFAULT 'small',
            ADD COLUMN startup_timeout INTEGER DEFAULT 30
        """)

def downgrade():
    with db.engine.connect() as conn:
        conn.execute("""
            ALTER TABLE dynamic_docker_challenge 
            DROP COLUMN custom_config,
            DROP COLUMN resource_tier,
            DROP COLUMN startup_timeout
        """)
```

---

## Challenge Creation

### Challenge Structure

A standard Docker challenge consists of:

```
challenge/
├── Dockerfile        # Container build instructions
├── src/             # Application source code
├── flag.php         # Flag placeholder file
└── start.sh         # Container startup script
```

### Flag Replacement Mechanism

The plugin uses a template-based flag replacement system:

**1. Define Flag Placeholder** (`flag.php`):
```php
<?php
$flag = "{{flag}}";  // Note: lowercase 'flag'
```

**2. Replacement Script** (`start.sh`):
```bash
#!/bin/sh

# Replace flag placeholder with actual flag
sed -i "s/{{flag}}/$FLAG/g" /var/www/html/flag.php

# Clear environment variables (security)
export FLAG="cleared"
unset FLAG

# Start service (must run in foreground)
httpd -D FOREGROUND
```

**Important Notes**:
- Use lowercase `{{flag}}` as placeholder
- Match case between placeholder and sed command
- Clear FLAG environment variable after replacement
- Run service in foreground mode to keep container alive

### Example Challenge: Web Application

**Directory Structure**:
```
web-challenge/
├── Dockerfile
├── index.php
├── flag.php
├── config.php
└── start.sh
```

**Dockerfile**:
```dockerfile
FROM php:7.4-apache

# Install dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy application files
COPY src/ /var/www/html/
COPY flag.php /var/www/html/
COPY start.sh /start.sh

# Set permissions
RUN chmod +x /start.sh && \
    chown -R www-data:www-data /var/www/html

# Expose port
EXPOSE 80

# Set entrypoint
CMD ["/start.sh"]
```

**index.php**:
```php
<?php
session_start();
require_once 'config.php';
require_once 'flag.php';

// Challenge logic
if (isset($_POST['answer']) && $_POST['answer'] === 'correct_answer') {
    echo "Congratulations! Flag: " . $flag;
} else {
    echo "Try again!";
}
?>
```

**start.sh**:
```bash
#!/bin/bash

# Replace flag in all PHP files
find /var/www/html -name "*.php" -exec sed -i "s/{{flag}}/$FLAG/g" {} \;

# Clear environment
export FLAG="cleared"
unset FLAG

# Remove startup script
rm -f /start.sh

# Start Apache in foreground
apache2-foreground
```

### Example Challenge: PWN Binary

**Directory Structure**:
```
pwn-challenge/
├── Dockerfile
├── challenge.c
├── Makefile
├── flag.txt
└── start.sh
```

**Dockerfile**:
```dockerfile
FROM ubuntu:20.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    socat \
    && rm -rf /var/lib/apt/lists/*

# Create user
RUN useradd -m ctf

# Copy files
COPY challenge /home/ctf/challenge
COPY flag.txt /home/ctf/flag.txt
COPY start.sh /start.sh

# Set permissions
RUN chmod +x /start.sh /home/ctf/challenge && \
    chmod 400 /home/ctf/flag.txt && \
    chown -R ctf:ctf /home/ctf

# Expose port
EXPOSE 9999

CMD ["/start.sh"]
```

**flag.txt**:
```
{{flag}}
```

**start.sh**:
```bash
#!/bin/bash

# Replace flag
sed -i "s/{{flag}}/$FLAG/g" /home/ctf/flag.txt

# Clear environment
export FLAG="cleared"
unset FLAG

# Run service with socat
cd /home/ctf
socat TCP-LISTEN:9999,reuseaddr,fork EXEC:./challenge,stderr
```

### Building and Testing Challenges

**Build Docker Image**:
```bash
# Navigate to challenge directory
cd /path/to/challenge

# Build image
docker build -t challenge-name:latest .

# Verify image
docker images | grep challenge-name
```

**Local Testing**:
```bash
# Run container with test flag
docker run -d \
  -p 8080:80 \
  -e FLAG="flag{test_flag_123}" \
  --name test-challenge \
  challenge-name:latest

# Test access
curl http://localhost:8080

# View logs
docker logs test-challenge

# Clean up
docker stop test-challenge
docker rm test-challenge
```

**Deploy to CTFd**:

1. Push image to registry or keep locally
2. Create challenge in CTFd admin panel:
   - Type: `dynamic_docker`
   - Docker Image: `challenge-name:latest`
   - Redirect Type: `direct-http` (for web) or `direct` (for pwn)
   - Redirect Port: `80` (for web) or `9999` (for pwn)

---

## Troubleshooting

### Common Issues

**Issue 1: Container Fails to Start**

Symptoms:
```
docker service ls
# Shows 0/1 replicas
```

Diagnosis:
```bash
# Check service status
SERVICE_ID=$(docker service ls -q | head -1)
docker service ps $SERVICE_ID --no-trunc

# Check service logs
docker service logs $SERVICE_ID

# Verify node labels
NODE_NAME=$(docker node ls --format "{{.Hostname}}" | head -1)
docker node inspect $NODE_NAME --format '{{ .Spec.Labels }}'
```

Solution:
```bash
# Add missing node label
docker node update --label-add name=$NODE_NAME $NODE_NAME

# Verify Whale configuration
docker exec ctfd-db-1 mysql -uctfd -pctfd -D ctfd -e \
  "SELECT value FROM config WHERE \`key\` = 'whale:docker_swarm_nodes';"

# Should match your node name
```

**Issue 2: Cannot Access Challenge**

Symptoms: Container running but HTTP request times out

Diagnosis:
```bash
# Check if port is listening
netstat -tlnp | grep 10001

# Test local access
curl http://localhost:10001

# Check firewall
sudo ufw status
# or
sudo firewall-cmd --list-all
```

Solution:
```bash
# Open ports
sudo ufw allow 10000:10100/tcp

# Or for firewalld
sudo firewall-cmd --add-port=10000-10100/tcp --permanent
sudo firewall-cmd --reload

# Verify container network
docker service inspect <service_id> --format '{{json .Endpoint}}'
```

**Issue 3: FRP Connection Failed**

Symptoms:
```
[W] [service.go:97] login to server failed
```

Diagnosis:
```bash
# Check FRP server status
sudo systemctl status frps

# Check FRP server logs
sudo journalctl -u frps -n 50

# Verify token consistency
grep token /usr/local/frp/frps.ini
grep token /opt/CTFd/conf/frp/frpc.ini

# Test FRP Admin API
curl http://localhost:7400/api/status
```

Solution:
```bash
# Ensure tokens match
# Edit frps.ini
sudo vim /usr/local/frp/frps.ini
# Set: token = YOUR_SECURE_TOKEN

# Edit frpc.ini
vim /opt/CTFd/conf/frp/frpc.ini
# Set: token = YOUR_SECURE_TOKEN (same as above)

# Restart services
sudo systemctl restart frps
docker compose restart frpc
```

**Issue 4: Database Connection Error**

Symptoms:
```
sqlalchemy.exc.OperationalError: Can't connect to MySQL server
```

Solution:
```bash
# Check database container
docker compose ps db

# Wait for database to be ready
docker compose logs db | grep "ready for connections"

# Test connection
docker exec ctfd-db-1 mysql -uctfd -pctfd -e "SELECT 1;"

# Restart CTFd
docker compose restart ctfd
```

### Health Check Script

```bash
#!/bin/bash
# whale_health_check.sh

echo "=== Whale Plugin Health Check ==="

# Check Docker
if docker ps &>/dev/null; then
    echo "[OK] Docker is running"
else
    echo "[FAIL] Docker is not accessible"
fi

# Check Swarm
if docker info 2>/dev/null | grep -q "Swarm: active"; then
    echo "[OK] Docker Swarm is active"
    NODE=$(docker node ls --format "{{.Hostname}}" | head -1)
    echo "  Node: $NODE"
else
    echo "[FAIL] Docker Swarm is not initialized"
fi

# Check network
if docker network ls | grep -q "ctfd_frp-containers"; then
    echo "[OK] FRP containers network exists"
else
    echo "[FAIL] FRP containers network not found"
fi

# Check services
cd /opt/CTFd
SERVICES=$(docker compose ps --services --filter "status=running" | wc -l)
echo "[INFO] Running services: $SERVICES/5"

# Check FRP
if curl -s http://localhost:7400/api/status &>/dev/null; then
    echo "[OK] FRP Admin API is accessible"
else
    echo "[WARN] FRP Admin API not accessible"
fi

echo "=== Check Complete ==="
```

---

## API Reference

### RESTful Endpoints

**Base URL**: `/api/v1/whale`

#### Get Container Status

```http
GET /api/v1/whale/container?challenge_id={id}
```

Response:
```json
{
  "success": true,
  "data": {
    "container_id": "abc123",
    "status": "running",
    "access_url": "http://192.168.1.100:10001",
    "remaining_time": 3456
  }
}
```

#### Start Container

```http
POST /api/v1/whale/container
Content-Type: application/json

{
  "challenge_id": 1
}
```

Response:
```json
{
  "success": true,
  "data": {
    "container_id": "abc123",
    "access_url": "http://192.168.1.100:10001"
  }
}
```

#### Stop Container

```http
DELETE /api/v1/whale/container?challenge_id={id}
```

Response:
```json
{
  "success": true,
  "message": "Container stopped successfully"
}
```

#### List User Containers

```http
GET /api/v1/whale/containers
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "challenge_id": 1,
      "challenge_name": "Web Challenge",
      "container_id": "abc123",
      "status": "running",
      "access_url": "http://192.168.1.100:10001",
      "created_at": "2025-11-15T10:30:00Z"
    }
  ]
}
```

### Admin Endpoints

**Base URL**: `/api/v1/whale/admin`

#### List All Containers

```http
GET /api/v1/whale/admin/containers
Authorization: Bearer {admin_token}
```

#### Force Stop Container

```http
DELETE /api/v1/whale/admin/container/{container_id}
Authorization: Bearer {admin_token}
```

---

## Production Deployment

### Security Hardening

**1. Change Default Passwords**:
```bash
# Database password
vim docker-compose.yml
# Update MARIADB_ROOT_PASSWORD, MARIADB_PASSWORD

# FRP token
vim /usr/local/frp/frps.ini
vim conf/frp/frpc.ini
# Update token to strong random value: openssl rand -hex 32
```

**2. Enable HTTPS**:
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

**3. Configure Firewall**:
```bash
# UFW (Ubuntu/Debian)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 7897/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 10000:10100/tcp
sudo ufw enable

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=7897/tcp
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=10000-10100/tcp
sudo firewall-cmd --reload
```

**4. Implement Rate Limiting**:

Edit `conf/nginx/http.conf`:
```nginx
http {
    limit_req_zone $binary_remote_addr zone=ctfd:10m rate=10r/s;
    
    server {
        location / {
            limit_req zone=ctfd burst=20 nodelay;
            proxy_pass http://app_servers;
        }
    }
}
```

### Performance Optimization

**1. Increase Worker Processes**:

Edit `docker-compose.yml`:
```yaml
ctfd:
  environment:
    - WORKERS=4  # Adjust based on CPU cores
```

**2. Configure Resource Limits**:
```yaml
ctfd:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '1'
        memory: 1G
```

**3. Enable Caching**:

Configure Redis for session storage and caching. Already enabled in default configuration.

**4. Database Optimization**:
```bash
# Edit database configuration
docker exec -it ctfd-db-1 bash

# Create custom config
cat > /etc/mysql/conf.d/custom.cnf << 'EOF'
[mysqld]
innodb_buffer_pool_size = 1G
max_connections = 200
query_cache_size = 64M
query_cache_limit = 2M
EOF

# Restart database
docker compose restart db
```

### Monitoring

**1. Container Metrics**:
```bash
# Real-time stats
docker stats

# Service stats
docker service ls

# Container logs
docker compose logs -f
```

**2. Application Logs**:
```bash
# CTFd logs
docker compose logs ctfd -f

# FRP logs
sudo journalctl -u frps -f

# Nginx logs
docker compose exec nginx tail -f /var/log/nginx/access.log
```

**3. Resource Monitoring**:

Install monitoring tools:
```bash
# Install node_exporter (Prometheus)
# Install cadvisor (container metrics)
# Setup Grafana dashboards
```

### Backup and Recovery

**1. Database Backup**:
```bash
# Manual backup
docker exec ctfd-db-1 mysqldump -uctfd -pctfd ctfd > ctfd_backup_$(date +%Y%m%d).sql

# Automated backup script
cat > /usr/local/bin/backup_ctfd.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/backups/ctfd
mkdir -p $BACKUP_DIR
docker exec ctfd-db-1 mysqldump -uctfd -pctfd ctfd | gzip > $BACKUP_DIR/ctfd_$(date +%Y%m%d_%H%M%S).sql.gz
find $BACKUP_DIR -name "ctfd_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup_ctfd.sh

# Setup cron
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup_ctfd.sh
```

**2. File Backup**:
```bash
# Backup uploads and configuration
tar -czf ctfd_data_$(date +%Y%m%d).tar.gz \
  .data/CTFd/uploads \
  conf/
```

**3. Restore**:
```bash
# Restore database
docker exec -i ctfd-db-1 mysql -uctfd -pctfd ctfd < backup.sql

# Restore files
tar -xzf ctfd_data_backup.tar.gz
```

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

Original Whale Plugin: https://github.com/frankli0324/ctfd-whale

---

## Support

For issues, questions, or contributions:

- **GitHub Issues**: https://github.com/fpclose/ctfd_3.8.1_whale/issues
- **Documentation**: See `deployment/` directory for detailed guides
- **Example Challenges**: See `deployment/examples/` directory

---

## Acknowledgments

- CTFd Team: https://github.com/CTFd/CTFd
- Original Whale Plugin Author: https://github.com/frankli0324/ctfd-whale
- FRP Project: https://github.com/fatedier/frp
- Docker: https://www.docker.com/

---

**Version**: 2.0 Enhanced  
**Last Updated**: 2025-11-15  
**Maintainer**: fpclose  
**Repository**: https://github.com/fpclose/ctfd_3.8.1_whale
