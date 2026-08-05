import { UserNotFoundError } from '../../../domain/errors/UserNotFoundError';
import { ValidationError } from '../../../application/errors/ValidationError';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { UserId } from '../../../domain/value-objects/UserId';
import { LogoutRequestDTO } from '../../../application/dtos/LogoutDTO';

export class LogoutUseCase {
  constructor(
    private userRepository: IUserRepository
    // private readonly tokenBlacklistService: ITokenBlacklistService // Para futuro
  ) {}

  async execute(input: LogoutRequestDTO): Promise<void> {
    // Por ahora, solo verificamos que el usuario existe
    // En una implementación real, agregarías un blacklist de tokens

    // 1. Validar entrada
    if (!input.userId || input.userId.trim() === '') {
      throw new ValidationError('userId', 'User ID is required');
    }
    
    // 2. Verificar que el usuario existe
    const userId = UserId.fromString(input.userId);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(input.userId);
    }
    
     // 3. Aquí se podría agregar lógica de blacklist
    // await this.tokenBlacklistService.blacklistToken(input.token);
    // await this.userRepository.updateLastLogout(userId);

    // 4. Por ahora, solo verificamos que el usuario existe
    // En una implementación real, invalidarías el token
  }
}