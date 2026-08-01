import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';
import { Name } from '../value-objects/Name';
import { Role } from '../enums/Role';
import { DomainEvent } from '../events/DomainEvent';
import { UserRegisteredEvent } from '../events/UserRegisteredEvent';
import { UserDeletedEvent } from '../events/UserDeletedEvent';
import { UserPasswordChangedEvent } from '../events/UserPasswordChangedEvent';
import { UserEmailVerifiedEvent } from '../events/UserEmailVerifiedEvent';
import { randomBytes } from 'crypto';

export class User {
  private readonly id: UserId;
  private email: Email;
  private password: Password;
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
    password: Password,
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

  static create(
    email: Email,
    password: Password,
    name: Name,
    role: string
  ): User {
    const validRole = User.validateRole(role);
    const now = new Date();

    const user = new User(
      UserId.create(),
      email,
      password,
      name,
      validRole,
      now,
      now,
      null
    );

    user.addEvent(new UserRegisteredEvent(
      user.getId().getValue(),
      email.getValue(),
      name.getValue()
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

  getPassword(): Password {
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
  updateName(name: Name): void {
    this.name = name;
    this.updatedAt = new Date();
  }

  updateRole(role: string): void {
    const validRole = User.validateRole(role);
    this.role = validRole;
    this.updatedAt = new Date();
  }

  updatePassword(password: Password): void {
    this.password = password;
    this.updatedAt = new Date();
    this.addEvent(new UserPasswordChangedEvent(this.id.getValue()));
  }

  // ============ SOFT DELETE ============
  softDelete(deletedBy: string, reason: string): void {
    if (this.isDeleted()) {
      throw new Error('User is already deleted');
    }
    this.deletedAt = new Date();
    this.updatedAt = new Date();
    this.addEvent(new UserDeletedEvent(
      this.id.getValue(),
      deletedBy,
      reason
    ));
  }

  restore(): void {
    if (!this.isDeleted()) {
      throw new Error('User is not deleted');
    }
    this.deletedAt = null;
    this.updatedAt = new Date();
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
  verifyEmail(token: string): void {
    if (this.emailVerified) {
      throw new Error('Email already verified');
    }
    if (this.verificationToken !== token) {
      throw new Error('Invalid verification token');
    }
    this.emailVerified = true;
    this.verificationToken = null;
    this.updatedAt = new Date();
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

  static reconstitute(
    id: UserId,
    email: Email,
    password: Password,
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