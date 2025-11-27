# Kubernetes GitOps Platform - Sanity Test

## What is Sanity Test?

Sanity Test is an automated health check application that continuously monitors the health of all microservices in the Kubernetes cluster. It performs periodic health checks and provides a real-time dashboard showing the status of each service.

### Key Features

- **Automated Health Checks**: Tests all microservices every 60 seconds
- **Real-time Dashboard**: Web UI showing test results and service status
- **Individual Service Monitoring**: Tracks each microservice separately
- **Response Time Metrics**: Measures and displays response times
- **History Tracking**: Maintains last 50 test runs for trend analysis
- **REST API**: Programmatic access to test results

## Architecture

```
┌─────────────────┐
│  Sanity Test    │
│   Application   │
└────────┬────────┘
         │
         │ Health Checks
         │
┌────────▼────────────────────────────┐
│  Online Boutique Microservices     │
│  - frontend                         │
│  - cartservice                      │
│  - productcatalogservice            │
│  - recommendationservice            │
│  - currencyservice                  │
│  - paymentservice (gRPC)            │
│  - shippingservice (gRPC)           │
│  - checkoutservice                  │
│  - emailservice                     │
│  - adservice                        │
│  - redis-cart                       │
└─────────────────────────────────────┘
```

## Implementation Details

### Deployment Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sanity-test-app
  namespace: sanity-test
spec:
  replicas: 2  # High availability
  template:
    spec:
      containers:
      - name: sanity-test
        image: python:3.11-slim
        command: ["/bin/bash"]
        args:
          - -c
          - |
            pip install Flask Flask-CORS requests gunicorn
            python /app/app.py
        env:
        - name: NAMESPACE
          value: "online-boutique"
        - name: TEST_INTERVAL
          value: "60"  # 1 minute
        - name: TIMEOUT
          value: "5"   # 5 seconds
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
        readinessProbe:
          httpGet:
            path: /api/health
            port: 5000
```

### Health Check Logic

The application tests each microservice by:

1. **HTTP Health Endpoints**: For HTTP-based services
   - Tests `/health` or `/healthz` endpoints
   - Validates HTTP status codes (200 = healthy)
   - Measures response time

2. **gRPC Health Checks**: For gRPC services
   - Uses gRPC health checking protocol
   - Tests service availability
   - Validates service responses

3. **Redis Health Check**: For Redis cache
   - Tests Redis connectivity
   - Validates PING command
   - Checks response time

### Tested Microservices

#### HTTP Services
- **frontend**: Main web interface
- **cartservice**: Shopping cart management
- **productcatalogservice**: Product information
- **recommendationservice**: Product recommendations
- **currencyservice**: Currency conversion
- **checkoutservice**: Checkout process
- **emailservice**: Email notifications
- **adservice**: Advertisement service

#### gRPC Services
- **paymentservice**: Payment processing (gRPC)
- **shippingservice**: Shipping calculations (gRPC)

#### Data Stores
- **redis-cart**: Redis cache for cart data

## API Endpoints

### Dashboard UI
```
GET /
```
Returns HTML dashboard showing all test results.

### Status API
```
GET /api/status
```
Returns JSON with current test status:
```json
{
  "status": "passed",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "frontend": {
      "status": "healthy",
      "response_time": 0.15,
      "last_check": "2024-01-15T10:30:00Z"
    },
    "cartservice": {
      "status": "healthy",
      "response_time": 0.08,
      "last_check": "2024-01-15T10:30:00Z"
    }
  },
  "summary": {
    "total": 11,
    "healthy": 11,
    "unhealthy": 0
  }
}
```

### Manual Test Trigger
```
GET /api/run-test
```
Triggers an immediate test run and returns results.

### Health Check
```
GET /api/health
```
Returns application health status (for Kubernetes probes).

## Configuration

### Environment Variables

- **NAMESPACE**: Target namespace to test (default: `online-boutique`)
- **TEST_INTERVAL**: Seconds between test runs (default: `60`)
- **TIMEOUT**: Request timeout in seconds (default: `5`)

### Service Discovery

The application discovers services by:
1. Querying Kubernetes API for services in target namespace
2. Filtering services based on labels/annotations
3. Testing each service's health endpoint

## Deployment

### Via ArgoCD (Recommended)

```bash
# Deploy via ArgoCD application
kubectl apply -f argocd/apps/sanity-test-app.yaml
```

### Manual Deployment

```bash
# Create namespace
kubectl apply -f sanity-test/namespace.yaml

# Deploy application
kubectl apply -f sanity-test/deployment.yaml

# Deploy service
kubectl apply -f sanity-test/service.yaml

# Expose via LoadBalancer (optional)
kubectl apply -f sanity-test/sanity-test-ingress-alb.yaml
```

## Access

### LoadBalancer URL

```bash
# Get external URL
kubectl get svc sanity-test-service -n sanity-test

# Access dashboard
http://<loadbalancer-external-ip>
```

### Port Forward

```bash
# Port forward to local machine
kubectl port-forward -n sanity-test svc/sanity-test-service 8080:80

# Access dashboard
http://localhost:8080
```

## Dashboard Features

### Real-time Status

- **Overall Status**: Pass/Fail indicator
- **Service Status**: Individual service health
- **Response Times**: Per-service response time metrics
- **Last Check**: Timestamp of last health check
- **History**: Last 50 test runs

### Visual Indicators

- **Green**: Service is healthy
- **Red**: Service is unhealthy
- **Yellow**: Service check in progress
- **Gray**: Service not tested yet

### Metrics Display

- Total services tested
- Healthy services count
- Unhealthy services count
- Average response time
- Test run history

## Test Results Interpretation

### Pass Criteria

A test **passes** if:
- All services return HTTP 200 status
- All services respond within timeout
- No connection errors occur
- All gRPC services are reachable

### Fail Criteria

A test **fails** if:
- Any service returns non-200 status
- Any service times out
- Connection errors occur
- gRPC services are unreachable

### Example Output

**Successful Test**:
```
Status: ✅ PASSED
Services: 11/11 Healthy
Average Response Time: 0.12s
Last Check: 2024-01-15 10:30:00
```

**Failed Test**:
```
Status: ❌ FAILED
Services: 9/11 Healthy
Unhealthy: cartservice, redis-cart
Average Response Time: 0.45s
Last Check: 2024-01-15 10:30:00
```

## Integration with Monitoring

### Prometheus Metrics

Sanity test results can be exported to Prometheus:
- `sanity_test_total` - Total test runs
- `sanity_test_passed` - Passed test count
- `sanity_test_failed` - Failed test count
- `sanity_test_service_health` - Per-service health (0/1)
- `sanity_test_response_time` - Per-service response time

### Grafana Dashboard

Create dashboards showing:
- Test success rate over time
- Service health trends
- Response time percentiles
- Service availability percentage

### Alerting

Set up alerts for:
- Test failures
- Service degradation
- High response times
- Consecutive failures

## Use Cases

### 1. Post-Deployment Validation

After deploying new versions:
```bash
# Deploy new version
kubectl apply -f new-deployment.yaml

# Check sanity test dashboard
# Verify all services are healthy
```

### 2. Continuous Monitoring

Monitor service health continuously:
- Automated checks every 60 seconds
- Real-time dashboard updates
- Historical trend analysis

### 3. Troubleshooting

Identify problematic services:
- Dashboard shows which services are failing
- Response times indicate performance issues
- History shows when issues started

### 4. CI/CD Integration

Integrate into deployment pipelines:
```yaml
# GitHub Actions example
- name: Run Sanity Test
  run: |
    kubectl port-forward -n sanity-test svc/sanity-test-service 8080:80 &
    sleep 5
    curl http://localhost:8080/api/run-test
    # Verify all services are healthy
```

## Best Practices

### 1. High Availability

Deploy with multiple replicas:
```yaml
spec:
  replicas: 2  # Ensures availability if one pod fails
```

### 2. Resource Limits

Set appropriate resource limits:
```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "200m"
```

### 3. Health Probes

Configure proper health checks:
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 5000
  initialDelaySeconds: 30
  periodSeconds: 30
```

### 4. Monitoring

Integrate with monitoring stack:
- Export metrics to Prometheus
- Create Grafana dashboards
- Set up alerts

## Troubleshooting

### Application Not Starting

```bash
# Check pod status
kubectl get pods -n sanity-test

# View logs
kubectl logs -n sanity-test deployment/sanity-test-app

# Check events
kubectl describe pod -n sanity-test <pod-name>
```

### Services Not Being Tested

```bash
# Verify namespace configuration
kubectl get deployment sanity-test-app -n sanity-test -o yaml | grep NAMESPACE

# Check service discovery
kubectl get svc -n online-boutique

# Verify network connectivity
kubectl exec -n sanity-test deployment/sanity-test-app -- curl http://frontend.online-boutique.svc.cluster.local/health
```

### Dashboard Not Accessible

```bash
# Check service
kubectl get svc -n sanity-test

# Check port forwarding
kubectl port-forward -n sanity-test svc/sanity-test-service 8080:80

# Check LoadBalancer
kubectl get svc sanity-test-service -n sanity-test -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

## Summary

Sanity Test provides:
- **Automated Health Monitoring**: Continuous service health checks
- **Real-time Dashboard**: Visual status of all services
- **Quick Validation**: Fast post-deployment verification
- **Troubleshooting Aid**: Identify problematic services quickly
- **CI/CD Integration**: Automated validation in pipelines

This ensures all microservices are healthy and accessible, providing early detection of issues and maintaining system reliability.

