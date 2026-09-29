import { Request, Response, NextFunction } from 'express';
import roleService from '../services/role.service';
import apiResponse from '../helpers/apiResponse';

const roleController = {
  getRoles: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { apiResponse.success(res, 'Roles fetched', { roles: await roleService.getRoles() }); } catch (e) { next(e); }
  },
  getRole: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { apiResponse.success(res, 'Role fetched', { role: await roleService.getRole(Number(req.params['id'])) }); } catch (e) { next(e); }
  },
  getAssignableRoles: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { apiResponse.success(res, 'Assignable roles fetched', { roles: await roleService.getAssignableRoles() }); } catch (e) { next(e); }
  },
  createRole: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { apiResponse.success(res, 'Role created', { role: await roleService.createRole(req.body as Parameters<typeof roleService.createRole>[0]) }, 201); } catch (e) { next(e); }
  },
  updateRole: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { apiResponse.success(res, 'Role updated', { role: await roleService.updateRole(Number(req.params['id']), req.body as Parameters<typeof roleService.updateRole>[1]) }); } catch (e) { next(e); }
  },
  deleteRole: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { await roleService.deleteRole(Number(req.params['id'])); apiResponse.success(res, 'Role deleted'); } catch (e) { next(e); }
  },
};

export default roleController;
