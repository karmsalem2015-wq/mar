// src/app/actions/properties.ts
'use server';

import { USE_DATABASE } from '../../config/brand';
import { getSupabaseServerClient } from '../../lib/supabase/server';
import { getSupabaseAdminClient } from '../../lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { PROPERTIES, PROJECTS } from '../../lib/mockData';
import { normalizeProperty, normalizeProject } from '../../lib/normalizers';
import { deleteCloudinaryVideo } from './cloudinary';

// Load projects list for dynamic dropdowns
export async function getProjectsList() {
  try {
    const supabase = (await getSupabaseServerClient()) as any;
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, slug, city, district, address')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (err: any) {
    console.error('Error fetching projects list:', err);
    return [];
  }
}

// Get single property detail by ID
export async function getPropertyById(id: string) {
  try {
    const supabase = (await getSupabaseServerClient()) as any;
    const { data, error } = await supabase
      .from('properties')
      .select('*, projects(id, name, slug)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.error(`Error fetching property ${id}:`, err);
    return null;
  }
}

// Generate URL slug from Arabic/English text
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\u0621-\u064A\u0660-\u0669a-zA-Z0-9\s-]/g, '') // Keep Arabic, alphanumeric, spaces, and dashes
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-'); // Remove duplicate dashes
}

// Quick create a new project
export async function quickCreateProject(name: string, city: string, district: string) {
  try {
    const supabase = (await getSupabaseServerClient()) as any;
    
    // Generate unique slug
    let baseSlug = generateSlug(name);
    if (!baseSlug) baseSlug = 'project';
    const uniqueId = Math.random().toString(36).substring(2, 7);
    const slug = `${baseSlug}-${uniqueId}`;

    const newProject = {
      slug,
      name,
      city,
      district,
      address: `${district}، ${city}`,
      description: `مشروع سكني جديد في حي ${district} بمدينة ${city}.`,
      status: 'upcoming',
      price_min: 0,
      price_max: 0,
      total_units: 0,
      available_units: 0,
      completion_date: 'قريباً',
      featured: false,
      published: true
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([newProject])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (err: any) {
    console.error('Error quick creating project:', err);
    return { success: false, error: err.message || 'فشل إضافة المشروع السريع' };
  }
}

// Create new property
export async function createProperty(formData: any) {
  try {
    const supabase = (await getSupabaseServerClient()) as any;
    
    // Generate unique slug
    let baseSlug = generateSlug(formData.title);
    if (!baseSlug) baseSlug = 'property';
    const uniqueId = Math.random().toString(36).substring(2, 7);
    const slug = `${baseSlug}-${uniqueId}`;

    const insertData = {
      slug,
      title: formData.title,
      type: formData.type,
      status: formData.status,
      project_id: formData.projectId || null,
      city: formData.city,
      district: formData.district,
      address: formData.address || '',
      lat: formData.lat || null,
      lng: formData.lng || null,
      area: parseInt(formData.area) || 0,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      living_rooms: parseInt(formData.livingRooms) || 0,
      parking: parseInt(formData.parking) || 0,
      floor: formData.floor !== undefined && formData.floor !== '' ? parseInt(formData.floor) : null,
      total_floors: formData.totalFloors !== undefined && formData.totalFloors !== '' ? parseInt(formData.totalFloors) : null,
      view: formData.view || '',
      direction: formData.direction || '',
      features: formData.features || [],
      price: parseInt(formData.price) || 0,
      price_per_meter: parseInt(formData.pricePerMeter) || 0,
      is_negotiable: formData.isNegotiable || false,
      down_payment_pct: formData.downPaymentPct !== undefined && formData.downPaymentPct !== '' ? parseInt(formData.downPaymentPct) : null,
      monthly_installment: formData.monthlyInstallment !== undefined && formData.monthlyInstallment !== '' ? parseInt(formData.monthlyInstallment) : null,
      description: formData.description || '',
      thumbnail: formData.thumbnail || '',
      images: formData.images || [],
      videos: formData.videos || [],
      floor_plan: formData.floorPlan || null,
      virtual_tour: formData.virtualTour || null,
      featured: formData.featured || false,
      published: formData.published || false,
      published_at: formData.published ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from('properties')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    
    revalidatePath('/mar-cp/properties');
    return { success: true, data };
  } catch (err: any) {
    console.error('Error creating property:', err);
    return { success: false, error: err.message || 'فشل إضافة العقار الجديد' };
  }
}

// Update existing property
export async function updateProperty(id: string, formData: any) {
  try {
    const supabase = (await getSupabaseServerClient()) as any;

    const updateData = {
      title: formData.title,
      type: formData.type,
      status: formData.status,
      project_id: formData.projectId || null,
      city: formData.city,
      district: formData.district,
      address: formData.address || '',
      lat: formData.lat || null,
      lng: formData.lng || null,
      area: parseInt(formData.area) || 0,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      living_rooms: parseInt(formData.livingRooms) || 0,
      parking: parseInt(formData.parking) || 0,
      floor: formData.floor !== undefined && formData.floor !== '' ? parseInt(formData.floor) : null,
      total_floors: formData.totalFloors !== undefined && formData.totalFloors !== '' ? parseInt(formData.totalFloors) : null,
      view: formData.view || '',
      direction: formData.direction || '',
      features: formData.features || [],
      price: parseInt(formData.price) || 0,
      price_per_meter: parseInt(formData.pricePerMeter) || 0,
      is_negotiable: formData.isNegotiable || false,
      down_payment_pct: formData.downPaymentPct !== undefined && formData.downPaymentPct !== '' ? parseInt(formData.downPaymentPct) : null,
      monthly_installment: formData.monthlyInstallment !== undefined && formData.monthlyInstallment !== '' ? parseInt(formData.monthlyInstallment) : null,
      description: formData.description || '',
      thumbnail: formData.thumbnail || '',
      images: formData.images || [],
      videos: formData.videos || [],
      floor_plan: formData.floorPlan || null,
      virtual_tour: formData.virtualTour || null,
      featured: formData.featured || false,
      published: formData.published || false,
      published_at: formData.published ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/mar-cp/properties');
    return { success: true, data };
  } catch (err: any) {
    console.error(`Error updating property ${id}:`, err);
    return { success: false, error: err.message || 'فشل تحديث بيانات العقار' };
  }
}

// Delete property
export async function deleteProperty(id: string) {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      // Mock/static item not in Supabase, treat as removed
      revalidatePath('/mar-cp/properties');
      revalidatePath('/properties');
      revalidatePath('/');
      return { success: true };
    }

    const supabase = (await getSupabaseServerClient()) as any;

    // 1. Fetch property details to retrieve asset paths before deleting
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('thumbnail, images, videos, floor_plan')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // 2. Delete database record
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // 3. Clean up associated media files in background/sequence
    if (property) {
      const getStoragePathFromUrl = (url: string) => {
        if (!url) return null;
        const match = url.match(/\/storage\/v1\/object\/public\/media\/(.+)$/);
        if (match && match[1]) {
          return decodeURIComponent(match[1]);
        }
        if (!url.startsWith('http') && url.includes('properties/')) {
          return url;
        }
        return null;
      };

      const getCloudinaryPublicId = (url: string) => {
        if (!url || !url.includes('cloudinary.com')) return null;
        try {
          const parts = url.split('/upload/');
          if (parts.length < 2) return null;
          
          // Split segments after /upload/
          const segments = parts[1].split('/');
          
          // Filter out transformations and version identifier
          const filteredSegments = segments.filter(seg => {
            // 1. Version matches v followed by digits, e.g., v1584348
            if (/^v\d+$/.test(seg)) return false;
            // 2. Transformation segments usually contain comma (,), colon (:), or equal (=), or are named transformations
            if (seg.includes(',') || seg.includes(':') || seg.includes('=')) return false;
            // 3. Common cloudinary defaults/transforms that don't have commas but shouldn't be in public ID
            if (['br_', 'c_', 'd_', 'e_', 'fl_', 'h_', 'l_', 'o_', 'p_', 'q_', 'r_', 't_', 'w_', 'x_', 'y_', 'z_'].some(prefix => seg.startsWith(prefix))) return false;
            return true;
          });

          const fullPath = filteredSegments.join('/');
          const dotIndex = fullPath.lastIndexOf('.');
          if (dotIndex !== -1) {
            return fullPath.substring(0, dotIndex);
          }
          return fullPath;
        } catch (err) {
          console.error('Failed to parse Cloudinary publicId:', err);
          return null;
        }
      };

      const storagePaths: string[] = [];
      if (property.thumbnail) {
        const path = getStoragePathFromUrl(property.thumbnail);
        if (path) storagePaths.push(path);
      }
      if (property.floor_plan) {
        const path = getStoragePathFromUrl(property.floor_plan);
        if (path) storagePaths.push(path);
      }
      if (Array.isArray(property.images)) {
        property.images.forEach((img: string) => {
          const path = getStoragePathFromUrl(img);
          if (path) storagePaths.push(path);
        });
      }

      // Delete from Supabase Storage media bucket
      if (storagePaths.length > 0) {
        const { error: deleteStorageError } = await supabase.storage
          .from('media')
          .remove(storagePaths);
        if (deleteStorageError) {
          console.error('Failed to delete Supabase storage files:', deleteStorageError.message);
        }
      }

      // Delete from Cloudinary
      if (Array.isArray(property.videos)) {
        for (const videoUrl of property.videos) {
          const publicId = getCloudinaryPublicId(videoUrl);
          console.log(`Parsed Cloudinary video publicId: ${publicId} from URL: ${videoUrl}`);
          if (publicId) {
            try {
              const res = await deleteCloudinaryVideo(publicId);
              console.log(`Cloudinary video delete result for ${publicId}:`, res);
            } catch (err) {
              console.error('Error deleting Cloudinary video:', err);
            }
          }
        }
      }
    }

    revalidatePath('/mar-cp/properties');
    return { success: true };
  } catch (err: any) {
    console.error(`Error deleting property ${id}:`, err);
    return { success: false, error: err.message || 'فشل حذف العقار' };
  }
}

// Fetch all properties for admin dashboard and website lists
export async function getPropertiesListAdmin() {
  if (!USE_DATABASE) {
    return PROPERTIES;
  }
  try {
    const supabase = (await getSupabaseServerClient()) as any;
    const { data, error } = await supabase
      .from('properties')
      .select('*, projects(id, name, slug)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err: any) {
    console.error('Database error in getPropertiesListAdmin:', err?.message || err);
    return [];
  }
}

// Fetch all projects for admin dashboard and website lists
export async function getProjectsListAdmin() {
  if (!USE_DATABASE) {
    return PROJECTS;
  }
  try {
    const supabase = (await getSupabaseServerClient()) as any;
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err: any) {
    console.error('Database error in getProjectsListAdmin:', err?.message || err);
    return [];
  }
}

// Helper to generate a valid UUID from mock IDs consistently
function getUuidFromMockId(id: string): string {
  // If it's already a valid UUID, return it
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return id;
  }
  
  // Map standard mock project/property IDs to static valid UUIDs
  const mockIdMap: Record<string, string> = {
    // Projects
    'proj-1': '11111111-1111-4111-a111-111111111111',
    'proj-2': '22222222-2222-4222-a222-222222222222',
    'proj-3': '33333333-3333-4333-a333-333333333333',
    'proj-4': '44444444-4444-4444-a444-444444444444',
    'proj-5': '55555555-5555-4555-a555-555555555555',
    
    // Properties
    'prop-1': 'a1111111-1111-4111-b111-111111111111',
    'prop-2': 'a2222222-2222-4222-b222-222222222222',
    'prop-3': 'a3333333-3333-4333-b333-333333333333',
    'prop-4': 'a4444444-4444-4444-b444-444444444444',
    'prop-5': 'a5555555-5555-4555-b555-555555555555',
    'prop-6': 'a6666666-6666-4666-b666-666666666666',
    'prop-7': 'a7777777-7777-4777-b777-777777777777',
    'prop-8': 'a8888888-8888-4888-b888-888888888888',
    'prop-9': 'a9999999-9999-4999-b999-999999999999',
    'prop-10': 'b1111111-1111-4111-c111-111111111111',
    'prop-11': 'b2222222-2222-4222-c222-222222222222',
    'prop-12': 'b3333333-3333-4333-c333-333333333333',
    'prop-13': 'b4444444-4444-4444-c444-444444444444',
    'prop-14': 'b5555555-5555-4555-c555-555555555555',
    'prop-15': 'b6666666-6666-4666-c666-666666666666',
    'prop-16': 'b7777777-7777-4777-c777-777777777777',
  };

  if (mockIdMap[id]) {
    return mockIdMap[id];
  }

  const digits = id.replace(/[^0-9]/g, '');
  if (digits) {
    const pad = digits.padStart(12, '0');
    return `00000000-0000-4000-8000-${pad}`;
  }

  // Fallback deterministic pseudo-UUID based on string char codes
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(12, '0');
  return `00000000-0000-4000-8000-${hex}`;
}

// Seed Database with mock data from lib/mockData.ts
export async function seedDatabase() {
  try {
    const supabase = getSupabaseAdminClient() as any;

    // Delete existing records to avoid unique constraint violations
    await supabase.from('properties').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 1. Seed Projects
    const projectInsertData = PROJECTS.map((proj) => ({
      id: getUuidFromMockId(proj.id),
      slug: proj.slug,
      name: proj.name,
      tagline: proj.tagline || '',
      status: proj.status,
      city: proj.location.city,
      district: proj.location.district,
      address: proj.location.address || '',
      description: proj.description || '',
      hero_image: proj.media.hero || '',
      gallery: proj.media.gallery || [],
      videos: proj.media.videos || [],
      price_min: proj.priceRange.min,
      price_max: proj.priceRange.max,
      total_units: proj.specs.totalUnits,
      available_units: proj.specs.availableUnits,
      completion_date: proj.specs.completionDate,
      featured: proj.featured || false,
      published: true,
    }));

    const { error: projError } = await supabase.from('projects').insert(projectInsertData);
    if (projError) throw projError;

    // 2. Seed Properties
    const propertyInsertData = PROPERTIES.map((prop) => ({
      id: getUuidFromMockId(prop.id),
      slug: prop.slug,
      title: prop.title,
      type: prop.type,
      status: prop.status,
      project_id: prop.project?.id && prop.project.id !== 'none' ? getUuidFromMockId(prop.project.id) : null,
      city: prop.location.city,
      district: prop.location.district,
      address: prop.location.address || '',
      lat: prop.location.coordinates?.lat || null,
      lng: prop.location.coordinates?.lng || null,
      area: Math.round(prop.specs.area),
      bedrooms: Math.round(prop.specs.bedrooms),
      bathrooms: Math.round(prop.specs.bathrooms),
      living_rooms: Math.round(prop.specs.livingRooms || 0),
      parking: Math.round(prop.specs.parking || 0),
      floor: prop.specs.floor !== undefined && prop.specs.floor !== null ? Math.round(prop.specs.floor) : null,
      total_floors: prop.specs.totalFloors !== undefined && prop.specs.totalFloors !== null ? Math.round(prop.specs.totalFloors) : null,
      view: prop.specs.view || '',
      direction: prop.specs.direction || '',
      features: prop.specs.features || [],
      price: Math.round(prop.pricing.price),
      price_per_meter: Math.round(prop.pricing.pricePerMeter),
      is_negotiable: prop.pricing.isNegotiable || false,
      down_payment_pct: prop.pricing.downPaymentPct !== undefined && prop.pricing.downPaymentPct !== null ? Math.round(prop.pricing.downPaymentPct) : null,
      monthly_installment: prop.pricing.monthlyInstallment !== undefined && prop.pricing.monthlyInstallment !== null ? Math.round(prop.pricing.monthlyInstallment) : null,
      description: prop.description || '',
      thumbnail: prop.media.thumbnail,
      images: prop.media.images || [],
      videos: prop.media.videos || [],
      floor_plan: prop.media.floorPlan || null,
      virtual_tour: prop.media.virtualTour || null,
      featured: prop.featured || false,
      published: true,
      published_at: new Date().toISOString(),
    }));

    const { error: propError } = await supabase.from('properties').insert(propertyInsertData);
    if (propError) throw propError;

    revalidatePath('/mar-cp/properties');
    revalidatePath('/mar-cp/projects');
    revalidatePath('/');
    
    return { success: true };
  } catch (err: any) {
    console.error('Error seeding database:', err);
    return { success: false, error: err.message || 'فشل مزامنة البيانات' };
  }
}

// Delete project
export async function deleteProject(id: string) {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      // Mock/static item not in Supabase, treat as removed
      revalidatePath('/mar-cp/projects');
      revalidatePath('/projects');
      revalidatePath('/');
      return { success: true };
    }

    const supabase = (await getSupabaseServerClient()) as any;
    
    // 1. Fetch project details to retrieve asset paths before deleting
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('hero_image, gallery, videos')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // 2. Delete database record
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // 3. Clean up associated media files
    if (project) {
      const getStoragePathFromUrl = (url: string) => {
        if (!url) return null;
        const match = url.match(/\/storage\/v1\/object\/public\/media\/(.+)$/);
        if (match && match[1]) {
          return decodeURIComponent(match[1]);
        }
        return null;
      };

      const getCloudinaryPublicId = (url: string) => {
        if (!url || !url.includes('cloudinary.com')) return null;
        try {
          const parts = url.split('/upload/');
          if (parts.length < 2) return null;
          const segments = parts[1].split('/');
          const filteredSegments = segments.filter(seg => {
            if (/^v\d+$/.test(seg)) return false;
            if (seg.includes(',') || seg.includes(':') || seg.includes('=')) return false;
            if (['br_', 'c_', 'd_', 'e_', 'fl_', 'h_', 'l_', 'o_', 'p_', 'q_', 'r_', 't_', 'w_', 'x_', 'y_', 'z_'].some(prefix => seg.startsWith(prefix))) return false;
            return true;
          });
          const fullPath = filteredSegments.join('/');
          const dotIndex = fullPath.lastIndexOf('.');
          if (dotIndex !== -1) {
            return fullPath.substring(0, dotIndex);
          }
          return fullPath;
        } catch (err) {
          console.error('Failed to parse Cloudinary publicId:', err);
          return null;
        }
      };

      const storagePaths: string[] = [];
      if (project.hero_image) {
        const path = getStoragePathFromUrl(project.hero_image);
        if (path) storagePaths.push(path);
      }
      if (Array.isArray(project.gallery)) {
        project.gallery.forEach((img: string) => {
          const path = getStoragePathFromUrl(img);
          if (path) storagePaths.push(path);
        });
      }

      // Delete from Supabase Storage media bucket
      if (storagePaths.length > 0) {
        const { error: deleteStorageError } = await supabase.storage
          .from('media')
          .remove(storagePaths);
        if (deleteStorageError) {
          console.error('Failed to delete Supabase storage files:', deleteStorageError.message);
        }
      }

      // Delete from Cloudinary
      if (Array.isArray(project.videos)) {
        for (const videoUrl of project.videos) {
          const publicId = getCloudinaryPublicId(videoUrl);
          if (publicId) {
            try {
              const res = await deleteCloudinaryVideo(publicId);
              console.log(`Cloudinary video delete result for project:`, res);
            } catch (err) {
              console.error('Error deleting Cloudinary video:', err);
            }
          }
        }
      }
    }

    revalidatePath('/mar-cp/projects');
    return { success: true };
  } catch (err: any) {
    console.error(`Error deleting project ${id}:`, err);
    return { success: false, error: err.message || 'فشل حذف المشروع' };
  }
}

// Fetch single property details by slug
export async function getPropertyBySlug(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  if (!USE_DATABASE) {
    return PROPERTIES.find((p) => p.slug === decodedSlug) || null;
  }
  try {
    const supabase = getSupabaseAdminClient() as any;
    const { data, error } = await supabase
      .from('properties')
      .select('*, projects(id, name, slug)')
      .eq('slug', decodedSlug)
      .maybeSingle();

    if (error) throw error;
    if (data) return normalizeProperty(data);
    return null;
  } catch (err: any) {
    console.warn(`Database query for property ${slug}:`, err?.message || err);
    return null;
  }
}

// Fetch single project details by slug
export async function getProjectBySlug(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  if (!USE_DATABASE) {
    return PROJECTS.find((p) => p.slug === decodedSlug) || null;
  }
  try {
    const supabase = getSupabaseAdminClient() as any;
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', decodedSlug)
      .maybeSingle();

    if (error) throw error;
    if (data) return normalizeProject(data);
    return null;
  } catch (err: any) {
    console.warn(`Database query for project ${slug}:`, err?.message || err);
    return null;
  }
}

// Fetch properties belonging to a specific project by project slug
export async function getPropertiesByProjectSlug(projectSlug: string) {
  const decodedSlug = decodeURIComponent(projectSlug);
  if (!USE_DATABASE) {
    return PROPERTIES.filter((p) => p.project.slug === decodedSlug);
  }
  try {
    const supabase = getSupabaseAdminClient() as any;
    const { data, error } = await supabase
      .from('properties')
      .select('*, projects!inner(id, name, slug)')
      .eq('projects.slug', decodedSlug);

    if (error) throw error;
    if (data && data.length > 0) return data.map(normalizeProperty);
    return [];
  } catch (err: any) {
    console.warn(`Database query for project properties ${projectSlug}:`, err?.message || err);
    return [];
  }
}

// Fetch single project details by ID
export async function getProjectById(id: string) {
  try {
    const supabase = (await getSupabaseServerClient()) as any;
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.error(`Error fetching project ${id}:`, err);
    return null;
  }
}

// Create new project with optional bulk unit insertion
export async function createProject(formData: any, propertiesToInsert?: any[]) {
  try {
    const supabase = (await getSupabaseServerClient()) as any;
    
    // Generate unique slug
    let baseSlug = generateSlug(formData.name);
    if (!baseSlug) baseSlug = 'project';
    const uniqueId = Math.random().toString(36).substring(2, 7);
    const slug = `${baseSlug}-${uniqueId}`;

    const insertData = {
      slug,
      name: formData.name,
      tagline: formData.tagline || '',
      status: formData.status || 'upcoming',
      city: formData.city,
      district: formData.district,
      address: formData.address || '',
      description: formData.description || '',
      hero_image: formData.heroImage || '',
      gallery: formData.gallery || [],
      videos: formData.videos || [],
      price_min: parseInt(formData.priceMin) || 0,
      price_max: parseInt(formData.priceMax) || 0,
      total_units: parseInt(formData.totalUnits) || 0,
      available_units: parseInt(formData.availableUnits) || 0,
      completion_date: formData.completionDate || '',
      featured: formData.featured || false,
      published: formData.published || false,
      brochure_url: formData.brochureUrl || '',
    };

    const { data: project, error } = await supabase
      .from('projects')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;

    // Bulk insert properties if provided
    if (propertiesToInsert && propertiesToInsert.length > 0) {
      const formattedProps = propertiesToInsert.map((prop: any) => {
        let propBaseSlug = generateSlug(prop.title || 'unit');
        const propUniqueId = Math.random().toString(36).substring(2, 7);
        const propSlug = `${propBaseSlug}-${propUniqueId}`;
        
        return {
          slug: propSlug,
          title: prop.title,
          type: prop.type || 'apartment',
          status: prop.status || 'available',
          project_id: project.id,
          city: formData.city,
          district: formData.district,
          address: `${formData.district}، ${formData.city}`,
          area: parseInt(prop.area) || 0,
          bedrooms: parseInt(prop.bedrooms) || 0,
          bathrooms: parseInt(prop.bathrooms) || 0,
          living_rooms: parseInt(prop.livingRooms) || 0,
          parking: parseInt(prop.parking) || 0,
          floor: prop.floor !== undefined && prop.floor !== '' && prop.floor !== null ? parseInt(prop.floor) : null,
          total_floors: prop.totalFloors !== undefined && prop.totalFloors !== '' && prop.totalFloors !== null ? parseInt(prop.totalFloors) : null,
          view: prop.view || '',
          direction: prop.direction || 'north',
          features: prop.features || [],
          price: parseInt(prop.price) || 0,
          price_per_meter: parseInt(prop.pricePerMeter) || 0,
          is_negotiable: prop.isNegotiable || false,
          description: prop.description || '',
          thumbnail: prop.thumbnail || '',
          images: prop.images || [],
          videos: prop.videos || [],
          published: formData.published || false,
          published_at: formData.published ? new Date().toISOString() : null,
        };
      });

      const { error: propError } = await supabase
        .from('properties')
        .insert(formattedProps);
      
      if (propError) throw propError;
    }

    revalidatePath('/mar-cp/projects');
    revalidatePath('/mar-cp/properties');
    revalidatePath('/projects');
    revalidatePath('/');

    return { success: true, data: project };
  } catch (err: any) {
    console.error('Error creating project:', err);
    return { success: false, error: err.message || 'فشل إضافة المشروع' };
  }
}

// Update existing project with optional bulk unit insertion
export async function updateProject(id: string, formData: any, propertiesToInsert?: any[]) {
  try {
    const supabase = (await getSupabaseServerClient()) as any;

    const updateData = {
      name: formData.name,
      tagline: formData.tagline || '',
      status: formData.status || 'upcoming',
      city: formData.city,
      district: formData.district,
      address: formData.address || '',
      description: formData.description || '',
      hero_image: formData.heroImage || '',
      gallery: formData.gallery || [],
      videos: formData.videos || [],
      price_min: parseInt(formData.priceMin) || 0,
      price_max: parseInt(formData.priceMax) || 0,
      total_units: parseInt(formData.totalUnits) || 0,
      available_units: parseInt(formData.availableUnits) || 0,
      completion_date: formData.completionDate || '',
      featured: formData.featured || false,
      published: formData.published || false,
      brochure_url: formData.brochureUrl || '',
    };

    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Bulk insert properties if provided
    if (propertiesToInsert && propertiesToInsert.length > 0) {
      const formattedProps = propertiesToInsert.map((prop: any) => {
        let propBaseSlug = generateSlug(prop.title || 'unit');
        const propUniqueId = Math.random().toString(36).substring(2, 7);
        const propSlug = `${propBaseSlug}-${propUniqueId}`;
        
        return {
          slug: propSlug,
          title: prop.title,
          type: prop.type || 'apartment',
          status: prop.status || 'available',
          project_id: id,
          city: formData.city,
          district: formData.district,
          address: `${formData.district}، ${formData.city}`,
          area: parseInt(prop.area) || 0,
          bedrooms: parseInt(prop.bedrooms) || 0,
          bathrooms: parseInt(prop.bathrooms) || 0,
          living_rooms: parseInt(prop.livingRooms) || 0,
          parking: parseInt(prop.parking) || 0,
          floor: prop.floor !== undefined && prop.floor !== '' && prop.floor !== null ? parseInt(prop.floor) : null,
          total_floors: prop.totalFloors !== undefined && prop.totalFloors !== '' && prop.totalFloors !== null ? parseInt(prop.totalFloors) : null,
          view: prop.view || '',
          direction: prop.direction || 'north',
          features: prop.features || [],
          price: parseInt(prop.price) || 0,
          price_per_meter: parseInt(prop.pricePerMeter) || 0,
          is_negotiable: prop.isNegotiable || false,
          description: prop.description || '',
          thumbnail: prop.thumbnail || '',
          images: prop.images || [],
          videos: prop.videos || [],
          published: formData.published || false,
          published_at: formData.published ? new Date().toISOString() : null,
        };
      });

      const { error: propError } = await supabase
        .from('properties')
        .insert(formattedProps);
      
      if (propError) throw propError;
    }

    revalidatePath('/mar-cp/projects');
    revalidatePath('/mar-cp/properties');
    if (project) {
      revalidatePath(`/projects/${project.slug}`);
    }
    revalidatePath('/projects');
    revalidatePath('/');

    return { success: true, data: project };
  } catch (err: any) {
    console.error(`Error updating project ${id}:`, err);
    return { success: false, error: err.message || 'فشل تحديث المشروع' };
  }
}

/**
 * Server action to fetch public Google Sheets CSV data without CORS or CSP restrictions
 */
export async function fetchGoogleSheetCsvData(googleSheetsUrl: string): Promise<{
  success: boolean;
  csvData?: string;
  error?: string;
}> {
  try {
    if (!googleSheetsUrl || typeof googleSheetsUrl !== 'string') {
      return { success: false, error: 'الرجاء إدخال رابط جدول بيانات جوجل أولاً' };
    }

    const trimmedUrl = googleSheetsUrl.trim();
    const match = trimmedUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match || !match[1]) {
      return {
        success: false,
        error: 'رابط غير صالح. يرجى إدخال رابط صالح لجدول بيانات جوجل ومشاركته كـ "عام (Public)".',
      };
    }

    const spreadsheetId = match[1];
    const gidMatch = trimmedUrl.match(/[#&?]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';

    const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv${gidParam}`;

    const res = await fetch(exportUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/csv,text/plain,*/*',
      },
      redirect: 'follow',
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) {
        return { success: false, error: 'لم يتم العثور على هذا الجدول في جوجل. تأكد من صحة الرابط.' };
      }
      return {
        success: false,
        error: 'فشل جلب الملف. يرجى التأكد من أن الرابط متاح للجميع (Anyone with the link can view).',
      };
    }

    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    // If Google redirected to a login page or returned HTML error
    if (contentType.includes('text/html') || text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      return {
        success: false,
        error: 'جدول جوجل هذا خاص أو مقفل. يرجى الضغط على زر "مشاركة (Share)" في Google Sheets، واختيار "أي شخص لديه الرابط يمكنه العرض (Anyone with the link can view)".',
      };
    }

    return {
      success: true,
      csvData: text,
    };
  } catch (err: any) {
    console.error('Error fetching Google Sheets CSV:', err);
    return {
      success: false,
      error: err.message || 'حدث خطأ غير متوقع أثناء الاتصال بجداول جوجل.',
    };
  }
}

