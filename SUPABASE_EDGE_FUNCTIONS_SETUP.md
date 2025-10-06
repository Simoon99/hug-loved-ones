# 🔐 Supabase Edge Functions Setup

## Why Edge Functions?

Instead of storing the **GEMINI_API_KEY** in Vercel (less secure), we use Supabase Edge Functions to:
- ✅ Keep sensitive API keys **only** on Supabase's secure infrastructure
- ✅ Never expose keys to the client or Vercel
- ✅ Better security and separation of concerns

---

## 📦 What Was Created:

1. **`supabase/functions/generate-image/index.ts`**
   - Secure edge function that handles Gemini API calls
   - Downloads images from Supabase Storage
   - Calls Gemini API with secure key
   - Uploads result back to Storage
   - Saves record to database

2. **`supabase/config.toml`**
   - Supabase project configuration

---

## 🚀 Deployment Steps:

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link to Your Project

```bash
supabase link --project-ref hujcbnrixdcxspmczbxi
```

### 4. Set the GEMINI_API_KEY Secret

```bash
supabase secrets set GEMINI_API_KEY=AIzaSyAr2jNFPdTfLXsqetYf_Na8JR1AbInKssg
```

### 5. Deploy the Edge Function

```bash
supabase functions deploy generate-image
```

### 6. Verify Deployment

```bash
supabase functions list
```

---

## 🔄 Update Next.js API Route (Optional)

Instead of calling Gemini directly from `/api/create-image`, you can call the Edge Function:

```typescript
// In app/api/create-image/route.ts
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-image`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({
      imageUrls,
      prompt: customPrompt
    })
  }
)
```

---

## 🎯 Environment Variables Needed in Vercel (Reduced):

After using Edge Functions, you only need:

1. ✅ `NEXT_PUBLIC_SUPABASE_URL`
2. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. ✅ `SUPABASE_SERVICE_ROLE_KEY`
4. ❌ ~~`GEMINI_API_KEY`~~ (Now secure in Supabase!)

---

## 🧪 Test the Edge Function

```bash
curl -X POST \
  https://hujcbnrixdcxspmczbxi.supabase.co/functions/v1/generate-image \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrls": ["image1.jpg", "image2.jpg"],
    "prompt": "Two friends hugging"
  }'
```

---

## 📊 Benefits:

✅ **More Secure** - API key never leaves Supabase  
✅ **Better Architecture** - Separation of concerns  
✅ **Scalable** - Edge functions auto-scale  
✅ **Cost Effective** - Run on Supabase's infrastructure  

---

## 🔄 Automatic Deployment Script

I've created `deploy-edge-function.sh` to automate deployment!

```bash
chmod +x deploy-edge-function.sh
./deploy-edge-function.sh
```

---

## 🆘 Troubleshooting:

**Error: "Function not found"**
- Make sure you're logged in: `supabase login`
- Check project link: `supabase link --project-ref hujcbnrixdcxspmczbxi`

**Error: "GEMINI_API_KEY not set"**
- Set the secret: `supabase secrets set GEMINI_API_KEY=your-key`

**CORS errors**
- Edge function includes CORS headers
- Make sure to call from your domain or localhost

---

Let me know when you're ready to deploy! 🚀

