import type { MetadataRoute } from 'next'

const BASE = 'https://job-hunt-dashboard-xi.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}
