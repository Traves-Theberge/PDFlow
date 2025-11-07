#!/usr/bin/env node

/**
 * PDFlow CLI - Headless PDF Extraction
 *
 * Command-line interface for processing PDFs without the web UI.
 * Extracts structured data from PDF files using Google Gemini AI.
 *
 * Usage:
 *   pdflow extract <pdf-file> [options]
 *   pdflow --help
 *
 * Features:
 * - Headless PDF processing (no web browser required)
 * - Multiple output formats (markdown, json, xml, yaml, html, mdx, csv)
 * - Progress reporting in terminal
 * - Aggregate all pages into single file option
 * - Custom output directory
 *
 * @cli
 */

import { Command } from 'commander';
import { PDFProcessor } from './pdf-processor';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

program
  .name('pdflow')
  .description('PDFlow - AI-powered PDF extraction CLI')
  .version('5.1.0');

/**
 * Extract command - Process a PDF file
 */
program
  .command('extract <pdf-file>')
  .description('Extract structured data from a PDF file')
  .option('-f, --format <format>', 'Output format (markdown|json|xml|yaml|html|mdx|csv)', 'markdown')
  .option('-o, --output <directory>', 'Output directory (default: ./outputs)', './outputs')
  .option('-k, --api-key <key>', 'Gemini API key (or set GEMINI_API_KEY env var)')
  .option('-a, --aggregate', 'Aggregate all pages into a single file', false)
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (pdfFile: string, options) => {
    try {
      // Validate PDF file exists
      if (!fs.existsSync(pdfFile)) {
        console.error(`❌ Error: PDF file not found: ${pdfFile}`);
        process.exit(1);
      }

      // Validate API key
      const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('❌ Error: Gemini API key required');
        console.error('   Provide via --api-key flag or GEMINI_API_KEY environment variable');
        process.exit(1);
      }

      // Validate format
      const validFormats = ['markdown', 'json', 'xml', 'yaml', 'html', 'mdx', 'csv'];
      if (!validFormats.includes(options.format)) {
        console.error(`❌ Error: Invalid format "${options.format}"`);
        console.error(`   Valid formats: ${validFormats.join(', ')}`);
        process.exit(1);
      }

      // Create output directory if it doesn't exist
      if (!fs.existsSync(options.output)) {
        fs.mkdirSync(options.output, { recursive: true });
      }

      console.log('🚀 PDFlow CLI - Starting PDF extraction\n');
      console.log(`📄 File: ${path.basename(pdfFile)}`);
      console.log(`📊 Format: ${options.format}`);
      console.log(`📁 Output: ${options.output}`);
      console.log(`🔄 Aggregate: ${options.aggregate ? 'Yes' : 'No'}`);
      console.log('');

      // Initialize processor
      const processor = new PDFProcessor({
        apiKey,
        verbose: options.verbose,
      });

      // Process the PDF
      const result = await processor.process({
        pdfPath: pdfFile,
        outputDir: options.output,
        format: options.format as any,
        aggregate: options.aggregate,
      });

      console.log('\n✅ Processing complete!');
      console.log(`📊 Total pages: ${result.totalPages}`);
      console.log(`⏱️  Processing time: ${result.processingTime}`);
      console.log(`📁 Output directory: ${result.outputPath}`);

      if (result.aggregated) {
        console.log(`📄 Aggregated file: ${result.aggregatedFile}`);
      }

      process.exit(0);

    } catch (error) {
      console.error('\n❌ Error during processing:', error instanceof Error ? error.message : error);
      if (options.verbose && error instanceof Error && error.stack) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

/**
 * MCP Config command - Generate MCP server configuration
 */
program
  .command('mcp-config')
  .description('Generate MCP server configuration for AI tools')
  .option('-t, --tool <tool>', 'AI tool (claude-desktop|claude-code|cursor|vscode)', 'claude-desktop')
  .option('-u, --url <url>', 'PDFlow base URL', 'http://localhost:3535')
  .option('--dev', 'Use local development URL (http://localhost:3001)', false)
  .action(async (options) => {
    try {
      // Determine PDFlow URL
      const pdflowUrl = options.dev ? 'http://localhost:3001' : options.url;

      // Get absolute path to MCP server
      const mcpServerPath = path.resolve(__dirname, '../../src/mcp/dist/server.js');

      // Generate config based on tool
      const config = {
        mcpServers: {
          pdflow: {
            command: 'node',
            args: [mcpServerPath],
            env: {
              PDFLOW_BASE_URL: pdflowUrl
            }
          }
        }
      };

      console.log('🔧 PDFlow MCP Configuration\n');
      console.log(`Tool: ${options.tool}`);
      console.log(`PDFlow URL: ${pdflowUrl}`);
      console.log(`MCP Server: ${mcpServerPath}\n`);

      // Show config file location based on tool
      let configPath = '';
      switch (options.tool) {
        case 'claude-desktop':
          if (process.platform === 'darwin') {
            configPath = '~/Library/Application Support/Claude/claude_desktop_config.json';
          } else if (process.platform === 'win32') {
            configPath = '%APPDATA%\\Claude\\claude_desktop_config.json';
          } else {
            configPath = '~/.config/Claude/claude_desktop_config.json';
          }
          break;
        case 'claude-code':
          if (process.platform === 'win32') {
            configPath = '%USERPROFILE%\\.claude\\claude_code_config.json';
          } else {
            configPath = '~/.claude/claude_code_config.json';
          }
          break;
        case 'cursor':
          if (process.platform === 'darwin') {
            configPath = '~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json';
          } else if (process.platform === 'win32') {
            configPath = '%APPDATA%\\Cursor\\User\\globalStorage\\saoudrizwan.claude-dev\\settings\\cline_mcp_settings.json';
          } else {
            configPath = '~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json';
          }
          break;
        case 'vscode':
          if (process.platform === 'darwin') {
            configPath = '~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json';
          } else if (process.platform === 'win32') {
            configPath = '%APPDATA%\\Code\\User\\globalStorage\\saoudrizwan.claude-dev\\settings\\cline_mcp_settings.json';
          } else {
            configPath = '~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json';
          }
          break;
      }

      console.log(`📁 Config file location:\n   ${configPath}\n`);
      console.log('📋 Configuration:\n');
      console.log(JSON.stringify(config, null, 2));
      console.log('\n💡 Tips:');
      console.log('   • Make sure to build the MCP server first: cd src/mcp && npm run build');
      console.log('   • Use --dev flag to connect to local development (port 3001)');
      console.log('   • Use --url to specify a custom PDFlow URL (e.g., Tailscale)');
      console.log('   • Completely restart your AI tool after updating the config');
      console.log('\n📖 Documentation: http://localhost:3001/docs/ai-tools');

      process.exit(0);

    } catch (error) {
      console.error('❌ Error generating MCP config:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

/**
 * Validate command - Check if Gemini API key is valid
 */
program
  .command('validate-key')
  .description('Validate a Gemini API key')
  .option('-k, --api-key <key>', 'Gemini API key to validate')
  .action(async (options) => {
    try {
      const apiKey = options.apiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.error('❌ Error: API key required');
        console.error('   Provide via --api-key flag or GEMINI_API_KEY environment variable');
        process.exit(1);
      }

      console.log('🔑 Validating Gemini API key...');

      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      // Test the API key with a simple request
      const result = await model.generateContent('Hello');
      await result.response;

      console.log('✅ API key is valid!');
      process.exit(0);

    } catch (error) {
      console.error('❌ API key is invalid or there was a connection error');
      console.error('   Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Parse command-line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
