# Kubernetes GitOps Platform - k6 Performance Testing

## What is k6?

k6 is a modern, developer-centric performance testing tool built by Grafana Labs. It's designed for testing the performance of APIs, microservices, and websites using JavaScript.

### Key Features of k6

- **JavaScript-based**: Write tests in JavaScript (ES6+)
- **Developer-friendly**: Easy to learn and integrate into CI/CD
- **Cloud-native**: Designed for containerized environments
- **Metrics Integration**: Native Prometheus and StatsD support
- **High Performance**: Can generate massive load from a single machine
- **Open Source**: Free and open-source tool

### Why k6 for Kubernetes?

- **Kubernetes-native**: Runs as Kubernetes Jobs
- **Resource Efficient**: Single container can generate high load
- **GitOps Compatible**: Test scripts stored in Git
- **Observability**: Metrics exported to Prometheus
- **Automation**: Can be scheduled via CronJobs

## k6 Implementation in Kubernetes GitOps Platform

### Architecture

```
┌─────────────────┐
│  k6 Test Jobs   │
│  (Kubernetes)   │
└────────┬────────┘
         │
         │ Metrics Export
         │
┌────────▼────────┐    ┌─────────────────┐
│ StatsD Exporter│────│   Prometheus    │
│                │    │                 │
└────────────────┘    └────────┬────────┘
                               │
                               │ Query
                               │
                       ┌───────▼────────┐
                       │    Grafana     │
                       │   Dashboards   │
                       └────────────────┘
```

### Test Types Implemented

#### 1. Smoke Test
**Purpose**: Basic functionality verification with minimal load

```javascript
export const options = {
  stages: [
    { duration: '1m', target: 1 },   // Ramp up to 1 user
    { duration: '2m', target: 1 },   // Stay at 1 user
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% < 2s
    http_req_failed: ['rate<0.01'],     // < 1% errors
  },
};
```

**Use Cases**:
- Quick validation after deployment
- Pre-deployment sanity checks
- CI/CD pipeline integration
- Daily health verification

#### 2. Load Test
**Purpose**: Normal production load testing

```javascript
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp to 50 users
    { duration: '5m', target: 50 },   // Normal load
    { duration: '2m', target: 100 },  // Ramp to 100 users
    { duration: '5m', target: 100 },  // Higher load
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000', 'p(99)<5000'],
    http_req_failed: ['rate<0.05'],
  },
};
```

**Use Cases**:
- Validate performance under expected load
- Capacity planning
- Performance baseline establishment
- SLO validation

#### 3. Stress Test
**Purpose**: Find breaking point and maximum capacity

```javascript
export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 },
    { duration: '5m', target: 300 },
    { duration: '2m', target: 400 },
    { duration: '5m', target: 400 },
    { duration: '2m', target: 500 },
    { duration: '5m', target: 500 },
    { duration: '10m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<10000'],
    http_req_failed: ['rate<0.20'],
  },
};
```

**Use Cases**:
- Find maximum capacity
- Identify bottlenecks
- Test autoscaling limits
- Disaster recovery planning

#### 4. Spike Test
**Purpose**: Test handling of sudden traffic spikes

```javascript
export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '30s', target: 500 },   // Sudden spike
    { duration: '1m', target: 500 },
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 1000 },  // Larger spike
    { duration: '1m', target: 1000 },
    { duration: '30s', target: 10 },
    { duration: '1m', target: 0 },
  ],
};
```

**Use Cases**:
- Validate autoscaling response
- Test rate limiting
- Verify circuit breakers
- Black Friday scenarios

## Test Implementation Details

### Test Structure

Each test script follows this structure:

```javascript
// 1. Import k6 modules
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// 2. Define custom metrics
const errorRate = new Rate('errors');
const frontendErrorRate = new Rate('frontend_errors');
const backendErrorRate = new Rate('backend_errors');

// 3. Configure test options
export const options = {
  stages: [...],
  thresholds: {...},
};

// 4. Main test function
export default function () {
  // Frontend tests (HTTP)
  // Backend tests (health checks)
}

// 5. Summary handler
export function handleSummary(data) {
  return { 'stdout': textSummary(data) };
}
```

### Test Scenarios

#### Frontend Testing
- **Homepage Load**: Tests main page accessibility
- **Product Pages**: Tests product detail pages
- **Error Tracking**: Monitors frontend-specific errors

#### Backend Testing
- **Health Checks**: Validates backend service health
- **Service Integration**: Tests microservice communication
- **Error Tracking**: Monitors backend-specific errors

### Custom Metrics

```javascript
// Custom error rate metrics
const errorRate = new Rate('errors');
const frontendErrorRate = new Rate('frontend_errors');
const backendErrorRate = new Rate('backend_errors');

// Track errors in tests
errorRate.add(!success);
frontendErrorRate.add(!success);
backendErrorRate.add(!success);
```

## Kubernetes Deployment

### Job Configuration

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: k6-load-test
  namespace: performance-testing
spec:
  template:
    spec:
      containers:
      - name: k6
        image: grafana/k6:0.50.0
        command: ["k6", "run"]
        args:
          - "--out"
          - "statsd"
          - "/scripts/k6-load-test.js"
        env:
        - name: TARGET_URL
          value: "http://frontend-external.online-boutique.svc.cluster.local"
        - name: K6_STATSD_ADDR
          value: "statsd-exporter.performance-testing.svc.cluster.local:9125"
        volumeMounts:
        - name: test-scripts
          mountPath: /scripts
      volumes:
      - name: test-scripts
        configMap:
          name: k6-test-scripts
```

### ConfigMap for Test Scripts

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: k6-test-scripts
  namespace: performance-testing
data:
  k6-smoke-test.js: |
    // Test script content
  k6-load-test.js: |
    // Test script content
  k6-stress-test.js: |
    // Test script content
  k6-spike-test.js: |
    // Test script content
```

### Scheduled Testing (CronJob)

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: k6-scheduled-test
  namespace: performance-testing
spec:
  schedule: "0 */6 * * *"  # Every 6 hours
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: k6
            image: grafana/k6:0.50.0
            command: ["k6", "run", "/scripts/k6-smoke-test.js"]
```

## Prometheus Integration

### StatsD Exporter

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: statsd-exporter
  namespace: performance-testing
spec:
  template:
    spec:
      containers:
      - name: statsd-exporter
        image: prom/statsd-exporter:latest
        ports:
        - containerPort: 9125  # StatsD
        - containerPort: 9102  # Prometheus metrics
```

### Metrics Export

k6 exports metrics via StatsD to Prometheus:

```javascript
// k6 configuration
export const options = {
  // Metrics automatically exported to StatsD
  // Then scraped by Prometheus
};
```

### Available Metrics

- `k6_http_reqs_total` - Total HTTP requests
- `k6_http_req_duration_seconds` - Request duration histogram
- `k6_http_req_failed_total` - Failed requests
- `k6_vus` - Current virtual users
- `k6_data_received_total` - Data received
- `k6_data_sent_total` - Data sent
- `k6_iterations_total` - Total test iterations

## Grafana Dashboards

### Official k6 Dashboard

- **Dashboard ID**: `19665`
- **Source**: Grafana Labs official dashboard
- **Features**:
  - Request rate visualization
  - Response time percentiles (p50, p95, p99)
  - Error rate tracking
  - Virtual user count
  - Data transfer metrics

### Custom Dashboard

Custom dashboard includes:
- Test type filtering
- Service-specific metrics
- Threshold visualization
- Historical comparison
- Alert integration

## Running Tests

### Quick Test Execution

```bash
# Run smoke test
./deployment/run-test.sh smoke

# Run load test
./deployment/run-test.sh load

# Run stress test
./deployment/run-test.sh stress

# Run spike test
./deployment/run-test.sh spike
```

### Manual Execution

```bash
# Create test job
kubectl apply -f k8s-manifest/job-load-test.yaml

# Watch logs
kubectl logs -f job/k6-load-test -n performance-testing

# Check results
kubectl get job k6-load-test -n performance-testing
```

### Scheduled Tests

```bash
# Deploy CronJob
kubectl apply -f k8s-manifest/cronjob-scheduled-test.yaml

# View scheduled jobs
kubectl get cronjobs -n performance-testing

# View job history
kubectl get jobs -n performance-testing
```

## Test Results Analysis

### Key Metrics to Monitor

1. **Response Times**
   - p50 (median)
   - p95 (95th percentile)
   - p99 (99th percentile)

2. **Error Rates**
   - HTTP error rate
   - Frontend errors
   - Backend errors

3. **Throughput**
   - Requests per second
   - Successful requests
   - Failed requests

4. **Resource Usage**
   - CPU utilization
   - Memory usage
   - Network bandwidth

### Interpreting Results

**Good Performance**:
```
✓ checks: 100.00%
✓ thresholds: 100.00%
http_req_duration: p95=500ms, p99=800ms
http_req_failed: 0.00%
```

**Performance Issues**:
```
✗ checks: 85.00%
✗ thresholds: 60.00%
http_req_duration: p95=5000ms, p99=10000ms
http_req_failed: 15.00%
```

## Integration with HPA

### Triggering Autoscaling

k6 tests can trigger HPA scaling:

```bash
# Run load test
./deployment/run-test.sh load

# Watch HPA scaling
kubectl get hpa -w

# Watch pod scaling
kubectl get pods -w
```

### Validating Autoscaling

1. **Start Test**: Run k6 load test
2. **Monitor Metrics**: Watch CPU/memory usage
3. **Observe Scaling**: HPA creates new pods
4. **Verify Performance**: Response times remain stable
5. **Scale Down**: After test, pods scale down

## Best Practices

### 1. **Test Design**
- Start with smoke tests
- Progress to load tests
- Use stress tests for capacity planning
- Run spike tests for autoscaling validation

### 2. **Thresholds**
- Set realistic thresholds
- Use percentiles (p95, p99)
- Consider business requirements
- Update based on baseline

### 3. **Test Frequency**
- Smoke tests: After each deployment
- Load tests: Weekly or monthly
- Stress tests: Quarterly
- Spike tests: Before major events

### 4. **Monitoring**
- Export metrics to Prometheus
- Create Grafana dashboards
- Set up alerts
- Track trends over time

### 5. **CI/CD Integration**
- Run smoke tests in CI pipeline
- Block deployments on test failures
- Store test results
- Generate reports

## Troubleshooting

### Test Failures

```bash
# Check job status
kubectl get job k6-load-test -n performance-testing

# View logs
kubectl logs job/k6-load-test -n performance-testing

# Check pod events
kubectl describe job k6-load-test -n performance-testing
```

### Metrics Not Appearing

```bash
# Check StatsD exporter
kubectl get pods -n performance-testing -l app=statsd-exporter

# Check Prometheus scraping
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Access http://localhost:9090/targets

# Verify metrics
# Query: {__name__=~"k6_.*"}
```

### Performance Issues During Tests

```bash
# Check application pods
kubectl get pods -n online-boutique

# Check resource usage
kubectl top pods -n online-boutique

# Check HPA status
kubectl get hpa -n online-boutique
```

