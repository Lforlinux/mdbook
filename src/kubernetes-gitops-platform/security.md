# Kubernetes GitOps Platform Security & Best Practices

## Network Security

### VPC Configuration
- **Private Subnets**: Worker nodes in private subnets
- **Public Subnets**: Load balancers and NAT gateways
- **Security Groups**: Restrictive network policies
- **VPC Flow Logs**: Network traffic monitoring

### Security Group Rules
```hcl
# Worker node security group
resource "aws_security_group" "worker_group_mgmt" {
  name_prefix = "worker-group-mgmt"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port = 22
    to_port   = 22
    protocol  = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

## IAM Security

### EKS Cluster IAM
```hcl
# Cluster service role
resource "aws_iam_role" "cluster" {
  name = "eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })
}

# Attach required policies
resource "aws_iam_role_policy_attachment" "cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.cluster.name
}
```

### Node Group IAM
```hcl
# Worker node role
resource "aws_iam_role" "nodes" {
  name = "eks-node-group-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Required policies
resource "aws_iam_role_policy_attachment" "nodes_AmazonEKSWorkerNodePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.nodes.name
}
```

## Kubernetes RBAC

### Service Account Configuration
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: prometheus
  namespace: monitoring
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: prometheus
rules:
  - apiGroups: [""]
    resources:
      - nodes
      - nodes/proxy
      - services
      - endpoints
      - pods
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: prometheus
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: prometheus
subjects:
  - kind: ServiceAccount
    name: prometheus
    namespace: monitoring
```

## Secrets Management

### Kubernetes Secrets
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: production
type: Opaque
data:
  database-password: <base64-encoded>
  api-key: <base64-encoded>
```

### AWS Secrets Manager Integration
```hcl
# Retrieve secret from AWS Secrets Manager
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "production/database/password"
}

# Use in Kubernetes
resource "kubernetes_secret" "app_secrets" {
  metadata {
    name      = "app-secrets"
    namespace = "production"
  }

  data = {
    database-password = data.aws_secretsmanager_secret_version.db_password.secret_string
  }
}
```

## Pod Security

### Pod Security Standards
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### Security Context
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: secure-app
spec:
  template:
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 2000
      containers:
      - name: app
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
              - ALL
```

## Network Policies

### Pod-to-Pod Communication
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: frontend-policy
  namespace: online-boutique
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

## ArgoCD Security

### RBAC Configuration
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  policy.default: role:readonly
  policy.csv: |
    p, role:admin, applications, *, */*, allow
    p, role:admin, clusters, get, *, allow
    p, role:admin, repositories, get, *, allow
    g, admins, role:admin
```

### Repository Access
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: repo-credentials
  namespace: argocd
type: Opaque
stringData:
  url: https://github.com/Lforlinux/k8s-platform-toolkit.git
  username: git
  password: <token>
```

## Security Best Practices

### 1. **Least Privilege**
- Grant minimum required permissions
- Use service accounts with specific roles
- Limit IAM policy scope
- Regular permission audits

### 2. **Encryption**
- Encrypt data at rest (EBS volumes)
- Encrypt data in transit (TLS/SSL)
- Use encrypted secrets
- Enable EKS encryption

### 3. **Image Security**
- Scan container images for vulnerabilities
- Use trusted base images
- Keep images updated
- Implement image signing

### 4. **Network Segmentation**
- Use network policies
- Isolate namespaces
- Limit external access
- Monitor network traffic

### 5. **Audit Logging**
- Enable Kubernetes audit logs
- Log all API requests
- Monitor access patterns
- Alert on suspicious activity

### 6. **Compliance**
- Follow CIS Kubernetes Benchmark
- Implement security policies
- Regular security assessments
- Document security procedures

## Security Checklist

- [ ] VPC with private subnets configured
- [ ] Security groups with restrictive rules
- [ ] IAM roles with least privilege
- [ ] RBAC policies configured
- [ ] Network policies implemented
- [ ] Secrets encrypted and secured
- [ ] Pod security standards enforced
- [ ] Image scanning enabled
- [ ] Audit logging configured
- [ ] Regular security updates applied

