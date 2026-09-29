import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

const notFound = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.path.startsWith('/api')) { res.status(404).end(); return; }
  const error = Object.assign(new Error('Route not found'), { name: 'ROUTE_NOT_FOUND', statusCode: 404 }) as AppError;
  next(error);
};

export default notFound;
