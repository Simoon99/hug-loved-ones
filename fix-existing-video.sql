-- Fix the existing video that shows as "in_progress" but is actually completed
-- Run this in Supabase SQL Editor

-- Update the video to show as completed if it has a video_url
UPDATE videos 
SET status = 'completed',
    updated_at = NOW()
WHERE status = 'in_progress' 
  AND video_url IS NOT NULL 
  AND video_url != '';

-- Verify the update
SELECT 
  id,
  status,
  video_url,
  created_at,
  updated_at
FROM videos 
ORDER BY created_at DESC 
LIMIT 5;

