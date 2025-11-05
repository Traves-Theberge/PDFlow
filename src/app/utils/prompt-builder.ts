import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

export interface PromptContext {
  sessionId: string;
  pageNumber: number;
  outputFormat: string;
  schemaType: string;
}

/**
 * Builds a dynamic prompt using Handlebars templates
 */
export async function buildPrompt(context: PromptContext): Promise<string> {
  try {
    // Read the base template
    const baseTemplatePath = path.join(process.cwd(), 'templates', 'base_prompt.hbs');
    let baseTemplate = fs.readFileSync(baseTemplatePath, 'utf8');

    // Read the format-specific template
    const formatTemplatePath = path.join(
      process.cwd(),
      'templates',
      'formats',
      `${context.outputFormat}_format.hbs`
    );

    if (!fs.existsSync(formatTemplatePath)) {
      throw new Error(`Template not found for format: ${context.outputFormat}`);
    }

    const formatTemplate = fs.readFileSync(formatTemplatePath, 'utf8');

    // Replace the partial reference with the actual format template content
    baseTemplate = baseTemplate.replace('{{> formatTemplate }}', formatTemplate);

    // Compile the combined template with context
    const compiledTemplate = Handlebars.compile(baseTemplate);
    const prompt = compiledTemplate(context);

    return prompt;
  } catch (error) {
    console.error('Error building prompt:', error);
    throw new Error(`Failed to build prompt for format ${context.outputFormat}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get available output formats
 */
export function getAvailableFormats(): string[] {
  const formatsDir = path.join(process.cwd(), 'templates', 'formats');
  
  if (!fs.existsSync(formatsDir)) {
    return [];
  }

  const files = fs.readdirSync(formatsDir);
  return files
    .filter(file => file.endsWith('_format.hbs'))
    .map(file => file.replace('_format.hbs', ''));
}

/**
 * Validate that a format template exists
 */
export function validateFormat(format: string): boolean {
  const templatePath = path.join(
    process.cwd(), 
    'templates', 
    'formats', 
    `${format}_format.hbs`
  );
  return fs.existsSync(templatePath);
}

/**
 * Get template content for a specific format (for debugging/testing)
 */
export function getTemplateContent(format: string): string | null {
  try {
    const templatePath = path.join(
      process.cwd(), 
      'templates', 
      'formats', 
      `${format}_format.hbs`
    );
    
    if (!fs.existsSync(templatePath)) {
      return null;
    }
    
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error('Error reading template:', error);
    return null;
  }
}