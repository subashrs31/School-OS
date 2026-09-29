import jwt, { Algorithm, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { TokenPayload } from '../types';
import { parseExpireToMs } from './parse';

export { parseExpireToMs } from './parse';

const signOpts = (expire: string | number, algorithm: string): SignOptions => ({
  expiresIn: expire as SignOptions['expiresIn'],
  algorithm: algorithm as Algorithm,
});

export const generateAccessToken = (
  payload: object,
  secret: string,
  expire: string | number,
  algorithm: string
): string => {
  const jti = crypto.randomBytes(16).toString('hex');
  return jwt.sign({ ...payload, jti, type: 'access' }, secret, signOpts(expire, algorithm));
};

export const generateRefreshToken = (
  userId: number,
  secret: string,
  expire: string | number,
  algorithm: string
): { token: string; jti: string } => {
  const jti = crypto.randomBytes(16).toString('hex');
  return {
    token: jwt.sign({ sub: String(userId), jti, type: 'refresh' }, secret, signOpts(expire, algorithm)),
    jti,
  };
};

export const verifyToken = (token: string, secret: string): TokenPayload | null => {
  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch {
    return null;
  }
};

export const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');
