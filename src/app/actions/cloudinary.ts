// src/app/actions/cloudinary.ts
'use server';

import { v2 as cloudinary } from 'cloudinary';

interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  folder: string;
  transformation: string;
  apiKey: string;
  cloudName: string;
}

export async function getCloudinarySignature(): Promise<CloudinarySignatureResponse> {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  const paramsToSign = {
    timestamp: timestamp,
    folder: 'real-estate-videos',
    transformation: 'q_auto,f_auto',
  };

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!apiSecret || apiSecret === 'your_api_secret_here') {
    throw new Error('Please configure CLOUDINARY_API_SECRET in your .env.local file');
  }
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_API_KEY is missing');
  }
  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is missing');
  }

  // Generate the HMAC SHA1 signature
  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    signature,
    timestamp,
    folder: 'real-estate-videos',
    transformation: 'q_auto,f_auto',
    apiKey,
    cloudName,
  };
}

export async function deleteCloudinaryVideo(publicId: string): Promise<{ success: boolean; error?: string }> {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!apiSecret || apiSecret === 'your_api_secret_here') {
    throw new Error('Please configure CLOUDINARY_API_SECRET in your .env.local file');
  }
  if (!apiKey || !cloudName) {
    throw new Error('Cloudinary config is incomplete');
  }

  // Configure cloudinary using server variables
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  try {
    const res = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    if (res.result === 'ok') {
      return { success: true };
    } else {
      return { success: false, error: res.result };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'فشل حذف الفيديو من Cloudinary' };
  }
}

export async function listCloudinaryVideos(): Promise<{ success: boolean; resources?: any[]; error?: string }> {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!apiSecret || apiSecret === 'your_api_secret_here') {
    return { success: false, error: 'Cloudinary credentials not configured' };
  }
  if (!apiKey || !cloudName) {
    return { success: false, error: 'Cloudinary config is incomplete' };
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  try {
    const result = await cloudinary.api.resources({
      resource_type: 'video',
      type: 'upload',
      max_results: 100,
    });
    return { success: true, resources: result.resources };
  } catch (err: any) {
    console.error('Error listing Cloudinary resources:', err);
    return { success: false, error: err.message || 'فشل جلب ملفات الفيديو من Cloudinary' };
  }
}
