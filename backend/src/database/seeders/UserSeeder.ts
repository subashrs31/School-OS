import { User } from '../../models/index';
import { Role } from '../../models/index';
import RoleSeeder from './RoleSeeder';
import userRoleService from '../../services/userRole.service';

interface UserData {
  name: string;
  email: string;
  password: string;
  role: string;
  uuid: string;
}

const data: UserData[] = [
  { name: 'Super Admin', email: 'superadmin@example.com', password: '12345678', role: 'super-admin', uuid: 'DNSTSA0001' },
  { name: 'Admin',       email: 'admin@example.com',      password: '12345678', role: 'admin',       uuid: 'DNSTA0002'  },
];

const run = async (): Promise<void> => {
  await RoleSeeder.run();

  for (const u of data) {
    const exists = await User.findOne({ where: { email: u.email } });
    if (exists) { console.log(`  Skipped (exists): ${u.email}`); continue; }
    const user = await User.create({ name: u.name, email: u.email, password: u.password, uuid: u.uuid, isActive: true });
    const role = await Role.findOne({ where: { slug: u.role }, attributes: ['id'] });
    if (role) await userRoleService.assignUserRole(user.id, { roleId: role.id, scopeType: 'global', scopeId: null });
    console.log(`  Created: ${u.email} [${u.role}]`);
  }
};

export default { run };
