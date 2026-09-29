import { Request } from 'express';

declare global {
  namespace Express {
    interface User extends AppUser {}
  }
}

export interface AppUser {
  userId: number;
  email: string;
  roles: RoleSummary[];
  activeRole: string | null;
}

export interface RoleSummary {
  id: number;
  name: string;
  slug: string;
  scopeType: string;
  scopeId: number | null;
  roleType: 'primary' | 'secondary' | 'normal';
  isSystem?: boolean;
}

/** Scope context passed to authorization checks */
export interface ScopeContext {
  scopeType?: 'global' | 'organization';
  scopeId?: number | null;
}

export interface AppRequest extends Request {
  user?: AppUser;
  uploadedFiles?: Record<string, string | S3Value | Array<string | S3Value>>;
}

export interface S3Value {
  s3_path: string;
}

export interface AppError extends Error {
  statusCode?: number;
  errors?: unknown;
}

export interface TokenPayload {
  sub: string;          // user id as string
  jti: string;
  type: 'access' | 'refresh';
  email?: string;
  subId?: string;
  iat?: number;
  exp?: number;
}

export interface MailOptions {
  to: string;
  subject: string;
  template?: string;
  variables?: Record<string, string>;
  html?: string;
  attachments?: Array<{ filename: string; content: Buffer | string }>;
}

export interface JobPayload {
  [key: string]: unknown;
}

export interface OAuthProfile {
  oauthId: string;
  email: string;
  name: string;
  role?: string;
}

export interface ExcelColumn {
  name: string;
  key?: string;
  required?: boolean;
  validate?: (value: unknown) => string | null;
  transform?: (value: unknown) => unknown;
}
