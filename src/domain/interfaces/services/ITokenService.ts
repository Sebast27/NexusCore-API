import { User } from '../../entities/User';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface ITokenService {

  generateAccessToken(user: User): string
  generateRefreshToken(user: User): string;
  generateTokens(user: User): TokenResponse;
  verifyRefreshToken(token: string): TokenPayload;
  verifyAccessToken(token: string): TokenPayload;
  decodeToken(token: string): TokenPayload | null;
  getExpiresInSeconds(): number;
}