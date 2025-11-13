# Cloud-CV Cost Optimization

## S3 Costs

- **Storage Class**: Standard for active content
- **Lifecycle**: Move to IA after 30 days
- **Compression**: Gzip compression enabled
- **CDN**: CloudFront reduces S3 requests

### Cost Breakdown
- **Storage**: ~$0.023 per GB/month
- **Requests**: ~$0.0004 per 1,000 GET requests
- **Data Transfer**: ~$0.09 per GB (first 10 TB)

## Lambda Costs

- **Memory**: Optimized for 128MB
- **Timeout**: 30-second limit
- **Cold Start**: Minimized with provisioned concurrency
- **Monitoring**: Cost tracking enabled

### Cost Breakdown
- **Requests**: First 1M requests free, then $0.20 per 1M
- **Compute**: $0.0000166667 per GB-second
- **Example**: 1M requests at 128MB, 100ms = ~$0.21

## DynamoDB Costs

- **Billing**: Pay-per-request model
- **Capacity**: No provisioned capacity
- **Indexes**: No GSI required
- **Backup**: Point-in-time recovery

### Cost Breakdown
- **On-Demand**: $1.25 per million write units, $0.25 per million read units
- **Storage**: $0.25 per GB/month
- **Backup**: $0.20 per GB/month

## CloudFront Costs

- **Edge Locations**: Global distribution
- **Cache**: Optimized cache policies
- **Compression**: Gzip compression
- **HTTPS**: Free SSL certificates

### Cost Breakdown
- **Data Transfer Out**: $0.085 per GB (first 10 TB)
- **Requests**: $0.0075 per 10,000 HTTPS requests
- **Invalidation**: First 1,000 paths/month free

## Total Monthly Cost Estimate

### Low Traffic Scenario (1,000 visitors/month)
- **S3**: ~$0.50 (storage + requests)
- **Lambda**: ~$0.10 (executions)
- **DynamoDB**: ~$0.25 (requests)
- **CloudFront**: ~$1.00 (data transfer)
- **Total**: ~$1.85/month

### Medium Traffic Scenario (10,000 visitors/month)
- **S3**: ~$1.00
- **Lambda**: ~$0.50
- **DynamoDB**: ~$0.50
- **CloudFront**: ~$2.00
- **Total**: ~$4.00/month

### High Traffic Scenario (100,000 visitors/month)
- **S3**: ~$2.00
- **Lambda**: ~$2.00
- **DynamoDB**: ~$2.00
- **CloudFront**: ~$5.00
- **Total**: ~$11.00/month

## Cost Optimization Strategies

1. **Right-Sizing**: Optimize Lambda memory allocation
2. **Caching**: Maximize CloudFront cache hit ratio
3. **Compression**: Enable Gzip compression
4. **Lifecycle Policies**: Move old data to cheaper storage
5. **Monitoring**: Track costs with AWS Cost Explorer
6. **Reserved Capacity**: Not applicable for serverless

## Cost Monitoring

### AWS Cost Explorer
- **Daily Costs**: Track spending trends
- **Service Breakdown**: Per-service costs
- **Forecasting**: Predict future costs
- **Budget Alerts**: Set spending limits

### CloudWatch Billing Alarms
```hcl
resource "aws_cloudwatch_metric_alarm" "billing" {
  alarm_name          = "cloud-cv-billing-alert"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = 86400
  statistic           = "Maximum"
  threshold           = 10
  alarm_description   = "Alert when monthly costs exceed $10"
}
```

