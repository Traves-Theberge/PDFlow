# Changelog

All notable changes to PDFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2025-11-06

### Added - Comprehensive Logging System
- 📋 **Dual-output logging infrastructure** with console and file logging
- 📁 **Persistent log storage** via Docker volume mount (`./logs` directory)
- 🐳 **Docker logging driver configuration** with automatic rotation (10MB max per file, 3 files retained)
- 🛠️ **Log viewer helper script** (`scripts/view-logs.sh`) with filtering options:
  - Real-time log following (`--follow`)
  - Error-only filtering (`--errors`)
  - Session-based filtering (`--session <id>`)
  - Docker log integration (`--docker`)
  - Customizable line limits (`--last <n>`)
- 📚 **Complete logging documentation** (`docs/LOGGING.md`) with:
  - Log viewing methods and commands
  - Advanced filtering examples
  - Performance monitoring guides
  - Troubleshooting procedures
  - Configuration reference
- 🎯 **Environment variable controls**:
  - `LOG_LEVEL` - Control logging verbosity (debug|info|warn|error|critical)
  - `ENABLE_FILE_LOGGING` - Toggle file-based logging
  - `LOG_RETENTION_DAYS` - Configurable log retention (default: 7 days)
- 🔍 **Enhanced error context capture** for debugging "Script exited with code 1" type errors
- 📊 **Structured log format** with timestamps, log levels, components, and JSON context
- 🔄 **Log rotation support** with daily log files (`pdflow-YYYY-MM-DD.log`)

### Changed
- 📦 Updated `Dockerfile` to create `/app/logs` directory with proper permissions
- 🐳 Updated `docker-compose.yml` to mount logs volume and configure logging driver
- 📝 Updated `.gitignore` to exclude logs directory while preserving structure
- 🔧 Enhanced `pdf-processor.ts` error capture for better shell script debugging

## [Unreleased] - 2025-01-15

### Added - Documentation Website (Latest)
- 📚 Complete documentation website rebuild with 13 comprehensive pages
- 🎨 Professional docs layout with responsive sidebar navigation and scrolling
- 🌓 Full light/dark mode support matching main application design
- 📖 Documentation sections:
  - Getting Started: Introduction, Quick Start, Installation
  - Core Features: Web Interface, CLI Usage, API Reference
  - Deployment: Docker
  - AI Integration: MCP Server, Claude Desktop, Custom Integrations
  - Advanced: Security, Performance, Troubleshooting
- 💅 Custom prose styling for optimal readability in both themes
- 🖼️ Logo integration with proper color inversion for theme consistency
- 🔗 Clickable breadcrumbs and navigation with active state highlighting
- 📱 Mobile-responsive design with hidden sidebar on small screens

### Added - Docker & Deployment
- 🐳 Multi-stage Dockerfile with production optimizations
- 📦 Docker Compose configuration with security hardening
- 📚 Comprehensive Docker deployment guide (700+ lines)
- 🏥 Health check endpoint (`/api/health`)
- 🔧 Auto-start systemd service configuration

### Added - MCP Integration
- 🤖 Model Context Protocol server implementation
- 🔌 4 MCP tools: extract_pdf, check_status, get_results, health_check
- 🔐 File path validation and security sandbox
- 📖 Complete MCP integration guide with Claude Desktop setup
- ⚡ Proper SDK implementation with TypeScript types
- 🛡️ Security features: allowed directories, error handling, validation

### Added - Security
- 🔐 Comprehensive security analysis document
- 🛡️ File path validation in MCP server
- 🔒 Docker security hardening (non-root user, read-only filesystem)
- 📋 Threat model and attack scenario analysis
- ✅ Security recommendations prioritized by severity

### Changed
- 🎨 Removed Raspberry Pi and Tailscale documentation sections
- 📝 Converted all documentation from MDX to TSX for Next.js 16 Turbopack compatibility
- 🎨 Implemented manual dark mode class switching instead of Tailwind's dark: variant
- 💅 Created separate `.docs-content-light` and `.docs-content-dark` CSS classes for proper theme support
- 🔤 Optimized body text colors for better readability (text-neutral-600 in light mode)
- 📦 Removed @next/mdx and MDX-related dependencies
- 🎨 Enhanced README with updated documentation links
- ⚙️ Updated globals.css with comprehensive documentation styling

## [0.3.0] - 2025-11-05

### Added
- **CLI (Command Line Interface)**: Headless PDF processing without web UI
  - `pdflow extract` command for PDF extraction with multiple format support
  - `pdflow validate-key` command for API key validation
  - Progress reporting in terminal with real-time updates
  - Support for all output formats (markdown, json, xml, yaml, html, mdx, csv)
  - Aggregation option (`-a` flag) to combine all pages into single file
  - Verbose mode (`-v` flag) for detailed output
  - Custom output directory support
  - Environment variable or command-line API key configuration
- **PDF Processor Module**: Shared processing logic for both web and CLI
  - Uses existing conversion scripts (convert-to-webp.sh)
  - Reuses Gemini extraction utilities
  - Session-based file management
  - Graceful error handling with fallback data
- **TypeScript Execution**: Added tsx for direct TypeScript execution
- **Commander.js**: CLI framework for argument parsing and command handling
- **Documentation**: Updated README with comprehensive CLI usage instructions and examples

### Improved
- **Code Documentation**: Added JSDoc documentation to core components
  - page.tsx: Main application page (~85% documented)
  - validate-key/route.ts: API key validation endpoint (~85% documented)
  - UploadForm.tsx: File upload component (~85% documented)
  - EnhancedOutputViewer.tsx: Output viewer component (~85% documented)
  - Overall documentation coverage increased from ~55% to ~80-85%

## [0.2.0] - 2025-01-05

### Security Fixes
- **CRITICAL: Fixed Command Injection Vulnerability**: Replaced `execAsync()` with `spawn()` in upload route to prevent shell command injection attacks
- **CRITICAL: Added File Size Limits**: Implemented 500MB maximum file size limit to prevent DoS attacks while supporting large PDFs
- **CRITICAL: Enhanced Path Traversal Protection**: Added regex validation and path resolution checks to prevent directory traversal attacks
- **CRITICAL: Added PDF Magic Number Validation**: Validates PDF file signatures (`%PDF`) to prevent malicious files disguised as PDFs
- **Cryptographically Secure Session IDs**: Replaced `Math.random()` with `crypto.randomBytes(16)` for unpredictable session identifiers

### Added
- **Dark Mode**: Full dark mode support with localStorage persistence across all components
  - Toggle button in header with sun/moon icons
  - Conditional styling for all UI components
  - Smooth transitions between light and dark themes
  - Black/white/grey minimal aesthetic in both modes
- **Enhanced Output Formats**: Added support for MDX, YAML, and CSV formats
  - Total of 7 formats now supported: Markdown, MDX, JSON, XML, YAML, HTML, CSV
  - Each format has dedicated Handlebars templates
  - Format parameter properly passed through extraction pipeline
- **Real-time Threaded Output**: New EnhancedOutputViewer component
  - Pages display as they complete processing
  - Grid and list view modes
  - Individual page download capability
  - Download all pages combined
  - Page-by-page progress indicators
  - Content preview for each page
- **Settings Modal**: New Settings component for API key management
  - Validate API key before saving
  - Store API key in session storage
  - Clear API key functionality
  - Security notice about storage location
  - Dark mode support
- **Brand Identity**: Added PDFlow logo assets
  - Logo with text for hero section
  - Logo icon only for header
  - Automatic color inversion in light mode
  - Click logo to return home
- **API Key Validation**: New endpoint to validate Gemini API keys
  - `/api/settings/validate-key` POST endpoint
  - Tests connection to Gemini API
  - Provides feedback before saving
- **GitHub Integration**: Added GitHub repository link in header for easy access to source code
- **Open Graph Meta Tags**: Complete social media preview support with proper OG and Twitter Card tags for link sharing

### Changed
- **Complete UI Redesign**: Implemented shadcn-inspired minimal aesthetic
  - Reduced font sizes for cleaner look
  - Minimal padding and spacing
  - Pure black/white color scheme with neutral grays
  - Removed gradients and heavy shadows
  - Consistent border styling throughout
- **Updated Components**: All components redesigned with minimal styling
  - [page.tsx](src/app/page.tsx): Main page with dark mode and logo
  - [ProgressBar.tsx](src/app/components/ProgressBar.tsx): Minimal progress tracking
  - [EnhancedOutputViewer.tsx](src/app/components/EnhancedOutputViewer.tsx): Real-time output display
  - [Settings.tsx](src/app/components/Settings.tsx): API key management modal
  - [UploadForm.tsx](src/app/components/UploadForm.tsx): Minimal file upload
- **Improved Format Handling**: Fixed format parameter not being passed to extraction
  - [route.ts:83](src/app/api/process/route.ts#L83): Now properly passes format to `extractPage()`
  - Files save with correct extensions (.md, .json, .xml, .html, .csv, .yaml, .mdx)
- **Enhanced Templates**: Updated Markdown and MDX templates
  - Added critical instructions to NOT wrap output in code fences
  - Improved clarity on raw output expectations
  - Better image handling instructions
- **Logo Integration**: Updated header and hero section with PNG logos
  - Header uses logo icon only
  - Hero section uses logo with text
  - Responsive sizing (h-7 header, h-20 hero)
  - Color inversion for light mode

### Fixed
- **Format Selection Bug**: Files were saving as .md regardless of selected format
  - Root cause: format parameter not passed to extraction function
  - Fix: Updated `/api/process` route to pass format parameter
- **Dark Mode Consistency**: Ensured all components support dark mode
  - Added darkMode prop to all child components
  - Consistent color usage across components
  - Proper contrast ratios in both modes
- **Progress Tracking Bug**: Fixed progress bar showing incorrect page numbers
  - Root cause: `isExtractionComplete()` called with wrong parameters
  - Created `isPageExtracted()` function for individual page checking
  - Improved console logging for better debugging
- **Branding Consistency**: Changed all references from "PDF Intelligence" to "PDFlow"
  - Updated package.json name field
  - Updated page titles and meta tags
  - Consistent branding across all UI elements

### Technical Details
- **State Management**: Dark mode preference saved to localStorage
- **Session Storage**: API keys stored in browser session storage
- **Color Palette**:
  - Light mode: white, black, neutral-50 through neutral-700
  - Dark mode: neutral-950, neutral-900, neutral-800 through neutral-400
- **Animations**: Framer Motion animations maintained throughout
- **Type Safety**: Full TypeScript implementation with proper typing

## [0.1.0] - 2024-12-XX

### Added
- Initial release of PDFlow
- PDF upload with drag-and-drop interface
- PDF to WebP conversion using pdftocairo
- Google Gemini 2.0 Flash multimodal AI extraction
- Support for Markdown, JSON, XML, and HTML formats
- Real-time progress tracking
- Zustand state management
- Handlebars template system
- Next.js 16.0.1 with React 19
- TailwindCSS 4 styling
- Framer Motion animations
- Zod validation
- TypeScript implementation

---

## Version History

### [0.2.0] - Current Version
Major UI redesign with dark mode, enhanced output formats, and improved UX

### [0.1.0] - Initial Release
Core PDF extraction functionality with multimodal AI
