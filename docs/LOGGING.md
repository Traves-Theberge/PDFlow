# PDFlow Logging System

## 📁 Log Storage Locations

### **Local Development**
```
PDFlow/
└── logs/
    ├── pdflow-2025-11-06.log      # Daily log files
    ├── pdflow-2025-11-05.log
    └── .gitkeep
```

### **Docker Deployment**
Logs are accessible in **three** locations:

#### 1. **Host Filesystem** (Recommended)
```bash
# Direct access on host
cd /home/traves/Development/1.\ Personal/PDFlow/logs
tail -f pdflow-2025-11-06.log
```

#### 2. **Docker Container**
```bash
# Inside the container
docker exec pdflow ls -la /app/logs
docker exec pdflow cat /app/logs/pdflow-2025-11-06.log
```

#### 3. **Docker Logs Command**
```bash
# Standard Docker logging
docker logs pdflow
docker logs -f pdflow              # Follow in real-time
docker logs --since 1h pdflow      # Last hour
docker logs --tail 100 pdflow      # Last 100 lines
```

---

## 🔍 Viewing Logs

### **Quick Commands**

| What You Want | Command |
|---------------|---------|
| **Watch logs live** | `./scripts/view-logs.sh --follow` |
| **Last 100 lines** | `./scripts/view-logs.sh` |
| **Only errors** | `./scripts/view-logs.sh --errors` |
| **Specific session** | `./scripts/view-logs.sh --session session_123` |
| **Today's logs only** | `./scripts/view-logs.sh --today` |
| **Docker logs** | `./scripts/view-logs.sh --docker --follow` |
| **Raw file access** | `tail -f logs/pdflow-$(date +%Y-%m-%d).log` |

### **Helper Script Usage**

```bash
# Make executable (first time only)
chmod +x scripts/view-logs.sh

# View logs
./scripts/view-logs.sh [OPTIONS]

Options:
  -f, --follow          Follow log output in real-time (like tail -f)
  -e, --errors          Show only error logs
  -s, --session <id>    Filter by session ID
  -t, --today           Show only today's logs
  -l, --last <n>        Show last N lines (default: 100)
  -d, --docker          View Docker container logs
  -h, --help            Show help message
```

### **Advanced Filtering**

```bash
# Search for specific errors
grep "Script exited with code" logs/pdflow-*.log

# Find all errors in last 24 hours
find logs/ -name "*.log" -mtime -1 -exec grep -H "ERROR" {} \;

# Count errors by type
grep "ERROR" logs/pdflow-*.log | awk -F'[' '{print $3}' | sort | uniq -c

# Extract session-specific logs
grep "session_1762388170732" logs/pdflow-*.log > session-debug.log

# Monitor multiple sessions
tail -f logs/pdflow-*.log | grep -E "session_123|session_456"

# Watch for critical errors
watch -n 2 'tail -50 logs/pdflow-*.log | grep CRITICAL'
```

---

## 🎯 Log Levels & Formats

### **Log Levels (Priority Order)**

1. **🔥 CRITICAL** - System failures requiring immediate attention
2. **❌ ERROR** - Operation failures that prevent completion
3. **⚠️ WARN** - Issues that don't prevent operation but need attention
4. **ℹ️ INFO** - Normal operational messages
5. **🔍 DEBUG** - Detailed diagnostic information

### **Log Format**

```
2025-11-06T18:30:45.123Z ℹ️ [INFO] [PDFProcessor] Processing page 1/5 | {"sessionId":"session_123","pageNum":1,"format":"markdown"}
│                        │  │      │              │                       │
│                        │  │      │              │                       └─ Structured context (JSON)
│                        │  │      │              └─ Human-readable message
│                        │  │      └─ Component/module name
│                        │  └─ Log level
│                        └─ Emoji indicator
└─ ISO 8601 timestamp
```

---

## 🐳 Docker-Specific Logging

### **Configuration**

Docker logging is configured in `docker-compose.yml`:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"      # Max size per log file
    max-file: "3"        # Keep last 3 files
    labels: "service,component"
    tag: "{{.Name}}/{{.ImageName}}"
```

This means:
- ✅ Docker keeps up to 30MB of logs (3 files × 10MB)
- ✅ Automatic rotation when files get too large
- ✅ Older logs are automatically removed

### **Docker Log Commands**

```bash
# Basic viewing
docker logs pdflow

# Follow logs in real-time
docker logs -f pdflow

# Show logs since specific time
docker logs --since "2025-11-06T15:00:00" pdflow
docker logs --since 30m pdflow           # Last 30 minutes
docker logs --since 2h pdflow            # Last 2 hours

# Show last N lines
docker logs --tail 50 pdflow

# Include timestamps
docker logs -t pdflow

# Save logs to file
docker logs pdflow > pdflow-logs-$(date +%Y%m%d).log

# Filter for errors
docker logs pdflow 2>&1 | grep -i error

# Combine with jq for JSON parsing (if using JSON logs)
docker logs pdflow 2>&1 | grep "^{" | jq 'select(.level == "ERROR")'
```

### **Docker Compose Logs**

```bash
# View logs for all services
docker-compose logs

# Follow specific service
docker-compose logs -f pdflow

# Multiple services
docker-compose logs -f pdflow nginx

# Last 100 lines
docker-compose logs --tail=100 pdflow
```

---

## 📊 Log Analysis Examples

### **Debugging Failed PDF Conversion**

```bash
# Find all conversion errors
grep "Script exited with code" logs/pdflow-*.log

# Get full context (10 lines before and after)
grep -B 10 -A 10 "Script exited with code" logs/pdflow-*.log

# Extract stderr output
grep "stderr" logs/pdflow-*.log | jq '.stderr'
```

### **Session Timeline**

```bash
# Get all events for a session
grep "session_1762388170732" logs/pdflow-*.log | sort

# Extract just the messages
grep "session_1762388170732" logs/pdflow-*.log | awk -F'] ' '{print $NF}'

# Format as timeline
grep "session_1762388170732" logs/pdflow-*.log | \
  awk '{print $1" "$2" - "$8}' | \
  sed 's/T/ /' | cut -d'.' -f1
```

### **Performance Monitoring**

```bash
# Find slow operations (duration > 5000ms)
grep "duration" logs/pdflow-*.log | \
  jq 'select(.duration > 5000)' | \
  jq -r '"\(.timestamp) \(.message) \(.duration)ms"'

# Average processing time per page
grep "Processing page" logs/pdflow-*.log | \
  jq '.duration' | \
  awk '{sum+=$1; count++} END {print "Average:", sum/count "ms"}'
```

### **Error Summary**

```bash
# Count errors by type
grep "ERROR" logs/pdflow-*.log | \
  awk -F'] ' '{print $3}' | \
  sort | uniq -c | sort -rn

# Generate daily error report
cat logs/pdflow-$(date +%Y-%m-%d).log | \
  grep "ERROR" | \
  jq -r '"\(.timestamp) [\(.component)] \(.message)"' | \
  tee daily-errors.txt
```

---

## 🔒 Log Rotation & Cleanup

### **Automatic Rotation**

Logs are automatically rotated daily with the naming pattern:
```
pdflow-YYYY-MM-DD.log
```

### **Retention Policy**

By default, logs are kept for **7 days**. Controlled by environment variable:
```bash
LOG_RETENTION_DAYS=7
```

### **Manual Cleanup**

```bash
# Remove logs older than 7 days
find logs/ -name "pdflow-*.log" -mtime +7 -delete

# Archive old logs
tar -czf logs-archive-$(date +%Y%m).tar.gz logs/pdflow-*.log
find logs/ -name "pdflow-*.log" -mtime +30 -delete

# Keep only last N files
ls -t logs/pdflow-*.log | tail -n +8 | xargs rm --
```

### **Docker Log Cleanup**

Docker logs are automatically managed, but you can manually clean:

```bash
# Clear all Docker logs for a container
truncate -s 0 $(docker inspect --format='{{.LogPath}}' pdflow)

# Remove stopped containers and their logs
docker container prune
```

---

## 🚨 Monitoring & Alerts

### **Real-time Monitoring**

```bash
# Watch for critical errors
tail -f logs/pdflow-*.log | grep --color -E "CRITICAL|ERROR"

# Monitor with highlights
tail -f logs/pdflow-*.log | \
  grep --color -E "ERROR|WARN|session_[0-9]+"

# Desktop notification on error (Linux)
tail -f logs/pdflow-*.log | \
  while read line; do
    if echo "$line" | grep -q "CRITICAL"; then
      notify-send "PDFlow Critical Error" "$line"
    fi
  done
```

### **Health Check via Logs**

```bash
# Check if app is processing requests
if ! grep -q "Processing page" logs/pdflow-$(date +%Y-%m-%d).log; then
  echo "⚠️ No recent processing activity"
fi

# Count errors in last hour
error_count=$(grep "ERROR" logs/pdflow-*.log | \
  awk -v cutoff="$(date -d '1 hour ago' -Iseconds)" '$1 > cutoff' | \
  wc -l)

if [ $error_count -gt 10 ]; then
  echo "🚨 High error rate: $error_count errors in last hour"
fi
```

---

## 🛠️ Troubleshooting

### **Logs Not Appearing**

**Problem**: No log files in `logs/` directory

**Solutions**:
```bash
# 1. Check if directory exists and has write permissions
ls -la logs/
stat logs/

# 2. Verify environment variable
echo $ENABLE_FILE_LOGGING  # Should be "true"

# 3. Check Docker volume mount
docker inspect pdflow | jq '.[0].Mounts' | grep logs

# 4. Verify logger is initialized
docker exec pdflow ls -la /app/logs
```

### **Logs Cut Off**

**Problem**: Error messages are truncated

**Solutions**:
```bash
# 1. Increase buffer size in spawn calls (already implemented)
# 2. Check Docker logging limits
docker inspect pdflow | jq '.[0].HostConfig.LogConfig'

# 3. Read full log file instead of Docker logs
tail -f logs/pdflow-*.log
```

### **Permission Errors**

**Problem**: Cannot write to logs directory

**Solutions**:
```bash
# Fix permissions (development)
sudo chown -R $USER:$USER logs/
chmod 755 logs/

# Fix permissions (Docker)
docker exec -u root pdflow chown -R nextjs:nodejs /app/logs
docker exec pdflow chmod 755 /app/logs
```

### **Disk Space Issues**

**Problem**: Logs filling up disk

**Solutions**:
```bash
# Check log size
du -sh logs/

# Find largest log files
find logs/ -type f -exec du -h {} \; | sort -rh | head -10

# Reduce retention period
export LOG_RETENTION_DAYS=3

# Enable compression
gzip logs/pdflow-*.log
```

---

## 📚 Configuration Reference

### **Environment Variables**

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `info` | Minimum log level (debug\|info\|warn\|error\|critical) |
| `ENABLE_FILE_LOGGING` | `true` | Enable writing logs to files |
| `LOG_RETENTION_DAYS` | `7` | Number of days to keep log files |
| `NODE_ENV` | `production` | Environment (affects log format) |

### **File Locations**

| Path | Description |
|------|-------------|
| `./logs/` | Host-mounted log directory |
| `/app/logs/` | Container log directory |
| `$(docker inspect --format='{{.LogPath}}' pdflow)` | Docker's internal log file |

### **Log Files**

| File Pattern | Description |
|--------------|-------------|
| `pdflow-YYYY-MM-DD.log` | Daily application logs |
| `.gitkeep` | Placeholder for Git |

---

## 🎓 Best Practices

### **✅ Do's**
- ✅ Use the helper script for common tasks
- ✅ Filter logs by session ID when debugging
- ✅ Regularly review error logs
- ✅ Archive old logs before deletion
- ✅ Use Docker logs for quick checks
- ✅ Use file logs for detailed analysis

### **❌ Don'ts**
- ❌ Don't commit log files to Git
- ❌ Don't let logs grow unbounded
- ❌ Don't expose logs via web without auth
- ❌ Don't log sensitive data (API keys, passwords)
- ❌ Don't rely solely on Docker logs (they're rotated)

---

## 🚀 Quick Reference Card

```bash
# VIEWING
./scripts/view-logs.sh --follow          # Watch live
./scripts/view-logs.sh --errors          # Errors only
docker logs -f pdflow                    # Docker logs

# SEARCHING  
grep "ERROR" logs/*.log                  # Find errors
grep "session_123" logs/*.log            # Find session

# ANALYSIS
tail -100 logs/pdflow-*.log | grep ERROR # Last 100 errors
du -sh logs/                             # Check size

# CLEANUP
find logs/ -mtime +7 -delete             # Remove old logs
docker logs pdflow > backup.log          # Backup Docker logs
```

---

**Need more help?** Check the main PDFlow documentation or open an issue on GitHub.
