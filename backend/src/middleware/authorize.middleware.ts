import { Request, Response, NextFunction, RequestHandler } from 'express';
import authorizationService from '../services/authorization.service';
import { AppError, AppUser } from '../types';

declare global {
  namespace Express {
    interface Request {
      resource?: string;
    }
  }
}

const forbidden = (next: NextFunction): void =>
  next(Object.assign(new Error('Forbidden'), { statusCode: 403 }) as AppError);

/**
 * setResource('users') — attach resource name to req, used by authorize()
 */
export const setResource = (resource: string): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    req.resource = resource;
    next();
  };

/**
 * authorize('view') — checks `${req.resource}.view` permission
 * authorize('users.view') — checks full slug directly
 */
const authorize = (action: string): RequestHandler =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.user as AppUser | undefined)?.userId;
      if (!userId) return forbidden(next);

      const slug = action.includes('.') ? action : `${req.resource}.${action}`;
      if (!req.resource && !action.includes('.')) return forbidden(next);

      const allowed = await authorizationService.can(userId, slug);
      if (!allowed) return forbidden(next);
      next();
    } catch (err) {
      next(err);
    }
  };

export default authorize;
