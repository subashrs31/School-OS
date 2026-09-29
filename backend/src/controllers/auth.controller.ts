import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import authorizationService from '../services/authorization.service';
import { User, UserOrganization, Organization, Branch } from '../models/index';
import env from '../config/appConfig';
import { setCookies, clearCookies, setCsrfCookie, clearCsrfCookie } from '../helpers/cookies';
import apiResponse from '../helpers/apiResponse';
import { AppUser } from '../types';

const authController = {
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, accessToken, refreshToken } = await authService.loginUser(req.body as { username: string; password: string }, req);
      const isCookie = env.AUTH_BASE === 'cookie';
      if (isCookie) {
        setCookies(res, 'accessToken', accessToken, env.ACCESS_TOKEN_EXPIRE);
        setCookies(res, 'refreshToken', refreshToken, env.REFRESH_TOKEN_EXPIRE);
        setCsrfCookie(req, res);
        apiResponse.success(res, 'Login successful', { user }, 200);
      } else {
        apiResponse.success(res, 'Login successful', { user, accessToken, refreshToken }, 200);
      }
    } catch (error) { next(error); }
  },

  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, accessToken, refreshToken } = await authService.registerUser(req.body as { name: string; email: string; password: string }, req);
      const isCookie = env.AUTH_BASE === 'cookie';
      if (isCookie) {
        setCookies(res, 'accessToken', accessToken, env.ACCESS_TOKEN_EXPIRE);
        setCookies(res, 'refreshToken', refreshToken, env.REFRESH_TOKEN_EXPIRE);
        setCsrfCookie(req, res);
        apiResponse.success(res, 'Registration successful', { user }, 201);
      } else {
        apiResponse.success(res, 'Registration successful', { user, accessToken, refreshToken }, 201);
      }
    } catch (error) { next(error); }
  },

  refreshToken: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isCookie = env.AUTH_BASE === 'cookie';
      const oldRefreshToken = isCookie
        ? (req.cookies as Record<string, string>)['refreshToken']
        : (req.body as { refreshToken?: string }).refreshToken;
      if (!oldRefreshToken) throw Object.assign(new Error('Refresh token not found'), { statusCode: 401 });
      const { accessToken, refreshToken } = await authService.refreshAccessToken(oldRefreshToken, req);
      if (isCookie) {
        setCookies(res, 'accessToken', accessToken, env.ACCESS_TOKEN_EXPIRE);
        setCookies(res, 'refreshToken', refreshToken, env.REFRESH_TOKEN_EXPIRE);
        setCsrfCookie(req, res);
        apiResponse.success(res, 'Token refreshed successfully', {}, 200);
      } else {
        apiResponse.success(res, 'Token refreshed successfully', { accessToken, refreshToken }, 200);
      }
    } catch (error) { next(error); }
  },

  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isCookie = env.AUTH_BASE === 'cookie';
      const refreshToken = isCookie
        ? (req.cookies as Record<string, string>)['refreshToken']
        : (req.body as { refreshToken?: string }).refreshToken;
      const userId = (req.user as AppUser | undefined)?.userId;
      if (userId) await authService.logoutUser(userId, refreshToken);
      if (isCookie) {
        clearCookies(res, 'accessToken');
        clearCookies(res, 'refreshToken');
        clearCsrfCookie(res);
      }
      apiResponse.success(res, 'Logged out successfully', {}, 200);
    } catch (error) { next(error); }
  },

  oauthCallback: async (req: Request, res: Response): Promise<void> => {
    try {
      const { provider, profile } = req.user as unknown as { provider: string; profile: { oauthId: string; email: string; name: string } };
      const oauthService = (await import('../services/oauth.service')).default;
      const { accessToken, refreshToken } = await oauthService.handleOAuthUser(provider, profile, req);
      setCookies(res, 'accessToken', accessToken, env.ACCESS_TOKEN_EXPIRE);
      setCookies(res, 'refreshToken', refreshToken, env.REFRESH_TOKEN_EXPIRE);
      setCsrfCookie(req, res);
      res.redirect(`${env?.FRONTEND_URL}/#/oauth/success`);
    } catch (error) {
      res.redirect(`${env.FRONTEND_URL}/#/oauth/error?message=${encodeURIComponent((error as Error).message)}`);
    }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await authService.forgotPasswordService((req.body as { email: string }).email);
      apiResponse.success(res, 'If an account with that email exists, a password reset link has been sent', {}, 200);
    } catch (error) { next(error); }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await authService.resetPasswordService(req.params['token'] as string, (req.body as { password: string }).password);
      apiResponse.success(res, 'Password reset successful', {}, 200);
    } catch (error) { next(error); }
  },

  verifyResetToken: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await authService.verifyResetTokenService(req.params['token'] as string);
      apiResponse.success(res, 'Token is valid', {}, 200);
    } catch (error) { next(error); }
  },

  me: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.user as AppUser | undefined)?.userId;
      if (!userId) { apiResponse.error(res, 'Unauthorized', null, 401); return; }
      const user = await User.findByPk(userId);
      if (!user || user.deletedAt) { apiResponse.error(res, 'User not found', null, 404); return; }
      if (!user.isActive) { apiResponse.error(res, 'Account inactive', null, 403); return; }
      const [roles, permissions, orgAssignments] = await Promise.all([
        authorizationService.getUserRoles(userId),
        authorizationService.getEffectivePermissions(userId),
        UserOrganization.findAll({
          where: { userId, isActive: true },
          include: [
            { model: Organization, attributes: ['id', 'name', 'slug'] },
            { model: Branch,       attributes: ['id', 'name'] },
          ],
        }),
      ]);
      apiResponse.success(res, 'Authenticated user fetched successfully', {
        user: {
          id:         user.id,
          uuid:       user.uuid,
          name:       user.name,
          email:      user.email,
          isActive:   user.isActive,
          verifiedAt: user.verifiedAt,
          lastLogin:  user.lastLogin,
        },
        roles: roles.map(r => ({
          id:        r.id,
          name:      r.name,
          slug:      r.slug,
          roleType:  r.roleType,
          isSystem:  r.isSystem,
          scopeType: r.scopeType,
          scopeId:   r.scopeId,
        })),
        permissions,
        organizations: orgAssignments.map((a: any) => ({
          organizationId:   a.organizationId,
          organizationName: a.Organization?.name ?? null,
          branchId:         a.branchId,
          branchName:       a.Branch?.name ?? null,
          isPrimary:        a.isPrimary,
        })),
      });
    } catch (error) { next(error); }
  },
};

export default authController;
