import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { UserResponseDTO, UserResponseMapper } from '../../dtos/UserResponseDTO';

export class GetUsersUseCase {
  constructor(
    private readonly userRepository: IUserRepository
  ) {}

  async execute(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.findAll();
    return UserResponseMapper.toDTOList(users);
  }
}