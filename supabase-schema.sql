-- ==============================================================================
-- MAR Real Estate (شركة مار العقارية) - Supabase Database Schema
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Projects Table (المشاريع التطويرية)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'under_construction' CHECK (status IN ('under_construction', 'completed', 'upcoming')),
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    address TEXT DEFAULT '',
    description TEXT DEFAULT '',
    hero_image TEXT DEFAULT '',
    gallery TEXT[] DEFAULT '{}',
    videos TEXT[] DEFAULT '{}',
    price_min NUMERIC DEFAULT 0,
    price_max NUMERIC DEFAULT 0,
    total_units INT DEFAULT 0,
    available_units INT DEFAULT 0,
    completion_date TEXT DEFAULT '',
    featured BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Properties Table (الوحدات والعقارات)
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'apartment' CHECK (type IN ('apartment', 'villa', 'annex', 'penthouse', 'duplex')),
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'coming_soon')),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    address TEXT DEFAULT '',
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    area NUMERIC DEFAULT 0,
    bedrooms INT DEFAULT 0,
    bathrooms INT DEFAULT 0,
    living_rooms INT DEFAULT 0,
    parking INT DEFAULT 0,
    floor INT,
    total_floors INT,
    view TEXT DEFAULT '',
    direction TEXT DEFAULT '',
    features TEXT[] DEFAULT '{}',
    price NUMERIC DEFAULT 0,
    price_per_meter NUMERIC DEFAULT 0,
    is_negotiable BOOLEAN DEFAULT false,
    down_payment_pct NUMERIC,
    monthly_installment NUMERIC,
    description TEXT DEFAULT '',
    thumbnail TEXT DEFAULT '',
    images TEXT[] DEFAULT '{}',
    videos TEXT[] DEFAULT '{}',
    floor_plan TEXT,
    virtual_tour TEXT,
    featured BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT true,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Submissions Table (طلبات التواصل والمعاينة)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'contact' CHECK (type IN ('contact', 'inquiry', 'property_inquiry')),
    resident_type TEXT DEFAULT 'citizen',
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    subject TEXT DEFAULT '',
    message TEXT DEFAULT '',
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'closed')),
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    read_at TIMESTAMPTZ
);

-- 5. Site Settings Table (إعدادات الموقع العامة)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID
);

-- 6. Analytics Events Table (أحداث التحليلات والزيارات)
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    page_path TEXT,
    property_id UUID,
    project_id UUID,
    user_agent TEXT,
    referrer TEXT,
    ip_hash TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Setup Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow Public READ for Published Content
CREATE POLICY "Public can read published projects" ON public.projects FOR SELECT USING (published = true);
CREATE POLICY "Public can read published properties" ON public.properties FOR SELECT USING (published = true);
CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT USING (true);

-- Allow Public INSERT for Submissions & Analytics
CREATE POLICY "Public can insert submissions" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert analytics events" ON public.analytics_events FOR INSERT WITH CHECK (true);

-- Allow Service Role Full Access (Admin Backend)
CREATE POLICY "Service role has full access to projects" ON public.projects FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role has full access to properties" ON public.properties FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role has full access to submissions" ON public.submissions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role has full access to site_settings" ON public.site_settings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role has full access to analytics_events" ON public.analytics_events FOR ALL USING (auth.role() = 'service_role');

-- Allow Authenticated Users Full Access
CREATE POLICY "Authenticated users full access projects" ON public.projects FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users full access properties" ON public.properties FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users full access submissions" ON public.submissions FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users full access site_settings" ON public.site_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users full access analytics" ON public.analytics_events FOR ALL TO authenticated USING (true);

-- 8. Storage Bucket for Media (الصور والوسائط)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Public Access for Media Storage
CREATE POLICY "Media bucket public read" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Media bucket public/auth insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media');

CREATE POLICY "Media bucket auth update" ON storage.objects
FOR UPDATE USING (bucket_id = 'media');

CREATE POLICY "Media bucket auth delete" ON storage.objects
FOR DELETE USING (bucket_id = 'media');
