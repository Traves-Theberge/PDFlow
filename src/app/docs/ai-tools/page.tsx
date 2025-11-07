export default function AIToolsPage() {
  return (
    <>
      <h1>AI Tool Configuration</h1>
      <p className="lead">
        Step-by-step guides for configuring PDFlow with Claude Desktop, Claude Code, Cursor, and VS Code.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>Your preferred AI tool installed (Claude Desktop, Claude Code, Cursor, or VS Code with Cline)</li>
        <li>PDFlow running locally or on accessible server</li>
        <li>MCP server built (<code>cd src/mcp && npm run build</code>)</li>
        <li>Gemini API key</li>
      </ul>

      <h2>Choose Your Tool</h2>

      <h3>Claude Desktop</h3>
      <p>Anthropic's official desktop application for Claude.</p>

      <h4>1. Locate Config File</h4>
      <p><strong>macOS:</strong></p>
      <pre><code>~/Library/Application Support/Claude/claude_desktop_config.json</code></pre>

      <p><strong>Linux:</strong></p>
      <pre><code>~/.config/Claude/claude_desktop_config.json</code></pre>

      <p><strong>Windows:</strong></p>
      <pre><code>%APPDATA%\Claude\claude_desktop_config.json</code></pre>

      <h4>2. Restart Instructions</h4>
      <ul>
        <li><strong>macOS:</strong> Cmd+Q to quit completely</li>
        <li><strong>Windows:</strong> Alt+F4 to quit</li>
        <li><strong>Linux:</strong> Close all windows and quit from system tray</li>
      </ul>

      <hr />

      <h3>Claude Code</h3>
      <p>Anthropic's CLI for AI-powered coding in your terminal.</p>

      <h4>1. Locate Config File</h4>
      <p><strong>macOS/Linux:</strong></p>
      <pre><code>~/.claude/claude_code_config.json</code></pre>

      <p><strong>Windows:</strong></p>
      <pre><code>%USERPROFILE%\.claude\claude_code_config.json</code></pre>

      <h4>2. Restart Instructions</h4>
      <p>Restart your terminal session or start a new Claude Code session.</p>

      <hr />

      <h3>Cursor</h3>
      <p>AI-first code editor with built-in AI assistance.</p>

      <h4>1. Locate Config File</h4>
      <p><strong>macOS:</strong></p>
      <pre><code>~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json</code></pre>

      <p><strong>Linux:</strong></p>
      <pre><code>~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json</code></pre>

      <p><strong>Windows:</strong></p>
      <pre><code>%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json</code></pre>

      <h4>2. Restart Instructions</h4>
      <p>Reload window: Cmd/Ctrl+Shift+P → "Developer: Reload Window"</p>

      <hr />

      <h3>VS Code (Cline Extension)</h3>
      <p>Visual Studio Code with Cline extension for MCP support.</p>

      <h4>1. Install Cline Extension</h4>
      <pre><code>code --install-extension saoudrizwan.claude-dev</code></pre>

      <h4>2. Locate Config File</h4>
      <p><strong>macOS:</strong></p>
      <pre><code>~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json</code></pre>

      <p><strong>Linux:</strong></p>
      <pre><code>~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json</code></pre>

      <p><strong>Windows:</strong></p>
      <pre><code>%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json</code></pre>

      <h4>3. Restart Instructions</h4>
      <p>Reload window: Cmd/Ctrl+Shift+P → "Developer: Reload Window"</p>

      <hr />

      <h2>Universal Configuration Steps</h2>

      <h3>1. Get Absolute Paths</h3>
      <pre><code>{`# Get PDFlow MCP server path
cd /path/to/pdflow/src/mcp
pwd
# Example: /Users/travis/Development/pdflow/src/mcp

# Note the full path to dist/server.js:
# /Users/travis/Development/pdflow/src/mcp/dist/server.js`}</code></pre>

      <h3>2. Edit Config File</h3>
      <p>Open your tool's config file (see paths above) and add or merge this configuration:</p>
      <pre><code>{`{
  "mcpServers": {
    "pdflow": {
      "command": "node",
      "args": ["/FULL/PATH/TO/pdflow/src/mcp/dist/server.js"],
      "env": {
        "PDFLOW_BASE_URL": "http://localhost:3535"
      }
    }
  }
}`}</code></pre>

      <p><strong>Note:</strong> The MCP server only needs to know where PDFlow is running. Your Gemini API key should be configured in PDFlow itself (via .env file or Docker environment), not in the MCP config.</p>

      <h3>3. Replace Placeholders</h3>
      <ul>
        <li>Replace <code>/FULL/PATH/TO/pdflow</code> with actual path from step 1</li>
        <li>Adjust <code>PDFLOW_BASE_URL</code> if using different port or remote server</li>
        <li>Use <code>http://localhost:3001</code> for local development</li>
        <li>Use <code>http://localhost:3535</code> for Docker deployment</li>
      </ul>

      <h3>4. Restart Your Tool</h3>
      <p>Restart according to your tool's instructions listed above.</p>

      <h2>Directory Permissions</h2>
      <p>
        For security, the MCP server restricts which directories it can access for PDF processing.
        By default, it allows access to commonly used directories, but you can customize this behavior.
      </p>

      <h3>Default Allowed Directories</h3>
      <p>Without any additional configuration, the MCP server can access PDFs in:</p>
      <ul>
        <li><strong>Current working directory</strong> - Where your AI tool was launched</li>
        <li><strong>Documents folder</strong> - <code>~/Documents</code></li>
        <li><strong>Downloads folder</strong> - <code>~/Downloads</code></li>
        <li><strong>Desktop folder</strong> - <code>~/Desktop</code></li>
      </ul>

      <p className="text-sm" style={{ color: 'var(--docs-note-color)' }}>
        💡 <strong>Tip:</strong> Launch your AI tool from your project directory to automatically allow access to PDFs in that location.
      </p>

      <h3>Custom Directories</h3>
      <p>To allow access to specific directories, add <code>ALLOWED_DIRECTORIES</code> to your MCP configuration:</p>
      <pre><code>{`{
  "mcpServers": {
    "pdflow": {
      "command": "node",
      "args": ["/path/to/pdflow/src/mcp/dist/server.js"],
      "env": {
        "PDFLOW_BASE_URL": "http://localhost:3535",
        "ALLOWED_DIRECTORIES": "/home/user/projects:/home/user/work/pdfs"
      }
    }
  }
}`}</code></pre>

      <p><strong>Format:</strong> Colon-separated list of absolute paths (Linux/macOS) or semicolon-separated (Windows)</p>

      <h4>Examples:</h4>
      <p><strong>macOS:</strong></p>
      <pre><code>"ALLOWED_DIRECTORIES": "/Users/travis/projects:/Users/travis/research"</code></pre>

      <p><strong>Linux:</strong></p>
      <pre><code>"ALLOWED_DIRECTORIES": "/home/travis/projects:/home/travis/research"</code></pre>

      <p><strong>Windows:</strong></p>
      <pre><code>"ALLOWED_DIRECTORIES": "C:\\Users\\Travis\\projects;C:\\Users\\Travis\\research"</code></pre>

      <h3>Allow All Directories (Less Secure)</h3>
      <p>
        For maximum flexibility, you can allow access to <strong>any directory</strong> on your system.
        This is convenient but less secure.
      </p>
      <pre><code>{`{
  "mcpServers": {
    "pdflow": {
      "command": "node",
      "args": ["/path/to/pdflow/src/mcp/dist/server.js"],
      "env": {
        "PDFLOW_BASE_URL": "http://localhost:3535",
        "ALLOWED_DIRECTORIES": "*"
      }
    }
  }
}`}</code></pre>

      <p className="text-sm" style={{ color: 'var(--docs-warning-color)' }}>
        ⚠️ <strong>Security Note:</strong> Using <code>*</code> allows the MCP server to access any PDF file on your system.
        Only use this if you trust the AI tool and are on a personal machine.
      </p>

      <h3>Choosing the Right Permission Level</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Option</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Security</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Use Case</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
            <td style={{ padding: '0.5rem' }}><strong>Default</strong></td>
            <td style={{ padding: '0.5rem' }}>🟢 High</td>
            <td style={{ padding: '0.5rem' }}>General use, personal documents</td>
          </tr>
          <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
            <td style={{ padding: '0.5rem' }}><strong>Custom</strong></td>
            <td style={{ padding: '0.5rem' }}>🟡 Medium</td>
            <td style={{ padding: '0.5rem' }}>Specific project directories</td>
          </tr>
          <tr>
            <td style={{ padding: '0.5rem' }}><strong>Allow All (*)</strong></td>
            <td style={{ padding: '0.5rem' }}>🔴 Low</td>
            <td style={{ padding: '0.5rem' }}>Development, trusted environment</td>
          </tr>
        </tbody>
      </table>

      <h3>Troubleshooting Access Denied Errors</h3>
      <p>If you get an error like:</p>
      <pre><code>Access denied: File must be in allowed directories: /home/user/Documents, /home/user/Downloads</code></pre>

      <p><strong>Solutions:</strong></p>
      <ol>
        <li><strong>Move the PDF</strong> to an allowed directory (Documents, Downloads, Desktop)</li>
        <li><strong>Add a custom directory</strong> using <code>ALLOWED_DIRECTORIES</code> (see above)</li>
        <li><strong>Launch your AI tool</strong> from the directory containing your PDFs</li>
        <li><strong>Use allow all</strong> with <code>ALLOWED_DIRECTORIES="*"</code> if security is not a concern</li>
      </ol>

      <h2>Verify Installation</h2>

      <h3>Check for PDFlow Tools</h3>
      <p><strong>Claude Desktop / Claude Code:</strong></p>
      <ol>
        <li>Start a new conversation</li>
        <li>Look for hammer/tools icon (🔨) in the interface</li>
        <li>Click to see available tools</li>
        <li>Should see: <code>pdflow_extract_pdf</code>, <code>pdflow_check_status</code>, <code>pdflow_health_check</code></li>
      </ol>

      <p><strong>Cursor / VS Code:</strong></p>
      <ol>
        <li>Open the Cline panel</li>
        <li>Check MCP status indicator</li>
        <li>PDFlow tools should be available in the tool list</li>
      </ol>

      <h3>Test with Health Check</h3>
      <p>Ask your AI assistant:</p>
      <blockquote>
        Is PDFlow running? Use pdflow_health_check
      </blockquote>

      <p>Expected response:</p>
      <pre><code>{`{
  "status": "ok",
  "pdflowUrl": "http://localhost:3535",
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

      <h3>Check Logs</h3>
      <p><strong>Claude Desktop (macOS):</strong></p>
      <pre><code>tail -f ~/Library/Logs/Claude/mcp*.log</code></pre>

      <p><strong>Claude Desktop (Linux):</strong></p>
      <pre><code>tail -f ~/.config/Claude/logs/mcp*.log</code></pre>

      <p><strong>Claude Code:</strong></p>
      <pre><code>cat ~/.claude/logs/*.log</code></pre>

      <p><strong>Cursor / VS Code:</strong></p>
      <p>Check the Cline extension output panel: View → Output → Select "Cline"</p>

      <p>Look for errors like:</p>
      <ul>
        <li>"Cannot find module"</li>
        <li>"ENOENT: no such file or directory"</li>
        <li>"Connection refused"</li>
      </ul>

      <h3>"Cannot connect to PDFlow service"</h3>
      <pre><code>{`# 1. Check PDFlow is running
curl http://localhost:3535/api/health

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

      <h3>macOS (Docker)</h3>
      <pre><code>{`{
  "mcpServers": {
    "pdflow": {
      "command": "node",
      "args": ["/Users/travis/Development/pdflow/src/mcp/dist/server.js"],
      "env": {
        "PDFLOW_BASE_URL": "http://localhost:3535"
      }
    }
  }
}`}</code></pre>

      <h3>Linux (Local Development)</h3>
      <pre><code>{`{
  "mcpServers": {
    "pdflow": {
      "command": "node",
      "args": ["/home/username/pdflow/src/mcp/dist/server.js"],
      "env": {
        "PDFLOW_BASE_URL": "http://localhost:3001"
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
        "PDFLOW_BASE_URL": "http://192.168.1.100:3535"
      }
    }
  }
}`}</code></pre>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/docs/mcp">MCP Integration</a> - Learn about available MCP tools and advanced configuration</li>
        <li><a href="/docs/integrations">Custom Integrations</a> - Build your own integrations</li>
        <li><a href="/docs/troubleshooting">Troubleshooting</a> - Fix common issues</li>
      </ul>
    </>
  );
}
