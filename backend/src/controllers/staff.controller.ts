import { Request, Response, NextFunction } from 'express';
import staffService from '../services/staff.service';
import organizationService from '../services/organization.service';
import apiResponse from '../helpers/apiResponse';
import { AppUser } from '../types';

const u = (req: Request) => req.user as AppUser;
const isGlobal = (req: Request) => u(req).roles.some(r => r.roleType === 'primary' || r.roleType === 'secondary');
const orgId = (req: Request) => Number(req.params['organizationId']);

const staffController = {
  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const branchId = req.query['branchId'] ? Number(req.query['branchId']) : undefined;
      const staff = await staffService.list(orgId(req), branchId);
      apiResponse.success(res, 'Staff fetched', { staff });
    } catch (err) { next(err); }
  },

  get: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const staff = await staffService.getById(Number(req.params['staffId']), orgId(req));
      apiResponse.success(res, 'Staff fetched', { staff });
    } catch (err) { next(err); }
  },

  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const staff = await staffService.create(orgId(req), req.body as Parameters<typeof staffService.create>[1]);
      apiResponse.success(res, 'Staff created', { staff }, 201);
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const staff = await staffService.update(Number(req.params['staffId']), orgId(req), req.body as Parameters<typeof staffService.update>[2]);
      apiResponse.success(res, 'Staff updated', { staff });
    } catch (err) { next(err); }
  },

  listDesignations: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const designations = await staffService.listDesignations(orgId(req));
      apiResponse.success(res, 'Designations fetched', { designations });
    } catch (err) { next(err); }
  },

  createDesignation: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const designation = await staffService.createDesignation(orgId(req), req.body as Parameters<typeof staffService.createDesignation>[1]);
      apiResponse.success(res, 'Designation created', { designation }, 201);
    } catch (err) { next(err); }
  },

  updateDesignation: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const designation = await staffService.updateDesignation(Number(req.params['designationId']), orgId(req), req.body as Parameters<typeof staffService.updateDesignation>[2]);
      apiResponse.success(res, 'Designation updated', { designation });
    } catch (err) { next(err); }
  },
};

export default staffController;
