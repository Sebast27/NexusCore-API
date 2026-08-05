
export interface AuthenticatedRequestDTO {
  userId: string;
  email: string;
  role: string;
  name?: string;
  sessionId?: string;
  permissions?: string[];
  ipAddress?: string;
  userAgent?: string;
}

export interface ErrorResponseDTO {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
  };
}

export class ErrorResponseFactory {
  static create(code: string, message: string, details?: Record<string, unknown>): ErrorResponseDTO {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
    };
  }

  static validationError(field: string, message: string): ErrorResponseDTO {
    return ErrorResponseFactory.create(
      'VALIDATION_ERROR',
      `Validation error on ${field}: ${message}`,
      { field }
    );
  }
}

export interface SuccessResponseDTO<T> {
  success: true;
  data: T;
  metadata?: {
    timestamp: string;
    processingTime?: number;
    version?: string;
    message?: string;
  };
}

export class SuccessResponseFactory {
  static create<T>(data: T, metadata?: { processingTime?: number; version?: string; message?: string }): SuccessResponseDTO<T> {
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    };
  }
}

export interface PaginatedResponseDTO<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class PaginatedResponseFactory {
  static create<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): PaginatedResponseDTO<T> {
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}