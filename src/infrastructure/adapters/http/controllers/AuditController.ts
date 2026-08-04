import { Request, Response } from 'express';
import { GetUserAuditLogUseCase } from '../../../../application/use-cases/audit/GetUserAuditLogUseCase';
import { GetGlobalAuditLogUseCase } from '../../../../application/use-cases/audit/GetGlobalAuditLogUseCase';
import { AuthenticatedRequestDTO, ErrorResponseFactory } from '../../../../application/dtos/CommonDTO';
import { GetGlobalAuditLogsRequestDTO } from '../../../../application/dtos/AuditRequestDTO';

export class AuditController {
  constructor(
    private readonly getUserAuditLogUseCase: GetUserAuditLogUseCase,
    private readonly getGlobalAuditLogUseCase: GetGlobalAuditLogUseCase
  ) {}

  // Extender Request con DTO
  private getAuthenticatedUser(req: Request): AuthenticatedRequestDTO | null {
    const user = (req as any).user;
    if (!user?.id || !user?.email || !user?.role) {
      return null;
    }
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async getUserAuditLogs(req: Request, res: Response): Promise<void> {
    // 1. Obtener y validar DTO de request
    const authUser = this.getAuthenticatedUser(req);
    if (!authUser) {
      res.status(401).json(ErrorResponseFactory.create('UNAUTHORIZED', 'Unauthorized'));
      return;
    }

    const { userId } = req.params as { userId: string };
    
    if (!userId || typeof userId !== 'string') {
      res.status(400).json(ErrorResponseFactory.create('INVALID_USER_ID', 'Invalid userId'));
      return;
    }

    // 2. Verificar permisos
    if (authUser.userId !== userId && authUser.role !== 'ADMIN') {
      res.status(403).json(ErrorResponseFactory.create('FORBIDDEN', 'Forbidden'));
      return;
    }

    // 3. Ejecutar use case
    try {
      const logs = await this.getUserAuditLogUseCase.execute(userId);
      res.json({
        success: true,
        data: logs,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json(ErrorResponseFactory.create('USER_NOT_FOUND', 'User not found'));
        return;
      }
      res.status(500).json(ErrorResponseFactory.create('INTERNAL_ERROR', 'Internal server error'));
    }
  }

  async getGlobalAuditLogs(req: Request, res: Response): Promise<void> {
    // 1. Validar autenticación
    const authUser = this.getAuthenticatedUser(req);
    if (!authUser) {
      res.status(401).json(ErrorResponseFactory.create('UNAUTHORIZED', 'Unauthorized'));
      return;
    }

    if (authUser.role !== 'ADMIN') {
      res.status(403).json(ErrorResponseFactory.create('FORBIDDEN', 'Forbidden'));
      return;
    }

    // 2. Extraer query params como DTO
    const query: GetGlobalAuditLogsRequestDTO = {
      eventName: req.query.eventName as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
    };

    // 3. Ejecutar use case
    try {
      const logs = await this.getGlobalAuditLogUseCase.execute({
        eventName: query.eventName,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        limit: query.limit,
        offset: query.offset,
      });

      res.json({
        success: true,
        data: logs,
      });
    } catch (error) {
      res.status(500).json(ErrorResponseFactory.create('INTERNAL_ERROR', 'Internal server error'));
    }
  }
}