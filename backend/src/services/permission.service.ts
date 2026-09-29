import prisma from '../lib/prisma';
import { Prisma } from '../generated/prisma/client';
import { throwError } from '../helpers/throwError';
import { modelData } from '../helpers/modelData';

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
  getPermissions: async () =>
    prisma.permission.findMany({ orderBy: [{ resource: 'asc' }, { action: 'asc' }] }),

  getActions: async (): Promise<string[]> =>
    ['view', 'create', 'edit', 'delete', 'import', 'export', 'approve', 'reject'],

  getPermission: async (id: number) => {
    const perm = await prisma.permission.findUnique({ where: { id } });
    if (!perm) throwError('Permission not found', 404);
    return perm!;
  },

  createPermission: async (body: PermissionBody) => {
    const exists = await prisma.permission.findFirst({ where: { resource: body.resource, action: body.action } });
    if (exists) throwError('Permission already exists for this resource and action', 409);
    const name = body.name?.trim() || `${body.resource}:${body.action}`;
    const slug = `${body.resource}:${body.action}`.toLowerCase().replace(/[^a-z0-9:]/g, '-');
    return prisma.permission.create({ data: { ...modelData(Prisma.PermissionScalarFieldEnum, body), name, slug } as Prisma.PermissionCreateInput });
  },

  updatePermission: async (id: number, body: PermissionBody) => {
    const perm = await prisma.permission.findUnique({ where: { id } });
    if (!perm) throwError('Permission not found', 404);
    if (perm!.isSystem && body.isSystem === false) throwError('Cannot remove system flag from a system permission', 403);
    // Prisma ignores undefined filters (Sequelize threw on them), so fall back to the stored values.
    const dup = await prisma.permission.findFirst({
      where: { resource: body.resource ?? perm!.resource, action: body.action ?? perm!.action, id: { not: id } },
    });
    if (dup) throwError('Permission already exists for this resource and action', 409);
    return prisma.permission.update({ where: { id }, data: modelData(Prisma.PermissionScalarFieldEnum, body) });
  },

  deletePermission: async (id: number) => {
    const perm = await prisma.permission.findUnique({ where: { id } });
    if (!perm) throwError('Permission not found', 404);
    if (perm!.isSystem) throwError('System permissions cannot be deleted', 403);
    await prisma.roleHasPermission.deleteMany({ where: { permissionId: id } });
    await prisma.userHasPermission.deleteMany({ where: { permissionId: id } });
    await prisma.permission.delete({ where: { id } });
    return perm!;
  },
};

export default permissionService;
