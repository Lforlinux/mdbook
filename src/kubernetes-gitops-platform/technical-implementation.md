# Kubernetes GitOps Platform Technical Implementation

## Infrastructure as Code (Terraform)

### VPC Configuration
```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "eks-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  enable_vpn_gateway = false

  tags = {
    Terraform   = "true"
    Environment = "production"
  }
}
```

### EKS Cluster Configuration
```hcl
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "production-eks"
  cluster_version = "1.28"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true

  # Managed Node Groups
  eks_managed_node_groups = {
    application = {
      name = "application-nodes"
      instance_types = ["t3.small"]
      min_size     = 1
      max_size     = 5
      desired_size = 3
    }
    
    platform = {
      name = "platform-nodes"
      instance_types = ["t3.medium"]
      min_size     = 1
      max_size     = 5
      desired_size = 2
    }
  }
}
```

### ArgoCD Installation
```hcl
resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = "5.51.6"
  namespace  = "argocd"

  values = [
    file("${path.module}/argocd/values.yaml")
  ]

  depends_on = [module.eks]
}
```

## GitOps Implementation

### App-of-Apps Pattern
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: k8s-platform-toolkit
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/Lforlinux/k8s-platform-toolkit.git
    targetRevision: HEAD
    path: argocd/apps
    directory:
      recurse: true
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

### Sync Waves Configuration
```yaml
# Wave 1: Testing Infrastructure
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: sanity-test
  annotations:
    argocd.argoproj.io/sync-wave: "1"
---
# Wave 2-4: Monitoring Stack
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: monitoring-stack
  annotations:
    argocd.argoproj.io/sync-wave: "3"
---
# Wave 5: Logging (depends on Loki)
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: promtail
  annotations:
    argocd.argoproj.io/sync-wave: "5"
```

## Monitoring Stack Implementation

### Prometheus Configuration
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    scrape_configs:
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
      
      - job_name: 'kubernetes-nodes'
        kubernetes_sd_configs:
          - role: node
      
      - job_name: 'kube-state-metrics'
        static_configs:
          - targets: ['kube-state-metrics:8080']
      
      - job_name: 'node-exporter'
        static_configs:
          - targets: ['node-exporter:9100']
```

### Grafana Dashboard Configuration
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboards
  namespace: monitoring
data:
  online-boutique.json: |
    {
      "dashboard": {
        "title": "Online Boutique Metrics",
        "panels": [
          {
            "title": "Request Rate",
            "targets": [
              {
                "expr": "rate(http_requests_total[5m])"
              }
            ]
          }
        ]
      }
    }
```

## Logging Stack Implementation

### Loki Configuration
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: loki-config
  namespace: monitoring
data:
  loki.yaml: |
    auth_enabled: false
    server:
      http_listen_port: 3100
    ingester:
      lifecycler:
        address: 127.0.0.1
        ring:
          kvstore:
            store: inmemory
          replication_factor: 1
    schema_config:
      configs:
        - from: 2020-10-24
          store: boltdb-shipper
          object_store: filesystem
          schema: v11
          index:
            prefix: index_
            period: 24h
```

### Promtail Configuration
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: promtail-config
  namespace: monitoring
data:
  promtail.yml: |
    server:
      http_listen_port: 3101
    positions:
      filename: /tmp/positions.yaml
    clients:
      - url: http://loki:3100/loki/api/v1/push
    scrape_configs:
      - job_name: kubernetes-pods
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_node_name]
            target_label: __host__
          - action: labelmap
            regex: __meta_kubernetes_pod_label_(.+)
```

## Testing Applications

### Availability Test Implementation
```python
import requests
import time
from datetime import datetime

class AvailabilityTest:
    def __init__(self, frontend_url, cart_url):
        self.frontend_url = frontend_url
        self.cart_url = cart_url
        self.test_results = []
    
    def test_cart_workflow(self):
        """Test complete cart workflow"""
        try:
            # Test 1: Frontend accessibility
            response = requests.get(f"{self.frontend_url}/")
            assert response.status_code == 200
            
            # Test 2: Add to cart
            add_response = requests.post(
                f"{self.cart_url}/add",
                json={"product_id": "test-product", "quantity": 1}
            )
            assert add_response.status_code == 200
            
            # Test 3: Remove from cart
            remove_response = requests.post(
                f"{self.cart_url}/remove",
                json={"product_id": "test-product"}
            )
            assert remove_response.status_code == 200
            
            return {"status": "pass", "timestamp": datetime.now()}
        except Exception as e:
            return {"status": "fail", "error": str(e), "timestamp": datetime.now()}
```

### Sanity Test Implementation
```python
class SanityTest:
    def __init__(self, services):
        self.services = services
        self.results = {}
    
    def test_all_services(self):
        """Test health of all microservices"""
        for service in self.services:
            try:
                response = requests.get(f"{service}/health", timeout=5)
                self.results[service] = {
                    "status": "healthy" if response.status_code == 200 else "unhealthy",
                    "response_time": response.elapsed.total_seconds()
                }
            except Exception as e:
                self.results[service] = {
                    "status": "error",
                    "error": str(e)
                }
        return self.results
```

## Automation with Makefile

### Deployment Automation
```makefile
DOCKER_IMAGE ?= hashicorp/terraform:1.6
EXEC = docker run --rm -i \
    -e AWS_PROFILE=$(AWS_PROFILE) \
    -v $(HOME)/.aws:/root/.aws \
    -v $(PWD):/data \
    -w /data \
    $(DOCKER_IMAGE)

.PHONY: deploy
deploy:
    @$(EXEC) init -no-color
    @$(EXEC) apply -no-color
    @echo "=== ArgoCD Access Information ==="
    @echo "URL: $$($(EXEC) output -raw argocd_server_url)"
    @echo "Username: $$($(EXEC) output -raw argocd_username)"
    @echo "Password: $$($(EXEC) output -raw argocd_password)"
```

## Horizontal Pod Autoscaler

### HPA Configuration
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nodejs-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nodejs-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

## Helm Chart Structure

### NodeJS Application Chart
```yaml
# values.yaml
replicaCount: 2
image:
  repository: nodejs-app
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: LoadBalancer
  port: 80

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80
```

