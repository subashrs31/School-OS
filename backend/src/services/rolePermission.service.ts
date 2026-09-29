import prisma from '../lib/prisma';
import { throwError } from '../helpers/throwError';

const rolePermissionService = {
  getRolePermissions: async (roleId: number) => {
    const entries = await prisma.roleHasPermission.findMany({ where: { roleId }, include: { Permission: true } });
    return entries.map(e => e.Permission).filter(p => !!p);
  },

  assignRolePermission: async (roleId: number, permissionId: number) => {
    const exists = await prisma.roleHasPermission.findFirst({ where: { roleId, permissionId } });
    if (exists) throwError('Permission already assigned to this role', 409);
    return prisma.roleHasPermission.create({ data: { roleId, permissionId } });
  },

  syncRolePermissions: async (roleId: number, permissionIds: number[]) => {
    await prisma.roleHasPermission.deleteMany({ where: { roleId } });
    if (permissionIds.length) {
      await prisma.roleHasPermission.createMany({
        data: permissionIds.map(permissionId => ({ roleId, permissionId: Number(permissionId) })),
        skipDuplicates: true,
      });
    }
    return rolePermissionService.getRolePermissions(roleId);
  },

  revokeRolePermission: async (roleId: number, permissionId: number) => {
    const entry = await prisma.roleHasPermission.findFirst({ where: { roleId, permissionId } });
    if (!entry) throwError('Permission not assigned to this role', 404);
    await prisma.roleHasPermission.delete({ where: { id: entry!.id } });
    return entry!;
  },
};

export default rolePermissionService;
