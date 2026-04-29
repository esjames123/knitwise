import { Suspense } from 'react'
import Link from 'next/link'
import SearchBar from './ui/search-bar'
import Nav from './ui/nav'
import SaveButton from './ui/save-button'
import { RavelryFooter } from './ui/ravelry-attribution'

// ─── Types ────────────────────────────────────────────────────────────────────

type TrendingPattern = {
  id: number
  name: string
  permalink: string
  designer: { name: string } | null
  difficulty_average: number | null
  yarn_weight_description: string | null
  min_yardage_required: number | null
  free: boolean
  first_photo: { medium_url: string } | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────


// ─── Ravelry fetch ────────────────────────────────────────────────────────────

async function fetchTrendingPatterns(): Promise<TrendingPattern[]> {
  const accessKey    = process.env.RAVELRY_ACCESS_KEY
  const accessSecret = process.env.RAVELRY_ACCESS_SECRET
  if (!accessKey || !accessSecret) return []

  try {
    const url = new URL('https://api.ravelry.com/patterns/search.json')
    url.searchParams.set('sort', 'best')
    url.searchParams.set('page_size', '9')

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${Buffer.from(`${accessKey}:${accessSecret}`).toString('base64')}`,
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      console.error('[fetchTrendingPatterns]', res.status)
      return []
    }
    const data = await res.json()
    return (data.patterns ?? []) as TrendingPattern[]
  } catch (err) {
    console.error('[fetchTrendingPatterns] threw:', err)
    return []
  }
}

// ─── Static data ─────────────────────────────────────────────────────────────

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Perfect for casual knitters',
    features: ['10 saved patterns', 'Basic yarn tracker', 'Community access', 'Pattern search'],
    featured: false,
    cta: 'Get started',
  },
  {
    name: 'Maker',
    price: '$6',
    period: '/mo',
    description: 'For the dedicated maker',
    features: ['Unlimited pattern saves', 'Smart yarn matching', 'Project timeline tools', 'Stash management', 'Priority support'],
    featured: true,
    cta: 'Start free trial',
  },
  {
    name: 'Studio',
    price: '$14',
    period: '/mo',
    description: 'For designers & shops',
    features: ['Everything in Maker', 'Pattern publishing', 'Sales analytics', 'Custom shop page', 'Wholesale tools'],
    featured: false,
    cta: 'Start free trial',
  },
]

// ─── Search bar fallback ──────────────────────────────────────────────────────

function SearchBarFallback() {
  return (
    <div className="flex w-full max-w-2xl items-center gap-2">
      <div className="h-14 flex-1 rounded-xl" style={{ backgroundColor: '#38342f', border: '1px solid #4a4440' }} />
      <div className="h-14 w-24 rounded-xl" style={{ backgroundColor: '#C06B45', opacity: 0.7 }} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Home() {
  const trending = await fetchTrendingPatterns()

  return (
    <div style={{ backgroundColor: '#242220', color: '#f5f0eb', minHeight: '100vh' }}>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <Nav />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-16 text-center sm:px-6 sm:py-28"
               style={{ backgroundColor: '#242220' }}>
        <div className="pointer-events-none absolute inset-0"
             style={{
               background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(192,107,69,0.22) 0%, transparent 70%)',
             }} />

        <div className="relative mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm"
               style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#c4b8ae' }}>
            <span style={{ color: '#C06B45' }}>✦</span>
            Over 40,000 patterns and counting
          </div>

          <h1 className="mb-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight"
              style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', color: '#f5f0eb' }}>
            Find your next<br />
            <em style={{ color: '#C06B45', fontStyle: 'italic' }}>beautiful make</em>
          </h1>

          <p className="mb-10 text-lg" style={{ color: '#b0a49a' }}>
            Search thousands of knitting patterns, match your yarn stash,<br className="hidden sm:block" />
            and track every project — all in one place.
          </p>

          <div className="flex justify-center">
            <Suspense fallback={<SearchBarFallback />}>
              <SearchBar />
            </Suspense>
          </div>

          <p className="mt-4 text-sm" style={{ color: '#7a6e67' }}>
            Try &quot;cozy sweater&quot;, &quot;lace weight shawl&quot;, or &quot;beginner socks&quot;
          </p>
        </div>
      </section>

      {/* ── Trending Patterns ─────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 sm:py-20" style={{ backgroundColor: '#242220' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold" style={{ color: '#f5f0eb' }}>Trending patterns</h2>
              <p className="mt-1" style={{ color: '#b0a49a' }}>What makers are knitting right now</p>
            </div>
            <Link href="/search?sort=popularity&q=knitting"
                  className="text-sm font-medium transition-colors"
                  style={{ color: '#C06B45' }}>
              View all →
            </Link>
          </div>

          {trending.length === 0 ? (
            <p className="text-center py-12" style={{ color: '#7a6e67' }}>
              Unable to load trending patterns right now. Try searching above.
            </p>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {trending.map((pattern) => {
                  return (
                    <div
                      key={pattern.id}
                      className="group flex flex-col rounded-2xl overflow-hidden transition-transform hover:-translate-y-1"
                      style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}
                    >
                      {/* Photo */}
                      <div className="relative w-full overflow-hidden" style={{ height: '180px' }}>
                        {pattern.first_photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={pattern.first_photo.medium_url}
                            alt={pattern.name}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className="absolute inset-0"
                            style={{
                              background: 'linear-gradient(135deg, #3a2a1e 0%, #C06B45 50%, #8b4a2a 100%)',
                              opacity: 0.7,
                            }}
                          />
                        )}
                        <SaveButton
                          patternId={pattern.id}
                          patternName={pattern.name}
                          designerName={pattern.designer?.name ?? null}
                          permalink={pattern.permalink}
                          photoUrl={pattern.first_photo?.medium_url ?? null}
                          yardageRequired={pattern.min_yardage_required}
                          yarnWeight={pattern.yarn_weight_description}
                        />
                      </div>

                      {/* Card body */}
                      <div className="flex flex-1 flex-col p-5 gap-3">
                        <div>
                          <h3 className="font-semibold leading-snug" style={{ color: '#f5f0eb' }}>
                            {pattern.name}
                          </h3>
                          {pattern.designer && (
                            <p className="mt-0.5 text-sm" style={{ color: '#9a8e87' }}>
                              by {pattern.designer.name}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {pattern.yarn_weight_description && (
                            <span
                              className="rounded-full px-2.5 py-0.5"
                              style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#c4b8ae' }}
                            >
                              {pattern.yarn_weight_description}
                            </span>
                          )}
                          {pattern.min_yardage_required != null && (
                            <span
                              className="rounded-full px-2.5 py-0.5"
                              style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#9a8e87' }}
                            >
                              ~{pattern.min_yardage_required.toLocaleString()} yds
                            </span>
                          )}
                          {pattern.free && (
                            <span
                              className="rounded-full px-2.5 py-0.5 font-medium"
                              style={{ backgroundColor: '#1a3a2a', border: '1px solid #2a5a3a', color: '#6dcfa0' }}
                            >
                              Free
                            </span>
                          )}
                        </div>

                        <div className="mt-auto pt-2">
                          <Link
                            href={`https://www.ravelry.com/patterns/library/${pattern.permalink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ravelry-link block rounded-lg py-2 text-center text-sm font-semibold transition-colors text-white"
                          >
                            View on Ravelry →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <RavelryFooter />
            </>
          )}
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 sm:py-20" style={{ borderTop: '1px solid #3a3530', backgroundColor: '#1e1c1a' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold" style={{ color: '#f5f0eb' }}>Simple pricing</h2>
            <p className="mt-2" style={{ color: '#b0a49a' }}>Start free, upgrade when you&apos;re ready</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name}
                   className="relative rounded-2xl p-7"
                   style={plan.featured
                     ? { backgroundColor: '#3a2218', border: '2px solid #C06B45' }
                     : { backgroundColor: '#2a2724', border: '1px solid #3a3530' }}>

                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full px-3 py-1 text-xs font-bold text-white"
                          style={{ backgroundColor: '#C06B45' }}>
                      Most popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-lg font-bold" style={{ color: '#f5f0eb' }}>{plan.name}</h3>
                  <p className="mt-0.5 text-sm" style={{ color: '#9a8e87' }}>{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold" style={{ color: '#f5f0eb' }}>{plan.price}</span>
                    {plan.period && (
                      <span style={{ color: '#9a8e87' }}>{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="mb-7 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm" style={{ color: '#c4b8ae' }}>
                      <span className="font-bold" style={{ color: '#C06B45' }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="#"
                      className="block rounded-xl py-3 text-center text-sm font-semibold transition-colors text-white"
                      style={plan.featured
                        ? { backgroundColor: '#C06B45' }
                        : { backgroundColor: '#38342f', border: '1px solid #4a4440' }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ───────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 sm:py-24" style={{ backgroundColor: '#1e1c1a' }}>
        <div className="mx-auto max-w-2xl text-center">

          <div className="mb-6 text-3xl">🧶</div>

          <h2
            className="mb-6 text-2xl font-bold sm:text-3xl"
            style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', color: '#f5f0eb' }}
          >
            Why is Knitwise only{' '}
            <em style={{ color: '#C06B45', fontStyle: 'italic' }}>$5?</em>
          </h2>

          <div className="space-y-4 text-base leading-relaxed" style={{ color: '#b0a49a' }}>
            <p>
              As a longtime fiber artist and tech enthusiast, I wanted to build the fiber arts
              project management app of my dreams — one that truly serves our community.
            </p>
            <p>
              The $5 download helps offset the time and money spent developing and hosting
              Knitwise, but there&apos;s no subscription fee, ever. No ads. No hidden costs.
            </p>
            <p>
              Knitwise exists to celebrate and support the small farms, fiber artists, small
              businesses, and content creators who keep the ancient craft of sustainable fiber
              arts alive.
            </p>
            <p style={{ color: '#c4b8ae' }}>
              If you love what we&apos;re building, share Knitwise with your fiber arts friends.
              Let&apos;s grow this mission together.
            </p>
          </div>

        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="px-6 py-10 text-center text-sm"
              style={{ borderTop: '1px solid #3a3530', backgroundColor: '#1e1c1a', color: '#7a6e67' }}>
        <div className="mb-3 flex items-center justify-center text-xl"
             style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', color: '#f5f0eb' }}>
          Knit<em style={{ color: '#C06B45', fontStyle: 'italic' }}>wise</em>
        </div>
        <p>© 2026 Knitwise. Made for makers, by makers.</p>
      </footer>
    </div>
  )
}
