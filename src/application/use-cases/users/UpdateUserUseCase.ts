import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { UserId } from '../../../domain/value-objects/UserId';
import { UserResponseDTO, UserResponseMapper } from '../../dtos/UserResponseDTO';
import { Name } from '../../../domain/value-objects/Name';
import { IDateProvider } from '../../../domain/interfaces/IDateProvider';
import { Role } from '../../..//domain/enums/Role';
import { UserNotFoundError } from '../../..//domain/errors/UserNotFoundError';
import { InvalidRoleError } from '../../..//domain/errors/InvalidRoleError';
import { UpdateUserRequestDTO, UpdateUserSchema } from '../../../application/dtos/UpdateUserDTO';
import { BusinessRuleViolationError } from '../../../application/errors/BusinessRuleViolationError';

export class UpdateUserUseCase {
  constructor(
    private userRepository: IUserRepository, 
    private dateProvider: IDateProvider
  ) {}

  async execute(input: UpdateUserRequestDTO): Promise<UserResponseDTO> {
    // 1. Validar entrada
    const validatedInput = UpdateUserSchema.parse(input);

    // 2. Crear Value Objects
    const userId = UserId.fromString(validatedInput.userId);

    // 3. Buscar usuario
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(validatedInput.userId);
    }

    // 4. Verificar que el usuario no esté eliminado
    if (user.isDeleted()) {
      throw BusinessRuleViolationError.cannotUpdateDeletedUser(validatedInput.userId);
    }

    // 5. Actualizar nombre
    if (validatedInput.name) {
      const name = Name.create(validatedInput.name);
      user.updateName(name, this.dateProvider);
    }

     // 6. Actualizar rol
    if (validatedInput.role) {
      // Validar que el rol sea válido
      const validRoles = Object.values(Role);
      if (!validRoles.includes(validatedInput.role)) {
        throw new InvalidRoleError(validatedInput.role, validRoles);
      }

      const reason = validatedInput.reason || 'User update';
      user.updateRole(validatedInput.role, validatedInput.updatedBy, this.dateProvider, reason);
    }

    // 7. Guardar cambios
    await this.userRepository.update(user);

    // 8. Retornar DTO
    return UserResponseMapper.toDTO(user);
  }
}