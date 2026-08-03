export interface AuditLogResponseDTO {
  eventName: string;
  occurredOn: Date;
  data: Record<string, unknown>;
}

export interface ErrorResponseDTO {
  success: false;
  error: string;
}

export interface SuccessResponseDTO<T> {
  success: true;
  data: T;
}