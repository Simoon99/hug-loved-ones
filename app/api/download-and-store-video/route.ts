import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, videoId, recordId } = await request.json()

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL required' },
        { status: 400 }
      )
    }

    console.log('Downloading video from OpenAI:', videoUrl)

    // Download video from OpenAI URL
    // If it's an OpenAI API endpoint, we need to pass authorization headers
    const isOpenAIEndpoint = videoUrl.includes('api.openai.com')
    const fetchOptions: RequestInit = {}
    
    if (isOpenAIEndpoint) {
      fetchOptions.headers = {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      }
      console.log('Using OpenAI API authentication for download')
    }

    const videoResponse = await fetch(videoUrl, fetchOptions)

    console.log('Download response status:', videoResponse.status)
    console.log('Download response content-type:', videoResponse.headers.get('content-type'))

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text()
      console.error('Download failed:', errorText)
      throw new Error(`Failed to download video from OpenAI: ${videoResponse.status} ${errorText}`)
    }

    const videoBlob = await videoResponse.blob()
    const videoBuffer = await videoBlob.arrayBuffer()
    
    console.log('Video downloaded, size:', videoBuffer.byteLength, 'bytes')

    // Generate filename
    const filename = `${videoId || Date.now()}_hug-video.mp4`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('hug-videos')
      .upload(filename, videoBuffer, {
        contentType: 'video/mp4',
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Failed to upload video: ${uploadError.message}`)
    }

    console.log('Video uploaded to Supabase:', uploadData.path)

    // Generate a signed URL that expires in 7 days (instead of public URL)
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('hug-videos')
      .createSignedUrl(filename, 60 * 60 * 24 * 7) // 7 days expiration

    if (signedUrlError) {
      console.error('Failed to create signed URL:', signedUrlError)
      throw new Error('Failed to generate secure video URL')
    }

    const publicUrl = signedUrlData.signedUrl
    console.log('Supabase signed URL created (expires in 7 days):', publicUrl)

    // Update database with Supabase URL
    if (recordId) {
      const { error: updateError } = await supabaseAdmin
        .from('videos')
        .update({
          video_url: publicUrl, // Store Supabase URL (permanent)
          openai_url: videoUrl, // Keep OpenAI URL as backup
          updated_at: new Date().toISOString(),
        })
        .eq('id', recordId)

      if (updateError) {
        console.error('Database update error:', updateError)
      }
    }

    return NextResponse.json({
      success: true,
      supabaseUrl: publicUrl,
      originalUrl: videoUrl,
      message: 'Video stored successfully in Supabase',
    })
  } catch (error: any) {
    console.error('Download and store error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to store video' },
      { status: 500 }
    )
  }
}

