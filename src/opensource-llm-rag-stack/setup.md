# Opensource-LLM-RAG-Stack Setup

## Quick Start

### Prerequisites
- Docker & Docker Compose
- 8GB+ RAM (for LLM models)

### Complete Self-Contained Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd Opensource-LLM-RAG-Stack

# Quick start (includes model setup)
./start.sh

# Or manual setup:
# Start all services (includes Ollama)
docker-compose up -d

# Set up Ollama with a model
./scripts/setup-ollama.sh

# Check service status
docker-compose ps
```

### Alternative: Use Local Ollama Installation
```bash
# Prerequisites: Install Ollama locally (https://ollama.ai)
# Start Ollama on your host machine
ollama serve

# Start the RAG stack (connects to local Ollama)
docker-compose -f local-ollama-docker-compose.yml up -d

# Check service status
docker-compose -f local-ollama-docker-compose.yml ps
```

## Access Services

- **Open WebUI**: http://localhost:3000 (AI Chat Interface)
- **Grafana**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090 (Metrics)
- **Chroma API**: http://localhost:8000 (Vector Database)
- **PostgreSQL**: localhost:5432 (Database)
- **Ollama API**: http://localhost:11434 (LLM Service)

## Ollama Model Management

### List Available Models
```bash
docker exec -it ollama ollama list
```

### Pull a New Model
```bash
docker exec -it ollama ollama pull llama3.2:3b
```

### Remove a Model
```bash
docker exec -it ollama ollama rm llama3.2:3b
```

### Run Setup Script
```bash
# Guided model installation
./scripts/setup-ollama.sh
```

## Recommended Models

- **llama3.2:3b** (3B params, ~2GB) - Best balance of speed and quality
- **llama3.2:1b** (1B params, ~1GB) - Fastest, good for basic tasks
- **mistral:7b** (7B params, ~4GB) - High quality, slower
- **codellama:7b** (7B params, ~4GB) - Specialized for coding tasks
- **gemma:2b** (2B params, ~1.5GB) - Google's efficient model

## Database Schema

The database is initialized with an optimized schema for RAG operations:

```sql
-- Chat Sessions Management
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    session_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Message Storage with Full-Text Search
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id),
    role VARCHAR(50) CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    token_count INTEGER DEFAULT 0
);

-- RAG Document Storage
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500),
    content TEXT NOT NULL,
    source VARCHAR(500),
    embedding_id VARCHAR(255), -- Chroma reference
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Performance Indexes
CREATE INDEX idx_documents_content_gin ON documents 
USING gin(to_tsvector('english', content));
```

## Service Management

### View Logs
```bash
docker-compose logs [service-name]
```

### Restart Services
```bash
docker-compose restart [service-name]
```

### Clean Restart
```bash
docker-compose down
docker-compose up -d
```

### For Local Ollama Setup
```bash
docker-compose -f local-ollama-docker-compose.yml [command]
```

