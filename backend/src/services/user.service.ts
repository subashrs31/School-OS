import { generateUserId } from '../helpers/generateUserId';
import { Op } from 'sequelize';
import { User, Role } from '../models/index';
import { throwError } from '../helpers/throwError';
import userRoleService from './userRole.service';
import { validateExcelData } from '../helpers/common';
import crypt from '../helpers/crypt';
import { RoleSummary } from '../types';

const resolveRoleIds = async (slugsOrNames: string[]): Promise<number[]> => {
  if (!slugsOrNames.length) return [];
  const roles = await Role.findAll({ where: { slug: slugsOrNames }, attributes: ['id'] });
  return roles.map(r => r.id);
};

const USER_IMPORT_SCHEMA = {
  name:  { required: true,  aliases: ['Name', 'Full Name', 'full_name'] },
  email: { required: true,  aliases: ['Email', 'E-mail', 'email_address'], validate: (v: string): true | string => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email format' },
  roles: { required: false, aliases: ['Roles', 'Role', 'role'], default: 'viewer' },
};

const SAFE_ATTRS = { exclude: ['password'] };

const userService = {
  getUsers: async (userId: number, requesterRoles: RoleSummary[] = [], { role }: { role?: string } = {}) => {
    const where: Record<string, unknown> = { deletedAt: null };
    if (userId) where['id'] = { [Op.ne]: userId };

    const users = await User.findAll({ where, attributes: SAFE_ATTRS });
    const usersWithRoles = await userRoleService.attachRolesToMany(users.map(u => u.toJSON() as Record<string, unknown>));

    if (role) return usersWithRoles.filter(u => u.roles.some(r => r.name === role || r.slug === role));

    const isSuperAdmin = requesterRoles.some(r => r.roleType === 'primary');
    const isAdmin      = requesterRoles.some(r => r.roleType === 'secondary');

    if (isSuperAdmin) return usersWithRoles;
    if (isAdmin) return usersWithRoles.filter(u => !u.roles.some(r => r.isSystem));
    return usersWithRoles.filter(u => !u.roles.some(r => r.isSystem));
  },

  getMe: async (userId: number) => {
    const user = await User.findOne({ where: { id: userId }, attributes: SAFE_ATTRS });
    if (!user) throwError('User not found', 404);
    if (!user!.isActive) throwError('User account is inactive', 403);
    const roles = await userRoleService.getRoleNames(user!.id);
    return { email: user!.email, name: user!.name, roles };
  },

  getUserById: async (id: number) => {
    const user = await User.findOne({ where: { id, deletedAt: null }, attributes: SAFE_ATTRS });
    if (!user) throwError('User not found', 404);
    return userRoleService.attachRoles(user!.toJSON() as Record<string, unknown>);
  },

  createUser: async (body: { email?: string; name?: string; password?: string; uuid?: string }) => {
    if (body.email) {
      const exists = await User.findOne({ where: { email: body.email } });
      if (exists) throwError('Email already exists', 409);
    }

    let uuid = body.uuid;
    if (uuid) {
      const taken = await User.findOne({ where: { uuid } });
      if (taken) throwError('User ID already exists', 409);
    } else {
      const count = await User.count();
      uuid = generateUserId(count + 1);
      // ensure no collision on the generated value
      const taken = await User.findOne({ where: { uuid } });
      if (taken) uuid = generateUserId(count + 2);
    }

    const user = await User.create({
      uuid,
      ...(body.email && { email: body.email }),
      ...(body.name && { name: body.name }),
      ...(body.password && { password: body.password }),
    });
    const fresh = await User.findByPk(user.id, { attributes: SAFE_ATTRS });
    return userRoleService.attachRoles(fresh!.toJSON() as Record<string, unknown>);
  },

  updateUserById: async (id: number, body: { name?: string; uuid?: string; email?: string; password?: string }) => {
    const user = await User.findByPk(id);
    if (!user) throwError('User not found', 404);
    if (body.uuid && body.uuid !== user!.uuid) {
      const taken = await User.findOne({ where: { uuid: body.uuid } });
      if (taken) throwError('User ID already exists', 409);
      user!.uuid = body.uuid;
    }
    if (body.email && body.email !== user!.email) {
      const taken = await User.findOne({ where: { email: body.email } });
      if (taken) throwError('Email already exists', 409);
      user!.email = body.email;
    }
    if (body.name !== undefined) user!.name = body.name;
    if (body.password)           user!.password = body.password;
    await user!.save();
    const fresh = await User.findByPk(id, { attributes: SAFE_ATTRS });
    return userRoleService.attachRoles(fresh!.toJSON() as Record<string, unknown>);
  },

  updateProfile: async (id: number, body: { name?: string }) => {
    const { name } = body;
    const user = await User.findByPk(id);
    if (!user) throwError('User not found', 404);
    await user!.update({ name });
    const fresh = await User.findByPk(id, { attributes: SAFE_ATTRS });
    return userRoleService.attachRoles(fresh!.toJSON() as Record<string, unknown>);
  },

  updateStatusById: async (id: number) => {
    const user = await User.findByPk(id);
    if (!user) throwError('User not found', 404);
    user!.isActive = !user!.isActive;
    await user!.save();
    return userRoleService.attachRoles(user!.toJSON() as Record<string, unknown>);
  },

  deleteUserById: async (id: number): Promise<User> => {
    const user = await User.findByPk(id);
    if (!user) throwError('User not found', 404);
    await user!.update({ deletedAt: new Date(), isActive: false });
    await userRoleService.deleteUserRoles(id);
    return user!;
  },

  validateImportData: (rows: Record<string, unknown>[]) => validateExcelData(rows, USER_IMPORT_SCHEMA),

  importUsers: async (rows: Record<string, unknown>[]) => {
    const { valid, errors: validationErrors } = validateExcelData(rows, USER_IMPORT_SCHEMA);
    const results: { created: unknown[]; failed: Array<{ name: string; email: string; reason: string }>; validationErrors: typeof validationErrors } = { created: [], failed: [], validationErrors };
    const allRoles = (await Role.findAll({ where: { slug: { [Op.ne]: 'admin' } }, attributes: ['slug'] })).map(r => r.slug);

    for (const row of valid) {
      try {
        const email = row['email'].trim().toLowerCase();
        const exists = await User.findOne({ where: { email } });
        if (exists) { results.failed.push({ name: row['name'], email, reason: 'Email already exists' }); continue; }

        const roleNames = row['roles']
          ? String(row['roles']).split(',').map(r => r.trim().toLowerCase()).filter(r => allRoles.includes(r))
          : [allRoles[0] ?? 'viewer'];
        if (!roleNames.length) roleNames.push(allRoles[0] ?? 'viewer');

        const user = await User.create({ name: row['name'].trim(), email });
        await userRoleService.syncUserRoles(user.id, await resolveRoleIds(roleNames));
        const fresh = await User.findByPk(user.id, { attributes: SAFE_ATTRS });
        const full = await userRoleService.attachRoles(fresh!.toJSON() as Record<string, unknown>);
        results.created.push(full);
      } catch (err) {
        results.failed.push({ name: row['name'] ?? '—', email: row['email'] ?? '—', reason: (err as Error).message ?? 'Unknown error' });
      }
    }
    return results;
  },

  changePassword: async (userId: number, { currentPassword, newPassword }: { currentPassword: string; newPassword: string }): Promise<void> => {
    const user = await User.findByPk(userId);
    if (!user) throwError('User not found', 404);
    const match = await crypt.matchPassword(currentPassword, user!.password);
    if (!match) throwError('Current password is incorrect', 400);
    user!.password = newPassword;
    await user!.save();
  },

  getUserEmailById: async (id: number): Promise<string> => {
    const user = await User.findByPk(id, { attributes: ['email'] });
    return (user as unknown as { email: string }).email;
  },
};

export default userService;
