import { Request, Response, NextFunction } from 'express';
import branchService from '../services/branch.service';
import organizationService from '../services/organization.service';
import apiResponse from '../helpers/apiResponse';
import { AppUser } from '../types';

const u = (req: Request) => req.user as AppUser;
const isGlobal = (req: Request) => u(req).roles.some(r => r.roleType === 'primary' || r.roleType === 'secondary');
const orgId = (req: Request) => Number(req.params['organizationId']);

const branchController = {
  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const branches = await branchService.list(orgId(req));
      apiResponse.success(res, 'Branches fetched', { branches });
    } catch (err) { next(err); }
  },

  get: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const branch = await branchService.getById(Number(req.params['branchId']), orgId(req));
      apiResponse.success(res, 'Branch fetched', { branch });
    } catch (err) { next(err); }
  },

  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const branch = await branchService.create(orgId(req), req.body as Parameters<typeof branchService.create>[1]);
      apiResponse.success(res, 'Branch created', { branch }, 201);
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const branch = await branchService.update(Number(req.params['branchId']), orgId(req), req.body as Parameters<typeof branchService.update>[2]);
      apiResponse.success(res, 'Branch updated', { branch });
    } catch (err) { next(err); }
  },

  delete: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      await branchService.delete(Number(req.params['branchId']), orgId(req));
      apiResponse.success(res, 'Branch deleted', null);
    } catch (err) { next(err); }
  },
};

export default branchController;
