import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cn } from '~/utils'
import './globals.css'
import { Providers } from './provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://codebegen.com'),
  title: {
    default: 'CodeBEGen ',
    template: 'CodeBEGen | %s',
  },
  description:
    'Seamlessly build, deploy and test backend functionalities with AI-powered assistance, optimized for speed and efficiency.',
  keywords: [
    'AI tools for backend development',
    'Cloud based backend services',
    'Automated backend workflows',
    'Database integration',
    'Backend debugging tools',
  ],
  authors: [{ name: 'Shia Inc' }],
  creator: ' Tech Fam',
  publisher: ' Tech Fam',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://codebegen.com',
    siteName: 'CodeBEGen',
    title: 'CodeBEGen',
    description:
      'Seamlessly build, deploy and test backend functionalities with AI-powered assistance, optimized for speed and efficiency.',
    images: [
      {
        url: 'https://res.cloudinary.com/djrp3aaq9/image/upload/v1741469604/Backend.IM_qtx8c6.png',
        width: 1200,
        height: 630,
        alt: 'CodeBEGen',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeBEGen',
    description:
      'Seamlessly build, deploy and test backend functionalities with AI-powered assistance, optimized for speed and efficiency.',
    creator: '@hetty',
    images: [
      'https://res.cloudinary.com/djrp3aaq9/image/upload/v1741469604/Backend.IM_qtx8c6.png',
    ],
  },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/icon.png', type: 'image/png' }],
    apple: [
      { url: '/apple-icon.png' },
      { url: '/apple-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/apple-icon-114x114.png', sizes: '114x114', type: 'image/png' },
    ],
  },
  applicationName: 'CodeBEGen',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'mx-auto antialiased')}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
