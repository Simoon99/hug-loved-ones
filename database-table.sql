-- Video tracking table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt TEXT NOT NULL,
  image1_url TEXT NOT NULL,
  image2_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  video_id TEXT,
  video_url TEXT,
  openai_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations" ON videos;
CREATE POLICY "Allow all operations" ON videos
  FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);

