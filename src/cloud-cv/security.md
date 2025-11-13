# Cloud-CV Security & Best Practices

## S3 Security

- **Public Access Block**: All public access blocked
- **Encryption**: Server-side encryption with AES256
- **Versioning**: Enabled for data protection
- **Access Control**: CloudFront OAC for secure access

## Lambda Security

- **IAM Roles**: Least privilege access
- **Environment Variables**: Secure configuration
- **VPC**: Not required for this use case
- **Timeout**: 30-second timeout limit

## API Gateway Security

- **CORS**: Properly configured
- **HTTPS**: Enforced redirect
- **Rate Limiting**: Built-in throttling
- **Authentication**: None required for public API

## DynamoDB Security

- **Encryption**: At rest encryption enabled
- **Access Control**: IAM-based permissions
- **Backup**: Point-in-time recovery
- **Monitoring**: CloudWatch integration

## Infrastructure Security

### IAM Roles and Policies
```hcl
# Lambda execution role
resource "aws_iam_role" "lambda_role" {
  name = "cloud-cv-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Lambda permissions for DynamoDB
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "lambda-dynamodb-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ]
        Resource = aws_dynamodb_table.visitor_counter.arn
      }
    ]
  })
}
```

## Security Best Practices

1. **Defense in Depth**: Multiple security layers
2. **Least Privilege**: Minimal IAM permissions
3. **Encryption**: Data at rest and in transit
4. **Monitoring**: Security event logging
5. **Compliance**: Follow AWS security guidelines
6. **Regular Audits**: Review access and permissions

