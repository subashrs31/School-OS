import { Permission } from '../../models/index';

const ACTIONS = ['view', 'create', 'edit', 'delete', 'import', 'export', 'approve', 'reject'] as const;
type Action = typeof ACTIONS[number];

const RESOURCES = ['users', 'roles', 'permissions', 'role-permission', 'user-role', 'user-permission', 'organizations', 'branches', 'staff', 'students', 'academics'] as const;
type Resource = typeof RESOURCES[number];

const data = RESOURCES.flatMap((resource: Resource) =>
  ACTIONS.map((action: Action) => ({
    name:        `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
    slug:        `${resource}.${action}`,
    resource,
    action,
    description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
  }))
);

const run = async (): Promise<void> => {
  for (const p of data) {
    const exists = await Permission.findOne({ where: { resource: p.resource, action: p.action } });
    if (exists) { console.log(`  Skipped (exists): ${p.slug}`); continue; }
    await Permission.create({ ...p, isSystem: true });
    console.log(`  Created: ${p.slug}`);
  }
};

export default { run };
