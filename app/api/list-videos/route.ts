import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Fetch all completed videos, ordered by most recent first
    const { data: videos, error } = await supabaseAdmin
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50) // Limit to last 50 videos

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch videos' },
        { status: 500 }
      )
    }

    // Generate fresh signed URLs for videos (since they expire after 7 days)
    const videosWithSignedUrls = await Promise.all(
      (videos || []).map(async (video) => {
        if (video.video_url && video.status === 'completed') {
          try {
            // Extract filename from the stored video_url
            const urlParts = video.video_url.split('/')
            const filename = urlParts[urlParts.length - 1].split('?')[0]
            
            // Generate a new signed URL (7 days expiration)
            const { data: signedData, error: signedError } = await supabaseAdmin.storage
              .from('hug-videos')
              .createSignedUrl(filename, 60 * 60 * 24 * 7)
            
            if (!signedError && signedData) {
              return { ...video, video_url: signedData.signedUrl }
            }
          } catch (err) {
            console.error('Failed to generate signed URL for video:', video.id, err)
          }
        }
        return video
      })
    )

    return NextResponse.json({
      success: true,
      videos: videosWithSignedUrls,
    })
  } catch (error: any) {
    console.error('List videos error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

