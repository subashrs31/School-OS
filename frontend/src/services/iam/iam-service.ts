import { apiGet, apiPost, apiUpdate, apiDelete } from "@/services/axios-instance";
import apiConstants from "@/services/api-constants";

const C = apiConstants.SYSTEM.IAM;

const iamService = {
  // ── Roles ──────────────────────────────────────────────────────────────────
  getRoles:           ()                                                    => apiGet(C.ROLES),
  getAssignableRoles: ()                                                    => apiGet(C.ROLES_ASSIGNABLE),
  getRole:            (id: number)                                          => apiGet(C.ROLE_GET(id)),
  createRole:         (data: { name: string; description?: string; roleType?: string; isSystem?: boolean }) => apiPost(C.ROLE_CREATE, data),
  updateRole:         (id: number, data: { name?: string; description?: string; roleType?: string; isSystem?: boolean }) => apiUpdate(C.ROLE_UPDATE(id), data),
  deleteRole:         (id: number)                                          => apiDelete(C.ROLE_DELETE(id)),

  // ── Permissions ────────────────────────────────────────────────────────────
  getPermissions:    ()                                                     => apiGet(C.PERMISSIONS),
  getPermission:     (id: number)                                           => apiGet(C.PERMISSION_GET(id)),
  createPermission:  (data: { resource: string; action: string; description?: string; isSystem?: boolean }) => apiPost(C.PERMISSION_CREATE, data),
  updatePermission:  (id: number, data: { resource?: string; action?: string; description?: string; isSystem?: boolean }) => apiUpdate(C.PERMISSION_UPDATE(id), data),
  deletePermission:  (id: number)                                           => apiDelete(C.PERMISSION_DELETE(id)),

  // ── Role ↔ Permissions ─────────────────────────────────────────────────────
  getRolePermissions:   (roleId: number)                                    => apiGet(C.ROLE_PERMISSIONS(roleId)),
  assignRolePermission: (roleId: number, permissionId: number)              => apiPost(C.ROLE_PERMISSIONS(roleId), { permissionId }),
  syncRolePermissions:  (roleId: number, permissionIds: number[])           => apiPost(C.ROLE_PERMISSIONS_SYNC(roleId), { permissionIds }),
  revokeRolePermission: (roleId: number, permId: number)                    => apiDelete(C.ROLE_PERMISSION_REVOKE(roleId, permId)),

  // ── User ↔ Roles ───────────────────────────────────────────────────────────
  getUserRoles:    (userId: number)                                         => apiGet(C.USER_ROLES(userId)),
  assignUserRole:  (userId: number, roleId: number)                         => apiPost(C.USER_ROLES(userId), { roleId }),
  syncUserRoles:   (userId: number, roleIds: number[])                      => apiPost(C.USER_ROLES_SYNC(userId), { roleIds }),
  revokeUserRole:  (userId: number, roleId: number)                         => apiDelete(C.USER_ROLE_REVOKE(userId, roleId)),

  // ── User ↔ Permissions ─────────────────────────────────────────────────────
  getUserPermissions:   (userId: number)                                    => apiGet(C.USER_PERMISSIONS(userId)),
  assignUserPermission: (userId: number, permissionId: number)              => apiPost(C.USER_PERMISSIONS(userId), { permissionId }),
  syncUserPermissions:  (userId: number, permissions: Array<{ permissionId: number; effect: 'allow' | 'deny' }>) => apiPost(C.USER_PERMISSIONS_SYNC(userId), { permissions }),
  revokeUserPermission: (userId: number, permId: number)                    => apiDelete(C.USER_PERMISSION_REVOKE(userId, permId)),
};

export default iamService;
