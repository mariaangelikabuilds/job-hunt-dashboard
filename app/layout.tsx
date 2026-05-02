import type { Metadata } from 'next'
import './globals.css'

const SITE_URL = 'https://job-hunt-dashboard-xi.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Job Hunt CRM: case study',
  description:
    'A Google Workspace CRM for tracking a job hunt with Anthropic prompt caching. Built and dogfooded by Angel Agutaya.',
  authors: [{ name: 'Angel Agutaya' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Job Hunt CRM: case study',
    description:
      'A Google Workspace CRM for tracking a job hunt with Anthropic prompt caching. Built and dogfooded.',
    type: 'article',
    url: SITE_URL,
    siteName: 'Angel Agutaya',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Job Hunt CRM: case study',
    description:
      'A Google Workspace CRM for tracking a job hunt with Anthropic prompt caching. Built and dogfooded.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
