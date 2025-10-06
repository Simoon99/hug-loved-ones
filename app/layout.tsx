import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Hug Generator - Create & Share Beautiful Hug Images',
  description: 'Upload photos and create beautiful AI-generated hug scenes with Gemini Nano Banana. Share to Instagram, Facebook & more!',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: '#a855f7',
  openGraph: {
    title: 'AI Hug Generator',
    description: 'Create beautiful AI-generated hug images and share them with loved ones',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Hug Generator',
    description: 'Create beautiful AI-generated hug images and share them with loved ones',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

