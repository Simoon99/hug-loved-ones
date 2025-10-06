-- RUN THIS IN SUPABASE SQL EDITOR TO FIX STORAGE PERMISSIONS
-- This allows images and videos to be viewed after upload

-- Drop existing policies if any (comprehensive cleanup)
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to hug-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from hug-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to hug-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from hug-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to hug-videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from hug-videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to hug-videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from hug-videos" ON storage.objects;

-- =====================================================================
-- HUG-IMAGES BUCKET POLICIES (for uploaded person images)
-- =====================================================================

CREATE POLICY "Allow public uploads to hug-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'hug-images');

CREATE POLICY "Allow public reads from hug-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hug-images');

CREATE POLICY "Allow public updates to hug-images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'hug-images');

CREATE POLICY "Allow public deletes from hug-images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'hug-images');

-- =====================================================================
-- HUG-VIDEOS BUCKET POLICIES (for generated videos)
-- =====================================================================

CREATE POLICY "Allow public uploads to hug-videos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'hug-videos');

CREATE POLICY "Allow public reads from hug-videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hug-videos');

CREATE POLICY "Allow public updates to hug-videos"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'hug-videos');

CREATE POLICY "Allow public deletes from hug-videos"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'hug-videos');

-- Verify all policies were created
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND (policyname LIKE '%hug-images%' OR policyname LIKE '%hug-videos%')
ORDER BY policyname;
