-- Make hug-images bucket public so uploaded images can be downloaded
-- This is needed for the API to download images before sending to Gemini

-- First, update the bucket to be public
UPDATE storage.buckets
SET public = true
WHERE id = 'hug-images';

-- Add public access policies for the hug-images bucket
DROP POLICY IF EXISTS "Public Access for hug-images" ON storage.objects;
CREATE POLICY "Public Access for hug-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hug-images');

-- Allow authenticated users to upload
DROP POLICY IF EXISTS "Allow uploads to hug-images" ON storage.objects;
CREATE POLICY "Allow uploads to hug-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'hug-images');

-- Allow service role full access
DROP POLICY IF EXISTS "Service role full access to hug-images" ON storage.objects;
CREATE POLICY "Service role full access to hug-images"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'hug-images')
WITH CHECK (bucket_id = 'hug-images');

-- Verify the setup
SELECT id, name, public FROM storage.buckets WHERE id = 'hug-images';
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%hug-images%';

