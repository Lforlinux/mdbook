# Kubernetes GitOps Platform Deployment

## Prerequisites

### AWS Account Setup
- AWS account with programmatic access
- IAM user with required policies:
  - `AmazonEC2FullAccess`
  - `IAMFullAccess`
  - `AutoScalingFullAccess`
  - `AmazonEKSClusterPolicy`
  - `AmazonEKSWorkerNodePolicy`
  - `AmazonVPCFullAccess`
  - `AmazonEKSServicePolicy`
  - `AmazonEKS_CNI_Policy`

### Local Requirements
- Docker installed and running
- AWS CLI configured with credentials
- Git for cloning repositories

## Quick Start Deployment

### 1. Clone Infrastructure Repository
```bash
git clone https://github.com/Lforlinux/k8s-infrastructure-as-code.git
cd k8s-infrastructure-as-code
```

### 2. Configure AWS Credentials
```bash
# Option 1: AWS CLI configuration
aws configure

# Option 2: Environment variable
export AWS_PROFILE=your-profile
```

### 3. Deploy Entire Stack
```bash
make deploy
```

This single command:
1. Initializes Terraform
2. Plans infrastructure changes
3. Applies infrastructure (VPC, EKS, ArgoCD)
4. Displays access information

### 4. Review Deployment Output
After deployment, you'll see:
- Kubernetes cluster access command
- ArgoCD server URL
- ArgoCD username and password

## Deployment Workflow

### Infrastructure Deployment
```
1. Terraform Init
   ↓
2. Terraform Plan (Review changes)
   ↓
3. Terraform Apply (Create resources)
   ↓
4. EKS Cluster Created
   ↓
5. ArgoCD Installed via Helm
   ↓
6. App-of-Apps Pattern Configured
```

### Platform Toolkit Deployment
```
1. ArgoCD Detects App-of-Apps
   ↓
2. References k8s-platform-toolkit Repository
   ↓
3. Deploys Applications in Sync Waves
   ↓
4. Monitoring Stack (Wave 3)
   ↓
5. Logging Stack (Wave 4-5)
   ↓
6. Testing Applications (Wave 1)
   ↓
7. Demo Applications (Wave 2)
```

## Accessing the Cluster

### Kubernetes Access
```bash
# Get cluster name and region from Terraform
aws eks --region $(terraform output -raw region) \
  update-kubeconfig --name $(terraform output -raw cluster_name)

# Verify access
kubectl get nodes
```

### ArgoCD Access
```bash
# Get ArgoCD LoadBalancer URL
kubectl get svc -n argocd argocd-server

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

### Application Access
```bash
# List all LoadBalancer services
kubectl get svc --all-namespaces -o wide | grep LoadBalancer

# Access specific services
# Grafana: http://<grafana-lb-url>
# Prometheus: http://<prometheus-lb-url>
# Online Boutique: http://<frontend-lb-url>
```

## GitOps Workflow

### Making Changes

1. **Update Application Code**
   ```bash
   # Make changes to application
   vim k8s-platform-toolkit/application/online-boutique/online-boutique-manifest.yaml
   ```

2. **Commit and Push**
   ```bash
   git add .
   git commit -m "Update application configuration"
   git push origin main
   ```

3. **ArgoCD Auto-Sync**
   - ArgoCD detects Git changes
   - Automatically syncs applications
   - Performs rolling updates

4. **Monitor Deployment**
   ```bash
   # Watch ArgoCD applications
   kubectl get applications -n argocd -w
   
   # Check sync status
   argocd app get <app-name>
   ```

## Zero-Downtime Deployments

### Rolling Update Strategy
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-app
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: app
        image: nodejs-app:v2.0.0
```

### Deployment Process
1. New pods created with new image
2. Readiness probes verify health
3. Old pods terminated after new pods ready
4. Service continues serving traffic throughout

## Application Lifecycle

### Adding New Application

1. **Create Application Manifests**
   ```bash
   # In k8s-platform-toolkit repository
   mkdir -p application/my-app
   # Create deployment.yaml, service.yaml, etc.
   ```

2. **Create ArgoCD Application Definition**
   ```yaml
   # argocd/apps/my-app.yaml
   apiVersion: argoproj.io/v1alpha1
   kind: Application
   metadata:
     name: my-app
   spec:
     source:
       repoURL: https://github.com/Lforlinux/k8s-platform-toolkit.git
       path: application/my-app
     destination:
       server: https://kubernetes.default.svc
       namespace: my-app
   ```

3. **Commit and Push**
   ```bash
   git add .
   git commit -m "Add new application"
   git push origin main
   ```

4. **ArgoCD Auto-Deploys**
   - Detects new application definition
   - Creates namespace
   - Deploys application

### Updating Applications

1. **Update Manifests in Git**
2. **ArgoCD Detects Changes**
3. **Automatic Sync (if enabled)**
4. **Rolling Update Performed**

### Removing Applications

1. **Delete ArgoCD Application**
   ```bash
   kubectl delete application my-app -n argocd
   ```

2. **Or Remove from Git**
   - Delete application definition
   - ArgoCD removes application
   - Resources cleaned up

## Troubleshooting Deployment

### Check Terraform State
```bash
# View current state
terraform show

# List resources
terraform state list

# Inspect specific resource
terraform state show module.eks.aws_eks_cluster.this[0]
```

### Check ArgoCD Sync Status
```bash
# List all applications
kubectl get applications -n argocd

# Describe application
kubectl describe application <app-name> -n argocd

# Check sync status
argocd app sync <app-name>
```

### Verify Pod Status
```bash
# Check all pods
kubectl get pods --all-namespaces

# Check specific namespace
kubectl get pods -n monitoring

# View pod logs
kubectl logs <pod-name> -n <namespace>
```

