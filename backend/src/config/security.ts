import { Request, Response, RequestHandler } from 'express';
import rateLimit, { Options as RateLimitOptions } from 'express-rate-limit';
import { CorsOptions } from 'cors';
import apiResponse from '../helpers/apiResponse';
import env from '../config/appConfig';
import logger from '../utils/logger';

const isLocal = env.IS_LOCAL;

const noopMiddleware: RequestHandler = (_req, _res, next) => next();

const makeRateLimiter = (opts: Partial<RateLimitOptions>): RequestHandler =>
  isLocal ? noopMiddleware : rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    ...opts,
  } as RateLimitOptions);

export const globalLimiter = makeRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req: Request, res: Response) => {
    logger.warn(`Global rate limit exceeded for IP: ${req.ip}`);
    return apiResponse.error(res, 'Too many requests from this IP, please try again later', null, 429);
  },
});

export const authLimiter = makeRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    return apiResponse.error(res, 'Too many authentication attempts, please try again later', null, 429);
  },
});

export const resetLimiter = makeRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  handler: (req: Request, res: Response) => {
    logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);
    return apiResponse.error(res, 'Too many password reset attempts, please try again later', null, 429);
  },
});

export const otpSendLimiter = makeRateLimiter({
  windowMs: env.OTP_EXPIRY,
  max: 3,
  handler: (req: Request, res: Response) => {
    logger.warn(`OTP send rate limit exceeded for IP: ${req.ip}`);
    return apiResponse.error(res, 'Too many OTP requests, please try again later', null, 429);
  },
});

export const otpVerifyLimiter = makeRateLimiter({
  windowMs: env.OTP_EXPIRY,
  max: env.OTP_MAX_ATTEMPTS,
  handler: (req: Request, res: Response) => {
    logger.warn(`OTP verify rate limit exceeded for IP: ${req.ip}`);
    return apiResponse.error(res, 'Too many OTP verification attempts, please request a new OTP', null, 429);
  },
});

export const getCorsOptions = (allowedOrigins: string[]): CorsOptions => ({
  origin: isLocal
    ? true
    : (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        logger.warn(`CORS blocked request from origin: ${origin}`);
        const error = Object.assign(new Error('Not allowed by CORS'), { name: 'CORS_ERROR' });
        return callback(error);
      },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-XSRF-TOKEN'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600,
});
