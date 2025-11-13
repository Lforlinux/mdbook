# Opensource-LLM-RAG-Stack Troubleshooting

## Common Issues

### Ollama Not Starting
```bash
# Check Ollama logs
docker logs ollama

# Verify Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
docker restart ollama

# Check available models
docker exec -it ollama ollama list
```

**Solutions:**
- Ensure sufficient memory (8GB+ recommended)
- Check disk space for model storage
- Verify network connectivity
- Review Ollama logs for errors

### Chroma Connection Issues
```bash
# Check Chroma health
curl http://localhost:8000/api/v2/heartbeat

# Verify Chroma collections
curl http://localhost:8000/api/v2/tenants/default/databases/default/collections

# Check Chroma logs
docker logs chroma
```

**Solutions:**
- Verify Chroma container is running
- Check network connectivity
- Ensure proper volume mounts
- Review Chroma configuration

### PostgreSQL Connection Errors
```bash
# Check PostgreSQL status
docker exec -it postgres pg_isready

# Test connection
docker exec -it postgres psql -U user -d chatdb -c "SELECT version();"

# Check PostgreSQL logs
docker logs postgres
```

**Solutions:**
- Verify database credentials
- Check connection string format
- Ensure database is initialized
- Review PostgreSQL logs

### RAG Not Working
```bash
# Test document upload
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "content": "Test content"}'

# Verify embeddings
curl http://localhost:8000/api/v2/collections

# Test query
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "test query"}'
```

**Solutions:**
- Verify document processing pipeline
- Check embedding generation
- Ensure Chroma has documents
- Review RAG implementation logs

## Performance Issues

### Slow Query Response
```bash
# Check service response times
time curl http://localhost:3000/api/health

# Monitor resource usage
docker stats

# Check database performance
docker exec -it postgres psql -U user -d chatdb -c "EXPLAIN ANALYZE SELECT * FROM documents;"
```

**Solutions:**
- Optimize database queries
- Add appropriate indexes
- Increase resource allocation
- Implement caching

### High Memory Usage
```bash
# Check memory usage
docker stats --no-stream

# Check Ollama memory
docker exec -it ollama ollama ps

# Monitor memory per service
docker stats ollama postgres chroma
```

**Solutions:**
- Reduce model size
- Limit concurrent requests
- Optimize batch sizes
- Add memory limits

## Debugging Commands

### Service Health Checks
```bash
# Check all services
docker-compose ps

# Check service logs
docker-compose logs [service-name]

# Follow logs
docker-compose logs -f [service-name]

# Restart service
docker-compose restart [service-name]
```

### Database Debugging
```bash
# Connect to PostgreSQL
docker exec -it postgres psql -U user -d chatdb

# Check table sizes
SELECT pg_size_pretty(pg_total_relation_size('documents'));

# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM documents WHERE content LIKE '%test%';
```

### Vector DB Debugging
```bash
# Check Chroma collections
curl http://localhost:8000/api/v2/collections | jq

# Get collection stats
curl http://localhost:8000/api/v2/collections/{collection_id} | jq

# Query test
curl -X POST http://localhost:8000/api/v2/collections/{collection_id}/query \
  -H "Content-Type: application/json" \
  -d '{"query_texts": ["test"], "n_results": 5}'
```

## Recovery Procedures

### Data Backup
```bash
# Backup PostgreSQL
docker exec postgres pg_dump -U user chatdb > backup.sql

# Backup Chroma data
docker exec chroma tar -czf /tmp/chroma-backup.tar.gz /chroma/chroma

# Backup volumes
docker run --rm -v rag-stack_pgdata:/data -v $(pwd):/backup \
  alpine tar -czf /backup/pgdata-backup.tar.gz /data
```

### Data Restore
```bash
# Restore PostgreSQL
docker exec -i postgres psql -U user chatdb < backup.sql

# Restore Chroma
docker exec chroma tar -xzf /tmp/chroma-backup.tar.gz -C /

# Restore volumes
docker run --rm -v rag-stack_pgdata:/data -v $(pwd):/backup \
  alpine tar -xzf /backup/pgdata-backup.tar.gz -C /
```

## Monitoring & Logging

### View All Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs ollama

# Last 100 lines
docker-compose logs --tail=100

# Follow logs
docker-compose logs -f
```

### Check Metrics
```bash
# Prometheus metrics
curl http://localhost:9090/api/v1/query?query=up

# Grafana dashboards
open http://localhost:3001

# Service health
curl http://localhost:3000/health
curl http://localhost:8000/api/v2/heartbeat
curl http://localhost:11434/api/tags
```
