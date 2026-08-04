import { AuditLogMapper } from '../../../application/dtos/AuditLogMapper';
import { IAuditRepository } from '../../../domain/interfaces/repositories/IAuditRepository';
import { AuditLogPaginatedResponseDTO} from '../../dtos/AuditResponseDTO';
import { ValidationError } from '../../errors/ValidationError';

export interface GetGlobalAuditLogFilters {
  eventName?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class GetGlobalAuditLogUseCase {
  constructor(
    private readonly _auditRepository: IAuditRepository
  ) {}

  async execute(filters: GetGlobalAuditLogFilters): Promise<AuditLogPaginatedResponseDTO> {
    // 1. Validar filtros
    if (filters.limit !== undefined && filters.limit < 1) {
      throw new ValidationError('limit', 'Limit must be at least 1');
    }
    if (filters.limit !== undefined && filters.limit > 100) {
      throw new ValidationError('limit', 'Limit cannot exceed 100');
    }
    if (filters.offset !== undefined && filters.offset < 0) {
      throw new ValidationError('offset', 'Offset must be at least 0');
    }
    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
      throw new ValidationError('dateRange', 'Start date must be before end date');
    }

    // 2. Obtener eventos según filtros
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    let events = [];

    if (filters.eventName) {
      events = await this._auditRepository.findByEventName(filters.eventName);
    } else if (filters.startDate && filters.endDate) {
      events = await this._auditRepository.findByDateRange(
        filters.startDate,
        filters.endDate
      );
    } else {
      events = await this._auditRepository.findAll(limit, offset);
    }

    // 3. Usar el mapper con paginación
    return AuditLogMapper.toPaginatedResponse(events, events.length, limit, offset);
  }
}