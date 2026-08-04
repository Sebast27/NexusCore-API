import { User } from '../../domain/entities/User';
import { Role } from '../../domain/enums/Role';

export interface UserResponseDTO {
  id: string;
  email: string;
  name: string;
  role: Role;
  emailVerified: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class UserResponseMapper {
  static toDTO(user: User): UserResponseDTO {
    return {
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      name: user.getName().getValue(),
      role: user.getRole(),
      emailVerified: user.isEmailVerified(),
      isDeleted: !!user.getDeletedAt(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
      deletedAt: user.getDeletedAt()
    };
  }

  // Método para múltiples usuarios
  static toDTOList(users: User[]): UserResponseDTO[] {
    return users.map(user => UserResponseMapper.toDTO(user));
  }
}