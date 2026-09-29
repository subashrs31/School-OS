import prisma from '../lib/prisma';
import { Prisma } from '../generated/prisma/client';
import { throwError } from '../helpers/throwError';
import { modelData } from '../helpers/modelData';

const branchService = {
  list: async (organizationId: number) => {
    return prisma.branch.findMany({ where: { organizationId }, orderBy: { name: 'asc' } });
  },

  getById: async (id: number, organizationId: number) => {
    const branch = await prisma.branch.findFirst({ where: { id, organizationId } });
    if (!branch) throwError('Branch not found', 404);
    return branch!;
  },

  create: async (organizationId: number, body: {
    name: string; code?: string; address?: string;
    email?: string; mobile?: string; timing?: string;
  }) => {
    return prisma.branch.create({ data: { ...modelData(Prisma.BranchScalarFieldEnum, body), organizationId } as Prisma.BranchUncheckedCreateInput });
  },

  update: async (id: number, organizationId: number, body: Partial<{
    name: string; code: string; address: string;
    email: string; mobile: string; timing: string; isActive: boolean;
  }>) => {
    const branch = await prisma.branch.findFirst({ where: { id, organizationId } });
    if (!branch) throwError('Branch not found', 404);
    return prisma.branch.update({ where: { id }, data: modelData(Prisma.BranchScalarFieldEnum, body) });
  },

  delete: async (id: number, organizationId: number) => {
    const branch = await prisma.branch.findFirst({ where: { id, organizationId } });
    if (!branch) throwError('Branch not found', 404);
    await prisma.branch.delete({ where: { id } });
  },
};

export default branchService;
