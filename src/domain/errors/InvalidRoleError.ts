import { DomainError } from './DomainError';

export class InvalidRoleError extends DomainError {
  constructor(role: string, validRoles: string[]) {
    super(
      `Invalid role: ${role}. Valid roles are: ${validRoles.join(', ')}`,
      'INVALID_ROLE',
      { role, validRoles }
    );
  }
}