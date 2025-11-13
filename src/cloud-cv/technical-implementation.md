# Cloud-CV Technical Implementation

## Frontend Implementation

### HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lekshmi Kolappan - Site Reliability Engineer</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <!-- Header with profile information -->
        <header class="header">
            <div class="profile-section">
                <div class="profile-image">
                    <img src="profile.jpg" alt="Lekshmi Kolappan">
                </div>
                <div class="profile-info">
                    <h1 class="name">Lekshmi Kolappan</h1>
                    <p class="title">SRE/DevOps Engineer</p>
                </div>
            </div>
        </header>
        
        <!-- Main content sections -->
        <main class="main-content">
            <!-- About, Skills, Experience, Education sections -->
        </main>
        
        <!-- Visitor counter section -->
        <section class="section">
            <h2>Website Statistics</h2>
            <div class="stats-container">
                <div class="stat-item">
                    <div class="stat-number" id="visitor-count">Loading...</div>
                    <div class="stat-label">Total Visitors</div>
                </div>
            </div>
        </section>
    </div>
    
    <script src="script.js"></script>
</body>
</html>
```

### JavaScript API Integration
```javascript
class CloudCV {
    constructor() {
        this.apiUrl = 'https://api-gateway-url/visitor-count';
        this.visitorCount = 0;
        this.init();
    }

    async loadVisitorCount() {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error('HTTP error! status: ' + response.status);
            }

            const data = await response.json();
            this.updateVisitorCount(data.visitor_count);
        } catch (error) {
            console.error('Error loading visitor count:', error);
            this.updateVisitorCount(0);
        }
    }

    updateVisitorCount(count) {
        this.visitorCount = count;
        const countElement = document.getElementById('visitor-count');
        if (countElement) {
            countElement.textContent = count.toLocaleString();
        }
    }
}
```

## Backend Implementation

### Lambda Function (Python)
```python
import json
import boto3
import os
from datetime import datetime
from decimal import Decimal

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('DYNAMODB_TABLE', 'visitor-counter')
table = dynamodb.Table(table_name)

def decimal_default(obj):
    """Convert Decimal objects to int/float for JSON serialization"""
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    raise TypeError

def lambda_handler(event, context):
    """
    Lambda handler for visitor counter API
    """
    try:
        # Handle CORS preflight request
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
                },
                'body': json.dumps({'message': 'CORS preflight'})
            }
        
        # Get current visitor count
        response = table.get_item(Key={'id': 'visitor_count'})
        
        if 'Item' in response:
            current_count = int(response['Item']['count'])
        else:
            current_count = 0
        
        # Increment visitor count
        new_count = current_count + 1
        
        # Update DynamoDB
        table.put_item(
            Item={
                'id': 'visitor_count',
                'count': new_count,
                'last_updated': datetime.utcnow().isoformat(),
                'timestamp': int(datetime.utcnow().timestamp())
            }
        )
        
        # Return response
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'visitor_count': new_count,
                'timestamp': datetime.utcnow().isoformat(),
                'status': 'success'
            }, default=decimal_default)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e),
                'status': 'error'
            }, default=decimal_default)
        }
```

## Infrastructure as Code

### Terraform Configuration
```hcl
# S3 Bucket for static website hosting
resource "aws_s3_bucket" "website" {
  bucket = "cloud-cv-${random_id.bucket_suffix.hex}"
  
  tags = {
    Project     = "Cloud-CV"
    Environment = "production"
    Owner       = "SRE-DevOps-Engineer"
    ManagedBy   = "Terraform"
  }
}

# S3 Bucket versioning
resource "aws_s3_bucket_versioning" "website" {
  bucket = aws_s3_bucket.website.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "website" {
  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id
    origin_id                = "S3-${aws_s3_bucket.website.bucket}"
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Cloud CV Website Distribution"
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods        = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.website.bucket}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  # Error pages
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }
}

# DynamoDB table for visitor counter
resource "aws_dynamodb_table" "visitor_counter" {
  name           = "cloud-cv-visitor-counter"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

# Lambda function for visitor counter
resource "aws_lambda_function" "visitor_counter" {
  filename         = "../lambda/visitor_counter.zip"
  function_name    = "cloud-cv-visitor-counter"
  role            = aws_iam_role.lambda_role.arn
  handler         = "lambda_function.lambda_handler"
  runtime         = "python3.11"
  timeout         = 30

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.visitor_counter.name
    }
  }
}
```

