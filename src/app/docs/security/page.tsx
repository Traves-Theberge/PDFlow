export default function SecurityPage() {
  return (
    <>
      <h1>Security Best Practices</h1>
      <p className="lead">
        Guidelines for securely deploying and using PDFlow in production environments.
      </p>

      <h2>API Key Security</h2>

      <h3>Storage</h3>
      <ul>
        <li>Never commit API keys to version control</li>
        <li>Use environment variables or secret management systems</li>
        <li>Rotate keys regularly</li>
        <li>Use separate keys for development and production</li>
      </ul>

      <h3>Environment Variables</h3>
      <pre><code>{`# .env file (add to .gitignore)
GEMINI_API_KEY=your-key-here

# Never do this:
const API_KEY = "AIza..."  # ❌ Hardcoded`}</code></pre>

      <h3>Secret Management</h3>
      <pre><code>{`# Docker Secrets
docker secret create gemini_key ./api_key.txt

# Kubernetes Secrets
kubectl create secret generic gemini-key \\
  --from-literal=key=your-key-here

# HashiCorp Vault
vault kv put secret/pdflow gemini_key=your-key-here`}</code></pre>

      <h2>Network Security</h2>

      <h3>HTTPS/TLS</h3>
      <p>Always use HTTPS in production:</p>
      <pre><code>{`# Nginx with Let's Encrypt
server {
    listen 443 ssl http2;
    server_name pdflow.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/pdflow.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pdflow.yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3001;
    }
}`}</code></pre>

      <h3>Firewall Configuration</h3>
      <pre><code>{`# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3001/tcp  # Block direct access to app

# Only allow localhost
sudo ufw allow from 127.0.0.1 to any port 3001`}</code></pre>

      <h3>Network Isolation</h3>
      <pre><code>{`# Docker network isolation
version: '3.8'
services:
  pdflow:
    networks:
      - internal
    ports:
      - "127.0.0.1:3001:3000"  # Bind to localhost only

networks:
  internal:
    driver: bridge
    internal: true`}</code></pre>

      <h2>Authentication & Authorization</h2>

      <h3>API Authentication</h3>
      <p>Add authentication middleware:</p>
      <pre><code>{`// middleware/auth.ts
export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token || !isValidToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

// Apply to routes
app.use('/api/upload', requireAuth);
app.use('/api/process', requireAuth);`}</code></pre>

      <h3>Rate Limiting</h3>
      <pre><code>{`import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);`}</code></pre>

      <h2>Input Validation</h2>

      <h3>File Upload Security</h3>
      <pre><code>{`// Validate file type
function validatePDF(file) {
  // Check MIME type
  if (file.mimetype !== 'application/pdf') {
    throw new Error('Only PDF files allowed');
  }

  // Check file signature (magic bytes)
  const buffer = file.buffer;
  if (buffer[0] !== 0x25 || buffer[1] !== 0x50 ||
      buffer[2] !== 0x44 || buffer[3] !== 0x46) {
    throw new Error('Invalid PDF file');
  }

  // Check file size
  const maxSize = 500 * 1024 * 1024; // 500MB
  if (file.size > maxSize) {
    throw new Error('File too large');
  }
}

// Sanitize filename
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 255);
}`}</code></pre>

      <h3>Path Traversal Prevention</h3>
      <pre><code>{`import path from 'path';

function validatePath(userPath, baseDir) {
  const resolvedPath = path.resolve(baseDir, userPath);

  // Ensure path is within baseDir
  if (!resolvedPath.startsWith(baseDir)) {
    throw new Error('Invalid path');
  }

  return resolvedPath;
}`}</code></pre>

      <h2>Data Protection</h2>

      <h3>Temporary File Cleanup</h3>
      <pre><code>{`// Automatic cleanup after processing
async function cleanupSession(sessionId) {
  const sessionDir = path.join(UPLOAD_DIR, sessionId);

  // Wait 1 hour before cleanup
  setTimeout(async () => {
    await fs.rm(sessionDir, { recursive: true });
    console.log(\`Cleaned up session: \${sessionId}\`);
  }, 60 * 60 * 1000);
}

// Run cleanup on startup
async function cleanupOldSessions() {
  const sessions = await fs.readdir(UPLOAD_DIR);
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const session of sessions) {
    const sessionPath = path.join(UPLOAD_DIR, session);
    const stats = await fs.stat(sessionPath);

    if (now - stats.mtimeMs > maxAge) {
      await fs.rm(sessionPath, { recursive: true });
    }
  }
}`}</code></pre>

      <h3>Secure File Permissions</h3>
      <pre><code>{`# Restrict file permissions
chmod 700 uploads/
chmod 700 outputs/

# Run as non-root user
RUN useradd -m -u 1000 pdflow
USER pdflow`}</code></pre>

      <h2>Docker Security</h2>

      <h3>Secure Dockerfile</h3>
      <pre><code>{`FROM node:18-alpine

# Run as non-root
RUN addgroup -g 1000 pdflow && \\
    adduser -D -u 1000 -G pdflow pdflow

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY --chown=pdflow:pdflow package*.json ./
RUN npm ci --only=production

# Copy application
COPY --chown=pdflow:pdflow . .

# Switch to non-root user
USER pdflow

# Expose port
EXPOSE 3000

CMD ["npm", "start"]`}</code></pre>

      <h3>Docker Security Options</h3>
      <pre><code>{`# docker-compose.yml
services:
  pdflow:
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    read_only: true
    tmpfs:
      - /tmp
      - /app/uploads
      - /app/outputs`}</code></pre>

      <h2>Monitoring & Logging</h2>

      <h3>Security Logging</h3>
      <pre><code>{`// Log security events
function logSecurityEvent(event, details) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    ...details,
    // Don't log sensitive data!
    apiKey: undefined,
    password: undefined,
  }));
}

// Examples
logSecurityEvent('auth_failure', { ip: req.ip });
logSecurityEvent('large_file_rejected', { size: file.size });
logSecurityEvent('rate_limit_exceeded', { ip: req.ip });`}</code></pre>

      <h3>Monitoring</h3>
      <pre><code>{`// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

// Prometheus metrics
import promClient from 'prom-client';

const requestCounter = new promClient.Counter({
  name: 'pdflow_requests_total',
  help: 'Total number of requests',
  labelNames: ['method', 'endpoint', 'status'],
});

app.use((req, res, next) => {
  res.on('finish', () => {
    requestCounter.inc({
      method: req.method,
      endpoint: req.path,
      status: res.statusCode,
    });
  });
  next();
});`}</code></pre>

      <h2>Production Checklist</h2>

      <ul>
        <li>✅ API keys in environment variables, not code</li>
        <li>✅ HTTPS/TLS enabled</li>
        <li>✅ Firewall configured</li>
        <li>✅ Authentication implemented</li>
        <li>✅ Rate limiting active</li>
        <li>✅ Input validation in place</li>
        <li>✅ File size limits enforced</li>
        <li>✅ Temporary file cleanup automated</li>
        <li>✅ Running as non-root user</li>
        <li>✅ Security headers configured</li>
        <li>✅ Logging and monitoring set up</li>
        <li>✅ Regular security updates scheduled</li>
      </ul>

      <h2>Security Headers</h2>
      <pre><code>{`// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});`}</code></pre>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/docs/docker">Docker Deployment</a> - Secure containerization</li>
        <li><a href="/docs/performance">Performance</a> - Optimization tips</li>
        <li><a href="/docs/troubleshooting">Troubleshooting</a> - Fix issues</li>
      </ul>
    </>
  );
}
