/**
 * PDFlow PDF Processor
 *
 * Core processing logic for headless PDF extraction.
 * Handles PDF upload, conversion to WebP, and AI extraction.
 *
 * Workflow:
 * 1. Generate unique session ID
 * 2. Convert PDF to PNG images (one per page)
 * 3. Convert PNG images to WebP for efficient multimodal AI processing
 * 4. Extract content from each page using Gemini AI
 * 5. Save outputs in requested format
 * 6. Optionally aggregate all pages into single file
 *
 * @module PDFProcessor
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { extractPage, getPageFiles, isPageExtracted } from '../app/utils/gemini-extractor';
import { aggregatePages } from '../app/utils/aggregator';

export interface ProcessorOptions {
  apiKey: string;
  verbose?: boolean;
}

export interface ProcessOptions {
  pdfPath: string;
  outputDir: string;
  format: 'markdown' | 'json' | 'xml' | 'yaml' | 'html' | 'mdx' | 'csv';
  aggregate?: boolean;
}

export interface ProcessResult {
  sessionId: string;
  totalPages: number;
  processedPages: number;
  processingTime: string;
  outputPath: string;
  aggregated: boolean;
  aggregatedFile?: string;
}

export class PDFProcessor {
  private apiKey: string;
  private verbose: boolean;

  constructor(options: ProcessorOptions) {
    this.apiKey = options.apiKey;
    this.verbose = options.verbose || false;

    // Set API key as environment variable for gemini-extractor to use
    process.env.GEMINI_API_KEY = this.apiKey;
  }

  /**
   * Generate unique session ID for this processing run
   */
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${random}`;
  }

  /**
   * Execute conversion script to convert PDF to WebP images
   */
  private async convertPdfToWebP(pdfPath: string, sessionId: string): Promise<number> {
    this.log('📄 Converting PDF to WebP images...');

    // Create session directories
    const uploadDir = `./uploads/${sessionId}`;
    const pagesDir = `${uploadDir}/pages`;
    fs.mkdirSync(pagesDir, { recursive: true });

    // Copy the PDF to the session directory
    const inputPdfPath = `${uploadDir}/input.pdf`;
    fs.copyFileSync(pdfPath, inputPdfPath);

    // Get the conversion script path
    const scriptPath = path.join(process.cwd(), 'scripts', 'convert-to-webp.sh');

    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Conversion script not found: ${scriptPath}`);
    }

    // Execute the conversion script
    await this.executeScript(scriptPath, inputPdfPath, sessionId);

    // Count the number of generated WebP files
    const pageFiles = fs.readdirSync(pagesDir)
      .filter(file => file.startsWith('page-') && file.endsWith('.webp'));

    const pageCount = pageFiles.length;

    if (pageCount === 0) {
      throw new Error('No WebP images were generated from the PDF');
    }

    this.log(`✓ Successfully converted PDF to ${pageCount} WebP images`);

    return pageCount;
  }

  /**
   * Execute shell script using spawn
   */
  private executeScript(scriptPath: string, inputPath: string, sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(scriptPath, [inputPath, sessionId], {
        cwd: process.cwd(),
        timeout: 120000, // 2 minute timeout
        stdio: this.verbose ? 'inherit' : ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      if (!this.verbose) {
        child.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr?.on('data', (data) => {
          stderr += data.toString();
        });
      }

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Script exited with code ${code}${stderr ? ': ' + stderr : ''}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Extract content from all pages using Gemini AI
   */
  private async extractPages(
    sessionId: string,
    format: ProcessOptions['format'],
    onProgress?: (current: number, total: number) => void
  ): Promise<number> {
    this.log('\n🤖 Extracting content with Gemini AI...');

    const pageFiles = getPageFiles(sessionId);
    let processedCount = 0;

    for (const pageNum of pageFiles) {
      // Skip if already processed
      if (isPageExtracted(sessionId, pageNum)) {
        this.log(`  ⏭️  Skipping already processed page ${pageNum}`, true);
        processedCount++;
        continue;
      }

      // Extract the page
      this.log(`  🔍 Processing page ${pageNum}/${pageFiles.length}...`);
      await extractPage(sessionId, pageNum, format);

      processedCount++;

      if (onProgress) {
        onProgress(processedCount, pageFiles.length);
      }

      this.log(`  ✓ Completed page ${pageNum}/${pageFiles.length}`);
    }

    return processedCount;
  }

  /**
   * Main processing method
   */
  async process(options: ProcessOptions): Promise<ProcessResult> {
    const startTime = Date.now();
    const sessionId = this.generateSessionId();

    try {
      // Step 1: Convert PDF to WebP images
      const pageCount = await this.convertPdfToWebP(options.pdfPath, sessionId);

      // Step 2: Extract content from pages
      const processedCount = await this.extractPages(sessionId, options.format, (current, total) => {
        const percent = Math.round((current / total) * 100);
        process.stdout.write(`\r  Progress: ${current}/${total} pages (${percent}%)  `);
      });

      console.log(''); // New line after progress

      // Step 3: Copy outputs to requested output directory
      const outputPath = path.join(options.outputDir, sessionId);
      fs.mkdirSync(outputPath, { recursive: true });

      const sourceOutputDir = `./outputs/${sessionId}`;
      if (fs.existsSync(sourceOutputDir)) {
        const files = fs.readdirSync(sourceOutputDir);
        for (const file of files) {
          const srcPath = path.join(sourceOutputDir, file);
          const destPath = path.join(outputPath, file);
          fs.copyFileSync(srcPath, destPath);
        }
      }

      // Step 4: Aggregate if requested
      let aggregatedFile: string | undefined;
      if (options.aggregate) {
        this.log('\n📚 Aggregating all pages into single file...');
        await aggregatePages(sessionId, options.format);

        // Copy aggregated file to output directory
        const sourceAggregatedFile = `${sourceOutputDir}/full.${options.format}`;
        if (fs.existsSync(sourceAggregatedFile)) {
          const aggregatedFileName = `full.${options.format}`;
          aggregatedFile = path.join(outputPath, aggregatedFileName);
          fs.copyFileSync(sourceAggregatedFile, aggregatedFile);
          this.log(`  ✓ Created: ${aggregatedFileName}`);
        }
      }

      const endTime = Date.now();
      const processingTime = ((endTime - startTime) / 1000).toFixed(2) + 's';

      return {
        sessionId,
        totalPages: pageCount,
        processedPages: processedCount,
        processingTime,
        outputPath,
        aggregated: !!aggregatedFile,
        aggregatedFile,
      };

    } catch (error) {
      // Clean up on error
      this.log(`\n❌ Error during processing: ${error instanceof Error ? error.message : error}`);
      throw error;
    }
  }

  /**
   * Log helper method
   */
  private log(message: string, verboseOnly: boolean = false): void {
    if (!verboseOnly || this.verbose) {
      console.log(message);
    }
  }
}
