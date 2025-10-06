'use client'

import { useState, useEffect } from 'react'

type Image = {
  id: string
  prompt: string
  status: string
  provider: string
  image_url: string | null
  generation_id: string | null
  created_at: string
  image1_url: string
  image2_url: string
}

export default function ImageGallery() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/list-images')
      const data = await response.json()

      if (data.success) {
        setImages(data.images)
      }
    } catch (error) {
      console.error('Failed to load images:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, imageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(imageId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareImage = (image: Image) => {
    if (navigator.share && image.image_url) {
      navigator
        .share({
          title: 'Check out my AI-generated hug image!',
          text: `I created this image with AI: ${image.prompt}`,
          url: image.image_url,
        })
        .catch((err) => console.error('Share failed:', err))
    } else if (image.image_url) {
      copyToClipboard(image.image_url, image.id)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
      case 'queued':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'bg-purple-100 text-purple-700'
      case 'gemini':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="spinner-lg"></div>
          <p className="ml-4 text-gray-600">Loading images...</p>
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">🖼️</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No Images Yet
        </h3>
        <p className="text-gray-600">
          Generate your first hug image to see it here!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Your Image Gallery 🖼️
          </h2>
        </div>
        <button
          onClick={loadImages}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            onClick={() => setSelectedImage(image)}
            className="video-card cursor-pointer"
          >
            {/* Status and Provider Badges */}
            <div className="flex items-center justify-between mb-3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  image.status
                )}`}
              >
                {image.status}
              </span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getProviderBadge(image.provider)}`}>
                  {image.provider === 'openai' ? '🤖 OpenAI' : '🎨 Gemini'}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(image.created_at)}
                </span>
              </div>
            </div>

            {/* Image Preview */}
            {image.image_url && image.status === 'completed' ? (
              <div className="relative mb-3 rounded-lg overflow-hidden bg-black">
                <img
                  src={image.image_url}
                  alt={image.prompt}
                  className="w-full h-48 object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                <span className="text-gray-400 text-4xl">
                  {image.status === 'processing' || image.status === 'queued'
                    ? '⏳'
                    : '🖼️'}
                </span>
              </div>
            )}

            {/* Prompt */}
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {image.prompt}
            </p>

            {/* Action Buttons */}
            {image.image_url && image.status === 'completed' && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(image.image_url!, '_blank')
                  }}
                  className="flex-1 min-w-[70px] text-xs bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>View</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const link = document.createElement('a')
                    link.href = image.image_url!
                    link.download = `hug-image-${image.id}.png`
                    link.click()
                  }}
                  className="flex-1 min-w-[70px] text-xs bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Get</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    shareImage(image)
                  }}
                  className="flex-1 min-w-[70px] text-xs bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {copiedId === image.id ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Done</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Image Detail Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  Image Details
                </h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Image */}
              {selectedImage.image_url &&
              selectedImage.status === 'completed' ? (
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.prompt}
                  className="w-full rounded-xl mb-4"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center mb-4">
                  <div className="text-center">
                    <p className="text-gray-500 text-xl mb-2">
                      {selectedImage.status === 'processing' ||
                      selectedImage.status === 'queued'
                        ? '⏳ Image is still processing...'
                        : '❌ Image not available'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Status: {selectedImage.status}
                    </p>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Created:</strong>{' '}
                  {formatDate(selectedImage.created_at)}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Prompt:</strong> {selectedImage.prompt}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Provider:</strong>{' '}
                  <span
                    className={`px-2 py-1 rounded ${getProviderBadge(
                      selectedImage.provider
                    )}`}
                  >
                    {selectedImage.provider === 'openai' ? 'OpenAI' : 'Gemini'}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong>{' '}
                  <span
                    className={`px-2 py-1 rounded ${getStatusColor(
                      selectedImage.status
                    )}`}
                  >
                    {selectedImage.status}
                  </span>
                </p>
                {selectedImage.generation_id && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Generation ID:</strong>{' '}
                    <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                      {selectedImage.generation_id}
                    </code>
                  </p>
                )}
              </div>

              {/* Actions */}
              {selectedImage.image_url &&
                selectedImage.status === 'completed' && (
                  <div className="flex gap-3">
                    <a
                      href={selectedImage.image_url}
                      download={`hug-image-${selectedImage.id}.png`}
                      className="flex-1 btn-primary text-center flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download Image</span>
                    </a>
                    <button
                      onClick={() => shareImage(selectedImage)}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2"
                    >
                      {copiedId === selectedImage.id ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          <span>Share Image</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

