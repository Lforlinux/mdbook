# Cloud-CV Technical Q&A

## Architecture & Design Questions

### Q1: "Walk me through the architecture of your Cloud CV project."

**Answer:**
"The Cloud CV project follows a serverless, event-driven architecture. The frontend is hosted on S3 with CloudFront for global distribution. The visitor counter uses a Lambda function triggered by API Gateway, which stores data in DynamoDB. This design provides scalability, cost-effectiveness, and high availability.

Key components:
- **Frontend**: S3 + CloudFront for static hosting
- **API**: API Gateway for REST endpoints
- **Compute**: Lambda for serverless processing
- **Database**: DynamoDB for NoSQL storage
- **Infrastructure**: Terraform for IaC
- **CI/CD**: GitHub Actions for automation"

### Q2: "Why did you choose serverless over containers?"

**Answer:**
"Serverless was chosen for several reasons:
1. **Cost**: Pay only for actual usage, not idle time
2. **Scalability**: Automatic scaling based on demand
3. **Maintenance**: No server management required
4. **Performance**: Cold start latency is acceptable for this use case
5. **Simplicity**: Easier deployment and monitoring

For a simple visitor counter, serverless provides the right balance of cost, performance, and operational overhead."

### Q3: "How would you handle high traffic spikes?"

**Answer:**
"Several strategies:
1. **CloudFront**: Global CDN with edge caching
2. **Lambda**: Auto-scaling up to 1000 concurrent executions
3. **DynamoDB**: On-demand billing with auto-scaling
4. **API Gateway**: Built-in throttling and caching
5. **Monitoring**: CloudWatch alarms for proactive scaling

The architecture is designed to handle traffic spikes automatically without manual intervention."

## Infrastructure Questions

### Q4: "Explain your Terraform configuration."

**Answer:**
"The Terraform configuration follows best practices:
- **Modularity**: Reusable components
- **State Management**: Local state with backup
- **Security**: IAM roles with least privilege
- **Tagging**: Consistent resource tagging
- **Variables**: Environment-specific configurations

Key resources:
- S3 bucket with versioning and encryption
- CloudFront distribution with OAC
- Lambda function with IAM role
- DynamoDB table with on-demand billing
- API Gateway with CORS configuration"

### Q5: "How do you ensure infrastructure security?"

**Answer:**
"Multiple security layers:
1. **S3**: Public access blocked, encryption at rest
2. **CloudFront**: OAC for secure S3 access
3. **Lambda**: IAM roles with minimal permissions
4. **DynamoDB**: Encryption and access control
5. **API Gateway**: HTTPS enforcement and CORS
6. **Terraform**: State file security and access control"

## DevOps Questions

### Q6: "Describe your CI/CD pipeline."

**Answer:**
"The pipeline uses GitHub Actions:
1. **Trigger**: Push to main branch
2. **Infrastructure**: Terraform plan and apply
3. **Deployment**: S3 file upload
4. **Cache**: CloudFront invalidation
5. **Monitoring**: Health checks and alerts

Benefits:
- Automated deployment
- Infrastructure consistency
- Rollback capability
- Cost tracking"

### Q7: "How do you handle rollbacks?"

**Answer:**
"Multiple rollback strategies:
1. **Infrastructure**: Terraform state management
2. **Application**: S3 versioning for file rollback
3. **Database**: DynamoDB point-in-time recovery
4. **Cache**: CloudFront cache invalidation
5. **Monitoring**: CloudWatch for health checks

The process is automated and can be triggered manually or automatically based on health metrics."

## Monitoring Questions

### Q8: "How do you monitor the application?"

**Answer:**
"Comprehensive monitoring strategy:
1. **Metrics**: CloudWatch for all services
2. **Logs**: Centralized logging with CloudWatch
3. **Alerts**: Proactive alerting for issues
4. **Dashboards**: Real-time monitoring
5. **Tracing**: X-Ray for distributed tracing

Key metrics:
- Lambda invocations and errors
- DynamoDB read/write capacity
- CloudFront cache hit ratio
- API Gateway latency and errors"

### Q9: "What would you do if the visitor counter stopped working?"

**Answer:**
"Troubleshooting steps:
1. **Check CloudWatch**: Lambda logs and metrics
2. **Verify API**: Test API Gateway endpoint
3. **Database**: Check DynamoDB connectivity
4. **Permissions**: Verify IAM roles
5. **Network**: Check VPC and security groups

Common issues:
- Lambda timeout or memory issues
- DynamoDB throttling
- API Gateway CORS problems
- IAM permission errors"

## Cost Optimization Questions

### Q10: "How do you optimize costs?"

**Answer:**
"Cost optimization strategies:
1. **S3**: Lifecycle policies and compression
2. **Lambda**: Memory optimization and timeout tuning
3. **DynamoDB**: On-demand billing and efficient queries
4. **CloudFront**: Cache optimization and compression
5. **Monitoring**: Cost alerts and budget tracking

Expected monthly costs:
- S3: ~$1-2 for storage
- Lambda: ~$0.50 for executions
- DynamoDB: ~$0.25 for requests
- CloudFront: ~$1-2 for data transfer
- Total: ~$3-5 per month"

## Advanced Questions

### Q11: "How would you scale this to handle 1 million visitors per day?"

**Answer:**
"Scaling strategies:
1. **Lambda**: Increase concurrency limits
2. **DynamoDB**: Enable auto-scaling
3. **CloudFront**: Optimize cache policies
4. **Monitoring**: Enhanced alerting
5. **Architecture**: Consider read replicas

Additional considerations:
- Database sharding for high write loads
- Caching strategies for read-heavy workloads
- CDN optimization for global distribution
- Cost analysis for high-traffic scenarios"

### Q12: "How would you implement disaster recovery?"

**Answer:**
"DR strategy:
1. **Backup**: S3 cross-region replication
2. **Database**: DynamoDB point-in-time recovery
3. **Infrastructure**: Multi-region Terraform
4. **Monitoring**: Cross-region health checks
5. **Testing**: Regular DR drills

Recovery time objective: < 1 hour
Recovery point objective: < 15 minutes"

