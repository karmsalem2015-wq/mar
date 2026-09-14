// src/lib/supabase/storage.ts
// Helper functions for Supabase Storage operations

import { getSupabaseBrowserClient } from './client';
import {
  serverUploadFile,
  serverDeleteFile,
  serverDeleteFiles,
  serverListFiles,
} from '../../app/actions/storage';

const BUCKETS = {
  properties: 'properties',
  projects: 'projects',
  siteAssets: 'site-assets',
  submissions: 'submissions',
  media: 'media',
} as const;

type BucketName = typeof BUCKETS[keyof typeof BUCKETS];

/**
 * Upload a file to Supabase Storage via Server Action (bypasses RLS)
 * @returns The public URL of the uploaded file, or null on error
 */
export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: File,
  options?: { upsert?: boolean; contentType?: string }
): Promise<{ url: string; path: string } | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    formData.append('path', path);
    if (options?.contentType) formData.append('contentType', options.contentType);
    if (options?.upsert !== undefined) formData.append('upsert', String(options.upsert));

    return await serverUploadFile(formData);
  } catch (err: any) {
    console.error('Storage upload error:', err);
    return null;
  }
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
  try {
    return await serverDeleteFile(bucket, path);
  } catch (err: any) {
    console.error('Storage delete error:', err);
    return false;
  }
}

/**
 * Delete multiple files from Supabase Storage
 */
export async function deleteFiles(
  bucket: BucketName,
  paths: string[]
): Promise<boolean> {
  try {
    return await serverDeleteFiles(bucket, paths);
  } catch (err: any) {
    console.error('Storage batch delete error:', err);
    return false;
  }
}

/**
 * List files in a storage folder
 */
export async function listFiles(
  bucket: BucketName,
  folder: string = ''
) {
  try {
    return await serverListFiles(bucket, folder);
  } catch (err: any) {
    console.error('Storage list error:', err);
    return [];
  }
}

/**
 * Get the public URL for a storage path
 */
export function getPublicUrl(bucket: BucketName, path: string): string {
  const supabase = getSupabaseBrowserClient();
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export { BUCKETS };
