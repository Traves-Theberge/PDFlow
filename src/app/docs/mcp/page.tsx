export default function MCPPage() {
  return (
    <>
      <h1>MCP Server Integration</h1>
      <p className="lead">
        Connect PDFlow with Claude Desktop, Claude Code, Cursor, VS Code, and other AI assistants via the Model Context Protocol.
      </p>

      <h2>What is MCP?</h2>
      <p>The Model Context Protocol (MCP) allows AI assistants to interact with external tools and services. With PDFlow's MCP server, AI assistants can extract PDF content directly from your conversations.</p>

      <h2>Supported AI Tools</h2>
      <ul>
        <li><strong>Claude Desktop</strong> - Anthropic's desktop application</li>
        <li><strong>Claude Code</strong> - Anthropic's CLI for AI-powered coding</li>
        <li><strong>Cursor</strong> - AI-first code editor</li>
        <li><strong>VS Code with Cline</strong> - Visual Studio Code with MCP support</li>
      </ul>

      <h2>Quick Start</h2>

      <h3>1. Build MCP Server</h3>
      <pre><code>{`cd src/mcp
npm install
npm run build`}</code></pre>

      <h3>2. Choose Your Configuration</h3>

      <h4>Claude Desktop</h4>
      <p><strong>macOS:</strong></p>
      <pre><code>vim ~/Library/Application\\ Support/Claude/claude_desktop_config.json</code></pre>

      <p><strong>Linux:</strong></p>
      <pre><code>vim ~/.config/Claude/claude_desktop_config.json</code></pre>

      <p><strong>Windows:</strong></p>
      <pre><code>notepad %APPDATA%\Claude\claude_desktop_config.json</code></pre>

      <h4>Claude Code</h4>
      <p><strong>macOS/Linux:</strong></p>
      <pre><code>vim ~/.claude/claude_code_config.json</code></pre>

      <p><strong>Windows:</strong></p>
      <pre><code>notepad %USERPROFILE%\.claude\claude_code_config.json</code></pre>

      <h4>Cursor</h4>
      <p><strong>macOS:</strong></p>
      <pre><code>vim ~/Library/Application\\ Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json</code></pre>

      <p><strong>Linux:</strong></p>
      <pre><code>vim ~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json</code></pre>

      <p><strong>Windows:</strong></p>
      <pre><code>notepad %APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json</code></pre>

      <h4>VS Code (Cline Extension)</h4>
      <p><strong>macOS:</strong></p>
      <pre><code>vim ~/Library/Application\\ Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json</code></pre>

      <p><strong>Linux:</strong></p>
      <pre><code>vim ~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json</code></pre>

      <p><strong>Windows:</strong></p>
      <pre><code>notepad %APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json</code></pre>

      <h3>3. Add PDFlow Configuration</h3>
      <pre><code>{`{
  "mcpServers": {
    "pdflow": {
      "command": "node",
      "args": ["/full/path/to/pdflow/src/mcp/dist/server.js"],
      "env": {
        "PDFLOW_BASE_URL": "http://localhost:3535"
      }
    }
  }
}`}</code></pre>

      <p><strong>Note:</strong> The MCP server only needs to know where PDFlow is running. Your Gemini API key should be configured in PDFlow itself (via <code>.env</code> file or Docker environment), not in the MCP configuration.</p>

      <h3>4. Restart Your AI Tool</h3>
      <ul>
        <li><strong>Claude Desktop:</strong> Completely quit (Cmd+Q / Alt+F4) and restart</li>
        <li><strong>Claude Code:</strong> Restart your terminal session</li>
        <li><strong>Cursor:</strong> Reload window (Cmd/Ctrl+Shift+P → "Developer: Reload Window")</li>
        <li><strong>VS Code:</strong> Reload window (Cmd/Ctrl+Shift+P → "Developer: Reload Window")</li>
      </ul>

      <h2>Available Tools</h2>

      <h3>pdflow_extract_pdf (Primary Tool)</h3>
      <p>
        <strong>This is the main tool you'll use.</strong> It handles the complete PDF extraction workflow:
        upload, conversion, AI extraction, and returns the full content directly. Optionally saves extracted
        content to a local file. In most cases, this is the only tool you need.
      </p>

      <p><strong>Parameters:</strong></p>
      <ul>
        <li><code>pdfPath</code> (string, required) - Absolute path to PDF file</li>
        <li><code>format</code> (string, optional) - Output format: markdown, json, xml, yaml, html, mdx. Default: markdown</li>
        <li><code>aggregate</code> (boolean, optional) - Combine all pages into one file. Default: true</li>
        <li><code>outputPath</code> (string, optional) - Local path to save extracted content. Can be absolute or relative. If a directory is provided, a filename will be auto-generated. If no extension is provided, the appropriate extension based on format will be added.</li>
      </ul>

      <p><strong>Returns:</strong> The complete extracted content in the specified format, plus <code>savedTo</code> field with absolute path if <code>outputPath</code> was provided</p>

      <p><strong>Example usage:</strong></p>
      <blockquote>
        Extract the content from ~/Documents/report.pdf
      </blockquote>

      <blockquote>
        Extract ~/Documents/contract.pdf and save to ./output.md
      </blockquote>

      <blockquote>
        Extract invoice.pdf in JSON format and save to ./extracted/ directory
      </blockquote>

      <h3>pdflow_check_status (Optional)</h3>
      <p>
        <strong>[Rarely Needed]</strong> Check the processing status of a PDF. Only needed for very large
        documents that don't complete immediately. Most PDFs process quickly and return results directly
        from <code>pdflow_extract_pdf</code>.
      </p>

      <p><strong>Parameters:</strong></p>
      <ul>
        <li><code>sessionId</code> (string, required) - Session ID from extraction</li>
      </ul>

      <h3>pdflow_get_results (Optional)</h3>
      <p>
        <strong>[Rarely Needed]</strong> Retrieve content from a completed session. Only needed if you want
        to re-fetch results or if content was too large to return inline. Most use cases get full content
        directly from <code>pdflow_extract_pdf</code>.
      </p>

      <p><strong>Parameters:</strong></p>
      <ul>
        <li><code>sessionId</code> (string, required) - Session ID from completed extraction</li>
        <li><code>format</code> (string, optional) - Format to retrieve. Default: markdown</li>
      </ul>

      <h3>pdflow_health_check</h3>
      <p>Verify PDFlow service is running and accessible.</p>

      <p><strong>Example usage:</strong></p>
      <blockquote>
        Is PDFlow running? Use pdflow_health_check
      </blockquote>

      <h2>Configuration</h2>

      <h3>Environment Variables</h3>
      <ul>
        <li><code>PDFLOW_BASE_URL</code> - URL of your PDFlow server
          <ul>
            <li>Local development: <code>http://localhost:3001</code></li>
            <li>Docker deployment: <code>http://localhost:3535</code></li>
            <li>Remote server: <code>http://your-server-ip:3535</code></li>
          </ul>
        </li>
        <li><code>ALLOWED_DIRECTORIES</code> (optional) - Control which directories can access PDFs
          <ul>
            <li>Default: Current directory + Documents/Downloads/Desktop</li>
            <li>Custom: Colon-separated paths (e.g., <code>/home/user/projects:/home/user/work</code>)</li>
            <li>Allow all: <code>*</code> (less secure, but more flexible)</li>
          </ul>
        </li>
      </ul>

      <h3>Important Notes</h3>
      <ul>
        <li>Gemini API key should be configured in PDFlow (via <code>.env</code> or Docker), not in MCP config</li>
        <li>Use <strong>absolute paths</strong> for all file paths (no <code>~</code> or relative paths)</li>
        <li>PDFlow server must be running before using MCP tools</li>
        <li>Restart your AI tool completely after config changes</li>
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

      <h3>Save to Local File</h3>
      <blockquote>
        Extract /path/to/report.pdf and save to ./extracted/report.md
      </blockquote>

      <p>This will save the extracted content to a local file in your current working directory, making it easy to keep outputs in your project structure.</p>

      <h3>Save to Directory (Auto-generated Filename)</h3>
      <blockquote>
        Extract invoice.pdf in JSON format and save to ./outputs/ directory
      </blockquote>

      <p>PDFlow will automatically generate a filename (e.g., <code>invoice.json</code>) based on the original PDF name and selected format.</p>

      <h3>Analyze Extracted Content</h3>
      <blockquote>
        Extract /path/to/report.pdf and summarize the key findings
      </blockquote>

      <h3>Compare Documents</h3>
      <blockquote>
        Extract contract_v1.pdf and contract_v2.pdf then compare them
      </blockquote>

      <h2>Simplified Workflow</h2>
      <p>
        PDFlow MCP has been optimized for a simple, single-tool workflow. When you ask an AI assistant
        to extract a PDF:
      </p>
      <ol>
        <li><strong>AI recognizes</strong> the need for PDF extraction</li>
        <li><strong>Calls one tool</strong>: <code>pdflow_extract_pdf</code></li>
        <li><strong>MCP server handles</strong>: upload → conversion → AI extraction</li>
        <li><strong>Returns full content</strong> directly in the response</li>
        <li><strong>AI analyzes</strong> and responds with the extracted content</li>
      </ol>

      <p className="text-sm" style={{ color: 'var(--docs-note-color)', marginTop: '1rem' }}>
        💡 <strong>Key Simplification:</strong> Unlike other PDF extraction tools that require multiple
        steps (upload, check status, get results), PDFlow returns everything in a single call. The optional
        status and results tools are only needed for edge cases with very large documents.
      </p>

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
curl http://localhost:3535/api/health

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
        "PDFLOW_BASE_URL": "http://localhost:3535"
      }
    },
    "pdflow-remote": {
      "command": "node",
      "args": ["/path/to/mcp/dist/server.js"],
      "env": {
        "PDFLOW_BASE_URL": "http://remote-server:3535"
      }
    }
  }
}`}</code></pre>

      <h3>Custom Directory Permissions</h3>
      <pre><code>{`{
  "mcpServers": {
    "pdflow": {
      "command": "node",
      "args": ["/path/to/pdflow/src/mcp/dist/server.js"],
      "env": {
        "PDFLOW_BASE_URL": "http://localhost:3535",
        "ALLOWED_DIRECTORIES": "/home/user/research:/home/user/work/reports"
      }
    }
  }
}`}</code></pre>

      <p>Or allow all directories (less secure):</p>
      <pre><code>{`"ALLOWED_DIRECTORIES": "*"`}</code></pre>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/docs/ai-tools">AI Tools Setup</a> - Detailed configuration guide for Claude Desktop, Claude Code, Cursor, and VS Code</li>
        <li><a href="/docs/integrations">Custom Integrations</a> - Build your own MCP clients</li>
        <li><a href="/docs/troubleshooting">Troubleshooting</a> - Fix common issues</li>
      </ul>
    </>
  );
}
