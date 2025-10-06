# Setup Checklist

Before using the app, complete these steps:

## ✅ 1. Install Dependencies
- [x] Run `npm install` (Already completed)

## ✅ 2. Environment Variables
- [x] `.env.local` file created with all necessary keys

## ⚠️ 3. Supabase Setup (IMPORTANT - Do this now!)

### A. Create Storage Buckets (CRITICAL!)
1. Go to: https://hujcbnrixdcxspmczbxi.supabase.co/project/hujcbnrixdcxspmczbxi/storage/buckets

2. **Create `hug-images` bucket** (for uploaded images):
   - Click "Create a new bucket"
   - Name: `hug-images`
   - **Public bucket**: Check YES (make it public) ✅
   - Click "Create bucket"

3. **Create `hug-videos` bucket** (for generated videos):
   - Click "Create a new bucket"
   - Name: `hug-videos`
   - **Public bucket**: Check YES (make it public) ✅
   - Click "Create bucket"

4. If buckets already exist but content isn't displaying:
   - Click on each bucket
   - Click "Settings" or "Configuration"
   - Make sure "Public bucket" is enabled

### A.1. Add Storage Policies
After creating the bucket, go to the SQL Editor and run these storage policies:

```sql
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

-- Allow anyone to delete from the hug-images bucket
CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'hug-images');
```

### B. Create/Update Database Table
1. Go to: https://hujcbnrixdcxspmczbxi.supabase.co/project/hujcbnrixdcxspmczbxi/sql/new
2. Copy and paste the SQL from `database-table.sql`
3. Click "Run" to execute the SQL
4. Then run the SQL from `supabase-video-storage-update.sql` to add the backup URL column

Or use this direct SQL (run both):

```sql
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

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON videos
  FOR ALL USING (true);

CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX idx_videos_status ON videos(status);
```

## ✅ 4. Start Development Server
- [x] Run `npm run dev` (Already running)
- Access the app at: http://localhost:3000

## 📝 Next Steps

Once Supabase is set up:
1. Open http://localhost:3000
2. Upload two person images
3. (Optional) Add a custom prompt
4. Click "Generate Hug Video"
5. Wait for the video to process
6. View and download your video!

## 🔧 Troubleshooting

If uploads fail:
- Check that the `hug-images` bucket exists in Supabase Storage
- Verify the bucket is public or has appropriate policies

If video generation fails:
- Verify your OpenAI API key is valid and has Sora 2 access
- Check the browser console for error messages
- The Sora 2 API might have specific requirements - check OpenAI docs

If database operations fail:
- Ensure the `videos` table is created
- Check that RLS policies are set up correctly

