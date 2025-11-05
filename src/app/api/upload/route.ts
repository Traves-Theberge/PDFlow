import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Security Constants
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB limit
const PDF_MAGIC_NUMBERS = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF

// Schema for request validation
const UploadRequestSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.type === 'application/pdf',
    { message: 'File must be a PDF' }
  ).refine(
    (file) => file.size <= MAX_FILE_SIZE,
    { message: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB` }
  ),
});

/**
 * Generate a cryptographically secure session ID
 * @returns {string} Secure session identifier
 */
function generateSessionId(): string {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `session_${timestamp}_${randomBytes}`;
}

/**
 * Validate PDF magic numbers (file signature)
 * @param {Buffer} buffer - File buffer to validate
 * @returns {boolean} True if buffer starts with PDF signature
 */
function isPDFFile(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  return buffer.subarray(0, 4).equals(PDF_MAGIC_NUMBERS);
}

/**
 * Safely execute shell script using spawn (prevents command injection)
 * @param {string} scriptPath - Absolute path to script
 * @param {string} inputPath - Absolute path to input PDF
 * @param {string} sessionId - Session identifier
 * @returns {Promise<string>} Script output
 */
function executeConversionScript(
  scriptPath: string,
  inputPath: string,
  sessionId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Use spawn instead of exec to prevent command injection
    // Arguments are passed as array, not concatenated into shell command
    const child = spawn(scriptPath, [inputPath, sessionId], {
      cwd: process.cwd(),
      timeout: 30000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Script exited with code ${code}: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate the request
    const validation = UploadRequestSchema.safeParse({ file });
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid file. Please check file format and size.',
          details: validation.error.issues[0].message
        },
        { status: 400 }
      );
    }

    // Read file buffer for validation
    const buffer = Buffer.from(await file.arrayBuffer());

    // Security Check #4: Validate PDF magic numbers (file signature)
    if (!isPDFFile(buffer)) {
      return NextResponse.json(
        { error: 'Invalid PDF file. File signature does not match PDF format.' },
        { status: 400 }
      );
    }

    // Generate cryptographically secure session ID
    const sessionId = generateSessionId();

    // Create upload directories
    const uploadDir = path.join(process.cwd(), 'uploads', sessionId);
    const pagesDir = path.join(uploadDir, 'pages');

    fs.mkdirSync(uploadDir, { recursive: true });
    fs.mkdirSync(pagesDir, { recursive: true });

    // Save the uploaded file
    const inputPath = path.join(uploadDir, 'input.pdf');
    fs.writeFileSync(inputPath, buffer);

    console.log(`✓ Saved uploaded file to: ${inputPath} (${(buffer.length / 1024).toFixed(2)} KB)`);

    // Execute the conversion script using secure spawn method
    const scriptPath = path.join(process.cwd(), 'scripts', 'convert-to-webp.sh');

    try {
      // Security Fix #1: Use spawn instead of exec to prevent command injection
      const stdout = await executeConversionScript(scriptPath, inputPath, sessionId);

      console.log('Script output:', stdout);

      // Count the number of generated pages
      const pageFiles = fs.readdirSync(pagesDir)
        .filter(file => file.startsWith('page-') && file.endsWith('.webp'));
      
      const pageCount = pageFiles.length;

      if (pageCount === 0) {
        // Clean up on failure
        fs.rmSync(uploadDir, { recursive: true, force: true });
        return NextResponse.json(
          { error: 'Failed to convert PDF to images. No pages were generated.' },
          { status: 500 }
        );
      }

      console.log(`✓ Successfully converted PDF to ${pageCount} WebP images`);

      return NextResponse.json({
        success: true,
        sessionId,
        pageCount,
        message: `Successfully uploaded and converted PDF to ${pageCount} pages`,
        pages: pageFiles.map(file => `/uploads/${sessionId}/pages/${file}`),
      });

    } catch (scriptError) {
      console.error('Script execution error:', scriptError);
      
      // Clean up on failure
      fs.rmSync(uploadDir, { recursive: true, force: true });
      
      return NextResponse.json(
        { 
          error: 'Failed to convert PDF to images. Please ensure the PDF is valid and not password protected.',
          details: scriptError instanceof Error ? scriptError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error during upload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}