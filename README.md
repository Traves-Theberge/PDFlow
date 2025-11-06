![PDFlow Logo](public/PDFlow_Logo_W_Text.png)

# PDFlow

**Transform PDFs into structured data with AI-powered extraction.**

PDFlow is a modern, full-stack PDF extraction tool that leverages multimodal AI to intelligently extract and structure content from PDF documents. Whether you need documentation in Markdown, data in JSON, or reports in HTML, PDFlow delivers accurate extraction with web UI, CLI, and AI agent integration.

📚 **[View Full Documentation](https://pdflow.vercel.app/docs)** | 🚀 **[Quick Start](https://pdflow.vercel.app/docs/quickstart)** | 🔌 **[API Reference](https://pdflow.vercel.app/docs/api)**

## Features

### Core Features
- **PDF Upload**: Intuitive drag-and-drop PDF upload interface
- **CLI Support**: Headless PDF processing via command-line interface for automation
- **Image Conversion**: Converts PDF pages to WebP images using pdftocairo
- **AI Extraction**: Uses Google Gemini 2.0 Flash multimodal AI for intelligent extraction
- **Multiple Formats**: Export results in Markdown, MDX, JSON, XML, YAML, HTML, or CSV
- **Real-time Progress**: Live progress tracking with page-by-page updates (web and CLI)
- **Threaded Output**: View results as they complete with real-time streaming
- **Dark Mode**: Beautiful dark mode support with localStorage persistence
- **Minimal Design**: Clean black/white/grey aesthetic inspired by shadcn/ui
- **Responsive Design**: Mobile-friendly interface with TailwindCSS 4
- **Type Safety**: Full TypeScript implementation with Zod validation
- **Session Storage API Keys**: Secure API key management in browser session storage

### New: Deployment & AI Integration
- **🐳 Docker Support**: Multi-stage builds with production-ready containers
- **🤖 MCP Server**: Model Context Protocol integration for AI agents (Claude, etc.)
- **📡 REST API**: Complete API for custom integrations
- **🔐 Security Features**: File validation, command injection prevention, containerization
- **📚 Full Documentation Site**: Interactive documentation with comprehensive guides and examples
- **📋 Comprehensive Logging**: Dual-output logging system with file persistence, Docker integration, and advanced filtering

## Tech Stack

| Layer | Technology |
|--------|-------------|
| Frontend | Next.js 16.0.1, React 19, TailwindCSS 4, Framer Motion |
| State | Zustand |
| Validation | Zod |
| Templates | Handlebars |
| AI Model | Google Gemini 2.0 Flash Exp (multimodal) |
| AI SDK | Vercel AI SDK |
| Backend | TypeScript + Next.js API Routes |
| PDF Processing | pdftocairo (poppler-utils) |
| Storage | Local filesystem (uploads, outputs) |

## Prerequisites

- Node.js 18+ 
- npm or yarn
- pdftocairo (poppler-utils)
- Google Gemini API key

### Installing pdftocairo

**Ubuntu/Debian:**
```bash
sudo apt-get install poppler-utils
```

**macOS:**
```bash
brew install poppler
```

**Windows:**
Download and install [poppler for Windows](httpblog.alivate.com.au/poppler-windows/) and add to PATH.

## Setup

### Option 1: Docker (Recommended)

```bash
# Set your API key
export GEMINI_API_KEY="your-api-key-here"

# Start with Docker Compose
docker-compose up -d

# Access at http://localhost:3000
```

**📦 For complete Docker documentation, see [Docker Deployment Guide](docs/DOCKER.md)**

### Option 2: Local Development

1. **Clone the repository and install dependencies:**
```bash
git clone https://github.com/traves-theberge/pdflow.git
cd pdflow
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

3. **Open the application:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Click the settings gear icon in the top right
   - Enter your Google Gemini API key
   - Click "Save API Key"

Your API key is stored securely in your browser's session storage and is never sent to any server except Google's Gemini API.

## Usage

### Web Interface

1. **Configure API Key**: Enter your Gemini API key in Settings (first time only)
2. **Select Output Format**: Choose from Markdown, MDX, JSON, XML, YAML, HTML, or CSV
3. **Upload a PDF**: Drag and drop or click to select a PDF file
4. **Processing**: The app automatically converts PDF to WebP images and extracts data using AI
5. **View Results**: See extracted content in real-time as pages complete
6. **Download**: Export individual pages or download all pages combined

**📚 For complete web interface guide, see [Web Usage Documentation](docs/WEB_USAGE.md)**

### CLI (Headless Mode)

PDFlow includes a command-line interface for headless PDF processing without the web UI.

**Extract PDF to structured data:**
```bash
npm run pdflow -- extract <pdf-file> [options]
```

**Options:**
- `-f, --format <format>`: Output format (markdown|json|xml|yaml|html|mdx|csv) [default: markdown]
- `-o, --output <directory>`: Output directory [default: ./outputs]
- `-k, --api-key <key>`: Gemini API key (or set GEMINI_API_KEY env var)
- `-a, --aggregate`: Aggregate all pages into a single file
- `-v, --verbose`: Show verbose output

**Examples:**
```bash
# Extract PDF to markdown
npm run pdflow -- extract document.pdf -f markdown -o ./results

# Extract to JSON with aggregation
npm run pdflow -- extract document.pdf -f json -a

# Extract with custom API key
npm run pdflow -- extract document.pdf -k YOUR_API_KEY

# Extract with verbose output
npm run pdflow -- extract document.pdf -v
```

**Validate Gemini API key:**
```bash
npm run pdflow -- validate-key
# or
npm run pdflow -- validate-key -k YOUR_API_KEY
```

**CLI Output:**
The CLI creates a session directory in your output folder with:
- Individual page files (e.g., `page-1.md`, `page-2.md`)
- Metadata files (e.g., `page-1.meta.json`)
- Aggregated file (if `-a` flag is used, e.g., `full.markdown`)

**📚 For complete CLI documentation, see [CLI Usage Guide](docs/CLI_USAGE.md)**

## Project Structure

```
/src
  /app
    /api
      /upload
        route.ts                      # PDF upload endpoint
      /process
        route.ts                      # Processing endpoint with progress
      /outputs/[sessionId]/[filename]
        route.ts                      # Output file serving
      /settings
        /validate-key
          route.ts                    # API key validation
    /components
      UploadForm.tsx                  # File upload component
      ProgressBar.tsx                 # Progress tracking with polling
      EnhancedOutputViewer.tsx        # Real-time threaded output display
      Settings.tsx                    # Settings modal with API key management
    /utils
      gemini-extractor.ts             # Gemini AI extraction logic
      aggregator.ts                   # Output aggregation
      prompt-builder.ts               # Dynamic prompt generation
    /store
      useAppStore.ts                  # Zustand state management
    page.tsx                          # Main page with dark mode
    layout.tsx                        # Root layout
    globals.css                       # Global styles
  /cli
    pdflow.ts                         # CLI entry point
    pdf-processor.ts                  # Headless PDF processing logic
/templates
  /formats
    markdown_format.hbs               # Markdown extraction template
    mdx_format.hbs                    # MDX extraction template
    json_format.hbs                   # JSON extraction template
    xml_format.hbs                    # XML extraction template
    yaml_format.hbs                   # YAML extraction template
    html_format.hbs                   # HTML extraction template
    csv_format.hbs                    # CSV extraction template
/scripts
  convert-to-webp.sh                  # PDF to WebP conversion script
/docs
  CLI_USAGE.md                        # Complete CLI documentation
/public
  PDFlow_Logo.png                     # Logo (icon only)
  PDFlow_Logo_W_Text.png              # Logo with text
/uploads                              # Temporary upload storage (gitignored)
/outputs                              # Processed output files (gitignored)
/test-cli-outputs                     # CLI test outputs (gitignored)
```

## API Endpoints

### POST /api/upload
Uploads a PDF file and converts it to WebP images.

**Request:** `multipart/form-data`
- `file`: PDF file

**Response:**
```json
{
  "success": true,
  "sessionId": "session_1234567890_abc123",
  "pageCount": 5,
  "message": "Successfully uploaded and converted PDF to 5 pages"
}
```

### POST /api/process
Starts processing a session or aggregates results.

**Request:**
```json
{
  "sessionId": "session_1234567890_abc123",
  "format": "markdown",
  "aggregate": true
}
```

**Response:**
```json
{
  "sessionId": "session_1234567890_abc123",
  "status": "completed",
  "totalPages": 5,
  "processedPages": 5,
  "aggregate": {
    "format": "markdown",
    "totalPages": 5,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/process?sessionId=<id>
Gets processing progress for a session.

**Response:**
```json
{
  "sessionId": "session_1234567890_abc123",
  "status": "processing",
  "totalPages": 5,
  "processedPages": 3,
  "processingTime": "15.23s"
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key (can be set via UI) | Optional* |
| `PORT` | Server port (defaults to 3000) | No |
| `NODE_ENV` | Node environment | No |

*The API key can be set in the application UI via Settings. If set in `.env.local`, it will be used as a fallback.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. **New Output Formats**: Add to `aggregator.ts` and update the format selector
2. **Custom Processing**: Modify `gemini-extractor.ts` for different extraction prompts
3. **UI Components**: Add to `/src/app/components` and import in `page.tsx`

## Deployment

### Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Add `GEMINI_API_KEY` as environment variable
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Logging & Monitoring

PDFlow v0.5.0+ includes comprehensive logging for debugging and monitoring:

### Viewing Logs

```bash
# Watch logs in real-time
./scripts/view-logs.sh --follow

# Show only errors
./scripts/view-logs.sh --errors

# Filter by session ID
./scripts/view-logs.sh --session session_123

# View Docker logs
docker logs -f pdflow
```

### Log Files

Logs are stored in:
- **Host**: `./logs/pdflow-YYYY-MM-DD.log`
- **Container**: `/app/logs/pdflow-YYYY-MM-DD.log`
- **Docker**: `docker logs pdflow`

### Configuration

Control logging via environment variables:
```bash
LOG_LEVEL=info              # debug|info|warn|error|critical
ENABLE_FILE_LOGGING=true    # Enable file-based logs
LOG_RETENTION_DAYS=7        # Days to keep logs
```

**📋 For complete logging documentation, see [docs/LOGGING.md](docs/LOGGING.md)**

## Troubleshooting

### Common Issues

1. **"pdftocairo not found"**
   - Install poppler-utils (see prerequisites)

2. **"Gemini API key not found"**
   - Check `.env.local` file exists and contains valid API key

3. **"PDF conversion failed"**
   - Ensure PDF is not password-protected
   - Check file size limits
   - Check logs: `./scripts/view-logs.sh --errors`

4. **"Processing stuck at 0%"**
   - Check browser console for errors
   - Verify API endpoints are responding
   - Review logs: `./scripts/view-logs.sh --follow`

5. **"Script exited with code 1"**
   - Check detailed error logs: `grep "Script failed" logs/pdflow-*.log`
   - Verify ImageMagick and poppler-utils are installed
   - Review stderr output in logs for specific error messages

### Debugging with Logs

```bash
# Find errors in today's logs
./scripts/view-logs.sh --today --errors

# Search for specific errors
grep "ERROR" logs/pdflow-*.log

# View session timeline
grep "session_YOUR_SESSION_ID" logs/pdflow-*.log

# Check Docker logs
docker logs --tail 100 pdflow
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Open an issue on GitHub
- Check the troubleshooting section above
