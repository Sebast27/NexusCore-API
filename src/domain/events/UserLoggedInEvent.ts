import { BaseDomainEvent } from './BaseDomainEvent';

export class UserLoggedInEvent extends BaseDomainEvent {
  public readonly eventName = 'user.logged.in';

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly success: boolean = true,
    public readonly failureReason?: string,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
    }
  ) {
    super('user.logged.in', metadata);
    this.validate();
  }

  private validate(): void {
    this.validateUserId(this.userId);
    this.validateEmail(this.email);
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      userId: this.userId,
      email: this.email,
      success: this.success,
      failureReason: this.failureReason || null,
    };
  }
}