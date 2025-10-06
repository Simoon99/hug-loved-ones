-- Create videos table for tracking video generation
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt TEXT NOT NULL,
  image1_url TEXT NOT NULL,
  image2_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  video_id TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed for production)
CREATE POLICY "Allow all operations" ON videos
  FOR ALL USING (true);

-- Create an index on created_at for faster queries
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);

-- Create an index on status for filtering
CREATE INDEX idx_videos_status ON videos(status);

-- =============================================================================
-- STORAGE BUCKET SETUP
-- =============================================================================

-- Instructions:
-- 1. First, create the bucket via Supabase Dashboard:
--    - Go to Storage > Create bucket
--    - Name: hug-images
--    - Public bucket: NO (we'll use policies instead)
--    - Click "Create bucket"
--
-- 2. Then run the storage policies below in the SQL Editor

-- Allow anyone to upload to the hug-images bucket
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'hug-images');

-- Allow anyone to read from the hug-images bucket
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hug-images');

-- Allow anyone to update files in the hug-images bucket
CREATE POLICY "Allow public updates"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'hug-images');

-- Allow anyone to delete from the hug-images bucket (optional)
CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'hug-images');

