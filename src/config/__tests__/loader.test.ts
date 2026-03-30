import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { loadConfig, resetConfig } from '../loader';

describe('loadConfig', () => {
  const originalEnv = { ...process.env };
  let tmpDir: string;
  let tmpYaml: string;

  beforeEach(() => {
    resetConfig();
    // Clean relevant env vars
    delete process.env.GEMINI_API_KEY;
    delete process.env.PDFLOW_PORT;
    delete process.env.PDFLOW_LOG_LEVEL;
    delete process.env.PDFLOW_OUTPUT_DIR;
    delete process.env.PDFLOW_BASE_URL;
    delete process.env.ALLOWED_DIRECTORIES;

    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdflow-test-'));
    tmpYaml = path.join(tmpDir, 'pdflow.config.yml');
  });

  afterEach(() => {
    // Restore env
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
    resetConfig();

    // Cleanup temp files
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true });
    }
  });

  it('returns defaults when no env vars or YAML exist', () => {
    const config = loadConfig({ configPath: tmpYaml, noCache: true });

    expect(config.geminiApiKey).toBe('');
    expect(config.port).toBe(3001);
    expect(config.logLevel).toBe('info');
    expect(config.outputDir).toBe('./outputs');
    expect(config.baseUrl).toBe('http://localhost:3001');
    expect(config.allowedDirectories).toBe('');
  });

  it('reads values from YAML config file', () => {
    fs.writeFileSync(tmpYaml, [
      'gemini_api_key: "yaml-key-123"',
      'port: 4000',
      'log_level: "debug"',
      'output_dir: "./my-outputs"',
    ].join('\n'));

    const config = loadConfig({ configPath: tmpYaml, noCache: true });

    expect(config.geminiApiKey).toBe('yaml-key-123');
    expect(config.port).toBe(4000);
    expect(config.logLevel).toBe('debug');
    expect(config.outputDir).toBe('./my-outputs');
  });

  it('env vars take priority over YAML values', () => {
    fs.writeFileSync(tmpYaml, [
      'gemini_api_key: "yaml-key"',
      'port: 4000',
      'log_level: "debug"',
    ].join('\n'));

    process.env.GEMINI_API_KEY = 'env-key-456';
    process.env.PDFLOW_PORT = '5000';

    const config = loadConfig({ configPath: tmpYaml, noCache: true });

    expect(config.geminiApiKey).toBe('env-key-456');
    expect(config.port).toBe(5000);
    // YAML still applies where env is not set
    expect(config.logLevel).toBe('debug');
  });

  it('caches config and returns same object on subsequent calls', () => {
    const config1 = loadConfig({ configPath: tmpYaml });
    const config2 = loadConfig({ configPath: tmpYaml });

    expect(config1).toBe(config2);
  });

  it('noCache forces a fresh load', () => {
    const config1 = loadConfig({ configPath: tmpYaml });
    process.env.GEMINI_API_KEY = 'changed';
    const config2 = loadConfig({ configPath: tmpYaml, noCache: true });

    expect(config2.geminiApiKey).toBe('changed');
    expect(config1).not.toBe(config2);
  });

  it('handles invalid YAML gracefully', () => {
    fs.writeFileSync(tmpYaml, '{{{{ not valid yaml');

    const config = loadConfig({ configPath: tmpYaml, noCache: true });
    expect(config.port).toBe(3001); // falls back to defaults
  });

  it('handles non-numeric PDFLOW_PORT gracefully', () => {
    process.env.PDFLOW_PORT = 'not-a-number';

    const config = loadConfig({ configPath: tmpYaml, noCache: true });
    expect(config.port).toBe(3001); // keeps default
  });
});
