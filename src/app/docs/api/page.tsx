export default function APIPage() {
  return (
    <>
      <h1>API Reference</h1>
      <p className="lead">
        Complete HTTP API reference for integrating PDFlow into your applications.
      </p>

      <h2>Base URL</h2>
      <pre><code>http://localhost:3001</code></pre>

      <h2>Authentication</h2>
      <p>PDFlow requires a Gemini API key for PDF extraction. The key should be set in the environment variable <code>GEMINI_API_KEY</code> or provided via the settings modal in the web interface.</p>

      <h2>Endpoints</h2>

      <h3>POST /api/upload</h3>
      <p>Upload a PDF file for processing.</p>

      <p><strong>Request:</strong></p>
      <pre><code>{`POST /api/upload
Content-Type: multipart/form-data

file: <PDF file>`}</code></pre>

      <p><strong>Response:</strong></p>
      <pre><code>{`{
  "sessionId": "session_1234567890_abc123",
  "pageCount": 10,
  "message": "PDF uploaded and converted successfully"
}`}</code></pre>

      <p><strong>Example:</strong></p>
      <pre><code>{`curl -X POST http://localhost:3001/api/upload \\
  -F "file=@document.pdf"`}</code></pre>

      <h3>POST /api/process</h3>
      <p>Start processing a PDF that has been uploaded.</p>

      <p><strong>Request:</strong></p>
      <pre><code>{`POST /api/process
Content-Type: application/json

{
  "sessionId": "session_1234567890_abc123",
  "format": "markdown",
  "aggregate": true
}`}</code></pre>

      <p><strong>Parameters:</strong></p>
      <ul>
        <li><code>sessionId</code> (string, required) - Session ID from upload response</li>
        <li><code>format</code> (string, optional) - Output format: markdown, json, xml, yaml, html, mdx, csv. Default: markdown</li>
        <li><code>aggregate</code> (boolean, optional) - Combine all pages into one file. Default: false</li>
      </ul>

      <p><strong>Response:</strong></p>
      <pre><code>{`{
  "message": "Processing started",
  "sessionId": "session_1234567890_abc123",
  "totalPages": 10
}`}</code></pre>

      <p><strong>Example:</strong></p>
      <pre><code>{`curl -X POST http://localhost:3001/api/process \\
  -H "Content-Type: application/json" \\
  -d '{
    "sessionId": "session_1234567890_abc123",
    "format": "markdown",
    "aggregate": true
  }'`}</code></pre>

      <h3>GET /api/process</h3>
      <p>Check the status of PDF processing.</p>

      <p><strong>Request:</strong></p>
      <pre><code>GET /api/process?sessionId=session_1234567890_abc123</code></pre>

      <p><strong>Response:</strong></p>
      <pre><code>{`{
  "sessionId": "session_1234567890_abc123",
  "totalPages": 10,
  "completedPages": 7,
  "progress": 70,
  "status": "processing",
  "pages": [
    {
      "pageNumber": 1,
      "status": "completed",
      "outputPath": "/outputs/session_1234567890_abc123/page-1.md"
    },
    ...
  ]
}`}</code></pre>

      <p><strong>Example:</strong></p>
      <pre><code>curl http://localhost:3001/api/process?sessionId=session_1234567890_abc123</code></pre>

      <h3>POST /api/aggregate</h3>
      <p>Combine all processed pages into a single file.</p>

      <p><strong>Request:</strong></p>
      <pre><code>{`POST /api/aggregate
Content-Type: application/json

{
  "sessionId": "session_1234567890_abc123",
  "format": "markdown"
}`}</code></pre>

      <p><strong>Response:</strong></p>
      <pre><code>{`{
  "message": "Pages aggregated successfully",
  "outputPath": "/outputs/session_1234567890_abc123/full.markdown",
  "downloadUrl": "/api/outputs/session_1234567890_abc123/full.markdown"
}`}</code></pre>

      <h3>GET /api/outputs/:sessionId/:filename</h3>
      <p>Download a processed output file.</p>

      <p><strong>Request:</strong></p>
      <pre><code>GET /api/outputs/session_1234567890_abc123/page-1.md</code></pre>

      <p><strong>Response:</strong></p>
      <p>Returns the file content with appropriate Content-Type header.</p>

      <p><strong>Example:</strong></p>
      <pre><code>curl http://localhost:3001/api/outputs/session_1234567890_abc123/full.markdown</code></pre>

      <h3>GET /api/health</h3>
      <p>Check if the API server is running.</p>

      <p><strong>Request:</strong></p>
      <pre><code>GET /api/health</code></pre>

      <p><strong>Response:</strong></p>
      <pre><code>{`{
  "status": "ok"
}`}</code></pre>

      <h2>Complete Workflow Example</h2>

      <h3>1. Upload PDF</h3>
      <pre><code>{`curl -X POST http://localhost:3001/api/upload \\
  -F "file=@document.pdf"

# Response:
# {
#   "sessionId": "session_1234567890_abc123",
#   "pageCount": 10
# }`}</code></pre>

      <h3>2. Start Processing</h3>
      <pre><code>{`curl -X POST http://localhost:3001/api/process \\
  -H "Content-Type: application/json" \\
  -d '{
    "sessionId": "session_1234567890_abc123",
    "format": "json",
    "aggregate": true
  }'`}</code></pre>

      <h3>3. Check Status</h3>
      <pre><code>{`curl http://localhost:3001/api/process?sessionId=session_1234567890_abc123

# Keep polling until status shows all pages completed`}</code></pre>

      <h3>4. Download Results</h3>
      <pre><code>{`# Download individual page
curl http://localhost:3001/api/outputs/session_1234567890_abc123/page-1.json

# Download aggregated file
curl http://localhost:3001/api/outputs/session_1234567890_abc123/full.json`}</code></pre>

      <h2>Error Responses</h2>

      <h3>400 Bad Request</h3>
      <pre><code>{`{
  "error": "Missing required parameter: sessionId"
}`}</code></pre>

      <h3>404 Not Found</h3>
      <pre><code>{`{
  "error": "Session not found"
}`}</code></pre>

      <h3>500 Internal Server Error</h3>
      <pre><code>{`{
  "error": "Processing failed",
  "details": "API key not configured"
}`}</code></pre>

      <h2>Rate Limiting</h2>
      <p>PDFlow API is subject to Gemini API rate limits:</p>
      <ul>
        <li>Free tier: 50 requests per day, 2 requests per minute</li>
        <li>Paid tier: Higher limits based on your Google Cloud plan</li>
      </ul>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/docs/cli">CLI Guide</a> - Command-line interface</li>
        <li><a href="/docs/integrations">Custom Integrations</a> - Build with the API</li>
        <li><a href="/docs/mcp">MCP Integration</a> - Connect with AI agents</li>
      </ul>
    </>
  );
}
