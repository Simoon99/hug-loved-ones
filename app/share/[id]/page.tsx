import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
const supabase = createClient(supabaseUrl, supabaseKey)

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params

  try {
    // Fetch image data from database
    const { data: image, error } = await supabase
      .from('images')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !image) {
      return {
        title: 'Image Not Found',
      }
    }

    // Generate a signed URL for the image
    const { data: signedUrlData } = await supabase.storage
      .from('hug-images')
      .createSignedUrl(image.image_url.split('/').pop()!, 60 * 60 * 24 * 7) // 7 days

    const imageUrl = signedUrlData?.signedUrl || ''

    return {
      title: 'AI-Generated Hug Image 💜',
      description: 'Check out this beautiful AI-generated hug image created with Gemini Nano Banana! Create your own at huglovedones.com',
      openGraph: {
        title: 'AI-Generated Hug Image 💜',
        description: 'Check out this beautiful AI-generated hug image created with Gemini Nano Banana!',
        images: [
          {
            url: imageUrl,
            width: 1024,
            height: 1024,
            alt: 'AI-Generated Hug Image',
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'AI-Generated Hug Image 💜',
        description: 'Check out this beautiful AI-generated hug image created with Gemini Nano Banana!',
        images: [imageUrl],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'AI-Generated Hug Image',
    }
  }
}

export default async function SharePage({ params }: PageProps) {
  const { id } = params

  try {
    // Fetch image data from database
    const { data: image, error } = await supabase
      .from('images')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !image) {
      notFound()
    }

    // Generate a signed URL for the image
    const { data: signedUrlData } = await supabase.storage
      .from('hug-images')
      .createSignedUrl(image.image_url.split('/').pop()!, 60 * 60 * 24 * 7) // 7 days

    const imageUrl = signedUrlData?.signedUrl || ''

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
              AI-Generated Hug Image 💜
            </h1>
            <p className="text-lg text-gray-700 mb-2">
              Created with <strong>Gemini Nano Banana</strong> 🍌
            </p>
          </div>

          {/* Image Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8">
            <div className="relative w-full aspect-square mb-6">
              <img
                src={imageUrl}
                alt="AI-Generated Hug"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <a
                href={imageUrl}
                download="hug-image.png"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-center flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
              <a
                href="/"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-center flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your Own
              </a>
            </div>

            {/* Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 text-center">
                ✨ Created on {new Date(image.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-xs text-gray-500 text-center mt-2">
                Powered by Google&apos;s Gemini 2.5 Flash Image (Nano Banana) 🍌
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Create Your Own AI Hug! 🤗
            </h2>
            <p className="text-gray-600 mb-6">
              Upload photos of your loved ones and let AI create a beautiful hug scene
            </p>
            <a
              href="/"
              className="inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-2xl transition-all active:scale-95 text-lg"
            >
              Get Started - It&apos;s Free! 🎨
            </a>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading share page:', error)
    notFound()
  }
}

