import { IUserRepository } from '../../../domain/interfaces/IUserRepository';

export interface LogoutInput {
  userId: string;
}

export class LogoutUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: LogoutInput): Promise<void> {
    // Por ahora, solo verificamos que el usuario existe
    // En una implementación real, agregarías un blacklist de tokens
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }
    // Aquí se podría agregar lógica de blacklist
  }
}