import { Role, Permission, RoleHasPermission } from '../../models/index';

const rolePermissions: Record<string, string[]> = {
  // primary roleType — full bypass, no permission check ever runs, no need to assign anything
  'super-admin': [],
  // secondary roleType — isSystem but permission check still runs, assign explicitly
  'admin': [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
    'permissions.view',
    'role-permission.view', 'role-permission.create', 'role-permission.edit', 'role-permission.delete',
    'user-role.view', 'user-role.create', 'user-role.edit', 'user-role.delete',
    'user-permission.view', 'user-permission.create', 'user-permission.edit', 'user-permission.delete',
  ],
  // 'editor': [
  //   'user.view',
  //   'role.view',
  //   'permission.view',
  // ],
};

const assign = async (roleId: number, permissions: Permission[]): Promise<number> => {
  let created = 0;
  for (const perm of permissions) {
    const exists = await RoleHasPermission.findOne({ where: { roleId, permissionId: perm.id } });
    if (!exists) {
      await RoleHasPermission.create({ roleId, permissionId: perm.id } as Parameters<typeof RoleHasPermission.create>[0]);
      created++;
    }
  }
  return created;
};

const run = async (): Promise<void> => {
  const allPermissions = await Permission.findAll();
  const permissionMap = new Map(allPermissions.map(p => [p.slug as string, p]));

  for (const [slug, slugList] of Object.entries(rolePermissions)) {
    const role = await Role.findOne({ where: { slug } });
    if (!role) { console.log(`  Role not found, skipping: ${slug}`); continue; }

    const perms = slugList.map(s => permissionMap.get(s)).filter(Boolean) as Permission[];
    const created = await assign(role.id, perms);
    console.log(`  [${slug}] Assigned ${created} permissions (${perms.length - created} already existed)`);
  }
};

export default { run };
