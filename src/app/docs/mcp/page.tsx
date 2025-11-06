export default function MCPPage() {
  return (
    <>
      <h1>MCP Server Integration</h1>
      <p className="lead">
        Connect PDFlow with Claude Desktop and other AI assistants via the Model Context Protocol.
      </p>

      <h2>What is MCP?</h2>
      <p>The Model Context Protocol (MCP) allows AI assistants like Claude to interact with external tools and services. With PDFlow's MCP server, Claude can extract PDF content directly from your conversations.</p>

      <h2>Quick Start</h2>

      <h3>1. Build MCP Server</h3>
      <pre><code>{`cd src/mcp
npm install
npm run build`}</code></pre>

      <h3>2. Configure Claude Desktop</h3>
      <p><strong>macOS:</strong></p>
      <pre><code>vim ~/Library/Application\\ Support/Claude/claude_desktop_config.json</code></pre>

      <p><strong>Linux:</strong></p>
      <pre><code>vim ~/.config/Claude/claude_desktop_config.json</code></pre>

      <h3>3. Add PDFlow Configuration</h3>
      <pre><code>{`{
  "mcpServers": {
    "pdflow": {
      "command": "node",
      "args": ["/full/path/to/pdflow/src/mcp/dist/server.js"],
      "env": {
        "PDFLOW_BASE_URL": "http://localhost:3001",
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}`}</code></pre>

      <h3>4. Restart Claude Desktop</h3>
      <p>Completely quit Claude Desktop (Cmd+Q / Alt+F4) and restart it.</p>

      <h2>Available Tools</h2>

      <h3>pdflow_extract_pdf</h3>
      <p>Extract content from a PDF file.</p>

      <p><strong>Parameters:</strong></p>
      <ul>
        <li><code>pdfPath</code> (string, required) - Absolute path to PDF file</li>
        <li><code>format</code> (string, optional) - Output format: markdown, json, xml, yaml, html, mdx, csv. Default: markdown</li>
        <li><code>aggregate</code> (boolean, optional) - Combine all pages into one file. Default: true</li>
      </ul>

      <p><strong>Example usage in Claude:</strong></p>
      <blockquote>
        Extract the content from ~/Documents/report.pdf
      </blockquote>

      <h3>pdflow_check_status</h3>
      <p>Check the processing status of a PDF.</p>

      <p><strong>Parameters:</strong></p>
      <ul>
        <li><code>sessionId</code> (string, required) - Session ID from extraction</li>
      </ul>

      <h3>pdflow_health_check</h3>
      <p>Verify PDFlow service is running.</p>

      <p><strong>Example usage in Claude:</strong></p>
      <blockquote>
        Is PDFlow running? Use pdflow_health_check
      </blockquote>

      <h2>Configuration</h2>

      <h3>Environment Variables</h3>
      <ul>
        <li><code>PDFLOW_BASE_URL</code> - URL of your PDFlow server (default: http://localhost:3001)</li>
        <li><code>GEMINI_API_KEY</code> - Your Google Gemini API key</li>
      </ul>

      <h3>Important Notes</h3>
      <ul>
        <li>Use <strong>absolute paths</strong> for all file paths (no <code>~</code> or relative paths)</li>
        <li>PDFlow web server must be running</li>
        <li>Restart Claude Desktop after config changes</li>
      </ul>

      <h2>Usage Examples</h2>

      <h3>Basic PDF Extraction</h3>
      <blockquote>
        Extract the content from /Users/username/Documents/contract.pdf
      </blockquote>

      <h3>Extract with Specific Format</h3>
      <blockquote>
        Extract invoice.pdf in JSON format
      </blockquote>

      <h3>Analyze Extracted Content</h3>
      <blockquote>
        Extract /path/to/report.pdf and summarize the key findings
      </blockquote>

      <h3>Compare Documents</h3>
      <blockquote>
        Extract contract_v1.pdf and contract_v2.pdf then compare them
      </blockquote>

      <h2>Workflow</h2>
      <p>When you ask Claude to extract a PDF using PDFlow:</p>
      <ol>
        <li>Claude recognizes the need for PDF extraction</li>
        <li>Calls <code>pdflow_extract_pdf</code> via MCP</li>
        <li>MCP server uploads PDF to PDFlow API</li>
        <li>PDFlow converts PDF to images</li>
        <li>Gemini AI extracts content</li>
        <li>Results flow back through MCP to Claude</li>
        <li>Claude analyzes and responds with extracted content</li>
      </ol>

      <h2>Troubleshooting</h2>

      <h3>Tools Not Showing in Claude</h3>
      <ol>
        <li>Verify config file path is correct</li>
        <li>Ensure all paths are absolute (no <code>~</code>)</li>
        <li>Check Claude logs:
          <pre><code>tail -f ~/Library/Logs/Claude/mcp*.log</code></pre>
        </li>
        <li>Completely restart Claude (Cmd+Q, not just close window)</li>
      </ol>

      <h3>"Cannot connect to PDFlow service"</h3>
      <pre><code>{`# Verify PDFlow is running
curl http://localhost:3001/api/health

# Should return: {"status":"ok"}`}</code></pre>

      <h3>"Path not found"</h3>
      <p>Always use absolute paths:</p>
      <ul>
        <li>✅ Correct: <code>/Users/username/Documents/file.pdf</code></li>
        <li>❌ Wrong: <code>~/Documents/file.pdf</code></li>
        <li>❌ Wrong: <code>./file.pdf</code></li>
      </ul>

      <h2>Advanced Configuration</h2>

      <h3>Multiple PDFlow Instances</h3>
      <pre><code>{`{
  "mcpServers": {
    "pdflow-local": {
      "command": "node",
      "args": ["/path/to/mcp/dist/server.js"],
      "env": {
        "PDFLOW_BASE_URL": "http://localhost:3001",
        "GEMINI_API_KEY": "your-key"
      }
    },
    "pdflow-remote": {
      "command": "node",
      "args": ["/path/to/mcp/dist/server.js"],
      "env": {
        "PDFLOW_BASE_URL": "http://remote-server:3000",
        "GEMINI_API_KEY": "your-key"
      }
    }
  }
}`}</code></pre>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/docs/claude-desktop">Claude Desktop Setup</a> - Detailed configuration guide</li>
        <li><a href="/docs/integrations">Custom Integrations</a> - Build your own MCP clients</li>
        <li><a href="/docs/troubleshooting">Troubleshooting</a> - Fix common issues</li>
      </ul>
    </>
  );
}
