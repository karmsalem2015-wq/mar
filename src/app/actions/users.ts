// src/app/actions/users.ts
'use server';

import { getSupabaseAdminClient } from '../../lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/require-admin';

export interface UserPermissions {
  properties: boolean;
  projects: boolean;
  media: boolean;
  submissions: boolean;
  settings: boolean;
}

export interface DbUserAccount {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended';
  createdDate: string;
  permissions: UserPermissions;
}

// List all users from Supabase Auth using the admin client
export async function getAccountsList(): Promise<DbUserAccount[]> {
  await requireAdmin('users');
  try {
    const supabase = getSupabaseAdminClient();
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) throw error;

    return users.map((user) => {
      const meta = user.user_metadata || {};
      const permissions: UserPermissions = user.app_metadata?.mar_permissions || {
        properties: true,
        projects: true,
        media: true,
        submissions: false,
        settings: false,
      };

      const name = meta.name || 'مستخدم غير معروف';

      return {
        id: user.id,
        name,
        email: user.email || '',
        status: ((user as any).banned_until || (user as any).ban_duration) ? 'suspended' : 'active',
        createdDate: user.created_at ? user.created_at.split('T')[0] : '',
        permissions,
      };
    });
  } catch (err: any) {
    console.error('Error listing accounts:', err);
    throw new Error(err.message || 'فشل تحميل الحسابات من قاعدة البيانات');
  }
}

// Create new user account in Supabase Auth
export async function createAccount(
  email: string,
  password: string,
  name: string,
  permissions: UserPermissions
): Promise<DbUserAccount> {
  await requireAdmin('users');
  try {
    const supabase = getSupabaseAdminClient();
    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
      app_metadata: { mar_role: 'editor', mar_permissions: permissions },
    });

    if (error) throw error;
    if (!user) throw new Error('فشل إنشاء المستخدم');

    return {
      id: user.id,
      name,
      email,
      status: 'active',
      createdDate: user.created_at.split('T')[0],
      permissions,
    };
  } catch (err: any) {
    console.error('Error creating account:', err);
    throw new Error(err.message || 'فشل إضافة الحساب الجديد');
  }
}

// Update permissions of a user account
export async function updateAccountPermissions(
  userId: string,
  permissions: UserPermissions
): Promise<void> {
  await requireAdmin('users');
  try {
    const supabase = getSupabaseAdminClient();
    const { data: existing, error: fetchError } = await supabase.auth.admin.getUserById(userId);
    if (fetchError || !existing?.user) throw fetchError || new Error('المستخدم غير موجود');
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      app_metadata: { ...existing.user.app_metadata, mar_permissions: permissions },
    });

    if (error) throw error;
  } catch (err: any) {
    console.error('Error updating permissions:', err);
    throw new Error(err.message || 'فشل تحديث الصلاحيات');
  }
}

// Update password of a user account (by admin)
export async function updateAccountPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  await requireAdmin('users');
  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) throw error;
  } catch (err: any) {
    console.error('Error updating password:', err);
    throw new Error(err.message || 'فشل تعيين كلمة المرور الجديدة');
  }
}

// Delete user account
export async function deleteAccount(userId: string): Promise<void> {
  await requireAdmin('users');
  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) throw error;
  } catch (err: any) {
    console.error('Error deleting account:', err);
    throw new Error(err.message || 'فشل حذف الحساب من قاعدة البيانات');
  }
}
