import { PrismaClient, Prisma } from '@prisma/client';
import { IAuditRepository } from '../../../domain/interfaces/repositories/IAuditRepository';
import { DomainEvent } from '../../../domain/events/DomainEvent';

export class PrismaAuditRepository implements IAuditRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(event: DomainEvent): Promise<void> {
    await this.prisma.domainEvent.create({
      data: {
        id: crypto.randomUUID(),
        aggregateId: this.extractAggregateId(event),
        aggregateType: 'User',
        eventName: event.eventName,
        eventData: this.serializeEvent(event) as Prisma.InputJsonValue,
        occurredOn: event.occurredOn,
      },
    });
  }

  async saveMany(events: DomainEvent[]): Promise<void> {
    if (events.length === 0) return;
    
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

  async findByAggregateId(aggregateId: string): Promise<DomainEvent[]> {
    const records = await this.prisma.domainEvent.findMany({
      where: { aggregateId },
      orderBy: { occurredOn: 'desc' },
    });
    
    return records.map(record => this.deserializeEvent(record));
  }

  async findByEventName(eventName: string): Promise<DomainEvent[]> {
    const records = await this.prisma.domainEvent.findMany({
      where: { eventName },
      orderBy: { occurredOn: 'desc' },
    });
    
    return records.map(record => this.deserializeEvent(record));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<DomainEvent[]> {
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
  }

  async findAll(limit: number = 100, offset: number = 0): Promise<DomainEvent[]> {
    const records = await this.prisma.domainEvent.findMany({
      take: limit,
      skip: offset,
      orderBy: { occurredOn: 'desc' },
    });
    
    return records.map(record => this.deserializeEvent(record));
  }

  async getEventCountByType(): Promise<Record<string, number>> {
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
  }

  private extractAggregateId(event: DomainEvent): string {
    return (event as any).userId || '';
  }

  private serializeEvent(event: DomainEvent): any {
    if (typeof (event as any).toJSON === 'function') {
      return (event as any).toJSON();
    }
    
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(event)) {
      if (typeof value !== 'function' && key !== 'eventName' && key !== 'occurredOn') {
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