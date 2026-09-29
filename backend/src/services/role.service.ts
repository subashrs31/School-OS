import prisma from '../lib/prisma';
import { Prisma } from '../generated/prisma/client';
import { throwError } from '../helpers/throwError';
import { modelData } from '../helpers/modelData';

interface RoleBody extends Record<string, unknown> {
  name?: string;
  slug?: string;
  description?: string;
  roleType?: 'primary' | 'secondary' | 'normal';
  isSystem?: boolean;
  isActive?: boolean;
}

const roleService = {
  getRoles: async () =>
    prisma.role.findMany({ where: { slug: { not: 'super-admin' } }, orderBy: { name: 'asc' } }),

  getRole: async (id: number) => {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throwError('Role not found', 404);
    return role!;
  },

  getAssignableRoles: async () =>
    prisma.role.findMany({ where: { isActive: true, slug: { not: 'super-admin' } }, orderBy: { name: 'asc' } }),

  createRole: async (body: RoleBody) => {
    const slug = body.slug || (body.name ? body.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : undefined);
    const exists = await prisma.role.findFirst({ where: { OR: [{ name: body.name }, { slug }] } });
    if (exists) throwError('Role already exists', 409);
    const isSystem = body.roleType === 'secondary';
    return prisma.role.create({ data: { ...modelData(Prisma.RoleScalarFieldEnum, body), slug, isSystem } as Prisma.RoleCreateInput });
  },

  updateRole: async (id: number, body: RoleBody) => {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throwError('Role not found', 404);
    if (role!.roleType === 'primary' && body.roleType && body.roleType !== 'primary') throwError('Cannot change roleType of a primary role', 403);
    const dupConditions = [
      ...(body.name !== undefined ? [{ name: body.name }] : []),
      ...(body.slug !== undefined ? [{ slug: body.slug }] : []),
    ];
    if (dupConditions.length) {
      const dup = await prisma.role.findFirst({ where: { OR: dupConditions, id: { not: id } } });
      if (dup) throwError('Role name or slug already exists', 409);
    }
    const isSystem = body.roleType !== undefined ? body.roleType === 'secondary' : role!.isSystem;
    return prisma.role.update({ where: { id }, data: { ...modelData(Prisma.RoleScalarFieldEnum, body), isSystem } });
  },

  deleteRole: async (id: number) => {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throwError('Role not found', 404);
    if (role!.isSystem) throwError('System roles cannot be deleted', 403);
    await prisma.userHasRole.deleteMany({ where: { roleId: id } });
    await prisma.role.delete({ where: { id } });
    return role!;
  },
};

export default roleService;
