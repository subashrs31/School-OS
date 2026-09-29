import prisma from '../lib/prisma';
import { Prisma } from '../generated/prisma/client';
import { throwError } from '../helpers/throwError';
import { modelData } from '../helpers/modelData';
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

const ROLE_SELECT = { select: { id: true, name: true, slug: true, roleType: true, isSystem: true } } as const;

type EntryWithRole = { scopeType: string; scopeId: number | null; Role: { id: number; name: string; slug: string; roleType: string | null; isSystem: boolean | null } };

const toRoleSummary = (e: EntryWithRole): RoleSummary => ({
  id: e.Role.id,
  name: e.Role.name,
  slug: e.Role.slug,
  scopeType: e.scopeType,
  scopeId: e.scopeId,
  roleType: (e.Role.roleType ?? 'normal') as 'primary' | 'secondary' | 'normal',
  isSystem: e.Role.isSystem ?? false,
});

const userRoleService = {
  getUserRoles: async (userId: number, ctx: ScopeContext = {}): Promise<RoleSummary[]> => {
    const where: Prisma.UserHasRoleWhereInput = { userId };
    if (ctx.scopeType) { where.scopeType = ctx.scopeType; where.scopeId = ctx.scopeId ?? null; }
    const entries = await prisma.userHasRole.findMany({ where, include: { Role: ROLE_SELECT } });
    return entries
      .filter(e => e.Role)
      .filter(e => e.Role.slug !== 'super-admin')
      .map(toRoleSummary);
  },

  assignUserRole: async (userId: number, body: AssignRoleBody) => {
    const { roleId, scopeType = 'global', scopeId = null, ...rest } = body;
    const exists = await prisma.userHasRole.findFirst({ where: { userId, roleId: Number(roleId), scopeType, scopeId } });
    if (exists) throwError('Role already assigned to this user in this scope', 409);
    return prisma.userHasRole.create({
      data: { ...modelData(Prisma.UserHasRoleScalarFieldEnum, rest as Record<string, unknown>), userId, roleId: Number(roleId), scopeType, scopeId },
    });
  },

  updateUserRole: async (userId: number, roleId: number, scopeType: 'global' | 'organization', scopeId: number | null, body: Partial<AssignRoleBody>) => {
    const entry = await prisma.userHasRole.findFirst({ where: { userId, roleId, scopeType, scopeId } });
    if (!entry) throwError('Role assignment not found', 404);
    return prisma.userHasRole.update({ where: { id: entry!.id }, data: modelData(Prisma.UserHasRoleScalarFieldEnum, body as Record<string, unknown>) });
  },

  revokeUserRole: async (userId: number, roleId: number, scopeType: 'global' | 'organization' = 'global', scopeId: number | null = null) => {
    const entry = await prisma.userHasRole.findFirst({ where: { userId, roleId, scopeType, scopeId } });
    if (!entry) throwError('Role not assigned to this user in this scope', 404);
    await prisma.userHasRole.delete({ where: { id: entry!.id } });
    return entry!;
  },

  /** Sync replaces ALL role assignments for a user (global scope only). Use for simple admin panels. */
  syncUserRoles: async (userId: number, roleIds: number[]): Promise<RoleSummary[]> => {
    await prisma.userHasRole.deleteMany({ where: { userId } });
    if (roleIds.length) {
      await prisma.userHasRole.createMany({
        data: roleIds.map(roleId => ({ userId, roleId: Number(roleId), scopeType: 'global' as const, scopeId: null })),
        skipDuplicates: true,
      });
    }
    return userRoleService.getUserRoles(userId);
  },

  deleteUserRoles: async (userId: number): Promise<void> => {
    await prisma.userHasRole.deleteMany({ where: { userId } });
  },

  /** Used by auth.service to embed roles in JWT — returns all roles regardless of scope */
  getRoleNames: async (userId: number): Promise<RoleSummary[]> => {
    const entries = await prisma.userHasRole.findMany({ where: { userId }, include: { Role: ROLE_SELECT } });
    return entries.filter(e => e.Role).map(toRoleSummary);
  },

  attachRoles: async (user: Record<string, unknown>): Promise<UserWithRoles> => {
    const obj = { ...user };
    obj['roles'] = await userRoleService.getUserRoles(obj['id'] as number);
    return obj as UserWithRoles;
  },

  attachRolesToMany: async (users: Record<string, unknown>[]): Promise<UserWithRoles[]> => {
    const userIds = users.map(u => u['id'] as number);
    const entries = await prisma.userHasRole.findMany({ where: { userId: { in: userIds } }, include: { Role: ROLE_SELECT } });
    const map: Record<number, RoleSummary[]> = {};
    for (const e of entries) {
      if (!e.Role) continue;
      if (!map[e.userId]) map[e.userId] = [];
      map[e.userId].push(toRoleSummary(e));
    }
    return users.map(u => ({ ...u, roles: map[u['id'] as number] ?? [] } as UserWithRoles));
  },
};

export default userRoleService;
