import { User } from '../../domain/entities/User';
import { Role } from '../../domain/enums/Role';

export interface UserResponseDTO {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export class UserResponseMapper {
  static toDTO(user: User): UserResponseDTO {
    return {
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      name: user.getName().getValue(),
      role: user.getRole(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt()
    };
  }
}