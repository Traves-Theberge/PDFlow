import fs from 'fs';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildPrompt } from './prompt-builder';

// Schema for extracted page data
export const PageExtractionSchema = z.object({
  page: z.number(),
  text: z.string(),
  format: z.enum(["markdown", "mdx", "json", "xml", "yaml", "html", "csv"]),
  images: z.array(z.string()).optional(),
});

export type PageExtraction = z.infer<typeof PageExtractionSchema>;

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;

const getGenAI = (apiKey?: string) => {
  if (apiKey) {
    return new GoogleGenerativeAI(apiKey);
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }
  return genAI;
};

/**
 * Extract structured data from a WebP image using Gemini multimodal AI
 */
export async function extractPage(sessionId: string, page: number, format: "markdown" | "mdx" | "json" | "xml" | "yaml" | "html" | "csv" = "markdown", apiKey?: string): Promise<PageExtraction> {
  try {
    // Try both naming conventions (page-1.webp and page-01.webp)
    const imagePath1 = `./uploads/${sessionId}/pages/page-${page}.webp`;
    const imagePath2 = `./uploads/${sessionId}/pages/page-${String(page).padStart(2, '0')}.webp`;

    const imagePath = fs.existsSync(imagePath1) ? imagePath1 : imagePath2;

    // Check if the image file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    // Read and encode the image
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Get the Gemini model
    const ai = getGenAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Build the dynamic prompt using templates
    const prompt = await buildPrompt({
      sessionId,
      pageNumber: page,
      outputFormat: format,
      schemaType: 'structured_extraction',
    });

    // Create the multimodal request
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/webp',
          data: base64Image,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    const responseText = response.text();

    // Ensure output directory exists
    const outputDir = `./outputs/${sessionId}`;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Determine file extension based on format
    const fileExtensions: Record<typeof format, string> = {
      markdown: 'md',
      mdx: 'mdx',
      json: 'json',
      xml: 'xml',
      yaml: 'yaml',
      html: 'html',
      csv: 'csv'
    };
    const fileExt = fileExtensions[format];

    // Save the raw extracted content to a file with the appropriate extension
    const outputPath = `${outputDir}/page-${page}.${fileExt}`;
    fs.writeFileSync(outputPath, responseText);

    // Create a simple extraction result for tracking
    const extractionResult: PageExtraction = {
      page,
      text: responseText,
      format,
    };

    // Also save a JSON metadata file for tracking
    const metadataPath = `${outputDir}/page-${page}.meta.json`;
    fs.writeFileSync(metadataPath, JSON.stringify(extractionResult, null, 2));

    console.log(`✓ Extracted page ${page} for session ${sessionId} as ${format}`);
    return extractionResult;

  } catch (error) {
    console.error(`Error extracting page ${page} for session ${sessionId}:`, error);
    throw error;
  }
}

/**
 * Get all WebP image files for a session
 */
export function getPageFiles(sessionId: string): number[] {
  const pagesDir = `./uploads/${sessionId}/pages`;

  if (!fs.existsSync(pagesDir)) {
    return [];
  }

  try {
    const files = fs.readdirSync(pagesDir);
    const pageFiles = files
      .filter(file => file.startsWith('page-') && file.endsWith('.webp'))
      .map(file => {
        const match = file.match(/page-(\d+)\.webp/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(pageNum => pageNum > 0)
      .sort((a, b) => a - b);

    return pageFiles;
  } catch (error) {
    console.error('Error reading page files:', error);
    return [];
  }
}

/**
 * Check if extraction is complete for a specific page
 */
export function isPageExtracted(sessionId: string, pageNum: number): boolean {
  const outputDir = `./outputs/${sessionId}`;

  if (!fs.existsSync(outputDir)) {
    return false;
  }

  try {
    // Check for metadata file existence
    const metadataPath = `${outputDir}/page-${pageNum}.meta.json`;
    return fs.existsSync(metadataPath);
  } catch (error) {
    console.error(`Error checking if page ${pageNum} is extracted:`, error);
    return false;
  }
}

/**
 * Check if extraction is complete for all pages in a session
 */
export function isExtractionComplete(sessionId: string, totalPages: number): boolean {
  const outputDir = `./outputs/${sessionId}`;

  if (!fs.existsSync(outputDir)) {
    return false;
  }

  try {
    const files = fs.readdirSync(outputDir);
    const extractedPages = files
      .filter(file => file.startsWith('page-') && file.endsWith('.meta.json'))
      .map(file => {
        const match = file.match(/page-(\d+)\.meta\.json/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(pageNum => pageNum > 0);

    return extractedPages.length >= totalPages;
  } catch (error) {
    console.error('Error checking extraction completion:', error);
    return false;
  }
}