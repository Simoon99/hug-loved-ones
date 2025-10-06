# Multi-Image Upload Feature (Up to 3 Images)

## Overview
The app now supports uploading **up to 3 images** as input for Gemini Nano Banana image generation, as recommended by the [official Gemini documentation](https://ai.google.dev/gemini-api/docs/image-generation).

## Changes Made

### 1. **Frontend (app/page.tsx)**
- ✅ Added `image3` to `UploadStatus` type
- ✅ Added `image3InputRef` ref for third upload input
- ✅ Updated `handleFileSelect` to accept 'image3' as parameter
- ✅ Updated validation to require **at least 1 image** (instead of requiring exactly 2)
- ✅ Added third upload zone UI with "Person 3 (Optional)" label
- ✅ Changed grid layout from `md:grid-cols-2` to `md:grid-cols-3`
- ✅ Updated `handleGenerateImage` to send array of image URLs
- ✅ Updated button disabled states to check for at least one image
- ✅ Updated `resetApp` to reset all 3 image states

### 2. **Backend (app/api/create-image/route.ts)**
- ✅ Changed API to accept `imageUrls` array instead of individual URLs
- ✅ Added validation for 1-3 images (enforcing Gemini's limitation)
- ✅ Updated image downloading to handle array of URLs
- ✅ Updated Gemini API request to dynamically add all images
- ✅ Fixed variable naming conflict (`imageData` → `generatedImageData`)
- ✅ Updated database insert to store `image3_url`

### 3. **Database Schema**
- ✅ Created `database-add-image3.sql` migration file
- **ACTION REQUIRED**: Run this SQL in your Supabase dashboard:
  ```sql
  ALTER TABLE images ADD COLUMN IF NOT EXISTS image3_url TEXT;
  ```

### 4. **Documentation**
- ✅ Updated `GEMINI_API_SETUP.md` with correct model name
- ✅ Added reference to official Gemini image generation docs

## How It Works

### User Experience:
1. **Upload 1-3 images** (Person 1, Person 2, Person 3 - optional)
2. All uploaded images are sent to Gemini as input
3. Gemini analyzes all images and creates a custom hug scene

### Example Scenarios:
- **1 image**: Generate a hug scene inspired by one person
- **2 images**: Generate two people hugging (original functionality)
- **3 images**: Generate a scene with multiple people or more context

### Technical Flow:
```
Frontend → Collects imageUrls array → API Route
         ↓
API Route → Downloads all images → Converts to base64
         ↓
Gemini API → Receives text prompt + up to 3 images
         ↓
Generated Image → Stored in Supabase → Returned to user
```

## Gemini Model Specifications

According to [official docs](https://ai.google.dev/gemini-api/docs/image-generation):

| Feature | Details |
|---------|---------|
| Model | `gemini-2.5-flash-image` |
| Max Input Images | 3 (works best with 1-3) |
| Input Format | `inline_data` with base64 + MIME type |
| Output Format | Base64 PNG image |
| Authentication | `x-goog-api-key` header |
| Aspect Ratios | 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9 |

## Important Notes

1. **Gemini Limitation**: Maximum 3 images supported by the model
2. **Optional 3rd Image**: The third upload is optional - users can upload 1, 2, or 3 images
3. **Database Migration**: Don't forget to run the SQL migration to add `image3_url` column
4. **Mobile Responsive**: UI adapts from 1 column (mobile) to 3 columns (desktop)

## Next Steps

1. ✅ **Run the database migration** in Supabase:
   ```sql
   ALTER TABLE images ADD COLUMN IF NOT EXISTS image3_url TEXT;
   ```

2. ✅ **Test the feature**:
   - Try uploading 1 image
   - Try uploading 2 images
   - Try uploading 3 images

3. ✅ **Monitor logs** for detailed debugging information showing all uploaded images

## Server Status

🚀 **Server is running!** You can now test the multi-image upload feature at http://localhost:3000

