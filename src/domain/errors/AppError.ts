export abstract class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly metadata?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    isOperational: boolean = true,
    metadata?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.metadata = metadata;

    // Mantener stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown>  {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      metadata: this.metadata,
      ...(process.env.NODE_ENV === 'development' && {
        stack: this.stack,
      }),
    };
  }
}