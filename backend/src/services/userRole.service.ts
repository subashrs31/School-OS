import { UserHasRole, Role } from '../models/index';
import { throwError } from '../helpers/throwError';
import { RoleSummary, ScopeContext } from '../types';

export interface UserWithRoles extends Record<string, unknown> {
  id: number;
  roles: RoleSummary[];
}

interface AssignRoleBody {
  roleId: number;
  scopeType?: 'global' | 'organization';
  scopeId?: number | null;
  expiresAt?: Date | null;
  assignedBy?: number | null;
}

const toRoleSummary = (e: UserHasRole): RoleSummary => {
  const r = (e as unknown as { Role: Role }).Role;
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    scopeType: (e as unknown as { scopeType: string }).scopeType,
    scopeId: (e as unknown as { scopeId: number | null }).scopeId,
    roleType: (r.roleType ?? 'normal') as 'primary' | 'secondary' | 'normal',
    isSystem: r.isSystem ?? false,
  };
};

const userRoleService = {
  getUserRoles: async (userId: number, ctx: ScopeContext = {}): Promise<RoleSummary[]> => {
    const where: Record<string, unknown> = { userId };
    if (ctx.scopeType) { where['scopeType'] = ctx.scopeType; where['scopeId'] = ctx.scopeId ?? null; }
    const entries = await UserHasRole.findAll({
      where,
      include: [{ model: Role, attributes: ['id', 'name', 'slug', 'roleType', 'isSystem'] }],
    });
    return entries
      .filter(e => (e as unknown as { Role?: Role }).Role)
      .filter(e => (e as unknown as { Role: Role }).Role.slug !== 'super-admin')
      .map(toRoleSummary);
  },

  assignUserRole: async (userId: number, body: AssignRoleBody): Promise<UserHasRole> => {
    const { roleId, scopeType = 'global', scopeId = null, ...rest } = body;
    const exists = await UserHasRole.findOne({ where: { userId, roleId, scopeType, scopeId } });
    if (exists) throwError('Role already assigned to this user in this scope', 409);
    return UserHasRole.create({ userId, roleId, scopeType, scopeId, ...rest } as Parameters<typeof UserHasRole.create>[0]);
  },

  updateUserRole: async (userId: number, roleId: number, scopeType: 'global' | 'organization', scopeId: number | null, body: Partial<AssignRoleBody>): Promise<UserHasRole> => {
    const entry = await UserHasRole.findOne({ where: { userId, roleId, scopeType, scopeId } });
    if (!entry) throwError('Role assignment not found', 404);
    return entry!.update(body);
  },

  revokeUserRole: async (userId: number, roleId: number, scopeType: 'global' | 'organization' = 'global', scopeId: number | null = null): Promise<UserHasRole> => {
    const entry = await UserHasRole.findOne({ where: { userId, roleId, scopeType, scopeId } });
    if (!entry) throwError('Role not assigned to this user in this scope', 404);
    await entry!.destroy();
    return entry!;
  },

  /** Sync replaces ALL role assignments for a user (global scope only). Use for simple admin panels. */
  syncUserRoles: async (userId: number, roleIds: number[]): Promise<RoleSummary[]> => {
    await UserHasRole.destroy({ where: { userId } });
    if (roleIds.length) {
      await UserHasRole.bulkCreate(
        roleIds.map(roleId => ({ userId, roleId, scopeType: 'global' as const, scopeId: null })),
        { ignoreDuplicates: true },
      );
    }
    return userRoleService.getUserRoles(userId);
  },

  deleteUserRoles: async (userId: number): Promise<void> => {
    await UserHasRole.destroy({ where: { userId } });
  },

  /** Used by auth.service to embed roles in JWT — returns all roles regardless of scope */
  getRoleNames: async (userId: number): Promise<RoleSummary[]> => {
    const entries = await UserHasRole.findAll({
      where: { userId },
      include: [{ model: Role, attributes: ['id', 'name', 'slug', 'roleType', 'isSystem'] }],
    });
    return entries.filter(e => (e as unknown as { Role?: Role }).Role).map(toRoleSummary);
  },

  attachRoles: async (user: Record<string, unknown>): Promise<UserWithRoles> => {
    const obj = { ...user };
    obj['roles'] = await userRoleService.getUserRoles(obj['id'] as number);
    return obj as UserWithRoles;
  },

  attachRolesToMany: async (users: Record<string, unknown>[]): Promise<UserWithRoles[]> => {
    const userIds = users.map(u => u['id'] as number);
    const entries = await UserHasRole.findAll({
      where: { userId: userIds },
      include: [{ model: Role, attributes: ['id', 'name', 'slug', 'roleType', 'isSystem'] }],
    });
    const map: Record<number, RoleSummary[]> = {};
    for (const e of entries) {
      const role = (e as unknown as { Role?: Role }).Role;
      if (!role) continue;
      const uid = (e as unknown as { userId: number }).userId;
      if (!map[uid]) map[uid] = [];
      map[uid].push(toRoleSummary(e));
    }
    return users.map(u => ({ ...u, roles: map[u['id'] as number] ?? [] } as UserWithRoles));
  },
};

export default userRoleService;
