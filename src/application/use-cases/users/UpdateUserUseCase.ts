import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { UserId } from '../../../domain/value-objects/UserId';
import { Name } from '../../../domain/value-objects/Name';
import { IDateProvider } from '../../../domain/interfaces/IDateProvider';

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository, private dateProvider: IDateProvider) {}

  async execute(
    userId: string,
    data: {
      name?: Name;
      role?: string;
    }
  ): Promise<{ id: string; name: string; role: string }> {
    const id = UserId.fromString(userId);
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (data.name) {
      user.updateName(data.name, this.dateProvider);
    }
    
    if (data.role) {
      await user.updateRole(data.role, 'system', this.dateProvider, 'User update');
    }
    
    await this.userRepository.update(user);
    
    return {
      id: user.getId().getValue(),
      name: user.getName().getValue(),
      role: user.getRole()
    };
  }
}