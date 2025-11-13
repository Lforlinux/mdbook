# Opensource-LLM-RAG-Stack Technical Implementation

## Docker Compose Architecture

### Service Configuration
```yaml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
      - OLLAMA_ORIGINS=*
    networks:
      - rag-network

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "3000:8080"
    environment:
      - OLLAMA_API_BASE_URL=http://ollama:11434
      - VECTOR_DB=chroma
      - DATABASE_URL=postgresql://user:password@postgres:5432/chatdb
      - CHROMA_SERVER_HOST=http://chroma:8000
    depends_on:
      - ollama
      - chroma
      - postgres
    networks:
      - rag-network

  chroma:
    image: ghcr.io/chroma-core/chroma:latest
    container_name: chroma
    ports:
      - "8000:8000"
    volumes:
      - chroma-data:/chroma/chroma
    environment:
      - CHROMA_DB_IMPL=duckdb+parquet
      - IS_PERSISTENT=TRUE
    networks:
      - rag-network

  postgres:
    image: postgres:15-alpine
    container_name: postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: chatdb
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - rag-network

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    networks:
      - rag-network

  grafana:
    image: grafana/grafana-oss:latest
    container_name: grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
    depends_on:
      - prometheus
    networks:
      - rag-network

volumes:
  ollama-data:
  openwebui-data:
  chroma-data:
  pgdata:
  grafana-data:
  prometheus-data:

networks:
  rag-network:
    driver: bridge
```

## Database Schema Implementation

### PostgreSQL Schema
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chat Sessions Management
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    session_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Message Storage with Full-Text Search
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(50) CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    token_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RAG Document Storage
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500),
    content TEXT NOT NULL,
    source VARCHAR(500),
    embedding_id VARCHAR(255), -- Chroma reference
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_documents_content_gin ON documents 
    USING gin(to_tsvector('english', content));
CREATE INDEX idx_documents_metadata_gin ON documents USING gin(metadata);

-- Full-text search function
CREATE OR REPLACE FUNCTION search_documents(search_query TEXT)
RETURNS TABLE(id UUID, title VARCHAR, content TEXT, rank REAL) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.title,
        d.content,
        ts_rank(to_tsvector('english', d.content), plainto_tsquery('english', search_query)) as rank
    FROM documents d
    WHERE to_tsvector('english', d.content) @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
```

## RAG Implementation

### Document Processing Pipeline
```python
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import ollama

class RAGPipeline:
    def __init__(self):
        self.chroma_client = chromadb.Client(Settings(
            chroma_db_impl="duckdb+parquet",
            persist_directory="./chroma_db"
        ))
        self.collection = self.chroma_client.get_or_create_collection("documents")
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.ollama_client = ollama.Client(host='http://ollama:11434')
    
    def process_document(self, document_text, metadata=None):
        """Process and store document in vector database"""
        # Chunk document
        chunks = self.chunk_document(document_text, chunk_size=500, overlap=100)
        
        # Generate embeddings
        embeddings = self.embedding_model.encode(chunks)
        
        # Store in Chroma
        ids = [f"doc_{i}" for i in range(len(chunks))]
        self.collection.add(
            embeddings=embeddings.tolist(),
            documents=chunks,
            ids=ids,
            metadatas=[metadata] * len(chunks) if metadata else None
        )
        
        return len(chunks)
    
    def chunk_document(self, text, chunk_size=500, overlap=100):
        """Split document into overlapping chunks"""
        chunks = []
        words = text.split()
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk = ' '.join(words[i:i + chunk_size])
            chunks.append(chunk)
        
        return chunks
    
    def retrieve_relevant_chunks(self, query, top_k=5):
        """Retrieve relevant document chunks for query"""
        # Generate query embedding
        query_embedding = self.embedding_model.encode([query])[0]
        
        # Search in Chroma
        results = self.collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=top_k
        )
        
        return results['documents'][0]
    
    def generate_response(self, query, context_chunks):
        """Generate response using RAG"""
        # Build context from retrieved chunks
        context = "\n\n".join(context_chunks)
        
        # Create augmented prompt
        prompt = f"""Context:
{context}

Question: {query}

Answer based on the context provided:"""
        
        # Generate response using Ollama
        response = self.ollama_client.generate(
            model='llama3.2:3b',
            prompt=prompt
        )
        
        return response['response']
```

## Monitoring Implementation

### Prometheus Configuration
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'rag-stack'
    static_configs:
      - targets: ['open-webui:8080', 'chroma:8000', 'ollama:11434']
```

### Custom Metrics Collection
```python
from prometheus_client import Counter, Histogram, Gauge
import time

# Define metrics
request_count = Counter('rag_requests_total', 'Total RAG requests')
request_duration = Histogram('rag_request_duration_seconds', 'RAG request duration')
active_sessions = Gauge('rag_active_sessions', 'Active chat sessions')
document_count = Gauge('rag_documents_total', 'Total documents in vector DB')

def track_rag_request(func):
    """Decorator to track RAG requests"""
    def wrapper(*args, **kwargs):
        start_time = time.time()
        request_count.inc()
        
        try:
            result = func(*args, **kwargs)
            request_duration.observe(time.time() - start_time)
            return result
        except Exception as e:
            request_count.labels(status='error').inc()
            raise
    
    return wrapper
```
