// src/app/actions/settings.ts
'use server';

import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { BRAND } from '@/config/brand';

export interface SiteSocialSettings {
  instagram: string;
  x: string;
  facebook: string;
  youtube: string;
  tiktok: string;
  snapchat: string;
  linkedin: string;
  whatsapp: string;
}

export interface SiteContactSettings {
  unifiedNumber: string;
  mobileNumber: string;
  companyEmail: string;
  address: string;
}

export interface SiteHeroSettings {
  title: string;
  subtitle: string;
  sliderImages: string[];
}

export interface SiteStatsSettings {
  projects: string;
  units: string;
  clients: string;
  years: string;
}

export interface SiteSeoSettings {
  title: string;
  description: string;
}

export interface SiteSettingsData {
  social: SiteSocialSettings;
  contact: SiteContactSettings;
  hero: SiteHeroSettings;
  stats: SiteStatsSettings;
  seo: SiteSeoSettings;
}

const DEFAULT_SETTINGS: SiteSettingsData = {
  social: {
    instagram: BRAND.social.instagram || 'https://instagram.com/mar.realestate/',
    x: BRAND.social.x || 'https://twitter.com/Mar_Real_Estate',
    facebook: BRAND.social.facebook || 'https://facebook.com/Mar1RealEstate',
    youtube: BRAND.social.youtube || 'https://youtube.com/c/%D9%85%D8%A7%D8%B1%D8%A7%D9%84%D8%B9%D9%82%D8%A7%D8%B1%D9%8A%D8%A9',
    tiktok: 'https://www.tiktok.com/@mar.realestate',
    snapchat: 'https://www.snapchat.com/add/mar.realestate',
    linkedin: 'https://www.linkedin.com/company/mar-realestate/',
    whatsapp: BRAND.contact.primaryPhone.tel || '+966568526666',
  },
  contact: {
    unifiedNumber: BRAND.contact.primaryPhone.display || '0568526666',
    mobileNumber: BRAND.contact.secondaryPhone.display || '0568526666',
    companyEmail: BRAND.contact.email || 'info@mar-ksa.com',
    address: 'جدة، حي الصفا، شارع الأمير سلطان',
  },
  hero: {
    title: 'نعتمد أحدث التقنيات',
    subtitle: 'لنربطكم بأفضل الفرص السكنية والاستثمارية',
    sliderImages: ['/hero-bg-3.webp', '/hero-bg-luxury.webp', '/hero-bg-2.webp'],
  },
  stats: {
    projects: '75',
    units: '850',
    clients: '1200',
    years: '14',
  },
  seo: {
    title: 'شركة مار العقارية | عقارات فاخرة بالسعودية',
    description: 'حرفية تشييد وتميّز عقاري — نعتمد أحدث التقنيات لربط عملائنا بأفضل الفرص السكنية والاستثمارية',
  },
};

const CACHE_FILE_PATH = path.join(process.cwd(), 'src/config/site-settings.json');

function readLocalSettingsCache(): Partial<SiteSettingsData> | null {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const content = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Could not read local settings cache:', err);
  }
  return null;
}

function writeLocalSettingsCache(data: SiteSettingsData): void {
  try {
    const dir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write local settings cache:', err);
  }
}

// Fetch site settings with multi-layer fallback
export async function getSiteSettings(): Promise<SiteSettingsData> {
  const localCache = readLocalSettingsCache();

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('id', 'general_settings')
        .maybeSingle();

      if (!error && data?.value) {
        const merged: SiteSettingsData = {
          social: { ...DEFAULT_SETTINGS.social, ...(data.value.social || {}) },
          contact: { ...DEFAULT_SETTINGS.contact, ...(data.value.contact || {}) },
          hero: { ...DEFAULT_SETTINGS.hero, ...(data.value.hero || {}) },
          stats: { ...DEFAULT_SETTINGS.stats, ...(data.value.stats || {}) },
          seo: { ...DEFAULT_SETTINGS.seo, ...(data.value.seo || {}) },
        };
        // Keep local cache synced
        writeLocalSettingsCache(merged);
        return merged;
      }
    }
  } catch (err) {
    console.warn('Supabase site_settings query failed, falling back to cache/defaults:', err);
  }

  if (localCache) {
    return {
      social: { ...DEFAULT_SETTINGS.social, ...(localCache.social || {}) },
      contact: { ...DEFAULT_SETTINGS.contact, ...(localCache.contact || {}) },
      hero: { ...DEFAULT_SETTINGS.hero, ...(localCache.hero || {}) },
      stats: { ...DEFAULT_SETTINGS.stats, ...(localCache.stats || {}) },
      seo: { ...DEFAULT_SETTINGS.seo, ...(localCache.seo || {}) },
    };
  }

  return DEFAULT_SETTINGS;
}

// Save site settings to Supabase and local cache
export async function saveSiteSettings(payload: Partial<SiteSettingsData>): Promise<{ success: boolean; error?: string }> {
  try {
    const current = await getSiteSettings();
    const updated: SiteSettingsData = {
      social: { ...current.social, ...(payload.social || {}) },
      contact: { ...current.contact, ...(payload.contact || {}) },
      hero: { ...current.hero, ...(payload.hero || {}) },
      stats: { ...current.stats, ...(payload.stats || {}) },
      seo: { ...current.seo, ...(payload.seo || {}) },
    };

    // 1. Write to local cache first for instant resilience
    writeLocalSettingsCache(updated);

    // 2. Persist to Supabase site_settings
    try {
      const supabase = (await getSupabaseServerClient()) as any;
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 'general_settings',
          value: updated,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.warn('Supabase upsert warning for site_settings:', error.message);
      }
    } catch (dbErr: any) {
      console.warn('Supabase not reachable for site_settings, local cache saved:', dbErr.message);
    }

    // 3. Invalidate caches for all public pages
    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/contact');
    revalidatePath('/properties');
    revalidatePath('/projects');
    revalidatePath('/mar-cp/settings');

    return { success: true };
  } catch (err: any) {
    console.error('Failed to save site settings:', err);
    return { success: false, error: err.message || 'فشل حفظ الإعدادات' };
  }
}
