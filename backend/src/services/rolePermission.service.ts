import { RoleHasPermission, Permission } from '../models/index';
import { throwError } from '../helpers/throwError';

const rolePermissionService = {
  getRolePermissions: async (roleId: number): Promise<Permission[]> => {
    const entries = await RoleHasPermission.findAll({ where: { roleId }, include: [{ model: Permission }] });
    return entries.map(e => (e as unknown as { Permission?: Permission }).Permission).filter((p): p is Permission => !!p);
  },

  assignRolePermission: async (roleId: number, permissionId: number): Promise<RoleHasPermission> => {
    const exists = await RoleHasPermission.findOne({ where: { roleId, permissionId } });
    if (exists) throwError('Permission already assigned to this role', 409);
    return RoleHasPermission.create({ roleId, permissionId });
  },

  syncRolePermissions: async (roleId: number, permissionIds: number[]): Promise<Permission[]> => {
    await RoleHasPermission.destroy({ where: { roleId } });
    if (permissionIds.length) await RoleHasPermission.bulkCreate(permissionIds.map(permissionId => ({ roleId, permissionId })), { ignoreDuplicates: true });
    return rolePermissionService.getRolePermissions(roleId);
  },

  revokeRolePermission: async (roleId: number, permissionId: number): Promise<RoleHasPermission> => {
    const entry = await RoleHasPermission.findOne({ where: { roleId, permissionId } });
    if (!entry) throwError('Permission not assigned to this role', 404);
    await entry!.destroy();
    return entry!;
  },
};

export default rolePermissionService;
