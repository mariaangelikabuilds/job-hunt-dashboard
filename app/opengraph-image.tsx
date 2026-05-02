import { ImageResponse } from 'next/og'

export const alt = 'Job Hunt CRM: case study'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function loadGoogleFont(family: string, weight: number) {
  const familyParam = family.replace(/ /g, '+')
  const url = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weight}&display=swap`
  const css = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  }).then((r) => r.text())
  const match = css.match(/src: url\((https?:\/\/[^)]+)\) format\('(?:woff2|truetype)'\)/)
  if (!match?.[1]) throw new Error('font URL not found in CSS for ' + family + ' ' + weight)
  return await fetch(match[1]).then((r) => r.arrayBuffer())
}

export default async function Image() {
  const [serif400, serif600] = await Promise.all([
    loadGoogleFont('Source Serif 4', 400),
    loadGoogleFont('Source Serif 4', 600),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#F8F8F6',
          color: '#1F2421',
          padding: '72px 80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'Source Serif 4',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 20,
            color: '#6B6F6C',
            letterSpacing: 6,
            textTransform: 'uppercase',
            fontWeight: 400,
          }}
        >
          Case study
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 80,
              lineHeight: 1.08,
              fontWeight: 600,
              letterSpacing: -1.2,
              maxWidth: 1000,
            }}
          >
            A Google Workspace CRM for tracking my own job hunt, scored by Claude.
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 26,
              lineHeight: 1.45,
              color: '#6B6F6C',
              fontWeight: 400,
              maxWidth: 880,
            }}
          >
            Apps Script, Sheets, Gmail, Drive, Calendar, a sidebar, a mobile PWA, prompt caching against my master resume.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            fontSize: 22,
            color: '#1F2421',
            fontWeight: 400,
            borderTop: '1px solid #D8D6D0',
            paddingTop: 28,
          }}
        >
          <div style={{ display: 'flex' }}>
            <span style={{ color: '#1F2421' }}>Angel Agutaya</span>
            <span style={{ color: '#2D5266', margin: '0 12px' }}>·</span>
            <span style={{ color: '#6B6F6C' }}>Product Design Engineer</span>
          </div>
          <div style={{ display: 'flex', color: '#6B6F6C' }}>
            job-hunt-dashboard-xi.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Source Serif 4', data: serif400, weight: 400, style: 'normal' },
        { name: 'Source Serif 4', data: serif600, weight: 600, style: 'normal' },
      ],
    },
  )
}
