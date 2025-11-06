export default function QuickStartPage() {
  return (
    <>
      <h1>Quick Start Guide</h1>
      <p className="lead">
        Get PDFlow up and running in under 5 minutes.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li><strong>Node.js 20+</strong> - <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">Download</a> (required for Next.js 16)</li>
        <li><strong>Gemini API Key</strong> - <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Get one free</a></li>
        <li><strong>PDF files</strong> to process</li>
      </ul>

      <h2>Installation</h2>

      <h3>Option 1: Local Development</h3>
      <pre><code>{`# Clone the repository
git clone https://github.com/traves-theberge/pdflow.git
cd pdflow

# Install dependencies
npm install

# Set your Gemini API key
echo "GEMINI_API_KEY=your-api-key-here" > .env

# Start the development server
npm run dev`}</code></pre>

      <p>Open <a href="http://localhost:3001">http://localhost:3001</a> in your browser.</p>

      <h3>Option 2: Docker (Recommended for Production)</h3>
      <pre><code>{`# Clone the repository
git clone https://github.com/traves-theberge/pdflow.git
cd pdflow

# Create environment file
echo "GEMINI_API_KEY=your-api-key-here" > .env

# Start with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f`}</code></pre>

      <p>Access at <a href="http://localhost:3535">http://localhost:3535</a></p>

      <h2>Your First Extraction</h2>

      <h3>Web Interface</h3>
      <ol>
        <li>
          <strong>Upload PDF</strong>
          <ul>
            <li>Click "Upload PDF" or drag & drop</li>
            <li>Select your PDF file (up to 500MB)</li>
            <li>Wait for conversion (~5-10 seconds)</li>
          </ul>
        </li>
        <li>
          <strong>Choose Format</strong>
          <ul>
            <li>Select output format: Markdown, JSON, XML, HTML, YAML, or MDX</li>
            <li>Toggle "Aggregate" to combine all pages</li>
          </ul>
        </li>
        <li>
          <strong>Extract</strong>
          <ul>
            <li>Click "Start Extraction"</li>
            <li>Watch progress in real-time</li>
            <li>Download results when complete</li>
          </ul>
        </li>
      </ol>

      <h3>CLI</h3>
      <pre><code>{`# Build the CLI first
npm run cli:build

# Extract a PDF to Markdown
npm run pdflow -- extract document.pdf

# Extract to JSON with all pages aggregated
npm run pdflow -- extract report.pdf --format json --aggregate

# Extract specific pages
npm run pdflow -- extract slides.pdf --pages 1,3,5-10

# Custom output directory
npm run pdflow -- extract data.pdf --output ./my-extractions`}</code></pre>

      <h3>API</h3>
      <pre><code>{`# Upload a PDF (use port 3001 for dev, 3535 for Docker)
curl -X POST http://localhost:3001/api/upload \\
  -F "file=@document.pdf"

# Returns: {"sessionId": "session_xxx", "pageCount": 10}

# Start extraction
curl -X POST http://localhost:3001/api/process \\
  -H "Content-Type: application/json" \\
  -d '{
    "sessionId": "session_xxx",
    "format": "markdown",
    "aggregate": true
  }'

# Check status
curl http://localhost:3001/api/process?sessionId=session_xxx

# Download results
curl http://localhost:3001/api/outputs/session_xxx/aggregated.md`}</code></pre>

      <h2>Common Workflows</h2>

      <h3>Research Papers → Markdown</h3>
      <pre><code>{`# Extract academic paper
npm run pdflow -- extract research_paper.pdf \\
  --format markdown \\
  --aggregate \\
  --output ./papers

# Result: Clean markdown with headings, lists, equations`}</code></pre>

      <h3>Invoices → JSON</h3>
      <pre><code>{`# Extract invoice data
npm run pdflow -- extract invoice.pdf \\
  --format json \\
  --aggregate

# Result: Structured JSON with line items, totals, dates`}</code></pre>

      <h3>Batch Processing</h3>
      <pre><code>{`#!/bin/bash
# process-all.sh

for pdf in ./pdfs/*.pdf; do
  echo "Processing: $pdf"
  npm run pdflow -- extract "$pdf" --format markdown --aggregate
done`}</code></pre>

      <h3>With AI Assistants (MCP)</h3>
      <p>Once configured with Claude Desktop, Claude Code, Cursor, or VS Code:</p>
      <pre><code>{`User: "Extract the content from ~/Documents/contract.pdf and summarize the key terms"

Claude: [Uses PDFlow MCP tool]
"I've extracted the contract. Here are the key terms:
1. Payment: Net 30 days
2. Duration: 12 months
3. Termination: 30 days notice
..."`}</code></pre>

      <p>See <a href="/docs/ai-tools">MCP Integration</a> for setup.</p>

      <h2>Configuration</h2>

      <h3>Environment Variables</h3>
      <p>Create a <code>.env</code> file:</p>
      <pre><code>{`# Required
GEMINI_API_KEY=your-google-gemini-api-key

# Optional
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3001

# For MCP (use 3535 for Docker, 3001 for local dev)
PDFLOW_BASE_URL=http://localhost:3001`}</code></pre>

      <h3>Advanced Settings</h3>
      <pre><code>{`# Increase memory limit for large PDFs
NODE_OPTIONS=--max-old-space-size=4096

# Custom upload directory
UPLOAD_DIR=./custom-uploads

# Custom output directory
OUTPUT_DIR=./custom-outputs`}</code></pre>

      <h2>Troubleshooting</h2>

      <h3>"API key not found"</h3>
      <p>Make sure <code>.env</code> file exists and contains:</p>
      <pre><code>GEMINI_API_KEY=AIzaSy...</code></pre>

      <h3>"Command not found: pdftocairo"</h3>
      <p><strong>macOS:</strong></p>
      <pre><code>brew install poppler</code></pre>

      <p><strong>Ubuntu/Debian:</strong></p>
      <pre><code>sudo apt-get install poppler-utils</code></pre>

      <p><strong>Docker:</strong> Already included in image</p>

      <h3>"Upload failed"</h3>
      <p>Check:</p>
      <ol>
        <li>File is valid PDF</li>
        <li>File size &lt; 500MB</li>
        <li>File is not password-protected</li>
      </ol>

      <h3>"Extraction timeout"</h3>
      <p>Large PDFs may take time:</p>
      <ul>
        <li>10 pages: ~30-60 seconds</li>
        <li>50 pages: ~3-5 minutes</li>
        <li>100+ pages: ~10+ minutes</li>
      </ul>
      <p>Be patient or split into smaller PDFs.</p>

      <h2>Getting Help</h2>
      <ul>
        <li><strong>Documentation</strong>: Browse the full docs</li>
        <li><strong>GitHub Issues</strong>: <a href="https://github.com/traves-theberge/pdflow/issues" target="_blank" rel="noopener noreferrer">Report bugs</a></li>
        <li><strong>Discussions</strong>: <a href="https://github.com/traves-theberge/pdflow/discussions" target="_blank" rel="noopener noreferrer">Ask questions</a></li>
      </ul>

      <p>Ready to dive deeper? Check out the <a href="/docs/web-interface">Web Interface Guide</a> or <a href="/docs/cli">CLI Documentation</a>.</p>
    </>
  );
}
