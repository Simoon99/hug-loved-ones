-- Add column to store original OpenAI URL (optional, for backup)
ALTER TABLE videos ADD COLUMN IF NOT EXISTS openai_url TEXT;

-- Create storage bucket for videos if it doesn't exist
-- Run this in Supabase Dashboard > Storage
-- 1. Create a new bucket called "hug-videos"
-- 2. Make it PUBLIC (or add policies below)

-- Storage policies for hug-videos bucket
-- Run these AFTER creating the bucket

DROP POLICY IF EXISTS "Allow public uploads to hug-videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from hug-videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to hug-videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from hug-videos" ON storage.objects;

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

-- Verify
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%hug-videos%';

