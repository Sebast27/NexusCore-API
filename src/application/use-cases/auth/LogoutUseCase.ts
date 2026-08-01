import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { UserId } from '../../../domain/value-objects/UserId';

export interface LogoutInput {
  userId: string;
}

export class LogoutUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: LogoutInput): Promise<void> {
    // Por ahora, solo verificamos que el usuario existe
    // En una implementación real, agregarías un blacklist de tokens
    const id = UserId.fromString(input.userId);
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    // Aquí se podría agregar lógica de blacklist
  }
}