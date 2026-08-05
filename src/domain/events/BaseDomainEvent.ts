import { DomainEvent } from './DomainEvent';
import { ValidationError } from '../../application/errors/ValidationError';
import { InvalidEmailError } from '../errors/InvalidEmailError';

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
      throw new ValidationError(field, `${field} is required`);
    }
  }

  protected validateString(value: any, field: string): void {
    if (typeof value !== 'string') {
      throw new ValidationError(field, `${field} must be a string`);
    }
  }

  protected validateUserId(userId: string): void {
    this.validateRequired(userId, 'UserId');
    this.validateString(userId, 'UserId');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new ValidationError('userId', 'Invalid UUID v4 format');
    }
  }

  protected validateEmail(email: string): void {
    this.validateRequired(email, 'Email');
    this.validateString(email, 'Email');
    if (!email.includes('@')) {
      throw new InvalidEmailError(email, 'Invalid email format');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new InvalidEmailError(email, 'Invalid email format');
    }
  }

  protected validateName(name: string): void {
    this.validateRequired(name, 'Name');
    this.validateString(name, 'Name');
    if (name.length < 2) {
      throw new ValidationError('name', 'Name must be at least 2 characters');
    }
    if (name.length > 100) {
      throw new ValidationError('name', 'Name cannot exceed 100 characters');
    }
  }

  protected validateIpAddress(ip: string): void {
    this.validateRequired(ip, 'ipAddress');
    this.validateString(ip, 'ipAddress');
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(ip)) {
      const parts = ip.split('.').map(Number);
      if (parts.every(part => part >= 0 && part <= 255)) {
        return;
      }
    }
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (ipv6Regex.test(ip)) {
      return;
    }
    throw new ValidationError('ipAddress', 'Invalid IP address format');
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