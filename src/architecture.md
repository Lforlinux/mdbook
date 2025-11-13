# System Architecture

ChaosHub is a microservices-based platform deployed on AWS EKS, with a mock target application and a chaos orchestrator built around LitmusChaos. The architecture includes:

## Chaos Orchestrator

- Built on LitmusChaos (ChaosCenter for UI and engine).
- Schedules and executes chaos experiments (e.g., pod deletion, network delay) via REST APIs or cron jobs.
- Integrates with the ChaosCenter Dashboard for user-friendly experiment configuration.

## Target Application

- A mock e-commerce app with microservices (e.g., user, order, inventory) deployed on Kubernetes.
- Simulates a production-like system to test resilience under chaos (e.g., HTTP errors, database failures).

## Analytics Service

- Processes experiment results, calculating metrics like mean time to recovery (MTTR) and failure blast radius.
- Stores data in AWS RDS and generates resilience reports.

## Alerting Service

- Sends notifications (e.g., via Slack or PagerDuty) for experiment outcomes or critical failures.
- Integrates with Prometheus for alert rules.

## Frontend Dashboard

- A React-based web interface for SREs to configure chaos experiments, monitor system health, and view analytics.
- Embeds Grafana panels for real-time visualizations (e.g., latency spikes, pod health).

## Infrastructure

- Deployed on AWS EKS with RDS for data storage, S3 for logs/artifacts, and Elastic Load Balancer for traffic routing.
- Managed by Terraform for infrastructure as code and Helm for Kubernetes deployments.

