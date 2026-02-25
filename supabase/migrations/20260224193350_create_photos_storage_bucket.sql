-- Create storage bucket for photos
-- Note: This SQL needs to be run in the Supabase SQL editor or via the CLI
-- as storage buckets cannot be created via regular SQL migrations

-- First, enable the storage schema if not already enabled
CREATE SCHEMA IF NOT EXISTS storage;

-- Create the storage bucket for photos
-- This is a placeholder - actual bucket creation needs to be done via:
-- 1. Supabase Dashboard -> Storage -> Create New Bucket
-- 2. Or via the storage API

-- Create a policy to allow authenticated users to upload photos
-- Note: This assumes the bucket 'photos' already exists

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to insert objects
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'photos');

-- Create policy for authenticated users to select objects
CREATE POLICY "Authenticated users can view photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'photos');

-- Create policy for authenticated users to update objects
CREATE POLICY "Authenticated users can update photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'photos');

-- Create policy for authenticated users to delete objects
CREATE POLICY "Authenticated users can delete photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'photos');

-- Create a function to check if a bucket exists
CREATE OR REPLACE FUNCTION storage.bucket_exists(bucket_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = bucket_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert the photos bucket if it doesn't exist
-- Note: This requires superuser privileges which may not be available
-- DO $$
-- BEGIN
--   IF NOT storage.bucket_exists('photos') THEN
--     INSERT INTO storage.buckets (id, name, public) 
--     VALUES ('photos', 'photos', true);
--   END IF;
-- END $$;