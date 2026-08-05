import { z } from 'zod';
import { Role } from '../../domain/enums/Role';
import { UserResponseDTO, UserResponseMapper } from './UserResponseDTO';

export const UpdateUserSchema = z.object({
  userId: z.string()
    .uuid({ message: 'Invalid user ID format' }),

  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name cannot exceed 100 characters' })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-'.]+$/, { 
      message: 'Name contains invalid characters. Only letters, spaces, hyphens, apostrophes and periods allowed' 
    })
    .optional()
    .transform(val => val ? val.trim() : undefined),

  role: z.nativeEnum(Role)
    .optional(),

  updatedBy: z.string()
    .min(1, { message: 'UpdatedBy is required' }),

  reason: z.string()
    .optional()
    .default('User update'),
});


export type UpdateUserRequestDTO = z.infer<typeof UpdateUserSchema>;


export { UserResponseDTO, UserResponseMapper };