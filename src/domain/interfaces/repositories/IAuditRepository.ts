import { DomainEvent } from '../../events/DomainEvent';

export interface IAuditRepository {
  save(event: DomainEvent): Promise<void>;
  saveMany(events: DomainEvent[]): Promise<void>;
  findByAggregateId(aggregateId: string): Promise<DomainEvent[]>;
  findByEventName(eventName: string): Promise<DomainEvent[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<DomainEvent[]>;
  findAll(limit?: number, offset?: number): Promise<DomainEvent[]>;
  getEventCountByType(): Promise<Record<string, number>>;
}