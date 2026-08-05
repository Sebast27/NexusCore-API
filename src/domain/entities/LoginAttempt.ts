import { LoginAttemptId } from '../value-objects/LoginAttemptId';
import { Email } from '../value-objects/Email';
import { IpAddress } from '../value-objects/IpAddress';
import { UserId } from '../value-objects/UserId';
import { DomainEvent } from '../events/DomainEvent';
import { UserLoginAttemptedEvent } from '../events/UserLoginAttemptedEvent';
import { ValidationError } from '../../application/errors/ValidationError';

export class LoginAttempt {
  private readonly id: LoginAttemptId;
  private readonly email: Email;
  private readonly ipAddress: IpAddress;
  private readonly userAgent?: string;
  private readonly success: boolean;
  private readonly failureReason?: string;
  private readonly userId?: UserId;
  private readonly attemptedAt: Date;
  private events: DomainEvent[] = [];

  private constructor(
    id: LoginAttemptId,
    email: Email,
    ipAddress: IpAddress,
    success: boolean,
    userId?: UserId,
    userAgent?: string,
    failureReason?: string,
    attemptedAt?: Date
  ) {
    this.id = id;
    this.email = email;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.success = success;
    this.failureReason = failureReason;
    this.userId = userId;
    this.attemptedAt = attemptedAt || new Date();
  }

  static createSuccessful(
    email: Email,
    ipAddress: IpAddress,
    userId: UserId,
    metadata?: {
      userAgent?: string;
      correlationId?: string;
    }
  ): LoginAttempt {
    if (!email) {
      throw new ValidationError('email', 'Email is required');
    }
    if (!ipAddress) {
      throw new ValidationError('ipAddress', 'IP address is required');
    }
    if (!userId) {
      throw new ValidationError('userId', 'User ID is required for successful login');
    }
    const attempt = new LoginAttempt(
      LoginAttemptId.create(),
      email,
      ipAddress,
      true, 
      userId,
      metadata?.userAgent,
    );

    attempt.addEvent(new UserLoginAttemptedEvent(
      attempt.getId().getValue(),
      email.getValue(),
      ipAddress.getValue(),
      true,
      undefined,
      userId.getValue(),
      metadata
    ));

    return attempt;
  }

  static createFailed(
    email: Email,
    ipAddress: IpAddress,
    failureReason: string,
    userId?: UserId,
    metadata?: {
      userAgent?: string;
      correlationId?: string;
    }
  ): LoginAttempt {

    if (!email) {
      throw new ValidationError('email', 'Email is required');
    }
    if (!ipAddress) {
      throw new ValidationError('ipAddress', 'IP address is required');
    }
    if (!failureReason || failureReason.trim() === '') {
      throw new ValidationError('failureReason', 'Failure reason is required');
    }

    const attempt = new LoginAttempt(
      LoginAttemptId.create(),
      email,
      ipAddress,
      false, 
      userId,
      metadata?.userAgent,
      failureReason
    );

    attempt.addEvent(new UserLoginAttemptedEvent(
      attempt.getId().getValue(),
      email.getValue(),
      ipAddress.getValue(),
      false,
      failureReason,
      userId?.getValue(),
      metadata
    ));

    return attempt;
  }

  // Getters
  getId(): LoginAttemptId {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }

  getIpAddress(): IpAddress {
    return this.ipAddress;
  }

  getUserAgent(): string | undefined {
    return this.userAgent;
  }

  isSuccess(): boolean {
    return this.success;
  }

  getFailureReason(): string | undefined {
    return this.failureReason;
  }

  getUserId(): UserId | undefined {
    return this.userId;
  }

  getAttemptedAt(): Date {
    return this.attemptedAt;
  }

  // Eventos
  getEvents(): DomainEvent[] {
    return this.events;
  }

  clearEvents(): void {
    this.events = [];
  }

  private addEvent(event: DomainEvent): void {
    this.events.push(event);
  }

  // Reconstitute
  static reconstitute(
    id: LoginAttemptId,
    email: Email,
    ipAddress: IpAddress,
    success: boolean,
    userId?: UserId,
    userAgent?: string,
    failureReason?: string,
    attemptedAt?: Date
  ): LoginAttempt {
    return new LoginAttempt(
      id,
      email,
      ipAddress,
      success,
      userId,
      userAgent,
      failureReason,
      attemptedAt
    );
  }
}