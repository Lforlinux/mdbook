# Cloud-CV Advanced Topics

## Multi-Environment Strategy

```hcl
# Environment-specific configurations
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

# Environment-specific tags
locals {
  common_tags = {
    Environment = var.environment
    Project     = "Cloud-CV"
    Owner       = "SRE-DevOps-Engineer"
  }
}

# Environment-specific resource naming
resource "aws_s3_bucket" "website" {
  bucket = "cloud-cv-${var.environment}-${random_id.bucket_suffix.hex}"
  
  tags = merge(local.common_tags, {
    Name = "cloud-cv-${var.environment}"
  })
}
```

## Blue-Green Deployment

```yaml
# Blue-green deployment strategy
- name: Deploy to Blue Environment
  run: |
    terraform apply -var="environment=blue"
    
- name: Test Blue Environment
  run: |
    curl -f https://blue.cloud-cv.com/health
    
- name: Switch to Blue
  run: |
    aws route53 change-resource-record-sets \
      --hosted-zone-id ZONE_ID \
      --change-batch file://blue-deployment.json
```

## Canary Deployment

```yaml
# Canary deployment with CloudFront
- name: Deploy Canary
  run: |
    aws cloudfront create-distribution \
      --distribution-config file://canary-config.json
    
- name: Monitor Canary
  run: |
    aws cloudwatch get-metric-statistics \
      --namespace AWS/CloudFront \
      --metric-name Requests \
      --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
      --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
      --period 300 \
      --statistics Sum
```

## Chaos Engineering

```python
# Chaos engineering for resilience testing
import boto3
import random
import time

def chaos_test():
    """
    Simulate various failure scenarios
    """
    lambda_client = boto3.client('lambda')
    dynamodb = boto3.resource('dynamodb')
    
    # Simulate Lambda failures
    def simulate_lambda_failure():
        # Inject errors randomly
        if random.random() < 0.1:  # 10% failure rate
            raise Exception("Simulated Lambda failure")
    
    # Test DynamoDB throttling
    def test_dynamodb_throttling():
        table = dynamodb.Table('cloud-cv-visitor-counter')
        # Rapid requests to trigger throttling
        for i in range(100):
            try:
                table.get_item(Key={'id': 'visitor_count'})
            except Exception as e:
                print(f"Throttling detected: {e}")
    
    # Verify CloudFront fallback
    def verify_cloudfront_fallback():
        # Test CDN behavior under load
        pass
    
    # Check error handling
    def check_error_handling():
        # Verify graceful degradation
        pass
    
    return {
        'lambda_failures': simulate_lambda_failure(),
        'dynamodb_throttling': test_dynamodb_throttling(),
        'cloudfront_fallback': verify_cloudfront_fallback(),
        'error_handling': check_error_handling()
    }
```

## Performance Optimization

### Frontend Optimization
```javascript
// Frontend performance optimization
class PerformanceOptimizer {
    constructor() {
        this.enableLazyLoading();
        this.optimizeImages();
        this.enableCaching();
        this.minimizeRequests();
    }
    
    enableLazyLoading() {
        // Lazy load images and scripts
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    optimizeImages() {
        // WebP format with fallbacks
        const supportsWebP = document.createElement('canvas')
            .toDataURL('image/webp').indexOf('data:image/webp') === 0;
        
        if (supportsWebP) {
            // Use WebP images
        }
    }
    
    enableCaching() {
        // Service worker for offline support
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
        }
    }
    
    minimizeRequests() {
        // Combine API calls
        // Use request batching
    }
}
```

### Backend Optimization
```python
# Lambda optimization
import json
import boto3
from functools import lru_cache

# Cache DynamoDB client
@lru_cache(maxsize=1)
def get_dynamodb_table():
    dynamodb = boto3.resource('dynamodb')
    return dynamodb.Table('cloud-cv-visitor-counter')

# Optimize Lambda handler
def lambda_handler(event, context):
    # Reuse connections
    table = get_dynamodb_table()
    
    # Batch operations
    # Minimize API calls
    # Use connection pooling
    
    return response
```

## Infrastructure as Code Best Practices

### Module Structure
```hcl
# modules/s3/main.tf
resource "aws_s3_bucket" "this" {
  bucket = var.bucket_name
  
  tags = var.tags
}

# modules/s3/variables.tf
variable "bucket_name" {
  description = "S3 bucket name"
  type        = string
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}

# modules/s3/outputs.tf
output "bucket_id" {
  description = "S3 bucket ID"
  value       = aws_s3_bucket.this.id
}
```

### State Management
```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "cloud-cv-terraform-state"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

## Security Hardening

### Secrets Management
```hcl
# Use AWS Secrets Manager
data "aws_secretsmanager_secret_version" "api_key" {
  secret_id = "cloud-cv-api-key"
}

resource "aws_lambda_function" "visitor_counter" {
  environment {
    variables = {
      API_KEY = data.aws_secretsmanager_secret_version.api_key.secret_string
    }
  }
}
```

### Network Security
```hcl
# VPC configuration for Lambda (if needed)
resource "aws_lambda_function" "visitor_counter" {
  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [aws_security_group.lambda.id]
  }
}
```

## Monitoring and Alerting

### Advanced Monitoring
```hcl
# Custom CloudWatch dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "cloud-cv-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", {"stat": "Sum"}],
            ["AWS/Lambda", "Errors", {"stat": "Sum"}],
            ["AWS/DynamoDB", "ConsumedReadCapacityUnits", {"stat": "Sum"}],
            ["AWS/DynamoDB", "ConsumedWriteCapacityUnits", {"stat": "Sum"}]
          ]
          period = 300
          stat   = "Sum"
          region = "us-east-1"
          title  = "Cloud CV Metrics"
        }
      }
    ]
  })
}
```

