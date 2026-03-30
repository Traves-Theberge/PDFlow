/**
 * PDFlow Configuration Loader
 *
 * Priority order:
 * 1. Environment variables (highest)
 * 2. YAML config file (pdflow.config.yml)
 * 3. Hardcoded defaults (lowest)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { PdflowConfig, DEFAULT_CONFIG } from './config';

/** Mapping from config keys to environment variable names */
const ENV_MAP: Record<keyof PdflowConfig, string> = {
  geminiApiKey: 'GEMINI_API_KEY',
  port: 'PDFLOW_PORT',
  logLevel: 'PDFLOW_LOG_LEVEL',
  outputDir: 'PDFLOW_OUTPUT_DIR',
  baseUrl: 'PDFLOW_BASE_URL',
  allowedDirectories: 'ALLOWED_DIRECTORIES',
};

let cachedConfig: PdflowConfig | null = null;

/**
 * Load YAML config file from the project root.
 * Returns an empty object if the file doesn't exist or can't be parsed.
 */
function loadYamlConfig(configPath?: string): Partial<PdflowConfig> {
  const filePath = configPath ?? path.resolve(process.cwd(), 'pdflow.config.yml');

  if (!fs.existsSync(filePath)) {
    return {};
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = yaml.load(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return {};
    }
    return mapYamlToConfig(parsed as Record<string, unknown>);
  } catch {
    return {};
  }
}

/**
 * Map YAML keys (snake_case) to PdflowConfig keys (camelCase).
 */
function mapYamlToConfig(raw: Record<string, unknown>): Partial<PdflowConfig> {
  const result: Partial<PdflowConfig> = {};

  if (typeof raw.gemini_api_key === 'string') result.geminiApiKey = raw.gemini_api_key;
  if (typeof raw.port === 'number') result.port = raw.port;
  if (typeof raw.log_level === 'string') result.logLevel = raw.log_level;
  if (typeof raw.output_dir === 'string') result.outputDir = raw.output_dir;
  if (typeof raw.base_url === 'string') result.baseUrl = raw.base_url;
  if (typeof raw.allowed_directories === 'string') result.allowedDirectories = raw.allowed_directories;

  return result;
}

/**
 * Read a single config value from environment variables.
 */
function getEnvValue(key: keyof PdflowConfig): string | undefined {
  return process.env[ENV_MAP[key]];
}

/**
 * Load the full configuration by merging defaults, YAML, and env vars.
 * Results are cached — call `resetConfig()` to force a reload.
 */
export function loadConfig(options?: { configPath?: string; noCache?: boolean }): PdflowConfig {
  if (cachedConfig && !options?.noCache) {
    return cachedConfig;
  }

  const yamlConfig = loadYamlConfig(options?.configPath);

  const config: PdflowConfig = { ...DEFAULT_CONFIG };

  // Layer 1: YAML overrides defaults
  for (const key of Object.keys(DEFAULT_CONFIG) as (keyof PdflowConfig)[]) {
    if (yamlConfig[key] !== undefined) {
      (config as any)[key] = yamlConfig[key];
    }
  }

  // Layer 2: Env vars override YAML
  for (const key of Object.keys(DEFAULT_CONFIG) as (keyof PdflowConfig)[]) {
    const envVal = getEnvValue(key);
    if (envVal !== undefined) {
      if (key === 'port') {
        const parsed = parseInt(envVal, 10);
        if (!isNaN(parsed)) config.port = parsed;
      } else {
        (config as any)[key] = envVal;
      }
    }
  }

  cachedConfig = config;
  return config;
}

/**
 * Clear cached configuration so the next `loadConfig()` call re-reads sources.
 */
export function resetConfig(): void {
  cachedConfig = null;
}
