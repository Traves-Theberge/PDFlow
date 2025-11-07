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
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
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
 * Only files in these directories can be processed
 */
const ALLOWED_DIRECTORIES = (process.env.ALLOWED_DIRECTORIES || '')
    .split(':')
    .filter(Boolean)
    .map(dir => path.resolve(dir));
// Default allowed directories if none specified
if (ALLOWED_DIRECTORIES.length === 0) {
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    ALLOWED_DIRECTORIES.push(path.join(homeDir, 'Documents'), path.join(homeDir, 'Downloads'), path.join(homeDir, 'Desktop'));
}
/**
 * Validate that a file path is within allowed directories
 */
function validateFilePath(filePath) {
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
    // Check if within allowed directories
    const isAllowed = ALLOWED_DIRECTORIES.some(allowedDir => resolved.startsWith(allowedDir));
    if (!isAllowed) {
        return {
            valid: false,
            error: `Access denied: File must be in allowed directories: ${ALLOWED_DIRECTORIES.join(', ')}`,
        };
    }
    return { valid: true };
}
/**
 * Fetch wrapper with better error handling
 */
async function fetchWithError(url, options) {
    try {
        const response = await fetch(url, options);
        return response;
    }
    catch (error) {
        throw new Error(`Network error: Cannot connect to PDFlow at ${PDFLOW_BASE_URL}. ` +
            `Make sure PDFlow is running and accessible. ` +
            `Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * MCP Server instance
 */
const server = new Server({
    name: 'pdflow-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'pdflow_extract_pdf',
                description: 'Extract structured content from a PDF file using AI-powered extraction. ' +
                    'Uploads a PDF to PDFlow, converts pages to images, and extracts content using Google Gemini AI. ' +
                    'Supports multiple output formats: markdown, json, xml, html, yaml, mdx. ' +
                    'Can aggregate all pages into a single output or return page-by-page results.',
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
                description: 'Check the processing status of a PDF extraction session. ' +
                    'Use this to monitor ongoing extractions and determine when results are ready. ' +
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
                description: 'Retrieve the extracted content from a completed session. ' +
                    'Downloads the aggregated result file (if aggregation was enabled) or lists available per-page results. ' +
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
                description: 'Check if the PDFlow service is running and accessible. ' +
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
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'pdflow_extract_pdf':
                return await handleExtractPdf(args);
            case 'pdflow_check_status':
                return await handleCheckStatus(args);
            case 'pdflow_get_results':
                return await handleGetResults(args);
            case 'pdflow_health_check':
                return await handleHealthCheck();
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
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
 * Extract PDF - Main workflow
 */
async function handleExtractPdf(args) {
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
        body: formData,
    });
    if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed (${uploadResponse.status}): ${errorText}`);
    }
    const uploadResult = (await uploadResponse.json());
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
    const processResult = (await processResponse.json());
    // Step 3: Get results if processing completed
    let extractedContent = null;
    if (processResult.status === 'completed' && aggregate) {
        try {
            const resultsResponse = await fetchWithError(`${PDFLOW_BASE_URL}/api/outputs/${sessionId}/aggregated.${format}`);
            if (resultsResponse.ok) {
                extractedContent = await resultsResponse.text();
            }
        }
        catch (error) {
            console.error('Failed to fetch results:', error);
        }
    }
    // Format response
    const result = {
        success: true,
        sessionId,
        status: processResult.status,
        totalPages: processResult.totalPages,
        processedPages: processResult.processedPages,
        processingTime: processResult.processingTime,
        format,
        aggregate,
        message: processResult.status === 'completed'
            ? `Successfully extracted ${processResult.processedPages} pages from PDF`
            : 'Processing in progress',
        extractedContent: extractedContent
            ? {
                preview: extractedContent.substring(0, 500) + (extractedContent.length > 500 ? '...' : ''),
                fullLength: extractedContent.length,
                retrieveWith: `pdflow_get_results with sessionId: ${sessionId}`,
            }
            : null,
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
 * Check processing status
 */
async function handleCheckStatus(args) {
    const { sessionId } = args;
    const response = await fetchWithError(`${PDFLOW_BASE_URL}/api/process?sessionId=${encodeURIComponent(sessionId)}`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Status check failed (${response.status}): ${errorText}`);
    }
    const result = (await response.json());
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
async function handleGetResults(args) {
    const { sessionId, format = 'markdown' } = args;
    // Try to get aggregated results first
    const aggregatedUrl = `${PDFLOW_BASE_URL}/api/outputs/${encodeURIComponent(sessionId)}/aggregated.${format}`;
    const response = await fetchWithError(aggregatedUrl);
    if (!response.ok) {
        throw new Error(`Failed to retrieve results (${response.status}). ` +
            'Make sure the session is completed and aggregation was enabled.');
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
        const result = (await response.json());
        const healthInfo = {
            status: 'ok',
            pdflowUrl: PDFLOW_BASE_URL,
            pdflowStatus: result.status,
            timestamp: result.timestamp,
            uptime: `${(result.uptime / 60).toFixed(1)} minutes`,
            allowedDirectories: ALLOWED_DIRECTORIES,
        };
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(healthInfo, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorInfo = {
            status: 'error',
            pdflowUrl: PDFLOW_BASE_URL,
            error: error instanceof Error ? error.message : String(error),
            message: 'Cannot connect to PDFlow service. Make sure it is running and accessible via Tailscale.',
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
    console.error(`Allowed directories: ${ALLOWED_DIRECTORIES.join(', ') || 'None (all paths allowed)'}`);
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
//# sourceMappingURL=server.js.map