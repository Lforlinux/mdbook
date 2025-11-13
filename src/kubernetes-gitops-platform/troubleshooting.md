# Kubernetes GitOps Platform Troubleshooting

## Cluster Access Issues

### Verify AWS Credentials
```bash
# Check AWS identity
aws sts get-caller-identity

# Verify credentials
aws configure list

# Test EKS access
aws eks list-clusters --region us-east-1
```

### Update Kubeconfig
```bash
# Get cluster details from Terraform
terraform output cluster_name
terraform output region

# Update kubeconfig
aws eks --region $(terraform output -raw region) \
  update-kubeconfig --name $(terraform output -raw cluster_name)

# Verify access
kubectl get nodes
```

### Common Issues
- **Invalid credentials**: Check AWS credentials configuration
- **Wrong region**: Verify cluster region matches
- **Network issues**: Check VPC and security groups
- **IAM permissions**: Verify required IAM policies

## ArgoCD Issues

### ArgoCD Not Accessible
```bash
# Check ArgoCD server status
kubectl get svc -n argocd argocd-server

# Get LoadBalancer URL
kubectl get svc -n argocd argocd-server -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Check ArgoCD pods
kubectl get pods -n argocd

# View ArgoCD logs
kubectl logs -n argocd deployment/argocd-server
```

### Get ArgoCD Password
```bash
# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# Or use argocd CLI
argocd admin initial-password -n argocd
```

### Application Sync Issues
```bash
# List all applications
kubectl get applications -n argocd

# Describe application
kubectl describe application <app-name> -n argocd

# Check sync status
argocd app get <app-name>

# Manual sync
argocd app sync <app-name>

# Force refresh
argocd app get <app-name> --refresh
```

### Common ArgoCD Issues
- **Repository access**: Check repository credentials
- **Sync failures**: Review application manifests
- **Health status**: Check pod and service status
- **Permission errors**: Verify RBAC configuration

## Pod Issues

### Pod Not Starting
```bash
# Check pod status
kubectl get pods -n <namespace>

# Describe pod
kubectl describe pod <pod-name> -n <namespace>

# View pod logs
kubectl logs <pod-name> -n <namespace>

# Check events
kubectl get events -n <namespace> --sort-by='.lastTimestamp'
```

### Common Pod Issues
- **ImagePullBackOff**: Check image name and registry access
- **CrashLoopBackOff**: Check application logs and configuration
- **Pending**: Check resource availability and node capacity
- **Error**: Review container logs and health checks

### Resource Issues
```bash
# Check node resources
kubectl top nodes

# Check pod resources
kubectl top pods -n <namespace>

# Check resource requests/limits
kubectl describe pod <pod-name> -n <namespace> | grep -A 5 "Limits\|Requests"
```

## Service Issues

### Service Not Accessible
```bash
# Check service status
kubectl get svc -n <namespace>

# Describe service
kubectl describe svc <service-name> -n <namespace>

# Check endpoints
kubectl get endpoints <service-name> -n <namespace>

# Test service from pod
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  wget -O- http://<service-name>.<namespace>.svc.cluster.local
```

### LoadBalancer Issues
```bash
# Check LoadBalancer status
kubectl get svc -n <namespace> <service-name>

# Check AWS ELB
aws elbv2 describe-load-balancers --region us-east-1

# Check target health
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn> \
  --region us-east-1
```

## Network Issues

### DNS Resolution
```bash
# Test DNS from pod
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  nslookup <service-name>.<namespace>.svc.cluster.local

# Check CoreDNS
kubectl get pods -n kube-system -l k8s-app=kube-dns

# Check CoreDNS logs
kubectl logs -n kube-system -l k8s-app=kube-dns
```

### Network Policies
```bash
# List network policies
kubectl get networkpolicies -n <namespace>

# Describe network policy
kubectl describe networkpolicy <policy-name> -n <namespace>

# Temporarily disable for testing
kubectl delete networkpolicy <policy-name> -n <namespace>
```

## Monitoring Issues

### Prometheus Not Scraping
```bash
# Check Prometheus targets
# Access Prometheus UI and check /targets endpoint

# Check service discovery
kubectl get pods -n monitoring -l app=prometheus
kubectl logs -n monitoring -l app=prometheus

# Verify service annotations
kubectl get pod <pod-name> -n <namespace> -o yaml | grep prometheus.io
```

### Grafana Not Loading Dashboards
```bash
# Check Grafana pods
kubectl get pods -n monitoring -l app=grafana

# Check Grafana logs
kubectl logs -n monitoring -l app=grafana

# Verify data source
# Access Grafana UI and check data source configuration
```

## Application-Specific Issues

### Online Boutique Issues
```bash
# Check all microservices
kubectl get pods -n online-boutique

# Check specific service
kubectl logs -n online-boutique deployment/<service-name>

# Test service connectivity
kubectl exec -it -n online-boutique <pod-name> -- curl http://<service-name>:<port>
```

### Sanity Test Issues
```bash
# Check sanity test status
kubectl get pods -n sanity-test

# View test results
kubectl logs -n sanity-test deployment/sanity-test

# Access dashboard
kubectl get svc -n sanity-test sanity-test-loadbalancer
```

### Availability Test Issues
```bash
# Check availability test
kubectl get pods -n availability-test

# View test logs
kubectl logs -n availability-test deployment/availability-test

# Check test results
curl http://<availability-test-lb-url>/api/status
```

## Terraform Issues

### State Lock
```bash
# Check for state lock
terraform force-unlock <lock-id>

# Or remove lock manually
aws dynamodb delete-item \
  --table-name terraform-state-lock \
  --key '{"LockID":{"S":"<lock-id>"}}'
```

### State Issues
```bash
# Refresh state
terraform refresh

# Import existing resource
terraform import <resource> <resource-id>

# Validate configuration
terraform validate

# Format code
terraform fmt
```

### Deployment Failures
```bash
# Check Terraform logs
terraform apply -no-color 2>&1 | tee terraform.log

# Review plan
terraform plan -detailed-exitcode

# Destroy and recreate
terraform destroy
terraform apply
```

## Performance Issues

### Slow Pod Startup
```bash
# Check node resources
kubectl describe node <node-name>

# Check pod scheduling
kubectl get events --field-selector involvedObject.name=<pod-name>

# Check image pull time
kubectl describe pod <pod-name> | grep -A 5 "Events"
```

### High Resource Usage
```bash
# Check resource usage
kubectl top nodes
kubectl top pods --all-namespaces

# Check HPA status
kubectl get hpa --all-namespaces

# Review resource requests/limits
kubectl describe pod <pod-name> | grep -A 5 "Limits\|Requests"
```

## Debugging Commands

### General Debugging
```bash
# Get all resources in namespace
kubectl get all -n <namespace>

# Describe resource
kubectl describe <resource-type> <resource-name> -n <namespace>

# View logs
kubectl logs <pod-name> -n <namespace> --tail=100 -f

# Execute command in pod
kubectl exec -it <pod-name> -n <namespace> -- /bin/sh

# Port forward for local access
kubectl port-forward -n <namespace> <pod-name> 8080:8080
```

### Cluster Debugging
```bash
# Check cluster status
kubectl cluster-info

# Check API server
kubectl get --raw /healthz

# Check node status
kubectl get nodes -o wide

# Check system pods
kubectl get pods -n kube-system
```

