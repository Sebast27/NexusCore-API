// domain/events/BaseDomainEvent.ts
import { DomainEvent } from './DomainEvent';

export abstract class BaseDomainEvent implements DomainEvent {
  public readonly occurredOn: Date;

  constructor(
    public readonly eventName: string,
    protected readonly metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
    }
  ) {
    this.occurredOn = new Date();
  }

  protected validateRequired(value: any, field: string): void {
    if (value === undefined || value === null || value === '') {
      throw new Error(`${field} is required`);
    }
  }

  protected validateString(value: any, field: string): void {
    if (typeof value !== 'string') {
      throw new Error(`${field} must be a string`);
    }
  }

  protected validateUserId(userId: string): void {
    this.validateRequired(userId, 'UserId');
    this.validateString(userId, 'UserId');
  }

  protected validateEmail(email: string): void {
    this.validateRequired(email, 'Email');
    this.validateString(email, 'Email');
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
  }

  protected validateName(name: string): void {
    this.validateRequired(name, 'Name');
    this.validateString(name, 'Name');
    if (name.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      occurredOn: this.occurredOn.toISOString(),
      metadata: this.metadata || null,
    };
  }

  getEventName(): string {
    return this.eventName;
  }

  getOccurredOn(): Date {
    return this.occurredOn;
  }

  getMetadata(): Record<string, unknown> | undefined {
    return this.metadata;
  }
}