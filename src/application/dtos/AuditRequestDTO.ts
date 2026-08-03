export interface GetUserAuditLogsRequestDTO {
  userId: string;
}

export interface GetGlobalAuditLogsRequestDTO {
  eventName?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AuthenticatedRequestDTO {
  userId: string;
  email: string;
  role: string;
}