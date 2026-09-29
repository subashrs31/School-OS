import { Staff, User, Designation, Branch } from '../models/index';
import { throwError } from '../helpers/throwError';

const INCLUDE = [
  { model: User,        attributes: ['id', 'name', 'email', 'uuid'] },
  { model: Designation, attributes: ['id', 'name'] },
  { model: Branch,      attributes: ['id', 'name'] },
];

const staffService = {
  list: async (organizationId: number, branchId?: number) => {
    const where: Record<string, unknown> = { organizationId };
    if (branchId) where['branchId'] = branchId;
    return Staff.findAll({ where, include: INCLUDE, order: [['createdAt', 'DESC']] });
  },

  getById: async (id: number, organizationId: number) => {
    const staff = await Staff.findOne({ where: { id, organizationId }, include: INCLUDE });
    if (!staff) throwError('Staff not found', 404);
    return staff!;
  },

  create: async (organizationId: number, body: {
    userId: number; branchId?: number; designationId?: number;
    employeeCode?: string; joiningDate?: string; status?: string;
  }) => {
    const exists = await Staff.findOne({ where: { userId: body.userId, organizationId } });
    if (exists) throwError('User is already a staff member of this organization', 409);
    const staff = await Staff.create({ ...body, organizationId });
    return Staff.findOne({ where: { id: staff.id }, include: INCLUDE });
  },

  update: async (id: number, organizationId: number, body: Partial<{
    branchId: number | null; designationId: number | null;
    employeeCode: string; joiningDate: string;
    status: 'active' | 'inactive' | 'on_leave';
  }>) => {
    const staff = await Staff.findOne({ where: { id, organizationId } });
    if (!staff) throwError('Staff not found', 404);
    await (staff as InstanceType<typeof Staff>).update(body as any);
    return Staff.findOne({ where: { id }, include: INCLUDE });
  },

  // ── Designations ─────────────────────────────────────────────────────────────
  listDesignations: async (organizationId: number) => {
    return Designation.findAll({ where: { organizationId }, order: [['name', 'ASC']] });
  },

  createDesignation: async (organizationId: number, body: { name: string; description?: string }) => {
    return Designation.create({ ...body, organizationId });
  },

  updateDesignation: async (id: number, organizationId: number, body: Partial<{ name: string; description: string; isActive: boolean }>) => {
    const d = await Designation.findOne({ where: { id, organizationId } });
    if (!d) throwError('Designation not found', 404);
    await d!.update(body);
    return d!;
  },
};

export default staffService;
