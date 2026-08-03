import { IAuditRepository } from '../../../domain/interfaces/repositories/IAuditRepository';
import { DomainEvent } from '../../../domain/events/DomainEvent';

interface AuditLogResponse {
  eventName: string;
  occurredOn: Date;
  data: Record<string, unknown>;
}

export class GetGlobalAuditLogUseCase {
  constructor(private readonly auditRepository: IAuditRepository) {}

  async execute(
    filters: {
      eventName?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<AuditLogResponse[]> {
    let events: DomainEvent[] = [];

    if (filters.eventName) {
      events = await this.auditRepository.findByEventName(filters.eventName);
    } else if (filters.startDate && filters.endDate) {
      events = await this.auditRepository.findByDateRange(
        filters.startDate,
        filters.endDate
      );
    } else {
      events = await this.auditRepository.findAll(
        filters.limit || 100,
        filters.offset || 0
      );
    }

    return events.map(event => ({
      eventName: event.eventName,
      occurredOn: event.occurredOn,
      data: this.extractEventData(event),
    }));
  }

  private extractEventData(event: any): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(event)) {
      if (typeof value !== 'function' && key !== 'eventName' && key !== 'occurredOn') {
        data[key] = value;
      }
    }
    return data;
  }
}