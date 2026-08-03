import { BaseDomainEvent } from './BaseDomainEvent';

export class UserPasswordChangedEvent extends BaseDomainEvent {
  public readonly eventName = 'user.password.changed';

  constructor(
    public readonly userId: string,
    public readonly changedBy: string,
    public readonly changedReason?: 'user_initiated' | 'admin_reset' | 'system_forced' | 'security_breach',
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
    }
  ) {
    super('user.password.changed', metadata);
    this.validate();
  }

  private validate(): void {
    this.validateUserId(this.userId);
    this.validateRequired(this.changedBy, 'ChangedBy');
    this.validateString(this.changedBy, 'ChangedBy');
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      userId: this.userId,
      changedBy: this.changedBy,
      changedReason: this.changedReason || null,
    };
  }
}