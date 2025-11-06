#!/bin/bash

# PDFlow Log Viewer Script
# Provides easy access to view logs in various formats

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOGS_DIR="$PROJECT_ROOT/logs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print usage
usage() {
    echo "PDFlow Log Viewer"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  -f, --follow          Follow log output in real-time (like tail -f)"
    echo "  -e, --errors          Show only error logs"
    echo "  -s, --session <id>    Filter by session ID"
    echo "  -t, --today           Show only today's logs"
    echo "  -l, --last <n>        Show last N lines (default: 100)"
    echo "  -d, --docker          View Docker container logs"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --follow                    # Watch logs in real-time"
    echo "  $0 --errors --last 50          # Show last 50 error entries"
    echo "  $0 --session session_123       # Filter by session"
    echo "  $0 --docker --follow           # Watch Docker logs"
    echo ""
}

# Default values
FOLLOW=false
ERRORS_ONLY=false
SESSION_ID=""
LINES=100
DOCKER=false
TODAY_ONLY=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -e|--errors)
            ERRORS_ONLY=true
            shift
            ;;
        -s|--session)
            SESSION_ID="$2"
            shift 2
            ;;
        -t|--today)
            TODAY_ONLY=true
            shift
            ;;
        -l|--last)
            LINES="$2"
            shift 2
            ;;
        -d|--docker)
            DOCKER=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# View Docker logs
if [ "$DOCKER" = true ]; then
    echo -e "${BLUE}📦 Viewing Docker container logs...${NC}"
    
    if [ "$FOLLOW" = true ]; then
        docker logs -f pdflow
    else
        docker logs --tail "$LINES" pdflow
    fi
    exit 0
fi

# Check if logs directory exists
if [ ! -d "$LOGS_DIR" ]; then
    echo -e "${RED}❌ Logs directory not found: $LOGS_DIR${NC}"
    echo "Run the application first to generate logs."
    exit 1
fi

# Get today's log file
TODAY=$(date +%Y-%m-%d)
TODAY_LOG="$LOGS_DIR/pdflow-$TODAY.log"

# Find log files
if [ "$TODAY_ONLY" = true ]; then
    if [ ! -f "$TODAY_LOG" ]; then
        echo -e "${RED}❌ No logs found for today: $TODAY_LOG${NC}"
        exit 1
    fi
    LOG_FILES="$TODAY_LOG"
else
    LOG_FILES=$(find "$LOGS_DIR" -name "pdflow-*.log" -type f | sort -r)
    
    if [ -z "$LOG_FILES" ]; then
        echo -e "${RED}❌ No log files found in $LOGS_DIR${NC}"
        echo "Run the application first to generate logs."
        exit 1
    fi
fi

# Build filter command
FILTER_CMD="cat"

if [ "$ERRORS_ONLY" = true ]; then
    FILTER_CMD="$FILTER_CMD | grep -E '\[ERROR\]|\[CRITICAL\]'"
fi

if [ -n "$SESSION_ID" ]; then
    FILTER_CMD="$FILTER_CMD | grep '$SESSION_ID'"
fi

# Display logs
echo -e "${GREEN}📋 PDFlow Logs${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ "$FOLLOW" = true ]; then
    echo -e "${YELLOW}Following logs (Ctrl+C to stop)...${NC}\n"
    eval "tail -f $LOG_FILES $FILTER_CMD"
else
    echo -e "${YELLOW}Showing last $LINES lines...${NC}\n"
    eval "tail -n $LINES $LOG_FILES $FILTER_CMD"
fi
