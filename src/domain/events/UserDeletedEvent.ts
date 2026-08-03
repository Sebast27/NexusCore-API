import { BaseDomainEvent } from './BaseDomainEvent';

export class UserDeletedEvent extends BaseDomainEvent {
  public readonly eventName = 'user.deleted';

  constructor(
    public readonly userId: string,
    public readonly deletedBy: string,
    public readonly reason: string,
    public readonly permanent: boolean = false,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
    }
  ) {
    super('user.deleted', metadata);
    this.validate();
  }

  private validate(): void {
    this.validateUserId(this.userId);
    this.validateRequired(this.deletedBy, 'DeletedBy');
    this.validateString(this.deletedBy, 'DeletedBy');
    this.validateRequired(this.reason, 'Reason');
    this.validateString(this.reason, 'Reason');
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      userId: this.userId,
      deletedBy: this.deletedBy,
      reason: this.reason,
      permanent: this.permanent,
    };
  }
}