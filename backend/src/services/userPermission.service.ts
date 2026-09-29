import { UserHasPermission, Permission } from '../models/index';
import { throwError } from '../helpers/throwError';
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
    const where: Record<string, unknown> = { userId, isActive: true };
    if (ctx.scopeType) { where['scopeType'] = ctx.scopeType; where['scopeId'] = ctx.scopeId ?? null; }
    const entries = await UserHasPermission.findAll({
      where,
      include: [{ model: Permission }],
    });
    return entries
      .map(e => ({
        ...(e as unknown as { Permission?: { toJSON: () => Record<string, unknown> } }).Permission?.toJSON(),
        effect: (e as unknown as { effect: string }).effect,
        scopeType: (e as unknown as { scopeType: string }).scopeType,
        scopeId: (e as unknown as { scopeId: number | null }).scopeId,
      }))
      .filter(p => (p as { id?: unknown }).id);
  },

  assignUserPermission: async (userId: number, body: AssignPermissionBody): Promise<UserHasPermission> => {
    const { permissionId, effect, scopeType = 'global', scopeId = null, expiresAt = null, assignedBy = null, remarks = '' } = body;
    const exists = await UserHasPermission.findOne({ where: { userId, permissionId, scopeType, scopeId } });
    if (exists) throwError('Permission already assigned to this user in this scope', 409);
    return UserHasPermission.create({ userId, permissionId, effect, scopeType, scopeId, expiresAt, assignedBy, remarks });
  },

  updateUserPermission: async (userId: number, permissionId: number, scopeType: 'global' | 'organization', scopeId: number | null, body: Partial<AssignPermissionBody>): Promise<UserHasPermission> => {
    const entry = await UserHasPermission.findOne({ where: { userId, permissionId, scopeType, scopeId } });
    if (!entry) throwError('Permission assignment not found', 404);
    return entry!.update(body);
  },

  revokeUserPermission: async (userId: number, permissionId: number, scopeType: 'global' | 'organization' = 'global', scopeId: number | null = null): Promise<UserHasPermission> => {
    const entry = await UserHasPermission.findOne({ where: { userId, permissionId, scopeType, scopeId } });
    if (!entry) throwError('Permission not assigned to this user in this scope', 404);
    await entry!.destroy();
    return entry!;
  },

  syncUserPermissions: async (userId: number, permissions: Array<{ permissionId: number; effect: 'allow' | 'deny' }>): Promise<unknown[]> => {
    await UserHasPermission.destroy({ where: { userId } });
    if (permissions.length) {
      await UserHasPermission.bulkCreate(
        permissions.map(p => ({ userId, permissionId: p.permissionId, effect: p.effect, scopeType: 'global' as const, scopeId: null })),
        { ignoreDuplicates: true },
      );
    }
    return userPermissionService.getUserPermissions(userId);
  },
};

export default userPermissionService;
