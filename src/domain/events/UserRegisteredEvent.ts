import { DomainEvent } from './DomainEvent';

export class UserRegisteredEvent implements DomainEvent {
  public readonly eventName = 'user.registered';
  public readonly occurredOn: Date;

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string
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
    if (!this.name || this.name.trim() === '') {
      throw new Error('Name is required');
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      userId: this.userId,
      email: this.email,
      name: this.name,
      occurredOn: this.occurredOn.toISOString(),
    };
  }
}