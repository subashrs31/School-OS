import prisma from '../lib/prisma';
import { Prisma } from '../generated/prisma/client';
import { throwError } from '../helpers/throwError';
import { modelData } from '../helpers/modelData';
import { ScopeContext } from '../types';

interface AssignPermissionBody {
  permissionId: number;
  effect: 'allow' | 'deny';
  scopeType?: 'global' | 'organization';
  scopeId?: number | null;
  expiresAt?: Date | null;
  assignedBy?: number | null;
  remarks?: string;
}

const userPermissionService = {
  getUserPermissions: async (userId: number, ctx: ScopeContext = {}): Promise<unknown[]> => {
    const where: Prisma.UserHasPermissionWhereInput = { userId, isActive: true };
    if (ctx.scopeType) { where.scopeType = ctx.scopeType; where.scopeId = ctx.scopeId ?? null; }
    const entries = await prisma.userHasPermission.findMany({ where, include: { Permission: true } });
    return entries
      .map(e => ({ ...e.Permission, effect: e.effect, scopeType: e.scopeType, scopeId: e.scopeId }))
      .filter(p => p.id);
  },

  assignUserPermission: async (userId: number, body: AssignPermissionBody) => {
    const { permissionId, effect, scopeType = 'global', scopeId = null, expiresAt = null, assignedBy = null, remarks = '' } = body;
    const exists = await prisma.userHasPermission.findFirst({ where: { userId, permissionId: Number(permissionId), scopeType, scopeId } });
    if (exists) throwError('Permission already assigned to this user in this scope', 409);
    return prisma.userHasPermission.create({
      data: { userId, permissionId: Number(permissionId), effect, scopeType, scopeId, expiresAt: expiresAt ? new Date(expiresAt) : null, assignedBy, remarks },
    });
  },

  updateUserPermission: async (userId: number, permissionId: number, scopeType: 'global' | 'organization', scopeId: number | null, body: Partial<AssignPermissionBody>) => {
    const entry = await prisma.userHasPermission.findFirst({ where: { userId, permissionId, scopeType, scopeId } });
    if (!entry) throwError('Permission assignment not found', 404);
    return prisma.userHasPermission.update({ where: { id: entry!.id }, data: modelData(Prisma.UserHasPermissionScalarFieldEnum, body as Record<string, unknown>) });
  },

  revokeUserPermission: async (userId: number, permissionId: number, scopeType: 'global' | 'organization' = 'global', scopeId: number | null = null) => {
    const entry = await prisma.userHasPermission.findFirst({ where: { userId, permissionId, scopeType, scopeId } });
    if (!entry) throwError('Permission not assigned to this user in this scope', 404);
    await prisma.userHasPermission.delete({ where: { id: entry!.id } });
    return entry!;
  },

  syncUserPermissions: async (userId: number, permissions: Array<{ permissionId: number; effect: 'allow' | 'deny' }>): Promise<unknown[]> => {
    await prisma.userHasPermission.deleteMany({ where: { userId } });
    if (permissions.length) {
      await prisma.userHasPermission.createMany({
        data: permissions.map(p => ({ userId, permissionId: Number(p.permissionId), effect: p.effect, scopeType: 'global' as const, scopeId: null })),
        skipDuplicates: true,
      });
    }
    return userPermissionService.getUserPermissions(userId);
  },
};

export default userPermissionService;
