/**
 * PDFlow Configuration Types and Defaults
 *
 * Defines the shape of all configuration values used across the application.
 */

export interface PdflowConfig {
  /** Gemini API key for AI extraction */
  geminiApiKey: string;
  /** Port for the Next.js web server */
  port: number;
  /** Log level: 'debug' | 'info' | 'warn' | 'error' */
  logLevel: string;
  /** Default output directory for extracted content */
  outputDir: string;
  /** Base URL for the PDFlow web service (used by MCP server) */
  baseUrl: string;
  /** Allowed directories for MCP file access (colon-separated or '*') */
  allowedDirectories: string;
}

export const DEFAULT_CONFIG: PdflowConfig = {
  geminiApiKey: '',
  port: 3001,
  logLevel: 'info',
  outputDir: './outputs',
  baseUrl: 'http://localhost:3001',
  allowedDirectories: '',
};
