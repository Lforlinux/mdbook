# Features

## Chaos Experiment Management

- Schedule and run chaos workflows (e.g., pod crashes, network latency) using LitmusChaos's ChaosCenter UI or APIs.
- Support for custom chaos scenarios via scripts or predefined Litmus experiments.

## Real-Time Observability

- Monitor experiment impacts (e.g., error rates, latency) with Prometheus and visualize in Grafana.
- Trace request flows across microservices with OpenTelemetry to pinpoint failure propagation.

## Resilience Analytics

- Analyze system behavior under chaos (e.g., recovery time, service degradation).
- Generate reports suggesting improvements (e.g., auto-scaling policies, retry mechanisms).

## User-Friendly Dashboard

- Configure experiments, view live metrics, and explore historical data via a React-based UI.
- Embed Grafana dashboards for time-series visualizations (e.g., CPU usage, API response times).

## Automated Notifications

- Alert SREs on experiment outcomes or system failures via webhooks to Slack/PagerDuty.
- Configurable alert rules based on Prometheus metrics.

## Scalable Deployment

- Auto-scale EKS nodes and microservices during high-load experiments.
- Use ArgoCD for GitOps-driven deployments and rollbacks.

