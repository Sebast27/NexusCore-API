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
    role: string,
    dateProvider: IDateProvider
  ): Promise<User> {
    const validRole = User.validateRole(role);
    const now = dateProvider.now();

    const hashedPassword = await plainPassword.hash();

    const user = new User(
      UserId.create(),
      email,
      hashedPassword,
      name,
      validRole,
      now,
      now,
      null
    );

    user.addEvent(new UserRegisteredEvent(
      user.getId().getValue(),
      email.getValue(),
      name.getValue(),
      validRole,
      undefined 
    ));

    return user;
  }

  private static validateRole(role: string): Role {
    const validRoles = Object.values(Role);
    if (!validRoles.includes(role as Role)) {
      throw new Error(`Invalid role: ${role}`);
    }
    return role as Role;
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
    role: string,
    changedBy: string,
    dateProvider: IDateProvider,
    reason?: string
  ): void {
    const oldRole = this.role;
    const validRole = User.validateRole(role);
    this.role = validRole;
    this.updatedAt = dateProvider.now();
    
    this.addEvent(new UserRoleChangedEvent(
      this.id.getValue(),
      oldRole,
      validRole,
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
    if (this.isDeleted()) {
      throw new Error('User is already deleted');
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
    if (!this.isDeleted()) {
      throw new Error('User is not deleted');
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
    this.addEvent(new UserDeletedEvent(
      this.id.getValue(),
      deletedBy,
      reason
    ));
  }

  // ============ EMAIL VERIFICATION ============
  verifyEmail(token: string, dateProvider: IDateProvider): void {
    if (this.emailVerified) {
      throw new Error('Email already verified');
    }
    if (this.verificationToken !== token) {
      throw new Error('Invalid verification token');
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
      throw new Error('Email already verified');
    }
    const token = randomBytes(32).toString('hex');
    this.verificationToken = token;
    return token;
  }

  loginSuccessful(
    email: string,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
    }
  ): void {
    if (this.isDeleted()) {
      throw new Error('Cannot login: user is deleted');
    }

    this.addEvent(new UserLoggedInEvent(
      this.id.getValue(),
      email,
      true,
      undefined,
      metadata
    ));
  }

  loginFailed(
    email: string,
    failureReason: string,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
    }
  ): void {
    if (this.isDeleted()) {
      throw new Error('Cannot login: user is deleted');
    }

    this.addEvent(new UserLoggedInEvent(
      this.id.getValue(),
      email,
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