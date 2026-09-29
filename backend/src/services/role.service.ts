import { Op } from 'sequelize';
import { Role, UserHasRole } from '../models/index';
import { throwError } from '../helpers/throwError';

interface RoleBody extends Record<string, unknown> {
  name?: string;
  slug?: string;
  description?: string;
  roleType?: 'primary' | 'secondary' | 'normal';
  isSystem?: boolean;
  isActive?: boolean;
}

const roleService = {
  getRoles: async (): Promise<Role[]> =>
    Role.findAll({ where: { slug: { [Op.ne]: 'super-admin' } }, order: [['name', 'ASC']] }),

  getRole: async (id: number): Promise<Role> => {
    const role = await Role.findByPk(id);
    if (!role) throwError('Role not found', 404);
    return role!;
  },

  getAssignableRoles: async (): Promise<Role[]> =>
    Role.findAll({ where: { isActive: true, slug: { [Op.ne]: 'super-admin' } }, order: [['name', 'ASC']] }),

  createRole: async (body: RoleBody): Promise<Role> => {
    const slug = body.slug || (body.name ? body.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : undefined);
    const exists = await Role.findOne({ where: { [Op.or]: [{ name: body.name }, { slug }] } });
    if (exists) throwError('Role already exists', 409);
    const isSystem = body.roleType === 'secondary';
    return Role.create({ ...body, slug, isSystem } as Parameters<typeof Role.create>[0]);
  },

  updateRole: async (id: number, body: RoleBody): Promise<Role> => {
    const role = await Role.findByPk(id);
    if (!role) throwError('Role not found', 404);
    if (role!.roleType === 'primary' && body.roleType && body.roleType !== 'primary') throwError('Cannot change roleType of a primary role', 403);
    const dupConditions = [
      ...(body.name !== undefined ? [{ name: body.name }] : []),
      ...(body.slug !== undefined ? [{ slug: body.slug }] : []),
    ];
    if (dupConditions.length) {
      const dup = await Role.findOne({ where: { [Op.or]: dupConditions, id: { [Op.ne]: id } } });
      if (dup) throwError('Role name or slug already exists', 409);
    }
    const isSystem = body.roleType !== undefined ? body.roleType === 'secondary' : role!.isSystem;
    return role!.update({ ...body, isSystem });
  },

  deleteRole: async (id: number): Promise<Role> => {
    const role = await Role.findByPk(id);
    if (!role) throwError('Role not found', 404);
    if (role!.isSystem) throwError('System roles cannot be deleted', 403);
    await UserHasRole.destroy({ where: { roleId: id } });
    await role!.destroy();
    return role!;
  },
};

export default roleService;
