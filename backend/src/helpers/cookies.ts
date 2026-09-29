import crypto from 'crypto';
import { Request, Response } from 'express';
import env from '../config/appConfig';

const getIsSecure = (): boolean => !env?.IS_LOCAL;

const base = (httpOnly: boolean): object => {
  const isSecure = getIsSecure();
  return { httpOnly, secure: isSecure, sameSite: isSecure ? 'none' : 'lax', path: '/' };
};

export const setCookies = (res: Response, tokenType: string, token: string, age: number): void => {
  res.cookie(tokenType, token, { ...base(true), maxAge: Number(age) });
};

export const setCsrfCookie = (req: Request, res: Response): string | null => {
  const origin = req.get('origin') ?? req.get('referer') ?? '';
  if (!origin.startsWith(env.FRONTEND_URL)) return null;
  const csrfToken = crypto.randomBytes(32).toString('hex');
  res.cookie('XSRF-TOKEN', csrfToken, { ...base(false), maxAge: 7 * 24 * 60 * 60 * 1000 });
  return csrfToken;
};

export const clearCookies = (res: Response, tokenType: string): void => {
  res.clearCookie(tokenType, base(true) as object);
};

export const clearCsrfCookie = (res: Response): void => {
  res.clearCookie('XSRF-TOKEN', base(false) as object);
};
