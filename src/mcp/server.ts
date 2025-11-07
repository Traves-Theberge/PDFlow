#!/usr/bin/env node
/**
 * PDFlow MCP Server
 *
 * Model Context Protocol server that wraps the PDFlow API,
 * allowing AI agents to extract content from PDFs.
 *
 * This server provides tools for:
 * - Uploading PDFs
 * - Extracting content in various formats
 * - Checking processing status
 * - Retrieving extracted content
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';

/**
 * Configuration
 * Set via environment variables or defaults
 * Note: GEMINI_API_KEY should be configured in PDFlow itself, not here
 */
const PDFLOW_BASE_URL = process.env.PDFLOW_BASE_URL || 'http://localhost:3001';

/**
 * Security: Allowed directories for PDF access
 * Set ALLOWED_DIRECTORIES env var to customize
 * - Colon-separated list: "/home/user/pdfs:/home/user/docs"
 * - "*" to allow all directories (less secure, but more flexible)
 * - Empty/unset: defaults to Documents, Downloads, Desktop
 */
const ALLOW_ALL_DIRECTORIES = process.env.ALLOWED_DIRECTORIES === '*';
const ALLOWED_DIRECTORIES = ALLOW_ALL_DIRECTORIES
  ? []
  : (process.env.ALLOWED_DIRECTORIES || '')
      .split(':')
      .filter(Boolean)
      .map(dir => path.resolve(dir));

// Default allowed directories if none specified and not allowing all
if (!ALLOW_ALL_DIRECTORIES && ALLOWED_DIRECTORIES.length === 0) {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  ALLOWED_DIRECTORIES.push(
    process.cwd(), // Current working directory (where AI tool was launched)
    path.join(homeDir, 'Documents'),
    path.join(homeDir, 'Downloads'),
    path.join(homeDir, 'Desktop')
  );
}

/**
 * Validate that a file path is within allowed directories
 */
function validateFilePath(filePath: string): { valid: boolean; error?: string } {
  // Resolve to absolute path
  const resolved = path.resolve(filePath);

  // Check if file exists
  if (!fs.existsSync(resolved)) {
    return { valid: false, error: `File not found: ${filePath}` };
  }

  // Check if it's a file (not directory)
  const stats = fs.statSync(resolved);
  if (!stats.isFile()) {
    return { valid: false, error: `Path is not a file: ${filePath}` };
  }

  // Check if it's a PDF
  if (path.extname(resolved).toLowerCase() !== '.pdf') {
    return { valid: false, error: `File is not a PDF: ${filePath}` };
  }

  // Check if within allowed directories (skip if allowing all)
  if (!ALLOW_ALL_DIRECTORIES) {
    const isAllowed = ALLOWED_DIRECTORIES.some(allowedDir =>
      resolved.startsWith(allowedDir)
    );

    if (!isAllowed) {
      return {
        valid: false,
        error: `Access denied: File must be in allowed directories: ${ALLOWED_DIRECTORIES.join(', ')}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Fetch wrapper with better error handling
 */
async function fetchWithError(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    throw new Error(
      `Network error: Cannot connect to PDFlow at ${PDFLOW_BASE_URL}. ` +
        `Make sure PDFlow is running and accessible. ` +
        `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * MCP Server instance
 */
const server = new Server(
  {
    name: 'pdflow-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'pdflow_extract_pdf',
        description:
          'Extract structured content from a PDF file using AI-powered extraction. ' +
          'This is the primary tool - it handles the complete workflow: upload, conversion, extraction, and returns the full content. ' +
          'Supports multiple output formats: markdown, json, xml, html, yaml, mdx. ' +
          'Returns the complete extracted content directly - no need to call additional tools. ' +
          'For very large documents, use pdflow_check_status and pdflow_get_results for async processing.',
        inputSchema: {
          type: 'object',
          properties: {
            pdfPath: {
              type: 'string',
              description: 'Absolute path to the PDF file on the local filesystem',
            },
            format: {
              type: 'string',
              enum: ['markdown', 'json', 'xml', 'html', 'yaml', 'mdx'],
              description: 'Output format for extracted content (default: markdown)',
              default: 'markdown',
            },
            aggregate: {
              type: 'boolean',
              description: 'Whether to combine all pages into a single output file (default: true)',
              default: true,
            },
          },
          required: ['pdfPath'],
        },
      },
      {
        name: 'pdflow_check_status',
        description:
          '[OPTIONAL] Check the processing status of a PDF extraction session. ' +
          'Only needed if pdflow_extract_pdf returns "processing" status for large documents. ' +
          'Most PDFs complete immediately and return full content from pdflow_extract_pdf. ' +
          'Returns information about total pages, processed pages, and current status.',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID returned from pdflow_extract_pdf',
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'pdflow_get_results',
        description:
          '[OPTIONAL] Retrieve the extracted content from a completed session. ' +
          'Only needed if you want to re-fetch results or if content was too large to return inline. ' +
          'Most use cases get full content directly from pdflow_extract_pdf. ' +
          'Returns the actual extracted content as text.',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID from a completed extraction',
            },
            format: {
              type: 'string',
              enum: ['markdown', 'json', 'xml', 'html', 'yaml', 'mdx'],
              description: 'Format of the results to retrieve (default: markdown)',
              default: 'markdown',
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'pdflow_health_check',
        description:
          'Check if the PDFlow service is running and accessible. ' +
          'Use this to verify connectivity before attempting PDF extraction.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'pdflow_extract_pdf':
        return await handleExtractPdf(args as any);

      case 'pdflow_check_status':
        return await handleCheckStatus(args as any);

      case 'pdflow_get_results':
        return await handleGetResults(args as any);

      case 'pdflow_health_check':
        return await handleHealthCheck();

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Tool argument types
 */
interface ExtractPdfArgs {
  pdfPath: string;
  format?: 'markdown' | 'json' | 'xml' | 'html' | 'yaml' | 'mdx';
  aggregate?: boolean;
}

interface CheckStatusArgs {
  sessionId: string;
}

interface GetResultsArgs {
  sessionId: string;
  format?: 'markdown' | 'json' | 'xml' | 'html' | 'yaml' | 'mdx';
}

/**
 * Extract PDF - Main workflow
 */
async function handleExtractPdf(args: ExtractPdfArgs) {
  const { pdfPath, format = 'markdown', aggregate = true } = args;

  // Security: Validate file path
  const validation = validateFilePath(pdfPath);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Step 1: Upload PDF using FormData
  const formData = new FormData();
  const fileBuffer = fs.readFileSync(path.resolve(pdfPath));
  const blob = new Blob([fileBuffer], { type: 'application/pdf' });
  formData.append('file', blob, path.basename(pdfPath));

  const uploadResponse = await fetchWithError(`${PDFLOW_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData as any,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`Upload failed (${uploadResponse.status}): ${errorText}`);
  }

  const uploadResult = (await uploadResponse.json()) as any;
  const sessionId = uploadResult.sessionId;

  // Step 2: Process with AI extraction
  const processResponse = await fetchWithError(`${PDFLOW_BASE_URL}/api/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      format,
      aggregate,
    }),
  });

  if (!processResponse.ok) {
    const errorText = await processResponse.text();
    throw new Error(`Processing failed (${processResponse.status}): ${errorText}`);
  }

  const processResult = (await processResponse.json()) as any;

  // Step 3: Get results if processing completed
  let extractedContent = null;
  if (processResult.status === 'completed' && aggregate) {
    try {
      const resultsResponse = await fetchWithError(
        `${PDFLOW_BASE_URL}/api/outputs/${sessionId}/aggregated.${format}`
      );

      if (resultsResponse.ok) {
        extractedContent = await resultsResponse.text();
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
    }
  }

  // Format response - return full content for simplified workflow
  if (processResult.status === 'completed' && extractedContent) {
    // SUCCESS: Return full content directly
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            status: 'completed',
            sessionId,
            totalPages: processResult.totalPages,
            processedPages: processResult.processedPages,
            processingTime: processResult.processingTime,
            format,
            message: `Successfully extracted ${processResult.processedPages} pages from PDF`,
            content: extractedContent, // Full content, not preview
          }, null, 2),
        },
      ],
    };
  } else {
    // PROCESSING or PARTIAL: Return status info
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            status: processResult.status,
            sessionId,
            totalPages: processResult.totalPages,
            processedPages: processResult.processedPages,
            processingTime: processResult.processingTime,
            format,
            aggregate,
            message:
              processResult.status === 'completed'
                ? 'Processing completed. Use pdflow_get_results to retrieve content.'
                : 'Processing in progress. Use pdflow_check_status to monitor progress.',
            nextStep:
              processResult.status === 'completed'
                ? `Use pdflow_get_results with sessionId: ${sessionId}`
                : `Use pdflow_check_status with sessionId: ${sessionId}`,
          }, null, 2),
        },
      ],
    };
  }
}

/**
 * Check processing status
 */
async function handleCheckStatus(args: CheckStatusArgs) {
  const { sessionId } = args;

  const response = await fetchWithError(
    `${PDFLOW_BASE_URL}/api/process?sessionId=${encodeURIComponent(sessionId)}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Status check failed (${response.status}): ${errorText}`);
  }

  const result = (await response.json()) as any;

  const statusInfo = {
    sessionId,
    status: result.status,
    totalPages: result.totalPages,
    processedPages: result.processedPages,
    processingTime: result.processingTime,
    progress: `${((result.processedPages / result.totalPages) * 100).toFixed(1)}%`,
    isComplete: result.status === 'completed',
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(statusInfo, null, 2),
      },
    ],
  };
}

/**
 * Get extraction results
 */
async function handleGetResults(args: GetResultsArgs) {
  const { sessionId, format = 'markdown' } = args;

  // Try to get aggregated results first
  const aggregatedUrl = `${PDFLOW_BASE_URL}/api/outputs/${encodeURIComponent(
    sessionId
  )}/aggregated.${format}`;
  const response = await fetchWithError(aggregatedUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to retrieve results (${response.status}). ` +
        'Make sure the session is completed and aggregation was enabled.'
    );
  }

  const content = await response.text();

  const result = {
    sessionId,
    format,
    contentLength: content.length,
    content,
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

/**
 * Health check
 */
async function handleHealthCheck() {
  try {
    const response = await fetchWithError(`${PDFLOW_BASE_URL}/api/health`);

    if (!response.ok) {
      throw new Error(`Health check failed (${response.status})`);
    }

    const result = (await response.json()) as any;

    const healthInfo = {
      status: 'ok',
      pdflowUrl: PDFLOW_BASE_URL,
      pdflowStatus: result.status,
      timestamp: result.timestamp,
      uptime: `${(result.uptime / 60).toFixed(1)} minutes`,
      allowedDirectories: ALLOW_ALL_DIRECTORIES ? ['* (all directories)'] : ALLOWED_DIRECTORIES,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(healthInfo, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorInfo = {
      status: 'error',
      pdflowUrl: PDFLOW_BASE_URL,
      error: error instanceof Error ? error.message : String(error),
      message:
        'Cannot connect to PDFlow service. Make sure it is running and accessible via Tailscale.',
      troubleshooting: [
        `1. Check if PDFlow is running: curl ${PDFLOW_BASE_URL}/api/health`,
        '2. Verify Tailscale connection: tailscale status',
        `3. Ping Raspberry Pi: ping ${PDFLOW_BASE_URL.match(/\/\/([^:]+)/)?.[1]}`,
        '4. Check Docker on Pi: ssh pi@<tailscale-ip> "docker ps"',
      ],
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(errorInfo, null, 2),
        },
      ],
      isError: true,
    };
  }
}

/**
 * Start the server
 */
async function main() {
  console.error(`PDFlow MCP Server v1.0.0`);
  console.error(`PDFlow URL: ${PDFLOW_BASE_URL}`);
  if (ALLOW_ALL_DIRECTORIES) {
    console.error(`Allowed directories: * (all directories - less secure but more flexible)`);
  } else {
    console.error(`Allowed directories: ${ALLOWED_DIRECTORIES.join(', ')}`);
  }
  console.error('');
  console.error('Note: Gemini API key should be configured in PDFlow, not in MCP config');
  console.error('Starting MCP server on stdio...');

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('PDFlow MCP Server ready');
}

// Handle process signals
process.on('SIGINT', () => {
  console.error('\nShutting down PDFlow MCP Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('\nShutting down PDFlow MCP Server...');
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
