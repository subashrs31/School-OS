import { Request, Response, NextFunction, RequestHandler } from 'express';
import Joi from 'joi';
import { AppError } from '../types';

export const validate = (schema: Joi.ObjectSchema): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.body || Object.keys(req.body as object).length === 0) {
      return next(Object.assign(new Error('Request body cannot be empty'), { name: 'EMPTY_BODY', statusCode: 400 }) as AppError);
    }
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return next(Object.assign(error, { name: 'ValidationError', statusCode: 422 }) as AppError);
    }
    req.body = value as Record<string, unknown>;
    next();
  };

export const validateParams = (schema: Joi.ObjectSchema): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    if (error) {
      return next(Object.assign(error, { name: 'ValidationError', statusCode: 422 }) as AppError);
    }
    next();
  };

export const validateQuery = (schema: Joi.ObjectSchema): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) {
      return next(Object.assign(error, { name: 'ValidationError', statusCode: 422 }) as AppError);
    }
    req.query = value as Record<string, string>;
    next();
  };
