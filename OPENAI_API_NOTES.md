# OpenAI Sora 2 API Integration Notes

## API Endpoints Used

Based on the official OpenAI API documentation:
https://platform.openai.com/docs/api-reference/videos

### 1. Create Video
**Endpoint:** `POST https://api.openai.com/v1/videos`

**Request Body:**
```json
{
  "model": "sora-2",
  "prompt": "Text description of the video to generate",
  "size": "1024x1808",
  "seconds": 10,
  "quality": "standard"
}
```

**Response:**
```json
{
  "id": "video_123",
  "object": "video",
  "model": "sora-2",
  "status": "queued",
  "progress": 0,
  "created_at": 1712697600,
  "size": "1024x1808",
  "seconds": 8,
  "quality": "standard"
}
```

### 2. Retrieve Video Status
**Endpoint:** `GET https://api.openai.com/v1/videos/{video_id}`

**Response:**
- Same structure as create, but with updated `status`, `progress`, and potentially a `url` field when completed

### Video Status Values
- `queued` - Video is in the queue
- `processing` - Video is being generated
- `completed` - Video is ready (will have `url` field)
- `failed` - Video generation failed

## Current Implementation

### Files Updated:
- `app/api/create-video/route.ts` - Creates video using Sora 2 API
- `app/api/check-video/route.ts` - Checks video generation status

### Parameters Used:
- **model:** `sora-2`
- **size:** `1024x1808` (vertical video format, good for mobile)
- **seconds:** `10` (10-second video)
- **quality:** `standard` (can be "standard" or "high")

### Optional Parameters (Not Currently Used):
- **input_reference:** Upload a reference image/video to guide generation
- **duration:** Alternative to `seconds`

## Image Reference Support

According to the API docs, you can include an `input_reference` parameter (file upload) to provide reference images. This would be useful for our use case where we want to include the two uploaded person images.

**Future Enhancement:**
We could modify the API call to include the uploaded images as reference:
```javascript
const formData = new FormData()
formData.append('model', 'sora-2')
formData.append('prompt', fullPrompt)
formData.append('input_reference', imageFile)
```

## Testing Notes

1. **API Access:** Ensure your OpenAI account has access to Sora 2 API
2. **Billing:** Video generation with Sora 2 may incur costs
3. **Processing Time:** Videos can take several minutes to generate
4. **Rate Limits:** Check OpenAI's rate limits for the video API

## Error Handling

The app now logs detailed error messages from the OpenAI API to help debug issues:
- Check the terminal/console for OpenAI API responses
- Common errors:
  - 401: Invalid API key
  - 403: No access to Sora 2
  - 429: Rate limit exceeded
  - 500: OpenAI server error

## Next Steps for Production

1. Add proper error handling UI feedback
2. Implement retry logic for failed generations
3. Add cost estimation before generation
4. Consider adding image reference support
5. Add video duration selector in UI
6. Add quality selector (standard vs high)
7. Add size/aspect ratio selector

