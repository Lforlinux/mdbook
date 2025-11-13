# Cloud-CV Monitoring & Observability

## CloudWatch Metrics

### Lambda Metrics
- **Invocations**: Number of function invocations
- **Errors**: Error count and error rate
- **Duration**: Execution time
- **Throttles**: Concurrent execution limits

### DynamoDB Metrics
- **Read/Write Capacity**: Throughput metrics
- **Throttling**: Throttled requests
- **Consistent Reads**: Strongly consistent reads
- **Item Count**: Table size metrics

### CloudFront Metrics
- **Requests**: Total request count
- **Cache Hit Ratio**: CDN efficiency
- **Data Transfer**: Bandwidth usage
- **Error Rates**: 4xx and 5xx errors

### S3 Metrics
- **Request Metrics**: GET, PUT, DELETE requests
- **Storage Metrics**: Bucket size
- **Data Transfer**: Bandwidth usage

## Custom Metrics

```python
# Lambda function with custom metrics
import boto3
from datetime import datetime

cloudwatch = boto3.client('cloudwatch')

def put_custom_metric(metric_name, value, unit='Count'):
    cloudwatch.put_metric_data(
        Namespace='CloudCV/VisitorCounter',
        MetricData=[
            {
                'MetricName': metric_name,
                'Value': value,
                'Unit': unit,
                'Timestamp': datetime.utcnow()
            }
        ]
    )

# Usage in Lambda
def lambda_handler(event, context):
    # ... visitor counter logic ...
    
    # Send custom metric
    put_custom_metric('VisitorCount', new_count)
    put_custom_metric('APIResponseTime', response_time, 'Milliseconds')
    
    return response
```

## Logging Strategy

### Lambda Logs
- **CloudWatch Logs**: Automatic log collection
- **Log Levels**: INFO, WARNING, ERROR
- **Structured Logging**: JSON format
- **Log Retention**: 30 days default

### API Gateway Logs
- **Access Logs**: Request/response logging
- **Execution Logs**: API execution details
- **Error Logs**: Error tracking

### CloudFront Logs
- **Access Logs**: Request logging
- **Real-time Logs**: Stream to CloudWatch
- **Log Analysis**: Query with CloudWatch Insights

## Alerting

### CloudWatch Alarms
```hcl
# Lambda error rate alarm
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "cloud-cv-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Alert when Lambda errors exceed 5"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
```

### Alert Conditions
- **Error Rate**: > 5% error rate
- **Latency**: > 1 second response time
- **Availability**: < 99% uptime
- **Cost**: Unusual cost spikes

## Dashboards

### CloudWatch Dashboard
- **Service Health**: Overall system status
- **Performance Metrics**: Response times and throughput
- **Error Tracking**: Error rates and types
- **Cost Monitoring**: Resource usage and costs

### Key Metrics to Monitor
1. Lambda invocation count and errors
2. DynamoDB read/write capacity
3. CloudFront cache hit ratio
4. API Gateway latency
5. S3 request metrics

