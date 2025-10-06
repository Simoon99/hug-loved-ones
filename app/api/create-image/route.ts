import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { imageUrls, prompt } = await request.json()

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      )
    }

    if (imageUrls.length > 3) {
      return NextResponse.json(
        { error: 'Maximum 3 images allowed (Gemini limitation)' },
        { status: 400 }
      )
    }

    // Verify Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please add GEMINI_API_KEY to your .env.local file.' },
        { status: 500 }
      )
    }

    console.log(`🎨 Using Gemini Nano Banana (gemini-2.5-flash-image) with ${imageUrls.length} input image(s)...`)
    console.log('📥 Downloading uploaded images securely using service role...')
    
    // Extract filenames from URLs (works with both public and signed URLs)
    const filenames = imageUrls.map(url => {
      // Extract filename from URL (after the last /)
      const parts = url.split('/')
      const filename = parts[parts.length - 1].split('?')[0] // Remove query params if present
      console.log('Extracted filename:', filename)
      return filename
    })
    
    // Download all uploaded images using Supabase service role (SECURE - no public bucket needed!)
    const imageResponses = await Promise.all(
      filenames.map(async (filename, index) => {
        console.log(`Securely downloading image ${index + 1}:`, filename)
        const { data, error } = await supabaseAdmin.storage
          .from('hug-images')
          .download(filename)
        
        if (error) {
          console.error(`Failed to download image ${index + 1}:`, error)
          throw new Error(`Failed to download ${filename}: ${error.message}`)
        }
        
        console.log(`Image ${index + 1} downloaded successfully (${data.size} bytes)`)
        return { data, filename }
      })
    )

    // Convert Blobs to base64 for Gemini API
    const imageData = await Promise.all(
      imageResponses.map(async ({ data: blob, filename }, index) => {
        // Get MIME type from blob or infer from filename
        let mimeType = blob.type || 'image/jpeg'
        if (!mimeType || mimeType === 'application/octet-stream') {
          // Infer from extension
          const ext = filename.split('.').pop()?.toLowerCase()
          mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
        }
        
        // Convert Blob to ArrayBuffer to base64
        const buffer = await blob.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        
        console.log(`Image ${index + 1}: ${mimeType}, ${buffer.byteLength} bytes, base64 length: ${base64.length}`)
        
        return { mimeType, base64 }
      })
    )

    console.log('✅ All images converted to base64')
    console.log('📤 Sending request to Gemini API...')

    // Create prompt for Gemini
    const geminiPrompt = prompt || 'Create a heartfelt, photorealistic image of these two people warmly embracing each other in a tender hug, showing genuine affection and connection. Natural lighting, emotional scene.'

    // Use official Gemini API endpoint with x-goog-api-key header (recommended authentication method)
    // Reference: https://ai.google.dev/gemini-api/docs/image-generation
    // Model: gemini-2.5-flash-image (Nano Banana)
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY, // Official header format
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Here are the input images. ${geminiPrompt}`,
                },
                // Add all uploaded images
                ...imageData.map(img => ({
                  inline_data: {
                    mime_type: img.mimeType,
                    data: img.base64,
                  },
                })),
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['Image'],
            imageConfig: {
              aspectRatio: '1:1', // Square images
            },
          },
        }),
      }
    )

    const responseData = await response.json()
    console.log('Gemini Response Status:', response.status)

    if (!response.ok) {
      console.error('❌ Gemini API Error:', JSON.stringify(responseData, null, 2))
      console.error('Request details:', {
        imageCount: imageData.length,
        images: imageData.map((img, i) => ({
          index: i + 1,
          mimeType: img.mimeType,
          base64Length: img.base64.length,
        })),
        promptLength: geminiPrompt.length,
      })
      throw new Error(responseData.error?.message || 'Failed to generate image with Gemini')
    }

    console.log('✅ Gemini API response received')

    // Extract base64 image data from response
    // The response contains candidates with content parts that include inlineData
    const imagePart = responseData.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData || part.inline_data
    )

    const generatedImageData = imagePart?.inlineData?.data || imagePart?.inline_data?.data

    if (!generatedImageData) {
      console.error('No image data in response:', JSON.stringify(responseData, null, 2))
      throw new Error('No image data returned from Gemini')
    }

    console.log('✅ Generated image data extracted from response')
    console.log('📤 Uploading to Supabase storage...')

    // Upload to Supabase
    const imageBuffer = Buffer.from(generatedImageData, 'base64')
    const filename = `gemini_${Date.now()}_hug-image.png`

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('hug-images')
      .upload(filename, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      throw new Error(`Failed to upload image: ${uploadError.message}`)
    }

    console.log('✅ Image uploaded to Supabase:', uploadData.path)

    // Generate signed URL (7 days expiration)
    const { data: signedData, error: signedError } = await supabaseAdmin.storage
      .from('hug-images')
      .createSignedUrl(filename, 60 * 60 * 24 * 7)

    if (signedError) {
      console.error('Signed URL error:', signedError)
      throw new Error('Failed to generate signed URL')
    }

    const imageUrl = signedData.signedUrl
    const generationId = `gemini_${Date.now()}`

    console.log('✅ Signed URL generated:', imageUrl)

    // Store in images database table
    const { data: dbRecord, error: dbError} = await supabaseAdmin
      .from('images')
      .insert({
        provider: 'gemini',
        prompt: geminiPrompt,
        image1_url: imageUrls[0] || null,
        image2_url: imageUrls[1] || null,
        image3_url: imageUrls[2] || null, // Store third image URL if exists
        status: 'completed',
        image_url: imageUrl,
        generation_id: generationId,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save image record to database')
    }

    console.log('✅ Image record saved to database:', dbRecord.id)

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      recordId: dbRecord.id,
      message: 'Image generated successfully with Gemini Nano Banana!',
    })
  } catch (error: any) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    )
  }
}
