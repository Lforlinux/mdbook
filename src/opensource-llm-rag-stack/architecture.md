# Opensource-LLM-RAG-Stack Architecture

## System Architecture

![OpenSource RAG LLM Stack Architecture](../images/RAG-LLM-stack.png)

This diagram illustrates the complete architecture of the OpenSource RAG LLM Stack, showing the interaction between all components for retrieval-augmented generation, chat history management, and comprehensive monitoring.

## RAG Flow

**RAG Flow:** User → Open WebUI → Chroma (retrieve) → Open WebUI → Ollama (generate) → Open WebUI → User

## Core Components

### Open WebUI
- **Purpose**: User interface for chat and document management
- **Port**: 3000
- **Features**: 
  - Chat interface
  - Document upload and processing
  - RAG integration
  - Chat history management

### Ollama
- **Purpose**: LLM inference engine
- **Port**: 11434
- **Features**:
  - Model management
  - Text generation
  - Embedding generation
  - Containerized deployment

### Chroma
- **Purpose**: Vector database for embeddings
- **Port**: 8000
- **Features**:
  - Semantic search
  - Embedding storage
  - Collection management
  - Similarity search

### PostgreSQL
- **Purpose**: Relational database for chat history and metadata
- **Port**: 5432
- **Features**:
  - Chat session storage
  - Message history
  - Document metadata
  - Full-text search

## Monitoring Stack

### Prometheus
- **Purpose**: Metrics collection and storage
- **Port**: 9090
- **Features**:
  - Time-series database
  - Service health monitoring
  - Performance metrics
  - Alert rule evaluation

### Grafana
- **Purpose**: Visualization and dashboards
- **Port**: 3001
- **Features**:
  - Real-time dashboards
  - Service health visualization
  - Performance analytics
  - Custom dashboard creation

## Data Flow

### Document Processing Flow
1. User uploads document via Open WebUI
2. Document is chunked into smaller pieces
3. Chunks are converted to embeddings via Ollama
4. Embeddings are stored in Chroma vector database
5. Metadata is stored in PostgreSQL

### Query Flow (RAG)
1. User asks question in Open WebUI
2. Question is converted to embedding
3. Chroma performs similarity search
4. Relevant document chunks are retrieved
5. Chunks are added to prompt context
6. Ollama generates response using context
7. Response is displayed to user
8. Conversation is saved to PostgreSQL

## Infrastructure as Code

The entire stack is defined in Docker Compose:

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    ports: ["11434:11434"]
    volumes:
      - ollama-data:/root/.ollama

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    ports: ["3000:8080"]
    environment:
      - OLLAMA_API_BASE_URL=http://ollama:11434
      - VECTOR_DB=chroma
      - DATABASE_URL=postgresql://user:password@postgres:5432/chatdb

  chroma:
    image: ghcr.io/chroma-core/chroma:latest
    ports: ["8000:8000"]

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: chatdb

  prometheus:
    image: prom/prometheus:latest
    ports: ["9090:9090"]

  grafana:
    image: grafana/grafana-oss:latest
    ports: ["3001:3000"]
```

## Data Persistence

All data is persisted in Docker volumes:
- `ollama-data`: LLM models and Ollama configurations
- `openwebui-data`: WebUI configurations and user data
- `chroma-data`: Vector embeddings and collections
- `pgdata`: PostgreSQL database files
- `grafana-data`: Dashboard configurations and user settings
- `prometheus-data`: Metrics time-series data

