import { z } from 'zod';

export const RefreshTokenSchema = z.object({
  refreshToken: z.string()
    .min(1, { message: 'Refresh token is required' }),
});

export type RefreshTokenRequestDTO = z.infer<typeof RefreshTokenSchema>;

export interface RefreshTokenResponseDTO {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}