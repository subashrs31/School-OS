import { Request, Response, NextFunction } from 'express';
import studentService from '../services/student.service';
import organizationService from '../services/organization.service';
import apiResponse from '../helpers/apiResponse';
import { AppUser } from '../types';

const u = (req: Request) => req.user as AppUser;
const isGlobal = (req: Request) => u(req).roles.some(r => r.roleType === 'primary' || r.roleType === 'secondary');
const orgId = (req: Request) => Number(req.params['organizationId']);

const studentController = {
  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const branchId = req.query['branchId'] ? Number(req.query['branchId']) : undefined;
      const students = await studentService.list(orgId(req), branchId);
      apiResponse.success(res, 'Students fetched', { students });
    } catch (err) { next(err); }
  },

  get: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const student = await studentService.getById(Number(req.params['studentId']), orgId(req));
      apiResponse.success(res, 'Student fetched', { student });
    } catch (err) { next(err); }
  },

  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const student = await studentService.create(orgId(req), req.body as Parameters<typeof studentService.create>[1]);
      apiResponse.success(res, 'Student created', { student }, 201);
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const student = await studentService.update(Number(req.params['studentId']), orgId(req), req.body as Parameters<typeof studentService.update>[2]);
      apiResponse.success(res, 'Student updated', { student });
    } catch (err) { next(err); }
  },

  enroll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await organizationService.assertAccess(u(req).userId, orgId(req), isGlobal(req));
      const enrollment = await studentService.enroll(orgId(req), req.body as Parameters<typeof studentService.enroll>[1]);
      apiResponse.success(res, 'Student enrolled', { enrollment }, 201);
    } catch (err) { next(err); }
  },
};

export default studentController;
