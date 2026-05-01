import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Job Hunt CRM: case study',
  description:
    'A Google Workspace CRM for tracking a job hunt with Anthropic prompt caching. Built and dogfooded by Angel Agutaya.',
  authors: [{ name: 'Angel Agutaya' }],
  openGraph: {
    title: 'Job Hunt CRM: case study',
    description:
      'A Google Workspace CRM for tracking a job hunt with Anthropic prompt caching. Built and dogfooded.',
    type: 'article',
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
