-- Apply only after reviewing current policies AND assigning a protected
-- app_metadata.mar_role='super_admin' to a verified MAR administrator.
-- This file is a staged migration. Git commits do NOT run it automatically.
BEGIN;

CREATE OR REPLACE FUNCTION public.mar_has_permission(permission_name text)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public, pg_temp
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN false
    WHEN (auth.jwt()->'app_metadata'->>'mar_role') = 'super_admin' THEN true
    WHEN permission_name = 'users' THEN false
    WHEN COALESCE(auth.jwt()->'app_metadata'->>'mar_role', '') NOT IN ('admin','editor') THEN false
    WHEN (auth.jwt()->'app_metadata'->>'mar_role') = 'editor'
      AND permission_name IN ('settings','submissions') THEN false
    ELSE COALESCE(
      (auth.jwt()->'app_metadata'->'mar_permissions'->>permission_name)::boolean, true
    )
  END;
$$;
REVOKE ALL ON FUNCTION public.mar_has_permission(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mar_has_permission(text) TO authenticated;

DROP POLICY IF EXISTS "Authenticated users full access projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users full access properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users full access submissions" ON public.submissions;
DROP POLICY IF EXISTS "Authenticated users full access site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated users full access analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated users full access property images" ON public.property_images;

CREATE POLICY "MAR admins manage projects" ON public.projects
  FOR ALL TO authenticated USING (public.mar_has_permission('projects'))
  WITH CHECK (public.mar_has_permission('projects'));
CREATE POLICY "MAR admins manage properties" ON public.properties
  FOR ALL TO authenticated USING (public.mar_has_permission('properties'))
  WITH CHECK (public.mar_has_permission('properties'));
CREATE POLICY "MAR admins manage submissions" ON public.submissions
  FOR ALL TO authenticated USING (public.mar_has_permission('submissions'))
  WITH CHECK (public.mar_has_permission('submissions'));
CREATE POLICY "MAR admins manage settings" ON public.site_settings
  FOR ALL TO authenticated USING (public.mar_has_permission('settings'))
  WITH CHECK (public.mar_has_permission('settings'));
CREATE POLICY "MAR admins read analytics" ON public.analytics_events
  FOR SELECT TO authenticated USING (public.mar_has_permission('settings'));
CREATE POLICY "MAR admins manage property images" ON public.property_images
  FOR ALL TO authenticated USING (public.mar_has_permission('properties'))
  WITH CHECK (public.mar_has_permission('properties'));

DROP POLICY IF EXISTS "Media bucket public/auth insert" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket auth update" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket auth delete" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket authenticated delete" ON storage.objects;
CREATE POLICY "MAR media upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK
  (bucket_id = 'media' AND public.mar_has_permission('media'));
CREATE POLICY "MAR media update" ON storage.objects
  FOR UPDATE TO authenticated USING
  (bucket_id = 'media' AND public.mar_has_permission('media'))
  WITH CHECK (bucket_id = 'media' AND public.mar_has_permission('media'));
CREATE POLICY "MAR media delete" ON storage.objects
  FOR DELETE TO authenticated USING
  (bucket_id = 'media' AND public.mar_has_permission('media'));

COMMIT;
