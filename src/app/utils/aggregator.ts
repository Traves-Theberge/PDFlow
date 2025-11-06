import fs from 'fs';
import { z } from 'zod';
import { PageExtraction } from './gemini-extractor';
import Handlebars from 'handlebars';
import { buildPrompt } from './prompt-builder';

// Schema for aggregated output
export const AggregatedOutputSchema = z.object({
  sessionId: z.string(),
  totalPages: z.number(),
  format: z.enum(["markdown", "json", "xml", "html"]),
  content: z.string(),
  metadata: z.object({
    createdAt: z.string(),
    totalCharacters: z.number(),
    processingTime: z.number().optional(),
  }),
});

export type AggregatedOutput = z.infer<typeof AggregatedOutputSchema>;

/**
 * Aggregate all page outputs for a session into a single file
 */
export async function aggregatePages(
  sessionId: string,
  format: 'markdown' | 'json' | 'xml' | 'html' | 'yaml' | 'mdx' | 'csv' = 'markdown'
): Promise<AggregatedOutput> {
  const startTime = Date.now();
  
  try {
    const outputDir = `./outputs/${sessionId}`;
    
    if (!fs.existsSync(outputDir)) {
      throw new Error(`Output directory not found for session: ${sessionId}`);
    }

    // Get all page files
    const files = fs.readdirSync(outputDir)
      .filter(file => file.startsWith('page-') && file.endsWith('.json'))
      .sort((a, b) => {
        const aNum = parseInt(a.match(/page-(\d+)\.json/)?.[1] || '0');
        const bNum = parseInt(b.match(/page-(\d+)\.json/)?.[1] || '0');
        return aNum - bNum;
      });

    if (files.length === 0) {
      throw new Error('No page files found for aggregation');
    }

    // Read and parse all page data
    const pageData: PageExtraction[] = [];
    for (const file of files) {
      try {
        const filePath = `${outputDir}/${file}`;
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        pageData.push(parsed);
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    }

    // Aggregate content based on format
    let aggregatedContent = '';
    
    switch (format) {
      case 'markdown':
        aggregatedContent = aggregateToMarkdown(pageData);
        break;
      case 'json':
        aggregatedContent = aggregateToJson(pageData);
        break;
      case 'xml':
        aggregatedContent = aggregateToXml(pageData);
        break;
      case 'html':
        aggregatedContent = aggregateToHtml(pageData);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Create the aggregated output object
    const aggregatedOutput: AggregatedOutput = {
      sessionId,
      totalPages: pageData.length,
      format,
      content: aggregatedContent,
      metadata: {
        createdAt: new Date().toISOString(),
        totalCharacters: aggregatedContent.length,
        processingTime: Date.now() - startTime,
      },
    };

    // Validate with Zod
    const validatedOutput = AggregatedOutputSchema.parse(aggregatedOutput);

    // Save the aggregated file
    const outputPath = `${outputDir}/full.${format}`;
    fs.writeFileSync(outputPath, aggregatedContent);

    // Also save the metadata
    const metadataPath = `${outputDir}/metadata.json`;
    fs.writeFileSync(metadataPath, JSON.stringify(validatedOutput, null, 2));

    console.log(`✓ Aggregated ${pageData.length} pages to ${format} for session ${sessionId}`);
    return validatedOutput;

  } catch (error) {
    console.error(`Error aggregating pages for session ${sessionId}:`, error);
    throw error;
  }
}

/**
 * Aggregate pages to Markdown format
 */
function aggregateToMarkdown(pages: PageExtraction[]): string {
  let markdown = `# Document Content\n\n`;
  markdown += `*Generated on ${new Date().toLocaleDateString()}*\n\n`;
  markdown += `---\n\n`;

  for (const page of pages) {
    markdown += `## Page ${page.page}\n\n`;
    
    if (page.format === 'markdown') {
      markdown += `${page.text}\n\n`;
    } else {
      // Convert other formats to markdown
      markdown += `\`\`\`${page.format}\n${page.text}\n\`\`\`\n\n`;
    }

    if (page.images && page.images.length > 0) {
      markdown += `### Images\n\n`;
      page.images.forEach((image, index) => {
        markdown += `${index + 1}. ${image}\n`;
      });
      markdown += `\n`;
    }

    markdown += `---\n\n`;
  }

  return markdown;
}

/**
 * Aggregate pages to JSON format
 */
function aggregateToJson(pages: PageExtraction[]): string {
  const aggregated = {
    metadata: {
      title: 'Document Content',
      generatedAt: new Date().toISOString(),
      totalPages: pages.length,
    },
    pages: pages.map(page => ({
      pageNumber: page.page,
      format: page.format,
      content: page.text,
      images: page.images || [],
    })),
  };

  return JSON.stringify(aggregated, null, 2);
}

/**
 * Aggregate pages to XML format
 */
function aggregateToXml(pages: PageExtraction[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<document>\n`;
  xml += `  <metadata>\n`;
  xml += `    <title>Document Content</title>\n`;
  xml += `    <generatedAt>${new Date().toISOString()}</generatedAt>\n`;
  xml += `    <totalPages>${pages.length}</totalPages>\n`;
  xml += `  </metadata>\n`;
  xml += `  <pages>\n`;

  for (const page of pages) {
    xml += `    <page number="${page.page}" format="${page.format}">\n`;
    xml += `      <content><![CDATA[${page.text}]]></content>\n`;
    
    if (page.images && page.images.length > 0) {
      xml += `      <images>\n`;
      page.images.forEach(image => {
        xml += `        <image><![CDATA[${image}]]></image>\n`;
      });
      xml += `      </images>\n`;
    }
    
    xml += `    </page>\n`;
  }

  xml += `  </pages>\n`;
  xml += `</document>\n`;

  return xml;
}

/**
 * Aggregate pages to HTML format using Handlebars
 */
function aggregateToHtml(pages: PageExtraction[]): string {
  const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Content</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .page { border-bottom: 1px solid #ccc; padding: 20px 0; }
        .page:last-child { border-bottom: none; }
        .page-header { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .content { line-height: 1.6; }
        .images { margin-top: 15px; }
        .image { font-style: italic; color: #666; }
        pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
        .metadata { background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="metadata">
        <h1>Document Content</h1>
        <p>Generated on: {{generatedDate}}</p>
        <p>Total Pages: {{totalPages}}</p>
    </div>
    
    {{#each pages}}
    <div class="page">
        <div class="page-header">Page {{page}}</div>
        <div class="content">
            {{#if (eq format "markdown")}}
                {{{text}}}
            {{else}}
                <pre>{{text}}</pre>
            {{/if}}
        </div>
        {{#if images}}
        <div class="images">
            <strong>Images:</strong>
            {{#each images}}
            <div class="image">{{this}}</div>
            {{/each}}
        </div>
        {{/if}}
    </div>
    {{/each}}
</body>
</html>`;

  const compiledTemplate = Handlebars.compile(template);
  
  return compiledTemplate({
    generatedDate: new Date().toLocaleDateString(),
    totalPages: pages.length,
    pages: pages,
  });
}

/**
 * Get available aggregated formats for a session
 */
export function getAvailableFormats(sessionId: string): string[] {
  const outputDir = `./outputs/${sessionId}`;
  
  if (!fs.existsSync(outputDir)) {
    return [];
  }

  try {
    const files = fs.readdirSync(outputDir);
    return files
      .filter(file => file.startsWith('full.'))
      .map(file => file.replace('full.', ''));
  } catch (error) {
    console.error('Error reading available formats:', error);
    return [];
  }
}

/**
 * Get aggregated content for a session and format
 */
export function getAggregatedContent(sessionId: string, format: string): string | null {
  const outputPath = `./outputs/${sessionId}/full.${format}`;
  
  if (!fs.existsSync(outputPath)) {
    return null;
  }

  try {
    return fs.readFileSync(outputPath, 'utf-8');
  } catch (error) {
    console.error('Error reading aggregated content:', error);
    return null;
  }
}