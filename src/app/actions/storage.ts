// src/app/actions/storage.ts
'use server';

import { getSupabaseAdminClient } from '../../lib/supabase/admin';

export async function serverUploadFile(formData: FormData): Promise<{ url: string; path: string } | null> {
  try {
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'media';
    const path = (formData.get('path') as string) || `uploads/${Date.now()}`;
    const contentType = (formData.get('contentType') as string) || file?.type || 'application/octet-stream';
    const upsert = formData.get('upsert') === 'true';

    if (!file) {
      console.error('No file provided in serverUploadFile');
      return null;
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const supabase = getSupabaseAdminClient() as any;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType,
        upsert,
      });

    if (error) {
      console.error('Server storage upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (err: any) {
    console.error('Error in serverUploadFile:', err);
    return null;
  }
}

export async function serverDeleteFile(bucket: string, path: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdminClient() as any;
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.error('Server storage delete error:', error);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('Error in serverDeleteFile:', err);
    return false;
  }
}

export async function serverDeleteFiles(bucket: string, paths: string[]): Promise<boolean> {
  try {
    const supabase = getSupabaseAdminClient() as any;
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) {
      console.error('Server storage batch delete error:', error);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('Error in serverDeleteFiles:', err);
    return false;
  }
}

export async function serverListFiles(bucket: string, folder: string = '') {
  try {
    const supabase = getSupabaseAdminClient() as any;
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Server storage list error:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      ...item,
      url: supabase.storage.from(bucket).getPublicUrl(`${folder ? folder + '/' : ''}${item.name}`).data.publicUrl,
    }));
  } catch (err: any) {
    console.error('Error in serverListFiles:', err);
    return [];
  }
}
