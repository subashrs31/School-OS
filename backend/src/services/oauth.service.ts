import { Request } from 'express';
import { User, UserOAuthAccount, Role } from '../models/index';
import authService from './auth.service';
import userRoleService from './userRole.service';
import { OAuthProfile } from '../types';

const SAFE_ATTRS = { exclude: ['password'] };

const oauthService = {
  handleOAuthUser: async (provider: string, profile: OAuthProfile, req: Request) => {
    const { oauthId, email, name, role } = profile;

    if (!email) throw Object.assign(new Error('No email returned from OAuth provider'), { statusCode: 400 });

    let oauthAccount = await UserOAuthAccount.findOne({ where: { provider, providerAccountId: oauthId } });
    let user: User | null;

    if (oauthAccount) {
      user = await User.findByPk((oauthAccount as unknown as { userId: number }).userId);
    } else {
      user = await User.findOne({ where: { email, deletedAt: null } });
      if (!user) {
        user = await User.create({ name, email });
        const defaultRole = await Role.findOne({ where: { slug: role ?? 'viewer' }, attributes: ['id'] });
        if (defaultRole) await userRoleService.syncUserRoles(user.id, [defaultRole.id]);
      }
      await UserOAuthAccount.create({ userId: user.id, provider, providerAccountId: oauthId });
    }

    if (!user || !user.isActive) {
      throw Object.assign(new Error('Your account is inactive. Please contact your admin.'), { statusCode: 403 });
    }

    const fresh = await User.findByPk(user.id, { attributes: SAFE_ATTRS });
    const userWithRoles = await userRoleService.attachRoles(fresh!.toJSON() as Record<string, unknown>);
    const { accessToken, refreshToken } = await authService.createTokens(user, req);
    return { user: userWithRoles, accessToken, refreshToken };
  },
};

export default oauthService;
