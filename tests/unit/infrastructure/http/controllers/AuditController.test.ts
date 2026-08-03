import { Request, Response } from 'express';
import { AuditController } from '../../../../../src/infrastructure/adapters/http/controllers/AuditController';
import { GetUserAuditLogUseCase } from '../../../../../src/application/use-cases/audit/GetUserAuditLogUseCase';
import { GetGlobalAuditLogUseCase } from '../../../../../src/application/use-cases/audit/GetGlobalAuditLogUseCase';
import { IAuditRepository } from '../../../../../src/domain/interfaces/repositories/IAuditRepository';

const mockUserAuditRepository: jest.Mocked<IAuditRepository> = {
  save: jest.fn(),
  saveMany: jest.fn(),
  findByAggregateId: jest.fn(),
  findByEventName: jest.fn(),
  findByDateRange: jest.fn(),
  findAll: jest.fn(),
  getEventCountByType: jest.fn(),
};

const mockGlobalAuditRepository: jest.Mocked<IAuditRepository> = {
  save: jest.fn(),
  saveMany: jest.fn(),
  findByAggregateId: jest.fn(),
  findByEventName: jest.fn(),
  findByDateRange: jest.fn(),
  findAll: jest.fn(),
  getEventCountByType: jest.fn(),
};

const mockGetUserAuditLogUseCase = new GetUserAuditLogUseCase(mockUserAuditRepository);
const mockGetGlobalAuditLogUseCase = new GetGlobalAuditLogUseCase(mockGlobalAuditRepository);

jest.spyOn(mockGetUserAuditLogUseCase, 'execute');
jest.spyOn(mockGetGlobalAuditLogUseCase, 'execute');

interface AuthenticatedRequest extends Partial<Request> {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

describe('AuditController', () => {
  let controller: AuditController;
  let req: AuthenticatedRequest;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuditController(
      mockGetUserAuditLogUseCase,
      mockGetGlobalAuditLogUseCase
    );
    
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('getUserAuditLogs', () => {
    const userId = '123e4567-e89b-42d3-a456-426614174000';
    const mockLogs = [
      { eventName: 'user.registered', occurredOn: new Date(), data: { userId } },
    ];

    it('should return audit logs for the user when authorized', async () => {
      req = {
        params: { userId },
        user: { id: userId, email: 'user@test.com', role: 'USER' },
      };
      
      (mockGetUserAuditLogUseCase.execute as jest.Mock).mockResolvedValue(mockLogs);

      await controller.getUserAuditLogs(req as Request, res as Response);

      expect(mockGetUserAuditLogUseCase.execute).toHaveBeenCalledWith(userId);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockLogs,
      });
    });

    it('should return audit logs when admin requests', async () => {
      req = {
        params: { userId: 'other-user-id' },
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' },
      };
      
      (mockGetUserAuditLogUseCase.execute as jest.Mock).mockResolvedValue(mockLogs);

      await controller.getUserAuditLogs(req as Request, res as Response);

      expect(mockGetUserAuditLogUseCase.execute).toHaveBeenCalledWith('other-user-id');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockLogs,
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      req = {
        params: { userId },
        user: undefined,
      };

      await controller.getUserAuditLogs(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized',
      });
      expect(mockGetUserAuditLogUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not the owner and not admin', async () => {
      req = {
        params: { userId: 'other-user-id' },
        user: { id: 'different-id', email: 'other@test.com', role: 'USER' },
      };

      await controller.getUserAuditLogs(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Forbidden',
      });
      expect(mockGetUserAuditLogUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 if userId is invalid', async () => {
      req = {
        params: { userId: '' },
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' },
      };

      await controller.getUserAuditLogs(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid userId',
      });
      expect(mockGetUserAuditLogUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('getGlobalAuditLogs', () => {
    const mockLogs = [
      { eventName: 'user.registered', occurredOn: new Date(), data: { userId: '1' } },
      { eventName: 'user.deleted', occurredOn: new Date(), data: { userId: '2' } },
    ];

    it('should return global audit logs for admin', async () => {
      req = {
        query: { limit: '10', offset: '0' },
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' },
      };
      
      (mockGetGlobalAuditLogUseCase.execute as jest.Mock).mockResolvedValue(mockLogs);

      await controller.getGlobalAuditLogs(req as Request, res as Response);

      expect(mockGetGlobalAuditLogUseCase.execute).toHaveBeenCalledWith({
        eventName: undefined,
        startDate: undefined,
        endDate: undefined,
        limit: 10,
        offset: 0,
      });
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockLogs,
      });
    });

    it('should filter by eventName', async () => {
      req = {
        query: { eventName: 'user.deleted', limit: '20', offset: '5' },
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' },
      };
      
      (mockGetGlobalAuditLogUseCase.execute as jest.Mock).mockResolvedValue(mockLogs);

      await controller.getGlobalAuditLogs(req as Request, res as Response);

      expect(mockGetGlobalAuditLogUseCase.execute).toHaveBeenCalledWith({
        eventName: 'user.deleted',
        startDate: undefined,
        endDate: undefined,
        limit: 20,
        offset: 5,
      });
    });

    it('should filter by date range', async () => {
      const startDate = '2024-01-01T00:00:00Z';
      const endDate = '2024-01-31T23:59:59Z';
      
      req = {
        query: { startDate, endDate },
        user: { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' },
      };
      
      (mockGetGlobalAuditLogUseCase.execute as jest.Mock).mockResolvedValue(mockLogs);

      await controller.getGlobalAuditLogs(req as Request, res as Response);

      expect(mockGetGlobalAuditLogUseCase.execute).toHaveBeenCalledWith({
        eventName: undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        limit: 100,
        offset: 0,
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      req = {
        query: {},
        user: undefined,
      };

      await controller.getGlobalAuditLogs(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized',
      });
      expect(mockGetGlobalAuditLogUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not admin', async () => {
      req = {
        query: {},
        user: { id: 'user-id', email: 'user@test.com', role: 'USER' },
      };

      await controller.getGlobalAuditLogs(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Forbidden',
      });
      expect(mockGetGlobalAuditLogUseCase.execute).not.toHaveBeenCalled();
    });
  });
});