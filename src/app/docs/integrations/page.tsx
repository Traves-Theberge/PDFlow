export default function IntegrationsPage() {
  return (
    <>
      <h1>Custom Integrations</h1>
      <p className="lead">
        Build custom integrations with PDFlow using the HTTP API or MCP protocol.
      </p>

      <h2>Integration Options</h2>

      <h3>HTTP API</h3>
      <p>Direct REST API integration for any language or platform.</p>
      <ul>
        <li>Simple HTTP requests</li>
        <li>Works with any programming language</li>
        <li>No special dependencies</li>
        <li>Full control over workflow</li>
      </ul>

      <h3>MCP Protocol</h3>
      <p>Model Context Protocol for AI assistant integration.</p>
      <ul>
        <li>Built for AI assistants</li>
        <li>Standardized protocol</li>
        <li>Natural language interface</li>
        <li>Context-aware operations</li>
      </ul>

      <h2>HTTP API Integration Examples</h2>

      <h3>Python</h3>
      <pre><code>{`import requests
import time

def extract_pdf(pdf_path, format='markdown'):
    # 1. Upload PDF
    with open(pdf_path, 'rb') as f:
        response = requests.post(
            'http://localhost:3001/api/upload',
            files={'file': f}
        )

    session_data = response.json()
    session_id = session_data['sessionId']

    # 2. Start processing
    requests.post(
        'http://localhost:3001/api/process',
        json={
            'sessionId': session_id,
            'format': format,
            'aggregate': True
        }
    )

    # 3. Poll for completion
    while True:
        status = requests.get(
            f'http://localhost:3001/api/process?sessionId={session_id}'
        ).json()

        if status['completedPages'] == status['totalPages']:
            break

        time.sleep(2)

    # 4. Download result
    result = requests.get(
        f'http://localhost:3001/api/outputs/{session_id}/full.{format}'
    )

    return result.text

# Usage
content = extract_pdf('document.pdf', 'markdown')
print(content)`}</code></pre>

      <h3>JavaScript/TypeScript</h3>
      <pre><code>{`async function extractPDF(
  pdfPath: string,
  format: string = 'markdown'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(pdfPath));

  // 1. Upload PDF
  const uploadResponse = await fetch('http://localhost:3001/api/upload', {
    method: 'POST',
    body: formData,
  });
  const { sessionId } = await uploadResponse.json();

  // 2. Start processing
  await fetch('http://localhost:3001/api/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      format,
      aggregate: true,
    }),
  });

  // 3. Poll for completion
  while (true) {
    const statusResponse = await fetch(
      \`http://localhost:3001/api/process?sessionId=\${sessionId}\`
    );
    const status = await statusResponse.json();

    if (status.completedPages === status.totalPages) {
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // 4. Download result
  const resultResponse = await fetch(
    \`http://localhost:3001/api/outputs/\${sessionId}/full.\${format}\`
  );

  return await resultResponse.text();
}

// Usage
const content = await extractPDF('document.pdf', 'json');
console.log(content);`}</code></pre>

      <h3>cURL/Bash</h3>
      <pre><code>{`#!/bin/bash
PDF_FILE="document.pdf"
FORMAT="markdown"

# 1. Upload PDF
RESPONSE=$(curl -s -X POST http://localhost:3001/api/upload \\
  -F "file=@$PDF_FILE")

SESSION_ID=$(echo $RESPONSE | jq -r '.sessionId')
echo "Session ID: $SESSION_ID"

# 2. Start processing
curl -s -X POST http://localhost:3001/api/process \\
  -H "Content-Type: application/json" \\
  -d "{
    \\"sessionId\\": \\"$SESSION_ID\\",
    \\"format\\": \\"$FORMAT\\",
    \\"aggregate\\": true
  }"

# 3. Poll for completion
while true; do
  STATUS=$(curl -s "http://localhost:3001/api/process?sessionId=$SESSION_ID")
  COMPLETED=$(echo $STATUS | jq -r '.completedPages')
  TOTAL=$(echo $STATUS | jq -r '.totalPages')

  echo "Progress: $COMPLETED/$TOTAL"

  if [ "$COMPLETED" = "$TOTAL" ]; then
    break
  fi

  sleep 2
done

# 4. Download result
curl -s "http://localhost:3001/api/outputs/$SESSION_ID/full.$FORMAT" \\
  -o "output.$FORMAT"

echo "Extraction complete: output.$FORMAT"`}</code></pre>

      <h2>Webhook Integration</h2>
      <p>Receive notifications when processing completes:</p>

      <pre><code>{`// Start processing with webhook
await fetch('http://localhost:3001/api/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'session_123',
    format: 'json',
    aggregate: true,
    webhook: 'https://your-server.com/webhook'
  }),
});

// Your webhook endpoint receives:
{
  "sessionId": "session_123",
  "status": "completed",
  "totalPages": 10,
  "format": "json",
  "downloadUrl": "/api/outputs/session_123/full.json"
}`}</code></pre>

      <h2>MCP Client Example</h2>

      <h3>Custom MCP Client</h3>
      <pre><code>{`import { MCPClient } from '@anthropic-ai/sdk';

const client = new MCPClient({
  serverCommand: 'node',
  serverArgs: ['/path/to/pdflow/src/mcp/dist/server.js'],
  env: {
    PDFLOW_BASE_URL: 'http://localhost:3001',
  },
});

// Extract PDF
const result = await client.callTool('pdflow_extract_pdf', {
  pdfPath: '/path/to/document.pdf',
  format: 'markdown',
  aggregate: true,
});

console.log(result.content);`}</code></pre>

      <p><strong>Note:</strong> The MCP server only needs <code>PDFLOW_BASE_URL</code>. Your Gemini API key should be configured in PDFlow itself (via <code>.env</code> file or Docker environment), not in the MCP client configuration.</p>

      <h2>Use Cases</h2>

      <h3>Automated Document Processing Pipeline</h3>
      <pre><code>{`# Watch directory for new PDFs
import watchdog
import pdflow_client

def process_new_pdf(file_path):
    content = pdflow_client.extract(file_path, 'json')
    database.save(content)
    elasticsearch.index(content)
    email.notify_team(file_path)

watcher.watch('/incoming/pdfs', process_new_pdf)`}</code></pre>

      <h3>Slack Bot Integration</h3>
      <pre><code>{`// Slack command: /extract <pdf-url>
app.command('/extract', async ({ command, ack, respond }) => {
  await ack();

  // Download PDF from URL
  const pdfBuffer = await downloadPDF(command.text);

  // Extract with PDFlow
  const content = await pdflowClient.extract(pdfBuffer);

  // Reply in Slack
  await respond({
    text: \`PDF extracted successfully!\n\n\${content.substring(0, 500)}...\`
  });
});`}</code></pre>

      <h3>Database Ingestion</h3>
      <pre><code>{`import pdflow
import chromadb

# Extract PDF
content = pdflow.extract('research_paper.pdf', 'markdown')

# Chunk and embed
chunks = split_into_chunks(content)
embeddings = create_embeddings(chunks)

# Store in vector database
db.add(documents=chunks, embeddings=embeddings)`}</code></pre>

      <h2>Best Practices</h2>

      <h3>Error Handling</h3>
      <pre><code>{`try:
    content = pdflow_client.extract(pdf_path)
except PDFTooLargeError:
    # Handle file size limit
    pass
except APIKeyInvalidError:
    # Handle auth error
    pass
except ProcessingTimeoutError:
    # Handle timeout
    pass`}</code></pre>

      <h3>Rate Limiting</h3>
      <pre><code>{`from ratelimit import limits

@limits(calls=2, period=60)  # Gemini free tier: 2/min
def extract_pdf(path):
    return pdflow_client.extract(path)`}</code></pre>

      <h3>Caching Results</h3>
      <pre><code>{`import hashlib
import redis

def extract_with_cache(pdf_path):
    # Check cache
    file_hash = hashlib.md5(open(pdf_path, 'rb').read()).hexdigest()
    cached = redis.get(file_hash)

    if cached:
        return cached

    # Extract if not cached
    content = pdflow_client.extract(pdf_path)
    redis.set(file_hash, content, ex=86400)  # 24h cache

    return content`}</code></pre>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/docs/api">API Reference</a> - Full API documentation</li>
        <li><a href="/docs/mcp">MCP Integration</a> - MCP protocol details</li>
        <li><a href="/docs/troubleshooting">Troubleshooting</a> - Common issues</li>
      </ul>
    </>
  );
}
