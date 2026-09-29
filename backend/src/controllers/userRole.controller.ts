import { Request, Response, NextFunction } from 'express';
import userRoleService from '../services/userRole.service';
import apiResponse from '../helpers/apiResponse';

const userRoleController = {
  getUserRoles: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      apiResponse.success(res, 'User roles fetched', { roles: await userRoleService.getUserRoles(Number(req.params['userId'])) });
    } catch (e) { next(e); }
  },

  assignUserRole: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as { roleId: number; scopeType?: 'global' | 'organization' ; scopeId?: number; expiresAt?: Date; assignedBy?: number };
      apiResponse.success(res, 'Role assigned to user', {
        entry: await userRoleService.assignUserRole(Number(req.params['userId']), body),
      }, 201);
    } catch (e) { next(e); }
  },

  syncUserRoles: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      apiResponse.success(res, 'User roles synced', {
        roles: await userRoleService.syncUserRoles(Number(req.params['userId']), (req.body as { roleIds?: number[] }).roleIds ?? []),
      });
    } catch (e) { next(e); }
  },

  revokeUserRole: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { scopeType, scopeId } = req.query as { scopeType?: string; scopeId?: string };
      await userRoleService.revokeUserRole(
        Number(req.params['userId']),
        Number(req.params['roleId']),
        (scopeType as 'global' | 'organization') ?? 'global',
        scopeId ? Number(scopeId) : null,
      );
      apiResponse.success(res, 'Role revoked from user');
    } catch (e) { next(e); }
  },
};

export default userRoleController;
