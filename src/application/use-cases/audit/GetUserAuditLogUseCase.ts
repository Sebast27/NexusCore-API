import { IAuditRepository } from '../../../domain/interfaces/repositories/IAuditRepository';

interface AuditLogResponse {
  eventName: string;
  occurredOn: Date;
  data: Record<string, unknown>;
}

export class GetUserAuditLogUseCase {
  constructor(private readonly auditRepository: IAuditRepository) {}

  async execute(userId: string): Promise<AuditLogResponse[]> {
    const events = await this.auditRepository.findByAggregateId(userId);
    
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