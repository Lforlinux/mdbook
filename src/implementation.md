# Technical Implementation

## Components and Tools

### CI/CD Pipeline (GitHub Actions)

- Automates building, testing, and deploying microservices and the frontend.
- Example: A commit to the chaos orchestrator triggers tests, builds a Docker image, pushes to Amazon ECR, and updates the Helm chart.

### ArgoCD

- Manages Kubernetes deployments via GitOps.
- Each microservice (orchestrator, target app, analytics, frontend) is packaged as a Helm chart in a Git repository.
- Supports canary rollouts and rollbacks (e.g., for new chaos scenarios).

### Prometheus

- Collects metrics from:
  - Target app (e.g., API latency, error rates).
  - Chaos orchestrator (e.g., experiment success rate).
  - EKS infrastructure (e.g., node CPU/memory).
- Defines alerts for anomalies (e.g., high error rates during chaos).

### Grafana

- Visualizes:
  - Experiment results (e.g., latency spikes, recovery times).
  - System health (e.g., pod status, resource usage).
  - OpenTelemetry traces for failure analysis.
- Embeds dashboards in the ChaosHub UI for seamless monitoring.

### OpenTelemetry

- Instruments microservices to trace requests (e.g., from dashboard to orchestrator to target app).
- Exports traces to Jaeger or AWS X-Ray, visualized in Grafana.
- Tracks failure propagation (e.g., how a pod crash impacts downstream services).

### AWS and Terraform

- Terraform provisions:
  - EKS cluster for microservices and LitmusChaos.
  - RDS for experiment data and metadata.
  - S3 for logs and artifacts (e.g., experiment reports).
  - Elastic Load Balancer for routing traffic.
  - IAM roles for secure access.
- Supports infrastructure versioning and scaling (e.g., adding nodes during load tests).

### Helm Charts

- Packages microservices and LitmusChaos components.
- Manages dependencies (e.g., Redis for caching, Kafka for event streaming).
- Customizes deployments for dev/staging/prod environments.

### LitmusChaos

- Provides the chaos engineering engine via ChaosCenter.
- Executes experiments like pod termination, network latency, or CPU hog.
- Offers a web-based UI (ChaosCenter Dashboard) for experiment configuration and monitoring.

## Data Flow

1. **Experiment Initiation**: Users configure chaos workflows via the ChaosHub dashboard or ChaosCenter UI.
2. **Chaos Execution**: The orchestrator (LitmusChaos) injects failures into the target app (e.g., kills an inventory service pod).
3. **Data Collection**: Metrics (Prometheus) and traces (OpenTelemetry) are collected from all services.
4. **Analysis**: The analytics service processes data, stores results in RDS, and generates resilience reports.
5. **Visualization and Alerts**: The frontend displays live metrics via Grafana embeds; the alerting service notifies SREs of outcomes.

