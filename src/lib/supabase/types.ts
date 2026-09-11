// src/lib/supabase/types.ts
// TypeScript types for the Supabase database schema

export type PropertyType = 'apartment' | 'villa' | 'annex' | 'penthouse' | 'duplex';
export type PropertyStatus = 'available' | 'reserved' | 'sold' | 'coming_soon';
export type ProjectStatus = 'under_construction' | 'completed' | 'upcoming';
export type SubmissionType = 'contact' | 'inquiry' | 'property_inquiry';
export type SubmissionStatus = 'new' | 'reviewed' | 'closed';

export interface DbProperty {
  id: string;
  slug: string;
  title: string;
  type: PropertyType;
  status: PropertyStatus;
  project_id: string | null;
  city: string;
  district: string;
  address: string;
  lat: number | null;
  lng: number | null;
  area: number;
  bedrooms: number;
  bathrooms: number;
  living_rooms: number | null;
  parking: number | null;
  floor: number | null;
  total_floors: number | null;
  view: string | null;
  direction: string | null;
  features: string[];
  price: number;
  price_per_meter: number;
  is_negotiable: boolean;
  down_payment_pct: number | null;
  monthly_installment: number | null;
  description: string;
  thumbnail: string;
  images: string[];
  videos: string[];
  floor_plan: string | null;
  virtual_tour: string | null;
  featured: boolean;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProject {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  status: ProjectStatus;
  city: string;
  district: string;
  address: string;
  description: string;
  hero_image: string;
  gallery: string[];
  videos: string[];
  price_min: number;
  price_max: number;
  total_units: number;
  available_units: number;
  completion_date: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbSubmission {
  id: string;
  type: SubmissionType;
  resident_type: string | null;
  name: string;
  phone: string;
  email: string | null;
  subject: string | null;
  message: string | null;
  property_id: string | null;
  project_id: string | null;
  status: SubmissionStatus;
  notes: string | null;
  created_at: string;
  read_at: string | null;
}

export interface DbSiteSetting {
  id: string;
  value: Record<string, unknown>;
  updated_at: string;
  updated_by: string | null;
}

export interface DbAnalyticsEvent {
  id: string;
  event_type: string;
  page_path: string | null;
  property_id: string | null;
  project_id: string | null;
  user_agent: string | null;
  referrer: string | null;
  ip_hash: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// Helper type for the Supabase Database interface
export interface Database {
  public: {
    Tables: {
      properties: {
        Row: DbProperty;
        Insert: Omit<DbProperty, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<DbProperty, 'id' | 'created_at'>>;
      };
      projects: {
        Row: DbProject;
        Insert: Omit<DbProject, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<DbProject, 'id' | 'created_at'>>;
      };
      submissions: {
        Row: DbSubmission;
        Insert: Omit<DbSubmission, 'id' | 'created_at' | 'read_at'> & { id?: string };
        Update: Partial<Omit<DbSubmission, 'id' | 'created_at'>>;
      };
      site_settings: {
        Row: DbSiteSetting;
        Insert: Omit<DbSiteSetting, 'updated_at'>;
        Update: Partial<Omit<DbSiteSetting, 'id'>>;
      };
      analytics_events: {
        Row: DbAnalyticsEvent;
        Insert: Omit<DbAnalyticsEvent, 'id' | 'created_at'> & { id?: string };
        Update: never;
      };
    };
  };
}
