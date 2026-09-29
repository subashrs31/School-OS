import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken } from '../helpers/token';
import env from '../config/appConfig';
import { AppError, AppUser } from '../types';
import userRoleService from '../services/userRole.service';

export const authCheck: RequestHandler = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const isCookie = env?.AUTH_BASE === 'cookie';
  const header = req.headers.authorization ?? '';
  const [scheme, tokenFromHeader] = header.split(' ');
  const token = isCookie
    ? (req.cookies as Record<string, string | undefined>)['accessToken']
    : (scheme === 'Bearer' && tokenFromHeader ? tokenFromHeader : null);

  if (!token) {
    return next(Object.assign(new Error('Authorization token missing'), { statusCode: 401 }) as AppError);
  }

  const decoded = verifyToken(token, env.JWT_SECRET);
  if (!decoded || decoded.type !== 'access' || !decoded.sub) {
    return next(Object.assign(new Error('Invalid or expired token'), { statusCode: 401 }) as AppError);
  }

  const userId = Number(decoded.sub);
  if (isNaN(userId)) {
    return next(Object.assign(new Error('Invalid token subject'), { statusCode: 401 }) as AppError);
  }
  const roles = await userRoleService.getRoleNames(userId);

  const user: AppUser = {
    userId,
    email:      '',
    roles,
    activeRole: null,
  };

  req.user = user;
  next();
};
