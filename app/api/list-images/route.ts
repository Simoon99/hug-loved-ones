import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Fetch all images, ordered by most recent first
    const { data: images, error } = await supabaseAdmin
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50) // Limit to last 50 images

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch images' },
        { status: 500 }
      )
    }

    // Generate fresh signed URLs for images (since they expire after 7 days)
    const imagesWithSignedUrls = await Promise.all(
      (images || []).map(async (image) => {
        if (image.image_url && image.status === 'completed') {
          try {
            // Extract filename from the stored image_url
            const urlParts = image.image_url.split('/')
            const filename = urlParts[urlParts.length - 1].split('?')[0]
            
            // Generate a new signed URL (7 days expiration)
            const { data: signedData, error: signedError } = await supabaseAdmin.storage
              .from('hug-images')
              .createSignedUrl(filename, 60 * 60 * 24 * 7)
            
            if (!signedError && signedData) {
              return { ...image, image_url: signedData.signedUrl }
            }
          } catch (err) {
            console.error('Failed to generate signed URL for image:', image.id, err)
          }
        }
        return image
      })
    )

    return NextResponse.json({
      success: true,
      images: imagesWithSignedUrls,
    })
  } catch (error: any) {
    console.error('List images error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch images' },
      { status: 500 }
    )
  }
}

