import { Request, Response, NextFunction } from 'express';
import userPermissionService from '../services/userPermission.service';
import apiResponse from '../helpers/apiResponse';

const userPermissionController = {
  getUserPermissions: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      apiResponse.success(res, 'User permissions fetched', {
        permissions: await userPermissionService.getUserPermissions(Number(req.params['userId'])),
      });
    } catch (e) { next(e); }
  },

  assignUserPermission: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as { permissionId: number; effect: 'allow' | 'deny'; scopeType?: 'global' | 'organization'; scopeId?: number; remarks?: string; expiresAt?: Date };
      apiResponse.success(res, 'Permission assigned to user', {
        entry: await userPermissionService.assignUserPermission(Number(req.params['userId']), body),
      }, 201);
    } catch (e) { next(e); }
  },

  syncUserPermissions: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      apiResponse.success(res, 'User permissions synced', {
        permissions: await userPermissionService.syncUserPermissions(
          Number(req.params['userId']),
          (req.body as { permissions?: Array<{ permissionId: number; effect: 'allow' | 'deny' }> }).permissions ?? [],
        ),
      });
    } catch (e) { next(e); }
  },

  revokeUserPermission: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { scopeType, scopeId } = req.query as { scopeType?: string; scopeId?: string };
      await userPermissionService.revokeUserPermission(
        Number(req.params['userId']),
        Number(req.params['permissionId']),
        (scopeType as 'global' | 'organization') ?? 'global',
        scopeId ? Number(scopeId) : null,
      );
      apiResponse.success(res, 'Permission revoked from user');
    } catch (e) { next(e); }
  },
};

export default userPermissionController;
