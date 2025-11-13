# Opensource-LLM-RAG-Stack RAG Implementation Guide

## RAG Implementation

### 1. Document Upload & Processing

```bash
# Access Open WebUI
open http://localhost:3000

# Navigate to Knowledge section
# Upload documents (PDF, TXT, etc.)
# System automatically:
# - Chunks documents
# - Generates embeddings
# - Stores in Chroma vector database
```

### 2. Verify Vector Storage

```bash
# Check Chroma collections
curl -s http://localhost:8000/api/v2/tenants/default/databases/default/collections | jq '.'

# Verify heartbeat
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/v2/heartbeat
```

### 3. Query with RAG

- Ask questions in Open WebUI that reference uploaded content
- System retrieves relevant chunks from Chroma
- Augments prompts with retrieved context
- Generates responses using Ollama LLM

## RAG Workflow

### Step 1: Document Ingestion
1. User uploads document via Open WebUI
2. Document is parsed and chunked
3. Each chunk is processed for embedding generation

### Step 2: Embedding Generation
1. Chunks are sent to Ollama for embedding
2. Embeddings are generated using the selected model
3. Embeddings are normalized for similarity search

### Step 3: Vector Storage
1. Embeddings are stored in Chroma with metadata
2. Document metadata is stored in PostgreSQL
3. Indexes are created for fast retrieval

### Step 4: Query Processing
1. User query is converted to embedding
2. Chroma performs similarity search
3. Top-K relevant chunks are retrieved
4. Chunks are ranked by relevance score

### Step 5: Context Augmentation
1. Retrieved chunks are formatted as context
2. Context is prepended to user query
3. Augmented prompt is sent to Ollama

### Step 6: Response Generation
1. Ollama generates response using context
2. Response is displayed to user
3. Conversation is saved to PostgreSQL

## Troubleshooting

### RAG Not Working - Document Upload Issues

```bash
# Check Chroma connection
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/v2/heartbeat

# Create tenant/database if needed
curl -X POST http://localhost:8000/api/v2/tenants \
  -H "Content-Type: application/json" \
  -d '{"name": "default"}'

curl -X POST http://localhost:8000/api/v2/tenants/default/databases \
  -H "Content-Type: application/json" \
  -d '{"name": "default"}'
```

### Database Connection Issues

```bash
# Check PostgreSQL status
docker-compose logs postgres

# Verify database initialization
docker exec -it postgres psql -U user -d chatdb -c "\dt"
```

### Embedding Generation Issues

```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Verify model is loaded
docker exec -it ollama ollama list

# Test embedding generation
curl http://localhost:11434/api/embeddings \
  -d '{"model": "llama3.2:3b", "prompt": "test"}'
```

## Best Practices

### Document Chunking
- Optimal chunk size: 500-1000 tokens
- Overlap between chunks: 100-200 tokens
- Preserve context boundaries (paragraphs, sections)

### Embedding Models
- Use consistent embedding model for all documents
- Match embedding model with generation model when possible
- Consider model size vs. quality trade-offs

### Retrieval Strategy
- Top-K retrieval: 3-5 most relevant chunks
- Re-ranking: Consider implementing re-ranking for better results
- Metadata filtering: Use metadata for precise retrieval

### Context Management
- Limit context window to model's maximum
- Prioritize most relevant chunks
- Include source citations in responses

