import { ApplicationError } from './ApplicationError';

export class BusinessRuleViolationError extends ApplicationError {
  constructor(
    rule: string,
    message: string,
    metadata?: Record<string, any>
  ) {
    super(
      `Business rule violation: ${message}`,
      'BUSINESS_RULE_VIOLATION',
      409,
      { rule, ...metadata }
    );
  }

  // === Usuario ===
  static userAlreadyDeleted(userId: string): BusinessRuleViolationError {
    return new BusinessRuleViolationError(
      'user_already_deleted',
      `User with id ${userId} is already deleted`,
      { userId }
    );
  }

  static cannotUpdateDeletedUser(userId: string): BusinessRuleViolationError {
    return new BusinessRuleViolationError(
      'cannot_update_deleted_user',
      `Cannot update a deleted user with id ${userId}`,
      { userId }
    );
  }

  static cannotDeleteAdmin(): BusinessRuleViolationError {
    return new BusinessRuleViolationError(
      'cannot_delete_admin',
      'Cannot delete an admin user'
    );
  }

  static userLoginBlocked(email: string, reason: string): BusinessRuleViolationError {
    return new BusinessRuleViolationError(
      'user_login_blocked',
      `User with email ${email} cannot login: ${reason}`,
      { email, reason }
    );
  }

  // === Login Attempt ===
  static tooManyFailedAttempts(email: string, maxAttempts: number): BusinessRuleViolationError {
    return new BusinessRuleViolationError(
      'too_many_failed_attempts',
      `User with email ${email} has exceeded maximum failed attempts (${maxAttempts})`,
      { email, maxAttempts }
    );
  }

  // === Roles ===
  static cannotChangeOwnRole(userId: string): BusinessRuleViolationError {
    return new BusinessRuleViolationError(
      'cannot_change_own_role',
      `User with id ${userId} cannot change their own role`,
      { userId }
    );
  }

  static cannotAssignHigherRole(role: string): BusinessRuleViolationError {
    return new BusinessRuleViolationError(
      'cannot_assign_higher_role',
      `Cannot assign role ${role} to a user`,
      { role }
    );
  }
}