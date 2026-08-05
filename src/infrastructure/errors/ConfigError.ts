import { InfrastructureError } from './InfrastructureError';

export class ConfigError extends InfrastructureError {
  constructor(
    configKey: string,
    message: string
  ) {
    super(
      `Configuration error: ${message}`,
      'CONFIG_ERROR',
      { configKey }
    );
  }

  static missingEnvVariable(key: string): ConfigError {
    return new ConfigError(key, `Missing environment variable: ${key}`);
  }

  static invalidValue(key: string, value: string, expected: string): ConfigError {
    return new ConfigError(key, `Invalid value "${value}" for ${key}. Expected: ${expected}`);
  }

  static invalidFormat(key: string, format: string): ConfigError {
    return new ConfigError(key, `Invalid format for ${key}. Expected: ${format}`);
  }
}