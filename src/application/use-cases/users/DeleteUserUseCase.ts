import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { UserId } from '../../../domain/value-objects/UserId';

export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    userId: string,
    deletedBy: string,
    reason: string = 'User deleted by administrator'
  ): Promise<void> {
    const id = UserId.fromString(userId);
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Soft delete con auditoría
    user.softDelete(deletedBy, reason);
    await this.userRepository.update(user);
  }
}