import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Validate path component (sessionId or filename) to prevent directory traversal
 * @param {string} component - Path component to validate
 * @returns {boolean} True if component is safe
 */
function isValidPathComponent(component: string): boolean {
  // Only allow alphanumeric characters, hyphens, underscores, and dots
  const validPattern = /^[a-zA-Z0-9_.-]+$/;
  return validPattern.test(component) && !component.includes('..');
}

/**
 * Safely resolve and validate file path to prevent directory traversal
 * @param {string} sessionId - Session identifier
 * @param {string} filename - File name
 * @returns {string | null} Resolved absolute path or null if invalid
 */
function getSecureFilePath(sessionId: string, filename: string): string | null {
  // Validate both components
  if (!isValidPathComponent(sessionId) || !isValidPathComponent(filename)) {
    return null;
  }

  // Construct the intended path
  const outputsDir = path.join(process.cwd(), 'outputs');
  const sessionDir = path.join(outputsDir, sessionId);
  const filePath = path.join(sessionDir, filename);

  // Resolve to absolute paths to detect traversal attempts
  const resolvedOutputsDir = path.resolve(outputsDir);
  const resolvedFilePath = path.resolve(filePath);

  // Ensure the resolved path is within the outputs directory
  if (!resolvedFilePath.startsWith(resolvedOutputsDir + path.sep)) {
    return null;
  }

  return resolvedFilePath;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; filename: string }> }
) {
  try {
    const { sessionId, filename } = await params;

    // Security Fix #3: Enhanced path traversal protection
    const filePath = getSecureFilePath(sessionId, filename);

    if (!filePath) {
      return NextResponse.json(
        { error: 'Invalid session ID or filename' },
        { status: 400 }
      );
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.md': 'text/markdown',
      '.mdx': 'text/markdown',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.yaml': 'text/yaml',
      '.yml': 'text/yaml',
      '.html': 'text/html',
      '.csv': 'text/csv',
      '.txt': 'text/plain',
    };

    const contentType = contentTypes[ext] || 'text/plain';

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });

  } catch (error) {
    console.error('Error serving output file:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
