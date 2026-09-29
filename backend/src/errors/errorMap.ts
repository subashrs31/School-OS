import { AppError } from '../types';

interface ErrorConfig {
  statusCode: number;
  message: string;
  formatErrors?: (err: AppError & Record<string, unknown>) => unknown;
}

const ERROR_MAP: Record<string, ErrorConfig> = {
  DEFAULT:          { statusCode: 500, message: 'Internal Server Error' },
  SyntaxError:      { statusCode: 400, message: 'Invalid JSON format' },
  INVALID_JSON:     { statusCode: 400, message: 'Invalid JSON format in request body' },
  JoiError: {
    statusCode: 422,
    message: 'Validation failed',
    formatErrors: (err) => (err.details as Array<{ message: string }>).map(d => d.message.replace(/"/g, '')),
  },
  ENV_MISSING:      { statusCode: 500, message: 'Required environment variables are missing' },
  ENV_INVALID:      { statusCode: 500, message: 'Invalid environment variable configuration' },
  ROUTE_NOT_FOUND:  { statusCode: 404, message: 'Route not found' },
  CORS_ERROR:       { statusCode: 403, message: 'Not allowed by CORS policy' },
  EMPTY_BODY:       { statusCode: 400, message: 'Request body cannot be empty' },
  ValidationError: {
    statusCode: 422,
    message: 'Validation failed',
    formatErrors: (err) => {
      if (err.details) {
        return (err.details as Array<{ path: string[]; message: string }>).reduce<Record<string, string>>((acc, d) => {
          acc[d.path[0]] = d.message;
          return acc;
        }, {});
      }
      if (err.errors) {
        return Object.keys(err.errors as Record<string, { message: string }>).reduce<Record<string, string>>((acc, key) => {
          acc[key] = (err.errors as Record<string, { message: string }>)[key].message;
          return acc;
        }, {});
      }
      return null;
    },
  },
  CastError:        { statusCode: 400, message: 'Invalid ID format' },
  MongoServerError: {
    statusCode: 400,
    message: 'Database error',
    formatErrors: (err) => {
      if ((err as { code?: number }).code === 11000) {
        const field = Object.keys((err as { keyPattern?: Record<string, unknown> }).keyPattern ?? {})[0];
        return [`${field} already exists`];
      }
      return null;
    },
  },
  JsonWebTokenError: { statusCode: 401, message: 'Invalid token' },
  TokenExpiredError: { statusCode: 401, message: 'Token expired' },
  UNAUTHORIZED:      { statusCode: 401, message: 'Unauthorized access' },
  FORBIDDEN:         { statusCode: 403, message: 'Forbidden access' },
};

export default ERROR_MAP;
