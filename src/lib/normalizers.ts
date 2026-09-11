// src/lib/normalizers.ts
import { Property, Project } from './mockData';

export function normalizeProperty(prop: any): Property {
  if (!prop) return null as any;
  return {
    id: prop.id,
    slug: prop.slug,
    title: prop.title,
    type: prop.type,
    status: prop.status,
    project: prop.projects ? {
      id: prop.projects.id,
      name: prop.projects.name,
      slug: prop.projects.slug
    } : (prop.project ? {
      id: prop.project.id,
      name: prop.project.name,
      slug: prop.project.slug
    } : { id: '', name: 'عقار منفصل', slug: '' }),
    location: {
      city: prop.city || '',
      district: prop.district || '',
      coordinates: {
        lat: prop.lat || 0,
        lng: prop.lng || 0
      },
      address: prop.address || ''
    },
    specs: {
      area: prop.area || 0,
      bedrooms: prop.bedrooms || 0,
      bathrooms: prop.bathrooms || 0,
      livingRooms: prop.living_rooms || 0,
      kitchen: true,
      parking: prop.parking || 0,
      floor: prop.floor || undefined,
      totalFloors: prop.total_floors || undefined,
      view: prop.view || '',
      direction: prop.direction || undefined,
      features: prop.features || []
    },
    pricing: {
      price: prop.price || 0,
      pricePerMeter: prop.price_per_meter || 0,
      currency: 'SAR',
      isNegotiable: prop.is_negotiable || false,
      downPaymentPct: prop.down_payment_pct || undefined,
      monthlyInstallment: prop.monthly_installment || undefined
    },
    media: {
      images: prop.images || [],
      thumbnail: prop.thumbnail || '',
      videos: prop.videos || [],
      floorPlan: prop.floor_plan || undefined,
      virtualTour: prop.virtual_tour || undefined
    },
    description: prop.description || '',
    publishedAt: prop.published_at || '',
    featured: prop.featured || false
  };
}

export function normalizeProject(proj: any): Project {
  if (!proj) return null as any;
  return {
    id: proj.id,
    slug: proj.slug,
    name: proj.name,
    tagline: proj.tagline || '',
    status: proj.status,
    location: {
      city: proj.city || '',
      district: proj.district || '',
      address: proj.address || ''
    },
    description: proj.description || '',
    media: {
      hero: proj.hero_image || '',
      gallery: proj.gallery || [],
      videos: proj.videos || []
    },
    priceRange: {
      min: proj.price_min || 0,
      max: proj.price_max || 0,
      currency: 'SAR'
    },
    specs: {
      totalUnits: proj.total_units || 0,
      availableUnits: proj.available_units || 0,
      completionDate: proj.completion_date || ''
    },
    featured: proj.featured || false,
    brochureUrl: proj.brochure_url || ''
  };
}
