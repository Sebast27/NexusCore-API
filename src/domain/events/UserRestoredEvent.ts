import { BaseDomainEvent } from './BaseDomainEvent';

export class UserRestoredEvent extends BaseDomainEvent {
  public readonly eventName = 'user.restored';

  constructor(
    public readonly userId: string,
    public readonly restoredBy: string,
    public readonly reason?: string,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
    }
  ) {
    super('user.restored', metadata);
    this.validate();
  }

  private validate(): void {
    this.validateUserId(this.userId);
    this.validateRequired(this.restoredBy, 'RestoredBy');
    this.validateString(this.restoredBy, 'RestoredBy');
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      userId: this.userId,
      restoredBy: this.restoredBy,
      reason: this.reason || null,
    };
  }
}