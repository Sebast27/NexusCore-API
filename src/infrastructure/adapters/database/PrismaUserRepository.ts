import { PrismaClient, Role as PrismaRole, Prisma } from '@prisma/client';
import { User } from '../../../domain/entities/User';
import { UserId } from '../../../domain/value-objects/UserId';
import { Email } from '../../../domain/value-objects/Email';
import { HashedPassword } from '../../../domain/value-objects/HashedPassword';
import { Name } from '../../../domain/value-objects/Name';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.getId().getValue(),
        email: user.getEmail().getValue(),
        password: user.getPassword().getValue(), // ✅ HashedPassword
        name: user.getName().getValue(),
        role: user.getRole() as PrismaRole,
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
        deletedAt: user.getDeletedAt(),
      },
    });

    // Guardar eventos de dominio
    const events = user.getEvents();
    if (events.length > 0) {
      await this.saveEvents(events);
      user.clearEvents();
    }
  }

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.getValue() },
    });

    if (!user) return null;

    return this.toDomain(user);
  }

  async findById(id: UserId): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: id.getValue() },
    });

    if (!user) return null;

    return this.toDomain(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
    });

    return users.map((user) => this.toDomain(user));
  }

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
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

    // Guardar eventos de dominio
    const events = user.getEvents();
    if (events.length > 0) {
      await this.saveEvents(events);
      user.clearEvents();
    }
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({
      where: { id: id.getValue() },
    });
  }

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

  private serializeEvent(event: any): Prisma.JsonValue {
    if (typeof event.toJSON === 'function') {
      return event.toJSON() as Prisma.JsonValue;
    }
    return {} as Prisma.JsonValue;
  }

  private async saveEvents(events: any[]): Promise<void> {
    // Guardar eventos en la tabla domain_events
    await this.prisma.domainEvent.createMany({
      data: events.map(event => ({
        id: crypto.randomUUID(),
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
}