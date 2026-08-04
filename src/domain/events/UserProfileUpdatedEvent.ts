import { BaseDomainEvent } from './BaseDomainEvent';

export class UserProfileUpdatedEvent extends BaseDomainEvent {
  public readonly eventName = 'user.profile.updated';

  constructor(
    public readonly userId: string,
    public readonly oldName: string,
    public readonly newName: string,
    public readonly oldEmail?: string,
    public readonly newEmail?: string,
    public readonly updatedBy: string = 'user',
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
    }
  ) {
    super('user.profile.updated', metadata);
    this.validate();
  }

  private validate(): void {
    this.validateUserId(this.userId);
    this.validateName(this.oldName);
    this.validateName(this.newName);
    this.validateRequired(this.updatedBy, 'updatedBy');
    this.validateString(this.updatedBy, 'updatedBy');

    if (this.oldEmail) {
      this.validateEmail(this.oldEmail);
    }
    if (this.newEmail) {
      this.validateEmail(this.newEmail);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      userId: this.userId,
      oldName: this.oldName,
      newName: this.newName,
      oldEmail: this.oldEmail || null,
      newEmail: this.newEmail || null,
      updatedBy: this.updatedBy,
    };
  }
}