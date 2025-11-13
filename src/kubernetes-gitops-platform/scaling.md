# Kubernetes GitOps Platform Scaling & Performance

## Horizontal Pod Autoscaler (HPA)

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
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
        - type: Pods
          value: 2
          periodSeconds: 15
      selectPolicy: Max
```

### Custom Metrics HPA
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app-hpa-custom
spec:
  metrics:
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "100"
```

## Cluster Autoscaling

### Node Group Configuration
```hcl
eks_managed_node_groups = {
  application = {
    name = "application-nodes"
    instance_types = ["t3.small", "t3.medium"]
    
    min_size     = 1
    max_size     = 10
    desired_size = 3
    
    # Cluster Autoscaler labels
    labels = {
      "k8s.io/cluster-autoscaler/enabled" = "true"
      "k8s.io/cluster-autoscaler/${local.cluster_name}" = "owned"
    }
    
    # Taints and tolerations
    taints = []
  }
}
```

### Cluster Autoscaler Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  replicas: 1
  template:
    spec:
      containers:
      - image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.28.0
        name: cluster-autoscaler
        command:
          - ./cluster-autoscaler
          - --v=4
          - --stderrthreshold=info
          - --cloud-provider=aws
          - --skip-nodes-with-local-storage=false
          - --expander=least-waste
          - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/${CLUSTER_NAME}
        env:
          - name: AWS_REGION
            value: us-east-1
          - name: CLUSTER_NAME
            value: production-eks
```

## Vertical Pod Autoscaler (VPA)

### VPA Configuration
```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: nodejs-app-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nodejs-app
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
      - containerName: app
        minAllowed:
          cpu: 100m
          memory: 128Mi
        maxAllowed:
          cpu: 2
          memory: 2Gi
        controlledResources: ["cpu", "memory"]
```

## Performance Optimization

### Resource Requests and Limits
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: optimized-app
spec:
  template:
    spec:
      containers:
      - name: app
        resources:
          requests:
            cpu: 200m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
```

### Node Affinity
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-with-affinity
spec:
  template:
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                  - key: node-type
                    operator: In
                    values:
                      - application
```

### Pod Disruption Budget
```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: app-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: nodejs-app
```

## Load Testing

### Locust Configuration
```python
from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(1, 3)
    
    @task(3)
    def view_home(self):
        self.client.get("/")
    
    @task(2)
    def add_to_cart(self):
        self.client.post("/cart/add", json={
            "product_id": "test-product",
            "quantity": 1
        })
    
    @task(1)
    def checkout(self):
        self.client.post("/checkout", json={
            "cart_id": "test-cart"
        })
```

### Running Load Tests
```bash
export TARGET_HOST=<your-alb-url>

docker run -i --rm \
  -v $PWD/reports:/opt/reports \
  -p 8089:8089 \
  -e TARGET_HOST=$TARGET_HOST \
  -e LOCUST_FILE=locustfile.py \
  registry.opensource.zalan.do/tip/docker-locust
```

## Monitoring Scaling Events

### HPA Metrics
```bash
# Watch HPA status
kubectl get hpa -w

# Describe HPA
kubectl describe hpa nodejs-app-hpa

# Check scaling events
kubectl get events --field-selector involvedObject.name=nodejs-app-hpa
```

### Cluster Autoscaler Logs
```bash
# View autoscaler logs
kubectl logs -n kube-system deployment/cluster-autoscaler

# Check node scaling
kubectl get nodes -w
```

## Scaling Strategies

### 1. **Predictive Scaling**
- Analyze historical patterns
- Scale before expected load
- Use scheduled scaling
- Monitor trends

### 2. **Reactive Scaling**
- HPA for automatic scaling
- Fast response to load changes
- Multiple metrics consideration
- Stabilization windows

### 3. **Cost Optimization**
- Right-size resource requests
- Use spot instances for non-critical workloads
- Implement cluster autoscaling
- Monitor and optimize

### 4. **Performance Tuning**
- Optimize application code
- Use connection pooling
- Implement caching
- Database query optimization

## Capacity Planning

### Resource Calculation
```
Total CPU Required = (Requests per Pod × CPU per Request) × Desired Pods
Total Memory Required = (Memory per Pod) × Desired Pods

Node Capacity = Node CPU / Pod CPU Request
Max Pods per Node = min(Node Capacity, Pod Limit)
```

### Scaling Triggers
- **CPU Utilization**: > 70% average
- **Memory Utilization**: > 80% average
- **Request Rate**: > Threshold
- **Queue Depth**: > Limit
- **Custom Metrics**: Business-specific

