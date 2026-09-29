import { Role } from '../../models/index';

const data = [
  { name: 'Super Admin',  slug: 'super-admin',  roleType: 'primary',   isSystem: true,  description: 'Full system access — bypasses all permission checks' },
  { name: 'Admin',        slug: 'admin',        roleType: 'secondary', isSystem: true,  description: 'System admin — permission checks still apply' },
  { name: 'School Admin', slug: 'school-admin', roleType: 'normal',    isSystem: false, description: 'Organization-level admin — manages all branches' },
  { name: 'Branch Admin', slug: 'branch-admin', roleType: 'normal',    isSystem: false, description: 'Branch-level admin — restricted to assigned branch' },
  { name: 'Teacher',      slug: 'teacher',      roleType: 'normal',    isSystem: false, description: 'Teacher — access to assigned classes/subjects' },
  { name: 'Accountant',   slug: 'accountant',   roleType: 'normal',    isSystem: false, description: 'Accountant — finance access within organization' },
  { name: 'HR',           slug: 'hr',           roleType: 'normal',    isSystem: false, description: 'HR — staff management within organization' },
];

const run = async (): Promise<void> => {
  for (const r of data) {
    const exists = await Role.findOne({ where: { slug: r.slug } });
    if (exists) { console.log(`  Skipped (exists): ${r.name}`); continue; }
    await Role.create(r);
    console.log(`  Created: ${r.name}`);
  }
};

export default { run };
