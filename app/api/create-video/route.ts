import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { image1Url, image2Url, prompt } = await request.json()

    if (!image1Url || !image2Url) {
      return NextResponse.json(
        { error: 'Both images are required' },
        { status: 400 }
      )
    }

    // Create a prompt that describes two people hugging
    const fullPrompt =
      prompt ||
      'Two people warmly embracing each other in a heartfelt hug, showing genuine affection and connection. Cinematic lighting, emotional scene, high quality video.'

    // Create video request to Sora 2 using the official OpenAI API
    console.log('Creating video with Sora 2...')
    console.log('Prompt:', fullPrompt)
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    }

    // Add OpenAI-Organization header if available
    if (process.env.OPENAI_ORG_ID) {
      headers['OpenAI-Organization'] = process.env.OPENAI_ORG_ID
    }
    
    const response = await fetch('https://api.openai.com/v1/videos', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'sora-2',
        prompt: fullPrompt,
      }),
    })

    const responseText = await response.text()
    console.log('OpenAI Response Status:', response.status)
    console.log('OpenAI Response:', responseText)

    if (!response.ok) {
      let errorMessage = 'Failed to create video'
      let detailedError = ''
      
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.error?.message || errorMessage
        
        // Handle specific Sora 2 verification error
        if (response.status === 403 && errorMessage.includes('verified')) {
          errorMessage = '🔒 Sora 2 Access Required: Your OpenAI organization needs verification for Sora 2. Even after verification, it can take 15-30 minutes for access to activate. Please try again later or contact OpenAI support.'
          detailedError = '\n\nSteps to resolve:\n1. Verify your organization at https://platform.openai.com/settings/organization/general\n2. Wait 15-30 minutes after verification\n3. Generate a new API key\n4. Make sure your API key has Sora 2 access'
        } else if (response.status === 403) {
          errorMessage = '🔒 Access Denied: Your API key does not have access to Sora 2. Please check your OpenAI account settings.'
        } else if (response.status === 401) {
          errorMessage = '🔑 Invalid API Key: Please check your OPENAI_API_KEY in the .env.local file.'
        } else if (response.status === 429) {
          errorMessage = '⏱️ Rate Limit: Too many requests. Please wait a moment and try again.'
        }
        
        console.error('Detailed error:', errorData)
      } catch (e) {
        errorMessage = responseText || errorMessage
      }
      
      throw new Error(errorMessage + detailedError)
    }

    const videoData = JSON.parse(responseText)

    // Store video metadata in Supabase
    const { data: videoRecord, error: dbError } = await supabaseAdmin
      .from('videos')
      .insert({
        prompt: fullPrompt,
        image1_url: image1Url,
        image2_url: image2Url,
        status: videoData.status || 'processing',
        video_id: videoData.id || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
    }

    return NextResponse.json({
      success: true,
      videoId: videoData.id,
      recordId: videoRecord?.id,
      status: videoData.status || 'processing',
      message: 'Video generation started. This may take several minutes.',
    })
  } catch (error: any) {
    console.error('Video creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create video' },
      { status: 500 }
    )
  }
}

