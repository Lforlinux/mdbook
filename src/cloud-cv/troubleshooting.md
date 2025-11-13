# Cloud-CV Troubleshooting Scenarios

## Lambda Function Issues

### Problem: Lambda Timeout
```bash
# Check CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/cloud-cv

# Check function configuration
aws lambda get-function --function-name cloud-cv-visitor-counter

# View recent logs
aws logs tail /aws/lambda/cloud-cv-visitor-counter --follow
```

**Solution:**
- Increase timeout in Terraform configuration
- Optimize code performance
- Check DynamoDB connection
- Review function memory allocation

### Problem: Lambda Memory Issues
```bash
# Check memory usage
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name MemoryUtilization \
  --dimensions Name=FunctionName,Value=cloud-cv-visitor-counter \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Maximum
```

**Solution:**
- Increase Lambda memory allocation
- Optimize code to reduce memory usage
- Check for memory leaks

## API Gateway Issues

### Problem: CORS Errors
```javascript
// Check browser console for CORS errors
// Verify API Gateway CORS configuration
```

**Solution:**
- Update API Gateway CORS settings
- Check Lambda response headers
- Verify preflight OPTIONS method
- Ensure proper Access-Control-Allow-Origin header

### Problem: 502 Bad Gateway
```bash
# Check API Gateway logs
aws apigateway get-rest-apis

# Test endpoint directly
curl -X GET https://api-gateway-url/visitor-count
```

**Solution:**
- Verify Lambda function is deployed
- Check Lambda function permissions
- Review API Gateway integration settings
- Check Lambda function logs

## CloudFront Issues

### Problem: Cache Not Updating
```bash
# Create cache invalidation
aws cloudfront create-invalidation \
  --distribution-id DISTRIBUTION_ID \
  --paths "/*"

# Check invalidation status
aws cloudfront list-invalidations --distribution-id DISTRIBUTION_ID
```

**Solution:**
- Invalidate CloudFront cache
- Check cache policies
- Verify origin settings
- Review TTL configurations

### Problem: 403 Forbidden Errors
```bash
# Check S3 bucket policy
aws s3api get-bucket-policy --bucket cloud-cv-bucket

# Verify CloudFront OAC
aws cloudfront get-distribution --id DISTRIBUTION_ID
```

**Solution:**
- Verify S3 bucket permissions
- Check CloudFront Origin Access Control
- Review bucket policy
- Ensure proper IAM roles

## DynamoDB Issues

### Problem: Throttling Errors
```bash
# Check DynamoDB metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ThrottledRequests \
  --dimensions Name=TableName,Value=cloud-cv-visitor-counter \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

**Solution:**
- Enable auto-scaling
- Optimize read/write patterns
- Consider provisioned capacity
- Implement exponential backoff

### Problem: Item Not Found
```bash
# Check table items
aws dynamodb scan --table-name cloud-cv-visitor-counter

# Verify table structure
aws dynamodb describe-table --table-name cloud-cv-visitor-counter
```

**Solution:**
- Verify table name in Lambda environment
- Check item key structure
- Review DynamoDB permissions
- Ensure table exists

## S3 Issues

### Problem: 404 Not Found
```bash
# List bucket contents
aws s3 ls s3://cloud-cv-bucket/

# Check bucket configuration
aws s3api get-bucket-website --bucket cloud-cv-bucket
```

**Solution:**
- Verify files are uploaded
- Check file paths
- Review bucket website configuration
- Ensure index.html exists

### Problem: Access Denied
```bash
# Check bucket policy
aws s3api get-bucket-policy --bucket cloud-cv-bucket

# Verify IAM permissions
aws iam get-user-policy --user-name USER_NAME --policy-name POLICY_NAME
```

**Solution:**
- Review bucket policy
- Check IAM permissions
- Verify CloudFront OAC
- Ensure proper access controls

## Common Debugging Commands

```bash
# Check all resources
aws cloudformation describe-stacks

# View Lambda logs
aws logs tail /aws/lambda/cloud-cv-visitor-counter --follow

# Test API endpoint
curl -X GET https://api-gateway-url/visitor-count

# Check CloudFront distribution
aws cloudfront get-distribution --id DISTRIBUTION_ID

# Verify DynamoDB table
aws dynamodb describe-table --table-name cloud-cv-visitor-counter

# Check S3 bucket
aws s3 ls s3://cloud-cv-bucket/ --recursive
```

