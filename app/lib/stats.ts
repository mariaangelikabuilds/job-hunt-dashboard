export type DashboardStats = {
  applications_tracked: number
  cache_hit_rate_pct: number
  monthly_spend_usd_str: string
  avg_score_latency_seconds: number
  score_calls_last_30d: number
  last_refresh: string
  source: 'seed' | 'sheet'
}

const SEED: DashboardStats = {
  applications_tracked: 0,
  cache_hit_rate_pct: 0,
  monthly_spend_usd_str: '0.00',
  avg_score_latency_seconds: 0,
  score_calls_last_30d: 0,
  last_refresh: 'not yet wired',
  source: 'seed',
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const sheetId = process.env.GOOGLE_SHEET_ID
  const saEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const saKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  if (!sheetId || !saEmail || !saKey) return SEED

  return SEED
}
