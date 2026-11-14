// Authentication and permission checks belong in each Server Action, not only the UI or proxy.
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { hasMarPermission, type MarPermission } from '@/lib/auth/roles';

export async function requireAdmin(permission: MarPermission) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || !hasMarPermission(user, permission)) {
    throw new Error('غير مصرح لك بتنفيذ هذه العملية.');
  }
  return user;
}
