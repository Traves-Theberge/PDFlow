'use client';

import { useEffect, useState } from 'react';

export default function DocsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = typeof window !== 'undefined' ? localStorage.getItem('darkMode') === 'true' : false;
    setDarkMode(isDark);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <img
          src="/PDFlow_Logo_W_Text.png"
          alt="PDFlow"
          className="h-60 w-auto"
        />
      </div>

      <h1>PDFlow Documentation</h1>
      <p className="lead">
        Welcome to PDFlow - an AI-powered PDF extraction tool that converts complex PDFs into structured, editable formats using Google Gemini's multimodal AI.
      </p>

      <h2>What is PDFlow?</h2>
      <p>
        PDFlow is a comprehensive solution for extracting content from PDFs. It combines the power of:
      </p>
      <ul>
        <li><strong>🤖 AI Vision</strong>: Google Gemini 2.0 Flash for multimodal understanding</li>
        <li><strong>🎨 Modern UI</strong>: Beautiful web interface built with Next.js</li>
        <li><strong>⚡ CLI Tool</strong>: Command-line interface for automation</li>
        <li><strong>🔌 MCP Integration</strong>: Model Context Protocol for AI agents</li>
        <li><strong>🐳 Docker Ready</strong>: Containerized deployment with security in mind</li>
      </ul>

      <h2>Key Features</h2>

      <h3>Multiple Output Formats</h3>
      <p>Extract to:</p>
      <ul>
        <li><strong>Markdown</strong> - Clean, readable text with formatting</li>
        <li><strong>JSON</strong> - Structured data for programmatic use</li>
        <li><strong>XML</strong> - Standard markup language</li>
        <li><strong>HTML</strong> - Web-ready content</li>
        <li><strong>YAML</strong> - Configuration-friendly format</li>
        <li><strong>MDX</strong> - Markdown with JSX components</li>
      </ul>

      <h3>Flexible Deployment</h3>
      <ul>
        <li><strong>Web Interface</strong> - Use directly in your browser</li>
        <li><strong>CLI</strong> - Automate with command-line tools</li>
        <li><strong>Docker</strong> - Deploy anywhere with containers</li>
        <li><strong>API</strong> - RESTful API for custom integrations</li>
      </ul>

      <h3>AI Agent Integration</h3>
      <ul>
        <li><strong>MCP Server</strong> - Connect with Claude and other AI assistants</li>
        <li><strong>API</strong> - Build custom integrations</li>
        <li><strong>Webhooks</strong> - Async processing notifications</li>
      </ul>

      <h2>Quick Start</h2>

      <h3>Web Interface</h3>
      <pre><code>{`# Clone and install
git clone https://github.com/traves-theberge/pdflow.git
cd pdflow
npm install

# Set your API key
echo "GEMINI_API_KEY=your-key-here" > .env

# Start the server
npm run dev

# Open http://localhost:3001`}</code></pre>

      <h3>CLI</h3>
      <pre><code>{`# Build the CLI
npm run cli:build

# Extract a PDF
npm run pdflow -- extract document.pdf --format markdown --aggregate`}</code></pre>

      <h3>Docker</h3>
      <pre><code>{`# Quick start
docker-compose up -d

# Access at http://localhost:3535`}</code></pre>

      <h2>Use Cases</h2>

      <h3>📚 Document Processing</h3>
      <ul>
        <li>Extract text from scanned documents</li>
        <li>Convert research papers to markdown</li>
        <li>Digitize old documents</li>
      </ul>

      <h3>💼 Business Automation</h3>
      <ul>
        <li>Process invoices and receipts</li>
        <li>Extract data from contracts</li>
        <li>Automate form processing</li>
      </ul>

      <h3>🤖 AI Workflows</h3>
      <ul>
        <li>Feed PDFs to AI assistants</li>
        <li>Build document analysis pipelines</li>
        <li>Create knowledge bases from PDFs</li>
      </ul>

      <h3>🔬 Research</h3>
      <ul>
        <li>Extract data from academic papers</li>
        <li>Convert figures to structured data</li>
        <li>Build citation databases</li>
      </ul>

      <h2>Why PDFlow?</h2>

      <h3>vs Traditional OCR</h3>
      <ul>
        <li>✅ Understands layout and context</li>
        <li>✅ Preserves formatting and structure</li>
        <li>✅ Handles complex documents (tables, figures, equations)</li>
        <li>✅ Multiple output formats</li>
      </ul>

      <h3>vs Manual Extraction</h3>
      <ul>
        <li>⚡ 10-100x faster</li>
        <li>🎯 More accurate</li>
        <li>🔄 Repeatable and consistent</li>
        <li>🤖 Automatable</li>
      </ul>

      <h3>vs Other AI Tools</h3>
      <ul>
        <li>🎨 Beautiful UI included</li>
        <li>⚡ CLI for automation</li>
        <li>🔌 MCP for AI agents</li>
        <li>🐳 Docker deployment</li>
        <li>🔒 Self-hosted (your data stays with you)</li>
      </ul>

      <h2>Community & Support</h2>
      <ul>
        <li><strong>GitHub</strong>: <a href="https://github.com/traves-theberge/pdflow/issues">Report issues</a></li>
        <li><strong>Discussions</strong>: <a href="https://github.com/traves-theberge/pdflow/discussions">Ask questions</a></li>
        <li><strong>Documentation</strong>: You're reading it!</li>
      </ul>

      <h2>License</h2>
      <p>
        PDFlow is open source software licensed under ISC.
      </p>
    </>
  );
}
