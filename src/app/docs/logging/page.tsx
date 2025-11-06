export default function LoggingPage() {
  return (
    <>
      <h1>Logging & Monitoring</h1>
      <p className="lead">
        Comprehensive logging system for debugging, monitoring, and troubleshooting PDFlow operations.
      </p>

      <h2>Overview</h2>
      <p>
        PDFlow v0.5.0+ includes a dual-output logging system that provides both real-time console output
        and persistent file-based logs. Logs are accessible through multiple methods for maximum flexibility.
      </p>

      <h2>Log Storage Locations</h2>

      <h3>Local Development</h3>
      <pre><code>{`PDFlow/
└── logs/
    ├── pdflow-2025-11-06.log      # Daily log files
    ├── pdflow-2025-11-05.log
    └── .gitkeep`}</code></pre>

      <h3>Docker Deployment</h3>
      <p>Logs are accessible in three locations:</p>

      <div className="space-y-4">
        <div>
          <h4>1. Host Filesystem</h4>
          <pre><code>{`# Direct access on host
cd logs/
tail -f pdflow-2025-11-06.log`}</code></pre>
        </div>

        <div>
          <h4>2. Docker Container</h4>
          <pre><code>{`# Inside the container
docker exec pdflow ls -la /app/logs
docker exec pdflow cat /app/logs/pdflow-2025-11-06.log`}</code></pre>
        </div>

        <div>
          <h4>3. Docker Logs Command</h4>
          <pre><code>{`# Standard Docker logging
docker logs pdflow
docker logs -f pdflow              # Follow in real-time
docker logs --since 1h pdflow      # Last hour
docker logs --tail 100 pdflow      # Last 100 lines`}</code></pre>
        </div>
      </div>

      <h2>Viewing Logs</h2>

      <h3>Helper Script (Recommended)</h3>
      <p>Use the provided helper script for easy log access:</p>

      <pre><code>{`# Make executable (first time only)
chmod +x scripts/view-logs.sh

# Watch logs live
./scripts/view-logs.sh --follow

# Show only errors
./scripts/view-logs.sh --errors

# Filter by session
./scripts/view-logs.sh --session session_123

# View Docker logs
./scripts/view-logs.sh --docker --follow

# Show last N lines
./scripts/view-logs.sh --last 50`}</code></pre>

      <h3>Quick Commands Reference</h3>
      <table>
        <thead>
          <tr>
            <th>What You Want</th>
            <th>Command</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Watch logs live</strong></td>
            <td><code>./scripts/view-logs.sh --follow</code></td>
          </tr>
          <tr>
            <td><strong>Last 100 lines</strong></td>
            <td><code>./scripts/view-logs.sh</code></td>
          </tr>
          <tr>
            <td><strong>Only errors</strong></td>
            <td><code>./scripts/view-logs.sh --errors</code></td>
          </tr>
          <tr>
            <td><strong>Specific session</strong></td>
            <td><code>./scripts/view-logs.sh --session session_123</code></td>
          </tr>
          <tr>
            <td><strong>Today's logs only</strong></td>
            <td><code>./scripts/view-logs.sh --today</code></td>
          </tr>
          <tr>
            <td><strong>Docker logs</strong></td>
            <td><code>./scripts/view-logs.sh --docker --follow</code></td>
          </tr>
          <tr>
            <td><strong>Raw file access</strong></td>
            <td><code>tail -f logs/pdflow-*.log</code></td>
          </tr>
        </tbody>
      </table>

      <h2>Log Levels</h2>
      <p>Logs are categorized by severity level:</p>

      <ol>
        <li><strong>🔥 CRITICAL</strong> - System failures requiring immediate attention</li>
        <li><strong>❌ ERROR</strong> - Operation failures that prevent completion</li>
        <li><strong>⚠️ WARN</strong> - Issues that don't prevent operation but need attention</li>
        <li><strong>ℹ️ INFO</strong> - Normal operational messages</li>
        <li><strong>🔍 DEBUG</strong> - Detailed diagnostic information</li>
      </ol>

      <h2>Log Format</h2>
      <p>Logs follow a structured format for easy parsing:</p>

      <pre><code>{`2025-11-06T18:30:45.123Z ℹ️ [INFO] [PDFProcessor] Processing page 1/5 | {"sessionId":"session_123","pageNum":1,"format":"markdown"}
│                        │  │      │              │                       │
│                        │  │      │              │                       └─ Structured context (JSON)
│                        │  │      │              └─ Human-readable message
│                        │  │      └─ Component/module name
│                        │  └─ Log level
│                        └─ Emoji indicator
└─ ISO 8601 timestamp`}</code></pre>

      <h2>Configuration</h2>

      <h3>Environment Variables</h3>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>LOG_LEVEL</code></td>
            <td><code>info</code></td>
            <td>Minimum log level (debug|info|warn|error|critical)</td>
          </tr>
          <tr>
            <td><code>ENABLE_FILE_LOGGING</code></td>
            <td><code>true</code></td>
            <td>Enable writing logs to files</td>
          </tr>
          <tr>
            <td><code>LOG_RETENTION_DAYS</code></td>
            <td><code>7</code></td>
            <td>Number of days to keep log files</td>
          </tr>
        </tbody>
      </table>

      <h3>Docker Configuration</h3>
      <p>In <code>docker-compose.yml</code>:</p>

      <pre><code>{`logging:
  driver: "json-file"
  options:
    max-size: "10m"      # Max size per log file
    max-file: "3"        # Keep last 3 files
    labels: "service,component"
    tag: "{{.Name}}/{{.ImageName}}"`}</code></pre>

      <h2>Advanced Filtering</h2>

      <h3>Search for Specific Errors</h3>
      <pre><code>{`# Find all conversion errors
grep "Script exited with code" logs/pdflow-*.log

# Get context (10 lines before/after)
grep -B 10 -A 10 "Script exited with code" logs/pdflow-*.log`}</code></pre>

      <h3>Session Timeline</h3>
      <pre><code>{`# Get all events for a session
grep "session_1762388170732" logs/pdflow-*.log | sort

# Format as timeline
grep "session_1762388170732" logs/pdflow-*.log | \\
  awk '{print $1" "$2" - "$8}'`}</code></pre>

      <h3>Error Summary</h3>
      <pre><code>{`# Count errors by type
grep "ERROR" logs/pdflow-*.log | \\
  awk -F'] ' '{print $3}' | \\
  sort | uniq -c | sort -rn

# Generate daily error report
grep "ERROR" logs/pdflow-$(date +%Y-%m-%d).log > daily-errors.txt`}</code></pre>

      <h2>Troubleshooting Common Issues</h2>

      <h3>Logs Not Appearing</h3>
      <p><strong>Problem:</strong> No log files in logs/ directory</p>

      <p><strong>Solutions:</strong></p>
      <pre><code>{`# 1. Check if directory exists
ls -la logs/

# 2. Verify environment variable
echo $ENABLE_FILE_LOGGING  # Should be "true"

# 3. Check Docker volume mount
docker inspect pdflow | grep -A 5 Mounts

# 4. Verify logger is initialized
docker exec pdflow ls -la /app/logs`}</code></pre>

      <h3>Permission Errors</h3>
      <p><strong>Problem:</strong> Cannot write to logs directory</p>

      <p><strong>Solutions:</strong></p>
      <pre><code>{`# Fix permissions (development)
sudo chown -R $USER:$USER logs/
chmod 755 logs/

# Fix permissions (Docker)
docker exec -u root pdflow chown -R nextjs:nodejs /app/logs`}</code></pre>

      <h3>Disk Space Issues</h3>
      <p><strong>Problem:</strong> Logs filling up disk</p>

      <p><strong>Solutions:</strong></p>
      <pre><code>{`# Check log size
du -sh logs/

# Find largest log files
find logs/ -type f -exec du -h {} \\; | sort -rh | head -10

# Reduce retention period
export LOG_RETENTION_DAYS=3

# Clean old logs (older than 7 days)
find logs/ -name "pdflow-*.log" -mtime +7 -delete`}</code></pre>

      <h2>Monitoring & Alerts</h2>

      <h3>Real-time Monitoring</h3>
      <pre><code>{`# Watch for critical errors
tail -f logs/pdflow-*.log | grep --color -E "CRITICAL|ERROR"

# Monitor with highlights
tail -f logs/pdflow-*.log | \\
  grep --color -E "ERROR|WARN|session_[0-9]+"`}</code></pre>

      <h3>Health Check via Logs</h3>
      <pre><code>{`# Check if app is processing requests
if ! grep -q "Processing page" logs/pdflow-$(date +%Y-%m-%d).log; then
  echo "⚠️ No recent processing activity"
fi

# Count errors in last hour
error_count=$(grep "ERROR" logs/pdflow-*.log | \\
  awk -v cutoff="$(date -d '1 hour ago' -Iseconds)" '$1 > cutoff' | \\
  wc -l)

if [ $error_count -gt 10 ]; then
  echo "🚨 High error rate: $error_count errors in last hour"
fi`}</code></pre>

      <h2>Log Rotation & Cleanup</h2>

      <h3>Automatic Rotation</h3>
      <p>
        Logs are automatically rotated daily with the naming pattern:
        <code>pdflow-YYYY-MM-DD.log</code>
      </p>

      <h3>Manual Cleanup</h3>
      <pre><code>{`# Remove logs older than 7 days
find logs/ -name "pdflow-*.log" -mtime +7 -delete

# Archive old logs
tar -czf logs-archive-$(date +%Y%m).tar.gz logs/pdflow-*.log
find logs/ -name "pdflow-*.log" -mtime +30 -delete

# Keep only last N files
ls -t logs/pdflow-*.log | tail -n +8 | xargs rm --`}</code></pre>

      <h3>Docker Log Cleanup</h3>
      <pre><code>{`# Clear Docker logs for a container
truncate -s 0 $(docker inspect --format='{{.LogPath}}' pdflow)

# Remove stopped containers and their logs
docker container prune`}</code></pre>

      <h2>Best Practices</h2>

      <h3>Do's</h3>
      <ul>
        <li>✅ Use the helper script for common tasks</li>
        <li>✅ Filter logs by session ID when debugging</li>
        <li>✅ Regularly review error logs</li>
        <li>✅ Archive old logs before deletion</li>
        <li>✅ Use Docker logs for quick checks</li>
        <li>✅ Use file logs for detailed analysis</li>
      </ul>

      <h3>Don'ts</h3>
      <ul>
        <li>❌ Don't commit log files to Git</li>
        <li>❌ Don't let logs grow unbounded</li>
        <li>❌ Don't expose logs via web without auth</li>
        <li>❌ Don't log sensitive data (API keys, passwords)</li>
        <li>❌ Don't rely solely on Docker logs (they're rotated)</li>
      </ul>

      <h2>Further Reading</h2>
      <ul>
        <li><a href="/docs/troubleshooting">Troubleshooting Guide</a> - Common issues and solutions</li>
        <li><a href="/docs/docker">Docker Deployment</a> - Container setup and configuration</li>
        <li><a href="/docs/security">Security</a> - Security best practices</li>
      </ul>

      <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 p-6 my-8">
        <p className="text-blue-900 dark:text-blue-100 font-semibold mb-2">
          📋 Complete Documentation
        </p>
        <p className="text-blue-800 dark:text-blue-200 mb-0">
          For the most comprehensive logging documentation with additional examples and 
          troubleshooting scenarios, see <code>docs/LOGGING.md</code> in the project repository.
        </p>
      </div>
    </>
  );
}
