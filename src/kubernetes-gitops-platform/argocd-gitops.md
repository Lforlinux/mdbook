# Kubernetes GitOps Platform - ArgoCD GitOps

## What is ArgoCD?

ArgoCD is a declarative, GitOps continuous delivery tool for Kubernetes. It automates the deployment of applications to Kubernetes clusters by continuously monitoring Git repositories and automatically syncing the desired state defined in Git with the actual state in the cluster.

### Key Concepts

- **GitOps**: Git as the single source of truth
- **Declarative**: Define desired state, ArgoCD makes it happen
- **Continuous Sync**: Automatically detects and applies changes
- **Self-Healing**: Automatically corrects drift from desired state
- **Multi-Environment**: Manage multiple clusters and environments

## Why ArgoCD for Kubernetes?

### Benefits

1. **Automation**: Automatic deployment from Git
2. **Consistency**: Same process for all applications
3. **Audit Trail**: All changes tracked in Git
4. **Rollback**: Easy rollback via Git revert
5. **Multi-Cluster**: Manage multiple clusters from one place
6. **RBAC**: Fine-grained access control
7. **UI & CLI**: Both web interface and command-line tools

### GitOps Principles

1. **Git as Source of Truth**: All configurations in Git
2. **Declarative Descriptions**: Define what you want, not how
3. **Automated Sync**: Changes automatically applied
4. **Reconciliation**: Continuous state verification
5. **Observability**: Full visibility into deployments

## ArgoCD Implementation in Kubernetes GitOps Platform

### Architecture

```
┌─────────────────┐
│  Git Repository │
│  (Source of     │
│   Truth)        │
└────────┬────────┘
         │
         │ Monitors
         │
┌────────▼────────┐
│   ArgoCD        │
│   Controller    │
└────────┬────────┘
         │
         │ Syncs
         │
┌────────▼────────┐
│  Kubernetes     │
│  Cluster        │
└─────────────────┘
```

### Components

1. **ArgoCD Server**: API server and UI
2. **Application Controller**: Syncs applications
3. **Repo Server**: Clones and caches Git repositories
4. **Redis**: Caching and session storage

## App-of-Apps Pattern

### What is App-of-Apps?

App-of-Apps is an ArgoCD pattern where a root application manages multiple child applications. This provides centralized management and consistent deployment patterns.

### Implementation

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
      recurse: true  # Discovers all applications
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true      # Remove resources not in Git
      selfHeal: true   # Auto-correct drift
    syncOptions:
      - CreateNamespace=true
```

### Benefits

- **Centralized Management**: Single point of control
- **Automatic Discovery**: Discovers all applications recursively
- **Consistent Patterns**: Same deployment approach for all apps
- **Easy Scaling**: Add new apps by adding files to Git

## Application Definitions

### Monitoring Stack Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: monitoring-stack
  namespace: argocd
  annotations:
    argocd.argoproj.io/sync-wave: "3"  # Deploy in wave 3
spec:
  project: default
  source:
    repoURL: https://github.com/Lforlinux/k8s-platform-toolkit.git
    path: monitoring
    targetRevision: HEAD
  destination:
    server: https://kubernetes.default.svc
    namespace: monitoring
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

### Sync Waves

Sync waves control deployment order:

```yaml
annotations:
  argocd.argoproj.io/sync-wave: "1"  # Deploy first
  argocd.argoproj.io/sync-wave: "2"  # Deploy second
  argocd.argoproj.io/sync-wave: "3"  # Deploy third
```

**Typical Order**:
1. **Wave 1**: Testing infrastructure (sanity-test, availability-test)
2. **Wave 2**: Demo applications (online-boutique)
3. **Wave 3**: Monitoring stack (Prometheus, Grafana)
4. **Wave 4**: Logging stack (Loki)
5. **Wave 5**: Log collection (Promtail)

## Deployment Workflow

### GitOps Flow

1. **Developer**: Makes changes in Git repository
2. **Commit & Push**: Changes pushed to main branch
3. **ArgoCD Detection**: ArgoCD detects changes automatically
4. **Sync**: Applications sync with desired state
5. **Verification**: Health checks validate deployment
6. **Monitoring**: Continuous state reconciliation

### Automated Sync

```yaml
syncPolicy:
  automated:
    prune: true      # Delete resources not in Git
    selfHeal: true   # Auto-correct manual changes
```

**What It Does**:
- **Prune**: Removes resources deleted from Git
- **Self-Heal**: Reverts manual changes to match Git
- **Auto-Sync**: Automatically syncs on Git changes

### Manual Sync

```bash
# Sync specific application
argocd app sync monitoring-stack

# Sync all applications
argocd app sync --all

# Force refresh
argocd app get monitoring-stack --refresh
```

## Application Management

### List Applications

```bash
# List all applications
argocd app list

# Get application details
argocd app get monitoring-stack

# View application status
argocd app get monitoring-stack --refresh
```

### Application Status

**Healthy**: Application is synced and all resources are healthy
**Syncing**: Application is currently syncing
**OutOfSync**: Git and cluster states differ
**Unknown**: Status cannot be determined
**Degraded**: Some resources are unhealthy

### Viewing Resources

```bash
# View application resources
argocd app resources monitoring-stack

# View application logs
argocd app logs monitoring-stack

# View application events
argocd app events monitoring-stack
```

## Access and Authentication

### Initial Setup

```bash
# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# Port forward to access UI
kubectl port-forward -n argocd svc/argocd-server 8080:443

# Access UI
https://localhost:8080
```

### Login

```bash
# CLI login
argocd login localhost:8080

# Or with username/password
argocd login localhost:8080 --username admin --password <password>
```

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
    g, admins, role:admin
```

## Sync Strategies

### Automatic Sync

```yaml
syncPolicy:
  automated:
    prune: true
    selfHeal: true
```

**When It Syncs**:
- Git repository changes detected
- Manual sync triggered
- Self-healing corrections

### Manual Sync

```yaml
syncPolicy:
  automated: {}  # Disabled
```

**When It Syncs**:
- Manual sync via UI or CLI
- Scheduled sync (if configured)

### Sync Options

```yaml
syncOptions:
  - CreateNamespace=true      # Auto-create namespaces
  - PrunePropagationPolicy=foreground
  - PruneLast=true            # Prune after sync
  - ApplyOutOfSyncOnly=true   # Only sync out-of-sync resources
```

## Rollback and History

### View History

```bash
# View application history
argocd app history monitoring-stack

# View specific revision
argocd app get monitoring-stack --revision <revision>
```

### Rollback

```bash
# Rollback to previous version
argocd app rollback monitoring-stack

# Rollback to specific revision
argocd app rollback monitoring-stack <revision>
```

### Git Revert

```bash
# Revert in Git (recommended)
git revert <commit-hash>
git push origin main

# ArgoCD automatically syncs
```

## Multi-Environment Management

### Environment-Specific Applications

```yaml
# Production
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: monitoring-stack-prod
spec:
  source:
    path: monitoring
    targetRevision: main
  destination:
    server: https://prod-cluster.example.com
    namespace: monitoring

# Staging
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: monitoring-stack-staging
spec:
  source:
    path: monitoring
    targetRevision: develop
  destination:
    server: https://staging-cluster.example.com
    namespace: monitoring
```

## Integration with CI/CD

### GitHub Actions Integration

```yaml
# .github/workflows/deploy.yml
- name: Deploy to ArgoCD
  run: |
    argocd app sync monitoring-stack
    argocd app wait monitoring-stack --health
```

### Webhook Integration

Configure Git webhooks for faster sync:
- GitHub webhooks
- GitLab webhooks
- Bitbucket webhooks

## Troubleshooting

### Application Not Syncing

```bash
# Check application status
argocd app get <app-name>

# Check for sync errors
argocd app get <app-name> --refresh

# View application logs
argocd app logs <app-name>

# Check repository connectivity
argocd repo list
```

### Sync Failures

```bash
# View sync operation details
argocd app get <app-name> --refresh

# Check resource events
kubectl get events -n <namespace>

# View ArgoCD server logs
kubectl logs -n argocd deployment/argocd-server
```

### Repository Access Issues

```bash
# List repositories
argocd repo list

# Add repository
argocd repo add https://github.com/user/repo.git

# Test repository access
argocd repo get https://github.com/user/repo.git
```

## Best Practices

### 1. Use App-of-Apps Pattern

Centralize application management:
- Single root application
- Recursive application discovery
- Consistent deployment patterns

### 2. Enable Automated Sync

For most applications:
```yaml
syncPolicy:
  automated:
    prune: true
    selfHeal: true
```

### 3. Use Sync Waves

Control deployment order:
```yaml
annotations:
  argocd.argoproj.io/sync-wave: "1"
```

### 4. Implement RBAC

Control access:
- Read-only for most users
- Admin for operators
- Project-based access control

### 5. Monitor Applications

Set up monitoring:
- Application health metrics
- Sync status alerts
- Failure notifications

## Summary

ArgoCD provides:
- **GitOps Automation**: Automatic deployment from Git
- **Self-Healing**: Auto-corrects drift from desired state
- **Multi-Environment**: Manage multiple clusters
- **Audit Trail**: All changes tracked in Git
- **Easy Rollback**: Simple rollback via Git revert
- **UI & CLI**: Both web interface and command-line tools

This ensures your Kubernetes applications are always in sync with Git, providing a reliable and auditable deployment process.

