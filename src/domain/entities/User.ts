import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';
import { Role } from '../enums/Role';
import { randomUUID } from 'crypto';

export class User {
  private static readonly VALID_ROLES = Object.values(Role);
  
  private readonly id: string;
  private email: Email;
  private password: Password;
  private name: string;
  private role: Role;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;

  private constructor(
    id: string,
    email: Email,
    password: Password,
    name: string,
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
    name: string,
    role: string
  ): User {
    const validRole = User.validateRole(role);
    const now = new Date();

    return new User(
      randomUUID(),
      email,
      password,
      name.trim(),
      validRole,
      now,
      now,
      null
    );
  }

  private static validateRole(role: string): Role {
    if (!User.VALID_ROLES.includes(role as Role)) {
      throw new Error(`Invalid role: ${role}`);
    }
    return role as Role;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }

  getPassword(): Password {
    return this.password;
  }

  getName(): string {
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

  // Update methods
  updateName(name: string): void {
    if (!name || name.trim() === '') {
      throw new Error('Name cannot be empty');
    }
    this.name = name.trim();
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
  }

  // Soft delete methods
  softDelete(): void {
    if (this.isDeleted()) {
      throw new Error('User is already deleted');
    }
    this.deletedAt = new Date();
  }

  restore(): void {
    if (!this.isDeleted()) {
      throw new Error('User is not deleted');
    }
    this.deletedAt = null;
  }
}