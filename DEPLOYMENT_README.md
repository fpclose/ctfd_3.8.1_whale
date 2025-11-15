# CTFd 3.8.1 Whale Plugin - Complete Package

**Version**: 2.0 Enhanced Edition  
**Date**: 2025-11-15  
**Author**: fpclose  

---

## Project Overview

This package contains a fully functional and enhanced version of the CTFd Whale plugin, specifically adapted for CTFd 3.8.1. It includes automated installation scripts, comprehensive documentation, and production-ready configurations.

### What's Included

```
ctfd-3.8.1-whale/
├── README.md                    # Main plugin documentation
├── DEPLOYMENT_README.md         # This file - deployment guide
├── DEVELOPMENT_CHANGES.md       # Secondary development details
├── install_whale.sh             # One-click installation script
│
├── Plugin Code/
│   ├── __init__.py              # Plugin entry point
│   ├── api.py                   # RESTful API endpoints
│   ├── challenge_type.py        # Challenge type definition
│   ├── models.py                # Database models
│   ├── decorators.py            # Custom decorators
│   ├── assets/                  # Frontend resources
│   ├── templates/               # HTML templates
│   └── utils/                   # Backend utilities
│
└── deployment/
    ├── templates/               # Configuration templates
    │   ├── docker-compose.template.yml
    │   ├── frps.template.ini
    │   ├── frpc.template.ini
    │   └── nginx.template.conf
    └── examples/
        └── xiaolansa/           # Example challenge
```

---

## Quick Deployment (5-10 Minutes)

### Prerequisites

- Linux server (Ubuntu 20.04+, Debian 11+, CentOS 8+)
- Minimum 4GB RAM, 2 CPU cores
- Root or sudo access
- Internet connection

### One-Command Installation

```bash
# 1. Copy this entire directory to /opt/CTFd/CTFd/plugins/
cd /home/fpclose
cp -r ctfd-3.8.1-whale /opt/CTFd/CTFd/plugins/ctfd-whale-master

# 2. Run installation script
cd /opt/CTFd/CTFd/plugins/ctfd-whale-master
chmod +x install_whale.sh
sudo ./install_whale.sh

# 3. Follow the prompts
# - Enter server IP address
# - Enter Docker Swarm node name
# - Other configurations auto-generated

# 4. Wait 5-10 minutes for completion

# 5. Access CTFd
# http://YOUR_SERVER_IP
```

---

## Manual Deployment

### Step 1: Install Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo systemctl start docker
sudo systemctl enable docker

# Verify
docker --version
docker compose version
```

### Step 2: Initialize Docker Swarm

```bash
# Initialize
docker swarm init

# Add node label (required)
NODE_NAME=$(docker node ls --format "{{.Hostname}}" | head -1)
docker node update --label-add name=$NODE_NAME $NODE_NAME
```

### Step 3: Create Docker Network

```bash
docker network create \
  --driver overlay \
  --attachable \
  --subnet 10.0.0.0/24 \
  ctfd_frp-containers
```

### Step 4: Install FRP Server

```bash
# Create directory
sudo mkdir -p /usr/local/frp
cd /usr/local/frp

# Download FRP
wget https://github.com/fatedier/frp/releases/download/v0.52.3/frp_0.52.3_linux_amd64.tar.gz
tar -xzf frp_0.52.3_linux_amd64.tar.gz
mv frp_0.52.3_linux_amd64/* .

# Create config
cat > frps.ini << 'EOF'
[common]
bind_addr = 0.0.0.0
bind_port = 7897
token = YOUR_SECURE_TOKEN
vhost_http_port = 8080
subdomain_host = YOUR_SERVER_IP.xip.io
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

# Start service
sudo systemctl daemon-reload
sudo systemctl start frps
sudo systemctl enable frps
```

### Step 5: Deploy CTFd

```bash
# Clone CTFd
cd /opt
git clone https://github.com/CTFd/CTFd.git
cd CTFd && git checkout 3.8.1

# Install plugin
cd CTFd/plugins
cp -r /home/fpclose/ctfd-3.8.1-whale ctfd-whale-master

# Create directories
cd /opt/CTFd
mkdir -p conf/{nginx,frp} .data/{CTFd/{logs,uploads},mysql,redis}

# Copy configuration templates
cp CTFd/plugins/ctfd-whale-master/deployment/templates/* conf/

# Edit configurations
# - conf/nginx/http.conf
# - conf/frp/frpc.ini
# - docker-compose.yml

# Start services
docker compose up -d
```

---

## Configuration

### Whale Plugin Settings

Access: http://YOUR_IP/admin → Plugins → ctfd-whale → Settings

**Docker Configuration**:
- Docker API URL: `unix:///var/run/docker.sock`
- Docker Swarm Nodes: `YOUR_NODE_NAME`
- Auto Connect Network: `ctfd_frp-containers`
- CPU Limit: `0.5`
- Memory Limit: `256m`

**FRP Configuration**:
- FRP API URL: `http://172.19.0.10:7400`
- FRP Direct IP: `YOUR_SERVER_IP`
- Direct Port Min: `10000`
- Direct Port Max: `10100`

**Database Configuration** (automatic via install script):
```sql
INSERT INTO config (`key`, value) VALUES
  ('whale:docker_api_url', 'unix:///var/run/docker.sock'),
  ('whale:docker_swarm_nodes', 'YOUR_NODE_NAME'),
  ('whale:frp_api_url', 'http://172.19.0.10:7400'),
  ('whale:frp_direct_ip_address', 'YOUR_SERVER_IP'),
  ('whale:auto_connect_network', 'ctfd_frp-containers')
ON DUPLICATE KEY UPDATE value=VALUES(value);
```

---

## Usage Guide

### For Administrators

**Creating Challenges**:

1. Login to CTFd admin panel
2. Navigate to Challenges → Create Challenge
3. Select type: `dynamic_docker`
4. Configure:
   - Docker Image: `your-image:latest`
   - Redirect Type: `direct-http` (for web) or `direct` (for pwn)
   - Redirect Port: `80` (for web) or `9999` (for pwn)
5. Save challenge

**Monitoring**:

```bash
# View running containers
docker service ls

# View logs
docker compose logs -f ctfd

# Check FRP status
curl http://localhost:7400/api/status

# View container logs
docker service logs <service_id>
```

**Management Commands**:

```bash
# Restart CTFd
docker compose restart ctfd

# Force stop all challenge containers
docker service rm $(docker service ls -q)

# View database
docker exec ctfd-db-1 mysql -uctfd -pctfd -D ctfd
```

### For Challenge Creators

**Challenge Structure**:

```
challenge/
├── Dockerfile        # Container definition
├── src/             # Application files
├── flag.php         # Flag placeholder: {{flag}}
└── start.sh         # Startup script
```

**Example start.sh**:

```bash
#!/bin/sh
# Replace flag
sed -i "s/{{flag}}/$FLAG/g" /app/flag.php

# Clear environment
export FLAG="cleared"
unset FLAG

# Start service (foreground)
apache2-foreground
```

**Building and Testing**:

```bash
# Build image
docker build -t challenge-name:latest .

# Test locally
docker run -d -p 8080:80 \
  -e FLAG="flag{test}" \
  challenge-name:latest

# Test access
curl http://localhost:8080

# Deploy to CTFd
# Use challenge-name:latest as Docker Image
```

### For Participants

**Using Challenges**:

1. Access CTFd platform
2. Select a challenge
3. Click "Launch Instance"
4. Wait 10-30 seconds for container deployment
5. Access provided URL:
   - Web: `http://SERVER_IP:10001`
   - PWN: `nc SERVER_IP 10001`
6. Complete challenge and submit flag
7. Click "Destroy" to stop container

---

## Architecture

### Network Topology

```
Internet
   │
   ▼
Nginx (80) ──────┐
                 │
                 ▼
            CTFd (8000)
         ┌───────┼───────┐
         ▼       ▼       ▼
      MariaDB  Redis  Docker Swarm
                          │
                    ┌─────┴─────┐
                    ▼           ▼
                Challenge   Challenge
                Container   Container
                    │           │
                    └─────┬─────┘
                          ▼
                    FRP Client (7400)
                          │
                          ▼
                    FRP Server (7897)
                          │
                          ▼
                      Internet
```

### IP Addressing

**Internal Network (172.19.0.0/16)**:
- Gateway: 172.19.0.1
- Redis: 172.19.0.2
- MariaDB: 172.19.0.3
- CTFd: 172.19.0.4
- Nginx: 172.19.0.5
- FRP Client: 172.19.0.10

**Dynamic Container Network (10.0.0.0/24)**:
- Overlay network managed by Docker Swarm
- Challenge containers auto-assigned

---

## Troubleshooting

### Container Won't Start

**Symptom**: Service shows 0/1 replicas

**Solution**:
```bash
# Check node labels
docker node inspect $(docker node ls -q) --format '{{ .Spec.Labels }}'

# Add label if missing
NODE_NAME=$(docker node ls --format "{{.Hostname}}" | head -1)
docker node update --label-add name=$NODE_NAME $NODE_NAME

# Verify Whale config
docker exec ctfd-db-1 mysql -uctfd -pctfd -D ctfd -e \
  "SELECT value FROM config WHERE \`key\` = 'whale:docker_swarm_nodes';"
```

### Cannot Access Challenge

**Symptom**: Connection timeout or refused

**Solution**:
```bash
# Open firewall ports
sudo ufw allow 10000:10100/tcp

# Or for firewalld
sudo firewall-cmd --add-port=10000-10100/tcp --permanent
sudo firewall-cmd --reload

# Check if port is listening
netstat -tlnp | grep 10001
```

### FRP Connection Failed

**Symptom**: FRP login failed

**Solution**:
```bash
# Verify tokens match
grep token /usr/local/frp/frps.ini
grep token /opt/CTFd/conf/frp/frpc.ini

# Restart services
sudo systemctl restart frps
docker compose restart frpc
```

### Database Connection Error

**Symptom**: Can't connect to MySQL server

**Solution**:
```bash
# Wait for database ready
docker compose logs db | grep "ready for connections"

# Test connection
docker exec ctfd-db-1 mysql -uctfd -pctfd -e "SELECT 1;"

# Restart CTFd
docker compose restart ctfd
```

---

## Production Checklist

### Security

- [ ] Change default database password
- [ ] Change FRP token to strong random value
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall rules
- [ ] Limit Docker API access
- [ ] Set strong CTFd admin password
- [ ] Configure rate limiting in Nginx

### Performance

- [ ] Adjust worker count based on CPU cores
- [ ] Set appropriate resource limits
- [ ] Enable Redis persistence
- [ ] Configure database connection pool
- [ ] Set up CDN for static assets
- [ ] Monitor resource usage

### Monitoring

- [ ] Configure log rotation
- [ ] Set up health checks
- [ ] Monitor disk space
- [ ] Track container metrics
- [ ] Set up alerts for failures

### Backup

- [ ] Database backup (daily recommended)
- [ ] Upload files backup
- [ ] Configuration files backup
- [ ] Test restore procedure

---

## Maintenance

### Backup Commands

```bash
# Database
docker exec ctfd-db-1 mysqldump -uctfd -pctfd ctfd | \
  gzip > backup_$(date +%Y%m%d).sql.gz

# Files
tar -czf uploads_$(date +%Y%m%d).tar.gz .data/CTFd/uploads/

# Configuration
tar -czf config_$(date +%Y%m%d).tar.gz conf/
```

### Update Procedures

```bash
# Update plugin
cd /opt/CTFd/CTFd/plugins/ctfd-whale-master
git pull
docker compose restart ctfd

# Update CTFd
cd /opt/CTFd
docker compose down
git pull
git checkout 3.8.x
docker compose build
docker compose up -d
```

---

## Support

### Documentation

- **Main README**: `README.md` - Complete plugin documentation
- **Development Changes**: `DEVELOPMENT_CHANGES.md` - Secondary development details
- **This Guide**: `DEPLOYMENT_README.md` - Deployment procedures

### Getting Help

- GitHub Issues: https://github.com/fpclose/ctfd_3.8.1_whale/issues
- GitHub Repository: https://github.com/fpclose/ctfd_3.8.1_whale
- Author: fpclose
- CTFd Documentation: https://docs.ctfd.io/
- FRP Documentation: https://github.com/fatedier/frp

### Example Challenge

See `deployment/examples/xiaolansa/` for a complete working example with:
- Dockerfile
- PHP application files
- Flag replacement mechanism
- Technical documentation

---

## License

MIT License - See LICENSE file for details

Original Whale Plugin: https://github.com/frankli0324/ctfd-whale

---

**Deployment Date**: 2025-11-15  
**Tested Environment**: Ubuntu 22.04, Docker 24.0, CTFd 3.8.1  
**Package Maintainer**: fpclose

