import { IUserRepository } from '../../../domain/interfaces/IUserRepository';

export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    user.softDelete();
    await this.userRepository.update(user);
  }
}