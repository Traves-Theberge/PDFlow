export default function InstallationPage() {
  return (
    <>
      <h1>Installation Guide</h1>
      <p className="lead">
        Complete installation instructions for all deployment methods.
      </p>

      <h2>System Requirements</h2>

      <h3>Minimum Requirements</h3>
      <ul>
        <li><strong>Operating System</strong>: Linux, macOS, or Windows (WSL2)</li>
        <li><strong>Node.js</strong>: 20.x or higher (required for Next.js 16)</li>
        <li><strong>RAM</strong>: 2GB minimum, 4GB recommended</li>
        <li><strong>Disk Space</strong>: 1GB for application + space for PDFs</li>
        <li><strong>Network</strong>: Internet connection for Gemini API</li>
      </ul>

      <h3>Required Dependencies</h3>
      <ul>
        <li><strong>poppler-utils</strong> (pdftocairo) - PDF to image conversion</li>
        <li><strong>ImageMagick</strong> (optional) - Image optimization</li>
        <li><strong>Docker</strong> (optional) - For containerized deployment</li>
      </ul>

      <h2>Local Installation</h2>

      <h3>Step 1: Install Dependencies</h3>

      <h4>macOS</h4>
      <pre><code>{`# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required packages
brew install node@20 poppler imagemagick

# Verify installation
node --version    # Should be 20.x or higher
pdftocairo -v    # Should show poppler version
convert -version # Should show ImageMagick version`}</code></pre>

      <h4>Ubuntu/Debian</h4>
      <pre><code>{`# Update package list
sudo apt update

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PDF tools
sudo apt install -y poppler-utils imagemagick

# Verify installation
node --version
pdftocairo -v
convert -version`}</code></pre>

      <h4>Windows (WSL2)</h4>
      <pre><code>{`# Install WSL2 if not already installed
wsl --install

# Inside WSL2, follow Ubuntu instructions above
# Or use Docker Desktop for Windows`}</code></pre>

      <h3>Step 2: Clone Repository</h3>
      <pre><code>{`# Clone from GitHub
git clone https://github.com/traves-theberge/pdflow.git

# Navigate to project directory
cd pdflow

# Check you're in the right place
ls -la  # Should see package.json, README.md, etc.`}</code></pre>

      <h3>Step 3: Install Node Dependencies</h3>
      <pre><code>{`# Install all npm packages
npm install

# This will install:
# - Next.js framework
# - React and dependencies
# - Google Gemini AI SDK
# - PDF processing libraries
# - TypeScript and build tools`}</code></pre>

      <h3>Step 4: Configure Environment</h3>
      <pre><code>{`# Create .env file
touch .env

# Edit .env and add your API key
echo "GEMINI_API_KEY=your-api-key-here" > .env

# Optional: Add other configuration
cat >> .env << EOF
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
PDFLOW_BASE_URL=http://localhost:3001
EOF`}</code></pre>

      <h4>Getting a Gemini API Key</h4>
      <ol>
        <li>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
        <li>Sign in with your Google account</li>
        <li>Click "Get API Key"</li>
        <li>Create a new API key or use existing one</li>
        <li>Copy the key (starts with "AIza...")</li>
        <li>Paste into your <code>.env</code> file</li>
      </ol>

      <h3>Step 5: Start Development Server</h3>
      <pre><code>{`# Start the server
npm run dev

# You should see:
# ▲ Next.js 16.x
# - Local: http://localhost:3001
# - Ready in X ms

# Open browser to http://localhost:3001`}</code></pre>

      <h3>Step 6: Verify Installation</h3>
      <pre><code>{`# Check health endpoint
curl http://localhost:3001/api/health

# Should return:
# {"status":"ok"}

# Try uploading a test PDF through the web interface`}</code></pre>

      <h2>Docker Installation</h2>

      <h3>Step 1: Install Docker</h3>

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

      <h4>Ubuntu/Debian</h4>
      <pre><code>{`# Install Docker
curl -fsSL https://get.docker.com | sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and back in, then verify
docker --version

# Install Docker Compose
sudo apt install docker-compose-plugin`}</code></pre>

      <h3>Step 2: Clone and Configure</h3>
      <pre><code>{`# Clone repository
git clone https://github.com/traves-theberge/pdflow.git
cd pdflow

# Create .env file
echo "GEMINI_API_KEY=your-api-key-here" > .env

# Review docker-compose.yml
cat docker-compose.yml`}</code></pre>

      <h3>Step 3: Build and Start</h3>
      <pre><code>{`# Build the image (first time only)
docker-compose build

# Start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Should show pdflow container running on port 3535`}</code></pre>

      <h3>Step 4: Verify Docker Installation</h3>
      <pre><code>{`# Check health
curl http://localhost:3535/api/health

# View container logs
docker-compose logs pdflow

# Enter container (for debugging)
docker-compose exec pdflow sh`}</code></pre>

      <h3>Managing Docker Installation</h3>
      <pre><code>{`# Stop container
docker-compose down

# Restart container
docker-compose restart

# View logs
docker-compose logs -f pdflow

# Update after git pull
docker-compose build --no-cache
docker-compose up -d

# Remove all data and start fresh
docker-compose down -v
docker-compose up -d`}</code></pre>

      <h2>Production Deployment</h2>

      <h3>Step 1: Build for Production</h3>
      <pre><code>{`# Install dependencies
npm install --production

# Build Next.js application
npm run build

# This creates an optimized production build in .next/`}</code></pre>

      <h3>Step 2: Start Production Server</h3>
      <pre><code>{`# Start production server
npm start

# Runs on http://localhost:3001

# For production, consider using PM2:
npm install -g pm2
pm2 start npm --name "pdflow" -- start
pm2 save
pm2 startup  # Follow instructions to start on boot`}</code></pre>

      <h3>Step 3: Configure Reverse Proxy (Optional)</h3>

      <h4>Nginx</h4>
      <pre><code>{`# /etc/nginx/sites-available/pdflow
server {
    listen 80;
    server_name pdflow.yourdomain.com;

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

    client_max_body_size 500M;
}

# Enable site
sudo ln -s /etc/nginx/sites-available/pdflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx`}</code></pre>

      <h2>MCP Server Installation</h2>

      <h3>Step 1: Build MCP Server</h3>
      <pre><code>{`# Navigate to MCP directory
cd src/mcp

# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Verify build
ls dist/  # Should see server.js and index.js`}</code></pre>

      <h3>Step 2: Configure AI Tools</h3>
      <p>PDFlow MCP server works with multiple AI tools. See the <a href="/docs/ai-tools">MCP Integration</a> guide for detailed setup instructions for:</p>
      <ul>
        <li>Claude Desktop</li>
        <li>Claude Code</li>
        <li>Cursor</li>
        <li>VS Code (with Cline extension)</li>
      </ul>

      <h3>Step 3: Quick MCP Configuration Example</h3>
      <pre><code>{`{
  "mcpServers": {
    "pdflow": {
      "command": "node",
      "args": ["/full/path/to/pdflow/src/mcp/dist/server.js"],
      "env": {
        "PDFLOW_BASE_URL": "http://localhost:3001"
      }
    }
  }
}`}</code></pre>

      <p><strong>Note:</strong> Use <code>http://localhost:3535</code> if connecting to a Docker deployment. The MCP server only needs the PDFlow URL - your Gemini API key should be configured in PDFlow itself (via .env or Docker).</p>

      <h3>Step 4: Restart Your AI Tool</h3>
      <p>Completely quit and restart your AI tool for MCP tools to appear.</p>

      <h2>Troubleshooting</h2>

      <h3>Common Issues</h3>

      <h4>"Command not found: pdftocairo"</h4>
      <p>Install poppler-utils using the instructions above for your OS.</p>

      <h4>"Port 3001 already in use"</h4>
      <pre><code>{`# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in package.json
"dev": "next dev -p 3002"`}</code></pre>

      <h4>"Cannot find module"</h4>
      <pre><code>{`# Clean install
rm -rf node_modules package-lock.json
npm install`}</code></pre>

      <h4>"API key not found"</h4>
      <pre><code>{`# Verify .env file exists
cat .env

# Should show:
# GEMINI_API_KEY=AIza...

# Restart server after adding .env`}</code></pre>

      <h4>Docker: "Cannot connect to Docker daemon"</h4>
      <pre><code>{`# Start Docker
# macOS: Start Docker Desktop
# Linux: sudo systemctl start docker

# Check Docker is running
docker ps`}</code></pre>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/docs/quickstart">Quick Start Guide</a> - Get started with PDFlow</li>
        <li><a href="/docs/docker">Docker Guide</a> - Detailed Docker deployment</li>
        <li><a href="/docs/mcp">MCP Integration</a> - Connect with AI agents</li>
        <li><a href="/docs/troubleshooting">Troubleshooting</a> - Fix common issues</li>
      </ul>
    </>
  );
}
