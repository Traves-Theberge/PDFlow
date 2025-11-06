export default function TroubleshootingPage() {
  return (
    <>
      <h1>Troubleshooting Guide</h1>
      <p className="lead">
        Solutions to common issues and problems with PDFlow.
      </p>

      <h2>Installation Issues</h2>

      <h3>"Command not found: pdftocairo"</h3>
      <p><strong>Problem:</strong> poppler-utils not installed</p>

      <p><strong>Solution:</strong></p>
      <p><strong>macOS:</strong></p>
      <pre><code>brew install poppler</code></pre>

      <p><strong>Ubuntu/Debian:</strong></p>
      <pre><code>sudo apt-get install poppler-utils</code></pre>

      <p><strong>Verify installation:</strong></p>
      <pre><code>pdftocairo -v</code></pre>

      <h3>"Cannot find module"</h3>
      <p><strong>Problem:</strong> npm dependencies not installed or corrupted</p>

      <p><strong>Solution:</strong></p>
      <pre><code>{`# Clean install
rm -rf node_modules package-lock.json
npm install

# Or use npm ci for clean install
npm ci`}</code></pre>

      <h3>"Port 3001 already in use"</h3>
      <p><strong>Problem:</strong> Another process is using the port</p>

      <p><strong>Solution:</strong></p>
      <pre><code>{`# Find process using port
lsof -ti:3001

# Kill process
lsof -ti:3001 | xargs kill -9

# Or change port in package.json
"dev": "next dev -p 3002"`}</code></pre>

      <h2>Upload Issues</h2>

      <h3>"Upload failed" / "File too large"</h3>
      <p><strong>Problem:</strong> PDF exceeds 500MB size limit</p>

      <p><strong>Solution:</strong></p>
      <pre><code>{`# Split large PDF
pdftk large.pdf cat 1-50 output part1.pdf
pdftk large.pdf cat 51-100 output part2.pdf

# Or compress PDF
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \\
   -dPDFSETTINGS=/ebook \\
   -dNOPAUSE -dQUIET -dBATCH \\
   -sOutputFile=compressed.pdf input.pdf`}</code></pre>

      <h3>"Invalid PDF file"</h3>
      <p><strong>Problem:</strong> Corrupted or password-protected PDF</p>

      <p><strong>Solution:</strong></p>
      <pre><code>{`# Check PDF validity
pdfinfo document.pdf

# Remove password
qpdf --decrypt --password=yourpassword input.pdf output.pdf

# Repair corrupted PDF
gs -o repaired.pdf -sDEVICE=pdfwrite -dPDFSETTINGS=/prepress input.pdf`}</code></pre>

      <h3>"Network error during upload"</h3>
      <p><strong>Problem:</strong> Connection timeout or network instability</p>

      <p><strong>Solution:</strong></p>
      <ul>
        <li>Check internet connection</li>
        <li>Try smaller PDF file first</li>
        <li>Use wired connection instead of WiFi</li>
        <li>Increase timeout in code if self-hosting</li>
      </ul>

      <h2>Processing Issues</h2>

      <h3>"API key not found" / "API key invalid"</h3>
      <p><strong>Problem:</strong> Gemini API key not configured or incorrect</p>

      <p><strong>Solution:</strong></p>
      <pre><code>{`# Check environment variable
echo $GEMINI_API_KEY

# Set if missing
export GEMINI_API_KEY="your-api-key-here"

# For persistence, add to .env file
echo "GEMINI_API_KEY=your-key" > .env

# Verify key in Google AI Studio
# https://makersuite.google.com/app/apikey`}</code></pre>

      <h3>"Rate limit exceeded"</h3>
      <p><strong>Problem:</strong> Exceeded Gemini API rate limits</p>

      <p><strong>Solution:</strong></p>
      <ul>
        <li><strong>Free tier:</strong> Wait 1 minute between requests</li>
        <li><strong>Upgrade:</strong> Enable billing in Google Cloud Console</li>
        <li><strong>Batch processing:</strong> Add delays between PDFs</li>
      </ul>

      <pre><code>{`# Add delay in batch script
for pdf in *.pdf; do
  npm run pdflow -- extract "$pdf"
  sleep 30  # Wait 30 seconds between files
done`}</code></pre>

      <h3>"Processing timeout"</h3>
      <p><strong>Problem:</strong> Large PDF taking too long</p>

      <p><strong>Solution:</strong></p>
      <ul>
        <li>Be patient - large PDFs can take 10+ minutes</li>
        <li>Split PDF into smaller parts</li>
        <li>Reduce image quality/DPI</li>
        <li>Upgrade to paid Gemini tier for faster processing</li>
      </ul>

      <h3>"Extraction failed for some pages"</h3>
      <p><strong>Problem:</strong> Individual pages failed during processing</p>

      <p><strong>Solution:</strong></p>
      <pre><code>{`# Check which pages failed
npm run pdflow -- extract document.pdf -v

# Re-process specific pages manually
npm run pdflow -- extract document.pdf --pages 5,7,12`}</code></pre>

      <h2>MCP Integration Issues</h2>

      <h3>Tools not showing in Claude Desktop</h3>
      <p><strong>Problem:</strong> MCP server not configured correctly</p>

      <p><strong>Solution:</strong></p>
      <ol>
        <li>
          Verify config file path:
          <pre><code>cat ~/Library/Application\\ Support/Claude/claude_desktop_config.json</code></pre>
        </li>
        <li>
          Check JSON syntax is valid:
          <pre><code>jq . ~/Library/Application\\ Support/Claude/claude_desktop_config.json</code></pre>
        </li>
        <li>
          Use absolute paths (no <code>~</code> or relative paths):
          <pre><code>/Users/username/pdflow/src/mcp/dist/server.js  # ✅
~/pdflow/src/mcp/dist/server.js               # ❌</code></pre>
        </li>
        <li>Verify MCP server was built:
          <pre><code>ls /path/to/pdflow/src/mcp/dist/server.js</code></pre>
        </li>
        <li>Completely quit and restart Claude Desktop (Cmd+Q, not just close window)</li>
      </ol>

      <h3>"Cannot connect to PDFlow service"</h3>
      <p><strong>Problem:</strong> PDFlow web server not running</p>

      <p><strong>Solution:</strong></p>
      <pre><code>{`# Check if PDFlow is running
curl http://localhost:3001/api/health

# If not running, start it
cd /path/to/pdflow
npm run dev

# Verify port matches config
# PDFLOW_BASE_URL in config should match actual port`}</code></pre>

      <h3>Check Claude Desktop Logs</h3>
      <pre><code>{`# macOS
tail -f ~/Library/Logs/Claude/mcp*.log

# Linux
tail -f ~/.config/Claude/logs/mcp*.log

# Look for errors:
# - "Cannot find module"
# - "ENOENT: no such file"
# - "Connection refused"`}</code></pre>

      <h2>Docker Issues</h2>

      <h3>"Cannot connect to Docker daemon"</h3>
      <p><strong>Problem:</strong> Docker not running</p>

      <p><strong>Solution:</strong></p>
      <pre><code>{`# macOS: Start Docker Desktop
open -a Docker

# Linux: Start Docker service
sudo systemctl start docker

# Verify
docker ps`}</code></pre>

      <h3>"Port already allocated"</h3>
      <p><strong>Problem:</strong> Port already in use by another container or process</p>

      <p><strong>Solution:</strong></p>
      <pre><code>{`# Find container using port
docker ps | grep 3000

# Stop container
docker stop <container_id>

# Or change port in docker-compose.yml
ports:
  - "3002:3000"`}</code></pre>

      <h3>"Build failed"</h3>
      <p><strong>Problem:</strong> Docker build errors</p>

      <p><strong>Solution:</strong></p>
      <pre><code>{`# Clean build
docker-compose build --no-cache

# Check logs
docker-compose logs pdflow

# Remove old images
docker image prune -a`}</code></pre>

      <h2>Performance Issues</h2>

      <h3>"Processing very slow"</h3>
      <p><strong>Problem:</strong> Rate limits or large file</p>

      <p><strong>Solution:</strong></p>
      <ul>
        <li>Free tier: 2 requests/min = ~30s per page</li>
        <li>Upgrade to paid tier for 60 requests/min</li>
        <li>Reduce PDF size/quality</li>
        <li>Split large documents</li>
      </ul>

      <h3>"Out of memory"</h3>
      <p><strong>Problem:</strong> Node.js memory limit exceeded</p>

      <p><strong>Solution:</strong></p>
      <pre><code>{`# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# Or add to package.json
"dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev -p 3001"`}</code></pre>

      <h2>Output Issues</h2>

      <h3>"Output file empty"</h3>
      <p><strong>Problem:</strong> Extraction produced no content</p>

      <p><strong>Solution:</strong></p>
      <ul>
        <li>Check if PDF contains actual text (not just images)</li>
        <li>Try different output format</li>
        <li>Check verbose logs: <code>npm run pdflow -- extract file.pdf -v</code></li>
      </ul>

      <h3>"Formatting issues in output"</h3>
      <p><strong>Problem:</strong> Output doesn't match expected format</p>

      <p><strong>Solution:</strong></p>
      <ul>
        <li>Try different output format (markdown, json, etc.)</li>
        <li>Check PDF structure - complex layouts may not extract perfectly</li>
        <li>Use aggregated output for better formatting</li>
      </ul>

      <h2>Common Error Messages</h2>

      <h3>"EACCES: permission denied"</h3>
      <pre><code>{`# Fix permissions
chmod -R 755 uploads/
chmod -R 755 outputs/

# Or run as correct user
chown -R $USER:$USER uploads/ outputs/`}</code></pre>

      <h3>"ENOSPC: no space left on device"</h3>
      <pre><code>{`# Check disk space
df -h

# Clean up old files
find uploads/ -mtime +1 -delete
find outputs/ -mtime +1 -delete

# Clean npm cache
npm cache clean --force`}</code></pre>

      <h3>"ERR_MODULE_NOT_FOUND"</h3>
      <pre><code>{`# Rebuild node_modules
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+`}</code></pre>

      <h2>Getting More Help</h2>

      <h3>Enable Verbose Logging</h3>
      <pre><code>{`# CLI
npm run pdflow -- extract document.pdf -v

# Web (in browser console)
localStorage.setItem('debug', 'pdflow:*')

# Check server logs
tail -f ~/.pm2/logs/pdflow-out.log`}</code></pre>

      <h3>Collect Debug Information</h3>
      <pre><code>{`# System info
node --version
npm --version
pdftocairo -v
docker --version

# PDFlow info
git log -1
cat package.json | grep version

# Check processes
ps aux | grep node
lsof -i :3001`}</code></pre>

      <h3>Report Issues</h3>
      <p>If you can't resolve the issue:</p>
      <ul>
        <li>Check <a href="https://github.com/traves-theberge/pdflow/issues" target="_blank" rel="noopener noreferrer">GitHub Issues</a></li>
        <li>Search existing issues first</li>
        <li>Include error messages, logs, and system info</li>
        <li>Provide steps to reproduce</li>
      </ul>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/docs/installation">Installation Guide</a> - Proper setup</li>
        <li><a href="/docs/quickstart">Quick Start</a> - Get started quickly</li>
        <li><a href="/docs/performance">Performance</a> - Optimize setup</li>
      </ul>
    </>
  );
}
