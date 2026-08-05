import { DomainEvent } from '../../domain/events/DomainEvent';
import { AuditLogResponseDTO, AuditLogPaginatedResponseDTO } from '../dtos/AuditResponseDTO';

// Mapper para convertir eventos de dominio a DTOs de auditoría
// Encapsula toda la lógica de extracción de datos de eventos
export class AuditLogMapper {

  // Convierte un evento de dominio a AuditLogResponseDTO   
  static toResponseDTO(event: DomainEvent): AuditLogResponseDTO {
    return {
      id: this.extractId(event),
      eventName: event.eventName,
      occurredOn: event.occurredOn,
      data: this.extractEventData(event),
      metadata: this.extractMetadata(event),
    };
  }

  // Convierte una lista de eventos a AuditLogResponseDTO[]
  static toResponseDTOList(events: DomainEvent[]): AuditLogResponseDTO[] {
    return events.map(event => AuditLogMapper.toResponseDTO(event));
  }

  // Convierte una lista de eventos a respuesta paginada
  static toPaginatedResponse(
    events: DomainEvent[],
    total: number,
    limit: number,
    offset: number
  ): AuditLogPaginatedResponseDTO {
    return {
      data: AuditLogMapper.toResponseDTOList(events),
      pagination: {
        total,
        limit,
        offset,
        nextOffset: offset + limit < total ? offset + limit : undefined,
      },
    };
  }

  // Extrae el ID del evento
  // Busca en diferentes propiedades comunes
  private static extractId(event: DomainEvent): string {
    // Propiedades comunes de ID en eventos
    const idProperties = ['id', 'loginAttemptId', 'userId', 'aggregateId'];
    
    for (const prop of idProperties) {
      if (prop in event && typeof (event as any)[prop] === 'string') {
        const value = (event as any)[prop];
        if (value && value.trim() !== '') {
          return value;
        }
      }
    }

    // Fallback: combinar eventName con timestamp
    return `${event.eventName}-${event.occurredOn.getTime()}`;
  }

  // Extrae todos los datos del evento
  // Excluye propiedades internas y métodos
  private static extractEventData(event: DomainEvent): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    
    // Propiedades a excluir del data
    const excludeKeys = [
      'eventName',
      'occurredOn',
      'metadata',
      'events',       
      'clearEvents',   
      'getEvents',     
      'toJSON',        
      'getEventName', 
      'getOccurredOn', 
      'getMetadata',   
    ];

    for (const [key, value] of Object.entries(event)) {
      // Excluir funciones y propiedades excluidas
      if (typeof value === 'function') {
        continue;
      }
      
      if (excludeKeys.includes(key)) {
        continue;
      }

      // Si el valor es un Value Object con getValue(), extraer su valor
      if (value && typeof value === 'object' && 'getValue' in value && typeof value.getValue === 'function') {
        data[key] = value.getValue();
      } 
      // Si es un objeto con toJSON()
      else if (value && typeof value === 'object' && 'toJSON' in value && typeof value.toJSON === 'function') {
        data[key] = value.toJSON();
      }
      // Si es un Date, convertirlo a string ISO
      else if (value instanceof Date) {
        data[key] = value.toISOString();
      }
      // Si es un objeto simple, clonarlo (evitar referencias)
      else if (value && typeof value === 'object' && !Array.isArray(value)) {
        data[key] = { ...value };
      } 
      // Si es un array, mapearlo
      else if (Array.isArray(value)) {
        data[key] = value.map(item => 
          item && typeof item === 'object' && 'getValue' in item 
            ? item.getValue() 
            : item
        );
      }
      // Valores primitivos
      else {
        data[key] = value;
      }
    }

    return data;
  }

  // Extrae metadata del evento
  private static extractMetadata(event: DomainEvent): {
    ipAddress?: string;
    userAgent?: string;
    correlationId?: string;
  } | undefined {
    // Intentar obtener metadata de diferentes formas
    let metadata: Record<string, unknown> | undefined;

    // 1. Si tiene método getMetadata()
    if ('getMetadata' in event && typeof (event as any).getMetadata === 'function') {
      const result = (event as any).getMetadata();
      if (result && typeof result === 'object') {
        metadata = result;
      }
    }

    // 2. Si tiene propiedad metadata
    if (!metadata && 'metadata' in event && event.metadata && typeof event.metadata === 'object') {
      metadata = event.metadata as Record<string, unknown>;
    }

    // 3. Si no hay metadata, retornar undefined
    if (!metadata || Object.keys(metadata).length === 0) {
      return undefined;
    }

    // Extraer campos específicos de metadata
    return {
      ipAddress: metadata.ipAddress as string || undefined,
      userAgent: metadata.userAgent as string || undefined,
      correlationId: metadata.correlationId as string || undefined,
    };
  }
}