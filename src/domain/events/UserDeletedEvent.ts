import { DomainEvent } from './DomainEvent';

export class UserDeletedEvent implements DomainEvent {
  public readonly eventName = 'user.deleted';
  public readonly occurredOn: Date;

  constructor(
    public readonly userId: string,
    public readonly deletedBy: string,
    public readonly reason: string
  ) {
    this.validate();
    this.occurredOn = new Date();
  }

  private validate(): void {
    if (!this.userId || this.userId.trim() === '') {
      throw new Error('UserId is required');
    }
    if (!this.deletedBy || this.deletedBy.trim() === '') {
      throw new Error('DeletedBy is required');
    }
    if (!this.reason || this.reason.trim() === '') {
      throw new Error('Reason is required');
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      userId: this.userId,
      deletedBy: this.deletedBy,
      reason: this.reason,
      occurredOn: this.occurredOn.toISOString(),
    };
  }
}