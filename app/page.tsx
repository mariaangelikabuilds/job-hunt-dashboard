import type { Metadata } from 'next'
import { getDashboardStats } from './lib/stats'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Job Hunt CRM: case study',
}

export default async function Page() {
  const stats = await getDashboardStats()
  const seeded = stats.source === 'seed'

  return (
    <main>
      <p className="byline">
        <a href="https://github.com/mariaangelikabuilds">Angel Agutaya</a>
        {'  '}/{'  '}Product Design Engineer
      </p>

      <h1>
        A Google Workspace CRM for tracking my own job hunt, scored by Claude.
      </h1>

      <p className="lede">
        Apps Script, Sheets, Gmail, Drive, Calendar, a sidebar, a mobile PWA, a
        Slack slash command, and prompt caching against my master resume in a
        Drive Doc. Built and dogfooded against my actual applications. The
        numbers below come from real use.
      </p>

      <div className="actions">
        <a
          className="cta"
          href="https://github.com/mariaangelikabuilds/job-hunt-crm"
        >
          View source on GitHub
        </a>
        <a className="cta cta-secondary" href="#how-it-works">
          How it works
        </a>
      </div>

      <hr />

      <section aria-labelledby="numbers">
        <h2 id="numbers">The numbers</h2>
        <div className="stats">
          <Stat
            value={stats.applications_tracked}
            label="Applications tracked"
          />
          <Stat
            value={stats.cache_hit_rate_pct}
            unit="%"
            label="Prompt-cache hit rate"
            note={
              stats.score_calls_last_30d <= 1
                ? 'First call cold-misses, subsequent calls hit'
                : `Across ${stats.score_calls_last_30d} score calls`
            }
          />
          <Stat
            value={stats.avg_fit_score == null ? 'n/a' : stats.avg_fit_score}
            unit={stats.avg_fit_score == null ? undefined : '/100'}
            label="Avg fit score"
            note={`${stats.score_calls_last_30d} score calls, last 30d`}
          />
        </div>
        {seeded ? (
          <p className="note" style={{ marginTop: '1.25rem' }}>
            Live data hookup is wired but disabled until I publish the read-only
            service-account credential. The values above are seeded placeholders
            from my own usage so far. The latest will appear here once the cron
            is on.
          </p>
        ) : (
          <p className="note" style={{ marginTop: '1.25rem' }}>
            Live, refreshed every hour from the Activity log of my running CRM.
            Last refresh:{' '}
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {stats.last_refresh}
            </span>
            .
          </p>
        )}
      </section>

      <section id="how-it-works" aria-labelledby="how-it-works-h">
        <h2 id="how-it-works-h">How it works</h2>
        <p>
          Every application is a row on the <strong>Applications</strong> tab.
          Pasting a JD and clicking <em>Score</em> in the sidebar sends the JD
          plus my master resume to <code>claude-opus-4-7</code>, returns a 0-100
          fit score, three opinionated cover-letter angles, red flags, and a
          rationale. The resume body is the cache anchor: same bytes every call,
          so the prefix cache hits at roughly 10% of full input cost on every
          call after the first.
        </p>
        <p>
          Beyond scoring: a tailored resume and cover letter are generated per
          application with anti-fabrication rules (no skills, metrics, or roles
          not in the master). A daily nudge surfaces follow-ups stuck on{' '}
          <em>Applied</em>. A Slack slash command lets me log a new application
          from any channel. A vector-similarity search over past applications
          surfaces lookalikes for resume reuse.
        </p>
        <pre className="diagram" aria-hidden="true">
{`Google Sheet                       Apps Script project
+----------------+                 +-------------------------+
| Applications   |  <-- writes --  | Code.gs (orchestration) |
| Analytics      |                 | Claude.gs (API client)  |
| Activity (log) |                 | Resume.gs (Drive cache) |
+----------------+                 | ResumeGen + CoverLetter |
        ^                          | InterviewPrep / Scraper |
        |                          | Gmail / Drive / Calendar|
        | reads/writes             | Embeddings (OpenAI)     |
        v                          | Slack (webhook + slash) |
+----------------+                 +-------------------------+
| Sidebar.html   |                          |
| MobileApp PWA  |                          v
+----------------+                 +-------------------------+
                                   | api.anthropic.com       |
                                   | claude-opus-4-7         |
                                   | adaptive thinking       |
                                   | prompt caching enabled  |
                                   +-------------------------+`}
        </pre>
      </section>

      <section aria-labelledby="design">
        <h2 id="design">Design choices that aren't AI-default</h2>
        <p>
          The sidebar, the mobile app, and this page all share the same visual
          language: system font stack (no Inter, no Geist), one accent color
          (deep teal <code>#2D5266</code>), one corner radius (4px), no
          gradients, no stacked shadows, no emoji headers. Skeleton loading
          instead of spinners. Empty states tell you what to do next instead of
          saying <em>No items yet</em>.
        </p>
        <p>
          Every cover-letter prompt is constrained at the system level: no{' '}
          <em>Spearheaded</em>, no <em>Synergized</em>, no <em>I am writing to
          apply</em>, no <em>Thank you for your consideration</em>. Tailored
          resumes refuse to invent skills or metrics not in the master; they
          emit <code>GAP:</code> notes I review by hand. This is the part most
          AI-generated resumes get wrong, and the part recruiters can spot at
          thirty paces.
        </p>
      </section>

      <section aria-labelledby="stack">
        <h2 id="stack">Stack and scope</h2>
        <dl className="kv">
          <dt>Backend</dt>
          <dd>
            Apps Script V8, no npm. UrlFetchApp to{' '}
            <code>api.anthropic.com</code>. Resume cached in CacheService for
            6h. Locks via LockService.
          </dd>
          <dt>Storage</dt>
          <dd>
            Three-tab Sheet. Embeddings stored as base64-packed Float32 in a
            hidden column. Audit log on every Claude call.
          </dd>
          <dt>UX surfaces</dt>
          <dd>
            HtmlService sidebar (in-Sheet), Web App PWA (mobile), Slack slash
            command, Gmail.
          </dd>
          <dt>Models</dt>
          <dd>
            <code>claude-opus-4-7</code> for scoring, extraction, tailoring,
            cover letters, interview prep. <code>text-embedding-3-small</code>{' '}
            for similarity search.
          </dd>
          <dt>Privacy</dt>
          <dd>
            Sheet, Drive, Activity log all in my own Google account. API key in
            Script Properties. Public repo excludes IDs and keys.
          </dd>
        </dl>
      </section>

      <section aria-labelledby="repo">
        <h2 id="repo">Repo and template</h2>
        <p>
          Source is public at{' '}
          <a href="https://github.com/mariaangelikabuilds/job-hunt-crm">
            github.com/mariaangelikabuilds/job-hunt-crm
          </a>
          . Install steps, OAuth scopes, mobile and Slack deployment, and a
          one-click <em>Make a copy</em> link for forks are in the README.
        </p>
        <div className="actions">
          <a
            className="cta"
            href="https://github.com/mariaangelikabuilds/job-hunt-crm"
          >
            github.com/mariaangelikabuilds/job-hunt-crm
          </a>
        </div>
      </section>

      <footer>
        Built by{' '}
        <a href="https://github.com/mariaangelikabuilds">Angel Agutaya</a>.
        Hosted on Vercel. No analytics, no cookies, no tracking scripts on this
        page.
      </footer>
    </main>
  )
}

function Stat({
  value,
  unit,
  label,
  note,
}: {
  value: string | number
  unit?: string
  label: string
  note?: string
}) {
  return (
    <div className="stat">
      <div>
        <span className="stat-value">{value}</span>
        {unit ? <span className="stat-unit">{unit}</span> : null}
      </div>
      <div className="stat-label">{label}</div>
      {note ? <div className="stat-note">{note}</div> : null}
    </div>
  )
}
