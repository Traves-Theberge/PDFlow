import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { extractPage, getPageFiles, isExtractionComplete, isPageExtracted } from '@/app/utils/gemini-extractor';
import { aggregatePages } from '@/app/utils/aggregator';

/**
 * PDF Processing API Route
 *
 * This route handles the AI-powered extraction of PDF content using Google Gemini.
 * It processes PDF pages that have been converted to WebP images and extracts structured
 * data in various formats (Markdown, JSON, XML, etc.).
 *
 * Endpoints:
 * - POST: Start or resume processing for a session
 * - GET: Check processing progress for a session
 */

// Schema for request validation
const ProcessRequestSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  format: z.enum(['markdown', 'json', 'xml', 'html', 'yaml', 'mdx']).optional().default('markdown'),
  aggregate: z.boolean().optional().default(false),
});

/**
 * In-memory progress tracking for active sessions
 *
 * Note: This is stored in memory and will be lost on server restart.
 * For production, consider using Redis or a database for persistence.
 */
const sessionProgress = new Map<string, {
  totalPages: number;          // Total number of pages in the PDF
  processedPages: number;       // Number of pages successfully processed
  status: 'processing' | 'completed' | 'error';  // Current processing status
  error?: string;               // Error message if status is 'error'
  startTime: number;            // Timestamp when processing started (for performance metrics)
}>();

/**
 * POST /api/process
 *
 * Processes PDF pages for a given session using AI extraction.
 * This endpoint can be called multiple times - it will resume from where it left off.
 *
 * @param {string} sessionId - Unique session identifier from upload
 * @param {string} format - Output format (markdown, json, xml, html, yaml, mdx)
 * @param {boolean} aggregate - Whether to combine all pages into a single file
 *
 * @returns {Object} Processing status and results
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = ProcessRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, format, aggregate } = validation.data;

    // Retrieve page files from the session directory
    // These are the WebP images created during PDF upload
    const pageFiles = getPageFiles(sessionId);

    if (pageFiles.length === 0) {
      return NextResponse.json(
        { error: 'No pages found for this session. Please upload a PDF first.' },
        { status: 404 }
      );
    }

    // Initialize or get progress tracking
    if (!sessionProgress.has(sessionId)) {
      sessionProgress.set(sessionId, {
        totalPages: pageFiles.length,
        processedPages: 0,
        status: 'processing',
        startTime: Date.now(),
      });
    }

    const progress = sessionProgress.get(sessionId)!;

    // Check if already completed
    if (progress.status === 'completed') {
      return NextResponse.json({
        sessionId,
        status: 'completed',
        totalPages: progress.totalPages,
        processedPages: progress.processedPages,
        message: 'Processing already completed',
        aggregate: aggregate ? await getAggregatedInfo(sessionId) : null,
      });
    }

    // Process pages that haven't been processed yet
    const processedPages = [];
    let errorOccurred = false;

    for (const pageNum of pageFiles) {
      try {
        // Check if this page is already processed
        if (isPageExtracted(sessionId, pageNum)) {
          processedPages.push(pageNum);
          console.log(`Skipping already processed page ${pageNum}`);
          continue;
        }

        // Extract the page with the specified format
        console.log(`Processing page ${pageNum}/${pageFiles.length} for session ${sessionId}`);
        await extractPage(sessionId, pageNum, format);
        processedPages.push(pageNum);

        // Update progress
        progress.processedPages = processedPages.length;

        console.log(`✓ Completed page ${pageNum}/${pageFiles.length} for session ${sessionId}`);

      } catch (error) {
        console.error(`✗ Error processing page ${pageNum}:`, error);
        errorOccurred = true;

        // Continue processing other pages even if one fails
        continue;
      }
    }

    // Update final status
    if (errorOccurred) {
      progress.status = 'error';
      progress.error = 'Some pages failed to process';
    } else {
      progress.status = 'completed';
    }

    // Aggregate if requested
    let aggregationResult = null;
    if (aggregate && progress.status === 'completed') {
      try {
        aggregationResult = await aggregatePages(sessionId, format);
      } catch (error) {
        console.error('Aggregation error:', error);
        aggregationResult = {
          error: 'Failed to aggregate pages',
          details: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    const processingTime = Date.now() - progress.startTime;

    return NextResponse.json({
      sessionId,
      status: progress.status,
      totalPages: progress.totalPages,
      processedPages: progress.processedPages,
      processingTime: `${(processingTime / 1000).toFixed(2)}s`,
      message: progress.status === 'completed' 
        ? 'All pages processed successfully' 
        : progress.status === 'error'
        ? 'Processing completed with errors'
        : 'Processing in progress',
      aggregate: aggregationResult,
      error: progress.error,
    });

  } catch (error) {
    console.error('Process error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error during processing',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const progress = sessionProgress.get(sessionId);
    
    if (!progress) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get current page files
    const pageFiles = getPageFiles(sessionId);
    const processedCount = pageFiles.filter(pageNum =>
      isPageExtracted(sessionId, pageNum)
    ).length;

    return NextResponse.json({
      sessionId,
      status: progress.status,
      totalPages: progress.totalPages,
      processedPages: processedCount,
      processingTime: progress.startTime ? `${((Date.now() - progress.startTime) / 1000).toFixed(2)}s` : null,
      error: progress.error,
    });

  } catch (error) {
    console.error('Progress check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to get aggregated info
async function getAggregatedInfo(sessionId: string) {
  try {
    const outputDir = `./outputs/${sessionId}`;
    const fs = await import('fs');
    
    if (fs.existsSync(`${outputDir}/metadata.json`)) {
      const metadata = JSON.parse(fs.readFileSync(`${outputDir}/metadata.json`, 'utf-8'));
      return {
        available: true,
        format: metadata.format,
        totalPages: metadata.totalPages,
        createdAt: metadata.metadata.createdAt,
        totalCharacters: metadata.metadata.totalCharacters,
      };
    }
    
    return { available: false };
  } catch (error) {
    return { available: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}