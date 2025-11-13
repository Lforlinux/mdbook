# Opensource-LLM-RAG-Stack Security & Best Practices

## Container Security

### Image Security
- **Official Images**: Use official, maintained images
- **Version Pinning**: Pin specific image versions
- **Regular Updates**: Keep images updated
- **Vulnerability Scanning**: Scan images for vulnerabilities

### Network Security
```yaml
networks:
  rag-network:
    driver: bridge
    internal: false  # Set to true for isolated network

# Service-specific network configuration
services:
  postgres:
    networks:
      - rag-network
    # No external ports exposed
```

## Data Security

### Database Security
```sql
-- Create read-only user
CREATE USER readonly_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE chatdb TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Encrypt sensitive data
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt password column
ALTER TABLE users ADD COLUMN password_encrypted BYTEA;
```

### Environment Variables
```yaml
# Use Docker secrets for sensitive data
services:
  postgres:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
    secrets:
      - postgres_password

secrets:
  postgres_password:
    file: ./secrets/postgres_password.txt
```

## Access Control

### API Security
```python
from functools import wraps
from flask import request, jsonify
import jwt

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        except:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated_function
```

### Rate Limiting
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/chat')
@limiter.limit("10 per minute")
@require_auth
def chat():
    # Chat endpoint with rate limiting
    pass
```

## Security Best Practices

### 1. **Secrets Management**
- Use Docker secrets or environment files
- Never commit secrets to Git
- Rotate secrets regularly
- Use different secrets per environment

### 2. **Network Isolation**
- Isolate services in Docker networks
- Limit exposed ports
- Use reverse proxy for external access
- Implement firewall rules

### 3. **Data Encryption**
- Encrypt data at rest (PostgreSQL)
- Encrypt data in transit (TLS/SSL)
- Encrypt sensitive fields in database
- Use secure key management

### 4. **Access Control**
- Implement authentication
- Use role-based access control (RBAC)
- Enforce least privilege principle
- Audit access logs

### 5. **Vulnerability Management**
- Regular security updates
- Scan for vulnerabilities
- Patch promptly
- Monitor security advisories

## Production Security Checklist

- [ ] Change all default passwords
- [ ] Enable TLS/SSL for all services
- [ ] Configure firewall rules
- [ ] Set up authentication
- [ ] Enable audit logging
- [ ] Configure backup encryption
- [ ] Implement rate limiting
- [ ] Set up intrusion detection
- [ ] Regular security audits
- [ ] Incident response plan
