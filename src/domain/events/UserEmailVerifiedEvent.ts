import { DomainEvent } from './DomainEvent';

export class UserEmailVerifiedEvent implements DomainEvent {
  public readonly eventName = 'user.email.verified';
  public readonly occurredOn: Date;

  constructor(
    public readonly userId: string,
    public readonly email: string
  ) {
    this.validate();
    this.occurredOn = new Date();
  }

  private validate(): void {
    if (!this.userId || this.userId.trim() === '') {
      throw new Error('UserId is required');
    }
    if (!this.email || this.email.trim() === '') {
      throw new Error('Email is required');
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      userId: this.userId,
      email: this.email,
      occurredOn: this.occurredOn.toISOString(),
    };
  }
}