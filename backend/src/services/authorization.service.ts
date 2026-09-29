import { Op } from 'sequelize';
import { Permission, RoleHasPermission, UserHasPermission, UserHasRole, Role } from '../models/index';
import { RoleSummary, ScopeContext } from '../types';

const now = () => new Date();

/**
 * Builds the WHERE clause for scope matching.
 * Global roles/permissions apply everywhere.
 * Scoped roles/permissions apply only within their scope.
 */
const scopeWhere = (ctx: ScopeContext) => {
  if (!ctx.scopeType || ctx.scopeType === 'global') {
    return { scopeType: 'global', scopeId: null };
  }
  return {
    [Op.or]: [
      { scopeType: 'global', scopeId: null },
      { scopeType: ctx.scopeType, scopeId: ctx.scopeId ?? null },
    ],
  };
};

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
    const entries = await UserHasRole.findAll({
      where: {
        userId,
        isActive: true,
        [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: now() } }],
        ...scopeWhere(ctx),
      },
      include: [{ model: Role, attributes: ['id', 'name', 'slug', 'roleType', 'isSystem'] }],
    });

    return entries
      .filter(e => (e as unknown as { Role?: Role }).Role)
      .map(e => {
        const r = (e as unknown as { Role: Role }).Role;
        return {
          id: r.id,
          name: r.name,
          slug: r.slug,
          scopeType: (e as unknown as { scopeType: string }).scopeType,
          scopeId: (e as unknown as { scopeId: number | null }).scopeId,
          roleType: (r.roleType ?? 'normal') as 'primary' | 'secondary' | 'normal',
          isSystem: r.isSystem ?? false,
        };
      });
  },

  /**
   * Returns all direct user permission overrides (allow + deny) for a scope.
   */
  getUserDirectPermissions: async (userId: number, ctx: ScopeContext = {}) => {
    return UserHasPermission.findAll({
      where: {
        userId,
        isActive: true,
        [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: now() } }],
        ...scopeWhere(ctx),
      },
      include: [{ model: Permission, attributes: ['id', 'slug', 'resource', 'action'] }],
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
      const perm = (entry as unknown as { Permission?: { slug: string } }).Permission;
      if (!perm) continue;
      if ((entry as unknown as { effect: string }).effect === 'deny') denied.add(perm.slug);
      else directAllowed.add(perm.slug);
    }

    const roleIds = roles.map(r => r.id);
    const rolePermEntries = roleIds.length
      ? await RoleHasPermission.findAll({
          where: { roleId: { [Op.in]: roleIds } },
          include: [{ model: Permission, attributes: ['id', 'slug'], where: { isActive: true } }],
        })
      : [];

    const fromRoles = new Set<string>();
    for (const rp of rolePermEntries) {
      const perm = (rp as unknown as { Permission?: { slug: string } }).Permission;
      if (perm) fromRoles.add(perm.slug);
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
    const userRoles = await UserHasRole.findAll({
      where: {
        userId,
        isActive: true,
        [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: now() } }],
        ...scopeWhere(ctx),
      },
      include: [{ model: Role, attributes: ['id', 'roleType'] }],
    });

    // primary role = full access, skip everything
    if (userRoles.some(e => (e as unknown as { Role?: { roleType: string } }).Role?.roleType === 'primary')) return true;

    if (!userRoles.length) return false;

    const permission = await Permission.findOne({ where: { resource, action, isActive: true } });
    if (!permission) return false;

    // 1. Check direct user permission overrides (applies to secondary and normal both)
    const direct = await UserHasPermission.findOne({
      where: {
        userId,
        permissionId: permission.id,
        isActive: true,
        [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: now() } }],
        ...scopeWhere(ctx),
      },
    });

    if ((direct as unknown as { effect?: string } | null)?.effect === 'deny') return false;
    if ((direct as unknown as { effect?: string } | null)?.effect === 'allow') return true;

    // 2. Check role-based permissions
    const roleIds = userRoles.map(r => (r as unknown as { roleId: number }).roleId);
    const hasRolePerm = await RoleHasPermission.findOne({ where: { roleId: { [Op.in]: roleIds }, permissionId: permission.id } });

    return !!hasRolePerm;
  },
};

export default authorizationService;
