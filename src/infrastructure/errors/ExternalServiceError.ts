import { InfrastructureError } from './InfrastructureError';

export class ExternalServiceError extends InfrastructureError {
  constructor(
    service: string,
    message: string,
    originalError?: any
  ) {
    super(
      `External service ${service} error: ${message}`,
      'EXTERNAL_SERVICE_ERROR',
      { 
        service,
        originalMessage: originalError?.message,
      }
    );
  }

  static timeout(service: string, timeoutMs: number): ExternalServiceError {
    return new ExternalServiceError(
      service,
      `Request timed out after ${timeoutMs}ms`
    );
  }

  static unavailable(service: string): ExternalServiceError {
    return new ExternalServiceError(
      service,
      'Service is unavailable'
    );
  }

  static badResponse(service: string, statusCode: number): ExternalServiceError {
    return new ExternalServiceError(
      service,
      `Received bad response with status ${statusCode}`
    );
  }

  static networkError(service: string, originalError?: any): ExternalServiceError {
    return new ExternalServiceError(
      service,
      'Network error',
      originalError
    );
  }
}