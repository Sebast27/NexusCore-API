import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { UserId } from '../../../domain/value-objects/UserId';
import { IDateProvider } from '../../../domain/interfaces/IDateProvider';

export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository, private dateProvider: IDateProvider) {}

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
    user.softDelete(deletedBy, reason, this.dateProvider);
    await this.userRepository.update(user);
  }
}