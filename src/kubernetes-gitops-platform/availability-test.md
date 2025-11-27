# Kubernetes GitOps Platform - Availability Test

## What is Availability Test?

Availability Test is an SRE-style testing application that simulates real user workflows to validate end-to-end system availability. Unlike simple health checks, it tests complete user journeys and provides SRE metrics like uptime percentage, consecutive failures, and error budgets.

### Key Features

- **Real User Simulation**: Tests actual user workflows (not just health endpoints)
- **SRE Metrics**: Calculates uptime percentage, MTTR, error budgets
- **Jenkins-like Dashboard**: Visual status indicators (green/red) similar to CI/CD pipelines
- **Automated Testing**: Runs every 5 minutes automatically
- **Manual Trigger**: On-demand test execution
- **Consecutive Failure Tracking**: Monitors continuous failures for alerting

## Architecture

```
┌─────────────────┐
│  Availability   │
│  Test App       │
└────────┬────────┘
         │
         │ Simulates User Workflow
         │
┌────────▼────────────────────────────┐
│  User Journey Simulation            │
│  1. Visit Website (Frontend)        │
│  2. Browse Products                 │
│  3. Add Product to Cart             │
│  4. Remove Product from Cart        │
│  5. Verify Cart Service Health      │
└─────────────────────────────────────┘
```

## Test Workflow

### Complete User Journey

The application simulates a real user shopping experience:

1. **User Visits Website**
   - Tests frontend accessibility
   - Verifies homepage loads
   - Validates HTTP 200 response

2. **User Browses Products**
   - Checks product catalog is accessible
   - Verifies product data is loaded
   - Validates frontend functionality

3. **User Adds Product to Cart**
   - Simulates adding product to cart
   - Tests cart service integration
   - Validates cart functionality

4. **User Removes Product from Cart**
   - Simulates removing product from cart
   - Tests cart service removal
   - Validates cart state management

5. **Health Check Verification**
   - Verifies cart service health endpoints
   - Validates backend service status
   - Confirms microservices integration

## Implementation Details

### Application Structure

```python
class AvailabilityTester:
    """Manages availability testing"""
    
    def run_cart_services_test(self):
        """Run complete cart service test"""
        # Step 1: Frontend accessibility
        # Step 2: Product browsing
        # Step 3: Add to cart
        # Step 4: Remove from cart
        # Step 5: Health verification
```

### Test Execution

```python
# Test configuration
CART_SERVICE_URL = "http://cartservice:7070"
FRONTEND_URL = "http://frontend:8080"
TEST_INTERVAL = 300  # 5 minutes

# Test execution
test_result = {
    'timestamp': datetime.now(),
    'status': 'passed' | 'failed',
    'duration': 0.0,
    'steps': [],
    'error': None
}
```

### SRE Metrics Calculation

```python
# Uptime percentage
uptime_percentage = (successful_tests / total_tests) * 100

# Consecutive failures
if test_failed:
    consecutive_failures += 1
else:
    consecutive_failures = 0

# Error budget
error_budget = 100 - uptime_percentage
```

## Deployment Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: availability-test-app
  namespace: availability-test
spec:
  replicas: 2  # High availability
  template:
    spec:
      containers:
      - name: availability-test
        image: python:3.11-slim
        env:
        - name: CART_SERVICE_URL
          value: "http://cartservice.default.svc.cluster.local:7070"
        - name: FRONTEND_URL
          value: "http://frontend.default.svc.cluster.local:80"
        - name: TEST_INTERVAL
          value: "300"  # 5 minutes
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
```

## Dashboard Features

### Jenkins-like Interface

- **Build Number**: Sequential test run numbers
- **Status Indicators**: Green (pass) / Red (fail)
- **Test Details**: Step-by-step test execution
- **Timestamps**: When each test ran
- **Error Messages**: Detailed failure information

### SRE Metrics Display

- **Uptime Percentage**: Overall system availability
- **Consecutive Failures**: Continuous failure count
- **Test Duration**: How long tests take
- **Success Rate**: Pass/fail ratio over time

### Real-time Updates

- Auto-refresh every 30 seconds
- Manual refresh button
- On-demand test execution
- Historical test results

## API Endpoints

### Dashboard
```
GET /
```
Returns HTML dashboard with test results.

### Status API
```
GET /api/status
```
Returns current test status:
```json
{
  "status": "passed",
  "uptime_percentage": 99.5,
  "consecutive_failures": 0,
  "last_test": {
    "timestamp": "2024-01-15T10:30:00Z",
    "status": "passed",
    "duration": 1.2,
    "steps": [...]
  },
  "test_history": [...]
}
```

### Manual Test Trigger
```
GET /api/run-test
```
Triggers immediate test execution.

### Health Check
```
GET /api/health
```
Returns application health status.

## SRE Integration

### Alerting Criteria

- **Red Status**: Consecutive failures > 0
- **Green Status**: All tests passing
- **Uptime < 95%**: Service degradation threshold
- **Consecutive Failures > 3**: Critical alert

### Metrics for Prometheus

```python
# Export metrics
uptime_gauge.set(uptime_percentage)
consecutive_failures_gauge.set(consecutive_failures)
test_duration_histogram.observe(test_duration)
test_status_gauge.set(1 if passed else 0)
```

### Grafana Dashboard

Create dashboards showing:
- Uptime percentage over time
- Consecutive failure trends
- Test duration percentiles
- Success rate trends
- Error budget consumption

## Use Cases

### 1. SRE Monitoring

Monitor system availability:
- Track uptime percentage
- Monitor consecutive failures
- Calculate error budgets
- Set up alerting

### 2. Post-Deployment Validation

After deploying new versions:
```bash
# Deploy new version
kubectl apply -f new-deployment.yaml

# Check availability test dashboard
# Verify user workflows still work
```

### 3. Performance Monitoring

Track system performance:
- Test duration trends
- Response time monitoring
- Service degradation detection

### 4. Incident Response

During incidents:
- Check availability test status
- Identify which steps are failing
- Track recovery time
- Monitor consecutive failures

## Test Cases

### Cart Services Test

**Test Name**: `cart_services_test`

**Steps**:
1. Frontend accessibility check
2. Product catalog verification
3. Add product to cart simulation
4. Remove product from cart simulation
5. Cart service health verification
6. Microservices integration check

**Success Criteria**:
- All steps complete successfully
- No errors in test execution
- Response times within thresholds

### Adding New Test Cases

1. Create test method in `TestCaseManager`:
```python
def run_new_test_case(self):
    """Run new test case"""
    test_result = {
        'test_name': 'new_test',
        'status': 'failed',
        'steps': []
    }
    # Test logic
    return test_result
```

2. Register in test suite:
```python
self.test_cases = {
    'new_test': {
        'name': 'New Test Case',
        'description': 'Test description',
        'enabled': True
    }
}
```

3. Update dashboard template to display results

## Configuration

### Environment Variables

- **CART_SERVICE_URL**: Cart service endpoint (default: `http://cartservice:7070`)
- **FRONTEND_URL**: Frontend service endpoint (default: `http://frontend:8080`)
- **TEST_INTERVAL**: Test execution interval in seconds (default: `300` = 5 minutes)

### Kubernetes Resources

- **Namespace**: `availability-test`
- **Deployment**: 2 replicas for high availability
- **Service**: ClusterIP for internal communication
- **LoadBalancer**: External access via AWS ELB
- **Ingress**: ALB configuration for custom domain

## Deployment

### Via ArgoCD (Recommended)

```bash
# Deploy via ArgoCD application
kubectl apply -f argocd/apps/availability-test-app.yaml
```

### Manual Deployment

```bash
# Create namespace
kubectl apply -f availability-test/namespace.yaml

# Deploy application
kubectl apply -f availability-test/deployment.yaml

# Expose via LoadBalancer
kubectl apply -f availability-test/loadbalancer.yaml
```

## Access

### LoadBalancer URL

```bash
# Get external URL
kubectl get svc availability-test-loadbalancer -n availability-test

# Access dashboard
http://<loadbalancer-external-ip>
```

### Port Forward

```bash
# Port forward to local machine
kubectl port-forward -n availability-test svc/availability-test-service 8080:80

# Access dashboard
http://localhost:8080
```

## Troubleshooting

### Test Failures

```bash
# Check application logs
kubectl logs -f deployment/availability-test-app -n availability-test

# Check pod status
kubectl get pods -n availability-test

# Check service connectivity
kubectl exec -n availability-test deployment/availability-test-app -- \
  curl http://frontend.default.svc.cluster.local
```

### Service Unreachable

```bash
# Verify services are running
kubectl get pods -n default -l app=frontend
kubectl get pods -n default -l app=cartservice

# Check service endpoints
kubectl get endpoints -n default

# Test connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  wget -O- http://frontend.default.svc.cluster.local
```

### Dashboard Not Loading

```bash
# Check service
kubectl get svc -n availability-test

# Check LoadBalancer
kubectl get svc availability-test-loadbalancer -n availability-test

# Check ingress
kubectl get ingress -n availability-test
```

## Best Practices

### 1. Test Frequency

- **Production**: Every 5 minutes (default)
- **Staging**: Every 10 minutes
- **Development**: Every 15 minutes

### 2. Alerting Thresholds

- **Critical**: Consecutive failures > 3
- **Warning**: Consecutive failures > 1
- **Info**: Uptime < 99%

### 3. High Availability

Deploy with multiple replicas:
```yaml
spec:
  replicas: 2  # Ensures availability if one pod fails
```

### 4. Resource Limits

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

## Summary

Availability Test provides:
- **Real User Simulation**: Tests actual workflows, not just health endpoints
- **SRE Metrics**: Uptime percentage, consecutive failures, error budgets
- **Visual Dashboard**: Jenkins-like interface for quick status checks
- **Automated Monitoring**: Continuous availability validation
- **Incident Detection**: Early warning of service issues

This ensures your system maintains high availability and provides early detection of issues that affect real users.

