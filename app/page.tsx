'use client'

import { useState, useRef } from 'react'
import VideoGallery from '@/components/VideoGallery'
import ImageGallery from '@/components/ImageGallery'

type UploadStatus = {
  image1: { file: File | null; url: string; supabaseUrl: string; uploading: boolean }
  image2: { file: File | null; url: string; supabaseUrl: string; uploading: boolean }
  image3: { file: File | null; url: string; supabaseUrl: string; uploading: boolean }
}

export default function Home() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    image1: { file: null, url: '', supabaseUrl: '', uploading: false },
    image2: { file: null, url: '', supabaseUrl: '', uploading: false },
    image3: { file: null, url: '', supabaseUrl: '', uploading: false },
  })
  
  // Generation mode (image or video)
  const [generationMode, setGenerationMode] = useState<'image' | 'video'>('image')
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [recordId, setRecordId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoStatus, setVideoStatus] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [generatingPrompt, setGeneratingPrompt] = useState(false)
  
  // Image generation specific
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [imageRecordId, setImageRecordId] = useState<string | null>(null)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'1photo' | '3photos' | '5photos' | null>(null)

  const image1InputRef = useRef<HTMLInputElement>(null)
  const image2InputRef = useRef<HTMLInputElement>(null)
  const image3InputRef = useRef<HTMLInputElement>(null)

  const promptTemplates = [
    "Two close friends reuniting after a long time apart, sharing a warm and emotional embrace in a beautiful outdoor setting with natural lighting",
    "A heartfelt moment as two loved ones hug each other tightly, surrounded by a soft, dreamy atmosphere with bokeh effects and golden hour lighting",
    "Two people coming together in a tender, meaningful hug, with genuine emotion and connection visible in their body language, cinematic style",
    "An emotional reunion scene where two individuals embrace warmly, tears of joy, heartwarming moment, professional photography style",
    "Two friends sharing a genuine, wholesome hug filled with love and appreciation, soft natural light, candid photography aesthetic",
    "A touching embrace between two people in an elegant setting, showing deep connection and affection, artistic cinematography",
  ]

  const handleFileSelect = async (
    file: File,
    imageNumber: 'image1' | 'image2' | 'image3'
  ) => {
    setError('')
    
    // Create local preview URL (for display)
    const objectUrl = URL.createObjectURL(file)
    setUploadStatus((prev) => ({
      ...prev,
      [imageNumber]: { file, url: objectUrl, supabaseUrl: '', uploading: true },
    }))

    // Upload to Supabase (for API usage)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('imageNumber', imageNumber)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      // Keep local URL for display, store Supabase URL for API
      setUploadStatus((prev) => ({
        ...prev,
        [imageNumber]: { file, url: objectUrl, supabaseUrl: data.url, uploading: false },
      }))
    } catch (err: any) {
      setError(`Failed to upload ${imageNumber}: ${err.message}`)
      setUploadStatus((prev) => ({
        ...prev,
        [imageNumber]: { file: null, url: '', supabaseUrl: '', uploading: false },
      }))
    }
  }

  const handleGenerateVideo = async () => {
    if (!uploadStatus.image1.supabaseUrl || !uploadStatus.image2.supabaseUrl) {
      setError('Please wait for images to finish uploading')
      return
    }

    setIsGenerating(true)
    setError('')
    setVideoStatus('Initializing video generation...')

    try {
      const response = await fetch('/api/create-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image1Url: uploadStatus.image1.supabaseUrl,
          image2Url: uploadStatus.image2.supabaseUrl,
          prompt: customPrompt || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Video generation failed')
      }

      setVideoId(data.videoId)
      setRecordId(data.recordId)
      setVideoStatus('Processing your video...')

      // Start polling for video status
      pollVideoStatus(data.videoId, data.recordId)
    } catch (err: any) {
      setError(err.message)
      setIsGenerating(false)
    }
  }

  const handleGenerateImage = async () => {
    // Check if at least one image is uploaded
    const uploadedImages = [uploadStatus.image1, uploadStatus.image2, uploadStatus.image3].filter(
      img => img.supabaseUrl
    )
    
    if (uploadedImages.length === 0) {
      setError('Please upload at least 1 image')
      return
    }
    
    // Check if any image is still uploading
    const isUploading = [uploadStatus.image1, uploadStatus.image2, uploadStatus.image3].some(
      img => img.uploading
    )
    
    if (isUploading) {
      setError('Please wait for images to finish uploading')
      return
    }

    setIsGenerating(true)
    setError('')
    setGeneratedImageUrl(null)

    // Show real-time progress updates
    const progressSteps = [
      '👁️ AI is looking at your photos...',
      '🧠 Understanding who they are...',
      '🎨 Creating your personalized scene...',
      '✨ Adding magical touches...',
      '🖼️ Finalizing your masterpiece...',
    ]

    let stepIndex = 0
    setVideoStatus(progressSteps[0])
    
    const progressInterval = setInterval(() => {
      stepIndex++
      if (stepIndex < progressSteps.length) {
        setVideoStatus(progressSteps[stepIndex])
      }
    }, 2000)

    try {
      // Collect all uploaded image URLs
      const imageUrls = [
        uploadStatus.image1.supabaseUrl,
        uploadStatus.image2.supabaseUrl,
        uploadStatus.image3.supabaseUrl,
      ].filter(url => url) // Remove empty URLs

      const response = await fetch('/api/create-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrls,
          prompt: customPrompt || undefined,
        }),
      })

      clearInterval(progressInterval)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Image generation failed')
      }

      setGeneratedImageUrl(data.imageUrl)
      setImageRecordId(data.recordId)
      setVideoStatus('Image generated successfully! ✅')
    } catch (err: any) {
      clearInterval(progressInterval)
      setError(err.message)
      setVideoStatus('')
    } finally {
      // Always stop loading animation
      setIsGenerating(false)
    }
  }

  const handleGenerate = () => {
    // Show pricing modal instead of generating immediately
    setShowPricingModal(true)
    setSelectedTier(null) // Reset selected tier
  }

  const handleSelectTier = (tier: '1photo' | '3photos' | '5photos') => {
    // Just select the tier, don't close modal or start generation
    setSelectedTier(tier)
  }

  const handlePayment = async () => {
    if (!selectedTier) return
    
    // TODO: Integrate with payment processor (Stripe, etc.)
    // For now, close modal and proceed directly to generation
    setShowPricingModal(false)
    
    // Start generation
    await handleGenerateImage()
  }

  const pollVideoStatus = async (vId: string, rId: string) => {
    const maxAttempts = 120 // Poll for up to 10 minutes
    let attempts = 0

    const interval = setInterval(async () => {
      attempts++

      try {
        const response = await fetch('/api/check-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId: vId, recordId: rId }),
        })

        const data = await response.json()
        
        console.log('Poll response:', data)

        if (data.status === 'completed') {
          if (data.videoUrl) {
            // Check if it's a Supabase URL (permanent) or OpenAI URL (temporary)
            const isSupabaseUrl = data.videoUrl.includes('supabase.co')
            
            if (isSupabaseUrl) {
              setVideoUrl(data.videoUrl)
              setVideoStatus('✅ Video ready and saved to your gallery!')
              setIsGenerating(false)
              clearInterval(interval)
            } else {
              // Still an OpenAI URL, video is being downloaded to Supabase
              setVideoStatus(`Video completed! Saving to your gallery... (${attempts * 5}s)`)
              console.log('Video being stored in Supabase...')
            }
          } else {
            // Video is complete but URL not yet available - keep checking
            setVideoStatus(`Video completed! Getting download link... (attempt ${attempts})`)
            console.log('Video completed but no URL yet, full data:', data.videoData)
          }
        } else if (data.status === 'failed') {
          setError('Video generation failed. Please check the terminal logs for details.')
          setIsGenerating(false)
          clearInterval(interval)
        } else {
          const progress = data.progress ? ` - ${data.progress}%` : ''
          setVideoStatus(`Processing... (${data.status}${progress})`)
        }
      } catch (err: any) {
        console.error('Polling error:', err)
        setError(`Polling error: ${err.message}`)
      }

      if (attempts >= maxAttempts) {
        setError(`Video generation timed out after ${attempts} attempts. Video ID: ${vId}. Check OpenAI dashboard or try refreshing.`)
        setIsGenerating(false)
        clearInterval(interval)
      }
    }, 5000) // Check every 5 seconds
  }
  
  const manualCheckVideo = async () => {
    if (!videoId || !recordId) return
    
    setVideoStatus('Manually checking video status...')
    try {
      const response = await fetch('/api/check-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, recordId }),
      })

      const data = await response.json()
      
      if (data.videoUrl) {
        setVideoUrl(data.videoUrl)
        setVideoStatus('Video ready!')
        setIsGenerating(false)
      } else {
        setVideoStatus(`Status: ${data.status}. No video URL available yet.`)
      }
    } catch (err: any) {
      setError(`Check failed: ${err.message}`)
    }
  }

  const generatePrompt = () => {
    const hasImages = uploadStatus.image1.url || uploadStatus.image2.url || uploadStatus.image3.url
    if (!hasImages) {
      setError('Please upload at least one image first')
      return
    }

    setGeneratingPrompt(true)
    setError('')

    // Simulate a brief "thinking" moment for better UX
    setTimeout(() => {
      // Pick a random template
      const randomTemplate = promptTemplates[Math.floor(Math.random() * promptTemplates.length)]
      setCustomPrompt(randomTemplate)
      setGeneratingPrompt(false)
    }, 800)
  }

  const resetApp = () => {
    setUploadStatus({
      image1: { file: null, url: '', supabaseUrl: '', uploading: false },
      image2: { file: null, url: '', supabaseUrl: '', uploading: false },
      image3: { file: null, url: '', supabaseUrl: '', uploading: false },
    })
    setIsGenerating(false)
    setVideoId(null)
    setRecordId(null)
    setVideoUrl(null)
    setVideoStatus('')
    setError('')
    setCustomPrompt('')
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 px-4">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 md:mb-4 float">
            AI Hug Generator 🤗
          </h1>
          <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto">
            Upload photos and create beautiful AI-generated hug scenes • Share to Instagram, Facebook & more! 💜
          </p>
          <p className="text-xs md:text-sm text-gray-500 mt-2">
            Powered by Gemini Nano Banana 🍌
          </p>
        </div>

        {/* Create New Image Section */}
        <div className="text-center mb-6 md:mb-8 px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            Create Your Hug Image ✨
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Upload up to 3 photos and let AI create a beautiful hug scene
          </p>
        </div>

        {/* Main Content */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Image 1 Upload */}
            <div className="image-preview">
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800">
                Person 1
              </h3>
              <div
                className={`upload-zone ${
                  uploadStatus.image1.uploading ? 'active' : ''
                }`}
                onClick={() => image1InputRef.current?.click()}
              >
                {uploadStatus.image1.url ? (
                  <div className="w-full h-48 md:h-64 flex items-center justify-center image-preview">
                    <img
                      src={uploadStatus.image1.url}
                      alt="Person 1"
                      className="max-w-full max-h-48 md:max-h-64 object-contain rounded-lg shadow-lg"
                    />
                  </div>
                ) : (
                  <div className="py-8 md:py-12">
                    {uploadStatus.image1.uploading ? (
                      <div className="flex flex-col items-center">
                        <div className="spinner-lg mb-4"></div>
                        <p className="text-gray-600 font-medium">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-3 md:mb-4"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="text-gray-600 text-sm md:text-base">
                          Tap to upload image
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          JPG, PNG or WebP
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
              <input
                ref={image1InputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file, 'image1')
                }}
              />
            </div>

            {/* Image 2 Upload */}
            <div className="image-preview">
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800">
                Person 2
              </h3>
              <div
                className={`upload-zone ${
                  uploadStatus.image2.uploading ? 'active' : ''
                }`}
                onClick={() => image2InputRef.current?.click()}
              >
                {uploadStatus.image2.url ? (
                  <div className="w-full h-48 md:h-64 flex items-center justify-center image-preview">
                    <img
                      src={uploadStatus.image2.url}
                      alt="Person 2"
                      className="max-w-full max-h-48 md:max-h-64 object-contain rounded-lg shadow-lg"
                    />
                  </div>
                ) : (
                  <div className="py-8 md:py-12">
                    {uploadStatus.image2.uploading ? (
                      <div className="flex flex-col items-center">
                        <div className="spinner-lg mb-4"></div>
                        <p className="text-gray-600 font-medium">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-3 md:mb-4"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="text-gray-600 text-sm md:text-base">
                          Tap to upload image
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          JPG, PNG or WebP
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
              <input
                ref={image2InputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file, 'image2')
                }}
              />
            </div>

            {/* Image 3 Upload (Optional) */}
            <div className="image-preview">
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800 flex items-center gap-2">
                Person 3
                <span className="text-xs font-normal text-gray-500">(Optional)</span>
              </h3>
              <div
                className={`upload-zone ${
                  uploadStatus.image3.uploading ? 'active' : ''
                }`}
                onClick={() => image3InputRef.current?.click()}
              >
                {uploadStatus.image3.url ? (
                  <div className="w-full h-48 md:h-64 flex items-center justify-center image-preview">
                    <img
                      src={uploadStatus.image3.url}
                      alt="Person 3"
                      className="max-w-full max-h-48 md:max-h-64 object-contain rounded-lg shadow-lg"
                    />
                  </div>
                ) : (
                  <div className="py-8 md:py-12">
                    {uploadStatus.image3.uploading ? (
                      <div className="flex flex-col items-center">
                        <div className="spinner-lg mb-4"></div>
                        <p className="text-gray-600 font-medium">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-3 md:mb-4"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="text-gray-600 text-sm md:text-base">
                          Tap to upload image
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          JPG, PNG or WebP
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
              <input
                ref={image3InputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file, 'image3')
                }}
              />
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-700 font-semibold text-sm md:text-base">
                Custom Prompt (Optional)
              </label>
              <button
                onClick={generatePrompt}
                disabled={(!uploadStatus.image1.url && !uploadStatus.image2.url && !uploadStatus.image3.url) || isGenerating || generatingPrompt}
                className="text-xs md:text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
              >
                {generatingPrompt ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Generate Prompt</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe the scene... (e.g., 'Two friends reuniting at an airport, emotional embrace') or click 'Generate Prompt' for AI suggestions!"
              className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none resize-none text-sm md:text-base"
              rows={3}
              disabled={isGenerating}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {['Emotional reunion', 'Warm embrace', 'Heartfelt hug', 'Joyful moment', 'Tender connection'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    if (!customPrompt.includes(tag.toLowerCase())) {
                      setCustomPrompt(prev => prev ? `${prev}, ${tag.toLowerCase()}` : `Two people sharing a ${tag.toLowerCase()}`)
                    }
                  }}
                  disabled={isGenerating}
                  className="text-xs bg-purple-100 text-purple-700 px-2 md:px-3 py-1 rounded-full hover:bg-purple-200 transition-colors disabled:opacity-50 active:scale-95"
                >
                  + {tag}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Add details like setting, mood, or lighting for better results!
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          )}

          {/* Status Message with Animation */}
          {videoStatus && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 md:p-6 mb-6 slide-in">
              <div className="flex items-start gap-3 mb-3">
                <div className="spinner mt-1"></div>
                <div className="flex-1">
                  <p className="text-blue-600 font-semibold text-sm md:text-base stage-indicator">
                    {videoStatus}
                  </p>
                  {isGenerating && (
                    <div className="mt-3">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '100%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        This usually takes 1-3 minutes...
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {videoId && (
                <div className="mt-4 p-3 bg-white/50 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600">
                    <strong>Video ID:</strong>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
                      {videoId}
                    </code>
                  </p>
                  {!videoUrl && (
                    <button
                      onClick={manualCheckVideo}
                      className="mt-3 w-full md:w-auto text-xs md:text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all active:scale-95"
                    >
                      🔄 Check Video Status Now
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI Info Card */}
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 md:p-6">
            <div className="bg-white rounded-lg p-4 border-2 border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Gemini Nano Banana</h4>
                  <p className="text-xs text-gray-500">Powered by Google AI</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                🖼️ Advanced image-to-image generation - analyzes your uploaded photos and creates a custom hug scene!
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <button
              onClick={handleGenerate}
              disabled={
                (!uploadStatus.image1.url && !uploadStatus.image2.url && !uploadStatus.image3.url) ||
                isGenerating ||
                uploadStatus.image1.uploading ||
                uploadStatus.image2.uploading ||
                uploadStatus.image3.uploading
              }
              className="btn-primary flex-1 touch-manipulation min-h-[52px] text-base sm:text-lg"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner"></div>
                  Generating Your Hug Image...
                </span>
              ) : (
                '✨ Generate Hug Image'
              )}
            </button>
            {(uploadStatus.image1.url || uploadStatus.image2.url) && (
              <button onClick={resetApp} className="btn-secondary w-full sm:w-auto">
                🔄 Reset
              </button>
            )}
          </div>
        </div>

        {/* Image Result with Success Animation */}
        {generatedImageUrl && (
          <div className="card success-check mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎉</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                Your Image is Ready!
              </h2>
            </div>
            <img
              src={generatedImageUrl}
              alt="Generated hug image"
              className="w-full rounded-xl shadow-lg mb-4"
            />
            
                {/* Action Buttons - Primary */}
                <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3">
                  <a
                    href={generatedImageUrl}
                    download="hug-image.png"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95 text-center text-sm md:text-base flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download</span>
                  </a>
                  <a
                    href={generatedImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95 text-center text-sm md:text-base flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View Full</span>
                  </a>
                </div>

                {/* Social Sharing Buttons */}
                <div className="mb-4">
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3">Share to Social Media:</p>
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    {/* Instagram Story */}
                    <button
                      onClick={async () => {
                        // For Instagram, we need to download the image first
                        const response = await fetch(generatedImageUrl)
                        const blob = await response.blob()
                        const file = new File([blob], 'hug-image.png', { type: 'image/png' })
                        
                        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                          try {
                            await navigator.share({
                              title: 'My AI Hug Image',
                              text: 'Check out this AI-generated hug! 💜',
                              files: [file]
                            })
                          } catch (err) {
                            console.log('Share canceled')
                          }
                        } else {
                          // Fallback: open Instagram web (mobile will redirect to app)
                          window.open('https://www.instagram.com/', '_blank')
                          alert('Download the image and share it manually to Instagram!')
                        }
                      }}
                      className="flex flex-col items-center gap-1 p-3 sm:p-4 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all active:scale-95 touch-manipulation min-h-[80px] sm:min-h-[88px]"
                      title="Share to Instagram"
                    >
                      <svg className="w-7 h-7 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span className="text-[10px] font-medium">Instagram</span>
                    </button>

                    {/* Facebook */}
                    <button
                      onClick={() => {
                        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/share/' + imageRecordId)}`
                        window.open(shareUrl, '_blank', 'width=600,height=400')
                      }}
                      className="flex flex-col items-center gap-1 p-3 sm:p-4 bg-[#1877F2] text-white rounded-lg hover:shadow-lg transition-all active:scale-95 touch-manipulation min-h-[80px] sm:min-h-[88px]"
                      title="Share to Facebook"
                    >
                      <svg className="w-7 h-7 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span className="text-[10px] font-medium">Facebook</span>
                    </button>

                    {/* Twitter/X */}
                    <button
                      onClick={() => {
                        const text = 'Check out this AI-generated hug! 💜'
                        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin + '/share/' + imageRecordId)}`
                        window.open(shareUrl, '_blank', 'width=600,height=400')
                      }}
                      className="flex flex-col items-center gap-1 p-3 sm:p-4 bg-black text-white rounded-lg hover:shadow-lg transition-all active:scale-95 touch-manipulation min-h-[80px] sm:min-h-[88px]"
                      title="Share to X (Twitter)"
                    >
                      <svg className="w-7 h-7 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span className="text-[10px] font-medium">X/Twitter</span>
                    </button>

                    {/* WhatsApp */}
                    <button
                      onClick={() => {
                        const text = 'Check out this AI-generated hug! 💜'
                        const shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + window.location.origin + '/share/' + imageRecordId)}`
                        window.open(shareUrl, '_blank')
                      }}
                      className="flex flex-col items-center gap-1 p-3 sm:p-4 bg-[#25D366] text-white rounded-lg hover:shadow-lg transition-all active:scale-95 touch-manipulation min-h-[80px] sm:min-h-[88px]"
                      title="Share to WhatsApp"
                    >
                      <svg className="w-7 h-7 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <span className="text-[10px] font-medium">WhatsApp</span>
                    </button>
                  </div>
                </div>

            {/* Copy Share Link */}
            <button
              onClick={() => {
                const shareUrl = window.location.origin + '/share/' + imageRecordId
                navigator.clipboard.writeText(shareUrl)
                alert('Share link copied to clipboard! 📋\n\n' + shareUrl)
              }}
              className="w-full bg-white text-gray-700 font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 border-2 border-gray-200 flex items-center justify-center gap-2 mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Share Link
            </button>

            {/* Image Info */}
            <div className="p-3 md:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600">
                <strong>✅ Image saved to your gallery!</strong> Generated with Gemini Nano Banana 🍌
              </p>
            </div>
          </div>
        )}

        {/* Video Result with Success Animation */}
        {videoUrl && (
          <div className="card success-check mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎉</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                Your Video is Ready!
              </h2>
            </div>
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              playsInline
              className="w-full rounded-xl shadow-lg mb-4"
            >
              Your browser does not support the video tag.
            </video>
            
            {/* Action Buttons with Icons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 mb-4">
              <a
                href={videoUrl}
                download="hug-video.mp4"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2.5 md:py-3 px-3 md:px-4 rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95 text-center text-sm md:text-base flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </a>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Hug Video',
                      text: 'Check out this AI-generated hug video!',
                      url: videoUrl,
                    }).catch(err => console.log('Share failed:', err))
                  } else {
                    navigator.clipboard.writeText(videoUrl)
                    alert('Link copied to clipboard!')
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-2.5 md:py-3 px-3 md:px-4 rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95 text-center text-sm md:text-base flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-gray-700 font-semibold py-2.5 md:py-3 px-3 md:px-4 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 border-2 border-gray-200 text-center text-sm md:text-base flex items-center justify-center gap-2 col-span-2 sm:col-span-1"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Open</span>
              </a>
            </div>

            {/* Video URL Info */}
            <div className="p-3 md:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg mb-4">
              <p className="text-xs md:text-sm text-gray-600 mb-2">
                <strong>✅ Video saved to your gallery!</strong>
              </p>
              <p className="text-xs text-gray-500">
                <strong>URL:</strong>{' '}
                <a 
                  href={videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {videoUrl}
                </a>
              </p>
            </div>

            {/* Create Another Button */}
            <button
              onClick={resetApp}
              className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>✨</span>
              <span>Create Another Video</span>
            </button>
          </div>
        )}

        {/* Galleries - Separate for Images and Videos */}
        <div className="mb-12 space-y-8">
          {generationMode === 'image' ? (
            <ImageGallery key={generatedImageUrl || 'image-gallery'} />
          ) : (
            <VideoGallery key={videoUrl || 'video-gallery'} />
          )}
        </div>
      </div>

      {/* Pricing Modal */}
      {showPricingModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setShowPricingModal(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
            <div className="bg-white rounded-t-3xl shadow-2xl max-w-4xl mx-auto p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="text-center mb-4 sm:mb-6">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="flex-1"></div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent px-2">
                    Choose Your Plan 🎨
                  </h2>
                  <button
                    onClick={() => setShowPricingModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 -mr-2 touch-manipulation"
                    aria-label="Close"
                  >
                    <svg className="w-7 h-7 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600 text-sm sm:text-base px-2">
                  Select the perfect package for your AI hug creations
                </p>
              </div>

              {/* Pricing Tiers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {/* Tier 1 - 1 Photo */}
                <button
                  onClick={() => handleSelectTier('1photo')}
                  className={`group relative bg-gradient-to-br from-purple-50 to-pink-50 border-2 rounded-2xl p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all active:scale-95 touch-manipulation ${
                    selectedTier === '1photo' 
                      ? 'border-purple-600 shadow-xl ring-2 ring-purple-400' 
                      : 'border-purple-200 hover:border-purple-400'
                  }`}
                >
                  {selectedTier === '1photo' ? (
                    <div className="absolute top-4 right-4 transition-opacity">
                      <div className="bg-green-500 text-white rounded-full p-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-2xl">✨</span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="text-4xl mb-3">🖼️</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Starter</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        $2.99
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span>1 AI-Generated Image</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span>High Resolution</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span>Instant Download</span>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      Perfect for trying it out!
                    </div>
                  </div>
                </button>

                {/* Tier 2 - 3 Photos (POPULAR) */}
                <button
                  onClick={() => handleSelectTier('3photos')}
                  className={`group relative bg-gradient-to-br from-purple-100 to-pink-100 border-2 rounded-2xl p-4 sm:p-5 md:p-6 hover:shadow-2xl transition-all active:scale-95 touch-manipulation transform md:scale-105 ${
                    selectedTier === '3photos'
                      ? 'border-purple-600 shadow-2xl ring-2 ring-purple-400'
                      : 'border-purple-400 hover:border-purple-500'
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                  
                  {selectedTier === '3photos' ? (
                    <div className="absolute top-4 right-4 transition-opacity">
                      <div className="bg-green-500 text-white rounded-full p-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-2xl">🔥</span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="text-4xl mb-3">🎨</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Popular</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        $3.99
                      </span>
                      <div className="text-xs text-green-600 font-semibold mt-1">Save 33%!</div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="font-semibold">3 AI-Generated Images</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span>High Resolution</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span>Priority Processing</span>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      Best value for most users!
                    </div>
                  </div>
                </button>

                {/* Tier 3 - 5 Photos */}
                <button
                  onClick={() => handleSelectTier('5photos')}
                  className={`group relative bg-gradient-to-br from-purple-50 to-pink-50 border-2 rounded-2xl p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all active:scale-95 touch-manipulation ${
                    selectedTier === '5photos'
                      ? 'border-purple-600 shadow-xl ring-2 ring-purple-400'
                      : 'border-purple-200 hover:border-purple-400'
                  }`}
                >
                  {selectedTier === '5photos' ? (
                    <div className="absolute top-4 right-4 transition-opacity">
                      <div className="bg-green-500 text-white rounded-full p-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-2xl">💎</span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="text-4xl mb-3">🌟</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Pro</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        $4.99
                      </span>
                      <div className="text-xs text-green-600 font-semibold mt-1">Save 44%!</div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="font-semibold">5 AI-Generated Images</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span>High Resolution</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span>Premium Support</span>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      Maximum creativity unleashed!
                    </div>
                  </div>
                </button>
              </div>

              {/* Pay Button */}
              <div className="mb-4 sm:mb-6 sticky bottom-0 bg-white pt-2 pb-1 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 border-t border-gray-100">
                <button
                  onClick={handlePayment}
                  disabled={!selectedTier}
                  className={`w-full py-4 sm:py-5 px-6 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all touch-manipulation ${
                    selectedTier
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl active:scale-95 cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {selectedTier ? (
                    <span className="flex items-center justify-center gap-2 sm:gap-3">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                      <span>Pay {selectedTier === '1photo' ? '$2.99' : selectedTier === '3photos' ? '$3.99' : '$4.99'} & Generate</span>
                    </span>
                  ) : (
                    <span className="text-base sm:text-lg">Select a plan above</span>
                  )}
                </button>
                {selectedTier && (
                  <p className="text-xs sm:text-sm text-center text-gray-500 mt-2">
                    ✨ Your image will be generated immediately after payment
                  </p>
                )}
              </div>

              {/* Trust Badges */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-6 flex-wrap text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    <span>Instant Delivery</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                    </svg>
                    <span>Fast Processing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  )
}

