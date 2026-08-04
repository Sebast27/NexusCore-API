import { BaseDomainEvent } from './BaseDomainEvent';
import { ValidationError } from '../../application/errors/ValidationError';


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
    if (!this.success && (!this.failureReason || this.failureReason.trim() === '')) {
      throw new ValidationError('failureReason', 'Failure reason is required when login fails');
    }
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