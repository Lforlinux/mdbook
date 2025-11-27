# Kubernetes GitOps Platform - OPA Policy Enforcement

## What is OPA (Open Policy Agent)?

Open Policy Agent (OPA) is an open-source, general-purpose policy engine that enables unified, context-aware policy enforcement across the entire stack. In Kubernetes, OPA is implemented via Gatekeeper, which provides policy enforcement for Kubernetes resources.

### Key Concepts

- **Policy as Code**: Policies are written in Rego, a declarative language
- **Admission Control**: Policies are enforced at the Kubernetes API level
- **Gatekeeper**: Kubernetes-native implementation of OPA
- **ConstraintTemplates**: Define reusable policy logic
- **Constraints**: Apply policies to specific resources/namespaces

## Why OPA for Kubernetes?

### Benefits

1. **Security**: Enforce security best practices automatically
2. **Compliance**: Meet regulatory requirements (SOC 2, PCI-DSS, HIPAA)
3. **Governance**: Ensure consistent resource configurations
4. **Prevention**: Block bad configurations before they reach the cluster
5. **Audit**: Track policy violations for compliance reporting

### Real-World Impact

**Without OPA:**
- Developers accidentally deploy insecure configurations
- Manual security reviews are time-consuming
- Inconsistent security postures across teams
- Compliance violations discovered after deployment

**With OPA:**
- Bad configurations are blocked automatically
- Security is enforced consistently
- Compliance is built into the deployment process
- Violations are caught before production

## OPA Implementation in Kubernetes GitOps Platform

### Architecture

```
┌─────────────────┐
│  Developer      │
│  kubectl apply  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Kubernetes API  │
│     Server      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ OPA Gatekeeper  │
│  Validates      │
│  Policies       │
└────────┬────────┘
         │
    ✅ Allow or ❌ Deny
```

### Components

1. **Gatekeeper Controller**: Validates resources against policies
2. **ConstraintTemplates**: Define policy logic in Rego
3. **Constraints**: Apply policies to specific resources
4. **Audit**: Continuously validates existing resources

## Implemented Policies

### 1. Require Non-Root Users

**Purpose**: Ensures all containers run as non-root users for security compliance.

**Policy Definition**:
```yaml
apiVersion: templates.gatekeeper.sh/v1beta1
kind: ConstraintTemplate
metadata:
  name: k8srequirednonroot
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredNonRoot
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequirednonroot
        
        violation[{"msg": msg}] {
            container := input.review.object.spec.containers[_]
            not container.securityContext.runAsNonRoot
            not container.securityContext.runAsUser
            msg := sprintf("Container '%v' must run as non-root user", [container.name])
        }
```

**Enforcement**:
```yaml
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredNonRoot
metadata:
  name: online-boutique-must-run-nonroot
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
    namespaces: ["online-boutique"]
  parameters: {}
```

**What It Blocks**:
- Pods without `securityContext.runAsNonRoot: true`
- Containers with `runAsUser: 0` (root)
- Pods missing security context configuration

### 2. Require Resource Limits

**Purpose**: Forces CPU and memory limits on all containers to prevent resource exhaustion.

**What It Enforces**:
- CPU limits on all containers
- Memory limits on all containers
- Prevents "noisy neighbor" problems
- Enables fair resource scheduling

**Example Violation**:
```yaml
# This pod would be blocked
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: app
    image: nginx
    # Missing resources.limits
```

### 3. Disallow Latest Tags

**Purpose**: Blocks images with `:latest` tag for production stability.

**Why It Matters**:
- `:latest` tags are unpredictable
- Can break deployments unexpectedly
- Makes rollbacks difficult
- Violates reproducible deployments

**What It Blocks**:
- Images with `:latest` tag
- Images without explicit tags
- Unversioned images

### 4. Require Read-Only Root Filesystem

**Purpose**: Forces containers to use read-only root filesystem for security.

**Benefits**:
- Prevents malicious code from writing to filesystem
- Immutable container principle
- Reduces attack surface
- Security hardening

### 5. Disallow Privileged Containers

**Purpose**: Blocks containers with `privileged: true` for security.

**Why Critical**:
- Privileged containers have full host access
- Can escape container isolation
- Major security risk
- Should be extremely rare

### 6. Require Labels

**Purpose**: Forces pods to have required labels for organization and monitoring.

**Required Labels**:
- `app`: Application name
- `team`: Team ownership
- `environment`: Environment (dev, staging, prod)

**Benefits**:
- Cost tracking and allocation
- Monitoring and alerting
- Resource organization
- Multi-tenant governance

## Enforcement Modes

### 1. Enforce Mode (Production)

**Behavior**: Blocks violations completely

```yaml
spec:
  enforcementAction: deny  # Default
```

**Result**: Pods are rejected if they violate policies

**Use Case**: Production environments where security is critical

### 2. Dryrun Mode (Demo/Audit)

**Behavior**: Reports violations but allows deployments

```yaml
spec:
  enforcementAction: dryrun
```

**Result**: Pods are created, violations are logged

**Use Case**: Demo environments, testing, gradual rollout

### 3. Warn Mode (Soft Enforcement)

**Behavior**: Warnings in events but allows deployments

```yaml
spec:
  enforcementAction: warn
```

**Result**: Pods are created with warnings in Kubernetes events

**Use Case**: Migration period, gradual adoption

### Switching Enforcement Modes

```bash
# Switch to dryrun mode (non-blocking)
cd opa/deployment
./switch-enforcement-mode.sh dryrun online-boutique-must-run-nonroot

# Switch to enforce mode (blocking)
./switch-enforcement-mode.sh enforce online-boutique-must-run-nonroot

# Switch to warn mode (soft)
./switch-enforcement-mode.sh warn online-boutique-must-run-nonroot
```

## Deployment

### Prerequisites

Gatekeeper must be installed (via Helm in `k8s-infrastructure-as-code` repo).

### Deploy All Policies

```bash
# Deploy all OPA policies
./opa/deploy-opa-policies.sh

# Or manually with Kustomize
kubectl apply -k opa/k8s-policy-manifest/
```

### Deployment Order

1. **Gatekeeper Installation**: Via Helm (creates CRDs)
2. **ConstraintTemplates**: Applied first (creates Constraint CRDs)
3. **Constraints**: Applied second (may need retry if CRDs not ready)

```bash
# If constraints fail, wait and retry
sleep 10 && kubectl apply -k opa/k8s-policy-manifest/
```

## Policy Validation Flow

### Step-by-Step Process

1. **Developer Action**: `kubectl apply -f pod.yaml`
2. **API Server**: Receives request
3. **Gatekeeper**: Intercepts via admission webhook
4. **Policy Evaluation**: Rego policies are evaluated
5. **Decision**: Allow or deny based on policies
6. **Response**: Pod created or error returned

### Example: Non-Root Policy

```bash
# Try to create pod as root (will be blocked)
kubectl run test-root-pod --image=nginx --restart=Never \
  -n online-boutique \
  --overrides='{"spec":{"containers":[{"name":"test","securityContext":{"runAsUser":0}}]}}'

# Error: admission webhook "validation.gatekeeper.sh" denied the request
```

## Audit and Compliance

### Audit Existing Resources

```bash
# Audit all policies
./opa/audit-policies.sh all

# Audit specific policy
./opa/audit-policies.sh resource-limits online-boutique

# Audit all namespaces
./opa/audit-policies.sh all-namespace
```

### View Violations

```bash
# Check constraint status
kubectl get K8sRequiredNonRoot online-boutique-must-run-nonroot

# View detailed violations
kubectl describe K8sRequiredNonRoot online-boutique-must-run-nonroot

# Get violation count
kubectl get K8sRequiredNonRoot online-boutique-must-run-nonroot \
  -o jsonpath='{.status.totalViolations}'
```

### Compliance Reporting

OPA provides:
- **Real-time Violations**: Current policy violations
- **Audit Trail**: Historical violation tracking
- **Compliance Status**: Per-policy compliance metrics
- **Resource Coverage**: Percentage of resources compliant

## Integration with GitOps

### ArgoCD Integration

OPA policies work seamlessly with ArgoCD:

1. **Git Commit**: Developer commits configuration
2. **ArgoCD Sync**: Attempts to deploy to cluster
3. **OPA Validation**: Gatekeeper validates resources
4. **Result**: Deployment succeeds or fails based on policies

**Benefits**:
- Bad configurations from Git are blocked
- GitOps safety net
- Automatic policy enforcement
- No manual review needed

### Sync Waves

OPA policies can be deployed in sync waves:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: opa-policies
  annotations:
    argocd.argoproj.io/sync-wave: "1"  # Deploy before applications
```

## Troubleshooting

### Policy Not Working

```bash
# Check Gatekeeper is running
kubectl get pods -n gatekeeper-system

# Check constraint template is installed
kubectl get constrainttemplate

# Check constraint status
kubectl get K8sRequiredNonRoot

# View Gatekeeper logs
kubectl logs -n gatekeeper-system -l control-plane=controller-manager
```

### Policy Blocking Valid Pods

```bash
# Switch to dryrun mode for testing
cd opa/deployment
./switch-enforcement-mode.sh dryrun <constraint-name>

# Or temporarily disable constraint
kubectl delete -f opa/k8s-policy-manifest/constraint-online-boutique-nonroot.yaml
```

### CRD Not Ready

```bash
# Wait for CRDs to be established
kubectl wait --for condition=established crd/constrainttemplates.templates.gatekeeper.sh

# Retry constraint deployment
kubectl apply -k opa/k8s-policy-manifest/
```

## Best Practices

### 1. Start with Security Policies
- Non-root users
- Read-only filesystem
- No privileged containers

### 2. Add Resource Management
- Resource limits
- Resource requests
- Quotas

### 3. Enforce Image Security
- No latest tags
- Approved registries
- Image digests

### 4. Use Dryrun First
- Test policies in dryrun mode
- Identify violations
- Fix issues before enforcing

### 5. Monitor Violations
- Regular audit checks
- Track violation trends
- Update policies as needed

## Advanced Use Cases

### Custom Policies

Create custom ConstraintTemplates for organization-specific requirements:

```rego
package custompolicy

violation[{"msg": msg}] {
    # Custom policy logic
    input.review.object.spec.containers[_]
    # Your validation rules
    msg := "Custom policy violation"
}
```

### Multi-Namespace Policies

Apply policies across multiple namespaces:

```yaml
spec:
  match:
    namespaces: ["production", "staging"]
```

### Exemptions

Exempt specific resources from policies:

```yaml
spec:
  match:
    excludedNamespaces: ["kube-system", "gatekeeper-system"]
```

## Metrics and Monitoring

### Gatekeeper Metrics

- Policy evaluation count
- Violation count
- Admission latency
- Audit scan duration

### Prometheus Integration

Gatekeeper exposes metrics for Prometheus:
- `gatekeeper_violations_total`
- `gatekeeper_admission_duration_seconds`
- `gatekeeper_audit_duration_seconds`

## Summary

OPA Gatekeeper provides:
- **Automatic Security**: No manual checks needed
- **Consistent Enforcement**: Same rules for everyone
- **GitOps Safety**: Bad configs from Git are blocked
- **Compliance**: Automatic audit trail
- **Prevention**: Issues caught before deployment

This ensures your Kubernetes cluster maintains security and compliance standards automatically, without requiring manual intervention or review.

