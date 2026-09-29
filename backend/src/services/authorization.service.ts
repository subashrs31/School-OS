import prisma from '../lib/prisma';
import { Prisma } from '../generated/prisma/client';
import { RoleSummary, ScopeContext } from '../types';

const now = () => new Date();

/**
 * Builds the WHERE clause for scope matching.
 * Global roles/permissions apply everywhere.
 * Scoped roles/permissions apply only within their scope.
 */
const scopeWhere = (ctx: ScopeContext): Prisma.UserHasRoleWhereInput & Prisma.UserHasPermissionWhereInput => {
  if (!ctx.scopeType || ctx.scopeType === 'global') {
    return { scopeType: 'global', scopeId: null };
  }
  return {
    OR: [
      { scopeType: 'global', scopeId: null },
      { scopeType: ctx.scopeType as 'organization', scopeId: ctx.scopeId ?? null },
    ],
  };
};

// Active, unexpired and in scope. (Under Sequelize the scope's Op.or overwrote the expiry Op.or when a scope was
// passed; no caller passes a scope today, so both conditions are simply combined here.)
const activeInScope = (userId: number, ctx: ScopeContext) => ({
  userId,
  isActive: true,
  AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now() } }] }, scopeWhere(ctx)],
});

export interface EffectivePermissions {
  all: boolean;
  items: string[];
}

const authorizationService = {
  /**
   * Returns all active role assignments for a user within a given scope.
   * Global roles are always included.
   */
  getUserRoles: async (userId: number, ctx: ScopeContext = {}): Promise<RoleSummary[]> => {
    const entries = await prisma.userHasRole.findMany({
      where: activeInScope(userId, ctx),
      include: { Role: { select: { id: true, name: true, slug: true, roleType: true, isSystem: true } } },
    });

    return entries
      .filter(e => e.Role)
      .map(e => ({
        id: e.Role.id,
        name: e.Role.name,
        slug: e.Role.slug,
        scopeType: e.scopeType,
        scopeId: e.scopeId,
        roleType: (e.Role.roleType ?? 'normal') as 'primary' | 'secondary' | 'normal',
        isSystem: e.Role.isSystem ?? false,
      }));
  },

  /**
   * Returns all direct user permission overrides (allow + deny) for a scope.
   */
  getUserDirectPermissions: async (userId: number, ctx: ScopeContext = {}) => {
    return prisma.userHasPermission.findMany({
      where: activeInScope(userId, ctx),
      include: { Permission: { select: { id: true, slug: true, resource: true, action: true } } },
    });
  },

  /**
   * Returns the final flat list of effective permission slugs for a user in a scope.
   * primary   → full bypass, returns ['*']
   * secondary → isSystem but permission check runs normally
   * normal    → standard permission check
   */
  getEffectivePermissions: async (userId: number, ctx: ScopeContext = {}): Promise<EffectivePermissions> => {
    const [roles, directEntries] = await Promise.all([
      authorizationService.getUserRoles(userId, ctx),
      authorizationService.getUserDirectPermissions(userId, ctx),
    ]);

    // primary role = full access
    if (roles.some(r => r.roleType === 'primary')) return { all: true, items: [] };

    const denied = new Set<string>();
    const directAllowed = new Set<string>();

    for (const entry of directEntries) {
      const perm = entry.Permission;
      if (!perm) continue;
      if (entry.effect === 'deny') denied.add(perm.slug);
      else directAllowed.add(perm.slug);
    }

    const roleIds = roles.map(r => r.id);
    const rolePermEntries = roleIds.length
      ? await prisma.roleHasPermission.findMany({
          where: { roleId: { in: roleIds }, Permission: { isActive: true } },
          include: { Permission: { select: { id: true, slug: true } } },
        })
      : [];

    const fromRoles = new Set<string>();
    for (const rp of rolePermEntries) {
      if (rp.Permission) fromRoles.add(rp.Permission.slug);
    }

    const items: string[] = [];
    for (const slug of [...directAllowed, ...fromRoles]) {
      if (!denied.has(slug)) items.push(slug);
    }

    return { all: false, items };
  },

  /**
   * Core authorization check.
   * primary   → full bypass, always true
   * secondary → isSystem but permission check still runs
   * normal    → standard permission check
   * Priority: primary bypass > direct deny > direct allow > role permission > DENY
   */
  can: async (userId: number, permissionSlug: string, ctx: ScopeContext = {}): Promise<boolean> => {
    const [resource, action] = permissionSlug.split('.');
    if (!resource || !action) return false;

    // Single query: fetch all active role assignments with roleType
    const userRoles = await prisma.userHasRole.findMany({
      where: activeInScope(userId, ctx),
      include: { Role: { select: { id: true, roleType: true } } },
    });

    // primary role = full access, skip everything
    if (userRoles.some(e => e.Role?.roleType === 'primary')) return true;

    if (!userRoles.length) return false;

    const permission = await prisma.permission.findFirst({ where: { resource, action, isActive: true } });
    if (!permission) return false;

    // 1. Check direct user permission overrides (applies to secondary and normal both)
    const direct = await prisma.userHasPermission.findFirst({
      where: { ...activeInScope(userId, ctx), permissionId: permission.id },
    });

    if (direct?.effect === 'deny') return false;
    if (direct?.effect === 'allow') return true;

    // 2. Check role-based permissions
    const roleIds = userRoles.map(r => r.roleId);
    const hasRolePerm = await prisma.roleHasPermission.findFirst({ where: { roleId: { in: roleIds }, permissionId: permission.id } });

    return !!hasRolePerm;
  },
};

export default authorizationService;
