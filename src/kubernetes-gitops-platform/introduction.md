# Kubernetes GitOps Platform

A production-ready AWS EKS cluster with complete GitOps platform toolkit, automated deployment, monitoring, and observability.

## Overview

The Kubernetes GitOps Platform is a comprehensive infrastructure and platform solution that combines two repositories:

- **k8s-infrastructure-as-code**: Complete AWS EKS infrastructure provisioning with Terraform
- **k8s-platform-toolkit**: Platform services including monitoring, logging, testing, and demo applications

This project demonstrates enterprise-grade Kubernetes platform operations, GitOps automation, and SRE best practices.

![Architecture Diagram](../images/architecture.png)

## Key Features

- **Complete Infrastructure as Code**: Provision entire AWS EKS cluster and all platform services with a single command
- **GitOps Automation**: ArgoCD automatically deploys and manages all platform applications from Git repositories
- **Production-Ready Platform**: Comprehensive observability stack with monitoring, logging, and testing tools
- **High Availability**: Multi-AZ deployment with auto-scaling worker nodes and Horizontal Pod Autoscaler (HPA)
- **Zero-Downtime Deployments**: Kubernetes rolling updates ensure continuous service availability
- **Complete Observability**: Prometheus, Grafana, Loki, and Promtail for metrics, logs, and dashboards
- **Performance Testing**: k6 integration for smoke, load, stress, and spike testing with Prometheus metrics
- **SRE-Ready**: Availability testing, sanity checks, and performance validation built-in

## Project Highlights

This project demonstrates:
- Modern Kubernetes platform operations
- GitOps with ArgoCD app-of-apps pattern
- Infrastructure as Code with Terraform
- Comprehensive observability and monitoring
- SRE best practices and testing
- High availability and auto-scaling
- Production-ready deployment patterns

## Repository Structure

### Infrastructure Repository (`k8s-infrastructure-as-code`)
- Terraform configurations for AWS EKS
- VPC, networking, and security groups
- IAM roles and policies
- ArgoCD installation
- Helm charts for applications
- Makefile automation

### Platform Toolkit Repository (`k8s-platform-toolkit`)
- Monitoring stack (Prometheus, Grafana)
- Logging stack (Loki, Promtail)
- Testing applications (Sanity Test, Availability Test)
- Demo microservices (Online Boutique)
- Chaos engineering experiments
- ArgoCD application definitions

## Technology Stack

- **Infrastructure**: Terraform, AWS EKS, VPC, IAM
- **Container Orchestration**: Kubernetes
- **GitOps**: ArgoCD
- **Monitoring**: Prometheus, Grafana, kube-state-metrics, node-exporter
- **Logging**: Loki, Promtail
- **Package Management**: Helm
- **Automation**: Makefile, Docker
- **Testing**: Custom Python applications, Locust

