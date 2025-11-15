# Contributing to CTFd Whale Plugin

Thank you for your interest in contributing to the CTFd Whale Plugin! This document provides guidelines for contributing to this project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Development Setup](#development-setup)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Reporting Bugs](#reporting-bugs)
8. [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project adheres to a code of conduct that all participants are expected to uphold. Please be respectful and constructive in all interactions.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Environment details**: OS, Docker version, CTFd version
- **Logs and screenshots** if applicable

Example:

```markdown
**Title**: Container fails to start on Ubuntu 22.04

**Description**:
When attempting to start a dynamic challenge container, the container fails with error X.

**Steps to Reproduce**:
1. Navigate to challenge page
2. Click "Start Container"
3. Error appears

**Expected**: Container starts successfully
**Actual**: Error message "Unable to start container"

**Environment**:
- OS: Ubuntu 22.04 LTS
- Docker: 24.0.7
- CTFd: 3.8.1
- Whale Plugin: 2.0

**Logs**:
[Attach relevant logs]
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When suggesting an enhancement:

- Use a clear and descriptive title
- Provide a detailed description of the proposed feature
- Explain why this enhancement would be useful
- Include examples of how it would work

## Development Setup

### Prerequisites

- Linux system (Ubuntu 20.04+ recommended)
- Docker 20.10+
- Docker Compose v2+
- Python 3.8+
- Git

### Setup Instructions

1. **Fork and Clone**:

```bash
git clone https://github.com/YOUR_USERNAME/ctfd_3.8.1_whale.git
cd ctfd_3.8.1_whale
```

2. **Install CTFd for Testing**:

```bash
# Clone CTFd
git clone https://github.com/CTFd/CTFd.git --depth=1 --branch=3.8.1
cd CTFd

# Create plugin directory
mkdir -p CTFd/plugins/ctfd-whale-master

# Link your development version
ln -s $(pwd)/../* CTFd/plugins/ctfd-whale-master/
```

3. **Setup Docker Environment**:

```bash
# Initialize Swarm
docker swarm init

# Create network
docker network create --driver overlay --attachable ctfd_frp-containers

# Label node
docker node update --label-add='name=linux-1' $(docker node ls -q)
```

4. **Install Dependencies**:

```bash
pip install -r requirements.txt
```

5. **Start CTFd**:

```bash
cd CTFd
docker compose up -d
```

## Coding Standards

### Python Code Style

Follow PEP 8 guidelines:

```python
# Good
def start_container(challenge_id, user_id):
    """Start a container for the given challenge and user.
    
    Args:
        challenge_id (int): The challenge ID
        user_id (int): The user ID
        
    Returns:
        dict: Container information
    """
    container = DockerUtils.create_container(challenge_id, user_id)
    return container

# Bad
def startContainer(challengeID,userID):
    c=DockerUtils.createContainer(challengeID,userID)
    return c
```

### JavaScript Code Style

Use modern ES6+ syntax:

```javascript
// Good
async function startContainer(challengeId) {
    try {
        const response = await fetch(`/api/v1/whale/container`, {
            method: 'POST',
            body: JSON.stringify({ challenge_id: challengeId })
        });
        return await response.json();
    } catch (error) {
        console.error('Failed to start container:', error);
    }
}

// Bad
function startContainer(challengeId) {
    $.post('/api/v1/whale/container', {challenge_id: challengeId}, function(data) {
        return data;
    });
}
```

### Shell Script Style

Follow these guidelines:

```bash
#!/bin/bash
# Good: Use functions, error handling, and clear variable names

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly LOG_FILE="/var/log/whale_install.log"

log_info() {
    echo "[INFO] $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo "[ERROR] $1" | tee -a "$LOG_FILE" >&2
}

install_docker() {
    if command -v docker &> /dev/null; then
        log_info "Docker already installed"
        return 0
    fi
    
    log_info "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
}
```

### Documentation

- Add docstrings to all functions and classes
- Update README.md for feature changes
- Include inline comments for complex logic
- Update API documentation for endpoint changes

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```
feat(container): Add support for GPU-enabled containers

- Added GPU resource allocation
- Updated Docker Swarm configuration
- Added GPU detection in setup script

Closes #123
```

```
fix(frp): Resolve Admin API connection timeout

Fixed issue where FRP Admin API requests would timeout after 5 seconds.
Increased timeout to 30 seconds and added retry logic.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. **Test your changes**:
   - Ensure all existing functionality still works
   - Test new features thoroughly
   - Check for console errors and warnings

2. **Update documentation**:
   - Update README.md if needed
   - Add/update API documentation
   - Update DEVELOPMENT_CHANGES.md for significant changes

3. **Code quality**:
   - Follow coding standards
   - Remove debug code and console.log statements
   - Ensure no linter errors

### Submitting PR

1. **Create a feature branch**:

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes** and commit:

```bash
git add .
git commit -m "feat(scope): your feature description"
```

3. **Push to your fork**:

```bash
git push origin feature/your-feature-name
```

4. **Create Pull Request**:
   - Go to GitHub and create a PR
   - Fill in the PR template
   - Link related issues

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Tested locally
- [ ] All existing tests pass
- [ ] Added new tests (if applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Documentation updated
- [ ] No console errors
- [ ] Commit messages follow guidelines

## Related Issues
Closes #123
Fixes #456

## Screenshots (if applicable)
[Add screenshots]
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited

## Reporting Security Issues

**Do not** open public issues for security vulnerabilities. Instead:

1. Email: lsszuishuai@gmail.com
2. Include detailed description
3. Steps to reproduce
4. Potential impact

## Questions?

Feel free to:
- Open a discussion on GitHub
- Create an issue with the "question" label
- Contact the maintainer: fpclose

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to CTFd Whale Plugin!

**Maintainer**: fpclose  
**Repository**: https://github.com/fpclose/ctfd_3.8.1_whale  
**Last Updated**: 2025-11-15

