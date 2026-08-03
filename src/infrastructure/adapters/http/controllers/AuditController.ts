import { Request, Response } from 'express';
import { GetUserAuditLogUseCase } from '../../../../application/use-cases/audit/GetUserAuditLogUseCase';
import { GetGlobalAuditLogUseCase } from '../../../../application/use-cases/audit/GetGlobalAuditLogUseCase';
import { 
  GetGlobalAuditLogsRequestDTO,
  AuthenticatedRequestDTO 
} from '../../../../application/dtos/AuditRequestDTO';
import { ErrorResponseDTO } from '../../../../application/dtos/AuditResponseDTO';

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
      res.status(401).json({ success: false, error: 'Unauthorized' } as ErrorResponseDTO);
      return;
    }

    const { userId } = req.params as { userId: string };
    
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ success: false, error: 'Invalid userId' } as ErrorResponseDTO);
      return;
    }

    // 2. Verificar permisos
    if (authUser.userId !== userId && authUser.role !== 'ADMIN') {
      res.status(403).json({ success: false, error: 'Forbidden' } as ErrorResponseDTO);
      return;
    }

    // 3. Ejecutar use case
    const logs = await this.getUserAuditLogUseCase.execute(userId);
    
    // 4. Retornar DTO de response
    res.json({
      success: true,
      data: logs,
    });
  }

  async getGlobalAuditLogs(req: Request, res: Response): Promise<void> {
    // 1. Validar autenticación
    const authUser = this.getAuthenticatedUser(req);
    if (!authUser) {
      res.status(401).json({ success: false, error: 'Unauthorized' } as ErrorResponseDTO);
      return;
    }

    if (authUser.role !== 'ADMIN') {
      res.status(403).json({ success: false, error: 'Forbidden' } as ErrorResponseDTO);
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
    const logs = await this.getGlobalAuditLogUseCase.execute({
      eventName: query.eventName,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      limit: query.limit,
      offset: query.offset,
    });

    // 4. Retornar DTO de response
    res.json({
      success: true,
      data: logs,
    });
  }
}