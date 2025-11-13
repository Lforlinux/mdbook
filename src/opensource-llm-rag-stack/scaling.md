# Opensource-LLM-RAG-Stack Scaling & Performance

## Horizontal Scaling

### Load Balancing
```yaml
# Multiple Ollama instances behind load balancer
services:
  ollama-1:
    image: ollama/ollama:latest
    deploy:
      replicas: 3
  
  nginx:
    image: nginx:alpine
    ports:
      - "11434:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### Database Scaling
```yaml
# PostgreSQL with read replicas
services:
  postgres-primary:
    image: postgres:15-alpine
    environment:
      POSTGRES_REPLICATION_MODE: master
  
  postgres-replica:
    image: postgres:15-alpine
    environment:
      POSTGRES_REPLICATION_MODE: slave
    depends_on:
      - postgres-primary
```

## Vector Database Scaling

### Chroma Clustering
```python
# Distributed Chroma setup
from chromadb.config import Settings

# Primary Chroma instance
primary_client = chromadb.Client(Settings(
    chroma_db_impl="duckdb+parquet",
    persist_directory="/chroma/primary"
))

# Replica instances for read scaling
replica_clients = [
    chromadb.Client(Settings(
        chroma_db_impl="duckdb+parquet",
        persist_directory=f"/chroma/replica-{i}"
    )) for i in range(3)
]
```

## Performance Optimization

### Caching Strategy
```python
from functools import lru_cache
import redis

redis_client = redis.Redis(host='redis', port=6379, db=0)

@lru_cache(maxsize=1000)
def get_cached_embedding(text):
    """Cache embeddings to avoid recomputation"""
    cache_key = f"embedding:{hash(text)}"
    cached = redis_client.get(cache_key)
    
    if cached:
        return pickle.loads(cached)
    
    embedding = embedding_model.encode(text)
    redis_client.setex(cache_key, 3600, pickle.dumps(embedding))
    return embedding
```

### Query Optimization
```python
# Optimize RAG retrieval
def optimized_retrieve(query, top_k=5, rerank=True):
    # Initial retrieval
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k * 2  # Retrieve more for reranking
    )
    
    if rerank:
        # Rerank using cross-encoder
        reranked = rerank_results(query, results)
        return reranked[:top_k]
    
    return results[:top_k]
```

## Resource Management

### Resource Limits
```yaml
services:
  ollama:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
        reservations:
          cpus: '2'
          memory: 4G
  
  postgres:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

### Auto-Scaling
```yaml
# Docker Swarm auto-scaling
services:
  open-webui:
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
```

## Monitoring Scaling Metrics

### Key Metrics
- **Request Rate**: Requests per second
- **Response Time**: P50, P95, P99 latencies
- **Error Rate**: Percentage of failed requests
- **Resource Usage**: CPU, memory, disk
- **Database Connections**: Active connections
- **Vector DB Size**: Number of documents

### Scaling Triggers
```yaml
# Auto-scaling based on metrics
scaling:
  triggers:
    - metric: cpu_usage
      threshold: 70
      action: scale_up
    - metric: memory_usage
      threshold: 80
      action: scale_up
    - metric: request_latency
      threshold: 1000ms
      action: scale_up
```

## Cost Optimization

### Resource Right-Sizing
- **Ollama**: Adjust based on model size
- **PostgreSQL**: Optimize connection pool
- **Chroma**: Tune index parameters
- **Monitoring**: Use efficient exporters

### Caching Strategy
- **Embedding Cache**: Cache computed embeddings
- **Query Cache**: Cache frequent queries
- **Response Cache**: Cache LLM responses
- **CDN**: Use CDN for static assets
