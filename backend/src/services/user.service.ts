import { generateUserId } from '../helpers/generateUserId';
import prisma from '../lib/prisma';
import { throwError } from '../helpers/throwError';
import userRoleService from './userRole.service';
import { validateExcelData } from '../helpers/common';
import crypt from '../helpers/crypt';
import env from '../config/appConfig';
import { RoleSummary } from '../types';

// The Sequelize User model defaulted `password` to '12345678' and hashed it in beforeCreate/beforeUpdate hooks.
// That behaviour is kept as-is for the port (known issue, removed in Phase 4 — see docs/current-state.md §13).
const LEGACY_DEFAULT_PASSWORD = '12345678';
export const hashPassword = (plain: string): Promise<string> => crypt.hashPassword(plain, env.SALT_ROUNDS);

const resolveRoleIds = async (slugsOrNames: string[]): Promise<number[]> => {
  if (!slugsOrNames.length) return [];
  const roles = await prisma.role.findMany({ where: { slug: { in: slugsOrNames } }, select: { id: true } });
  return roles.map(r => r.id);
};

const USER_IMPORT_SCHEMA = {
  name:  { required: true,  aliases: ['Name', 'Full Name', 'full_name'] },
  email: { required: true,  aliases: ['Email', 'E-mail', 'email_address'], validate: (v: string): true | string => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email format' },
  roles: { required: false, aliases: ['Roles', 'Role', 'role'], default: 'viewer' },
};

const SAFE_ATTRS = { password: true } as const;

const findSafe = (id: number) => prisma.user.findUnique({ where: { id }, omit: SAFE_ATTRS });

const userService = {
  getUsers: async (userId: number, requesterRoles: RoleSummary[] = [], { role }: { role?: string } = {}) => {
    const users = await prisma.user.findMany({
      where: { deletedAt: null, ...(userId ? { id: { not: userId } } : {}) },
      omit: SAFE_ATTRS,
    });
    const usersWithRoles = await userRoleService.attachRolesToMany(users as unknown as Record<string, unknown>[]);

    if (role) return usersWithRoles.filter(u => u.roles.some(r => r.name === role || r.slug === role));

    const isSuperAdmin = requesterRoles.some(r => r.roleType === 'primary');
    const isAdmin      = requesterRoles.some(r => r.roleType === 'secondary');

    if (isSuperAdmin) return usersWithRoles;
    if (isAdmin) return usersWithRoles.filter(u => !u.roles.some(r => r.isSystem));
    return usersWithRoles.filter(u => !u.roles.some(r => r.isSystem));
  },

  getMe: async (userId: number) => {
    const user = await findSafe(userId);
    if (!user) throwError('User not found', 404);
    if (!user!.isActive) throwError('User account is inactive', 403);
    const roles = await userRoleService.getRoleNames(user!.id);
    return { email: user!.email, name: user!.name, roles };
  },

  getUserById: async (id: number) => {
    const user = await prisma.user.findFirst({ where: { id, deletedAt: null }, omit: SAFE_ATTRS });
    if (!user) throwError('User not found', 404);
    return userRoleService.attachRoles(user as unknown as Record<string, unknown>);
  },

  createUser: async (body: { email?: string; name?: string; password?: string; uuid?: string }) => {
    if (body.email) {
      const exists = await prisma.user.findFirst({ where: { email: body.email } });
      if (exists) throwError('Email already exists', 409);
    }

    let uuid = body.uuid;
    if (uuid) {
      const taken = await prisma.user.findFirst({ where: { uuid } });
      if (taken) throwError('User ID already exists', 409);
    } else {
      const count = await prisma.user.count();
      uuid = generateUserId(count + 1);
      // ensure no collision on the generated value
      const taken = await prisma.user.findFirst({ where: { uuid } });
      if (taken) uuid = generateUserId(count + 2);
    }

    const user = await prisma.user.create({
      data: {
        uuid,
        ...(body.email && { email: body.email }),
        ...(body.name && { name: body.name }),
        password: await hashPassword(body.password || LEGACY_DEFAULT_PASSWORD),
      },
    });
    const fresh = await findSafe(user.id);
    return userRoleService.attachRoles(fresh as unknown as Record<string, unknown>);
  },

  updateUserById: async (id: number, body: { name?: string; uuid?: string; email?: string; password?: string }) => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throwError('User not found', 404);
    const data: { uuid?: string; email?: string; name?: string; password?: string } = {};
    if (body.uuid && body.uuid !== user!.uuid) {
      const taken = await prisma.user.findFirst({ where: { uuid: body.uuid } });
      if (taken) throwError('User ID already exists', 409);
      data.uuid = body.uuid;
    }
    if (body.email && body.email !== user!.email) {
      const taken = await prisma.user.findFirst({ where: { email: body.email } });
      if (taken) throwError('Email already exists', 409);
      data.email = body.email;
    }
    if (body.name !== undefined) data.name = body.name;
    if (body.password)           data.password = await hashPassword(body.password);
    await prisma.user.update({ where: { id }, data });
    const fresh = await findSafe(id);
    return userRoleService.attachRoles(fresh as unknown as Record<string, unknown>);
  },

  updateProfile: async (id: number, body: { name?: string }) => {
    const { name } = body;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throwError('User not found', 404);
    await prisma.user.update({ where: { id }, data: { name } });
    const fresh = await findSafe(id);
    return userRoleService.attachRoles(fresh as unknown as Record<string, unknown>);
  },

  updateStatusById: async (id: number) => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throwError('User not found', 404);
    const updated = await prisma.user.update({ where: { id }, data: { isActive: !user!.isActive } });
    // Sequelize returned the full instance here (password hash included); kept identical for the port.
    return userRoleService.attachRoles(updated as unknown as Record<string, unknown>);
  },

  deleteUserById: async (id: number) => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throwError('User not found', 404);
    const updated = await prisma.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    await userRoleService.deleteUserRoles(id);
    return updated;
  },

  validateImportData: (rows: Record<string, unknown>[]) => validateExcelData(rows, USER_IMPORT_SCHEMA),

  importUsers: async (rows: Record<string, unknown>[]) => {
    const { valid, errors: validationErrors } = validateExcelData(rows, USER_IMPORT_SCHEMA);
    const results: { created: unknown[]; failed: Array<{ name: string; email: string; reason: string }>; validationErrors: typeof validationErrors } = { created: [], failed: [], validationErrors };
    const allRoles = (await prisma.role.findMany({ where: { slug: { not: 'admin' } }, select: { slug: true } })).map(r => r.slug);

    for (const row of valid) {
      try {
        const email = row['email'].trim().toLowerCase();
        const exists = await prisma.user.findFirst({ where: { email } });
        if (exists) { results.failed.push({ name: row['name'], email, reason: 'Email already exists' }); continue; }

        const roleNames = row['roles']
          ? String(row['roles']).split(',').map(r => r.trim().toLowerCase()).filter(r => allRoles.includes(r))
          : [allRoles[0] ?? 'viewer'];
        if (!roleNames.length) roleNames.push(allRoles[0] ?? 'viewer');

        // As under Sequelize, no uuid is generated here, so this create fails per row (current-state.md B7).
        const user = await prisma.user.create({
          data: { name: row['name'].trim(), email, password: await hashPassword(LEGACY_DEFAULT_PASSWORD) } as never,
        });
        await userRoleService.syncUserRoles(user.id, await resolveRoleIds(roleNames));
        const fresh = await findSafe(user.id);
        const full = await userRoleService.attachRoles(fresh as unknown as Record<string, unknown>);
        results.created.push(full);
      } catch (err) {
        results.failed.push({ name: row['name'] ?? '—', email: row['email'] ?? '—', reason: (err as Error).message ?? 'Unknown error' });
      }
    }
    return results;
  },

  changePassword: async (userId: number, { currentPassword, newPassword }: { currentPassword: string; newPassword: string }): Promise<void> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throwError('User not found', 404);
    const match = await crypt.matchPassword(currentPassword, user!.password as string);
    if (!match) throwError('Current password is incorrect', 400);
    await prisma.user.update({ where: { id: userId }, data: { password: await hashPassword(newPassword) } });
  },

  getUserEmailById: async (id: number): Promise<string> => {
    const user = await prisma.user.findUnique({ where: { id }, select: { email: true } });
    return user?.email as string;
  },
};

export default userService;
