import { PrismaClient, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../domain/events/DomainEvent';
import { ILoginAttemptRepository } from '../../../domain/interfaces/repositories/ILoginAttemptRepository';
import { LoginAttempt } from '../../../domain/entities/LoginAttempt';
import { Email } from '../../../domain/value-objects/Email';
import { IpAddress } from '../../../domain/value-objects/IpAddress';
import { UserId } from '../../../domain/value-objects/UserId';
import { LoginAttemptId } from '../../../domain/value-objects/LoginAttemptId';
import { RepositoryError } from '../../../infrastructure/errors/RepositoryError';

export class PrismaLoginAttemptRepository implements ILoginAttemptRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(attempt: LoginAttempt): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Guardar intento de login
        await tx.loginAttempt.create({
          data: {
            id: attempt.getId().getValue(),
            email: attempt.getEmail().getValue(),
            ipAddress: attempt.getIpAddress().getValue(),
            userAgent: attempt.getUserAgent(),
            success: attempt.isSuccess(),
            failureReason: attempt.getFailureReason(),
            userId: attempt.getUserId()?.getValue(),
            attemptedAt: attempt.getAttemptedAt(),
          },
        });

        // 2. Guardar eventos en la misma transacción
        const events = attempt.getEvents();
        if (events.length > 0) {
          await this.saveEventsInTransaction(tx, events);
          attempt.clearEvents();
        }
      });
    } catch (error) {
      throw RepositoryError.saveFailed('LoginAttemptRepository', error);
    }
  }

  async saveMany(attempts: LoginAttempt[]): Promise<void> {
    if (attempts.length === 0) return;

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.loginAttempt.createMany({
          data: attempts.map(attempt => ({
            id: attempt.getId().getValue(),
            email: attempt.getEmail().getValue(),
            ipAddress: attempt.getIpAddress().getValue(),
            userAgent: attempt.getUserAgent(),
            success: attempt.isSuccess(),
            failureReason: attempt.getFailureReason(),
            userId: attempt.getUserId()?.getValue(),
            attemptedAt: attempt.getAttemptedAt(),
          })),
        });

        const allEvents = attempts.flatMap(attempt => attempt.getEvents());
        if (allEvents.length > 0) {
          await this.saveEventsInTransaction(tx, allEvents);
          attempts.forEach(attempt => attempt.clearEvents());
        }
      });
    } catch (error) {
      throw RepositoryError.saveFailed('LoginAttemptRepository', error);
    }
  }

  async findByEmail(email: Email, limit: number = 100): Promise<LoginAttempt[]> {
    const records = await this.prisma.loginAttempt.findMany({
      where: { email: email.getValue() },
      orderBy: { attemptedAt: 'desc' },
      take: limit,
    });

    return records.map(record => this.toDomain(record));
  }

  async findByIpAddress(ip: IpAddress, limit: number = 100): Promise<LoginAttempt[]> {
    const records = await this.prisma.loginAttempt.findMany({
      where: { ipAddress: ip.getValue() },
      orderBy: { attemptedAt: 'desc' },
      take: limit,
    });

    return records.map(record => this.toDomain(record));
  }

  async findByUserId(userId: UserId, limit: number = 100): Promise<LoginAttempt[]> {
    const records = await this.prisma.loginAttempt.findMany({
      where: { userId: userId.getValue() },
      orderBy: { attemptedAt: 'desc' },
      take: limit,
    });

    return records.map(record => this.toDomain(record));
  }

  async getRecentFailures(email: Email, minutes: number): Promise<number> {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);

    return this.prisma.loginAttempt.count({
      where: {
        email: email.getValue(),
        success: false,
        attemptedAt: { gte: cutoff },
      },
    });
  }

  async getFailuresByIp(ip: IpAddress, minutes: number): Promise<number> {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);

    return this.prisma.loginAttempt.count({
      where: {
        ipAddress: ip.getValue(),
        success: false,
        attemptedAt: { gte: cutoff },
      },
    });
  }

  private async saveEventsInTransaction(
    tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
    events: DomainEvent[]
  ): Promise<void> {
    await tx.domainEvent.createMany({
      data: events.map(event => ({
        id: randomUUID(),
        aggregateId: this.extractAggregateId(event),
        aggregateType: 'LoginAttempt',
        eventName: event.eventName,
        eventData: this.serializeEvent(event) as Prisma.InputJsonValue,
        occurredOn: event.occurredOn,
      })),
    });
  }

  private extractAggregateId(event: DomainEvent): string {
    return (event as any).loginAttemptId || '';
  }

  private serializeEvent(event: DomainEvent): any {
    if (typeof (event as any).toJSON === 'function') {
      return (event as any).toJSON();
    }
    return {};
  }

  private toDomain(record: any): LoginAttempt {
    return LoginAttempt.reconstitute(
      LoginAttemptId.fromString(record.id),
      Email.create(record.email),
      IpAddress.create(record.ipAddress),
      record.success,
      record.userId ? UserId.fromString(record.userId) : undefined,
      record.userAgent ?? undefined,
      record.failureReason ?? undefined,
      record.attemptedAt
    );
  }
}