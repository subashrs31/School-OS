import { Request, Response, NextFunction } from 'express';
import organizationService from '../services/organization.service';
import apiResponse from '../helpers/apiResponse';
import { AppUser } from '../types';

const u = (req: Request) => req.user as AppUser;
const isGlobal = (req: Request) => u(req).roles.some(r => r.roleType === 'primary' || r.roleType === 'secondary');

const organizationController = {
  list: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgs = await organizationService.list();
      apiResponse.success(res, 'Organizations fetched', { organizations: orgs });
    } catch (err) { next(err); }
  },

  get: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params['organizationId']);
      await organizationService.assertAccess(u(req).userId, id, isGlobal(req));
      const [org, summary] = await Promise.all([
        organizationService.getById(id),
        organizationService.getSummary(id),
      ]);
      apiResponse.success(res, 'Organization fetched', { organization: org, summary });
    } catch (err) { next(err); }
  },

  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const org = await organizationService.create(req.body as Parameters<typeof organizationService.create>[0]);
      apiResponse.success(res, 'Organization created', { organization: org }, 201);
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params['organizationId']);
      await organizationService.assertAccess(u(req).userId, id, isGlobal(req));
      const org = await organizationService.update(id, req.body as Parameters<typeof organizationService.update>[1]);
      apiResponse.success(res, 'Organization updated', { organization: org });
    } catch (err) { next(err); }
  },
};

export default organizationController;
