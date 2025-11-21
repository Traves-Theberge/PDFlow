import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PDFlow - AI-Powered PDF Extraction',
  description: 'Transform PDFs into structured data using multimodal AI. Extract content to Markdown, JSON, XML, YAML, HTML, CSV, and more.',
  openGraph: {
    title: 'PDFlow - AI-Powered PDF Extraction',
    description: 'Transform PDFs into structured data using multimodal AI. Extract content to Markdown, JSON, XML, YAML, HTML, CSV, and more.',
    url: 'https://pdflow.vercel.app',
    siteName: 'PDFlow',
    images: [
      {
        url: '/PDFlow_Logo_W_Text.png',
        width: 1200,
        height: 630,
        alt: 'PDFlow Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDFlow - AI-Powered PDF Extraction',
    description: 'Transform PDFs into structured data using multimodal AI',
    images: ['/PDFlow_Logo_W_Text.png'],
  },
  metadataBase: new URL('https://pdflow.vercel.app'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  )
}