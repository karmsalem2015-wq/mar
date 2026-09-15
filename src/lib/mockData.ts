// src/lib/mockData.ts
import mockJson from '@/data/mockData.json';

export interface Property {
  id: string;
  slug: string;
  title: string;
  type: 'apartment' | 'villa' | 'annex' | 'penthouse' | 'duplex';
  status: 'available' | 'reserved' | 'sold' | 'coming_soon';
  project: { id: string; name: string; slug: string };
  location: {
    city: string;
    district: string;
    coordinates: { lat: number; lng: number };
    address: string;
  };
  specs: {
    area: number;
    bedrooms: number;
    bathrooms: number;
    livingRooms?: number;
    kitchen: boolean;
    parking?: number;
    floor?: number;
    totalFloors?: number;
    view?: string;
    direction?: 'north' | 'south' | 'east' | 'west' | 'corner';
    features?: string[];
  };
  pricing: {
    price: number;
    pricePerMeter: number;
    currency: 'SAR';
    isNegotiable: boolean;
    downPaymentPct?: number;
    monthlyInstallment?: number;
  };
  media: {
    images: string[];
    thumbnail: string;
    videos?: string[];
    floorPlan?: string;
    virtualTour?: string;
  };
  description: string;
  advertisingLicenseNumber?: string;
  publishedAt: string;
  featured: boolean;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  status: 'under_construction' | 'completed' | 'upcoming';
  location: {
    city: string;
    district: string;
    address: string;
  };
  description: string;
  media: {
    hero: string;
    gallery: string[];
    videos?: string[];
  };
  priceRange: { min: number; max: number; currency: 'SAR' };
  specs: {
    totalUnits: number;
    availableUnits: number;
    completionDate: string;
  };
  featured: boolean;
  brochureUrl?: string;
}

export const PROJECTS: Project[] = mockJson.projects as Project[];
export const PROPERTIES: Property[] = mockJson.properties as Property[];
