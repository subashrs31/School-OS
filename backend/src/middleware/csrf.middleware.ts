import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

export const csrfCheck = (req: Request, _res: Response, next: NextFunction): void => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.originalUrl.startsWith('/api/auth/')) return next();

  const cookieToken = (req.cookies as Record<string, string | undefined>)['XSRF-TOKEN'];
  const headerToken = req.headers['x-xsrf-token'] as string | undefined;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(Object.assign(new Error('CSRF token mismatch'), { statusCode: 403 }) as AppError);
  }

  next();
};
