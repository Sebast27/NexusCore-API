import { BaseDomainEvent } from './BaseDomainEvent';

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
    this.validateRequired(this.oldRole, 'OldRole');
    this.validateRequired(this.newRole, 'NewRole');
    this.validateRequired(this.changedBy, 'ChangedBy');
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