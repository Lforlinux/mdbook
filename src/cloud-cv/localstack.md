# Cloud-CV Local Development with LocalStack

## What is LocalStack?

LocalStack is a fully functional local AWS cloud stack that runs on your machine. It provides:

- **Real AWS APIs**: Use actual AWS SDKs and CLI commands
- **Cost-Free Development**: No AWS charges during development
- **Offline Development**: Works without internet connection
- **Terraform Compatibility**: Works seamlessly with existing Terraform code
- **Realistic Testing**: Closer to production environment than mocks

## Quick Start

### 1. Start LocalStack
```bash
# Start LocalStack development environment
./scripts/local-dev-start.sh start

# Or simply (start is the default)
./scripts/local-dev-start.sh
```

### 2. Upload Frontend Files
```bash
# Upload frontend files to S3
./scripts/local-dev-start.sh upload
```

### 3. Check Status
```bash
# Check LocalStack status
./scripts/local-dev-start.sh status
```

### 4. Stop LocalStack
```bash
# Stop LocalStack when done
./scripts/local-dev-start.sh stop
```

## LocalStack Architecture

### Services Included
- **S3**: Static website hosting
- **DynamoDB**: NoSQL database for visitor counter
- **Lambda**: Serverless visitor counter function
- **API Gateway**: REST API endpoint
- **IAM**: Identity and access management
- **CloudWatch**: Monitoring and logging

### Access URLs
- **Main Website**: http://localhost:4566/cloud-cv-local/index.html
- **S3 Browser**: http://localhost:4566/cloud-cv-local/
- **Health Check**: http://localhost:4566/_localstack/health

## Development Workflow

### 1. Start Development Environment
```bash
# Start LocalStack
./scripts/local-dev-start.sh start
```

### 2. Make Changes
```bash
# Edit frontend files
nano frontend/index.html
nano frontend/styles.css
nano frontend/script.js
```

### 3. Upload Changes
```bash
# Upload updated files
./scripts/local-dev-start.sh upload
```

### 4. Test Changes
```bash
# Open browser
open http://localhost:4566/cloud-cv-local/index.html
```

### 5. Stop When Done
```bash
# Stop LocalStack
./scripts/local-dev-start.sh stop
```

## Troubleshooting

### LocalStack Not Starting
```bash
# Check if port 4566 is in use
lsof -i :4566

# Kill process using port
sudo kill -9 $(lsof -t -i:4566)

# Start LocalStack again
./scripts/local-dev-start.sh start
```

### Container Conflicts
```bash
# Remove existing containers
docker rm -f localstack

# Start fresh
./scripts/local-dev-start.sh start
```

### AWS CLI Issues
```bash
# Check AWS credentials
aws configure list

# Set LocalStack endpoint
export AWS_ENDPOINT_URL=http://localhost:4566

# Test S3 access
aws s3 ls --endpoint-url=http://localhost:4566
```

## Security

### LocalStack Credentials
```bash
# Default LocalStack credentials
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_DEFAULT_REGION=us-east-1
```

### Network Isolation
- LocalStack runs in Docker container
- Isolated from host network
- No external access required
- Safe for development

