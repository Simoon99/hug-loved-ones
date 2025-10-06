-- Run this in Supabase SQL Editor to verify your setup
-- This will show you what's configured and what's missing

-- =====================================================
-- 1. Check if videos table exists and has correct columns
-- =====================================================
SELECT 
  'videos table' AS check_name,
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'videos')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING - Run database-table.sql'
  END AS status;

-- Show current videos table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'videos'
ORDER BY ordinal_position;

-- =====================================================
-- 2. Check RLS policies on videos table
-- =====================================================
SELECT 
  'videos table RLS policies' AS check_name,
  COUNT(*) AS policy_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ CONFIGURED'
    ELSE '❌ MISSING - Run database-table.sql'
  END AS status
FROM pg_policies 
WHERE tablename = 'videos';

-- Show all policies on videos table
SELECT 
  policyname, 
  cmd AS operation,
  qual AS using_expression
FROM pg_policies 
WHERE tablename = 'videos'
ORDER BY policyname;

-- =====================================================
-- 3. Check storage buckets
-- =====================================================
SELECT 
  'Storage buckets' AS check_name,
  name AS bucket_name,
  public AS is_public,
  CASE 
    WHEN name IN ('hug-images', 'hug-videos') THEN '✅ CONFIGURED'
    ELSE '⚠️ UNEXPECTED BUCKET'
  END AS status
FROM storage.buckets
WHERE name IN ('hug-images', 'hug-videos')
ORDER BY name;

-- Alert if buckets are missing
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM storage.buckets WHERE name = 'hug-images') = 0
    THEN '❌ MISSING: hug-images bucket - Create it in Storage UI'
    ELSE '✅ hug-images bucket exists'
  END AS hug_images_status,
  CASE 
    WHEN (SELECT COUNT(*) FROM storage.buckets WHERE name = 'hug-videos') = 0
    THEN '❌ MISSING: hug-videos bucket - Create it in Storage UI'
    ELSE '✅ hug-videos bucket exists'
  END AS hug_videos_status;

-- =====================================================
-- 4. Check storage policies for both buckets
-- =====================================================
SELECT 
  'Storage policies' AS check_name,
  policyname,
  cmd AS operation,
  CASE 
    WHEN policyname LIKE '%hug-images%' THEN 'hug-images bucket'
    WHEN policyname LIKE '%hug-videos%' THEN 'hug-videos bucket'
    ELSE 'other'
  END AS bucket
FROM pg_policies 
WHERE tablename = 'objects'
AND (policyname LIKE '%hug-images%' OR policyname LIKE '%hug-videos%')
ORDER BY bucket, cmd;

-- Count policies per bucket
SELECT 
  CASE 
    WHEN policyname LIKE '%hug-images%' THEN 'hug-images'
    WHEN policyname LIKE '%hug-videos%' THEN 'hug-videos'
  END AS bucket,
  COUNT(*) AS policy_count,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ COMPLETE (4 policies)'
    ELSE '⚠️ INCOMPLETE - Run fix-storage-permissions.sql'
  END AS status
FROM pg_policies 
WHERE tablename = 'objects'
AND (policyname LIKE '%hug-images%' OR policyname LIKE '%hug-videos%')
GROUP BY bucket
ORDER BY bucket;

-- =====================================================
-- 5. Check for any data
-- =====================================================
SELECT 
  'Videos in database' AS check_name,
  COUNT(*) AS video_count
FROM videos;

-- =====================================================
-- SUMMARY
-- =====================================================
SELECT '===========================================' AS summary;
SELECT 'SETUP VERIFICATION SUMMARY' AS summary;
SELECT '===========================================' AS summary;

-- What you need:
-- ✅ 1. videos table with 10 columns
-- ✅ 2. RLS policy on videos table
-- ✅ 3. hug-images bucket (public)
-- ✅ 4. hug-videos bucket (public)
-- ✅ 5. 4 storage policies for hug-images
-- ✅ 6. 4 storage policies for hug-videos

