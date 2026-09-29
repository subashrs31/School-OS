import { Request, Response, NextFunction } from 'express';
import rolePermissionService from '../services/rolePermission.service';
import apiResponse from '../helpers/apiResponse';

const rolePermissionController = {
  getRolePermissions: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { apiResponse.success(res, 'Role permissions fetched', { permissions: await rolePermissionService.getRolePermissions(Number(req.params['roleId'])) }); } catch (e) { next(e); }
  },
  assignRolePermission: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { apiResponse.success(res, 'Permission assigned to role', { entry: await rolePermissionService.assignRolePermission(Number(req.params['roleId']), (req.body as { permissionId: number }).permissionId) }, 201); } catch (e) { next(e); }
  },
  syncRolePermissions: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { apiResponse.success(res, 'Role permissions synced', { permissions: await rolePermissionService.syncRolePermissions(Number(req.params['roleId']), (req.body as { permissionIds?: number[] }).permissionIds ?? []) }); } catch (e) { next(e); }
  },
  revokeRolePermission: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { await rolePermissionService.revokeRolePermission(Number(req.params['roleId']), Number(req.params['permissionId'])); apiResponse.success(res, 'Permission revoked from role'); } catch (e) { next(e); }
  },
};

export default rolePermissionController;
