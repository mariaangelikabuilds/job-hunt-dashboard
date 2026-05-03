import type { Metadata } from 'next'
import { getDashboardStats } from './lib/stats'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Job Hunt CRM: case study',
}

export default async function Page() {
  const stats = await getDashboardStats()
  const seeded = stats.source === 'seed'

  const heroValue = stats.avg_fit_score == null ? 'n/a' : stats.avg_fit_score
  const heroUnit = stats.avg_fit_score == null ? undefined : '/100'

  return (
    <main>
      <p className="eyebrow">Case study</p>

      <h1>
        A Google Workspace CRM for tracking my own job hunt, scored by Claude.
      </h1>

      <p className="lede">
        Apps Script, Sheets, Gmail, Drive, Calendar, a sidebar, a mobile PWA,
        and prompt caching against my master resume in a Drive Doc. Built and
        dogfooded against my actual applications.
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

      <section aria-labelledby="numbers">
        <h2 id="numbers">Live numbers</h2>
        <div className="stats">
          <div className="stat-hero">
            <div>
              <span className="stat-value">{heroValue}</span>
              {heroUnit ? <span className="stat-unit">{heroUnit}</span> : null}
            </div>
            <div className="stat-label">Average fit score</div>
            <div className="stat-note">
              {stats.score_calls_last_30d <= 1
                ? `${stats.score_calls_last_30d} score call so far. Will move as more JDs run through.`
                : `Across ${stats.score_calls_last_30d} score calls in the last 30 days.`}
            </div>
          </div>
          <div className="stat-secondary">
            <div className="stat-small">
              <div>
                <span className="stat-value">{stats.applications_tracked}</span>
              </div>
              <div className="stat-label">Applications tracked</div>
            </div>
            <div className="stat-small">
              <div>
                <span className="stat-value">{stats.cache_hit_rate_pct}</span>
                <span className="stat-unit">%</span>
              </div>
              <div className="stat-label">Prompt-cache hit rate</div>
              <div className="stat-note">
                {stats.score_calls_last_30d <= 1
                  ? 'First call cold-misses. Drops to ~10% of input cost on every call after.'
                  : `Across ${stats.score_calls_last_30d} score calls.`}
              </div>
            </div>
          </div>
        </div>
        <p className="stats-meta">
          {seeded
            ? 'Seeded placeholders. Live wiring is configured but the read is gated until I publish the credential.'
            : `Live, refreshed hourly from the Activity log of my running CRM. Last refresh: ${stats.last_refresh}.`}
        </p>
      </section>

      <section id="how-it-works" aria-labelledby="how-it-works-h">
        <h2 id="how-it-works-h">How it works</h2>
        <p>
          Every application is a row on the Applications tab. Pasting a JD and
          clicking Score in the sidebar sends the JD plus my master resume to{' '}
          <code>claude-opus-4-7</code>, which returns a 0-100 fit score, three
          opinionated cover-letter angles, red flags, and a rationale. The
          resume body is the cache anchor: same bytes every call, so the
          prefix cache hits at roughly 10% of full input cost on every call
          after the first.
        </p>
        <p>
          Beyond scoring: a tailored resume and a cover letter are generated
          per application with anti-fabrication rules (no skills, metrics, or
          roles not in the master). A daily nudge surfaces follow-ups stuck
          on Applied. A vector-similarity search over past applications
          surfaces lookalikes for resume reuse.
        </p>
        <div className="surfaces">
          <div className="surface">
            <div className="surface-name">Sheet</div>
            <div className="surface-detail">
              Three tabs: Applications, Analytics (formula-only), Activity
              (audit log, hidden).
            </div>
          </div>
          <div className="surface">
            <div className="surface-name">Sidebar</div>
            <div className="surface-detail">
              In-Sheet HtmlService panel. Score, tailor, draft cover letter,
              show diff against master.
            </div>
          </div>
          <div className="surface">
            <div className="surface-name">Mobile PWA</div>
            <div className="surface-detail">
              Apps Script Web App, single-user, add to home screen. One-handed
              quick log from a recruiter call.
            </div>
          </div>
          <div className="surface">
            <div className="surface-name">Inbox + Calendar</div>
            <div className="surface-detail">
              Gmail label parser, daily follow-up nudge, Calendar event on
              status flip to Interview Scheduled.
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="design">
        <h2 id="design">Design choices that aren&apos;t AI-default</h2>
        <p>
          The sidebar, the mobile app, and this page share the same visual
          language: deliberate serif display type (Source Serif 4) against
          system sans for body, one accent color (deep teal{' '}
          <code>#2D5266</code>), one corner radius, no gradients, no stacked
          shadows, no emoji headers. Skeleton loading instead of spinners.
          Empty states tell you what to do next instead of saying No items
          yet.
        </p>
        <p>
          Every cover-letter prompt is constrained at the system level: no
          Spearheaded, no Synergized, no I am writing to apply, no Thank you
          for your consideration. Tailored resumes refuse to invent skills or
          metrics not in the master; they emit <code>GAP:</code> notes I
          review by hand. This is the part most AI-generated resumes get
          wrong, and the part recruiters can spot at thirty paces.
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
            cover letters, interview prep.{' '}
            <code>text-embedding-3-small</code> for similarity search.
          </dd>
          <dt>Privacy</dt>
          <dd>
            Sheet, Drive, Activity log all in my own Google account. API key
            in Script Properties. Public repo excludes IDs and keys.
          </dd>
        </dl>
      </section>

      <section aria-labelledby="repo">
        <h2 id="repo">Source</h2>
        <p>
          Public at{' '}
          <a href="https://github.com/mariaangelikabuilds/job-hunt-crm">
            github.com/mariaangelikabuilds/job-hunt-crm
          </a>
          . Install steps, OAuth scopes, mobile and Slack deployment, and a
          Make a copy link for forks are in the README.
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

      <p className="byline">
        <a href="https://github.com/mariaangelikabuilds">Angel Agutaya</a>,
        Product Design Engineer. Hosted on Vercel. No analytics, no cookies,
        no tracking scripts on this page.
      </p>
    </main>
  )
}
