import { Name } from '../../../domain/value-objects/Name';
import { UserId } from '../../../domain/value-objects/UserId';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { UserResponseDTO, UserResponseMapper } from '../../dtos/UserResponseDTO';

export interface UpdateUserInput {
  name?: Name;
  role?: string;
}

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, input: UpdateUserInput): Promise<UserResponseDTO> {
    const id = UserId.fromString(userId);
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (input.name !== undefined) {
      user.updateName(input.name);
    }

    if (input.role !== undefined) {
      user.updateRole(input.role);
    }

    await this.userRepository.update(user);
    return UserResponseMapper.toDTO(user);
  }
}