import { Op } from 'sequelize';
import { Permission, RoleHasPermission, UserHasPermission } from '../models/index';
import { throwError } from '../helpers/throwError';

interface PermissionBody extends Record<string, unknown> {
  name?: string;
  slug?: string;
  resource?: string;
  action?: string;
  description?: string;
  isSystem?: boolean;
  isActive?: boolean;
}

const permissionService = {
  getPermissions: async (): Promise<Permission[]> =>
    Permission.findAll({ order: [['resource', 'ASC'], ['action', 'ASC']] }),

  getActions: async (): Promise<string[]> =>
    ['view', 'create', 'edit', 'delete', 'import', 'export', 'approve', 'reject'],

  getPermission: async (id: number): Promise<Permission> => {
    const perm = await Permission.findByPk(id);
    if (!perm) throwError('Permission not found', 404);
    return perm!;
  },

  createPermission: async (body: PermissionBody): Promise<Permission> => {
    const exists = await Permission.findOne({ where: { resource: body.resource, action: body.action } });
    if (exists) throwError('Permission already exists for this resource and action', 409);
    const name = body.name?.trim() || `${body.resource}:${body.action}`;
    const slug = `${body.resource}:${body.action}`.toLowerCase().replace(/[^a-z0-9:]/g, '-');
    return Permission.create({ ...body, name, slug } as Parameters<typeof Permission.create>[0]);
  },

  updatePermission: async (id: number, body: PermissionBody): Promise<Permission> => {
    const perm = await Permission.findByPk(id);
    if (!perm) throwError('Permission not found', 404);
    if (perm!.isSystem && body.isSystem === false) throwError('Cannot remove system flag from a system permission', 403);
    const dup = await Permission.findOne({
      where: { resource: body.resource, action: body.action, id: { [Op.ne]: id } },
    });
    if (dup) throwError('Permission already exists for this resource and action', 409);
    return perm!.update(body);
  },

  deletePermission: async (id: number): Promise<Permission> => {
    const perm = await Permission.findByPk(id);
    if (!perm) throwError('Permission not found', 404);
    if (perm!.isSystem) throwError('System permissions cannot be deleted', 403);
    await RoleHasPermission.destroy({ where: { permissionId: id } });
    await UserHasPermission.destroy({ where: { permissionId: id } });
    await perm!.destroy();
    return perm!;
  },
};

export default permissionService;
