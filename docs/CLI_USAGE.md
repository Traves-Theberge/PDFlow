# PDFlow CLI Usage Guide

Complete guide for using PDFlow's command-line interface for headless PDF extraction.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Options](#options)
- [Examples](#examples)
- [Output Formats](#output-formats)
- [API Key Management](#api-key-management)
- [Troubleshooting](#troubleshooting)

## Installation

PDFlow CLI is included with the main PDFlow installation. No additional setup required.

### Prerequisites

- Node.js 18+
- poppler-utils (for PDF conversion)
- Google Gemini API key

### Install poppler-utils

**Ubuntu/Debian:**
```bash
sudo apt-get install poppler-utils imagemagick
```

**macOS:**
```bash
brew install poppler imagemagick
```

**Windows:**
Download and install [poppler for Windows](http://blog.alivate.com.au/poppler-windows/) and [ImageMagick](https://imagemagick.org/script/download.php), then add to PATH.

## Quick Start

```bash
# Set your API key (recommended)
export GEMINI_API_KEY="your-api-key-here"

# Extract a PDF to markdown
npm run pdflow -- extract document.pdf

# Extract with aggregation (combines all pages)
npm run pdflow -- extract document.pdf -a

# Extract to JSON format
npm run pdflow -- extract document.pdf -f json
```

## Commands

### `extract`

Extract structured data from a PDF file.

```bash
npm run pdflow -- extract <pdf-file> [options]
```

**Arguments:**
- `<pdf-file>` - Path to the PDF file to process (required)

**Returns:**
- Session ID
- Total pages processed
- Processing time
- Output directory path
- Aggregated file path (if `-a` used)

### `validate-key`

Validate your Gemini API key before processing.

```bash
npm run pdflow -- validate-key [options]
```

**Returns:**
- Success message if key is valid
- Error message if key is invalid or connection fails

### `--help`

Display help information for any command.

```bash
npm run pdflow -- --help
npm run pdflow -- extract --help
```

### `--version`

Display the current version of PDFlow CLI.

```bash
npm run pdflow -- --version
```

## Options

### `-f, --format <format>`

Specify the output format for extracted content.

**Available formats:**
- `markdown` (default) - Clean markdown with headings and formatting
- `json` - Structured JSON with metadata
- `xml` - XML format with CDATA sections
- `yaml` - YAML format for configuration files
- `html` - Styled HTML document
- `mdx` - MDX format for React/Next.js
- `csv` - CSV format for tabular data

**Example:**
```bash
npm run pdflow -- extract document.pdf -f json
```

### `-o, --output <directory>`

Specify the output directory for results.

**Default:** `./outputs`

**Example:**
```bash
npm run pdflow -- extract document.pdf -o ./my-results
```

**Output structure:**
```
./my-results/
└── session_1234567890_abc123/
    ├── page-1.md
    ├── page-1.meta.json
    ├── page-2.md
    ├── page-2.meta.json
    └── full.markdown (if -a used)
```

### `-k, --api-key <key>`

Provide your Gemini API key via command line.

**Recommended:** Use environment variable instead for security.

**Example:**
```bash
npm run pdflow -- extract document.pdf -k "your-api-key"
```

### `-a, --aggregate`

Combine all pages into a single output file.

**Benefits:**
- Single file for entire document
- Includes metadata header
- Maintains page order
- Easier to share and view

**Example:**
```bash
npm run pdflow -- extract document.pdf -a
```

**Output:** Creates `full.<format>` file (e.g., `full.markdown`, `full.json`)

### `-v, --verbose`

Show verbose output with detailed processing information.

**Includes:**
- PDF conversion script output
- Page-by-page processing logs
- Error stack traces
- Detailed timing information

**Example:**
```bash
npm run pdflow -- extract document.pdf -v
```

## Examples

### Basic Extraction

Extract a PDF to markdown format:

```bash
npm run pdflow -- extract invoice.pdf
```

Output:
```
🚀 PDFlow CLI - Starting PDF extraction

📄 File: invoice.pdf
📊 Format: markdown
📁 Output: ./outputs
🔄 Aggregate: No

📄 Converting PDF to WebP images...
✓ Successfully converted PDF to 3 WebP images

🤖 Extracting content with Gemini AI...
  Progress: 3/3 pages (100%)

✅ Processing complete!
📊 Total pages: 3
⏱️  Processing time: 12.45s
📁 Output directory: outputs/session_1234567890_abc123
```

### Multi-Format Extraction

Extract the same PDF to multiple formats:

```bash
# Markdown
npm run pdflow -- extract report.pdf -f markdown -o ./results/md

# JSON
npm run pdflow -- extract report.pdf -f json -o ./results/json

# HTML
npm run pdflow -- extract report.pdf -f html -o ./results/html
```

### Aggregated Output

Combine all pages into a single file:

```bash
npm run pdflow -- extract book.pdf -f markdown -a -o ./book-output
```

Output includes:
- Individual page files: `page-1.md`, `page-2.md`, etc.
- Aggregated file: `full.markdown` (all pages combined)
- Metadata file: `metadata.json` (processing info)

### Batch Processing

Process multiple PDFs in a loop:

```bash
#!/bin/bash
for pdf in documents/*.pdf; do
  echo "Processing: $pdf"
  npm run pdflow -- extract "$pdf" -f json -a -o ./results
done
```

### API Key Validation

Validate your API key before processing large documents:

```bash
npm run pdflow -- validate-key

# Output:
# 🔑 Validating Gemini API key...
# ✅ API key is valid!
```

### Verbose Mode for Debugging

Get detailed output for troubleshooting:

```bash
npm run pdflow -- extract document.pdf -v
```

Includes:
- Shell script output from PDF conversion
- Detailed page processing logs
- Full error messages with stack traces

## Output Formats

### Markdown (`markdown`)

Clean, readable markdown with:
- Headings and subheadings
- Bold and italic text
- Lists (ordered and unordered)
- Code blocks
- Links and references

**Best for:** Documentation, notes, blog posts

### JSON (`json`)

Structured JSON with:
- Page metadata
- Content blocks
- Image references
- Position information

**Best for:** APIs, data processing, programmatic access

### XML (`xml`)

XML format with:
- CDATA sections for content
- Metadata tags
- Page structure
- Image elements

**Best for:** Enterprise systems, data interchange

### YAML (`yaml`)

YAML format with:
- Clean, readable structure
- Nested data
- Comments support
- Configuration-friendly

**Best for:** Configuration files, data exports

### HTML (`html`)

Styled HTML document with:
- Embedded CSS
- Responsive layout
- Page navigation
- Metadata header

**Best for:** Web viewing, sharing, archiving

### MDX (`mdx`)

MDX format with:
- React component support
- Frontmatter metadata
- JSX expressions
- Interactive elements

**Best for:** React/Next.js projects, interactive docs

### CSV (`csv`)

Comma-separated values with:
- Page numbers
- Content blocks
- Metadata columns
- Excel-compatible

**Best for:** Spreadsheets, data analysis, reporting

## API Key Management

### Environment Variable (Recommended)

Set the API key as an environment variable:

**Linux/macOS:**
```bash
export GEMINI_API_KEY="your-api-key-here"
npm run pdflow -- extract document.pdf
```

**Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY="your-api-key-here"
npm run pdflow -- extract document.pdf
```

**Windows (CMD):**
```cmd
set GEMINI_API_KEY=your-api-key-here
npm run pdflow -- extract document.pdf
```

### .env File (Development)

Create a `.env.local` file in the project root:

```bash
GEMINI_API_KEY=your-api-key-here
```

**Note:** The CLI does not automatically load `.env` files. You must export the variable or use a tool like `dotenv-cli`:

```bash
npm install -g dotenv-cli
dotenv -e .env.local -- npm run pdflow -- extract document.pdf
```

### Command Line (Not Recommended)

Pass the API key via command line:

```bash
npm run pdflow -- extract document.pdf -k "your-api-key"
```

**Warning:** API keys passed via command line may be visible in shell history.

### Getting an API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and store it securely

**Free tier includes:**
- 50 requests per day
- Rate limit: 2 requests per minute
- Suitable for testing and small projects

## Troubleshooting

### "API key is required"

**Problem:** No API key provided.

**Solution:**
```bash
export GEMINI_API_KEY="your-api-key-here"
# or
npm run pdflow -- extract document.pdf -k "your-api-key"
```

### "Conversion script not found"

**Problem:** `scripts/convert-to-webp.sh` is missing.

**Solution:** Ensure you're running from the PDFlow project root directory.

### "pdftocairo is not installed"

**Problem:** poppler-utils not installed.

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get install poppler-utils imagemagick

# macOS
brew install poppler imagemagick
```

### "Error converting PDF to images"

**Problem:** PDF may be corrupted, password-protected, or invalid.

**Solutions:**
- Check if the PDF opens in a PDF viewer
- Remove password protection
- Ensure the file is a valid PDF
- Check file permissions

### "Rate limit exceeded" (429 Error)

**Problem:** Exceeded Gemini API rate limits.

**Solution:**
- Wait 10 seconds before retrying
- Free tier: 2 requests per minute, 50 per day
- Consider upgrading to paid tier for higher limits
- Process fewer pages at a time

### "File size too large"

**Problem:** PDF exceeds 500MB limit.

**Solution:**
- Split the PDF into smaller files
- Reduce PDF quality/resolution
- Remove unnecessary embedded images

### Pages Missing from Output

**Problem:** Some pages failed to process.

**Causes:**
- Rate limit hit mid-processing
- Network error
- Invalid page content

**Solution:**
- Check error logs in console
- Rerun the CLI (it will skip already-processed pages)
- Use verbose mode (`-v`) for detailed error information

### Empty or Incomplete Output

**Problem:** Extracted content is missing or incomplete.

**Solution:**
- Verify the PDF has actual text (not scanned images)
- For scanned PDFs, use OCR preprocessing first
- Check if the PDF uses non-standard fonts or encoding
- Try different output formats

## Advanced Usage

### Resume Interrupted Processing

PDFlow automatically skips already-processed pages:

```bash
# First run (interrupted)
npm run pdflow -- extract large.pdf -o ./results

# Resume (skips completed pages)
npm run pdflow -- extract large.pdf -o ./results
```

### Custom Session Management

Each processing run creates a unique session directory. To organize outputs:

```bash
# Process multiple documents to the same output folder
npm run pdflow -- extract doc1.pdf -o ./project-docs
npm run pdflow -- extract doc2.pdf -o ./project-docs
npm run pdflow -- extract doc3.pdf -o ./project-docs

# Each gets its own session subfolder:
# ./project-docs/session_123_abc/
# ./project-docs/session_456_def/
# ./project-docs/session_789_ghi/
```

### Scripting and Automation

Create automated workflows:

```bash
#!/bin/bash
# process-all-pdfs.sh

OUTPUT_DIR="./processed-$(date +%Y%m%d)"
mkdir -p "$OUTPUT_DIR"

for pdf in ./incoming/*.pdf; do
  echo "Processing: $pdf"

  # Extract to JSON with aggregation
  npm run pdflow -- extract "$pdf" \
    -f json \
    -a \
    -o "$OUTPUT_DIR" || {
      echo "Failed: $pdf"
      continue
    }

  # Move processed file
  mv "$pdf" ./archive/
done

echo "Batch processing complete!"
```

## Performance Tips

1. **Use verbose mode only for debugging** - Reduces overhead
2. **Process smaller batches** - Avoid rate limits
3. **Choose appropriate formats** - JSON is faster than HTML
4. **Skip aggregation** for large documents - Process pages individually
5. **Monitor API quota** - Track usage at [Google AI Studio](https://makersuite.google.com/)

## Support

For issues, questions, or feature requests:
- GitHub Issues: [PDFlow Issues](https://github.com/traves-theberge/pdflow/issues)
- Documentation: [README.md](../README.md)
- API Docs: [Google Gemini API](https://ai.google.dev/docs)
