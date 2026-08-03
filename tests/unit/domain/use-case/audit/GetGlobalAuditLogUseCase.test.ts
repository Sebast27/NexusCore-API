import { GetGlobalAuditLogUseCase } from '../../../../../src/application/use-cases/audit/GetGlobalAuditLogUseCase';
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

describe('GetGlobalAuditLogUseCase', () => {
  let useCase: GetGlobalAuditLogUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetGlobalAuditLogUseCase(mockAuditRepository);
  });

  const mockEvents: DomainEvent[] = [
    {
      eventName: 'user.registered',
      occurredOn: new Date(),
      userId: '1',
      email: 'test1@example.com',
      name: 'User One',
      role: 'USER',
    } as any,
    {
      eventName: 'user.deleted',
      occurredOn: new Date(),
      userId: '2',
      deletedBy: 'admin@example.com',
      reason: 'Test deletion',
    } as any,
  ];

  it('should return all audit logs with default pagination', async () => {
    mockAuditRepository.findAll.mockResolvedValue(mockEvents);

    const result = await useCase.execute({});

    expect(mockAuditRepository.findAll).toHaveBeenCalledWith(100, 0);
    expect(result).toHaveLength(2);
    expect(result[0].eventName).toBe('user.registered');
    expect(result[1].eventName).toBe('user.deleted');
  });

  it('should filter by eventName', async () => {
    mockAuditRepository.findByEventName.mockResolvedValue([mockEvents[0]]);

    const result = await useCase.execute({ eventName: 'user.registered' });

    expect(mockAuditRepository.findByEventName).toHaveBeenCalledWith('user.registered');
    expect(result).toHaveLength(1);
    expect(result[0].eventName).toBe('user.registered');
  });

  it('should filter by date range', async () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    
    mockAuditRepository.findByDateRange.mockResolvedValue(mockEvents);

    const result = await useCase.execute({ startDate, endDate });

    expect(mockAuditRepository.findByDateRange).toHaveBeenCalledWith(startDate, endDate);
    expect(result).toHaveLength(2);
  });

  it('should use custom limit and offset', async () => {
    mockAuditRepository.findAll.mockResolvedValue([mockEvents[0]]);

    const result = await useCase.execute({ limit: 1, offset: 1 });

    expect(mockAuditRepository.findAll).toHaveBeenCalledWith(1, 1);
    expect(result).toHaveLength(1);
  });

  it('should return empty array if no events found', async () => {
    mockAuditRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute({});

    expect(result).toHaveLength(0);
  });

  it('should extract event data correctly', async () => {
    const mockEvent: DomainEvent = {
      eventName: 'user.role.changed',
      occurredOn: new Date(),
      userId: '1',
      oldRole: 'USER',
      newRole: 'ADMIN',
      changedBy: 'admin@example.com',
    } as any;

    mockAuditRepository.findAll.mockResolvedValue([mockEvent]);

    const result = await useCase.execute({});

    expect(result[0].data).toEqual({
      userId: '1',
      oldRole: 'USER',
      newRole: 'ADMIN',
      changedBy: 'admin@example.com',
    });
    expect(result[0].data).not.toHaveProperty('eventName');
    expect(result[0].data).not.toHaveProperty('occurredOn');
  });
});