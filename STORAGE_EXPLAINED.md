# Video Storage Architecture 🎬

## The Problem

When OpenAI's Sora 2 API generates a video, it provides a **temporary URL** that expires after a certain time (usually 24-48 hours). If we only store this URL in our database, users would lose access to their videos!

## Our Solution

We automatically download and permanently store videos in Supabase Storage. Here's how:

## How It Works

### 1. Video Generation
```
User uploads 2 images → Sora 2 generates video → OpenAI returns temporary URL
```

### 2. Automatic Storage (NEW!)
```
Video completes → Download from OpenAI → Upload to Supabase → Store permanent URL
```

### 3. User Access
```
User views gallery → Videos load from Supabase → Permanent access forever!
```

## Storage Flow Diagram

```
┌─────────────────┐
│ User Uploads    │
│ 2 Images        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Upload to       │
│ Supabase        │
│ (hug-images)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Call Sora 2 API │
│ with prompt     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Poll for status │
│ every 5 seconds │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Video completed!│
│ OpenAI URL      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ AUTO-DOWNLOAD   │
│ video file      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Upload to       │
│ Supabase        │
│ (hug-videos)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update database │
│ with Supabase   │
│ URL             │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Show in gallery │
│ PERMANENT!      │
└─────────────────┘
```

## Database Structure

### videos table
```sql
id              UUID        -- Unique video ID
prompt          TEXT        -- User's prompt
image1_url      TEXT        -- Supabase URL for image 1
image2_url      TEXT        -- Supabase URL for image 2
status          TEXT        -- queued, processing, completed, failed
video_id        TEXT        -- OpenAI video ID
video_url       TEXT        -- 🌟 Supabase permanent URL
openai_url      TEXT        -- Original OpenAI URL (backup)
created_at      TIMESTAMP   -- When created
updated_at      TIMESTAMP   -- Last updated
```

## Storage Buckets

### 1. hug-images (User Uploads)
- **Purpose**: Store uploaded person images
- **Access**: Public (read-only for users)
- **Retention**: Permanent
- **Size**: ~1-5 MB per image

### 2. hug-videos (Generated Videos)
- **Purpose**: Store AI-generated videos
- **Access**: Public (read-only for users)
- **Retention**: Permanent
- **Size**: ~10-50 MB per video

## API Endpoints

### POST /api/upload
- Uploads images to `hug-images` bucket
- Returns Supabase public URL

### POST /api/create-video
- Sends images to Sora 2 API
- Stores metadata in database
- Returns video ID for tracking

### POST /api/check-video
- Checks OpenAI for video status
- **When completed**: Automatically triggers download
- Updates database with permanent URL

### POST /api/download-and-store-video
- Downloads video from OpenAI URL
- Uploads to `hug-videos` bucket
- Returns permanent Supabase URL
- Updates database

### GET /api/list-videos
- Fetches all videos from database
- Returns permanent Supabase URLs
- Sorted by newest first

## Benefits

### ✅ Permanent Storage
- Videos never expire
- Users can access videos anytime
- No reliance on OpenAI's temporary URLs

### ✅ Cost Effective
- Store videos once, serve unlimited times
- No repeated API calls to check URLs
- Supabase storage is affordable

### ✅ Fast Loading
- Videos load directly from Supabase CDN
- No redirect through OpenAI
- Better performance globally

### ✅ User Control
- Users own their videos
- Can download anytime
- Share permanent links

### ✅ Backup
- Original OpenAI URL stored as backup
- Can re-download if needed
- Redundancy for safety

## Storage Costs

### Supabase Free Tier
- **Storage**: 1 GB free
- **Bandwidth**: 2 GB free per month
- **Good for**: ~20-100 videos (depending on length)

### Paid Plans
- **Pro**: 8 GB storage + 50 GB bandwidth - $25/month
- **Scale**: Custom pricing
- **Storage**: $0.021 per GB/month
- **Bandwidth**: $0.09 per GB

### Example
- 50 videos × 30 MB = 1.5 GB storage ≈ $0.03/month
- Very affordable!

## Security

### Row Level Security (RLS)
- All tables have RLS enabled
- Public read access for videos
- Server-only write access via service role

### Storage Policies
- Public read for completed videos
- Server-only write access
- No anonymous uploads

### API Protection
- Server-side API keys only
- Never exposed to client
- Rate limiting possible

## Monitoring

### Check Storage Usage
1. Go to Supabase Dashboard
2. Navigate to Storage
3. View bucket sizes
4. Monitor bandwidth usage

### Check Database
```sql
-- Count videos by status
SELECT status, COUNT(*) 
FROM videos 
GROUP BY status;

-- Total storage used
SELECT 
  COUNT(*) as total_videos,
  pg_size_pretty(pg_total_relation_size('videos')) as db_size
FROM videos;
```

### Check Individual Video
```sql
SELECT id, prompt, status, video_url, created_at
FROM videos
WHERE status = 'completed'
ORDER BY created_at DESC
LIMIT 10;
```

## Troubleshooting

### Videos not storing?
1. Check `hug-videos` bucket exists
2. Verify bucket is public
3. Check storage policies are set
4. Check terminal logs for errors
5. Verify Supabase service role key

### Videos not displaying?
1. Check video_url in database
2. Verify it's a Supabase URL (not OpenAI)
3. Check bucket is public
4. Try opening URL directly in browser
5. Check browser console for errors

### Storage full?
1. Check Supabase usage dashboard
2. Delete old/test videos
3. Upgrade plan if needed
4. Consider compression

## Future Enhancements

- **Video Compression**: Reduce file sizes
- **Multiple Qualities**: Store HD + compressed versions
- **Thumbnails**: Generate preview images
- **Lazy Loading**: Load videos on demand
- **CDN**: Custom domain for videos
- **Analytics**: Track video views
- **Expiry**: Optional auto-delete after X days

