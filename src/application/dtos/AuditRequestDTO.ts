import { z } from 'zod';

export const GetUserAuditLogsSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' }),
});

export interface GetUserAuditLogsRequestDTO {
  userId: string;
}

export const GetGlobalAuditLogsSchema = z.object({
  eventName: z.string().optional(),
  startDate: z.string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      { message: 'Invalid start date format' }
    )
    .transform((val) => val ? new Date(val) : undefined),
  endDate: z.string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      { message: 'Invalid end date format' }
    )
    .transform((val) => val ? new Date(val) : undefined),
  limit: z.number()
    .min(1, { message: 'Limit must be at least 1' })
    .max(100, { message: 'Limit cannot exceed 100' })
    .optional()
    .default(20),
  offset: z.number()
    .min(0, { message: 'Offset must be at least 0' })
    .optional()
    .default(0),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  { 
    message: 'Start date must be before end date',
    path: ['startDate', 'endDate']
  }
);

export interface GetGlobalAuditLogsRequestDTO {
  eventName?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
