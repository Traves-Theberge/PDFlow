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
  .version('0.3.0');

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
