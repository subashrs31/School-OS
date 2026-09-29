import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import iamService from "@/services/iam/iam-service";

export const IAM_KEYS = {
  roles:           ["iam", "roles"] as const,
  rolesAssignable: ["iam", "roles", "assignable"] as const,
  role:            (id: number) => ["iam", "roles", id] as const,
  rolePermissions: (roleId: number) => ["iam", "roles", roleId, "permissions"] as const,
  permissions:     ["iam", "permissions"] as const,
  permission:      (id: number) => ["iam", "permissions", id] as const,
  userRoles:       (userId: number) => ["iam", "users", userId, "roles"] as const,
  userPermissions: (userId: number) => ["iam", "users", userId, "permissions"] as const,
};

// ── Roles ─────────────────────────────────────────────────────────────────────
export function useRoles() {
  return useQuery({
    queryKey: IAM_KEYS.roles,
    queryFn:  () => iamService.getRoles().then((r: any) => r?.data?.roles ?? r?.data ?? r ?? []),
    staleTime: 5 * 60 * 1000,
  });
}
export function useAssignableRoles() {
  return useQuery({
    queryKey: IAM_KEYS.rolesAssignable,
    queryFn:  () => iamService.getAssignableRoles().then((r: any) => r?.data?.roles ?? r?.data ?? r ?? []),
  });
}
export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; roleType?: string; isSystem?: boolean }) => iamService.createRole(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: IAM_KEYS.roles }),
  });
}
export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; description?: string; roleType?: string; isSystem?: boolean } }) =>
      iamService.updateRole(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: IAM_KEYS.roles }),
  });
}
export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => iamService.deleteRole(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: IAM_KEYS.roles }),
  });
}

// ── Permissions ───────────────────────────────────────────────────────────────
export function usePermissions() {
  return useQuery({
    queryKey: IAM_KEYS.permissions,
    queryFn:  () => iamService.getPermissions().then((r: any) => r?.data?.permissions ?? r?.data ?? r ?? []),
    staleTime: 5 * 60 * 1000,
  });
}
export function useCreatePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { resource: string; action: string; description?: string; isSystem?: boolean }) => iamService.createPermission(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: IAM_KEYS.permissions }),
  });
}
export function useUpdatePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { resource?: string; action?: string; description?: string; isSystem?: boolean } }) =>
      iamService.updatePermission(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: IAM_KEYS.permissions }),
  });
}
export function useDeletePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => iamService.deletePermission(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: IAM_KEYS.permissions }),
  });
}

// ── Role ↔ Permissions ────────────────────────────────────────────────────────
export function useRolePermissions(roleId: number) {
  return useQuery({
    queryKey: IAM_KEYS.rolePermissions(roleId),
    queryFn:  () => iamService.getRolePermissions(roleId).then((r: any) => r?.data?.permissions ?? r?.data ?? r ?? []),
    enabled:  !!roleId,
  });
}
export function useSyncRolePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) =>
      iamService.syncRolePermissions(roleId, permissionIds),
    onSuccess: (_r, { roleId }) => qc.invalidateQueries({ queryKey: IAM_KEYS.rolePermissions(roleId) }),
  });
}
export function useAssignRolePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: number; permissionId: number }) =>
      iamService.assignRolePermission(roleId, permissionId),
    onSuccess: (_r, { roleId }) => qc.invalidateQueries({ queryKey: IAM_KEYS.rolePermissions(roleId) }),
  });
}
export function useRevokeRolePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permId }: { roleId: number; permId: number }) =>
      iamService.revokeRolePermission(roleId, permId),
    onSuccess: (_r, { roleId }) => qc.invalidateQueries({ queryKey: IAM_KEYS.rolePermissions(roleId) }),
  });
}

// ── User ↔ Roles ──────────────────────────────────────────────────────────────
export function useUserRoles(userId: number) {
  return useQuery({
    queryKey: IAM_KEYS.userRoles(userId),
    queryFn:  () => iamService.getUserRoles(userId).then((r: any) => r?.data?.roles ?? r?.data ?? r ?? []),
    enabled:  !!userId,
  });
}
export function useSyncUserRoles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleIds }: { userId: number; roleIds: number[] }) =>
      iamService.syncUserRoles(userId, roleIds),
    onSuccess: (_r, { userId }) => {
      qc.invalidateQueries({ queryKey: IAM_KEYS.userRoles(userId) });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
export function useAssignUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) =>
      iamService.assignUserRole(userId, roleId),
    onSuccess: (_r, { userId }) => {
      qc.invalidateQueries({ queryKey: IAM_KEYS.userRoles(userId) });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
export function useRevokeUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) =>
      iamService.revokeUserRole(userId, roleId),
    onSuccess: (_r, { userId }) => {
      qc.invalidateQueries({ queryKey: IAM_KEYS.userRoles(userId) });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// ── User ↔ Permissions ────────────────────────────────────────────────────────
export function useUserPermissions(userId: number) {
  return useQuery({
    queryKey: IAM_KEYS.userPermissions(userId),
    queryFn:  () => iamService.getUserPermissions(userId).then((r: any) => r?.data?.permissions ?? r?.data ?? r ?? []),
    enabled:  !!userId,
  });
}
export function useSyncUserPermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, permissionIds }: { userId: number; permissionIds: number[] }) =>
      iamService.syncUserPermissions(userId, permissionIds.map(id => ({ permissionId: id, effect: 'allow' as const }))),
    onSuccess: (_r, { userId }) => qc.invalidateQueries({ queryKey: IAM_KEYS.userPermissions(userId) }),
  });
}
export function useAssignUserPermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, permissionId }: { userId: number; permissionId: number }) =>
      iamService.assignUserPermission(userId, permissionId),
    onSuccess: (_r, { userId }) => qc.invalidateQueries({ queryKey: IAM_KEYS.userPermissions(userId) }),
  });
}
export function useRevokeUserPermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, permId }: { userId: number; permId: number }) =>
      iamService.revokeUserPermission(userId, permId),
    onSuccess: (_r, { userId }) => qc.invalidateQueries({ queryKey: IAM_KEYS.userPermissions(userId) }),
  });
}
