# Kubernetes GitOps Platform Technical Q&A

## Architecture & Design Questions

### Q1: "Walk me through the architecture of your Kubernetes GitOps Platform."

**Answer:**
"The platform uses a two-repository architecture:
- **k8s-infrastructure-as-code**: Terraform provisions AWS EKS cluster, VPC, networking, and installs ArgoCD
- **k8s-platform-toolkit**: Contains all platform applications (monitoring, logging, testing) deployed via GitOps

The workflow:
1. Terraform creates EKS cluster and installs ArgoCD
2. ArgoCD uses app-of-apps pattern to reference platform toolkit repository
3. All platform applications deploy automatically via GitOps
4. Changes in Git automatically sync to cluster with zero downtime

Key components:
- **Infrastructure**: AWS EKS, VPC, IAM, Security Groups
- **GitOps**: ArgoCD with app-of-apps pattern
- **Monitoring**: Prometheus, Grafana, kube-state-metrics, node-exporter
- **Logging**: Loki and Promtail
- **Testing**: Sanity Test and Availability Test
- **Demo**: Online Boutique microservices"

### Q2: "Why did you choose a two-repository architecture?"

**Answer:**
"Two-repository architecture provides:
1. **Separation of Concerns**: Infrastructure vs. applications
2. **Independent Lifecycles**: Infrastructure changes don't affect applications
3. **Team Collaboration**: Different teams can work on different repos
4. **Security**: Different access controls per repository
5. **Reusability**: Platform toolkit can deploy to multiple clusters
6. **GitOps Best Practices**: Clear separation of infrastructure and application code

This pattern is common in enterprise GitOps implementations."

### Q3: "Explain the app-of-apps pattern."

**Answer:**
"App-of-apps is an ArgoCD pattern for managing multiple applications:
- **Root Application**: Manages child applications
- **Child Applications**: Individual application definitions
- **Hierarchical Management**: Single point of control
- **Automated Sync**: All apps sync from Git automatically
- **Sync Waves**: Ordered deployment using annotations

Benefits:
- Centralized application management
- Consistent deployment patterns
- Easy to add/remove applications
- Automated reconciliation"

## Infrastructure Questions

### Q4: "How does Terraform provision the EKS cluster?"

**Answer:**
"Terraform uses the official EKS module:
1. **VPC Module**: Creates networking infrastructure
2. **EKS Module**: Provisions managed control plane
3. **Node Groups**: Configures managed worker nodes
4. **IAM Roles**: Sets up service accounts and permissions
5. **Helm Provider**: Installs ArgoCD via Helm
6. **Kubernetes Provider**: Configures app-of-apps

The entire infrastructure is defined as code with:
- Multi-AZ deployment for high availability
- Auto-scaling node groups
- Security groups and network policies
- IAM roles with least privilege"

### Q5: "How do you ensure high availability?"

**Answer:**
"Multiple HA strategies:
1. **Multi-AZ Deployment**: Control plane and nodes across zones
2. **Auto Scaling**: Worker nodes and pods scale automatically
3. **Replica Sets**: Multiple pod instances per service
4. **HPA**: Horizontal Pod Autoscaler for pod scaling
5. **Cluster Autoscaler**: Node-level auto-scaling
6. **Load Balancing**: AWS ALB for external access
7. **Health Checks**: Readiness and liveness probes

This ensures the platform can handle failures and scale with demand."

## GitOps Questions

### Q6: "How does ArgoCD automatically deploy applications?"

**Answer:**
"ArgoCD GitOps workflow:
1. **Repository Monitoring**: ArgoCD watches Git repositories
2. **Change Detection**: Detects commits and changes
3. **Sync Policy**: Automated sync with self-healing enabled
4. **Application Deployment**: Applies manifests to cluster
5. **Health Monitoring**: Tracks application health status
6. **Reconciliation**: Continuously ensures desired state

Configuration:
- Auto-sync enabled for most applications
- Sync waves for ordered deployment
- Self-healing for automatic recovery
- Pruning for resource cleanup"

### Q7: "How do you handle application updates?"

**Answer:**
"Update process:
1. **Make Changes**: Update manifests in Git repository
2. **Commit and Push**: Changes pushed to main branch
3. **ArgoCD Detection**: ArgoCD detects changes automatically
4. **Sync**: Applications sync with rolling updates
5. **Verification**: Health checks validate deployment
6. **Rollback**: Git revert for quick rollback if needed

Zero-downtime through:
- Kubernetes rolling updates
- Readiness probes
- Multiple replicas
- Health check validation"

## Monitoring Questions

### Q8: "How do you monitor the platform?"

**Answer:**
"Comprehensive monitoring stack:
1. **Prometheus**: Metrics collection from all services
2. **Grafana**: Visualization with pre-built dashboards
3. **kube-state-metrics**: Kubernetes object metrics
4. **node-exporter**: Node-level system metrics
5. **Loki**: Centralized log aggregation
6. **Promtail**: Log collection agent

Key metrics:
- Application performance (request rate, latency, errors)
- Infrastructure metrics (CPU, memory, disk)
- Kubernetes metrics (pod status, deployments)
- Business metrics (custom application metrics)"

### Q9: "How do you test application availability?"

**Answer:**
"Two testing approaches:
1. **Sanity Test**: Health checks for all microservices every 60 seconds
   - Tests individual service health
   - Tracks response times
   - Provides web dashboard

2. **Availability Test**: SRE-style testing every 5 minutes
   - Simulates real user workflows
   - Tests complete user journeys
   - Calculates uptime percentage and SRE metrics
   - Provides Jenkins-like dashboard

Both tests run automatically and provide real-time status."

## Scaling Questions

### Q10: "How does auto-scaling work?"

**Answer:**
"Multi-level auto-scaling:
1. **HPA**: Horizontal Pod Autoscaler scales pods based on CPU/memory
   - Monitors pod resource usage
   - Scales between min/max replicas
   - Fast response to load changes

2. **Cluster Autoscaler**: Scales worker nodes
   - Monitors unschedulable pods
   - Adds nodes when needed
   - Removes nodes when underutilized

3. **VPA**: Vertical Pod Autoscaler (optional)
   - Adjusts resource requests/limits
   - Based on historical usage
   - Optimizes resource allocation

This ensures the platform scales automatically with demand."

## Security Questions

### Q11: "How do you secure the platform?"

**Answer:**
"Multi-layer security:
1. **Network**: Private subnets, security groups, network policies
2. **IAM**: Least privilege roles, service accounts, RBAC
3. **Secrets**: Kubernetes secrets, AWS Secrets Manager integration
4. **Pod Security**: Security contexts, pod security standards
5. **Encryption**: Data at rest and in transit
6. **Audit**: Kubernetes audit logging, VPC flow logs

Security best practices:
- Defense in depth
- Regular security updates
- Image vulnerability scanning
- Compliance with CIS benchmarks"

## Performance Testing Questions

### Q12: "Tell me about k6 performance testing in your platform."

**Answer:**
"k6 is a modern, developer-centric performance testing tool integrated into the platform:
- **Test Types**: Smoke, Load, Stress, and Spike tests
- **Kubernetes Native**: Runs as Kubernetes Jobs
- **GitOps Integrated**: Test scripts stored in Git, deployed via ArgoCD
- **Prometheus Integration**: Metrics exported via StatsD exporter
- **Grafana Dashboards**: Real-time visualization of test results

Test scenarios:
- **Smoke Test**: Basic functionality (1 user, ~4 minutes)
- **Load Test**: Normal production load (50-100 users, ~16 minutes)
- **Stress Test**: Find breaking point (100-500 users, ~40 minutes)
- **Spike Test**: Sudden traffic spikes (10→500→1000 users, ~6 minutes)

Each test validates:
- Frontend HTTP endpoints (homepage, product pages)
- Backend health checks
- Error rates and response times
- Custom metrics (frontend_errors, backend_errors)

Tests can be run manually or scheduled via CronJobs for continuous validation."

### Q13: "How does k6 integrate with your monitoring stack?"

**Answer:**
"k6 metrics flow through this pipeline:
1. **k6 Test Jobs**: Generate load and collect metrics
2. **StatsD Exporter**: Receives metrics from k6 via StatsD protocol
3. **Prometheus**: Scrapes StatsD exporter metrics
4. **Grafana**: Visualizes metrics in dashboards

Available metrics:
- `k6_http_reqs_total` - Total requests
- `k6_http_req_duration_seconds` - Response time histogram
- `k6_http_req_failed_total` - Failed requests
- `k6_vus` - Current virtual users
- Custom metrics: `frontend_errors`, `backend_errors`

We use the official Grafana k6 dashboard (ID: 19665) for visualization, showing:
- Request rate over time
- Response time percentiles (p50, p95, p99)
- Error rates
- Virtual user count
- Data transfer metrics

This integration allows us to correlate performance test results with application metrics in real-time."

### Q14: "How do you use k6 to validate autoscaling?"

**Answer:**
"k6 tests validate HPA and Cluster Autoscaler:
1. **Load Test**: Gradually increases load to trigger HPA
   - Watch HPA create new pods
   - Verify response times remain stable
   - Confirm pods scale down after test

2. **Spike Test**: Sudden load spikes test autoscaling response
   - Validates rapid scaling capability
   - Tests rate limiting and circuit breakers
   - Verifies system recovers after spike

3. **Stress Test**: Finds autoscaling limits
   - Identifies maximum capacity
   - Tests cluster autoscaler node addition
   - Validates resource constraints

Process:
- Run k6 test with increasing load
- Monitor HPA status: `kubectl get hpa -w`
- Watch pod scaling: `kubectl get pods -w`
- Verify metrics in Grafana
- Confirm performance remains within thresholds

This ensures autoscaling works correctly and maintains SLOs under load."

## Advanced Questions

### Q15: "How would you scale this to production?"

**Answer:**
"Production scaling strategies:
1. **Multi-Cluster**: Deploy to multiple regions/clusters
2. **Service Mesh**: Istio or Linkerd for advanced traffic management
3. **CI/CD Integration**: Automated testing and deployment pipelines
4. **Disaster Recovery**: Backup and restore procedures
5. **Advanced Monitoring**: Custom metrics and alerting
6. **Cost Optimization**: Spot instances, reserved capacity
7. **Compliance**: Enhanced security and audit logging

The architecture supports horizontal scaling and can be extended for enterprise production use."

### Q16: "How do you handle performance testing in CI/CD?"

**Answer:**
"Performance testing integration:
1. **Smoke Tests**: Run after each deployment
   - Quick validation (< 5 minutes)
   - Blocks deployment on failure
   - Integrated in GitHub Actions

2. **Scheduled Tests**: CronJobs run regularly
   - Load tests weekly
   - Stress tests monthly
   - Spike tests before major releases

3. **Metrics Collection**: All tests export to Prometheus
   - Historical trend analysis
   - Performance regression detection
   - SLO validation

4. **Alerting**: Prometheus alerts on threshold violations
   - High error rates
   - Slow response times
   - Test failures

This ensures continuous performance validation and early detection of regressions."

## OPA Policy Enforcement Questions

### Q17: "What is OPA and why did you implement it?"

**Answer:**
"OPA (Open Policy Agent) is a general-purpose policy engine that enables unified policy enforcement. We use OPA Gatekeeper for Kubernetes to enforce security and governance policies automatically.

Benefits:
1. **Security**: Automatically enforces security best practices
2. **Compliance**: Meets regulatory requirements (SOC 2, PCI-DSS, HIPAA)
3. **Prevention**: Blocks bad configurations before they reach the cluster
4. **Consistency**: Ensures all resources follow the same policies
5. **Audit**: Provides compliance reporting and violation tracking

We implemented 6 core policies:
- Require non-root users
- Require resource limits
- Disallow latest tags
- Require read-only filesystem
- Disallow privileged containers
- Require labels"

### Q18: "How does OPA Gatekeeper enforce policies?"

**Answer:**
"OPA Gatekeeper enforces policies through Kubernetes admission control:

1. **Admission Webhook**: Gatekeeper registers as validating admission webhook
2. **Request Interception**: All pod/deployment creation requests are intercepted
3. **Policy Evaluation**: Rego policies evaluate the resource against constraints
4. **Decision**: Allow or deny based on policy evaluation
5. **Response**: Pod is created or error is returned

Flow:
```
Developer: kubectl apply pod.yaml
    ↓
Kubernetes API Server
    ↓
Gatekeeper Admission Webhook
    ↓
Policy Evaluation (Rego)
    ↓
✅ Allow or ❌ Deny
```

This happens before resources are created, preventing violations from reaching the cluster."

### Q19: "Explain your OPA policy enforcement modes."

**Answer:**
"We support three enforcement modes:

1. **Enforce Mode (Production)**:
   - Blocks violations completely
   - Pods are rejected if they violate policies
   - Use case: Production environments

2. **Dryrun Mode (Demo/Audit)**:
   - Reports violations but allows deployments
   - Pods are created, violations are logged
   - Use case: Testing, gradual rollout, demos

3. **Warn Mode (Soft Enforcement)**:
   - Warnings in events but allows deployments
   - Pods are created with warnings
   - Use case: Migration period

We use dryrun mode for demos to show policy violations without blocking deployments. In production, we use enforce mode for security-critical policies."

### Q20: "How do you audit OPA policy compliance?"

**Answer:**
"Multiple audit approaches:

1. **Automated Audit Script**:
   ```bash
   ./opa/audit-policies.sh all
   ```
   - Scans all pods in namespace
   - Reports compliant/non-compliant resources
   - Color-coded output with summaries

2. **Constraint Status**:
   ```bash
   kubectl get K8sRequiredNonRoot
   kubectl describe K8sRequiredNonRoot online-boutique-must-run-nonroot
   ```
   - Shows violation count
   - Lists violating resources
   - Provides detailed violation messages

3. **Prometheus Metrics**:
   - `gatekeeper_violations_total` - Total violations
   - `gatekeeper_admission_duration_seconds` - Policy evaluation time
   - Export to Grafana for visualization

4. **Manual kubectl Commands**:
   - Check specific resources for compliance
   - Query constraint status
   - View violation details

This provides comprehensive compliance visibility and audit trails."

## Sanity Test Questions

### Q21: "What is Sanity Test and how does it work?"

**Answer:**
"Sanity Test is an automated health check application that continuously monitors all microservices:

**Features**:
- Tests 11 microservices every 60 seconds
- Supports HTTP, gRPC, and TCP protocols
- Real-time dashboard showing service status
- Response time tracking
- History of last 50 test runs

**How It Works**:
1. Discovers services in target namespace
2. Tests each service's health endpoint
3. Measures response times
4. Tracks pass/fail status
5. Updates dashboard in real-time

**Tested Services**:
- HTTP: frontend, cartservice, productcatalogservice, etc.
- gRPC: paymentservice, shippingservice
- TCP: redis-cart

The application runs as a Kubernetes deployment with 2 replicas for high availability."

### Q22: "How does Sanity Test handle different service protocols?"

**Answer:**
"Sanity Test supports multiple protocols:

1. **HTTP Services**:
   - Tests `/health` or `/_healthz` endpoints
   - Validates HTTP status codes (200 = healthy)
   - Measures response time
   - Example: frontend service

2. **gRPC Services**:
   - Uses TCP socket connection test
   - Tests port connectivity
   - Validates service is listening
   - Example: paymentservice, shippingservice

3. **TCP Services**:
   - Tests port connectivity
   - Validates service is reachable
   - Example: redis-cart

The application uses Python's socket library for TCP/gRPC and requests library for HTTP, with configurable timeouts for each check."

### Q23: "How do you integrate Sanity Test with monitoring?"

**Answer:**
"Sanity Test can be integrated with monitoring:

1. **Prometheus Metrics** (potential):
   - `sanity_test_total` - Total test runs
   - `sanity_test_passed` - Passed test count
   - `sanity_test_failed` - Failed test count
   - `sanity_test_service_health` - Per-service health (0/1)
   - `sanity_test_response_time` - Per-service response time

2. **Grafana Dashboards**:
   - Test success rate over time
   - Service health trends
   - Response time percentiles
   - Service availability percentage

3. **Alerting**:
   - Alert on test failures
   - Alert on service degradation
   - Alert on high response times
   - Alert on consecutive failures

4. **API Integration**:
   - REST API for programmatic access
   - `/api/status` endpoint for monitoring tools
   - `/api/run-test` for manual triggers

This provides comprehensive visibility into service health."

## Availability Test Questions

### Q24: "What is Availability Test and how does it differ from Sanity Test?"

**Answer:**
"Availability Test is an SRE-style testing application that simulates real user workflows:

**Key Differences**:
- **Sanity Test**: Tests individual service health endpoints
- **Availability Test**: Tests complete user journeys (end-to-end)

**Availability Test Features**:
- Simulates real user workflows (visit → browse → add to cart → remove)
- Calculates SRE metrics (uptime percentage, consecutive failures)
- Jenkins-like dashboard with build numbers
- Tests every 5 minutes
- Provides error budgets and MTTR metrics

**Test Workflow**:
1. User visits website (frontend accessibility)
2. User browses products (catalog verification)
3. User adds product to cart (cart service integration)
4. User removes product from cart (cart state management)
5. Health check verification (backend services)

This validates that the entire system works together, not just individual services."

### Q25: "How do you calculate SRE metrics in Availability Test?"

**Answer:**
"SRE metrics calculation:

1. **Uptime Percentage**:
   ```python
   uptime_percentage = (successful_tests / total_tests) * 100
   ```
   - Tracks overall system availability
   - Target: 99.9% or higher

2. **Consecutive Failures**:
   ```python
   if test_failed:
       consecutive_failures += 1
   else:
       consecutive_failures = 0
   ```
   - Monitors continuous failures
   - Used for alerting thresholds

3. **Error Budget**:
   ```python
   error_budget = 100 - uptime_percentage
   ```
   - Remaining error budget
   - Tracks SLA compliance

4. **Test Duration**:
   - Measures how long tests take
   - Performance monitoring
   - Identifies slow services

5. **Success Rate**:
   - Pass/fail ratio over time
   - Trend analysis
   - Historical comparison

These metrics provide SRE-style visibility into system reliability."

### Q26: "How does Availability Test integrate with SRE practices?"

**Answer:**
"Availability Test implements SRE best practices:

1. **SLI/SLO Tracking**:
   - Uptime percentage as SLI
   - 99.9% uptime as SLO
   - Error budget tracking

2. **Alerting Criteria**:
   - Red status: Consecutive failures > 0
   - Green status: All tests passing
   - Uptime < 95%: Service degradation threshold

3. **Incident Detection**:
   - Early warning of service issues
   - Real user workflow validation
   - Automated testing reduces MTTR

4. **Dashboard Design**:
   - Jenkins-like interface (familiar to DevOps teams)
   - Build numbers for test runs
   - Visual status indicators (green/red)

5. **Metrics Export**:
   - Can export to Prometheus
   - Grafana dashboards for trends
   - Historical analysis

This provides production-ready SRE monitoring capabilities."

## ArgoCD GitOps Questions

### Q27: "How does the app-of-apps pattern work in your setup?"

**Answer:**
"App-of-apps pattern implementation:

**Root Application**:
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: k8s-platform-toolkit
spec:
  source:
    repoURL: https://github.com/Lforlinux/k8s-platform-toolkit.git
    path: argocd/apps
    directory:
      recurse: true  # Discovers all applications
```

**How It Works**:
1. Root application references `argocd/apps` directory
2. `recurse: true` discovers all application YAML files
3. Each child application is automatically created
4. All applications sync from Git automatically

**Benefits**:
- Single point of management
- Automatic application discovery
- Consistent deployment patterns
- Easy to add new applications (just add YAML file)

**Child Applications**:
- monitoring-stack
- logging-stack
- sanity-test
- availability-test
- online-boutique
- performance-testing

All managed by the root application automatically."

### Q28: "Explain ArgoCD sync waves and why you use them."

**Answer:**
"Sync waves control deployment order using annotations:

```yaml
annotations:
  argocd.argoproj.io/sync-wave: "1"  # Deploy first
```

**Our Sync Wave Order**:
1. **Wave 1**: Testing infrastructure (sanity-test, availability-test)
2. **Wave 2**: Demo applications (online-boutique)
3. **Wave 3**: Monitoring stack (Prometheus, Grafana)
4. **Wave 4**: Logging stack (Loki)
5. **Wave 5**: Log collection (Promtail)

**Why Use Sync Waves**:
- **Dependencies**: Some services depend on others
- **Order Matters**: Monitoring should deploy before applications
- **Reliability**: Ensures proper startup sequence
- **Predictability**: Consistent deployment order

**Example**:
- Promtail (wave 5) needs Loki (wave 4) to be ready
- Applications (wave 2) can be monitored by Prometheus (wave 3)
- Testing (wave 1) validates everything works

This ensures dependencies are met and deployments are reliable."

### Q29: "How does ArgoCD self-healing work?"

**Answer:**
"ArgoCD self-healing automatically corrects drift:

**Configuration**:
```yaml
syncPolicy:
  automated:
    selfHeal: true
```

**How It Works**:
1. **Drift Detection**: ArgoCD continuously compares Git state with cluster state
2. **Manual Changes Detected**: If someone manually changes resources
3. **Automatic Correction**: ArgoCD reverts changes to match Git
4. **Continuous Reconciliation**: Happens automatically every few minutes

**Example Scenario**:
```
Developer: kubectl scale deployment frontend --replicas=5
    ↓
ArgoCD detects: Git says 3 replicas, cluster has 5
    ↓
ArgoCD corrects: Scales back to 3 replicas
```

**Benefits**:
- Prevents configuration drift
- Maintains Git as source of truth
- Automatic recovery from manual changes
- No manual intervention needed

**When to Use**:
- Production environments
- Critical applications
- Compliance requirements
- Multi-team environments"

### Q30: "How do you handle rollbacks in ArgoCD?"

**Answer:**
"Multiple rollback strategies:

1. **Git Revert (Recommended)**:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```
   - ArgoCD automatically syncs
   - Maintains Git history
   - Full audit trail

2. **ArgoCD Rollback**:
   ```bash
   argocd app rollback monitoring-stack
   argocd app rollback monitoring-stack <revision>
   ```
   - Rollback to previous revision
   - Quick recovery
   - View history: `argocd app history monitoring-stack`

3. **Manual Sync to Previous Revision**:
   ```bash
   argocd app sync monitoring-stack --revision <revision>
   ```

**Best Practices**:
- Always use Git revert for production
- Keep revision history (default: 10 revisions)
- Test rollbacks in staging first
- Document rollback procedures

**Rollback Process**:
1. Identify problematic revision
2. Revert in Git or use ArgoCD rollback
3. ArgoCD syncs automatically
4. Verify application health
5. Monitor for issues"

## Monitoring & Observability Questions

### Q31: "How does Prometheus scrape metrics in your setup?"

**Answer:**
"Prometheus uses service discovery and static configurations:

**Service Discovery**:
```yaml
scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

**Scraping Methods**:
1. **Pod Annotations**: Pods with `prometheus.io/scrape: "true"` are scraped
2. **Service Discovery**: Automatic discovery of Kubernetes pods
3. **Static Targets**: Fixed endpoints (Prometheus, Grafana)
4. **Service Monitors**: Custom resource for advanced configuration

**Key Metrics Collected**:
- Application metrics (request rate, latency, errors)
- Infrastructure metrics (CPU, memory, disk)
- Kubernetes metrics (pod status, deployments)
- Custom business metrics

**Scrape Interval**: 15 seconds (configurable)
**Retention**: 30 days (configurable)

This provides comprehensive metrics collection from all services."

### Q32: "How do you create and manage Grafana dashboards?"

**Answer:**
"Grafana dashboard management:

**Pre-configured Dashboards**:
1. **Official k6 Dashboard**: ID 19665 (imported from Grafana Labs)
2. **Kubernetes Cluster Overview**: Cluster health and resources
3. **Online Boutique Dashboard**: Microservices metrics
4. **Node Exporter Dashboard**: Node-level system metrics

**Dashboard Import**:
1. Access Grafana UI
2. Go to Dashboards → Import
3. Enter Dashboard ID or upload JSON
4. Select Prometheus as data source
5. Save dashboard

**Custom Dashboards**:
- Create dashboards in Grafana UI
- Export as JSON
- Store in Git repository
- Deploy via ArgoCD

**Dashboard Features**:
- Request rate visualization
- Response time percentiles (p50, p95, p99)
- Error rate tracking
- Resource utilization
- Historical trends

**Best Practices**:
- Use official dashboards when available
- Customize for specific needs
- Version control dashboard JSON
- Document dashboard purposes"

### Q33: "How does Loki aggregate logs from all pods?"

**Answer:**
"Loki log aggregation pipeline:

**Components**:
1. **Promtail**: Log collection agent (DaemonSet on each node)
2. **Loki**: Log aggregation server
3. **Grafana**: Log visualization

**How It Works**:
1. **Promtail Discovery**:
   - Runs on every node
   - Discovers pods automatically
   - Reads log files from `/var/log/pods`

2. **Log Collection**:
   - Promtail tails log files
   - Adds Kubernetes labels (namespace, pod, container)
   - Sends logs to Loki via HTTP

3. **Loki Storage**:
   - Indexes by labels (not log content)
   - Efficient storage (compressed)
   - Fast queries by label

4. **Grafana Queries**:
   - LogQL query language
   - Filter by labels
   - Search log content
   - Visualize in dashboards

**Configuration**:
```yaml
scrape_configs:
  - job_name: kubernetes-pods
    kubernetes_sd_configs:
      - role: pod
```

This provides centralized logging with efficient storage and fast queries."

## Logging Questions

### Q34: "How does Promtail collect logs from Kubernetes pods?"

**Answer:**
"Promtail log collection process:

**DaemonSet Deployment**:
- One Promtail pod per node
- Runs with hostPath volume mounts
- Accesses `/var/log/pods` directory

**Log Discovery**:
1. **Kubernetes Service Discovery**:
   - Discovers pods automatically
   - Reads pod metadata
   - Extracts labels and annotations

2. **Log File Reading**:
   - Reads from `/var/log/pods/<namespace>_<pod>_<uid>/<container>/<log-file>`
   - Tails log files in real-time
   - Handles log rotation

3. **Label Enrichment**:
   - Adds Kubernetes labels (namespace, pod, container, node)
   - Adds custom labels from annotations
   - Creates unique log stream identifiers

4. **Log Shipping**:
   - Sends logs to Loki via HTTP POST
   - Batches logs for efficiency
   - Retries on failures

**Configuration**:
```yaml
scrape_configs:
  - job_name: kubernetes-pods
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_node_name]
        target_label: __host__
```

This provides automatic log collection from all pods without manual configuration."

### Q35: "How do you query logs in Loki using LogQL?"

**Answer:**
"LogQL (Log Query Language) examples:

**Basic Queries**:
```logql
# Query logs by namespace
{namespace="online-boutique"}

# Query logs by service
{namespace="online-boutique", service="frontend"}

# Filter by log level
{namespace="online-boutique"} |= "error"
```

**Advanced Queries**:
```logql
# Count errors
count_over_time({namespace="online-boutique"} |= "error" [5m])

# Rate of errors
rate({namespace="online-boutique"} |= "error" [1m])

# Filter and aggregate
{namespace="online-boutique"} 
  |= "error" 
  | json 
  | line_format "{{.timestamp}} {{.message}}"
```

**Query Features**:
- Label matching
- Log content filtering
- Aggregation functions
- Time range queries
- Log parsing and formatting

**Use Cases**:
- Error investigation
- Performance analysis
- Security auditing
- Compliance reporting

This provides powerful log querying capabilities similar to PromQL for metrics."

## Security Questions

### Q36: "How do you implement network policies in your cluster?"

**Answer:**
"Network policies provide pod-to-pod network isolation:

**Policy Example**:
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: frontend-policy
spec:
  podSelector:
    matchLabels:
      app: frontend
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: loadbalancer
      ports:
        - protocol: TCP
          port: 8080
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: cartservice
      ports:
        - protocol: TCP
          port: 7070
```

**Benefits**:
- Network segmentation
- Least privilege networking
- Multi-tenant isolation
- Security compliance

**Best Practices**:
- Start with deny-all, allow specific
- Use labels for policy matching
- Test policies in staging first
- Document allowed communications"

### Q37: "How do you manage secrets in Kubernetes?"

**Answer:**
"Multi-layered secrets management:

1. **Kubernetes Secrets**:
   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: app-secrets
   type: Opaque
   data:
     password: <base64-encoded>
   ```
   - Encrypted at rest (if enabled)
   - RBAC protected
   - Mounted as volumes or env vars

2. **AWS Secrets Manager Integration**:
   ```hcl
   data "aws_secretsmanager_secret_version" "db_password" {
     secret_id = "production/database/password"
   }
   ```
   - External secrets management
   - Automatic rotation
   - Audit logging

3. **Sealed Secrets** (optional):
   - Encrypt secrets in Git
   - Decrypt in cluster
   - GitOps friendly

**Best Practices**:
- Never commit secrets to Git
- Use external secrets manager for production
- Rotate secrets regularly
- Limit secret access via RBAC
- Audit secret access"

### Q38: "How does RBAC work in your ArgoCD setup?"

**Answer:**
"ArgoCD RBAC configuration:

**ConfigMap**:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
data:
  policy.default: role:readonly
  policy.csv: |
    p, role:admin, applications, *, */*, allow
    p, role:admin, clusters, get, *, allow
    g, admins, role:admin
```

**Roles**:
- **readonly**: Default role, read-only access
- **admin**: Full access to applications and clusters

**Policies**:
- `p`: Policy definition (subject, resource, action, object, effect)
- `g`: Group membership

**Access Control**:
- Application-level permissions
- Cluster-level permissions
- Project-based isolation
- OIDC integration (optional)

**Best Practices**:
- Least privilege principle
- Separate roles for different teams
- Regular access reviews
- Audit access logs"

## Infrastructure Questions

### Q39: "How do you manage Terraform state in your infrastructure?"

**Answer:**
"Terraform state management:

**Current Setup**:
- Local state file (for demo/single-user)
- State file backed up to Git (not recommended for production)

**Production Best Practices**:
1. **Remote State Backend**:
   ```hcl
   terraform {
     backend "s3" {
       bucket = "terraform-state-bucket"
       key    = "eks-cluster/terraform.tfstate"
       region = "us-east-1"
       encrypt = true
     }
   }
   ```
   - S3 for state storage
   - DynamoDB for state locking
   - Encryption enabled

2. **State Locking**:
   - Prevents concurrent modifications
   - Uses DynamoDB table
   - Automatic lock release

3. **State Security**:
   - Encrypted at rest
   - Access controlled via IAM
   - Versioned in S3
   - Backup and recovery

**Benefits**:
- Team collaboration
- State consistency
- Disaster recovery
- Audit trail"

### Q40: "How do you handle EKS cluster upgrades?"

**Answer:**
"EKS cluster upgrade strategy:

**Control Plane Upgrade**:
1. **AWS Managed**: Control plane upgrades via AWS Console/CLI
2. **Zero Downtime**: AWS handles upgrade automatically
3. **Version Compatibility**: Check Kubernetes version compatibility

**Node Group Upgrade**:
1. **Create New Node Group**: New nodes with updated AMI
2. **Drain Old Nodes**: `kubectl drain` to move workloads
3. **Verify**: Ensure all pods are running on new nodes
4. **Delete Old Node Group**: Remove old nodes

**Application Upgrade**:
1. **Git Update**: Update manifests in Git
2. **ArgoCD Sync**: Automatic sync via GitOps
3. **Rolling Update**: Kubernetes rolling update strategy
4. **Health Checks**: Readiness probes validate deployment

**Best Practices**:
- Test upgrades in staging first
- Upgrade control plane before nodes
- Use rolling updates for zero downtime
- Monitor during upgrades
- Have rollback plan ready"

## Advanced Scaling Questions

### Q41: "How do you configure HPA for different workloads?"

**Answer:**
"HPA configuration strategies:

**CPU-Based Scaling**:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

**Memory-Based Scaling**:
```yaml
metrics:
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**Custom Metrics Scaling**:
```yaml
metrics:
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
```

**Scaling Behavior**:
```yaml
behavior:
  scaleDown:
    stabilizationWindowSeconds: 300
    policies:
      - type: Percent
        value: 50
  scaleUp:
    stabilizationWindowSeconds: 0
    policies:
      - type: Percent
        value: 100
```

**Best Practices**:
- Set appropriate min/max replicas
- Use multiple metrics for better decisions
- Configure stabilization windows
- Test scaling behavior under load"

### Q42: "How does Cluster Autoscaler work with your node groups?"

**Answer:**
"Cluster Autoscaler integration:

**Node Group Configuration**:
```hcl
eks_managed_node_groups = {
  application = {
    name = "application-nodes"
    min_size     = 1
    max_size     = 10
    desired_size = 3
    
    labels = {
      "k8s.io/cluster-autoscaler/enabled" = "true"
      "k8s.io/cluster-autoscaler/${cluster_name}" = "owned"
    }
  }
}
```

**How It Works**:
1. **Unschedulable Pods**: Cluster Autoscaler monitors pods that can't be scheduled
2. **Node Addition**: Adds nodes when pods are pending
3. **Node Removal**: Removes nodes when underutilized
4. **Pod Disruption Budgets**: Respects PDBs during scale-down

**Scaling Triggers**:
- Pods pending due to insufficient resources
- Node utilization below threshold
- Pod affinity/anti-affinity requirements

**Configuration**:
- Expansion strategy: least-waste (preferred)
- Scale-down delay: 10 minutes
- Node utilization threshold: 50%

This ensures optimal resource utilization and cost efficiency."

## Troubleshooting Questions

### Q43: "How do you troubleshoot ArgoCD sync failures?"

**Answer:**
"ArgoCD troubleshooting steps:

1. **Check Application Status**:
   ```bash
   argocd app get <app-name>
   argocd app get <app-name> --refresh
   ```

2. **View Sync Operation**:
   ```bash
   argocd app sync <app-name> --dry-run
   argocd app sync <app-name> --prune
   ```

3. **Check Logs**:
   ```bash
   argocd app logs <app-name>
   kubectl logs -n argocd deployment/argocd-application-controller
   ```

4. **Verify Repository Access**:
   ```bash
   argocd repo list
   argocd repo get <repo-url>
   ```

5. **Check Resource Events**:
   ```bash
   kubectl get events -n <namespace>
   kubectl describe <resource> -n <namespace>
   ```

**Common Issues**:
- Repository authentication failures
- Manifest validation errors
- Resource conflicts
- Network connectivity issues
- RBAC permission problems"

### Q44: "How do you debug Prometheus scraping issues?"

**Answer:**
"Prometheus troubleshooting:

1. **Check Targets**:
   - Access Prometheus UI: `http://localhost:9090/targets`
   - View scrape status for each target
   - Check for down/unreachable targets

2. **Verify Service Discovery**:
   ```bash
   kubectl get pods -n <namespace> -o yaml | grep prometheus.io
   ```

3. **Check Prometheus Logs**:
   ```bash
   kubectl logs -n monitoring deployment/prometheus
   ```

4. **Test Scraping Manually**:
   ```bash
   kubectl port-forward -n monitoring svc/prometheus 9090:9090
   curl http://localhost:9090/api/v1/targets
   ```

5. **Verify Metrics Endpoint**:
   ```bash
   kubectl exec -n <namespace> <pod-name> -- wget -qO- http://localhost:9090/metrics
   ```

**Common Issues**:
- Missing pod annotations
- Network policies blocking access
- Incorrect service discovery config
- Authentication/authorization issues"

### Q45: "How do you troubleshoot OPA policy violations?"

**Answer:**
"OPA troubleshooting:

1. **Check Gatekeeper Status**:
   ```bash
   kubectl get pods -n gatekeeper-system
   kubectl logs -n gatekeeper-system -l control-plane=controller-manager
   ```

2. **View Constraint Status**:
   ```bash
   kubectl get K8sRequiredNonRoot
   kubectl describe K8sRequiredNonRoot <constraint-name>
   ```

3. **Check Violations**:
   ```bash
   kubectl get K8sRequiredNonRoot <constraint-name> -o jsonpath='{.status.violations}'
   ```

4. **Test Policy**:
   ```bash
   # Try to create violating resource
   kubectl run test-pod --image=nginx -n online-boutique
   # Check error message
   ```

5. **Verify Enforcement Mode**:
   ```bash
   kubectl get K8sRequiredNonRoot <constraint-name> -o yaml | grep enforcementAction
   ```

**Common Issues**:
- Constraint templates not installed
- CRDs not ready
- Enforcement mode misconfiguration
- Policy logic errors in Rego"

## Cost Optimization Questions

### Q46: "How do you optimize costs in your EKS cluster?"

**Answer:**
"Cost optimization strategies:

1. **Right-Sizing**:
   - Analyze actual resource usage
   - Set appropriate requests/limits
   - Use VPA recommendations

2. **Auto-Scaling**:
   - HPA for pod scaling
   - Cluster Autoscaler for node scaling
   - Scale down during low usage

3. **Instance Types**:
   - Use appropriate instance sizes
   - Consider spot instances for non-critical workloads
   - Reserved instances for predictable workloads

4. **Resource Quotas**:
   - Set namespace-level quotas
   - Prevent resource waste
   - Enforce via OPA policies

5. **Monitoring**:
   - Track resource usage
   - Identify idle resources
   - Cost allocation by namespace/team

**Expected Costs**:
- EKS Control Plane: ~$73/month
- Worker Nodes: Variable based on usage
- Load Balancers: ~$20-30/month each
- Data Transfer: Variable

**Optimization Results**:
- 30-40% cost reduction through right-sizing
- 20-30% savings with spot instances
- Better resource utilization"

## Disaster Recovery Questions

### Q47: "What is your disaster recovery strategy?"

**Answer:**
"Disaster recovery approach:

1. **Infrastructure as Code**:
   - All infrastructure in Terraform
   - Quick recreation from Git
   - Version controlled

2. **GitOps for Applications**:
   - All applications in Git
   - Automatic deployment via ArgoCD
   - Reproducible deployments

3. **Backup Strategy**:
   - **ETCD Backups**: EKS control plane (AWS managed)
   - **Application Data**: Database backups, persistent volumes
   - **Configuration**: All in Git (source of truth)

4. **Recovery Process**:
   - Recreate cluster from Terraform
   - Restore from backups
   - ArgoCD syncs applications automatically
   - Verify with sanity/availability tests

5. **RTO/RPO**:
   - **RTO**: < 1 hour (recovery time objective)
   - **RPO**: < 15 minutes (recovery point objective)

**Testing**:
- Regular DR drills
- Test cluster recreation
- Verify backup restoration
- Document procedures"

## Advanced Integration Questions

### Q48: "How would you integrate this platform with CI/CD pipelines?"

**Answer:**
"CI/CD integration strategy:

1. **GitHub Actions Workflow**:
   ```yaml
   - name: Deploy Infrastructure
     run: terraform apply
   
   - name: Run Sanity Tests
     run: kubectl apply -f sanity-test-job.yaml
   
   - name: Verify Deployment
     run: argocd app wait monitoring-stack --health
   ```

2. **Pipeline Stages**:
   - **Build**: Container image builds
   - **Test**: Unit tests, integration tests
   - **Deploy**: ArgoCD syncs from Git
   - **Validate**: Sanity tests, availability tests
   - **Monitor**: Prometheus alerts

3. **GitOps Integration**:
   - Changes committed to Git
   - ArgoCD automatically syncs
   - No manual kubectl commands
   - Full audit trail

4. **Testing Integration**:
   - Smoke tests after deployment
   - Performance tests on schedule
   - Automated rollback on failure

**Benefits**:
- Automated deployments
- Consistent process
- Fast feedback
- Easy rollbacks"

### Q49: "How would you extend this platform for multi-cluster management?"

**Answer:**
"Multi-cluster extension:

1. **ArgoCD Multi-Cluster**:
   ```yaml
   apiVersion: argoproj.io/v1alpha1
   kind: Application
   spec:
     destination:
       server: https://prod-cluster.example.com
   ```

2. **Cluster Management**:
   - Register clusters in ArgoCD
   - Manage from single ArgoCD instance
   - Environment-specific applications

3. **Federation**:
   - Prometheus federation for metrics
   - Centralized logging
   - Cross-cluster monitoring

4. **GitOps Patterns**:
   - Environment-specific branches
   - Cluster-specific overlays (Kustomize)
   - Centralized configuration

**Use Cases**:
- Dev/Staging/Production separation
- Multi-region deployments
- Disaster recovery clusters
- Blue-green deployments"

### Q50: "How do you ensure platform reliability and observability?"

**Answer:**
"Comprehensive reliability strategy:

1. **Monitoring**:
   - Prometheus for metrics
   - Grafana for visualization
   - Alerting on thresholds

2. **Logging**:
   - Loki for log aggregation
   - Promtail for collection
   - Centralized querying

3. **Testing**:
   - Sanity tests (health checks)
   - Availability tests (SRE metrics)
   - k6 performance tests

4. **Observability**:
   - Metrics, logs, traces (3 pillars)
   - Dashboards for visibility
   - Alerts for proactive response

5. **Reliability**:
   - High availability (multi-replica)
   - Auto-scaling (HPA, Cluster Autoscaler)
   - Self-healing (ArgoCD, health probes)
   - Circuit breakers (application level)

**SLOs**:
- Uptime: 99.9%
- Response Time: p95 < 500ms
- Error Rate: < 0.1%

This ensures production-ready reliability and full observability."

