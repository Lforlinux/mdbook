# Demo Workflow

1. **Code Update**: A developer adds a new chaos scenario (e.g., network partition) to the orchestrator and pushes to GitHub.
2. **CI/CD**: GitHub Actions tests, builds, and pushes the Docker image to ECR.
3. **ArgoCD**: Syncs the updated Helm chart to EKS, deploying the scenario with a canary rollout.
4. **Chaos Experiment**: LitmusChaos injects a network delay into the target app's order service.
5. **Monitoring**: Prometheus captures error spikes; Grafana visualizes latency; OpenTelemetry traces the failure's impact.
6. **Analytics and Alerts**: The analytics service reports MTTR; the alerting service notifies via Slack.

