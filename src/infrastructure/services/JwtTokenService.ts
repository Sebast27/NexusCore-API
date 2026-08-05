import jwt from 'jsonwebtoken';
import { User } from '../../domain/entities/User';
import { ITokenService, TokenPayload, TokenResponse } from '../../domain/interfaces/services/ITokenService';
import { TokenExpiredError } from '../../domain/errors/auth/TokenExpiredError';
import { InvalidTokenError } from '../../domain/errors/auth/InvalidTokenError';

export class JwtTokenService implements ITokenService {
  constructor(
    private readonly secret: string,
    private readonly accessExpiration: string = '15m',
    private readonly refreshExpiration: string = '7d'
  ) {}

  generateAccessToken(user: User): string {
    const payload = {
        id: user.getId().getValue(),
        email: user.getEmail().getValue(),
        role: user.getRole(),
    };

    return jwt.sign(
        payload,
        this.secret,
        { expiresIn: this.accessExpiration } as jwt.SignOptions
    );
  }

  generateRefreshToken(user: User): string {
    const payload = {
        id: user.getId().getValue(),
        email: user.getEmail().getValue(),
        role: user.getRole(),
        type: 'refresh' as const,
    };

    return jwt.sign(
        payload,
        this.secret,
        { expiresIn: this.refreshExpiration } as jwt.SignOptions 
    );
  }

  generateTokens(user: User): TokenResponse {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
      expiresIn: this.getExpiresInSecondsFromString(this.accessExpiration),
      tokenType: 'Bearer',
    };
  }

  verifyRefreshToken(token: string): TokenPayload {
    const decoded = this.verifyToken(token);

    // Validar que sea refresh token
    if (decoded.type !== 'refresh') {
      throw new InvalidTokenError();
    }

    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  }

  verifyAccessToken(token: string): TokenPayload {
    const decoded = this.verifyToken(token);
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  }

  decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as {
        id: string;
        email: string;
        role: string;
        type?: string;
      };
      if (!decoded || !decoded.id) {
        return null;
      }
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    } catch {
      return null;
    }
  }

  // MÉTODOS PRIVADOS

  private buildPayload(user: User): { id: string; email: string; role: string } {
    return {
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      role: user.getRole(),
    };
  }

  private verifyToken(token: string): {
    id: string;
    email: string;
    role: string;
    type?: string;
  } {
    try {
      return jwt.verify(token, this.secret) as {
        id: string;
        email: string;
        role: string;
        type?: string;
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredError();
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new InvalidTokenError();
      }
      throw new InvalidTokenError();
    }
  }

  getExpiresInSeconds(): number {
    return this.getExpiresInSecondsFromString(this.accessExpiration);
  }

  private getExpiresInSecondsFromString(expiration: string): number {
    const match = expiration.match(/^(\d+)([mhd])$/);
    if (!match) return 900;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 900;
    }
  }
}