# Example Challenge: Blue Shark Secret (小蓝鲨的秘密)

## Challenge Information

**Type**: Web  
**Difficulty**: Easy  
**Category**: HTTP Header Manipulation  

## Challenge Description

This is an example web challenge demonstrating proper flag replacement mechanism and HTTP Referer validation.

## File Structure

```
xiaolansa/
├── Dockerfile          # Container build configuration
├── index.php           # Challenge welcome page
├── get_flag.php        # Flag retrieval page (requires HTTP Referer)
├── flag.php            # Flag placeholder file
└── start.sh            # Container startup script
```

## Setup Instructions

### Build Docker Image

```bash
cd deployment/examples/xiaolansa
docker build -t xiaolansa:latest .
```

### Test Locally

```bash
# Run container with test flag
docker run -d -p 8080:80 \
  -e FLAG="flag{test_flag_12345}" \
  --name test-xiaolansa \
  xiaolansa:latest

# Test access
curl http://localhost:8080/
# Should show welcome page

curl http://localhost:8080/get_flag.php
# Should show access denied

curl -H "Referer: https://www.bluesharkinfo.com/" \
  http://localhost:8080/get_flag.php
# Should return the flag

# Clean up
docker stop test-xiaolansa
docker rm test-xiaolansa
```

### Deploy to CTFd

1. Create challenge in CTFd admin panel
2. Set challenge type to: `dynamic_docker`
3. Configure:
   - Docker Image: `xiaolansa:latest`
   - Redirect Type: `direct-http`
   - Redirect Port: `80`

## Challenge Logic

1. User accesses challenge and gets URL: `http://SERVER_IP:PORT`
2. Accessing `/` shows welcome page with hints
3. Accessing `/get_flag.php` requires HTTP Referer header
4. Valid Referer must contain: `bluesharkinfo.com`
5. Correct Referer returns the flag

## Solution

### Method 1: Using curl

```bash
curl -H "Referer: https://www.bluesharkinfo.com/" \
  http://CHALLENGE_URL/get_flag.php
```

### Method 2: Using Python

```python
import requests

url = "http://CHALLENGE_URL/get_flag.php"
headers = {'Referer': 'https://www.bluesharkinfo.com/'}
response = requests.get(url, headers=headers)
print(response.text)
```

### Method 3: Browser Plugin

1. Install "ModHeader" or similar HTTP header modifier extension
2. Add header: `Referer: https://www.bluesharkinfo.com/`
3. Visit challenge URL

### Method 4: Burp Suite

1. Intercept request to `/get_flag.php`
2. Add header: `Referer: https://www.bluesharkinfo.com/`
3. Forward request

## Technical Details

### Flag Replacement

The challenge uses the standard Whale plugin flag replacement mechanism:

**flag.php**:
```php
<?php
$flag = "{{flag}}";  // Placeholder (lowercase)
```

**start.sh**:
```bash
#!/bin/sh
# Replace flag placeholder
sed -i "s/{{flag}}/$FLAG/g" /var/www/localhost/htdocs/flag.php

# Clear environment variables
export FLAG="flag"
unset FLAG

# Start Apache
httpd -D FOREGROUND
```

### Security Considerations

This challenge demonstrates:
- HTTP header manipulation (common web vulnerability)
- Referer validation bypass
- Environment variable security (clearing $FLAG after use)

### Learning Objectives

- Understanding HTTP request headers
- Learning header manipulation techniques
- Introduction to web security testing tools
- Basic CTF challenge solving methodology

## Notes

- This is a basic example challenge for demonstration purposes
- The Referer check can be easily bypassed (intentionally weak for educational purposes)
- In production challenges, combine multiple security mechanisms
- Always test challenges locally before deployment

