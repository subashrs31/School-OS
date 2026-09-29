import RoleSeeder from './RoleSeeder';
import UserSeeder from './UserSeeder';
import PermissionSeeder from './PermissionSeeder';
import RolePermissionSeeder from './RolePermissionSeeder';

interface SeederEntry {
  name: string;
  seeder: { run: () => Promise<void> };
}

const seeders: SeederEntry[] = [
  { name: 'RoleSeeder',           seeder: RoleSeeder },
  { name: 'PermissionSeeder',     seeder: PermissionSeeder },
  { name: 'UserSeeder',           seeder: UserSeeder },
  { name: 'RolePermissionSeeder', seeder: RolePermissionSeeder },
];

const run = async (): Promise<void> => {
  for (const { name, seeder } of seeders) {
    console.log(`\n[${name}]`);
    await seeder.run();
  }
};

export default { run, seeders };
