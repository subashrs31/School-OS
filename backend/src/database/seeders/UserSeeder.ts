import prisma from '../../lib/prisma';
import RoleSeeder from './RoleSeeder';
import userRoleService from '../../services/userRole.service';
import { hashPassword } from '../../services/user.service';

interface UserData {
  name: string;
  email: string;
  password: string;
  role: string;
  uuid: string;
}

// Same local demo accounts as the former Sequelize seeder (known issue: shared demo password, see Phase 4).
const data: UserData[] = [
  { name: 'Super Admin', email: 'superadmin@example.com', password: '12345678', role: 'super-admin', uuid: 'DNSTSA0001' },
  { name: 'Admin',       email: 'admin@example.com',      password: '12345678', role: 'admin',       uuid: 'DNSTA0002'  },
];

const run = async (): Promise<void> => {
  await RoleSeeder.run();

  for (const u of data) {
    const exists = await prisma.user.findFirst({ where: { email: u.email } });
    if (exists) { console.log(`  Skipped (exists): ${u.email}`); continue; }
    const user = await prisma.user.create({
      data: { name: u.name, email: u.email, password: await hashPassword(u.password), uuid: u.uuid, isActive: true },
    });
    const role = await prisma.role.findFirst({ where: { slug: u.role }, select: { id: true } });
    if (role) await userRoleService.assignUserRole(user.id, { roleId: role.id, scopeType: 'global', scopeId: null });
    console.log(`  Created: ${u.email} [${u.role}]`);
  }
};

export default { run };
