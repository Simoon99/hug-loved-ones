# Gemini Nano Banana API Setup

## Overview
This app now uses **ONLY Gemini Nano Banana** (`gemini-2.5-flash-image`) for image generation with multimodal image-to-image capabilities.

## API Configuration

### Endpoint
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent
```

### Authentication
Using the **official recommended method** from [https://ai.google.dev/api](https://ai.google.dev/api):
- **Header**: `x-goog-api-key: YOUR_API_KEY`
- Not using query parameter method

### Request Structure
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Your prompt here"
        },
        {
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "base64_encoded_image_1"
          }
        },
        {
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "base64_encoded_image_2"
          }
        }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["Image"],
    "imageConfig": {
      "aspectRatio": "1:1"
    }
  }
}
```

### Response Structure
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "inline_data": {
              "mime_type": "image/png",
              "data": "base64_encoded_generated_image"
            }
          }
        ]
      }
    }
  ]
}
```

## Key Features

### ✅ Image-to-Image Generation
- **Multimodal inputs**: Sends both uploaded photos directly to Gemini
- **No intermediate analysis needed**: Unlike DALL-E, Gemini can process image inputs directly
- **Better personalization**: AI sees actual faces and features

### ✅ Official API Format
- Uses `inline_data` with snake_case (as per official docs)
- Uses `x-goog-api-key` header for authentication
- Follows the exact structure from Google AI documentation

### ✅ Complete Workflow
1. User uploads 2 photos
2. Backend downloads from Supabase
3. Converts to base64
4. Sends to Gemini with text prompt + 2 images
5. Gemini generates custom hug image
6. Backend uploads to Supabase
7. Returns signed URL to frontend

## Environment Variable

Add to `.env.local`:
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

Get your API key from: [https://ai.google.dev/](https://ai.google.dev/)

## Why Gemini Over DALL-E?

| Feature | Gemini Nano Banana | DALL-E 3 |
|---------|-------------------|----------|
| Image Inputs | ✅ Yes (native) | ❌ No (text only) |
| Personalization | ✅ Direct face recognition | ⚠️ Needs GPT-4 Vision first |
| API Complexity | ✅ Single API call | ❌ 2 API calls needed |
| Cost | ✅ Lower | ❌ Higher (2 models) |
| Speed | ✅ Faster | ❌ Slower (2 steps) |

## Reference
- Official API Docs: [https://ai.google.dev/api](https://ai.google.dev/api)
- Image Generation Guide: [https://ai.google.dev/gemini-api/docs/image-generation](https://ai.google.dev/gemini-api/docs/image-generation)
- Model: `gemini-2.5-flash-image` (Nano Banana / Gemini 2.5 Flash Image)
- Availability: Preview (Production usage allowed)
- Capability: Multimodal image generation with image + text inputs
- Strengths: Unparalleled flexibility, contextual understanding, simple mask-free editing, multi-turn conversational editing
- Limitations: Does not support images of children in certain regions, higher latency than Imagen

