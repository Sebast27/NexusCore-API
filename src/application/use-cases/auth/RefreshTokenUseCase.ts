import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { User } from '../../../domain/entities/User';
import { UserId } from '../../../domain/value-objects/UserId';
import jwt from 'jsonwebtoken';

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export class RefreshTokenUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenResponse> {
    try {
      const secret = process.env.JWT_SECRET || 'default-secret-key';
      const decoded = jwt.verify(input.refreshToken, secret) as {
        id: string;
        email: string;
        role: string;
        type: 'refresh';
      };

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const id = UserId.fromString(decoded.id);
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      const accessToken = this.generateAccessToken(user);

      return { accessToken };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      throw error;
    }
  }

  private generateAccessToken(user: User): string {
    const payload = {
      id: user.getId(),
      email: user.getEmail().getValue(),
      role: user.getRole()
    };

    const secret = process.env.JWT_SECRET || 'default-secret-key';
    const expiresIn = process.env.JWT_ACCESS_EXPIRATION || '15m';

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }
}