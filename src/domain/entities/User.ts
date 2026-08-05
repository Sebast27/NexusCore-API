import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { HashedPassword } from '../value-objects/HashedPassword';
import { PlainPassword } from '../value-objects/PlainPassword';
import { Name } from '../value-objects/Name';
import { Role } from '../enums/Role';
import { DomainEvent } from '../events/DomainEvent';
import { UserRegisteredEvent } from '../events/UserRegisteredEvent';
import { UserDeletedEvent } from '../events/UserDeletedEvent';
import { UserPasswordChangedEvent } from '../events/UserPasswordChangedEvent';
import { UserEmailVerifiedEvent } from '../events/UserEmailVerifiedEvent';
import { UserRoleChangedEvent } from '../events/UserRoleChangedEvent';
import { UserRestoredEvent } from '../events/UserRestoredEvent';
import { UserLoggedInEvent } from '../events/UserLoggedInEvent';
import { IDateProvider } from '../interfaces/IDateProvider';
import { randomBytes } from 'crypto';
import {
  UserAlreadyDeletedError,
  UserNotDeletedError,
  EmailAlreadyVerifiedError,
  InvalidVerificationTokenError,
  InvalidRoleError,
  UserLoginBlockedError,
} from '../errors';
import { ValidationError } from '../../application/errors/ValidationError';

export class User {
  private readonly id: UserId;
  private email: Email;
  private password: HashedPassword;
  private name: Name;
  private role: Role;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;
  private emailVerified: boolean = false;
  private verificationToken: string | null = null;
  private events: DomainEvent[] = [];

  private constructor(
    id: UserId,
    email: Email,
    password: HashedPassword,
    name: Name,
    role: Role,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null
  ) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.name = name;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  static async create(
    email: Email,
    plainPassword: PlainPassword,
    name: Name,
    role: Role,
    dateProvider: IDateProvider
  ): Promise<User> {
    const now = dateProvider.now();

    const hashedPassword = await plainPassword.hash();

    const user = new User(
      UserId.create(),
      email,
      hashedPassword,
      name,
      role,
      now,
      now,
      null
    );

    user.addEvent(new UserRegisteredEvent(
      user.getId().getValue(),
      email.getValue(),
      name.getValue(),
      role,
      undefined 
    ));

    return user;
  }

  // Getters
  getId(): UserId {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }

  getPassword(): HashedPassword {
    return this.password;
  }

  getName(): Name {
    return this.name;
  }

  getRole(): Role {
    return this.role;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  isEmailVerified(): boolean {
    return this.emailVerified;
  }

  // ============ EVENTOS ============
  getEvents(): DomainEvent[] {
    return this.events;
  }

  clearEvents(): void {
    this.events = [];
  }

  private addEvent(event: DomainEvent): void {
    this.events.push(event);
  }

  // ============ UPDATE METHODS ============
  updateName(name: Name, dateProvider: IDateProvider): void {
    this.name = name;
    this.updatedAt = dateProvider.now();
  }

  updateRole(
    role: Role,
    changedBy: string,
    dateProvider: IDateProvider,
    reason?: string
  ): void {
    if (!changedBy || changedBy.trim() === '') {
      throw new ValidationError('changedBy', 'changedBy is required');
    }

    const oldRole = this.role;
    this.role = role;
    this.updatedAt = dateProvider.now();
    
    this.addEvent(new UserRoleChangedEvent(
      this.id.getValue(),
      oldRole,
      role,
      changedBy,
      reason
    ));
  }

  async updatePassword(
    plainPassword: PlainPassword,
    changedBy: string,
    dateProvider: IDateProvider,
    reason?: 'user_initiated' | 'admin_reset' | 'system_forced' | 'security_breach'
  ): Promise<void> {
    if (!changedBy || changedBy.trim() === '') {
      throw new ValidationError('changedBy', 'changedBy is required');
    }
    this.password = await plainPassword.hash();
    this.updatedAt = dateProvider.now();
    
    this.addEvent(new UserPasswordChangedEvent(
      this.id.getValue(),
      changedBy,
      reason
    ));
  }

  // ============ SOFT DELETE ============
  softDelete(
    deletedBy: string,
    reason: string,
    dateProvider: IDateProvider
  ): void {
    if (!deletedBy || deletedBy.trim() === '') {
      throw new ValidationError('deletedBy', 'deletedBy is required');
    }
    if (!reason || reason.trim() === '') {
      throw new ValidationError('reason', 'reason is required');
    }
    if (this.isDeleted()) {
      throw new UserAlreadyDeletedError(this.id.getValue());
    }
    this.deletedAt = dateProvider.now();
    this.updatedAt = dateProvider.now();
    this.addEvent(new UserDeletedEvent(
      this.id.getValue(),
      deletedBy,
      reason
    ));
  }

  restore(
    restoredBy: string,
    dateProvider: IDateProvider,
    reason?: string
  ): void {
    if (!restoredBy || restoredBy.trim() === '') {
      throw new ValidationError('restoredBy', 'restoredBy is required');
    }
    if (!this.isDeleted()) {
      throw new UserNotDeletedError(this.id.getValue());
    }
    this.deletedAt = null;
    this.updatedAt = dateProvider.now();
    
    this.addEvent(new UserRestoredEvent(
      this.id.getValue(),
      restoredBy,
      reason
    ));
  }

  // ============ PERMANENT DELETE ============
  permanentDelete(deletedBy: string, reason: string): void {
    if (!deletedBy || deletedBy.trim() === '') {
      throw new ValidationError('deletedBy', 'deletedBy is required');
    }
    if (!reason || reason.trim() === '') {
      throw new ValidationError('reason', 'reason is required');
    }
    this.addEvent(new UserDeletedEvent(
      this.id.getValue(),
      deletedBy,
      reason
    ));
  }

  // ============ EMAIL VERIFICATION ============
  verifyEmail(token: string, dateProvider: IDateProvider): void {
    if (!token || token.trim() === '') {
      throw new ValidationError('token', 'Token cannot be empty');
    }
    if (this.emailVerified) {
      throw new EmailAlreadyVerifiedError(this.email.getValue());
    }
    if (this.verificationToken !== token) {
      throw new InvalidVerificationTokenError();
    }
    this.emailVerified = true;
    this.verificationToken = null;
    this.updatedAt = dateProvider.now();
    this.addEvent(new UserEmailVerifiedEvent(
      this.id.getValue(),
      this.email.getValue()
    ));
  }

  generateVerificationToken(): string {
    if (this.emailVerified) {
      throw new EmailAlreadyVerifiedError(this.email.getValue());
    }
    const token = randomBytes(32).toString('hex');
    this.verificationToken = token;
    return token;
  }

  loginSuccessful(
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
    }
  ): void {
    if (this.isDeleted()) {
      throw new UserLoginBlockedError(this.email.getValue(), 'User account is deleted');
    }

    this.addEvent(new UserLoggedInEvent(
      this.id.getValue(),
      this.email.getValue(),
      true,
      undefined,
      metadata
    ));
  }

  loginFailed(
    failureReason: string,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
    }
  ): void {
    if (!failureReason || failureReason.trim() === '') {
      throw new ValidationError('failureReason', 'failureReason is required');
    }
    if (this.isDeleted()) {
      throw new UserLoginBlockedError(this.email.getValue(), 'User account is deleted');
    }

    this.addEvent(new UserLoggedInEvent(
      this.id.getValue(),
      this.email.getValue(),
      false,
      failureReason,
      metadata
    ));
  }

  static reconstitute(
    id: UserId,
    email: Email,
    password: HashedPassword,
    name: Name,
    role: Role,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null
  ): User {
    return new User(
      id,
      email,
      password,
      name,
      role,
      createdAt,
      updatedAt,
      deletedAt
    );
  }
}