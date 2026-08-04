export interface AuditLogResponseDTO {
  id: string;
  eventName: string;
  occurredOn: Date;
  data: Record<string, unknown>;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    correlationId?: string;
  };
}

export interface AuditLogPaginatedResponseDTO {
  data: AuditLogResponseDTO[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    nextOffset?: number;
  };
}