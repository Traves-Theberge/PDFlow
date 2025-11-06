export default function ClaudeDesktopPage() {
  return (
    <>
      <h1>Claude Desktop Configuration</h1>
      <p className="lead">
        Step-by-step guide for configuring PDFlow with Claude Desktop.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>Claude Desktop installed</li>
        <li>PDFlow running locally or on accessible server</li>
        <li>MCP server built (<code>cd src/mcp && npm run build</code>)</li>
        <li>Gemini API key</li>
      </ul>

      <h2>Configuration Steps</h2>

      <h3>1. Locate Config File</h3>
      <p><strong>macOS:</strong></p>
      <pre><code>~/Library/Application Support/Claude/claude_desktop_config.json</code></pre>

      <p><strong>Linux:</strong></p>
      <pre><code>~/.config/Claude/claude_desktop_config.json</code></pre>

      <p><strong>Windows:</strong></p>
      <pre><code>%APPDATA%\Claude\claude_desktop_config.json</code></pre>

      <h3>2. Get Absolute Paths</h3>
      <pre><code>{`# Get PDFlow MCP server path
cd /path/to/pdflow/src/mcp
pwd
# Example: /Users/travis/Development/pdflow/src/mcp

# Note the full path to dist/server.js:
# /Users/travis/Development/pdflow/src/mcp/dist/server.js`}</code></pre>

      <h3>3. Edit Config File</h3>
      <p>Open the config file in your editor:</p>
      <pre><code>vim ~/Library/Application\\ Support/Claude/claude_desktop_config.json</code></pre>

      <p>Add or merge this configuration:</p>
      <pre><code>{`{
  "mcpServers": {
    "pdflow": {
      "command": "node",
      "args": ["/FULL/PATH/TO/pdflow/src/mcp/dist/server.js"],
      "env": {
        "PDFLOW_BASE_URL": "http://localhost:3001",
        "GEMINI_API_KEY": "your-gemini-api-key"
      }
    }
  }
}`}</code></pre>

      <h3>4. Replace Placeholders</h3>
      <ul>
        <li>Replace <code>/FULL/PATH/TO/pdflow</code> with actual path from step 2</li>
        <li>Replace <code>your-gemini-api-key</code> with your actual API key</li>
        <li>Adjust <code>PDFLOW_BASE_URL</code> if using different port</li>
      </ul>

      <h3>5. Restart Claude Desktop</h3>
      <p>Important: Completely quit Claude Desktop</p>
      <ul>
        <li><strong>macOS:</strong> Cmd+Q</li>
        <li><strong>Windows:</strong> Alt+F4</li>
        <li><strong>Linux:</strong> Close all windows and quit from system tray</li>
      </ul>
      <p>Then reopen Claude Desktop.</p>

      <h2>Verify Installation</h2>

      <h3>Check for Tools Icon</h3>
      <ol>
        <li>Open new Claude conversation</li>
        <li>Look for hammer icon (🔨) in input area</li>
        <li>Click icon to see available tools</li>
        <li>Should see: <code>pdflow_extract_pdf</code>, <code>pdflow_check_status</code>, <code>pdflow_health_check</code></li>
      </ol>

      <h3>Test with Health Check</h3>
      <p>In Claude, type:</p>
      <blockquote>
        Is PDFlow running? Use pdflow_health_check
      </blockquote>

      <p>Expected response:</p>
      <pre><code>{`{
  "status": "ok",
  "pdflowUrl": "http://localhost:3001",
  "pdflowStatus": "ok"
}`}</code></pre>

      <h3>Test PDF Extraction</h3>
      <blockquote>
        Extract the content from /Users/username/Documents/test.pdf
      </blockquote>

      <h2>Troubleshooting</h2>

      <h3>No Tools Icon Appears</h3>
      <ol>
        <li>Verify config file syntax is valid JSON</li>
        <li>Check all paths are absolute (no <code>~</code> or <code>.</code>)</li>
        <li>Ensure Node.js is in PATH: <code>which node</code></li>
        <li>Check MCP server was built: <code>ls src/mcp/dist/server.js</code></li>
        <li>Restart Claude Desktop completely (not just window)</li>
      </ol>

      <h3>Check Claude Logs</h3>
      <p><strong>macOS:</strong></p>
      <pre><code>{`tail -f ~/Library/Logs/Claude/mcp*.log

# Look for errors like:
# - "Cannot find module"
# - "ENOENT: no such file or directory"
# - "Connection refused"`}</code></pre>

      <p><strong>Linux:</strong></p>
      <pre><code>tail -f ~/.config/Claude/logs/mcp*.log</code></pre>

      <h3>"Cannot connect to PDFlow service"</h3>
      <pre><code>{`# 1. Check PDFlow is running
curl http://localhost:3001/api/health

# 2. If not running, start it
cd /path/to/pdflow
npm run dev

# 3. Verify port matches config
# PDFLOW_BASE_URL should match actual port`}</code></pre>

      <h3>Config File Format</h3>
      <p>Common mistakes:</p>
      <ul>
        <li>❌ Using <code>~</code> in paths</li>
        <li>❌ Missing commas between objects</li>
        <li>❌ Trailing commas in JSON</li>
        <li>❌ Unescaped backslashes in Windows paths</li>
      </ul>

      <p>Valid config structure:</p>
      <pre><code>{`{
  "mcpServers": {
    "server1": { ... },
    "server2": { ... }
  }
}`}</code></pre>

      <h2>Example Configurations</h2>

      <h3>macOS (Local)</h3>
      <pre><code>{`{
  "mcpServers": {
    "pdflow": {
      "command": "node",
      "args": ["/Users/travis/Development/pdflow/src/mcp/dist/server.js"],
      "env": {
        "PDFLOW_BASE_URL": "http://localhost:3001",
        "GEMINI_API_KEY": "AIza..."
      }
    }
  }
}`}</code></pre>

      <h3>Linux (Local)</h3>
      <pre><code>{`{
  "mcpServers": {
    "pdflow": {
      "command": "node",
      "args": ["/home/username/pdflow/src/mcp/dist/server.js"],
      "env": {
        "PDFLOW_BASE_URL": "http://localhost:3001",
        "GEMINI_API_KEY": "AIza..."
      }
    }
  }
}`}</code></pre>

      <h3>Remote Server</h3>
      <pre><code>{`{
  "mcpServers": {
    "pdflow": {
      "command": "node",
      "args": ["/path/to/pdflow/src/mcp/dist/server.js"],
      "env": {
        "PDFLOW_BASE_URL": "http://192.168.1.100:3001",
        "GEMINI_API_KEY": "AIza..."
      }
    }
  }
}`}</code></pre>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/docs/mcp">MCP Integration</a> - Learn about available tools</li>
        <li><a href="/docs/troubleshooting">Troubleshooting</a> - Fix common issues</li>
      </ul>
    </>
  );
}
