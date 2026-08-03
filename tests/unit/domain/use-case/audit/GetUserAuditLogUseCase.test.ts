import { GetUserAuditLogUseCase } from '../../../../../src/application/use-cases/audit/GetUserAuditLogUseCase';
import { IAuditRepository } from '../../../../../src/domain/interfaces/repositories/IAuditRepository';
import { DomainEvent } from '../../../../../src/domain/events/DomainEvent';

const mockAuditRepository: jest.Mocked<IAuditRepository> = {
  save: jest.fn(),
  saveMany: jest.fn(),
  findByAggregateId: jest.fn(),
  findByEventName: jest.fn(),
  findByDateRange: jest.fn(),
  findAll: jest.fn(),
  getEventCountByType: jest.fn(),
};

describe('GetUserAuditLogUseCase', () => {
  let useCase: GetUserAuditLogUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetUserAuditLogUseCase(mockAuditRepository);
  });

  it('should return audit logs for a user', async () => {
    const userId = '123e4567-e89b-42d3-a456-426614174000';
    const mockEvents: DomainEvent[] = [
      {
        eventName: 'user.registered',
        occurredOn: new Date(),
        userId: userId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      } as any,
      {
        eventName: 'user.deleted',
        occurredOn: new Date(),
        userId: userId,
        deletedBy: 'admin@example.com',
        reason: 'Test deletion',
      } as any,
    ];

    mockAuditRepository.findByAggregateId.mockResolvedValue(mockEvents);

    const result = await useCase.execute(userId);

    expect(mockAuditRepository.findByAggregateId).toHaveBeenCalledWith(userId);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      eventName: 'user.registered',
      data: { userId, email: 'test@example.com', name: 'Test User', role: 'USER' },
    });
    expect(result[1]).toMatchObject({
      eventName: 'user.deleted',
      data: { userId, deletedBy: 'admin@example.com', reason: 'Test deletion' },
    });
  });

  it('should return empty array if no events found', async () => {
    const userId = 'non-existent-id';
    mockAuditRepository.findByAggregateId.mockResolvedValue([]);

    const result = await useCase.execute(userId);

    expect(mockAuditRepository.findByAggregateId).toHaveBeenCalledWith(userId);
    expect(result).toHaveLength(0);
  });

  it('should extract event data correctly', async () => {
    const userId = '123e4567-e89b-42d3-a456-426614174000';
    const mockEvent: DomainEvent = {
      eventName: 'user.role.changed',
      occurredOn: new Date(),
      userId: userId,
      oldRole: 'USER',
      newRole: 'ADMIN',
      changedBy: 'admin@example.com',
    } as any;

    mockAuditRepository.findByAggregateId.mockResolvedValue([mockEvent]);

    const result = await useCase.execute(userId);

    expect(result[0].data).toEqual({
      userId: userId,
      oldRole: 'USER',
      newRole: 'ADMIN',
      changedBy: 'admin@example.com',
    });
    expect(result[0].data).not.toHaveProperty('eventName');
    expect(result[0].data).not.toHaveProperty('occurredOn');
  });
});