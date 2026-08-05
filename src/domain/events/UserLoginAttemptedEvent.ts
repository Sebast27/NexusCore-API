import { ValidationError } from '../../application/errors/ValidationError';
import { BaseDomainEvent } from './BaseDomainEvent';

export class UserLoginAttemptedEvent extends BaseDomainEvent {
  public readonly eventName = 'user.login.attempted';

  constructor(
    public readonly loginAttemptId: string,
    public readonly email: string,
    public readonly ipAddress: string,
    public readonly success: boolean,
    public readonly failureReason?: string,
    public readonly userId?: string,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
    }
  ) {
    super('user.login.attempted', metadata);
    this.validate();
  }

  private validate(): void {
    this.validateRequired(this.loginAttemptId, 'LoginAttemptId');
    this.validateEmail(this.email);
    this.validateRequired(this.ipAddress, 'IpAddress');
    this.validateIpAddress(this.ipAddress);
    if (!this.success && (!this.failureReason || this.failureReason.trim() === '')) {
      throw new ValidationError('failureReason', 'Failure reason is required when login fails');
    }
    if (this.userId) {
      this.validateUserId(this.userId);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      loginAttemptId: this.loginAttemptId,
      userId: this.userId || null,
      email: this.email,
      ipAddress: this.ipAddress,
      success: this.success,
      failureReason: this.failureReason || null,
    };
  }
}