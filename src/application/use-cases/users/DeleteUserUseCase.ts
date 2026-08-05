import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { UserId } from '../../../domain/value-objects/UserId';
import { IDateProvider } from '../../../domain/interfaces/IDateProvider';
import { UserNotFoundError } from '../../../domain/errors/UserNotFoundError';
import { DeleteUserRequestDTO, DeleteUserSchema } from '../../dtos/DeleteUserDTO';
import { BusinessRuleViolationError } from '../../../application/errors/BusinessRuleViolationError';

export class DeleteUserUseCase {
  constructor(
    private userRepository: IUserRepository, 
    private dateProvider: IDateProvider
  ) {}

  async execute(input: DeleteUserRequestDTO): Promise<void> {
    // 1. Validar entrada
    const validatedInput = DeleteUserSchema.parse(input);

    // 2. Crear Value Object
    const userId = UserId.fromString(validatedInput.userId);

    // 3. Buscar usuario
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(validatedInput.userId);
    }

    // 4. Verificar que no esté ya eliminado
    if (user.isDeleted()) {
      throw BusinessRuleViolationError.userAlreadyDeleted(validatedInput.userId);
    }

    // 5. Soft delete con auditoría
    const reason = validatedInput.reason || 'User deleted by administrator';
    user.softDelete(validatedInput.deletedBy, reason, this.dateProvider);

    // 6. Guardar cambios
    await this.userRepository.update(user);
    
    // Nota: Los eventos de dominio (UserDeletedEvent) ya fueron generados por user.softDelete()
    // y deberían ser publicados por el repositorio o un event bus
  }
}