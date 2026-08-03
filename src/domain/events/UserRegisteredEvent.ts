import { BaseDomainEvent } from './BaseDomainEvent';

export class UserRegisteredEvent extends BaseDomainEvent {
  public readonly eventName = 'user.registered';

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: string,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
    }
  ) {
    super('user.registered', metadata);
    this.validate();
  }

  private validate(): void {
    this.validateUserId(this.userId);
    this.validateEmail(this.email);
    this.validateName(this.name);
    this.validateRequired(this.role, 'Role');
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      userId: this.userId,
      email: this.email,
      name: this.name,
      role: this.role,
    };
  }
}