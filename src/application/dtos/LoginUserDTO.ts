import { z } from 'zod';

export const LoginUserSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z.string()
    .min(1, 'Password is required'),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type LoginUserInput = z.infer<typeof LoginUserSchema>;

export interface LoginUserResponseDTO {
  id: string;
  email: string;
  name: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}