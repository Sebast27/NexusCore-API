import { PrismaClient, Role as PrismaRole, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { User } from '../../../domain/entities/User';
import { UserId } from '../../../domain/value-objects/UserId';
import { Email } from '../../../domain/value-objects/Email';
import { HashedPassword } from '../../../domain/value-objects/HashedPassword';
import { Name } from '../../../domain/value-objects/Name';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { RepositoryError } from '../../errors/RepositoryError';
import { DatabaseError } from '../../errors/DatabaseError';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Guardar usuario
        await tx.user.create({
          data: {
            id: user.getId().getValue(),
            email: user.getEmail().getValue(),
            password: user.getPassword().getValue(),
            name: user.getName().getValue(),
            role: user.getRole() as PrismaRole,
            createdAt: user.getCreatedAt(),
            updatedAt: user.getUpdatedAt(),
            deletedAt: user.getDeletedAt(),
          },
        });

        // 2. Guardar eventos en la misma transacción
        const events = user.getEvents();
        if (events.length > 0) {
          await this.saveEventsInTransaction(tx, events);
          user.clearEvents();
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new DatabaseError(
            `Unique constraint violation: ${error.meta?.target}`,
            error
          );
        }
      }
      throw RepositoryError.saveFailed('UserRepository', error);
    }
  }

  async update(user: User): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Actualizar usuario
        await tx.user.update({
          where: { id: user.getId().getValue() },
          data: {
            email: user.getEmail().getValue(),
            password: user.getPassword().getValue(),
            name: user.getName().getValue(),
            role: user.getRole() as PrismaRole,
            updatedAt: user.getUpdatedAt(),
            deletedAt: user.getDeletedAt(),
          },
        });

        // 2. Guardar eventos en la misma transacción
        const events = user.getEvents();
        if (events.length > 0) {
          await this.saveEventsInTransaction(tx, events);
          user.clearEvents();
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new DatabaseError(
            `Unique constraint violation: ${error.meta?.target}`,
            error
          );
        }
        if (error.code === 'P2025') {
          throw new DatabaseError('Record not found', error);
        }
      }
      throw RepositoryError.updateFailed('UserRepository', error);
    }
  }

  async findByEmail(email: Email): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.getValue() },
      });
      return user ? this.toDomain(user) : null;
    } catch (error) {
      throw RepositoryError.findByEmailFailed('UserRepository', error);
    }
  }

  async findById(id: UserId): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: id.getValue() },
      });
      return user ? this.toDomain(user) : null;
    } catch (error) {
      throw RepositoryError.findByIdFailed('UserRepository', error);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      return users.map(user => this.toDomain(user));
    } catch (error) {
      throw RepositoryError.findFailed('UserRepository', error);
    }
  }

  async delete(id: UserId): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id: id.getValue() },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('Record not found', error);
        }
      }
      throw RepositoryError.deleteFailed('UserRepository', error);
    }
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  private toDomain(prismaUser: any): User {
    const id = UserId.fromString(prismaUser.id);
    const email = Email.create(prismaUser.email);
    const password = HashedPassword.fromHash(prismaUser.password);
    const name = Name.create(prismaUser.name);

    return User.reconstitute(
      id,
      email,
      password,
      name,
      prismaUser.role,
      prismaUser.createdAt,
      prismaUser.updatedAt,
      prismaUser.deletedAt
    );
  }

  private async saveEventsInTransaction(
    tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
    events: any[]
  ): Promise<void> {
    await tx.domainEvent.createMany({
      data: events.map(event => ({
        id: randomUUID(),
        aggregateId: this.extractAggregateId(event),
        aggregateType: 'User',
        eventName: event.eventName,
        eventData: this.serializeEvent(event) as Prisma.InputJsonValue,
        occurredOn: event.occurredOn,
      })),
    });
  }

  private extractAggregateId(event: any): string {
    return event.userId || '';
  }

  private serializeEvent(event: any): Prisma.JsonValue {
    if (typeof event.toJSON === 'function') {
      return event.toJSON() as Prisma.JsonValue;
    }
    return {} as Prisma.JsonValue;
  }
}