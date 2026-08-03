import { BaseDomainEvent } from './BaseDomainEvent';

export class UserEmailVerifiedEvent extends BaseDomainEvent {
  public readonly eventName = 'user.email.verified';

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly verifiedBy: 'user' | 'system' | 'admin' = 'user',
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
    }
  ) {
    super('user.email.verified', metadata);
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
      verifiedBy: this.verifiedBy,
    };
  }
}