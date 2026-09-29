import prisma from '../lib/prisma';
import { Prisma } from '../generated/prisma/client';
import { throwError } from '../helpers/throwError';
import { modelData } from '../helpers/modelData';

// Relation names match the former Sequelize aliases; the frontend reads staff.User and staff.Designation.
const INCLUDE = {
  User:        { select: { id: true, name: true, email: true, uuid: true } },
  Designation: { select: { id: true, name: true } },
  Branch:      { select: { id: true, name: true } },
} satisfies Prisma.StaffInclude;

const staffService = {
  list: async (organizationId: number, branchId?: number) => {
    const where: Prisma.StaffWhereInput = { organizationId };
    if (branchId) where.branchId = branchId;
    return prisma.staff.findMany({ where, include: INCLUDE, orderBy: { createdAt: 'desc' } });
  },

  getById: async (id: number, organizationId: number) => {
    const staff = await prisma.staff.findFirst({ where: { id, organizationId }, include: INCLUDE });
    if (!staff) throwError('Staff not found', 404);
    return staff!;
  },

  create: async (organizationId: number, body: {
    userId: number; branchId?: number; designationId?: number;
    employeeCode?: string; joiningDate?: string; status?: string;
  }) => {
    const data = modelData(Prisma.StaffScalarFieldEnum, body);
    const exists = await prisma.staff.findFirst({ where: { userId: data.userId, organizationId } });
    if (exists) throwError('User is already a staff member of this organization', 409);
    const staff = await prisma.staff.create({ data: { ...data, organizationId } as Prisma.StaffUncheckedCreateInput });
    return prisma.staff.findUnique({ where: { id: staff.id }, include: INCLUDE });
  },

  update: async (id: number, organizationId: number, body: Partial<{
    branchId: number | null; designationId: number | null;
    employeeCode: string; joiningDate: string;
    status: 'active' | 'inactive' | 'on_leave';
  }>) => {
    const staff = await prisma.staff.findFirst({ where: { id, organizationId } });
    if (!staff) throwError('Staff not found', 404);
    await prisma.staff.update({ where: { id }, data: modelData(Prisma.StaffScalarFieldEnum, body) });
    return prisma.staff.findUnique({ where: { id }, include: INCLUDE });
  },

  // ── Designations ─────────────────────────────────────────────────────────────
  listDesignations: async (organizationId: number) => {
    return prisma.designation.findMany({ where: { organizationId }, orderBy: { name: 'asc' } });
  },

  createDesignation: async (organizationId: number, body: { name: string; description?: string }) => {
    return prisma.designation.create({ data: { ...modelData(Prisma.DesignationScalarFieldEnum, body), organizationId } as Prisma.DesignationUncheckedCreateInput });
  },

  updateDesignation: async (id: number, organizationId: number, body: Partial<{ name: string; description: string; isActive: boolean }>) => {
    const d = await prisma.designation.findFirst({ where: { id, organizationId } });
    if (!d) throwError('Designation not found', 404);
    return prisma.designation.update({ where: { id }, data: modelData(Prisma.DesignationScalarFieldEnum, body) });
  },
};

export default staffService;
