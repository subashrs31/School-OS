import { Request, Response, NextFunction } from 'express';
import apiResponse from '../helpers/apiResponse';
import ERROR_MAP from '../errors/errorMap';
import logger from '../utils/logger';
import { AppError } from '../types';

const errorHandler = (err: AppError & Record<string, unknown>, _req: Request, res: Response, _next: NextFunction): Response => {
  logger.error(`${err.name} - ${err.message}`);

  const errorConfig = ERROR_MAP[err.name ?? ''] ?? ERROR_MAP['DEFAULT'];
  const statusCode = err.statusCode ?? errorConfig.statusCode;
  const message = err.message ?? errorConfig.message;
  const errors = err.errors ?? (errorConfig.formatErrors ? errorConfig.formatErrors(err) : null);
  const errName = err.name ?? 'INTERNAL_ERROR';

  return apiResponse.error(res, message, errors, statusCode, errName);
};

export default errorHandler;
