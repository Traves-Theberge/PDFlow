export default function CLIPage() {
  return (
    <>
      <h1>CLI Usage Guide</h1>
      <p className="lead">
        Complete guide for using PDFlow's command-line interface for headless PDF extraction.
      </p>

      <h2>Installation</h2>
      <p>PDFlow CLI is included with the main PDFlow installation. No additional setup required.</p>

      <h3>Prerequisites</h3>
      <ul>
        <li>Node.js 18+</li>
        <li>poppler-utils (for PDF conversion)</li>
        <li>Google Gemini API key</li>
      </ul>

      <h3>Install poppler-utils</h3>
      <p><strong>Ubuntu/Debian:</strong></p>
      <pre><code>sudo apt-get install poppler-utils imagemagick</code></pre>

      <p><strong>macOS:</strong></p>
      <pre><code>brew install poppler imagemagick</code></pre>

      <h2>Quick Start</h2>
      <pre><code>{`# Set your API key (recommended)
export GEMINI_API_KEY="your-api-key-here"

# Extract a PDF to markdown
npm run pdflow -- extract document.pdf

# Extract with aggregation (combines all pages)
npm run pdflow -- extract document.pdf -a

# Extract to JSON format
npm run pdflow -- extract document.pdf -f json`}</code></pre>

      <h2>Commands</h2>

      <h3>extract</h3>
      <p>Extract structured data from a PDF file.</p>
      <pre><code>npm run pdflow -- extract &lt;pdf-file&gt; [options]</code></pre>

      <p><strong>Arguments:</strong></p>
      <ul>
        <li><code>&lt;pdf-file&gt;</code> - Path to the PDF file to process (required)</li>
      </ul>

      <h3>validate-key</h3>
      <p>Validate your Gemini API key before processing.</p>
      <pre><code>npm run pdflow -- validate-key [options]</code></pre>

      <h3>--help</h3>
      <p>Display help information for any command.</p>
      <pre><code>{`npm run pdflow -- --help
npm run pdflow -- extract --help`}</code></pre>

      <h3>--version</h3>
      <p>Display the current version of PDFlow CLI.</p>
      <pre><code>npm run pdflow -- --version</code></pre>

      <h2>Options</h2>

      <h3>-f, --format &lt;format&gt;</h3>
      <p>Specify the output format for extracted content.</p>

      <p><strong>Available formats:</strong></p>
      <ul>
        <li><code>markdown</code> (default) - Clean markdown with headings and formatting</li>
        <li><code>json</code> - Structured JSON with metadata</li>
        <li><code>xml</code> - XML format with CDATA sections</li>
        <li><code>yaml</code> - YAML format for configuration files</li>
        <li><code>html</code> - Styled HTML document</li>
        <li><code>mdx</code> - MDX format for React/Next.js</li>
        <li><code>csv</code> - CSV format for tabular data</li>
      </ul>

      <p><strong>Example:</strong></p>
      <pre><code>npm run pdflow -- extract document.pdf -f json</code></pre>

      <h3>-o, --output &lt;directory&gt;</h3>
      <p>Specify the output directory for results.</p>
      <p><strong>Default:</strong> <code>./outputs</code></p>

      <p><strong>Example:</strong></p>
      <pre><code>npm run pdflow -- extract document.pdf -o ./my-results</code></pre>

      <h3>-k, --api-key &lt;key&gt;</h3>
      <p>Provide your Gemini API key via command line.</p>
      <p><strong>Recommended:</strong> Use environment variable instead for security.</p>

      <p><strong>Example:</strong></p>
      <pre><code>npm run pdflow -- extract document.pdf -k "your-api-key"</code></pre>

      <h3>-a, --aggregate</h3>
      <p>Combine all pages into a single output file.</p>

      <p><strong>Benefits:</strong></p>
      <ul>
        <li>Single file for entire document</li>
        <li>Includes metadata header</li>
        <li>Maintains page order</li>
        <li>Easier to share and view</li>
      </ul>

      <p><strong>Example:</strong></p>
      <pre><code>npm run pdflow -- extract document.pdf -a</code></pre>

      <h3>-v, --verbose</h3>
      <p>Show verbose output with detailed processing information.</p>

      <p><strong>Example:</strong></p>
      <pre><code>npm run pdflow -- extract document.pdf -v</code></pre>

      <h2>Examples</h2>

      <h3>Basic Extraction</h3>
      <p>Extract a PDF to markdown format:</p>
      <pre><code>npm run pdflow -- extract invoice.pdf</code></pre>

      <h3>Multi-Format Extraction</h3>
      <p>Extract the same PDF to multiple formats:</p>
      <pre><code>{`# Markdown
npm run pdflow -- extract report.pdf -f markdown -o ./results/md

# JSON
npm run pdflow -- extract report.pdf -f json -o ./results/json

# HTML
npm run pdflow -- extract report.pdf -f html -o ./results/html`}</code></pre>

      <h3>Aggregated Output</h3>
      <p>Combine all pages into a single file:</p>
      <pre><code>npm run pdflow -- extract book.pdf -f markdown -a -o ./book-output</code></pre>

      <h3>Batch Processing</h3>
      <p>Process multiple PDFs in a loop:</p>
      <pre><code>{`#!/bin/bash
for pdf in documents/*.pdf; do
  echo "Processing: $pdf"
  npm run pdflow -- extract "$pdf" -f json -a -o ./results
done`}</code></pre>

      <h2>API Key Management</h2>

      <h3>Environment Variable (Recommended)</h3>
      <p>Set the API key as an environment variable:</p>

      <p><strong>Linux/macOS:</strong></p>
      <pre><code>{`export GEMINI_API_KEY="your-api-key-here"
npm run pdflow -- extract document.pdf`}</code></pre>

      <p><strong>Windows (PowerShell):</strong></p>
      <pre><code>{`$env:GEMINI_API_KEY="your-api-key-here"
npm run pdflow -- extract document.pdf`}</code></pre>

      <h3>.env File (Development)</h3>
      <p>Create a <code>.env.local</code> file in the project root:</p>
      <pre><code>GEMINI_API_KEY=your-api-key-here</code></pre>

      <h2>Troubleshooting</h2>

      <h3>"Command not found: pdftocairo"</h3>
      <p>Install poppler-utils using the instructions at the top of this page.</p>

      <h3>"API key not found"</h3>
      <p>Make sure the <code>GEMINI_API_KEY</code> environment variable is set:</p>
      <pre><code>echo $GEMINI_API_KEY  # Should show your API key</code></pre>

      <h3>"Permission denied"</h3>
      <p>Make sure you have write permissions for the output directory:</p>
      <pre><code>chmod +w ./outputs</code></pre>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/docs/api">API Reference</a> - Build custom integrations</li>
        <li><a href="/docs/docker">Docker Guide</a> - Containerized deployment</li>
        <li><a href="/docs/troubleshooting">Troubleshooting</a> - Fix common issues</li>
      </ul>
    </>
  );
}
