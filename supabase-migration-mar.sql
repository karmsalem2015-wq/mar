-- ==============================================================================
-- MAR Real Estate (شركة مار العقارية) - Schema Migration & Clean Start
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ==============================================================================

BEGIN;

-- =========================================================
-- 0. CLEANUP DEMO DATA (تفريغ البيانات التجريبية بالكامل)
-- =========================================================
TRUNCATE TABLE public.properties, public.projects CASCADE;

-- =========================================================
-- 1. FIX PROJECT STATUS & DEFAULTS
-- =========================================================
ALTER TABLE public.projects
DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE public.projects
ALTER COLUMN status SET DEFAULT 'unknown';

ALTER TABLE public.projects
ADD CONSTRAINT projects_status_check
CHECK (
  status IN (
    'unknown',
    'under_construction',
    'completed',
    'upcoming'
  )
);

-- =========================================================
-- 2. FIX PROPERTY STATUS & DEFAULTS
-- =========================================================
ALTER TABLE public.properties
DROP CONSTRAINT IF EXISTS properties_status_check;

ALTER TABLE public.properties
ALTER COLUMN status SET DEFAULT 'unknown';

ALTER TABLE public.properties
ADD CONSTRAINT properties_status_check
CHECK (
  status IN (
    'unknown',
    'available',
    'reserved',
    'sold',
    'coming_soon'
  )
);

-- =========================================================
-- 3. EXTEND PROPERTY TYPES
-- =========================================================
ALTER TABLE public.properties
DROP CONSTRAINT IF EXISTS properties_type_check;

ALTER TABLE public.properties
ADD CONSTRAINT properties_type_check
CHECK (
  type IN (
    'apartment',
    'villa',
    'annex',
    'penthouse',
    'duplex',
    'roof',
    'mixed'
  )
);

-- =========================================================
-- 4. ADD MAR SOURCE & SPECIFICATION FIELDS
-- =========================================================
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS source_row INT,
ADD COLUMN IF NOT EXISTS ad_barcode TEXT,
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS source_project_name TEXT,
ADD COLUMN IF NOT EXISTS source_category TEXT,
ADD COLUMN IF NOT EXISTS source_price_text TEXT,
ADD COLUMN IF NOT EXISTS source_area_text TEXT,
ADD COLUMN IF NOT EXISTS source_sale_status TEXT,
ADD COLUMN IF NOT EXISTS entrances INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS furnished BOOLEAN,
ADD COLUMN IF NOT EXISTS maid_room BOOLEAN,
ADD COLUMN IF NOT EXISTS driver_room_status TEXT DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS property_condition TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS private_parking BOOLEAN,
ADD COLUMN IF NOT EXISTS independent_tank BOOLEAN,
ADD COLUMN IF NOT EXISTS profile_url TEXT,
ADD COLUMN IF NOT EXISTS three_d_url TEXT,
ADD COLUMN IF NOT EXISTS map_url TEXT,
ADD COLUMN IF NOT EXISTS source_files_url TEXT,
ADD COLUMN IF NOT EXISTS source_drive_folder_id TEXT;

ALTER TABLE public.properties
DROP CONSTRAINT IF EXISTS properties_driver_room_status_check;

ALTER TABLE public.properties
ADD CONSTRAINT properties_driver_room_status_check
CHECK (
  driver_room_status IN (
    'unknown',
    'yes',
    'no',
    'shared'
  )
);

-- =========================================================
-- 5. PROPERTY IMAGES TABLE (جدول الصور المنفصل)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL
        REFERENCES public.properties(id)
        ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT DEFAULT '',
    original_drive_file_id TEXT,
    original_name TEXT DEFAULT '',
    original_mime_type TEXT DEFAULT '',
    original_size_bytes BIGINT,
    optimized_size_bytes BIGINT,
    file_hash TEXT,
    width INT,
    height INT,
    is_cover BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (property_id, storage_path)
);

-- يمنع تكرار نفس الصورة لنفس العقار
CREATE UNIQUE INDEX IF NOT EXISTS idx_property_images_property_hash
ON public.property_images(property_id, file_hash)
WHERE file_hash IS NOT NULL;

-- يضمن صورة غلاف واحدة فقط لكل عقار
CREATE UNIQUE INDEX IF NOT EXISTS idx_property_images_one_cover
ON public.property_images(property_id)
WHERE is_cover = true;

CREATE INDEX IF NOT EXISTS idx_property_images_property_sort
ON public.property_images(property_id, sort_order);

-- =========================================================
-- 6. RLS POLICIES FOR PROPERTY IMAGES
-- =========================================================
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read property images" ON public.property_images;
CREATE POLICY "Public can read property images"
ON public.property_images
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.properties p
    WHERE p.id = property_images.property_id
      AND p.published = true
  )
);

DROP POLICY IF EXISTS "Authenticated users full access property images" ON public.property_images;
CREATE POLICY "Authenticated users full access property images"
ON public.property_images
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access property images" ON public.property_images;
CREATE POLICY "Service role full access property images"
ON public.property_images
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =========================================================
-- 7. STORAGE POLICIES (أمان Storage وحماية الملفات)
-- =========================================================
DROP POLICY IF EXISTS "Media bucket public/auth insert" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket auth update" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket auth delete" ON storage.objects;

-- السماح لك كمشرف ولوحة التحكم برفع وتعديل الوسائط
CREATE POLICY "Media bucket authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Media bucket authenticated update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

CREATE POLICY "Media bucket authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');

-- =========================================================
-- 8. INDEXES FOR HIGH PERFORMANCE
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_properties_project ON public.properties(project_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city_district ON public.properties(city, district);
CREATE INDEX IF NOT EXISTS idx_properties_published ON public.properties(published);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_area ON public.properties(area);

-- =========================================================
-- 9. AUTOMATIC updated_at TRIGGERS
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS projects_set_updated_at ON public.projects;
CREATE TRIGGER projects_set_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS properties_set_updated_at ON public.properties;
CREATE TRIGGER properties_set_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

COMMIT;
