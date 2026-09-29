import crypto from 'crypto';
import { Request } from 'express';
import prisma from '../lib/prisma';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../helpers/token';
import crypt from '../helpers/crypt';
import env from '../config/appConfig';
import emitter from '../events/emitter';
import EVENTS from '../events/events';
import { throwError } from '../helpers/throwError';
import { hashPassword } from './user.service';

type UserRow = { id: number; uuid: string; name: string | null; email: string | null; isActive: boolean | null; verifiedAt: Date | null };

const safeUser = (user: UserRow) => ({
  id:         user.id,
  uuid:       user.uuid,
  name:       user.name,
  email:      user.email,
  isActive:   user.isActive,
  verifiedAt: user.verifiedAt,
});

// MySQL's default collation compared these case-insensitively; PostgreSQL does not.
const ci = (value: string) => ({ equals: value, mode: 'insensitive' as const });

const authService = {
  loginUser: async ({ username, password }: { username: string; password: string }, _req: Request) => {
    const user = await prisma.user.findFirst({ where: { OR: [{ email: ci(username) }, { uuid: ci(username) }] } });
    if (!user || user.deletedAt) throwError('Invalid credentials', 401, 'UNAUTHORIZED');
    if (!await crypt.matchPassword(password, user!.password as string)) throwError('Invalid credentials', 401, 'UNAUTHORIZED');
    if (!user!.isActive) throwError('Your account is inactive. Please contact your admin.', 403, 'FORBIDDEN');
    const payload = { sub: String(user!.id), email: user!.email as string, subId: user!.uuid };
    return {
      user: safeUser(user!),
      accessToken:  generateAccessToken(payload, env.JWT_SECRET, env.ACCESS_TOKEN_EXPIRE, env.JWT_ALGORITHM),
      refreshToken: generateRefreshToken(user!.id, env.JWT_REFRESH_SECRET, env.REFRESH_TOKEN_EXPIRE, env.JWT_ALGORITHM).token,
    };
  },

  registerUser: async ({ name, email, password }: { name: string; email: string; password: string }, _req: Request) => {
    const existing = await prisma.user.findFirst({ where: { email: ci(email) } });
    if (existing && !existing.deletedAt) throwError('User already exists', 400);
    // As under Sequelize, a brand-new user is created without a uuid, which the schema requires (current-state.md B7).
    const user = existing?.deletedAt
      ? await prisma.user.update({ where: { id: existing.id }, data: { name, password: await hashPassword(password), deletedAt: null, isActive: true } })
      : await prisma.user.create({ data: { email, password: await hashPassword(password), name } as never });
    emitter.emit(EVENTS.USER_REGISTERED, { email, name });
    const payload = { sub: String(user.id), email: user.email as string, subId: user.uuid };
    return {
      user: safeUser(user),
      accessToken:  generateAccessToken(payload, env.JWT_SECRET, env.ACCESS_TOKEN_EXPIRE, env.JWT_ALGORITHM),
      refreshToken: generateRefreshToken(user.id, env.JWT_REFRESH_SECRET, env.REFRESH_TOKEN_EXPIRE, env.JWT_ALGORITHM).token,
    };
  },

  refreshAccessToken: async (oldRefreshToken: string, _req: Request) => {
    const decoded = verifyToken(oldRefreshToken, env.JWT_REFRESH_SECRET);
    if (!decoded || decoded.type !== 'refresh' || !decoded.sub) throwError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
    const userId = Number(decoded!.sub);
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, uuid: true, isActive: true } });
    if (!user || !user.isActive) throwError('User not found or inactive', 401, 'UNAUTHORIZED');
    const payload = { sub: String(userId), email: user!.email as string, subId: user!.uuid };
    return {
      accessToken:  generateAccessToken(payload, env.JWT_SECRET, env.ACCESS_TOKEN_EXPIRE, env.JWT_ALGORITHM),
      refreshToken: generateRefreshToken(userId, env.JWT_REFRESH_SECRET, env.REFRESH_TOKEN_EXPIRE, env.JWT_ALGORITHM).token,
    };
  },

  logoutUser: async (_userId: number, _refreshToken?: string): Promise<void> => {},

  forgotPasswordService: async (email: string) => {
    const user = await prisma.user.findFirst({ where: { email: ci(email) } });
    if (!user) throwError('No account found with this email', 404);
    const resetTokenHash = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({ where: { id: user!.id }, data: { resetTokenHash, resetTokenExpiry: new Date(Date.now() + env.RESET_TOKEN_EXPIRE) } });
    const resetLink = `${env.FRONTEND_URL}/#/reset-password?token=${resetTokenHash}`;
    emitter.emit(EVENTS.PASSWORD_RESET_REQUESTED, { email, name: user!.name, resetLink });
  },

  resetPasswordService: async (token: string, newPassword: string): Promise<void> => {
    const user = await prisma.user.findFirst({ where: { resetTokenHash: token, resetTokenExpiry: { gt: new Date() } } });
    if (!user) throwError('Invalid or expired reset token', 400);
    await prisma.user.update({ where: { id: user!.id }, data: { password: await hashPassword(newPassword), resetTokenHash: null, resetTokenExpiry: null } });
  },

  verifyResetTokenService: async (token: string): Promise<{ valid: true }> => {
    const user = await prisma.user.findFirst({ where: { resetTokenHash: token, resetTokenExpiry: { gt: new Date() } } });
    if (!user) throwError('Invalid or expired reset token', 400);
    return { valid: true };
  },
};

export default authService;
