-- SEPARATE VIDEO AND IMAGE FUNCTIONALITY
-- Run this in Supabase SQL Editor

-- =====================================================================
-- STEP 1: Create separate IMAGES table
-- =====================================================================

CREATE TABLE IF NOT EXISTS images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt TEXT NOT NULL,
  image1_url TEXT NOT NULL,
  image2_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  provider TEXT NOT NULL, -- 'openai' or 'gemini'
  image_url TEXT,
  generation_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on images table
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (matching videos table)
DROP POLICY IF EXISTS "Allow all operations on images" ON images;
CREATE POLICY "Allow all operations on images" ON images
  FOR ALL USING (true);

-- Create indexes for images
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_status ON images(status);
CREATE INDEX IF NOT EXISTS idx_images_provider ON images(provider);

-- =====================================================================
-- STEP 2: Clean up VIDEOS table (remove image-specific columns)
-- =====================================================================

-- Drop image-specific columns from videos table
ALTER TABLE videos DROP COLUMN IF EXISTS type;
ALTER TABLE videos DROP COLUMN IF EXISTS provider;
ALTER TABLE videos DROP COLUMN IF EXISTS image_url;

-- Drop the type index if it exists
DROP INDEX IF EXISTS idx_videos_type;

-- =====================================================================
-- STEP 3: Verify the changes
-- =====================================================================

-- Show images table structure
SELECT 
  'images' as table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'images'
ORDER BY ordinal_position;

-- Show videos table structure
SELECT 
  'videos' as table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'videos'
ORDER BY ordinal_position;

-- Show all policies
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE tablename IN ('images', 'videos')
ORDER BY tablename, policyname;

-- =====================================================================
-- MIGRATION NOTES:
-- =====================================================================
-- 
-- After running this:
-- - Images will be stored in the 'images' table
-- - Videos will be stored in the 'videos' table
-- - Both tables are completely independent
-- - Existing videos in the 'videos' table are preserved
-- - Any existing image data will need to be manually migrated if needed
-- 
-- =====================================================================

