// src/lib/supabase/storage.ts
// Helper functions for Supabase Storage operations

import { getSupabaseBrowserClient } from './client';

const BUCKETS = {
  properties: 'properties',
  projects: 'projects',
  siteAssets: 'site-assets',
  submissions: 'submissions',
  media: 'media',
} as const;

type BucketName = typeof BUCKETS[keyof typeof BUCKETS];

/**
 * Upload a file to Supabase Storage
 * @returns The public URL of the uploaded file, or null on error
 */
export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: File,
  options?: { upsert?: boolean; contentType?: string }
): Promise<{ url: string; path: string } | null> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: options?.upsert ?? false,
      contentType: options?.contentType,
    });

  if (error) {
    console.error('Storage upload error:', error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

/**
 * Upload multiple files concurrently
 */
export async function uploadFiles(
  bucket: BucketName,
  basePath: string,
  files: File[]
): Promise<{ url: string; path: string }[]> {
  const results = await Promise.all(
    files.map((file, index) => {
      const ext = file.name.split('.').pop() || 'webp';
      const uniqueName = `${Date.now()}-${index}.${ext}`;
      const filePath = `${basePath}/${uniqueName}`;
      return uploadFile(bucket, filePath, file, { upsert: true });
    })
  );

  return results.filter((r): r is NonNullable<typeof r> => r !== null);
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  bucket: BucketName,
  path: string
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error('Storage delete error:', error.message);
    return false;
  }

  return true;
}

/**
 * Delete multiple files from Supabase Storage
 */
export async function deleteFiles(
  bucket: BucketName,
  paths: string[]
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths);

  if (error) {
    console.error('Storage batch delete error:', error.message);
    return false;
  }

  return true;
}

/**
 * List files in a storage folder
 */
export async function listFiles(
  bucket: BucketName,
  folder: string = ''
) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) {
    console.error('Storage list error:', error.message);
    return [];
  }

  return data.map((file) => ({
    ...file,
    url: supabase.storage.from(bucket).getPublicUrl(`${folder}/${file.name}`).data.publicUrl,
    fullPath: folder ? `${folder}/${file.name}` : file.name,
  }));
}

/**
 * Get the public URL for a storage path
 */
export function getPublicUrl(bucket: BucketName, path: string): string {
  const supabase = getSupabaseBrowserClient();
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export { BUCKETS };
