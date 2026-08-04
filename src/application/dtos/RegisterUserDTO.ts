import { z } from 'zod';
import { Role } from '../../domain/enums/Role';
import { User } from '../../domain/entities/User';

// Configurar Zod 
export const RegisterUserSchema = z.object({
  email: z.string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email format' })
    .max(254, { message: 'Email cannot exceed 254 characters' })
    .transform(val => val.toLowerCase().trim()),

  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'Password must contain at least one special character' }),

  name: z.string()
    .min(1, { message: 'Name is required' })
    .max(100, { message: 'Name cannot exceed 100 characters' })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-'.]+$/, { message: 'Name contains invalid characters. Only letters, spaces, hyphens, apostrophes and periods allowed' })
    .transform(val => val.trim()),

  role: z.nativeEnum(Role)
    .optional()
    .default(Role.USER),
});

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;

export interface RegisterUserResponseDTO {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export class RegisterUserMapper {
  static toResponseDTO(user: User): RegisterUserResponseDTO {
    return {
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      name: user.getName().getValue(),
      role: user.getRole(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };
  }
}