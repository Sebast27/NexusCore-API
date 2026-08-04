import { PrismaClient, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { IAuditRepository } from '../../../domain/interfaces/repositories/IAuditRepository';
import { DomainEvent } from '../../../domain/events/DomainEvent';
import { RepositoryError } from '../../errors/RepositoryError';
import { DatabaseError } from '../../errors/DatabaseError';

export class PrismaAuditRepository implements IAuditRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(event: DomainEvent): Promise<void> {
    try {
      await this.prisma.domainEvent.create({
        data: {
          id: randomUUID(),
          aggregateId: this.extractAggregateId(event),
          aggregateType: this.extractAggregateType(event),
          eventName: event.eventName,
          eventData: this.serializeEvent(event) as Prisma.InputJsonValue,
          occurredOn: event.occurredOn,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DatabaseError(`Failed to save audit event: ${error.message}`, error);
      }
      throw RepositoryError.saveFailed('AuditRepository', error);
    }
  }

  async saveMany(events: DomainEvent[]): Promise<void> {
    if (events.length === 0) return;

    try {
      await this.prisma.domainEvent.createMany({
        data: events.map(event => ({
          id: randomUUID(),
          aggregateId: this.extractAggregateId(event),
          aggregateType: this.extractAggregateType(event),
          eventName: event.eventName,
          eventData: this.serializeEvent(event) as Prisma.InputJsonValue,
          occurredOn: event.occurredOn,
        })),
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DatabaseError(`Failed to save audit events: ${error.message}`, error);
      }
      throw RepositoryError.saveFailed('AuditRepository', error);
    }
  }

  async findByAggregateId(aggregateId: string): Promise<DomainEvent[]> {
    try {
      const records = await this.prisma.domainEvent.findMany({
        where: { aggregateId },
        orderBy: { occurredOn: 'desc' },
      });
      return records.map(record => this.deserializeEvent(record));
    } catch (error) {
      throw RepositoryError.findFailed('AuditRepository', error);
    }
  }

  async findByEventName(eventName: string): Promise<DomainEvent[]> {
    try {
      const records = await this.prisma.domainEvent.findMany({
        where: { eventName },
        orderBy: { occurredOn: 'desc' },
      });
      return records.map(record => this.deserializeEvent(record));
    } catch (error) {
      throw RepositoryError.findFailed('AuditRepository', error);
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<DomainEvent[]> {
    try {
      const records = await this.prisma.domainEvent.findMany({
        where: {
          occurredOn: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { occurredOn: 'desc' },
      });
      return records.map(record => this.deserializeEvent(record));
    } catch (error) {
      throw RepositoryError.findFailed('AuditRepository', error);
    }
  }

  async findAll(limit: number = 100, offset: number = 0): Promise<DomainEvent[]> {
    try {
      const records = await this.prisma.domainEvent.findMany({
        take: limit,
        skip: offset,
        orderBy: { occurredOn: 'desc' },
      });
      return records.map(record => this.deserializeEvent(record));
    } catch (error) {
      throw RepositoryError.findFailed('AuditRepository', error);
    }
  }

  async getEventCountByType(): Promise<Record<string, number>> {
    try {
      const results = await this.prisma.domainEvent.groupBy({
        by: ['eventName'],
        _count: {
          eventName: true,
        },
      });

      return results.reduce((acc, curr) => {
        acc[curr.eventName] = curr._count.eventName;
        return acc;
      }, {} as Record<string, number>);
    } catch (error) {
      throw new DatabaseError('Failed to get event count by type', error);
    }
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  private extractAggregateId(event: DomainEvent): string {
    // Buscar en propiedades comunes
    if ('userId' in event && typeof (event as any).userId === 'string') {
      return (event as any).userId;
    }
    if ('loginAttemptId' in event && typeof (event as any).loginAttemptId === 'string') {
      return (event as any).loginAttemptId;
    }
    if ('id' in event && typeof (event as any).id === 'string') {
      return (event as any).id;
    }
    return '';
  }

  private extractAggregateType(event: DomainEvent): string {
    // Determinar el tipo de agregado basado en el nombre del evento
    if (event.eventName.startsWith('user.')) {
      return 'User';
    }
    if (event.eventName.startsWith('login.')) {
      return 'LoginAttempt';
    }
    return 'Unknown';
  }

  private serializeEvent(event: DomainEvent): any {
    if (typeof (event as any).toJSON === 'function') {
      return (event as any).toJSON();
    }

    const data: Record<string, unknown> = {};
    const excludeKeys = ['eventName', 'occurredOn', 'metadata', 'events'];

    for (const [key, value] of Object.entries(event)) {
      if (typeof value === 'function') continue;
      if (excludeKeys.includes(key)) continue;

      // Si es un Value Object, extraer su valor
      if (value && typeof value === 'object' && 'getValue' in value) {
        data[key] = (value as any).getValue();
      } else {
        data[key] = value;
      }
    }
    return data;
  }

  private deserializeEvent(record: any): DomainEvent {
    return {
      eventName: record.eventName,
      occurredOn: record.occurredOn,
      ...record.eventData,
    } as DomainEvent;
  }
}