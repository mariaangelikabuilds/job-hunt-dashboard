import { JWT } from 'google-auth-library'

export type DashboardStats = {
  applications_tracked: number
  cache_hit_rate_pct: number
  avg_fit_score: number | null
  score_calls_last_30d: number
  last_refresh: string
  source: 'seed' | 'sheet'
}

const SEED: DashboardStats = {
  applications_tracked: 0,
  cache_hit_rate_pct: 0,
  avg_fit_score: null,
  score_calls_last_30d: 0,
  last_refresh: 'not yet wired',
  source: 'seed',
}

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly'

export async function getDashboardStats(): Promise<DashboardStats> {
  const sheetId = process.env.GOOGLE_SHEET_ID
  const saEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const saKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  if (!sheetId || !saEmail || !saKeyRaw) return SEED

  const saKey = saKeyRaw.replace(/\\n/g, '\n')

  try {
    const client = new JWT({
      email: saEmail,
      key: saKey,
      scopes: [SCOPE],
    })
    await client.authorize()

    const ranges = [
      'Applications!A2:H',
      'Activity!A2:I',
    ]
    const url =
      `${SHEETS_BASE}/${encodeURIComponent(sheetId)}/values:batchGet?` +
      ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join('&') +
      '&majorDimension=ROWS&valueRenderOption=UNFORMATTED_VALUE'

    const headers = await client.getRequestHeaders()
    const res = await fetch(url, { headers })
    if (!res.ok) {
      console.error('sheets read failed', res.status, await res.text())
      return SEED
    }
    const body = (await res.json()) as {
      valueRanges: Array<{ range: string; values?: unknown[][] }>
    }

    const apps = body.valueRanges[0]?.values ?? []
    const activity = body.valueRanges[1]?.values ?? []

    const applications_tracked = apps.filter(
      (r) => r[0] !== '' && r[0] != null,
    ).length

    let fitSum = 0
    let fitCount = 0
    for (const r of apps) {
      const fit = r[7]
      if (typeof fit === 'number' && Number.isFinite(fit)) {
        fitSum += fit
        fitCount += 1
      }
    }
    const avg_fit_score = fitCount > 0 ? Math.round(fitSum / fitCount) : null

    let totalInput = 0
    let totalCacheRead = 0
    let scoreCallsLast30 = 0
    const cutoff = Date.now() - 30 * 24 * 3600 * 1000

    for (const row of activity) {
      const [timestamp, action, , inputTok, cacheReadTok] = row as [
        string | number,
        string,
        string,
        number,
        number,
      ]
      totalInput += numOr0(inputTok)
      totalCacheRead += numOr0(cacheReadTok)

      const ts = parseTs(timestamp)
      if (ts != null && ts >= cutoff) {
        if (typeof action === 'string' && action.toLowerCase().startsWith('score')) {
          scoreCallsLast30 += 1
        }
      }
    }

    const denom = totalInput + totalCacheRead
    const cache_hit_rate_pct =
      denom > 0 ? Math.round((totalCacheRead / denom) * 100) : 0

    return {
      applications_tracked,
      cache_hit_rate_pct,
      avg_fit_score,
      score_calls_last_30d: scoreCallsLast30,
      last_refresh: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      source: 'sheet',
    }
  } catch (err) {
    console.error('stats: live read failed, falling back to seed', err)
    return SEED
  }
}

function numOr0(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

function parseTs(v: unknown): number | null {
  if (typeof v === 'number') {
    const ms = (v - 25569) * 86400 * 1000
    return Number.isFinite(ms) ? ms : null
  }
  if (typeof v === 'string') {
    const t = Date.parse(v)
    return Number.isFinite(t) ? t : null
  }
  return null
}
