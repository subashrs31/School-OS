import { Request, Response, NextFunction } from 'express';
import permissionService from '../services/permission.service';
import apiResponse from '../helpers/apiResponse';

const permissionController = {
  getPermissions: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { apiResponse.success(res, 'Permissions fetched', { permissions: await permissionService.getPermissions() }); } catch (e) { next(e); }
  },
  getActions: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { apiResponse.success(res, 'Permission actions fetched', { actions: await permissionService.getActions() }); } catch (e) { next(e); }
  },
  getPermission: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { apiResponse.success(res, 'Permission fetched', { permission: await permissionService.getPermission(Number(req.params['id'])) }); } catch (e) { next(e); }
  },
  createPermission: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { apiResponse.success(res, 'Permission created', { permission: await permissionService.createPermission(req.body as Parameters<typeof permissionService.createPermission>[0]) }, 201); } catch (e) { next(e); }
  },
  updatePermission: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { apiResponse.success(res, 'Permission updated', { permission: await permissionService.updatePermission(Number(req.params['id']), req.body as Parameters<typeof permissionService.updatePermission>[1]) }); } catch (e) { next(e); }
  },
  deletePermission: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { await permissionService.deletePermission(Number(req.params['id'])); apiResponse.success(res, 'Permission deleted'); } catch (e) { next(e); }
  },
};

export default permissionController;
