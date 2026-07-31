import { DomainEvent } from './DomainEvent';

export class UserPasswordChangedEvent implements DomainEvent {
  public readonly eventName = 'user.password.changed';
  public readonly occurredOn: Date;

  constructor(public readonly userId: string) {
    this.validate();
    this.occurredOn = new Date();
  }

  private validate(): void {
    if (!this.userId || this.userId.trim() === '') {
      throw new Error('UserId is required');
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      userId: this.userId,
      occurredOn: this.occurredOn.toISOString(),
    };
  }
}