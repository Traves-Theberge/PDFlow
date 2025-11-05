# PDFlow Web Interface Usage Guide

Complete guide for using PDFlow's web interface for PDF extraction with AI.

## Table of Contents

- [Getting Started](#getting-started)
- [Interface Overview](#interface-overview)
- [Step-by-Step Guide](#step-by-step-guide)
- [Features](#features)
- [Output Formats](#output-formats)
- [Settings & API Key](#settings--api-key)
- [Dark Mode](#dark-mode)
- [Troubleshooting](#troubleshooting)
- [Tips & Best Practices](#tips--best-practices)

## Getting Started

### Prerequisites

Before using PDFlow's web interface, ensure you have:

1. **System Requirements**
   - Modern web browser (Chrome, Firefox, Safari, Edge)
   - Internet connection for AI processing
   - JavaScript enabled

2. **Google Gemini API Key**
   - Sign up at [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Free tier includes 50 requests/day

3. **Server Running**
   ```bash
   npm run dev
   ```
   - Navigate to [http://localhost:3000](http://localhost:3000)

## Interface Overview

### Header

```
┌─────────────────────────────────────────────────────┐
│  [Logo]  PDFlow          [GitHub] [Settings] [Mode] │
└─────────────────────────────────────────────────────┘
```

- **Logo**: Click to return to home page
- **GitHub Icon**: Link to source code repository
- **Settings (⚙️)**: Configure API key and preferences
- **Dark Mode (☀️/🌙)**: Toggle between light and dark themes

### Main Content Area

1. **Format Selector** - Choose output format
2. **Upload Zone** - Drag & drop or click to upload
3. **Progress Bar** - Real-time processing status
4. **Output Viewer** - View and download results

## Step-by-Step Guide

### 1. Configure API Key (First Time Only)

When you first open PDFlow:

1. Click the **Settings (⚙️)** icon in the top-right corner
2. Enter your Google Gemini API key in the text field
3. Click **"Validate & Save API Key"**
4. Wait for validation confirmation (✅ or ❌)
5. If valid, the key is saved to your browser's session storage

**Security Note:** Your API key is stored only in your browser's session storage and is never sent to any server except Google's Gemini API.

**Validation Benefits:**
- Ensures key is valid before processing
- Prevents wasted time on invalid configurations
- Tests connection to Gemini API

### 2. Select Output Format

Choose your desired output format from the dropdown:

```
┌─────────────────────────────┐
│ Select Output Format    [▼] │
│ ├─ Markdown (default)        │
│ ├─ MDX                       │
│ ├─ JSON                      │
│ ├─ XML                       │
│ ├─ YAML                      │
│ ├─ HTML                      │
│ └─ CSV                       │
└─────────────────────────────┘
```

**Format Selection Guide:**
- **Markdown** - For documentation, notes, blog posts
- **JSON** - For APIs, data processing, programmatic access
- **XML** - For enterprise systems, data interchange
- **YAML** - For configuration files
- **HTML** - For web viewing, archiving
- **MDX** - For React/Next.js projects
- **CSV** - For spreadsheets, data analysis

### 3. Upload Your PDF

**Option A: Drag & Drop**
1. Drag a PDF file from your file explorer
2. Drop it onto the upload zone
3. The upload begins automatically

**Option B: Click to Browse**
1. Click anywhere in the upload zone
2. Select a PDF file from the file picker
3. Click "Open" to start upload

**Upload Zone States:**

```
┌─────────────────────────────────────────┐
│  📄  Drag & Drop PDF Here               │
│      or click to browse                 │
│                                         │
│  Supported: PDF files up to 500MB      │
└─────────────────────────────────────────┘

While Uploading:
┌─────────────────────────────────────────┐
│  ⏳  Uploading: document.pdf            │
│      Converting to images...            │
│      [████████████░░░░] 67%             │
└─────────────────────────────────────────┘
```

**File Requirements:**
- File type: PDF only
- Maximum size: 500MB
- Must be a valid PDF (not password-protected)

### 4. Monitor Processing

Once uploaded, PDFlow automatically begins processing:

```
Processing: document.pdf

┌─────────────────────────────────────────┐
│  🤖 Extracting with AI...               │
│  Progress: 3/10 pages (30%)             │
│  [██████░░░░░░░░░░░░] 30%               │
│                                         │
│  ⏱️  Elapsed: 45s                        │
└─────────────────────────────────────────┘
```

**Processing Steps:**
1. **Upload & Conversion** (5-30s)
   - PDF uploaded to server
   - Pages converted to WebP images
   - Session created

2. **AI Extraction** (2-10s per page)
   - Each page analyzed by Gemini AI
   - Content extracted in chosen format
   - Results saved as they complete

3. **Completion**
   - All pages processed
   - Output viewer appears
   - Individual pages available for download

**Live Updates:**
- Progress bar updates in real-time
- Page count shows completed/total
- Timer shows elapsed processing time

### 5. View & Download Results

After processing completes, the output viewer displays:

```
┌─────────────────────────────────────────────────────┐
│  📊 Processed: 10 pages                             │
│  [Grid View] [List View]        [Download All]     │
├─────────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │ P.1  │  │ P.2  │  │ P.3  │  │ P.4  │           │
│  │ ✓    │  │ ✓    │  │ ✓    │  │ ✓    │           │
│  │[👁️][⬇️]│  │[👁️][⬇️]│  │[👁️][⬇️]│  │[👁️][⬇️]│           │
│  └──────┘  └──────┘  └──────┘  └──────┘           │
└─────────────────────────────────────────────────────┘
```

**Grid View** (Default)
- Visual card layout
- Quick overview of all pages
- Preview and download icons for each page

**List View**
- Detailed list format
- Shows page numbers and status
- Easier for large documents

**Actions:**
- **👁️ Preview** - View extracted content in browser
- **⬇️ Download** - Download individual page
- **Download All** - Download all pages as separate files
- **Aggregate Pages** - Combine all pages into one file

### 6. Aggregate Pages (Optional)

To combine all pages into a single file:

1. Click **"Aggregate Pages"** button
2. Wait for aggregation (1-5s)
3. Download the combined file

**Aggregated Output Includes:**
- Document header with metadata
- All pages in order
- Page separators
- Table of contents (for supported formats)

### 7. Reset & Start New

To process another PDF:

1. Click **"Reset"** or **"Upload New PDF"**
2. All previous data is cleared
3. Upload zone reappears
4. Repeat from step 2

## Features

### Real-Time Streaming

Pages appear as they complete processing - no need to wait for the entire document!

**Benefits:**
- Start reviewing results immediately
- Download completed pages while others process
- Better user experience for large documents

**How It Works:**
- Viewer polls server every 2 seconds
- New pages appear automatically
- Progress updates in real-time

### Session Management

Each upload creates a unique session:

**Session ID Format:** `session_[timestamp]_[random]`

**Session Contents:**
- Original PDF
- Converted WebP images
- Extracted content files
- Metadata

**Session Persistence:**
- Sessions survive page refreshes
- Resume processing if interrupted
- Automatic cleanup after completion

### Error Handling

PDFlow gracefully handles common errors:

**Upload Errors:**
- File too large (>500MB)
- Invalid file type
- Corrupted PDF
- Network issues

**Processing Errors:**
- API key invalid/expired
- Rate limit exceeded
- Page extraction failures
- Network timeouts

**Error Messages:**
```
┌─────────────────────────────────────────┐
│  ❌ Error                                │
│  API key is invalid or expired          │
│                                         │
│  [Open Settings] [Try Again]            │
└─────────────────────────────────────────┘
```

### Progress Tracking

Multiple ways to track processing:

1. **Progress Bar** - Visual percentage
2. **Page Counter** - "3/10 pages"
3. **Timer** - Elapsed time
4. **Individual Status** - ✓ or ⏳ per page

## Output Formats

### Markdown (.md)

**Best For:** Documentation, notes, README files

**Features:**
- Clean, readable format
- Headings, lists, code blocks
- Tables and formatting
- GitHub-compatible

**Example Output:**
```markdown
# Document Title

## Section 1

This is a paragraph with **bold** and *italic* text.

- Bullet point 1
- Bullet point 2

## Section 2

More content here...
```

**Use Cases:**
- Technical documentation
- Blog posts
- Project README files
- Note-taking

### JSON (.json)

**Best For:** APIs, data processing, automation

**Features:**
- Structured data format
- Nested objects and arrays
- Metadata included
- Easy to parse programmatically

**Example Output:**
```json
{
  "page": 1,
  "sessionId": "session_123_abc",
  "text_blocks": [
    {
      "type": "heading",
      "content": "Document Title",
      "level": 1
    },
    {
      "type": "paragraph",
      "content": "This is the content..."
    }
  ],
  "metadata": {
    "images": [],
    "tables": []
  }
}
```

**Use Cases:**
- API integration
- Data pipelines
- Automated workflows
- Database import

### XML (.xml)

**Best For:** Enterprise systems, SOAP APIs

**Features:**
- Hierarchical structure
- CDATA sections for content
- Namespace support
- Schema validation ready

**Example Output:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
  <metadata>
    <title>Document Title</title>
    <pages>1</pages>
  </metadata>
  <pages>
    <page number="1">
      <content><![CDATA[Content here...]]></content>
    </page>
  </pages>
</document>
```

**Use Cases:**
- Enterprise integration
- Legacy systems
- Data exchange
- Configuration files

### YAML (.yaml)

**Best For:** Configuration files, data serialization

**Features:**
- Human-readable format
- Comments support
- Clean indentation
- Configuration-friendly

**Example Output:**
```yaml
page: 1
sessionId: session_123_abc
content:
  - type: heading
    text: Document Title
    level: 1
  - type: paragraph
    text: Content here...
metadata:
  images: []
  tables: []
```

**Use Cases:**
- Configuration files
- CI/CD pipelines
- Docker/Kubernetes configs
- Data serialization

### HTML (.html)

**Best For:** Web viewing, archiving, sharing

**Features:**
- Styled output with embedded CSS
- Responsive layout
- Print-friendly
- Standalone file

**Example Output:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Document Content</title>
  <style>
    body { font-family: Arial; }
    .page { margin: 20px; }
  </style>
</head>
<body>
  <h1>Document Title</h1>
  <p>Content here...</p>
</body>
</html>
```

**Use Cases:**
- Sharing with non-technical users
- Web archiving
- Email attachments
- Print-ready output

### MDX (.mdx)

**Best For:** React/Next.js documentation, interactive docs

**Features:**
- Markdown + JSX support
- React component imports
- Frontmatter metadata
- Interactive elements

**Example Output:**
```mdx
---
title: Document Title
date: 2025-01-05
---

import { CustomComponent } from './components'

# Document Title

<CustomComponent data={myData} />

Regular markdown content here...
```

**Use Cases:**
- Next.js documentation
- React component docs
- Interactive tutorials
- Developer portals

### CSV (.csv)

**Best For:** Spreadsheets, data analysis, reporting

**Features:**
- Tabular format
- Excel-compatible
- Easy to import
- Column headers

**Example Output:**
```csv
Page,Type,Content,Position
1,heading,"Document Title",top
1,paragraph,"Content here...",middle
2,heading,"Section 2",top
```

**Use Cases:**
- Data analysis
- Spreadsheet import
- Reporting
- Data migration

## Settings & API Key

### Opening Settings

Click the **⚙️ Settings** icon in the top-right corner.

### Settings Modal

```
┌─────────────────────────────────────────┐
│  Settings                          [×]  │
├─────────────────────────────────────────┤
│                                         │
│  Gemini API Key                         │
│  ┌───────────────────────────────────┐ │
│  │ AIzaSy...                         │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [Validate & Save API Key]              │
│  [Clear API Key]                        │
│                                         │
│  ⚠️ Your API key is stored securely in  │
│     your browser's session storage      │
│     and never sent to our servers.      │
└─────────────────────────────────────────┘
```

### API Key Management

**Save API Key:**
1. Paste your Gemini API key
2. Click "Validate & Save API Key"
3. Wait for validation (2-5 seconds)
4. Key is saved on success

**Validation Process:**
- Tests connection to Gemini API
- Verifies key permissions
- Ensures key is active
- Displays success/error message

**Clear API Key:**
1. Click "Clear API Key"
2. Confirmation dialog appears
3. Key is removed from session storage
4. You'll need to re-enter for next use

**Security Features:**
- Stored in session storage (not persistent)
- Never logged or transmitted
- Only sent to Google's Gemini API
- Cleared when browser closes

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key
5. Paste into PDFlow settings

**Free Tier Limits:**
- 50 requests per day
- 2 requests per minute
- Suitable for testing and small projects

**Paid Tier:**
- Higher rate limits
- More requests per day
- Priority support
- Visit [Google AI Pricing](https://ai.google.dev/pricing)

## Dark Mode

### Enabling Dark Mode

Click the **☀️/🌙** icon in the top-right corner to toggle.

**Light Mode:**
- Clean white background
- Black text
- Subtle shadows
- Easy reading in bright environments

**Dark Mode:**
- Dark gray/black background
- Light text
- Reduced eye strain
- Better for low-light environments

### Persistence

Your theme preference is saved to `localStorage`:
- Persists across page refreshes
- Survives browser restarts
- Per-device setting

### Theme Consistency

All components support both themes:
- Upload zone
- Progress bar
- Output viewer
- Settings modal
- Navigation

## Troubleshooting

### "API Key Required"

**Problem:** No API key configured

**Solution:**
1. Click Settings (⚙️)
2. Enter your Gemini API key
3. Click "Validate & Save"

### "Invalid API Key"

**Problem:** API key is incorrect or expired

**Solutions:**
1. Verify key is copied correctly (no extra spaces)
2. Check key is active in Google AI Studio
3. Generate a new key if needed
4. Try again after validation

### "Upload Failed"

**Problem:** File upload encountered an error

**Common Causes:**
- File too large (>500MB)
- Not a valid PDF
- Network connection lost
- Server timeout

**Solutions:**
1. Check file size (must be <500MB)
2. Verify file is a valid PDF
3. Check internet connection
4. Try refreshing the page
5. Try a different PDF file

### "Processing Failed"

**Problem:** AI extraction encountered errors

**Common Causes:**
- Rate limit exceeded
- Network issues
- PDF has no extractable text
- API key quota exhausted

**Solutions:**
1. Wait 1 minute and try again (rate limits)
2. Check internet connection
3. Verify PDF contains actual text (not scanned images)
4. Check API quota in Google AI Studio
5. Use OCR preprocessing for scanned PDFs

### Pages Not Appearing

**Problem:** Output viewer shows fewer pages than expected

**Possible Causes:**
- Processing still in progress
- Some pages failed to extract
- Network timeout

**Solutions:**
1. Wait for processing to complete
2. Check browser console for errors (F12)
3. Refresh the page to resume
4. Try processing again

### Slow Processing

**Problem:** Extraction taking longer than expected

**Factors:**
- Document size/complexity
- Number of pages
- API rate limits (2 req/min on free tier)
- Network speed
- Server load

**Tips:**
- Free tier: ~30s per page (rate limited)
- Paid tier: ~2-5s per page
- Complex pages take longer
- Large images slow processing

### Dark Mode Issues

**Problem:** Theme not applying correctly

**Solutions:**
1. Clear browser cache
2. Refresh the page (Ctrl+R / Cmd+R)
3. Check browser localStorage permissions
4. Try toggling theme again

### Download Issues

**Problem:** Cannot download extracted files

**Solutions:**
1. Check browser download permissions
2. Disable popup blockers
3. Check available disk space
4. Try different browser
5. Check browser console for errors

## Tips & Best Practices

### For Best Results

1. **Use High-Quality PDFs**
   - Text-based PDFs (not scans)
   - Clear fonts and formatting
   - Proper page structure

2. **Choose Appropriate Format**
   - Markdown for docs
   - JSON for data
   - HTML for sharing
   - CSV for analysis

3. **Monitor Progress**
   - Watch for errors
   - Check page previews
   - Verify output quality

4. **Manage API Quota**
   - Track daily usage
   - Use paid tier for large volumes
   - Process during off-peak hours

### Performance Tips

1. **Optimize PDF Size**
   - Remove unnecessary pages
   - Compress images in PDF
   - Split large documents

2. **Batch Processing**
   - Process multiple small files instead of one large file
   - Better error isolation
   - Easier to manage

3. **Network Optimization**
   - Use stable internet connection
   - Avoid processing on mobile data
   - Close unnecessary tabs

### Security Best Practices

1. **API Key Management**
   - Never share your API key
   - Regenerate if compromised
   - Use environment-specific keys
   - Monitor usage in AI Studio

2. **Document Privacy**
   - Don't upload sensitive documents to public servers
   - Session data is temporary
   - Files are deleted after processing
   - Review privacy policy

3. **Browser Security**
   - Use updated browser
   - Enable security features
   - Clear session data regularly
   - Use incognito for sensitive work

### Workflow Optimization

1. **Pre-Upload Checklist**
   - ✓ API key configured
   - ✓ Format selected
   - ✓ PDF is valid
   - ✓ Internet stable

2. **During Processing**
   - ✓ Monitor progress
   - ✓ Check for errors
   - ✓ Preview pages as they complete
   - ✓ Start reviewing early results

3. **Post-Processing**
   - ✓ Verify all pages extracted
   - ✓ Download needed files
   - ✓ Aggregate if needed
   - ✓ Reset for next document

### Common Workflows

**Academic Research:**
1. Upload research paper PDF
2. Select Markdown format
3. Extract to readable notes
4. Aggregate all pages
5. Download for annotation

**Data Entry:**
1. Upload forms/invoices
2. Select CSV or JSON format
3. Extract tabular data
4. Download individual pages
5. Import to spreadsheet/database

**Documentation:**
1. Upload manual/guide PDF
2. Select MDX or Markdown
3. Extract for web docs
4. Preview each section
5. Integrate into docs site

**Archiving:**
1. Upload documents
2. Select HTML format
3. Extract for long-term storage
4. Aggregate all pages
5. Save for future reference

## Support & Resources

### Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/traves-theberge/pdflow/issues)
- **Documentation**: [Main README](../README.md)
- **CLI Guide**: [CLI Usage](./CLI_USAGE.md)
- **API Docs**: [Google Gemini API](https://ai.google.dev/docs)

### Additional Resources

- [Google AI Studio](https://makersuite.google.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Gemini API Limits](https://ai.google.dev/gemini-api/docs/rate-limits)

### Feedback

We'd love to hear from you:
- Feature requests
- Bug reports
- Usability feedback
- Success stories

Submit via [GitHub Issues](https://github.com/traves-theberge/pdflow/issues)
