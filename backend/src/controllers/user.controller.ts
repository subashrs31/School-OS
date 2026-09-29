import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import apiResponse from '../helpers/apiResponse';
import { formatUser } from '../utils/formatUser';
import { AppUser } from '../types';

const u = (req: Request): AppUser => req.user as AppUser;

const userController = {
  getUsers: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role } = req.query as { role?: string };
      const users = await userService.getUsers(u(req).userId, u(req).roles, { role });
      apiResponse.success(res, 'Users fetched successfully', { users }, 200);
    } catch (err) { next(err); }
  },

  getUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await userService.getUserById(Number(req.params['id']));
      apiResponse.success(res, 'User fetched successfully', { user }, 200);
    } catch (err) { next(err); }
  },

  createUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await userService.createUser(req.body as { email?: string; name?: string; password?: string; uuid?: string });
      apiResponse.success(res, 'User created successfully', { user: formatUser(user) }, 201);
    } catch (err) { next(err); }
  },

  updateUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await userService.updateUserById(Number(req.params['id']), req.body as { name?: string; uuid?: string });
      apiResponse.success(res, 'User updated successfully', { user: formatUser(user) }, 200);
    } catch (err) { next(err); }
  },

  updateProfile: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await userService.updateProfile(u(req).userId, req.body as { name?: string });
      apiResponse.success(res, 'Profile updated successfully', { user: formatUser(user) }, 200);
    } catch (err) { next(err); }
  },

  changePassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await userService.changePassword(u(req).userId, req.body as { currentPassword: string; newPassword: string });
      apiResponse.success(res, 'Password changed successfully', null, 200);
    } catch (err) { next(err); }
  },

  updateUserStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await userService.updateStatusById(Number(req.params['id']));
      apiResponse.success(res, 'User status updated successfully', { user: formatUser(user) }, 200);
    } catch (err) { next(err); }
  },

  validateImport: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { valid, errors } = userService.validateImportData((req.body as { users?: Record<string, unknown>[] }).users ?? []);
      apiResponse.success(res, errors.length ? 'Validation failed' : 'Validation passed', { valid, errors }, 200);
    } catch (err) { next(err); }
  },

  importUsers: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await userService.importUsers((req.body as { users: Record<string, unknown>[] }).users);
      apiResponse.success(res, `${results.created.length} users imported`, { results }, 201);
    } catch (err) { next(err); }
  },

  deleteUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await userService.deleteUserById(Number(req.params['id']));
      apiResponse.success(res, 'User deleted successfully', null, 200);
    } catch (err) { next(err); }
  },
};

export default userController;
