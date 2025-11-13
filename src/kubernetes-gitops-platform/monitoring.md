# Kubernetes GitOps Platform Monitoring & Observability

## Monitoring Stack

### Prometheus Configuration

Prometheus collects metrics from:
- **Kubernetes Pods**: Application metrics via annotations
- **Kubernetes Nodes**: Node-level metrics via node-exporter
- **Kubernetes Objects**: Cluster state via kube-state-metrics
- **Services**: Service discovery and scraping

### Key Metrics Collected

#### Application Metrics
- Request rate and latency
- Error rates and status codes
- Resource utilization (CPU, memory)
- Custom business metrics

#### Infrastructure Metrics
- Node CPU, memory, disk usage
- Pod resource consumption
- Network traffic and bandwidth
- Storage utilization

#### Kubernetes Metrics
- Deployment status and replicas
- Pod status and restarts
- Service endpoints
- HPA scaling events

### Grafana Dashboards

#### Pre-configured Dashboards
- **Kubernetes Cluster Overview**: Cluster health and resource usage
- **Online Boutique Dashboard**: Microservices metrics and performance
- **Node Exporter**: Node-level system metrics
- **Kube State Metrics**: Kubernetes object state

#### Custom Dashboards
```json
{
  "dashboard": {
    "title": "Online Boutique Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "{{service}}"
          }
        ]
      }
    ]
  }
}
```

## Logging Stack

### Loki Configuration

Loki aggregates logs from all pods:
- **Efficient Storage**: Indexed by labels, not log content
- **Prometheus-inspired**: Similar query language
- **Grafana Integration**: Native Grafana data source

### Promtail Configuration

Promtail collects logs:
- **DaemonSet**: Runs on every node
- **Automatic Discovery**: Discovers pods automatically
- **Metadata Enrichment**: Adds Kubernetes labels
- **Log Shipping**: Sends logs to Loki

### Log Queries

```logql
# Query logs by service
{namespace="online-boutique", service="cartservice"}

# Filter by log level
{namespace="online-boutique"} |= "error"

# Count errors
count_over_time({namespace="online-boutique"} |= "error" [5m])
```

## Testing & Validation

### Sanity Test Monitoring

**Purpose**: Automated health check testing
- Tests all microservices every 60 seconds
- Tracks response times and errors
- Provides REST API for status
- Web UI dashboard for results

**Metrics Tracked**:
- Total test runs
- Pass/fail counts
- Response times per service
- Error rates

### Availability Test Monitoring

**Purpose**: SRE-style availability testing
- Real user workflow simulation
- Tests every 5 minutes
- Calculates uptime percentage
- Tracks consecutive failures

**SRE Metrics**:
- **Uptime %**: Service availability percentage
- **MTTR**: Mean Time To Recovery
- **MTBF**: Mean Time Between Failures
- **Error Budget**: Remaining error budget

## Alerting

### Prometheus Alert Rules
```yaml
groups:
  - name: kubernetes
    rules:
      - alert: HighCPUUsage
        expr: node_cpu_usage > 80
        for: 5m
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
      
      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[5m]) > 0
        for: 5m
        annotations:
          summary: "Pod {{ $labels.pod }} is crash looping"
      
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        annotations:
          summary: "High error rate for {{ $labels.service }}"
```

### Alert Manager Configuration
```yaml
route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
receivers:
  - name: 'default'
    webhook_configs:
      - url: 'http://alertmanager:9093/api/v1/alerts'
  - name: 'critical-alerts'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#alerts'
```

## Observability Best Practices

### 1. **Comprehensive Instrumentation**
- Instrument all services with metrics
- Use consistent metric naming
- Include business metrics
- Track custom events

### 2. **Structured Logging**
- Use structured log format (JSON)
- Include correlation IDs
- Log at appropriate levels
- Include context information

### 3. **Dashboard Design**
- Create service-specific dashboards
- Include key SLIs and SLOs
- Show trends over time
- Enable drill-down capabilities

### 4. **Alert Tuning**
- Set appropriate thresholds
- Avoid alert fatigue
- Use alert grouping
- Include runbook links

### 5. **Log Retention**
- Configure retention policies
- Archive old logs
- Compress stored logs
- Monitor storage usage

## Key Performance Indicators (KPIs)

### Application KPIs
- **Request Rate**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Latency**: P50, P95, P99 response times
- **Availability**: Uptime percentage

### Infrastructure KPIs
- **CPU Utilization**: Average and peak usage
- **Memory Utilization**: Memory consumption
- **Network Throughput**: Bytes per second
- **Storage Usage**: Disk space utilization

### Platform KPIs
- **Deployment Frequency**: Deployments per day
- **Lead Time**: Time from commit to production
- **MTTR**: Mean Time To Recovery
- **Change Failure Rate**: Percentage of failed deployments

