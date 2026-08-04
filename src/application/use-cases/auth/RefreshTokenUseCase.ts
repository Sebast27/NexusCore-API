import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { UserId } from '../../../domain/value-objects/UserId';
import { UserNotFoundError } from '../../../domain/errors/UserNotFoundError';
import { ValidationError } from '../../errors/ValidationError';
import { ITokenService } from '../../../domain/interfaces/services/ITokenService';
import { UserLoginBlockedError } from '../../../domain/errors/UserLoginBlockedError';
import { RefreshTokenRequestDTO, RefreshTokenResponseDTO } from '../../../application/dtos/RefreshTokenDTO';

export class RefreshTokenUseCase {
  constructor(
    private userRepository: IUserRepository,
    private readonly tokenService: ITokenService
  ) {}

  async execute(input: RefreshTokenRequestDTO): Promise<RefreshTokenResponseDTO> {
    // 1. Validar entrada
    if (!input.refreshToken || input.refreshToken.trim() === '') {
      throw new ValidationError('refreshToken', 'Refresh token is required');
    }

    // 2. Verificar token (la lógica JWT está en el servicio)
    const payload = this.tokenService.verifyRefreshToken(input.refreshToken);

     // 3. Buscar usuario
    const userId = UserId.fromString(payload.id);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(payload.id);
    }

    // 4. Verificar que el usuario esté activo
    if (user.isDeleted()) {
      throw new UserLoginBlockedError(user.getEmail().getValue(),'User account is deleted');
    }

    // 5. Generar nuevo access token (el servicio maneja la generación)
    const accessToken = this.tokenService.generateAccessToken(user);

    // ✅ Obtener expiresIn del servicio
    const expiresIn = this.tokenService.getExpiresInSeconds?.() || 900;

    return {
      accessToken,
      expiresIn,
      tokenType: 'Bearer',
    };
  }
}