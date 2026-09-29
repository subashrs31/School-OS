import prisma from '../../lib/prisma';

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

const assign = async (roleId: number, permissionIds: number[]): Promise<number> => {
  let created = 0;
  for (const permissionId of permissionIds) {
    const exists = await prisma.roleHasPermission.findFirst({ where: { roleId, permissionId } });
    if (!exists) {
      await prisma.roleHasPermission.create({ data: { roleId, permissionId } });
      created++;
    }
  }
  return created;
};

const run = async (): Promise<void> => {
  const allPermissions = await prisma.permission.findMany({ select: { id: true, slug: true } });
  const permissionMap = new Map(allPermissions.map(p => [p.slug, p.id]));

  for (const [slug, slugList] of Object.entries(rolePermissions)) {
    const role = await prisma.role.findFirst({ where: { slug } });
    if (!role) { console.log(`  Role not found, skipping: ${slug}`); continue; }

    const permIds = slugList.map(s => permissionMap.get(s)).filter((id): id is number => id !== undefined);
    const created = await assign(role.id, permIds);
    console.log(`  [${slug}] Assigned ${created} permissions (${permIds.length - created} already existed)`);
  }
};

export default { run };
