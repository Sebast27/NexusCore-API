import { z } from 'zod';

export const LoginUserSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),

  password: z.string()
    .min(1, 'Password is required'),

  ipAddress: z.string()
    .optional()
    .refine(
      (val) => !val || /^(\d{1,3}\.){3}\d{1,3}$/.test(val) || /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(val),
      { message: 'Invalid IP address format' }
    ),

  userAgent: z.string()
    .optional(),
  
  correlationId: z.string()
    .optional()

});

export type LoginUserRequestDTO = z.infer<typeof LoginUserSchema>;

export interface LoginUserResponseDTO {
  id: string;
  email: string;
  name: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}