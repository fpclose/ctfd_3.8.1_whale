# Security Policy

## Supported Versions

The following versions of CTFd Whale Plugin are currently being supported with security updates:

| Version | Supported          | CTFd Version |
| ------- | ------------------ | ------------ |
| 2.0.x   | :white_check_mark: | 3.8.1        |
| 1.x     | :x:                | 3.x          |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these guidelines:

### Please DO:

1. **Report privately**: Email security concerns to lsszuishuai@gmail.com
2. **Include details**: Provide detailed information about the vulnerability
3. **Allow time**: Give us reasonable time to respond before public disclosure
4. **Coordinate**: Work with us on coordinated disclosure

### Please DON'T:

1. **Public disclosure**: Don't publicly disclose the vulnerability before we've had a chance to address it
2. **Exploit**: Don't exploit the vulnerability beyond what's necessary to demonstrate the issue
3. **Test on production**: Don't test vulnerabilities on production systems that you don't own

## What to Include in Your Report

When reporting a vulnerability, please include:

1. **Description**: Clear description of the vulnerability
2. **Impact**: Potential impact and severity
3. **Reproduction Steps**: Detailed steps to reproduce the issue
4. **Proof of Concept**: Code or screenshots demonstrating the vulnerability
5. **Suggested Fix**: If you have ideas for fixing the issue
6. **Your Contact**: How we can reach you for follow-up

### Example Report Format

```markdown
**Vulnerability Type**: [e.g., SQL Injection, XSS, CSRF]

**Affected Component**: [e.g., Container Management API, Admin Panel]

**Severity**: [Critical/High/Medium/Low]

**Description**:
[Detailed description of the vulnerability]

**Impact**:
[What an attacker could do with this vulnerability]

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Proof of Concept**:
[Code, screenshots, or detailed explanation]

**Suggested Fix**:
[If applicable, suggestions for remediation]

**Environment**:
- CTFd Version: [e.g., 3.8.1]
- Whale Plugin Version: [e.g., 2.0]
- Browser: [if applicable]
```

## Response Timeline

- **Initial Response**: Within 48 hours of receipt
- **Status Update**: Within 7 days with an assessment
- **Fix Development**: Depending on severity and complexity
- **Public Disclosure**: Coordinated with reporter

### Severity Levels

**Critical**
- Remote code execution
- Authentication bypass
- Full system compromise
- Response time: Immediate (within 24 hours)

**High**
- Privilege escalation
- SQL injection
- Sensitive data exposure
- Response time: Within 3 days

**Medium**
- XSS vulnerabilities
- CSRF vulnerabilities
- Information disclosure
- Response time: Within 7 days

**Low**
- Minor information leaks
- Low-impact bugs
- Response time: Within 14 days

## Security Best Practices

### For Administrators

1. **Keep Updated**
   - Always use the latest version of the plugin
   - Subscribe to security updates
   - Monitor GitHub for security advisories

2. **Secure Configuration**
   - Change all default passwords
   - Use strong, unique passwords
   - Enable HTTPS with valid certificates
   - Configure firewall rules properly

3. **Access Control**
   - Limit admin access
   - Use strong authentication
   - Implement rate limiting
   - Monitor logs for suspicious activity

4. **Network Security**
   - Isolate container networks
   - Use private networks where possible
   - Configure proper firewall rules
   - Monitor network traffic

5. **Regular Backups**
   - Backup databases regularly
   - Test restoration procedures
   - Store backups securely
   - Keep backups off-site

### For Challenge Creators

1. **Container Security**
   - Use minimal base images
   - Don't include unnecessary tools
   - Run containers as non-root users
   - Limit container resources

2. **Flag Security**
   - Use dynamic flag generation
   - Don't hardcode flags
   - Use secure flag formats
   - Validate flag inputs

3. **Code Security**
   - Sanitize all inputs
   - Avoid common vulnerabilities
   - Test challenges thoroughly
   - Review dependencies for vulnerabilities

### For Developers

1. **Code Review**
   - All code changes must be reviewed
   - Security-sensitive changes require extra scrutiny
   - Use static analysis tools
   - Follow secure coding guidelines

2. **Dependency Management**
   - Keep dependencies updated
   - Audit dependencies regularly
   - Use only trusted sources
   - Pin dependency versions

3. **Testing**
   - Write security tests
   - Test edge cases
   - Perform penetration testing
   - Use fuzzing when appropriate

## Known Security Considerations

### Docker Security

1. **Container Isolation**
   - Containers share the host kernel
   - Proper resource limits are essential
   - Network isolation is crucial

2. **Docker Socket Access**
   - Never expose Docker socket to containers
   - Use Docker Swarm API instead
   - Limit API access with TLS

### FRP Security

1. **Token-Based Authentication**
   - FRP uses token-based authentication
   - Use strong, randomly generated tokens
   - Rotate tokens periodically

2. **Network Exposure**
   - FRP exposes ports to the internet
   - Configure firewall rules appropriately
   - Monitor for unauthorized access

### Database Security

1. **Credentials**
   - Use strong database passwords
   - Limit database user privileges
   - Don't expose database ports

2. **Data Protection**
   - Encrypt sensitive data
   - Use prepared statements
   - Implement proper access controls

## Security Updates

Security updates will be announced through:

1. **GitHub Security Advisories**: https://github.com/fpclose/ctfd_3.8.1_whale/security/advisories
2. **GitHub Releases**: https://github.com/fpclose/ctfd_3.8.1_whale/releases
3. **Email**: To reporters and affected users

## Bug Bounty

Currently, this project does not have a formal bug bounty program. However, we deeply appreciate security researchers who responsibly disclose vulnerabilities and will:

- Publicly acknowledge contributors (with permission)
- Credit researchers in release notes
- Coordinate disclosure timing

## Compliance

This project aims to follow:

- OWASP Top 10 guidelines
- CWE/SANS Top 25 most dangerous software errors
- Docker security best practices
- Container security guidelines

## Questions

For security-related questions that are not vulnerabilities:

- Open a GitHub Discussion
- Email: lsszuishuai@gmail.com
- Mark your inquiry as "Security Question"

## Legal

We believe in responsible disclosure and will:

- Not pursue legal action against security researchers
- Work cooperatively with reporters
- Provide credit for discoveries (with permission)
- Coordinate public disclosure

---

**Last Updated**: 2025-11-15  
**Contact**: lsszuishuai@gmail.com  
**Repository**: https://github.com/fpclose/ctfd_3.8.1_whale  
**PGP Key**: [Not currently available]

