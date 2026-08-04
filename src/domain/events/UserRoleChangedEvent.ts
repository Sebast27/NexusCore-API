import { BaseDomainEvent } from './BaseDomainEvent';
import { ValidationError } from '../../application/errors/ValidationError';

export class UserRoleChangedEvent extends BaseDomainEvent {
  public readonly eventName = 'user.role.changed';

  constructor(
    public readonly userId: string,
    public readonly oldRole: string,
    public readonly newRole: string,
    public readonly changedBy: string,
    public readonly reason?: string,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
    }
  ) {
    super('user.role.changed', metadata);
    this.validate();
  }

  private validate(): void {
    this.validateUserId(this.userId);
    this.validateRequired(this.oldRole, 'oldRole');
    this.validateString(this.oldRole, 'oldRole');
    this.validateRequired(this.newRole, 'newRole');
    this.validateString(this.newRole, 'newRole');
    this.validateRequired(this.changedBy, 'changedBy');
    this.validateString(this.changedBy, 'changedBy');
    
    if (this.oldRole === this.newRole) {
      throw new ValidationError('role', 'New role must be different from old role');
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      userId: this.userId,
      oldRole: this.oldRole,
      newRole: this.newRole,
      changedBy: this.changedBy,
      reason: this.reason || null,
      metadata: this.metadata || null,
    };
  }
}