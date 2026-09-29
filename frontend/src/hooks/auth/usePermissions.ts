import { useAppSelector } from "@/store/store";

/**
 * Returns true if the current user has the given permission.
 * Super Admin (permissions.all = true) always returns true.
 * Normal users are checked against permissions.items.
 */
export function useHasPermission(permission: string): boolean {
  const { all, items } = useAppSelector((s) => s.auth.permissions);
  if (all) return true;
  return items.includes(permission);
}

/**
 * Returns a hasPermission checker function — useful when you need to check
 * multiple permissions without calling the hook multiple times.
 */
export function usePermissions() {
  const { all, items } = useAppSelector((s) => s.auth.permissions);
  return (permission: string): boolean => all || items.includes(permission);
}
