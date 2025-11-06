export default function WebInterfacePage() {
  return (
    <>
      <h1>Web Interface Usage Guide</h1>
      <p className="lead">
        Complete guide for using PDFlow's web interface for PDF extraction with AI.
      </p>

      <h2>Getting Started</h2>

      <h3>Prerequisites</h3>
      <p>Before using PDFlow's web interface, ensure you have:</p>
      <ol>
        <li>
          <strong>System Requirements</strong>
          <ul>
            <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
            <li>Internet connection for AI processing</li>
            <li>JavaScript enabled</li>
          </ul>
        </li>
        <li>
          <strong>Google Gemini API Key</strong>
          <ul>
            <li>Sign up at <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
            <li>Create a new API key</li>
            <li>Free tier includes 50 requests/day</li>
          </ul>
        </li>
        <li>
          <strong>Server Running</strong>
          <pre><code>npm run dev</code></pre>
          <p>Navigate to <a href="http://localhost:3001">http://localhost:3001</a></p>
        </li>
      </ol>

      <h2>Interface Overview</h2>

      <h3>Header</h3>
      <ul>
        <li><strong>Logo</strong>: Click to return to home page</li>
        <li><strong>Docs</strong>: Link to documentation</li>
        <li><strong>GitHub Icon</strong>: Link to source code repository</li>
        <li><strong>Dark Mode (☀️/🌙)</strong>: Toggle between light and dark themes</li>
      </ul>

      <h3>Main Content Area</h3>
      <ol>
        <li><strong>Format Selector</strong> - Choose output format</li>
        <li><strong>Upload Zone</strong> - Drag & drop or click to upload</li>
        <li><strong>Progress Bar</strong> - Real-time processing status</li>
        <li><strong>Output Viewer</strong> - View and download results</li>
      </ol>

      <h2>Step-by-Step Guide</h2>

      <h3>1. Configure API Key (First Time Only)</h3>
      <p>When you first open PDFlow:</p>
      <ol>
        <li>Click the <strong>Settings (⚙️)</strong> icon in the top-right corner</li>
        <li>Enter your Google Gemini API key in the text field</li>
        <li>Click <strong>"Validate & Save API Key"</strong></li>
        <li>Wait for validation confirmation (✅ or ❌)</li>
        <li>If valid, the key is saved to your browser's session storage</li>
      </ol>

      <p><strong>Security Note:</strong> Your API key is stored only in your browser's session storage and is never sent to any server except Google's Gemini API.</p>

      <h3>2. Select Output Format</h3>
      <p>Choose your desired output format from the dropdown:</p>
      <ul>
        <li><strong>Markdown</strong> - For documentation, notes, blog posts</li>
        <li><strong>JSON</strong> - For APIs, data processing, programmatic access</li>
        <li><strong>XML</strong> - For enterprise systems, data interchange</li>
        <li><strong>YAML</strong> - For configuration files</li>
        <li><strong>HTML</strong> - For web viewing, archiving</li>
        <li><strong>MDX</strong> - For React/Next.js projects</li>
        <li><strong>CSV</strong> - For spreadsheets, data analysis</li>
      </ul>

      <h3>3. Upload Your PDF</h3>
      <p><strong>Option A: Drag & Drop</strong></p>
      <ol>
        <li>Drag a PDF file from your file explorer</li>
        <li>Drop it onto the upload zone</li>
        <li>The upload begins automatically</li>
      </ol>

      <p><strong>Option B: Click to Browse</strong></p>
      <ol>
        <li>Click anywhere in the upload zone</li>
        <li>Select a PDF file from the file picker</li>
        <li>Click "Open" to start upload</li>
      </ol>

      <p><strong>File Requirements:</strong></p>
      <ul>
        <li>File type: PDF only</li>
        <li>Maximum size: 500MB</li>
        <li>Must be a valid PDF (not password-protected)</li>
      </ul>

      <h3>4. Monitor Processing</h3>
      <p>Once uploaded, PDFlow automatically begins processing:</p>

      <p><strong>Processing Steps:</strong></p>
      <ol>
        <li>
          <strong>Upload & Conversion</strong> (5-30s)
          <ul>
            <li>PDF uploaded to server</li>
            <li>Pages converted to WebP images</li>
            <li>Session created</li>
          </ul>
        </li>
        <li>
          <strong>AI Extraction</strong> (2-10s per page)
          <ul>
            <li>Each page analyzed by Gemini AI</li>
            <li>Content extracted in chosen format</li>
            <li>Results saved as they complete</li>
          </ul>
        </li>
        <li>
          <strong>Completion</strong>
          <ul>
            <li>All pages processed</li>
            <li>Output viewer appears</li>
            <li>Individual pages available for download</li>
          </ul>
        </li>
      </ol>

      <p><strong>Live Updates:</strong></p>
      <ul>
        <li>Progress bar updates in real-time</li>
        <li>Page count shows completed/total</li>
        <li>Timer shows elapsed processing time</li>
      </ul>

      <h3>5. View & Download Results</h3>
      <p>After processing completes, the output viewer displays results with:</p>
      <ul>
        <li><strong>Grid View</strong> - Visual card layout with quick overview</li>
        <li><strong>List View</strong> - Detailed list format for large documents</li>
      </ul>

      <p><strong>Actions:</strong></p>
      <ul>
        <li><strong>Preview</strong> - View extracted content in browser</li>
        <li><strong>Download</strong> - Download individual page</li>
        <li><strong>Download All</strong> - Download all pages as separate files</li>
        <li><strong>Aggregate Pages</strong> - Combine all pages into one file</li>
      </ul>

      <h3>6. Aggregate Pages (Optional)</h3>
      <p>To combine all pages into a single file:</p>
      <ol>
        <li>Click <strong>"Aggregate Pages"</strong> button</li>
        <li>Wait for aggregation (1-5s)</li>
        <li>Download the combined file</li>
      </ol>

      <p><strong>Aggregated Output Includes:</strong></p>
      <ul>
        <li>Document header with metadata</li>
        <li>All pages in order</li>
        <li>Page separators</li>
        <li>Table of contents (for supported formats)</li>
      </ul>

      <h2>Features</h2>

      <h3>Real-Time Streaming</h3>
      <p>Pages appear as they complete processing - no need to wait for the entire document!</p>
      <ul>
        <li>Start reviewing results immediately</li>
        <li>Download completed pages while others process</li>
        <li>Better user experience for large documents</li>
      </ul>

      <h3>Session Management</h3>
      <p>Each upload creates a unique session with:</p>
      <ul>
        <li>Original PDF</li>
        <li>Converted WebP images</li>
        <li>Extracted content files</li>
        <li>Metadata</li>
      </ul>

      <p><strong>Session Persistence:</strong></p>
      <ul>
        <li>Sessions survive page refreshes</li>
        <li>Resume processing if interrupted</li>
        <li>Automatic cleanup after completion</li>
      </ul>

      <h2>Output Formats</h2>

      <h3>Markdown (.md)</h3>
      <p><strong>Best For:</strong> Documentation, notes, README files</p>
      <ul>
        <li>Clean, readable format</li>
        <li>Headings, lists, code blocks</li>
        <li>Tables and formatting</li>
        <li>GitHub-compatible</li>
      </ul>

      <h3>JSON (.json)</h3>
      <p><strong>Best For:</strong> APIs, data processing, automation</p>
      <ul>
        <li>Structured data format</li>
        <li>Nested objects and arrays</li>
        <li>Metadata included</li>
        <li>Easy to parse programmatically</li>
      </ul>

      <h3>XML (.xml)</h3>
      <p><strong>Best For:</strong> Enterprise systems, SOAP APIs</p>
      <ul>
        <li>Hierarchical structure</li>
        <li>CDATA sections for content</li>
        <li>Namespace support</li>
        <li>Schema validation ready</li>
      </ul>

      <h3>YAML (.yaml)</h3>
      <p><strong>Best For:</strong> Configuration files, data serialization</p>
      <ul>
        <li>Human-readable format</li>
        <li>Comments support</li>
        <li>Clean indentation</li>
        <li>Configuration-friendly</li>
      </ul>

      <h3>HTML (.html)</h3>
      <p><strong>Best For:</strong> Web viewing, archiving, sharing</p>
      <ul>
        <li>Styled output with embedded CSS</li>
        <li>Responsive layout</li>
        <li>Print-friendly</li>
        <li>Standalone file</li>
      </ul>

      <h3>MDX (.mdx)</h3>
      <p><strong>Best For:</strong> React/Next.js documentation, interactive docs</p>
      <ul>
        <li>Markdown + JSX support</li>
        <li>React component imports</li>
        <li>Frontmatter metadata</li>
        <li>Interactive elements</li>
      </ul>

      <h3>CSV (.csv)</h3>
      <p><strong>Best For:</strong> Spreadsheets, data analysis, reporting</p>
      <ul>
        <li>Tabular format</li>
        <li>Excel-compatible</li>
        <li>Easy to import</li>
        <li>Column headers</li>
      </ul>

      <h2>Dark Mode</h2>
      <p>Click the ☀️/🌙 icon in the top-right corner to toggle between light and dark themes.</p>

      <p><strong>Light Mode:</strong> Clean white background, black text, subtle shadows</p>
      <p><strong>Dark Mode:</strong> Dark gray/black background, light text, reduced eye strain</p>

      <p>Your theme preference is saved to localStorage and persists across page refreshes and browser restarts.</p>

      <h2>Troubleshooting</h2>

      <h3>"API Key Required"</h3>
      <p><strong>Solution:</strong></p>
      <ol>
        <li>Click Settings (⚙️)</li>
        <li>Enter your Gemini API key</li>
        <li>Click "Validate & Save"</li>
      </ol>

      <h3>"Upload Failed"</h3>
      <p><strong>Common Causes:</strong></p>
      <ul>
        <li>File too large (&gt;500MB)</li>
        <li>Not a valid PDF</li>
        <li>Network connection lost</li>
        <li>Server timeout</li>
      </ul>

      <p><strong>Solutions:</strong></p>
      <ol>
        <li>Check file size (must be &lt;500MB)</li>
        <li>Verify file is a valid PDF</li>
        <li>Check internet connection</li>
        <li>Try refreshing the page</li>
        <li>Try a different PDF file</li>
      </ol>

      <h3>"Processing Failed"</h3>
      <p><strong>Common Causes:</strong></p>
      <ul>
        <li>Rate limit exceeded</li>
        <li>Network issues</li>
        <li>PDF has no extractable text</li>
        <li>API key quota exhausted</li>
      </ul>

      <p><strong>Solutions:</strong></p>
      <ol>
        <li>Wait 1 minute and try again (rate limits)</li>
        <li>Check internet connection</li>
        <li>Verify PDF contains actual text</li>
        <li>Check API quota in Google AI Studio</li>
      </ol>

      <h2>Tips & Best Practices</h2>

      <h3>For Best Results</h3>
      <ul>
        <li>Use high-quality, text-based PDFs (not scans)</li>
        <li>Choose appropriate format for your use case</li>
        <li>Monitor progress and check for errors</li>
        <li>Track daily API usage and quota</li>
      </ul>

      <h3>Performance Tips</h3>
      <ul>
        <li>Remove unnecessary pages from PDFs</li>
        <li>Compress images in PDF before upload</li>
        <li>Split large documents for better management</li>
        <li>Use stable internet connection</li>
      </ul>

      <h3>Security Best Practices</h3>
      <ul>
        <li>Never share your API key</li>
        <li>Regenerate key if compromised</li>
        <li>Don't upload sensitive documents to public servers</li>
        <li>Use updated browser with security features enabled</li>
      </ul>

      <h2>Common Workflows</h2>

      <h3>Academic Research</h3>
      <ol>
        <li>Upload research paper PDF</li>
        <li>Select Markdown format</li>
        <li>Extract to readable notes</li>
        <li>Aggregate all pages</li>
        <li>Download for annotation</li>
      </ol>

      <h3>Data Entry</h3>
      <ol>
        <li>Upload forms/invoices</li>
        <li>Select CSV or JSON format</li>
        <li>Extract tabular data</li>
        <li>Download individual pages</li>
        <li>Import to spreadsheet/database</li>
      </ol>

      <h3>Documentation</h3>
      <ol>
        <li>Upload manual/guide PDF</li>
        <li>Select MDX or Markdown</li>
        <li>Extract for web docs</li>
        <li>Preview each section</li>
        <li>Integrate into docs site</li>
      </ol>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/docs/cli">CLI Guide</a> - Automate with command line</li>
        <li><a href="/docs/api">API Reference</a> - Build custom integrations</li>
        <li><a href="/docs/troubleshooting">Troubleshooting</a> - Fix common issues</li>
      </ul>
    </>
  );
}
