export default function PerformancePage() {
  return (
    <>
      <h1>Performance Optimization</h1>
      <p className="lead">
        Tips and best practices for optimizing PDFlow performance.
      </p>

      <h2>Processing Speed</h2>

      <h3>Factors Affecting Speed</h3>
      <ul>
        <li><strong>PDF Size:</strong> Larger files take longer to convert and process</li>
        <li><strong>Page Count:</strong> More pages = more API calls to Gemini</li>
        <li><strong>Image Quality:</strong> Higher resolution = larger images = longer processing</li>
        <li><strong>API Rate Limits:</strong> May vary based on your Gemini API tier</li>
        <li><strong>Network Speed:</strong> Upload and API call latency</li>
      </ul>

      <h2>Optimization Strategies</h2>

      <h3>1. Optimize PDF Before Upload</h3>
      <pre><code>{`# Reduce PDF file size
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \\
   -dPDFSETTINGS=/ebook \\
   -dNOPAUSE -dQUIET -dBATCH \\
   -sOutputFile=output.pdf input.pdf

# Remove unnecessary pages
pdftk input.pdf cat 1-10 output output.pdf`}</code></pre>

      <h3>2. Adjust Image Conversion Quality</h3>
      <pre><code>{`# In convertPdfToImages.sh, adjust DPI
pdftocairo -webp -r 150 "$PDF_FILE"  # Lower DPI = faster
# Default: 200 DPI
# Higher quality: 300 DPI
# Faster: 150 DPI or 100 DPI`}</code></pre>

      <h3>3. Parallel Processing</h3>
      <pre><code>{`// Process multiple PDFs in parallel
const pdfs = ['doc1.pdf', 'doc2.pdf', 'doc3.pdf'];

const results = await Promise.all(
  pdfs.map(pdf => extractPDF(pdf))
);`}</code></pre>

      <h3>4. Upgrade to Paid Gemini Tier</h3>
      <p>Significantly faster processing with higher rate limits:</p>
      <ul>
        <li>Visit <a href="https://ai.google.dev/pricing" target="_blank" rel="noopener noreferrer">Google AI Pricing</a></li>
        <li>Enable billing in Google Cloud Console</li>
        <li>Generate new API key with billing enabled</li>
        <li>Update <code>GEMINI_API_KEY</code> in environment</li>
      </ul>

      <h2>Resource Management</h2>

      <h3>Memory Optimization</h3>
      <pre><code>{`# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Docker memory limits
services:
  pdflow:
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G`}</code></pre>

      <h3>CPU Optimization</h3>
      <pre><code>{`# Docker CPU limits
services:
  pdflow:
    deploy:
      resources:
        limits:
          cpus: '2.0'
        reservations:
          cpus: '1.0'`}</code></pre>

      <h3>Disk I/O</h3>
      <pre><code>{`# Use SSD for uploads/outputs directories
# Mount fast storage
volumes:
  - /fast-ssd/uploads:/app/uploads
  - /fast-ssd/outputs:/app/outputs

# Clean up old files regularly
find uploads/ -mtime +1 -delete
find outputs/ -mtime +1 -delete`}</code></pre>

      <h2>Caching Strategies</h2>

      <h3>Result Caching</h3>
      <pre><code>{`import Redis from 'ioredis';
import crypto from 'crypto';

const redis = new Redis();

async function extractWithCache(pdfPath: string) {
  // Generate cache key from file hash
  const fileBuffer = await fs.readFile(pdfPath);
  const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
  const cacheKey = \`pdf:\${hash}\`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log('Cache hit!');
    return JSON.parse(cached);
  }

  // Extract if not cached
  const result = await extractPDF(pdfPath);

  // Cache for 24 hours
  await redis.setex(cacheKey, 86400, JSON.stringify(result));

  return result;
}`}</code></pre>

      <h3>Image Caching</h3>
      <pre><code>{`// Cache converted WebP images
const imageCache = new Map();

function getCachedImage(pdfHash, pageNumber) {
  const key = \`\${pdfHash}:\${pageNumber}\`;
  return imageCache.get(key);
}

function cacheImage(pdfHash, pageNumber, imageData) {
  const key = \`\${pdfHash}:\${pageNumber}\`;
  imageCache.set(key, imageData);

  // Limit cache size
  if (imageCache.size > 1000) {
    const firstKey = imageCache.keys().next().value;
    imageCache.delete(firstKey);
  }
}`}</code></pre>

      <h2>Batch Processing</h2>

      <h3>Queue System</h3>
      <pre><code>{`import Bull from 'bull';

const pdfQueue = new Bull('pdf-extraction', {
  redis: { host: 'localhost', port: 6379 }
});

// Add jobs to queue
pdfQueue.add('extract', {
  pdfPath: '/path/to/file.pdf',
  format: 'markdown',
});

// Process jobs with concurrency
pdfQueue.process('extract', 5, async (job) => {
  const { pdfPath, format } = job.data;
  return await extractPDF(pdfPath, format);
});

// Track progress
pdfQueue.on('completed', (job, result) => {
  console.log(\`Job \${job.id} completed\`);
});`}</code></pre>

      <h3>Bulk Processing Script</h3>
      <pre><code>{`#!/bin/bash
# Process directory of PDFs in batches

BATCH_SIZE=5
PDF_DIR="./pdfs"
OUTPUT_DIR="./outputs"

find "$PDF_DIR" -name "*.pdf" | \\
  xargs -n $BATCH_SIZE -P $BATCH_SIZE -I {} \\
  npm run pdflow -- extract {} -o "$OUTPUT_DIR"

echo "Batch processing complete"`}</code></pre>

      <h2>Monitoring Performance</h2>

      <h3>Metrics Collection</h3>
      <pre><code>{`import { performance } from 'perf_hooks';

class PerformanceMonitor {
  private timings: Map<string, number[]> = new Map();

  start(label: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;

      if (!this.timings.has(label)) {
        this.timings.set(label, []);
      }

      this.timings.get(label)!.push(duration);
    };
  }

  getStats(label: string) {
    const times = this.timings.get(label) || [];

    return {
      count: times.length,
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
    };
  }
}

// Usage
const monitor = new PerformanceMonitor();

const endTimer = monitor.start('pdf-conversion');
await convertPDF(file);
endTimer();

console.log(monitor.getStats('pdf-conversion'));`}</code></pre>

      <h3>Profiling</h3>
      <pre><code>{`# Enable Node.js profiler
node --prof src/cli/pdflow.ts extract document.pdf

# Analyze profile
node --prof-process isolate-*.log > processed.txt

# Use clinic.js for detailed profiling
npm install -g clinic
clinic doctor -- npm run pdflow -- extract large.pdf`}</code></pre>

      <h2>Network Optimization</h2>

      <h3>Connection Pooling</h3>
      <pre><code>{`import { Agent } from 'https';

const agent = new Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
});

// Use agent for API calls
const response = await fetch(geminiApiUrl, {
  agent,
  ...options,
});`}</code></pre>

      <h3>Compression</h3>
      <pre><code>{`import compression from 'compression';

// Enable gzip compression
app.use(compression({
  level: 6,
  threshold: 1024,
}));`}</code></pre>

      <h2>Best Practices</h2>

      <ul>
        <li>Process PDFs during off-peak hours for rate-limited accounts</li>
        <li>Split large documents into smaller chunks</li>
        <li>Use appropriate DPI for your use case (lower = faster)</li>
        <li>Cache results when processing same files multiple times</li>
        <li>Monitor and log performance metrics</li>
        <li>Upgrade to paid tier for production workloads</li>
        <li>Use SSD storage for temporary files</li>
        <li>Implement queue system for high volume</li>
      </ul>

      <h2>Hardware Recommendations</h2>

      <h3>Development</h3>
      <ul>
        <li>CPU: 2+ cores</li>
        <li>RAM: 4GB minimum, 8GB recommended</li>
        <li>Storage: 10GB available</li>
        <li>Network: Standard broadband</li>
      </ul>

      <h3>Production (Light Load)</h3>
      <ul>
        <li>CPU: 4 cores</li>
        <li>RAM: 8GB</li>
        <li>Storage: 50GB SSD</li>
        <li>Network: 100Mbps+</li>
      </ul>

      <h3>Production (Heavy Load)</h3>
      <ul>
        <li>CPU: 8+ cores</li>
        <li>RAM: 16GB+</li>
        <li>Storage: 500GB+ NVMe SSD</li>
        <li>Network: 1Gbps+</li>
        <li>Consider horizontal scaling with load balancer</li>
      </ul>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/docs/docker">Docker Deployment</a> - Optimize containerized deployments</li>
        <li><a href="/docs/security">Security</a> - Secure production deployments</li>
        <li><a href="/docs/troubleshooting">Troubleshooting</a> - Fix performance issues</li>
      </ul>
    </>
  );
}
