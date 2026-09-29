import prisma from '../lib/prisma';
import { Prisma } from '../generated/prisma/client';
import { throwError } from '../helpers/throwError';
import { modelData } from '../helpers/modelData';

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const organizationService = {
  list: async () => {
    return prisma.organization.findMany({ orderBy: { name: 'asc' } });
  },

  getById: async (id: number) => {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) throwError('Organization not found', 404);
    return org!;
  },

  create: async (body: {
    name: string; logo?: string; website?: string; email?: string;
    mobile?: string; schoolTiming?: string; address?: string;
    socialLinks?: Record<string, string>;
  }) => {
    const slug = slugify(body.name);
    const exists = await prisma.organization.findFirst({ where: { slug } });
    if (exists) throwError('Organization with this name already exists', 409);
    return prisma.organization.create({ data: { ...modelData(Prisma.OrganizationScalarFieldEnum, body), slug } as Prisma.OrganizationCreateInput });
  },

  update: async (id: number, body: Partial<{
    name: string; logo: string; website: string; email: string;
    mobile: string; schoolTiming: string; address: string;
    socialLinks: Record<string, string>; isActive: boolean;
  }>) => {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) throwError('Organization not found', 404);
    const data = modelData(Prisma.OrganizationScalarFieldEnum, body);
    if (body.name && body.name !== org!.name) {
      const slug = slugify(body.name);
      const conflict = await prisma.organization.findFirst({ where: { slug } });
      if (conflict && conflict.id !== id) throwError('Organization name already taken', 409);
      return prisma.organization.update({ where: { id }, data: { ...data, slug } });
    }
    return prisma.organization.update({ where: { id }, data });
  },

  getSummary: async (id: number) => {
    const [branchCount, staffCount, studentCount] = await Promise.all([
      prisma.branch.count({ where: { organizationId: id, isActive: true } }),
      prisma.staff.count({ where: { organizationId: id } }),
      prisma.student.count({ where: { organizationId: id } }),
    ]);
    return { branchCount, staffCount, studentCount };
  },

  /** Verify a user has access to this organization */
  assertAccess: async (userId: number, organizationId: number, isGlobal: boolean): Promise<void> => {
    if (isGlobal) return;
    if (!userId || isNaN(userId) || !organizationId || isNaN(organizationId)) {
      throwError('Invalid user or organization identifier', 400);
    }
    const assignment = await prisma.userOrganization.findFirst({
      where: { userId, organizationId, isActive: true },
    });
    if (!assignment) throwError('Access denied to this organization', 403);
  },

  /** Verify a branch belongs to the organization */
  assertBranchOwnership: async (branchId: number, organizationId: number): Promise<void> => {
    const branch = await prisma.branch.findFirst({ where: { id: branchId, organizationId } });
    if (!branch) throwError('Branch does not belong to this organization', 403);
  },
};

export default organizationService;
