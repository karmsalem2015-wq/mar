import type { User } from '@supabase/supabase-js';

// Only Auth app_metadata is server-controlled; user_metadata is NOT trusted for roles.
export type MarPermission = 'properties' | 'projects' | 'media' | 'submissions' | 'settings' | 'users';
export type MarRole = 'super_admin' | 'admin' | 'editor';

export function getMarRole(user: Pick<User, 'app_metadata'> | null | undefined): MarRole | null {
  const role = user?.app_metadata?.mar_role;
  return role === 'super_admin' || role === 'admin' || role === 'editor' ? role : null;
}
export function isMarAdmin(user: Pick<User, 'app_metadata'> | null | undefined): boolean {
  return getMarRole(user) !== null;
}
export function hasMarPermission(
  user: Pick<User, 'app_metadata'> | null | undefined, permission: MarPermission
): boolean {
  const role = getMarRole(user);
  if (!role) return false;
  if (role === 'super_admin') return true;
  if (permission === 'users') return false;
  if (role === 'editor' && (permission === 'submissions' || permission === 'settings')) return false;
  const permissions = user?.app_metadata?.mar_permissions;
  if (permissions && typeof permissions === 'object' && !Array.isArray(permissions)) {
    const flag = (permissions as Record<string, unknown>)[permission];
    if (flag !== undefined) return flag === true;
  }
  return true;
}
