import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { videoId, recordId } = await request.json()

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
    }

    // Check video status with OpenAI using the official API
    console.log('Checking video status for ID:', videoId)
    
    const response = await fetch(`https://api.openai.com/v1/videos/${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })

    const responseText = await response.text()
    console.log('Check Video Response Status:', response.status)
    console.log('Check Video Response:', responseText)

    if (!response.ok) {
      let errorMessage = 'Failed to retrieve video status'
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.error?.message || errorMessage
      } catch (e) {
        errorMessage = responseText || errorMessage
      }
      throw new Error(errorMessage)
    }

    const video = JSON.parse(responseText)
    console.log('Video status:', video.status)
    console.log('Full video object:', JSON.stringify(video, null, 2))
    console.log('All video keys:', Object.keys(video))

    // Extract video URL - try ALL possible fields from Sora 2 API
    let openaiVideoUrl = null
    
    // PRIORITY 1: Check for data array (according to official docs)
    if (video.data && Array.isArray(video.data) && video.data.length > 0 && video.data[0].url) {
      openaiVideoUrl = video.data[0].url
      console.log('Found video.data[0].url:', openaiVideoUrl)
    }
    // PRIORITY 2: Check other possible URL fields
    else if (video.url) {
      openaiVideoUrl = video.url
      console.log('Found video.url:', openaiVideoUrl)
    } else if (video.output_url) {
      openaiVideoUrl = video.output_url
      console.log('Found video.output_url:', openaiVideoUrl)
    } else if (video.download_url) {
      openaiVideoUrl = video.download_url
      console.log('Found video.download_url:', openaiVideoUrl)
    } else if (video.file) {
      // If there's a file ID, construct the download URL
      openaiVideoUrl = `https://api.openai.com/v1/files/${video.file}/content`
      console.log('Found video.file, constructed URL:', openaiVideoUrl)
    } else if (video.file_id) {
      openaiVideoUrl = `https://api.openai.com/v1/files/${video.file_id}/content`
      console.log('Found video.file_id, constructed URL:', openaiVideoUrl)
    } else if (video.files && video.files.length > 0) {
      // Check if there's a files array
      const videoFile = video.files.find((f: any) => f.purpose === 'video' || f.filename?.endsWith('.mp4'))
      if (videoFile) {
        openaiVideoUrl = `https://api.openai.com/v1/files/${videoFile.id}/content`
        console.log('Found in video.files array, constructed URL:', openaiVideoUrl)
      }
    }
    // PRIORITY 3: If video is completed but no URL found, try the /content endpoint directly
    else if (video.status === 'completed') {
      // Try downloading directly from the content endpoint
      openaiVideoUrl = `https://api.openai.com/v1/videos/${videoId}/content`
      console.log('No URL field found, trying direct content endpoint:', openaiVideoUrl)
    }
    
    console.log('Final extracted video URL:', openaiVideoUrl)
    
    // If no URL found but video is completed, log all fields to help debug
    if (!openaiVideoUrl && video.status === 'completed') {
      console.error('VIDEO COMPLETED BUT NO URL FOUND!')
      console.error('Available fields:', Object.keys(video))
      console.error('Full object:', video)
    }

    let finalVideoUrl = openaiVideoUrl

    // If video is completed and has a URL, download and store it in Supabase
    if (video.status === 'completed' && openaiVideoUrl) {
      console.log('Video completed! Downloading and storing in Supabase...')
      
      try {
        // Check if we already stored this video
        const { data: existingVideo } = await supabaseAdmin
          .from('videos')
          .select('video_url')
          .eq('id', recordId)
          .single()

        // Only download if we don't have a Supabase URL yet (or if it's still the OpenAI URL)
        const needsDownload = !existingVideo?.video_url || 
                            existingVideo.video_url.includes('openai.com') ||
                            existingVideo.video_url === openaiVideoUrl

        if (needsDownload) {
          const storeResponse = await fetch(`${request.url.split('/api/')[0]}/api/download-and-store-video`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              videoUrl: openaiVideoUrl,
              videoId: videoId,
              recordId: recordId,
            }),
          })

          if (storeResponse.ok) {
            const storeData = await storeResponse.json()
            finalVideoUrl = storeData.supabaseUrl
            console.log('Video successfully stored in Supabase:', finalVideoUrl)
          } else {
            console.error('Failed to store video in Supabase, using OpenAI URL as fallback')
          }
        } else {
          // Video is already stored, but signed URL might have expired
          // Extract filename and generate a fresh signed URL
          try {
            const urlParts = existingVideo.video_url.split('/')
            const filename = urlParts[urlParts.length - 1].split('?')[0]
            
            const { data: signedData, error: signedError } = await supabaseAdmin.storage
              .from('hug-videos')
              .createSignedUrl(filename, 60 * 60 * 24 * 7) // 7 days
            
            if (!signedError && signedData) {
              finalVideoUrl = signedData.signedUrl
              console.log('Generated fresh signed URL for existing video')
            } else {
              finalVideoUrl = existingVideo.video_url
            }
          } catch (err) {
            console.error('Failed to generate fresh signed URL:', err)
            finalVideoUrl = existingVideo.video_url
          }
          console.log('Video already stored in Supabase:', finalVideoUrl)
        }
      } catch (storeError) {
        console.error('Error storing video:', storeError)
        console.log('Using OpenAI URL as fallback')
      }
    }

    // Update database record with status and video URL
    if (recordId) {
      const updateData: any = {
        status: video.status,
        updated_at: new Date().toISOString(),
      }
      
      // If video is completed and we have a URL, update it
      if (video.status === 'completed' && finalVideoUrl) {
        updateData.video_url = finalVideoUrl
        console.log('Updating database with completed status and video URL:', finalVideoUrl)
      }
      
      const { error: updateError } = await supabaseAdmin
        .from('videos')
        .update(updateData)
        .eq('id', recordId)
      
      if (updateError) {
        console.error('Failed to update database:', updateError)
      } else {
        console.log('Database updated successfully:', updateData)
      }
    }

    return NextResponse.json({
      success: true,
      status: video.status,
      videoUrl: finalVideoUrl,
      progress: video.progress,
      videoData: video, // Send full object for debugging
    })
  } catch (error: any) {
    console.error('Check video error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check video status' },
      { status: 500 }
    )
  }
}

