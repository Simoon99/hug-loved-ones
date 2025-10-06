# Security & Privacy Design

## 🔒 **Private Storage Architecture**

Your uploaded photos are stored **securely** and are **NOT publicly accessible**.

### How It Works:

```
User uploads photo
    ↓
Frontend → Supabase Storage (PRIVATE bucket)
    ↓
Backend downloads using Service Role Key (authenticated)
    ↓
Sends to Gemini API
    ↓
Deletes from memory after generation
```

## Key Security Features:

### 1. **Private Storage Buckets** 🔐
- ✅ `hug-images` bucket is **PRIVATE**
- ✅ `hug-videos` bucket is **PRIVATE**
- ❌ NO public access to uploaded photos
- ✅ Only authenticated requests with service role key can access

### 2. **Service Role Authentication** 🔑
- Backend uses `SUPABASE_SERVICE_ROLE_KEY` (never exposed to frontend)
- Only server-side code can download uploaded images
- Frontend cannot access other users' images

### 3. **Temporary Signed URLs** ⏱️
- When images need to be shown (gallery, preview), we generate **signed URLs**
- These URLs **expire after 7 days**
- After expiration, images cannot be accessed even with the URL

### 4. **No Public URLs** 🚫
```javascript
// ❌ OLD (Insecure - public bucket required)
fetch(publicUrl)

// ✅ NEW (Secure - private bucket)
supabaseAdmin.storage.from('hug-images').download(filename)
```

## How Image Download Works:

### Frontend (app/api/upload/route.ts):
1. User selects image
2. Image uploaded to **PRIVATE** Supabase bucket
3. Returns filename/path (not a public URL)

### Backend (app/api/create-image/route.ts):
1. Receives filename from frontend
2. Uses **Service Role Key** to download securely:
   ```typescript
   const { data } = await supabaseAdmin.storage
     .from('hug-images')
     .download(filename)
   ```
3. Converts to base64
4. Sends to Gemini API
5. Generated image is stored and signed URL returned

## Privacy Best Practices Implemented:

✅ **Private by default** - Buckets are not public
✅ **Authenticated access** - Service role key required
✅ **Temporary URLs** - Signed URLs expire
✅ **Server-side processing** - Images never sent to frontend
✅ **No permanent public links** - All access is controlled

## What This Means for Users:

1. **Photos are private** - Not accessible via direct URLs
2. **Secure processing** - Server authenticates before downloading
3. **Controlled access** - Only authorized requests succeed
4. **Time-limited sharing** - Signed URLs expire automatically

## Supabase Storage Policies:

The buckets use **Row Level Security (RLS)** with these policies:

```sql
-- Only service_role can access
CREATE POLICY "Service role full access"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'hug-images');
```

This ensures:
- ❌ Anonymous users cannot download
- ❌ Other users cannot see your photos
- ✅ Only backend (with service key) can access
- ✅ Your privacy is protected

## Environment Variables Security:

```env
# ✅ NEVER commit these to Git
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx  # Server-only, full access
GEMINI_API_KEY=AIzaSyAxxx                # Server-only

# ✅ Safe to expose (limited permissions)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
```

**Note**: Service role key is NEVER sent to the frontend - only used on the server!

## Summary:

🔒 **Your photos are secure and private**
- Private storage buckets
- Authenticated downloads only
- No public access
- Temporary signed URLs when needed
- Server-side processing only

This architecture ensures your sensitive photos remain private while still allowing the AI to generate beautiful hug images! 💜

