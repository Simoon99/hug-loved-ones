'use client'

import { useState, useEffect } from 'react'

type Video = {
  id: string
  prompt: string
  status: string
  video_url: string | null
  video_id: string | null
  created_at: string
  image1_url: string
  image2_url: string
}

export default function VideoGallery() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/list-videos')
      const data = await response.json()

      if (data.success) {
        setVideos(data.videos)
      }
    } catch (error) {
      console.error('Failed to load videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, videoId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(videoId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareVideo = (video: Video) => {
    if (navigator.share && video.video_url) {
      navigator
        .share({
          title: 'Check out my AI-generated hug video!',
          text: `I created this video with AI: ${video.prompt}`,
          url: video.video_url,
        })
        .catch((err) => console.error('Share failed:', err))
    } else if (video.video_url) {
      copyToClipboard(video.video_url, video.id)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
      case 'queued':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Your Video Gallery 🎬
        </h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Your Video Gallery 🎬
        </h2>
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No videos yet!</p>
          <p className="text-sm mt-2">
            Scroll down to upload two images and generate your first hug video.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Your Video Gallery 🎬
        </h2>
        <button
          onClick={loadVideos}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="video-card bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 shadow-md cursor-pointer"
            onClick={() => setSelectedVideo(video)}
          >
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusColor(
                  video.status
                )}`}
              >
                {video.status}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(video.created_at)}
              </span>
            </div>

            {/* Video Preview or Placeholder */}
            {video.video_url && video.status === 'completed' ? (
              <div className="relative mb-3 rounded-lg overflow-hidden bg-black">
                <video
                  src={video.video_url}
                  className="w-full h-40 object-cover"
                  muted
                  loop
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause()
                    e.currentTarget.currentTime = 0
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                <span className="text-gray-400 text-4xl">
                  {video.status === 'processing' || video.status === 'queued'
                    ? '⏳'
                    : '🎬'}
                </span>
              </div>
            )}

            {/* Prompt */}
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {video.prompt}
            </p>

            {/* Action Buttons */}
            {video.video_url && video.status === 'completed' && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(video.video_url!, '_blank')
                  }}
                  className="flex-1 min-w-[70px] text-xs bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Watch</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const link = document.createElement('a')
                    link.href = video.video_url!
                    link.download = `hug-video-${video.id}.mp4`
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
                    shareVideo(video)
                  }}
                  className="flex-1 min-w-[70px] text-xs bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {copiedId === video.id ? (
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

      {/* Video Detail Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  Video Details
                </h3>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Video Player */}
              {selectedVideo.video_url &&
              selectedVideo.status === 'completed' ? (
                <video
                  src={selectedVideo.video_url}
                  controls
                  autoPlay
                  loop
                  className="w-full rounded-xl mb-4"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center mb-4">
                  <div className="text-center">
                    <p className="text-gray-500 text-xl mb-2">
                      {selectedVideo.status === 'processing' ||
                      selectedVideo.status === 'queued'
                        ? '⏳ Video is still processing...'
                        : '❌ Video not available'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Status: {selectedVideo.status}
                    </p>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Created:</strong>{' '}
                  {formatDate(selectedVideo.created_at)}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Prompt:</strong> {selectedVideo.prompt}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong>{' '}
                  <span
                    className={`px-2 py-1 rounded ${getStatusColor(
                      selectedVideo.status
                    )}`}
                  >
                    {selectedVideo.status}
                  </span>
                </p>
                {selectedVideo.video_id && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Video ID:</strong>{' '}
                    <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                      {selectedVideo.video_id}
                    </code>
                  </p>
                )}
              </div>

              {/* Actions with Icon Buttons */}
              {selectedVideo.video_url &&
                selectedVideo.status === 'completed' && (
                  <div className="flex gap-3">
                    <a
                      href={selectedVideo.video_url}
                      download={`hug-video-${selectedVideo.id}.mp4`}
                      className="flex-1 btn-primary text-center flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download Video</span>
                    </a>
                    <button
                      onClick={() => shareVideo(selectedVideo)}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2"
                    >
                      {copiedId === selectedVideo.id ? (
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
                          <span>Share Video</span>
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

