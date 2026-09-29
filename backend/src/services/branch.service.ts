import { Branch } from '../models/index';
import { throwError } from '../helpers/throwError';

const branchService = {
  list: async (organizationId: number) => {
    return Branch.findAll({ where: { organizationId }, order: [['name', 'ASC']] });
  },

  getById: async (id: number, organizationId: number) => {
    const branch = await Branch.findOne({ where: { id, organizationId } });
    if (!branch) throwError('Branch not found', 404);
    return branch!;
  },

  create: async (organizationId: number, body: {
    name: string; code?: string; address?: string;
    email?: string; mobile?: string; timing?: string;
  }) => {
    return Branch.create({ ...body, organizationId });
  },

  update: async (id: number, organizationId: number, body: Partial<{
    name: string; code: string; address: string;
    email: string; mobile: string; timing: string; isActive: boolean;
  }>) => {
    const branch = await Branch.findOne({ where: { id, organizationId } });
    if (!branch) throwError('Branch not found', 404);
    await branch!.update(body);
    return branch!;
  },

  delete: async (id: number, organizationId: number) => {
    const branch = await Branch.findOne({ where: { id, organizationId } });
    if (!branch) throwError('Branch not found', 404);
    await branch!.destroy();
  },
};

export default branchService;
