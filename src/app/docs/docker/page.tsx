export default function DockerPage() {
  return (
    <>
      <h1>Docker Deployment</h1>
      <p className="lead">
        Deploy PDFlow with Docker for production-ready, containerized PDF extraction.
      </p>

      <h2>Quick Start</h2>
      <pre><code>{`# Clone repository
git clone https://github.com/traves-theberge/pdflow.git
cd pdflow

# Build Docker image
docker build -t pdflow:latest .

# Run container
docker run -d \\
  --name pdflow \\
  -p 3535:3000 \\
  -e GEMINI_API_KEY="your-api-key-here" \\
  -v pdflow-uploads:/app/uploads \\
  -v pdflow-outputs:/app/outputs \\
  pdflow:latest

# Verify it's running
curl http://localhost:3535/api/health`}</code></pre>

      <h2>Prerequisites</h2>
      <ul>
        <li><strong>Docker</strong>: Version 20.10 or higher</li>
        <li><strong>Docker Compose</strong> (optional): Version 2.0 or higher</li>
        <li><strong>Gemini API Key</strong>: Get one from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
        <li><strong>System Resources</strong>:
          <ul>
            <li>Minimum: 2GB RAM, 2 CPU cores</li>
            <li>Recommended: 4GB RAM, 4 CPU cores</li>
            <li>Disk Space: ~2GB for image + storage for PDFs</li>
          </ul>
        </li>
      </ul>

      <h3>Install Docker</h3>

      <h4>Ubuntu/Debian</h4>
      <pre><code>{`# Install Docker
curl -fsSL https://get.docker.com | sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and back in, then verify
docker --version`}</code></pre>

      <h4>macOS</h4>
      <pre><code>{`# Download Docker Desktop from:
# https://www.docker.com/products/docker-desktop

# Or use Homebrew
brew install --cask docker

# Verify
docker --version`}</code></pre>

      <h2>Docker Architecture</h2>
      <p>PDFlow uses a multi-stage Docker build for optimization:</p>
      <ul>
        <li><strong>Base</strong>: Node 20 slim + system dependencies (poppler-utils, imagemagick)</li>
        <li><strong>Deps</strong>: Production Node.js dependencies only</li>
        <li><strong>Builder</strong>: Build Next.js app and CLI</li>
        <li><strong>Runner</strong>: Production runtime with non-root user</li>
      </ul>

      <h3>Key Features</h3>
      <ul>
        <li>✅ Multi-stage build reduces final image size (~1.14GB)</li>
        <li>✅ Non-root user (nextjs:nodejs) for security</li>
        <li>✅ Health checks configured</li>
        <li>✅ ImageMagick v6/v7 compatibility</li>
        <li>✅ Node 20 for Next.js 16 support</li>
      </ul>

      <h2>Building the Image</h2>

      <h3>Standard Build</h3>
      <pre><code>{`docker build -t pdflow:latest .`}</code></pre>

      <h3>Build with Custom Tag</h3>
      <pre><code>{`docker build -t pdflow:v1.0.0 .`}</code></pre>

      <h3>No Cache Build</h3>
      <pre><code>{`docker build --no-cache -t pdflow:latest .`}</code></pre>

      <h3>Build Time</h3>
      <ul>
        <li><strong>First build</strong>: ~5-7 minutes (downloads dependencies)</li>
        <li><strong>Subsequent builds</strong>: ~2-3 minutes (uses Docker cache)</li>
        <li><strong>Final image size</strong>: ~1.14GB</li>
      </ul>

      <h2>Running the Container</h2>

      <h3>Basic Run</h3>
      <pre><code>{`docker run -d \\
  --name pdflow \\
  -p 3535:3000 \\
  -e GEMINI_API_KEY="your-api-key-here" \\
  pdflow:latest`}</code></pre>

      <h3>With All Options</h3>
      <pre><code>{`docker run -d \\
  --name pdflow \\
  --restart unless-stopped \\
  -p 3535:3000 \\
  -e GEMINI_API_KEY="your-api-key-here" \\
  -e NODE_ENV=production \\
  -v pdflow-uploads:/app/uploads \\
  -v pdflow-outputs:/app/outputs \\
  -v pdflow-logs:/app/logs \\
  --memory=2g \\
  --cpus=2 \\
  pdflow:latest`}</code></pre>

      <h2>Docker Compose</h2>

      <h3>docker-compose.yml</h3>
      <pre><code>{`version: '3.8'

services:
  pdflow:
    build: .
    container_name: pdflow
    restart: unless-stopped
    ports:
      - "3535:3000"
    environment:
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
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
  pdflow-logs:`}</code></pre>

      <h3>Using Docker Compose</h3>
      <pre><code>{`# Start services
docker-compose up -d

# View logs
docker-compose logs -f pdflow

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v`}</code></pre>

      <h2>Environment Variables</h2>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Required</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>GEMINI_API_KEY</code></td>
            <td>Yes</td>
            <td>-</td>
            <td>Google Gemini API key</td>
          </tr>
          <tr>
            <td><code>NODE_ENV</code></td>
            <td>No</td>
            <td>production</td>
            <td>Node.js environment</td>
          </tr>
          <tr>
            <td><code>PORT</code></td>
            <td>No</td>
            <td>3000</td>
            <td>Internal port</td>
          </tr>
          <tr>
            <td><code>HOSTNAME</code></td>
            <td>No</td>
            <td>0.0.0.0</td>
            <td>Bind address</td>
          </tr>
        </tbody>
      </table>

      <h3>Using .env File</h3>
      <pre><code>{`# Create .env file
cat > .env <<EOF
GEMINI_API_KEY=your-key-here
NODE_ENV=production
EOF

# Run with env file
docker run --env-file .env pdflow:latest`}</code></pre>

      <h2>Using the CLI in Docker</h2>
      <p>The CLI is built into the Docker image. Use it via <code>docker exec</code>:</p>

      <h3>Extract PDF</h3>
      <pre><code>{`# Copy PDF into container
docker cp local-file.pdf pdflow:/tmp/document.pdf

# Run CLI extraction
docker exec pdflow node /app/dist/cli/pdflow.js extract \\
  /tmp/document.pdf \\
  -f markdown \\
  -o /app/outputs

# Copy results out
docker cp pdflow:/app/outputs/session_xyz ./results`}</code></pre>

      <h3>With All Options</h3>
      <pre><code>{`docker exec pdflow node /app/dist/cli/pdflow.js extract \\
  /tmp/document.pdf \\
  --format json \\
  --output /app/outputs \\
  --aggregate`}</code></pre>

      <h2>Volume Management</h2>

      <h3>Volume Types</h3>
      <ul>
        <li><strong>uploads</strong> (<code>/app/uploads</code>): Temporary storage for uploaded PDFs</li>
        <li><strong>outputs</strong> (<code>/app/outputs</code>): Extracted content and converted images</li>
        <li><strong>logs</strong> (<code>/app/logs</code>): Application logs (optional)</li>
      </ul>

      <h3>Backup Volumes</h3>
      <pre><code>{`# Backup uploads
docker run --rm \\
  -v pdflow-uploads:/data \\
  -v $(pwd):/backup \\
  alpine tar czf /backup/uploads-backup.tar.gz /data

# Backup outputs
docker run --rm \\
  -v pdflow-outputs:/data \\
  -v $(pwd):/backup \\
  alpine tar czf /backup/outputs-backup.tar.gz /data`}</code></pre>

      <h3>Restore Volumes</h3>
      <pre><code>{`# Restore uploads
docker run --rm \\
  -v pdflow-uploads:/data \\
  -v $(pwd):/backup \\
  alpine tar xzf /backup/uploads-backup.tar.gz -C /`}</code></pre>

      <h2>Health Checks</h2>

      <h3>Built-in Health Check</h3>
      <p>The Dockerfile includes automatic health monitoring:</p>
      <pre><code>{`HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"`}</code></pre>

      <h3>Check Container Health</h3>
      <pre><code>{`# Via Docker
docker inspect --format='{{.State.Health.Status}}' pdflow

# Via API
curl http://localhost:3535/api/health`}</code></pre>

      <h3>Expected Response</h3>
      <pre><code>{`{
  "status": "ok",
  "timestamp": "2025-11-06T22:50:26.167Z",
  "uptime": 146.258435144
}`}</code></pre>

      <h2>MCP Server Integration</h2>
      <p><strong>Important</strong>: The MCP server runs on the <strong>host machine</strong>, not in Docker. It connects to the Dockerized PDFlow API.</p>

      <h3>Setup MCP Server</h3>
      <pre><code>{`# On host machine (not in Docker)
cd src/mcp
npm install
npm run build

# Configure to use Docker API
export PDFLOW_BASE_URL=http://localhost:3535
export GEMINI_API_KEY="your-key-here"
node dist/server.js`}</code></pre>

      <p>See <a href="/docs/mcp">MCP Integration</a> for complete AI assistant setup.</p>

      <h2>Production Deployment</h2>

      <h3>Security Best Practices</h3>
      <ol>
        <li>✅ <strong>Non-root user</strong> - Already configured in Dockerfile</li>
        <li>✅ <strong>Use secrets</strong> - Store API keys securely</li>
        <li>✅ <strong>Enable HTTPS</strong> - Use reverse proxy (Nginx)</li>
        <li>✅ <strong>Limit resources</strong> - Set memory/CPU limits</li>
        <li>✅ <strong>Regular updates</strong> - Keep base image updated</li>
      </ol>

      <h3>Resource Limits</h3>
      <pre><code>{`docker run -d \\
  --memory=2g \\
  --memory-swap=2g \\
  --cpus=2 \\
  --pids-limit=100 \\
  pdflow:latest`}</code></pre>

      <h3>Reverse Proxy (Nginx)</h3>
      <pre><code>{`server {
    listen 80;
    server_name pdflow.example.com;

    location / {
        proxy_pass http://localhost:3535;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`}</code></pre>

      <h2>Troubleshooting</h2>

      <h3>Container Won't Start</h3>
      <pre><code>{`# Check logs
docker logs pdflow

# Common issues:
# - Missing GEMINI_API_KEY
# - Port already in use (change -p 3535:3000)
# - Insufficient memory`}</code></pre>

      <h3>API Not Responding</h3>
      <pre><code>{`# Check container status
docker ps -a

# Check health
docker inspect --format='{{.State.Health.Status}}' pdflow

# Test from inside container
docker exec pdflow curl -f http://localhost:3000/api/health`}</code></pre>

      <h3>High Memory Usage</h3>
      <pre><code>{`# Check resource usage
docker stats pdflow

# Set memory limits
docker update --memory=2g pdflow`}</code></pre>

      <h3>Clean Up</h3>
      <pre><code>{`# Remove container
docker rm -f pdflow

# Remove volumes
docker volume rm pdflow-uploads pdflow-outputs

# Remove image
docker rmi pdflow:latest

# Complete cleanup
docker system prune -a`}</code></pre>

      <h2>Testing Results</h2>
      <p>PDFlow has been comprehensively tested in Docker:</p>
      <ul>
        <li>✅ <strong>Web App</strong>: Serves API and health endpoint</li>
        <li>✅ <strong>CLI</strong>: Successfully extracts PDFs with Gemini AI</li>
        <li>✅ <strong>MCP Server</strong>: Integrates with Dockerized API</li>
        <li>✅ <strong>Production Ready</strong>: Security, health checks, resource limits</li>
      </ul>

      <p>See <a href="https://github.com/traves-theberge/pdflow/blob/main/docs/DOCKER_TESTING.md" target="_blank" rel="noopener noreferrer">full testing documentation</a> for detailed results.</p>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/docs/mcp">MCP Integration</a> - Connect with AI assistants</li>
        <li><a href="/docs/api">API Reference</a> - Use PDFlow programmatically</li>
        <li><a href="/docs/security">Security</a> - Best practices</li>
        <li><a href="/docs/troubleshooting">Troubleshooting</a> - Fix common issues</li>
      </ul>
    </>
  );
}
