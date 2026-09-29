import { Organization, Branch, UserOrganization, Staff, Student } from '../models/index';
import { throwError } from '../helpers/throwError';

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const organizationService = {
  list: async () => {
    return Organization.findAll({ order: [['name', 'ASC']] });
  },

  getById: async (id: number) => {
    const org = await Organization.findByPk(id);
    if (!org) throwError('Organization not found', 404);
    return org!;
  },

  create: async (body: {
    name: string; logo?: string; website?: string; email?: string;
    mobile?: string; schoolTiming?: string; address?: string;
    socialLinks?: Record<string, string>;
  }) => {
    const slug = slugify(body.name);
    const exists = await Organization.findOne({ where: { slug } });
    if (exists) throwError('Organization with this name already exists', 409);
    return Organization.create({ ...body, slug });
  },

  update: async (id: number, body: Partial<{
    name: string; logo: string; website: string; email: string;
    mobile: string; schoolTiming: string; address: string;
    socialLinks: Record<string, string>; isActive: boolean;
  }>) => {
    const org = await Organization.findByPk(id);
    if (!org) throwError('Organization not found', 404);
    if (body.name && body.name !== org!.name) {
      const slug = slugify(body.name);
      const conflict = await Organization.findOne({ where: { slug } });
      if (conflict && conflict.id !== id) throwError('Organization name already taken', 409);
      await org!.update({ ...body, slug });
    } else {
      await org!.update(body);
    }
    return org!;
  },

  getSummary: async (id: number) => {
    const [branchCount, staffCount, studentCount] = await Promise.all([
      Branch.count({ where: { organizationId: id, isActive: true } }),
      Staff.count({ where: { organizationId: id } }),
      Student.count({ where: { organizationId: id } }),
    ]);
    return { branchCount, staffCount, studentCount };
  },

  /** Verify a user has access to this organization */
  assertAccess: async (userId: number, organizationId: number, isGlobal: boolean): Promise<void> => {
    if (isGlobal) return;
    if (!userId || isNaN(userId) || !organizationId || isNaN(organizationId)) {
      throwError('Invalid user or organization identifier', 400);
    }
    const assignment = await UserOrganization.findOne({
      where: { userId, organizationId, isActive: true },
    });
    if (!assignment) throwError('Access denied to this organization', 403);
  },

  /** Verify a branch belongs to the organization */
  assertBranchOwnership: async (branchId: number, organizationId: number): Promise<void> => {
    const branch = await Branch.findOne({ where: { id: branchId, organizationId } });
    if (!branch) throwError('Branch does not belong to this organization', 403);
  },
};

export default organizationService;
