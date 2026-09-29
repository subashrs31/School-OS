import crypto from 'crypto';
import { Op } from 'sequelize';
import { Request } from 'express';
import { User } from '../models/index';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../helpers/token';
import crypt from '../helpers/crypt';
import env from '../config/appConfig';
import emitter from '../events/emitter';
import EVENTS from '../events/events';
import { throwError } from '../helpers/throwError';

const SAFE_ATTRS = { exclude: ['password'] };

const safeUser = (user: User) => ({
  id:         user.id,
  uuid:       user.uuid,
  name:       user.name,
  email:      user.email,
  isActive:   user.isActive,
  verifiedAt: user.verifiedAt,
});

const authService = {
  loginUser: async ({ username, password }: { username: string; password: string }, _req: Request) => {
    const user = await User.findOne({ where: { [Op.or]: [{ email: username }, { uuid: username }] } });
    if (!user || user.deletedAt) throwError('Invalid credentials', 401, 'UNAUTHORIZED');
    if (!await crypt.matchPassword(password, user!.password)) throwError('Invalid credentials', 401, 'UNAUTHORIZED');
    if (!user!.isActive) throwError('Your account is inactive. Please contact your admin.', 403, 'FORBIDDEN');
    const payload = { sub: String(user!.id), email: user!.email, subId: user!.uuid };
    return {
      user: safeUser(user!),
      accessToken:  generateAccessToken(payload, env.JWT_SECRET, env.ACCESS_TOKEN_EXPIRE, env.JWT_ALGORITHM),
      refreshToken: generateRefreshToken(user!.id, env.JWT_REFRESH_SECRET, env.REFRESH_TOKEN_EXPIRE, env.JWT_ALGORITHM).token,
    };
  },

  registerUser: async ({ name, email, password }: { name: string; email: string; password: string }, _req: Request) => {
    const existing = await User.findOne({ where: { email } });
    if (existing && !existing.deletedAt) throwError('User already exists', 400);
    const user = existing?.deletedAt
      ? await existing.update({ name, password, deletedAt: null, isActive: true }).then(() => existing)
      : await User.create({ email, password, name });
    emitter.emit(EVENTS.USER_REGISTERED, { email, name });
    const payload = { sub: String(user.id), email: user.email, subId: user.uuid };
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
    const user = await User.findByPk(userId, { attributes: ['id', 'email', 'uuid', 'isActive'] });
    if (!user || !user.isActive) throwError('User not found or inactive', 401, 'UNAUTHORIZED');
    const payload = { sub: String(userId), email: user.email, subId: user.uuid };
    return {
      accessToken:  generateAccessToken(payload, env.JWT_SECRET, env.ACCESS_TOKEN_EXPIRE, env.JWT_ALGORITHM),
      refreshToken: generateRefreshToken(userId, env.JWT_REFRESH_SECRET, env.REFRESH_TOKEN_EXPIRE, env.JWT_ALGORITHM).token,
    };
  },

  logoutUser: async (_userId: number, _refreshToken?: string): Promise<void> => {},

  forgotPasswordService: async (email: string) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throwError('No account found with this email', 404);
    const resetTokenHash = crypto.randomBytes(32).toString('hex');
    await user!.update({ resetTokenHash, resetTokenExpiry: new Date(Date.now() + env.RESET_TOKEN_EXPIRE) });
    const resetLink = `${env.FRONTEND_URL}/#/reset-password?token=${resetTokenHash}`;
    emitter.emit(EVENTS.PASSWORD_RESET_REQUESTED, { email, name: user!.name, resetLink });
  },

  resetPasswordService: async (token: string, newPassword: string): Promise<void> => {
    const user = await User.findOne({ where: { resetTokenHash: token, resetTokenExpiry: { [Op.gt]: new Date() } } });
    if (!user) throwError('Invalid or expired reset token', 400);
    await user!.update({ password: newPassword, resetTokenHash: null, resetTokenExpiry: null });
  },

  verifyResetTokenService: async (token: string): Promise<{ valid: true }> => {
    const user = await User.findOne({ where: { resetTokenHash: token, resetTokenExpiry: { [Op.gt]: new Date() } } });
    if (!user) throwError('Invalid or expired reset token', 400);
    return { valid: true };
  },
};

export default authService;
