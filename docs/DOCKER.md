# Docker Deployment Guide

Complete guide for deploying PDFlow using Docker for production or development environments.

## Table of Contents
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Building the Image](#building-the-image)
- [Running the Container](#running-the-container)
- [Configuration](#configuration)
- [Docker Compose](#docker-compose)
- [Volumes and Persistence](#volumes-and-persistence)
- [Networking](#networking)
- [Health Checks](#health-checks)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/traves-theberge/pdflow.git
cd pdflow

# 2. Build the Docker image
docker build -t pdflow:latest .

# 3. Run the container
docker run -d \
  --name pdflow \
  -p 3001:3000 \
  -e GEMINI_API_KEY="your-api-key-here" \
  -v pdflow-uploads:/app/uploads \
  -v pdflow-outputs:/app/outputs \
  pdflow:latest

# 4. Verify it's running
curl http://localhost:3001/api/health
```

## Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose** (optional): Version 2.0 or higher
- **Gemini API Key**: Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **System Resources**:
  - Minimum: 2GB RAM, 2 CPU cores
  - Recommended: 4GB RAM, 4 CPU cores
  - Disk Space: ~2GB for image + storage for PDFs

## Building the Image

### Standard Build

```bash
docker build -t pdflow:latest .
```

### Build with Custom Tag

```bash
docker build -t pdflow:v1.0.0 .
```

### Build Arguments

The Dockerfile uses a multi-stage build for optimization:

```dockerfile
# Stage 1: Base - System dependencies
FROM node:20-slim AS base

# Stage 2: Deps - Production dependencies only
FROM base AS deps

# Stage 3: Builder - Build Next.js and CLI
FROM base AS builder

# Stage 4: Runner - Production runtime
FROM base AS runner
```

### Build Time

- **First build**: ~5-7 minutes (downloads all dependencies)
- **Subsequent builds**: ~2-3 minutes (uses Docker cache)
- **Final image size**: ~1.14GB

## Running the Container

### Basic Run

```bash
docker run -d \
  --name pdflow \
  -p 3001:3000 \
  -e GEMINI_API_KEY="your-api-key-here" \
  pdflow:latest
```

### With All Options

```bash
docker run -d \
  --name pdflow \
  --restart unless-stopped \
  -p 3001:3000 \
  -e GEMINI_API_KEY="your-api-key-here" \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -v pdflow-uploads:/app/uploads \
  -v pdflow-outputs:/app/outputs \
  -v pdflow-logs:/app/logs \
  --memory=2g \
  --cpus=2 \
  --health-cmd="curl -f http://localhost:3000/api/health || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  pdflow:latest
```

### Interactive Mode (Development)

```bash
docker run -it \
  --name pdflow-dev \
  -p 3001:3000 \
  -e GEMINI_API_KEY="your-api-key-here" \
  -v $(pwd):/app \
  pdflow:latest \
  /bin/bash
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Yes | - | Google Gemini API key for PDF extraction |
| `NODE_ENV` | No | `production` | Node.js environment mode |
| `PORT` | No | `3000` | Internal port (map to different external port) |
| `HOSTNAME` | No | `0.0.0.0` | Bind address for the server |

### Passing Environment Variables

**Via Command Line:**
```bash
docker run -e GEMINI_API_KEY="key" -e PORT=3000 pdflow:latest
```

**Via Environment File:**
```bash
# Create .env file
echo "GEMINI_API_KEY=your-key-here" > .env
echo "PORT=3000" >> .env

# Run with env file
docker run --env-file .env pdflow:latest
```

## Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  pdflow:
    build: .
    container_name: pdflow
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - NODE_ENV=production
    volumes:
      - pdflow-uploads:/app/uploads
      - pdflow-outputs:/app/outputs
      - pdflow-logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '2'
        reservations:
          memory: 1G
          cpus: '1'

volumes:
  pdflow-uploads:
  pdflow-outputs:
  pdflow-logs:
```

### Using Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f pdflow

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Volumes and Persistence

### Volume Types

1. **Uploads** (`/app/uploads`): Temporary storage for uploaded PDFs
2. **Outputs** (`/app/outputs`): Extracted content and converted images
3. **Logs** (`/app/logs`): Application logs (optional)

### Creating Named Volumes

```bash
docker volume create pdflow-uploads
docker volume create pdflow-outputs
docker volume create pdflow-logs
```

### Using Bind Mounts (Development)

```bash
docker run -d \
  -v /host/path/uploads:/app/uploads \
  -v /host/path/outputs:/app/outputs \
  pdflow:latest
```

### Backup and Restore

**Backup volumes:**
```bash
# Backup uploads
docker run --rm \
  -v pdflow-uploads:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/uploads-backup.tar.gz /data

# Backup outputs
docker run --rm \
  -v pdflow-outputs:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/outputs-backup.tar.gz /data
```

**Restore volumes:**
```bash
# Restore uploads
docker run --rm \
  -v pdflow-uploads:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/uploads-backup.tar.gz -C /

# Restore outputs
docker run --rm \
  -v pdflow-outputs:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/outputs-backup.tar.gz -C /
```

## Networking

### Port Mapping

The container exposes port `3000` internally. Map it to any external port:

```bash
# Map to port 3001
docker run -p 3001:3000 pdflow:latest

# Map to port 80
docker run -p 80:3000 pdflow:latest

# Map to specific interface
docker run -p 127.0.0.1:3001:3000 pdflow:latest
```

### Custom Network

```bash
# Create network
docker network create pdflow-network

# Run with custom network
docker run -d \
  --name pdflow \
  --network pdflow-network \
  -p 3001:3000 \
  pdflow:latest
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name pdflow.example.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Health Checks

### Built-in Health Check

The Dockerfile includes a health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

### Manual Health Check

```bash
# Check health via Docker
docker inspect --format='{{.State.Health.Status}}' pdflow

# Check health via API
curl http://localhost:3001/api/health
```

### Health Check Response

```json
{
  "status": "ok",
  "timestamp": "2025-11-06T22:50:26.167Z",
  "uptime": 146.258435144
}
```

## Production Deployment

### Security Best Practices

1. **Run as non-root user** (already configured in Dockerfile)
2. **Use secrets management** for API keys
3. **Enable HTTPS** via reverse proxy
4. **Limit container resources**
5. **Regular security updates**

### Resource Limits

```bash
docker run -d \
  --memory=2g \
  --memory-swap=2g \
  --cpus=2 \
  --pids-limit=100 \
  pdflow:latest
```

### Logging

**View logs:**
```bash
docker logs pdflow
docker logs -f pdflow  # Follow
docker logs --tail 100 pdflow  # Last 100 lines
docker logs --since 1h pdflow  # Last hour
```

**Configure logging driver:**
```bash
docker run -d \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  pdflow:latest
```

### Auto-restart Policy

```bash
docker run -d \
  --restart unless-stopped \
  pdflow:latest
```

Options:
- `no`: Never restart (default)
- `on-failure`: Restart only on error
- `always`: Always restart
- `unless-stopped`: Always restart unless manually stopped

### Multi-platform Builds

```bash
# Build for multiple architectures
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t pdflow:latest \
  --push \
  .
```

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
docker logs pdflow
```

**Common issues:**
- Missing `GEMINI_API_KEY` environment variable
- Port already in use: Change `-p 3002:3000`
- Insufficient memory: Increase Docker resources

### API Not Responding

**Check container status:**
```bash
docker ps -a
docker inspect pdflow
```

**Check health:**
```bash
docker inspect --format='{{.State.Health.Status}}' pdflow
```

**Test from inside container:**
```bash
docker exec pdflow curl -f http://localhost:3000/api/health
```

### High Memory Usage

**Check resource usage:**
```bash
docker stats pdflow
```

**Set memory limits:**
```bash
docker update --memory=2g pdflow
```

### Slow PDF Processing

- **Increase CPU allocation**: `--cpus=4`
- **Increase memory**: `--memory=4g`
- **Check Gemini API rate limits**
- **Monitor container stats**: `docker stats`

### Volume Permission Issues

```bash
# Fix permissions
docker exec pdflow chown -R nextjs:nodejs /app/uploads /app/outputs
```

### Network Issues

**Test connectivity:**
```bash
# From host to container
curl http://localhost:3001/api/health

# From container to external
docker exec pdflow curl https://google.com
```

### Clean Up

**Remove stopped containers:**
```bash
docker rm pdflow
```

**Remove volumes:**
```bash
docker volume rm pdflow-uploads pdflow-outputs
```

**Remove images:**
```bash
docker rmi pdflow:latest
```

**Complete cleanup:**
```bash
docker-compose down -v
docker system prune -a
```

## CLI Usage in Docker

The CLI is built into the Docker image. You can use it via `docker exec`:

```bash
# Extract PDF
docker exec pdflow node /app/dist/cli/pdflow.js extract \
  /tmp/document.pdf \
  -f markdown \
  -o /app/outputs

# With all options
docker exec pdflow node /app/dist/cli/pdflow.js extract \
  /tmp/document.pdf \
  --format json \
  --output /app/outputs \
  --aggregate
```

**Copy PDF into container:**
```bash
docker cp local-file.pdf pdflow:/tmp/document.pdf
```

**Copy results out:**
```bash
docker cp pdflow:/app/outputs/session_xyz ./results
```

## MCP Server Integration

The MCP server runs on the **host machine**, not in Docker. It connects to the Dockerized PDFlow API:

```bash
# On host machine
cd src/mcp
npm install
npm run build

# Configure MCP to use Docker API
export PDFLOW_BASE_URL=http://localhost:3001
export GEMINI_API_KEY="your-key-here"
node dist/server.js
```

See [MCP_INTEGRATION.md](MCP_INTEGRATION.md) for complete setup instructions.

## Next Steps

- [MCP Integration Guide](MCP_INTEGRATION.md) - Connect with AI assistants
- [API Reference](https://pdflow.vercel.app/docs/api) - Use PDFlow programmatically
- [Quick Start Guide](QUICKSTART.md) - Get started quickly
- [Testing Documentation](DOCKER_TESTING.md) - View test results

## Support

For issues:
- Check the [Troubleshooting](#troubleshooting) section
- Review [Docker logs](#logging)
- Open an issue on [GitHub](https://github.com/traves-theberge/pdflow/issues)
