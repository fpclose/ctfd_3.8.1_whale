# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-15

### Added

#### Core Features
- Automated installation script (600+ lines) for one-click deployment
- Complete deployment solution with Docker, Swarm, and FRP configuration
- Configuration templates for docker-compose, FRP server, FRP client, and Nginx
- Example challenge (xiaolansa) with complete source code and WriteUp
- Comprehensive documentation suite (README, DEPLOYMENT_README, DEVELOPMENT_CHANGES)
- Support for three access types: HTTP, Direct-HTTP, and Direct (TCP)
- Dynamic flag generation and replacement mechanism
- Resource management with CPU and memory limits
- Automatic container cleanup and timeout handling

#### Documentation
- Complete English technical documentation (README.md)
- Detailed deployment and usage guide (DEPLOYMENT_README.md)
- Secondary development documentation (DEVELOPMENT_CHANGES.md)
- Chinese quick start guide (README_CN.md)
- Contributing guidelines (CONTRIBUTING.md)
- API reference documentation
- Troubleshooting guide

#### DevOps
- Automated dependency installation
- Docker Swarm initialization and configuration
- Network setup (ctfd_frp-containers)
- Service health checks and validation
- Monitoring and logging setup
- Backup and recovery procedures

### Fixed

#### Critical Bugs
- DNS resolution issue preventing CTFd from connecting to database
- FRP Admin API "Unable to access frpc admin api" error
- Container startup and destruction failures
- Flag placeholder replacement not working
- Network communication issues between containers

#### Configuration Issues
- Docker Compose network configuration
- FRP read-only volume mount preventing dynamic configuration
- Missing FRP server vhost_http_port and subdomain_host settings
- Static IP assignment for stable container communication
- Database and Redis connection strings

#### Compatibility Issues
- CTFd 3.8.1 compatibility problems
- Docker Swarm integration issues
- FRP client/server communication
- Nginx proxy configuration
- Admin user team assignment

### Changed

#### Network Architecture
- Migrated from extra_hosts to static IP assignment
- Implemented custom bridge network with defined subnet
- Added FRP containers network (overlay driver)
- Enhanced network isolation for security

#### FRP Configuration
- Changed volume mount from read-only to read-write for dynamic configuration
- Updated FRP server configuration with HTTP virtual hosting support
- Improved FRP Admin API connection handling
- Added retry logic for API requests

#### Docker Configuration
- Optimized docker-compose.yml for production use
- Added resource constraints for containers
- Improved service dependency management
- Enhanced logging configuration

#### Database Schema
- Updated team assignment for admin users
- Improved container status tracking
- Enhanced flag management

### Security

#### Enhancements
- Network isolation between services and dynamic containers
- Firewall configuration guidelines
- HTTPS setup with Let's Encrypt
- Rate limiting for API endpoints
- Security hardening checklist

#### Best Practices
- Changed default passwords documentation
- FRP token generation with strong randomness
- Database password management
- Container resource limits

### Performance

#### Optimizations
- Increased worker processes configuration
- Redis caching for session storage
- Database query optimization
- Resource allocation improvements

#### Monitoring
- Container metrics collection
- Application log aggregation
- Resource usage monitoring
- Service health checks

### Documentation

#### Improvements
- Complete API reference with examples
- Step-by-step deployment guide
- Challenge creation tutorial
- Troubleshooting procedures
- Production deployment checklist

#### Examples
- Complete PHP challenge with HTTP Referer validation
- Dockerfile best practices
- start.sh script template
- Flag replacement examples

## [1.0.0] - Original Release

### Initial Features
- Basic Docker container management
- FRP integration
- Dynamic challenge support
- CTFd 3.x compatibility (limited)

---

## Upgrade Guide

### From v1.0 to v2.0

#### Prerequisites
1. Backup your current installation
2. Export existing challenges and configurations
3. Stop all services

#### Migration Steps

1. **Backup Database**:
```bash
docker exec ctfd-db-1 mysqldump -uctfd -pctfd ctfd > backup.sql
```

2. **Update Plugin**:
```bash
cd /opt/CTFd/CTFd/plugins/
rm -rf ctfd-whale-master
git clone https://github.com/fpclose/ctfd_3.8.1_whale.git ctfd-whale-master
```

3. **Run Installation Script**:
```bash
cd ctfd-whale-master
sudo ./install_whale.sh
```

4. **Update Configuration**:
- Navigate to Admin > Plugins > Whale
- Update FRP API URL to: `http://172.19.0.10:7400`
- Verify Docker Swarm node name: `linux-1`
- Check port range: `10000-10100`

5. **Restart Services**:
```bash
cd /opt/CTFd
docker compose down
docker compose up -d
```

6. **Verify Installation**:
```bash
# Check services
docker compose ps

# Check Swarm
docker node ls

# Check network
docker network ls | grep frp-containers

# Test FRP API
curl http://172.19.0.10:7400/api/status
```

#### Breaking Changes

1. **Network Configuration**:
   - Changed from `extra_hosts` to static IP assignment
   - New network: `ctfd_frp-containers` (overlay driver)
   - Updated FRP API URL

2. **FRP Configuration**:
   - Volume mount changed from read-only to read-write
   - New FRP server settings required

3. **Challenge Configuration**:
   - Access type configuration moved to challenge settings
   - Container image specification updated

#### Data Migration

No database schema changes. Existing challenges and users will work without modification.

#### Rollback Procedure

If issues occur:

1. **Stop Services**:
```bash
cd /opt/CTFd
docker compose down
```

2. **Restore Old Plugin**:
```bash
cd /opt/CTFd/CTFd/plugins/
rm -rf ctfd-whale-master
# Restore from backup
```

3. **Restore Database**:
```bash
docker exec -i ctfd-db-1 mysql -uctfd -pctfd ctfd < backup.sql
```

4. **Restart**:
```bash
docker compose up -d
```

---

## Support

For issues, questions, or contributions:
- **GitHub Issues**: https://github.com/fpclose/ctfd_3.8.1_whale/issues
- **Documentation**: See README.md and DEPLOYMENT_README.md
- **Email**: lsszuishuai@gmail.com

---

**Repository**: https://github.com/fpclose/ctfd_3.8.1_whale  
**Maintainer**: fpclose  
**License**: MIT

