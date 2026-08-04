import { z } from 'zod';

export const LogoutSchema = z.object({
  userId: z.string()
    .uuid({ message: 'Invalid user ID format' }),
});

export type LogoutRequestDTO = z.infer<typeof LogoutSchema>;

export interface LogoutResponseDTO {
  success: boolean;
  message: string;
}