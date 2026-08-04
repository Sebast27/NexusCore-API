import { IAuditRepository } from '../../../domain/interfaces/repositories/IAuditRepository';
import { AuditLogResponseDTO } from '../../dtos/AuditResponseDTO';
import { ValidationError } from '../../errors/ValidationError';
import { UserId } from '../../../domain/value-objects/UserId';
import { AuditLogMapper } from '../../../application/dtos/AuditLogMapper';

export class GetUserAuditLogUseCase {
  constructor(
    private readonly auditRepository: IAuditRepository
  ) {}

  async execute(userId: string): Promise<AuditLogResponseDTO[]> {
    // 1. Validar entrada
    if (!userId || userId.trim() === '') {
      throw new ValidationError('userId', 'User ID is required');
    }

    // 2. Validar formato de userId
    const userIdVO = UserId.fromString(userId);

    // 3. Obtener eventos
    const events = await this.auditRepository.findByAggregateId(userIdVO.getValue());

    // 4. Mapear a DTOs
    return events.map(event => AuditLogMapper.toResponseDTO(event));
  }
}