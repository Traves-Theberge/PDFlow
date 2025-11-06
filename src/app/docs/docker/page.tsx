export default function DockerPage() {
  return (
    <>
      <h1>Docker Deployment Guide</h1>
      <p className="lead">
        Complete guide for deploying PDFlow with Docker and Docker Compose.
      </p>

      <h2>Quick Start</h2>
      <pre><code>{`# Clone repository
git clone https://github.com/traves-theberge/pdflow.git
cd pdflow

# Create .env file
echo "GEMINI_API_KEY=your-api-key-here" > .env

# Start with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f

# Access at http://localhost:3000`}</code></pre>

      <h2>Prerequisites</h2>
      <ul>
        <li>Docker 20.10 or higher</li>
        <li>Docker Compose 2.0 or higher</li>
        <li>Gemini API key</li>
      </ul>

      <h3>Install Docker</h3>

      <h4>Ubuntu/Debian</h4>
      <pre><code>{`# Install Docker
curl -fsSL https://get.docker.com | sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and back in, then verify
docker --version

# Install Docker Compose plugin
sudo apt install docker-compose-plugin`}</code></pre>

      <h4>macOS</h4>
      <pre><code>{`# Download Docker Desktop from:
# https://www.docker.com/products/docker-desktop

# Or use Homebrew
brew install --cask docker

# Start Docker Desktop
open -a Docker

# Verify
docker --version
docker-compose --version`}</code></pre>

      <h2>Docker Compose Configuration</h2>

      <h3>docker-compose.yml</h3>
      <pre><code>{`version: '3.8'

services:
  pdflow:
    build: .
    ports:
      - "3000:3000"
    environment:
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - NODE_ENV=production
    volumes:
      - ./uploads:/app/uploads
      - ./outputs:/app/outputs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s`}</code></pre>

      <h3>Dockerfile</h3>
      <pre><code>{`FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \\
    poppler-utils \\
    imagemagick \\
    curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build Next.js application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]`}</code></pre>

      <h2>Environment Variables</h2>
      <p>Create a <code>.env</code> file in the project root:</p>
      <pre><code>{`# Required
GEMINI_API_KEY=your-google-gemini-api-key

# Optional
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000

# For MCP
PDFLOW_BASE_URL=http://localhost:3000`}</code></pre>

      <h2>Running with Docker Compose</h2>

      <h3>Start Services</h3>
      <pre><code>{`# Start in detached mode
docker-compose up -d

# Start with build
docker-compose up -d --build

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f pdflow`}</code></pre>

      <h3>Stop Services</h3>
      <pre><code>{`# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop, remove volumes, and remove images
docker-compose down -v --rmi all`}</code></pre>

      <h3>Restart Services</h3>
      <pre><code>{`# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart pdflow`}</code></pre>

      <h2>Managing Docker Containers</h2>

      <h3>View Running Containers</h3>
      <pre><code>docker ps</code></pre>

      <h3>View All Containers</h3>
      <pre><code>docker ps -a</code></pre>

      <h3>View Logs</h3>
      <pre><code>{`# Follow logs
docker logs -f pdflow

# Last 100 lines
docker logs --tail 100 pdflow`}</code></pre>

      <h3>Execute Commands in Container</h3>
      <pre><code>{`# Open shell
docker exec -it pdflow sh

# Run command
docker exec pdflow npm run --version`}</code></pre>

      <h2>Volume Management</h2>

      <h3>Persistent Data</h3>
      <p>Docker Compose creates volumes for uploads and outputs:</p>
      <pre><code>{`./uploads  -> /app/uploads   (uploaded PDFs)
./outputs  -> /app/outputs   (extracted content)`}</code></pre>

      <h3>Backup Volumes</h3>
      <pre><code>{`# Backup uploads
tar -czf uploads-backup.tar.gz uploads/

# Backup outputs
tar -czf outputs-backup.tar.gz outputs/`}</code></pre>

      <h3>Restore Volumes</h3>
      <pre><code>{`# Restore uploads
tar -xzf uploads-backup.tar.gz

# Restore outputs
tar -xzf outputs-backup.tar.gz`}</code></pre>

      <h2>Production Deployment</h2>

      <h3>Security Hardening</h3>
      <ol>
        <li>
          <strong>Use secrets for API keys</strong>
          <pre><code>{`# Use Docker secrets
docker secret create gemini_api_key ./api_key.txt`}</code></pre>
        </li>
        <li>
          <strong>Run as non-root user</strong>
          <p>Add to Dockerfile:</p>
          <pre><code>{`USER node
RUN chown -R node:node /app`}</code></pre>
        </li>
        <li>
          <strong>Limit resources</strong>
          <p>Add to docker-compose.yml:</p>
          <pre><code>{`deploy:
  resources:
    limits:
      cpus: '2'
      memory: 4G
    reservations:
      cpus: '1'
      memory: 2G`}</code></pre>
        </li>
      </ol>

      <h3>Reverse Proxy with Nginx</h3>
      <p>Add to docker-compose.yml:</p>
      <pre><code>{`  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - pdflow`}</code></pre>

      <h2>Troubleshooting</h2>

      <h3>"Cannot connect to Docker daemon"</h3>
      <pre><code>{`# Start Docker
# macOS: Start Docker Desktop
# Linux: sudo systemctl start docker

# Check Docker is running
docker ps`}</code></pre>

      <h3>"Port already in use"</h3>
      <pre><code>{`# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Host:Container`}</code></pre>

      <h3>"Build failed"</h3>
      <pre><code>{`# Clean build
docker-compose build --no-cache

# Remove old images
docker image prune -a`}</code></pre>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/docs/installation">Installation Guide</a> - Local setup</li>
        <li><a href="/docs/security">Security</a> - Best practices</li>
        <li><a href="/docs/troubleshooting">Troubleshooting</a> - Fix common issues</li>
      </ul>
    </>
  );
}
