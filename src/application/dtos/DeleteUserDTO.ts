import { z } from 'zod';

export const DeleteUserSchema = z.object({
  userId: z.string()
    .uuid({ message: 'Invalid user ID format' }),

  deletedBy: z.string()
    .min(1, { message: 'DeletedBy is required' }),

  reason: z.string()
    .optional()
    .default('User deleted by administrator'),
});

export type DeleteUserRequestDTO = z.infer<typeof DeleteUserSchema>;