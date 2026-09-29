import { AppError } from '../types';

export const throwError = (message: string, statusCode: number, name?: string): never => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  if (name) error.name = name;
  throw error;
};
