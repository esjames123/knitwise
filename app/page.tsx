import Link from 'next/link'
import SearchBar from './ui/search-bar'
import Nav from './ui/nav'

const patterns = [
  {
    id: 1,
    name: 'Autumn Cable Sweater',
    designer: 'WoolCraft Co.',
    difficulty: 'Intermediate',
    yardage: '1,200 yds',
    weight: 'Worsted',
    swatch: '#8B4513',
    swatchLight: '#A0522D',
  },
  {
    id: 2,
    name: 'Lace Triangle Shawl',
    designer: 'KnitStudio',
    difficulty: 'Advanced',
    yardage: '800 yds',
    weight: 'Fingering',
    swatch: '#5C4033',
    swatchLight: '#7D5A4F',
  },
  {
    id: 3,
    name: 'Chunky Ribbed Beanie',
    designer: 'YarnHaven',
    difficulty: 'Beginner',
    yardage: '150 yds',
    weight: 'Bulky',
    swatch: '#2D5A4F',
    swatchLight: '#3D7A6B',
  },
  {
    id: 4,
    name: 'Fair Isle Mittens',
    designer: 'NordicKnits',
    difficulty: 'Intermediate',
    yardage: '220 yds',
    weight: 'DK',
    swatch: '#2B4A6B',
    swatchLight: '#3D6A9B',
  },
  {
    id: 5,
    name: 'Summer Cotton Tank',
    designer: 'KnitStudio',
    difficulty: 'Beginner',
    yardage: '500 yds',
    weight: 'Sport',
    swatch: '#5A3E6B',
    swatchLight: '#7A5E8B',
  },
  {
    id: 6,
    name: 'Herringbone Cardigan',
    designer: 'WoolCraft Co.',
    difficulty: 'Advanced',
    yardage: '1,800 yds',
    weight: 'Aran',
    swatch: '#6B3A2A',
    swatchLight: '#8B5040',
  },
]

const difficultyStyle: Record<string, string> = {
  Beginner:     'bg-emerald-900 text-emerald-300 border border-emerald-700',
  Intermediate: 'bg-amber-900   text-amber-300   border border-amber-700',
  Advanced:     'bg-rose-900    text-rose-300    border border-rose-700',
}

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

export default function Home() {
  return (
    <div style={{ backgroundColor: '#242220', color: '#f5f0eb', minHeight: '100vh' }}>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <Nav />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 py-32 text-center"
               style={{ backgroundColor: '#242220' }}>
        {/* Warm glow behind headline */}
        <div className="pointer-events-none absolute inset-0"
             style={{
               background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(192,107,69,0.22) 0%, transparent 70%)',
             }} />

        <div className="relative mx-auto max-w-3xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm"
               style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#c4b8ae' }}>
            <span style={{ color: '#C06B45' }}>✦</span>
            Over 40,000 patterns and counting
          </div>

          {/* Headline */}
          <h1 className="mb-5 text-5xl font-bold tracking-tight sm:text-6xl leading-tight"
              style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', color: '#f5f0eb' }}>
            Find your next<br />
            <em style={{ color: '#C06B45', fontStyle: 'italic' }}>beautiful make</em>
          </h1>

          {/* Subheading */}
          <p className="mb-10 text-lg" style={{ color: '#b0a49a' }}>
            Search thousands of knitting patterns, match your yarn stash,<br className="hidden sm:block" />
            and track every project — all in one place.
          </p>

          <div className="flex justify-center">
            <SearchBar />
          </div>

          <p className="mt-4 text-sm" style={{ color: '#7a6e67' }}>
            Try "cozy sweater", "lace weight shawl", or "beginner socks"
          </p>
        </div>
      </section>

      {/* ── Trending Patterns ─────────────────────────────────── */}
      <section className="px-6 py-20" style={{ backgroundColor: '#242220' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold" style={{ color: '#f5f0eb' }}>Trending patterns</h2>
              <p className="mt-1" style={{ color: '#b0a49a' }}>What makers are knitting right now</p>
            </div>
            <Link href="#" className="text-sm font-medium transition-colors"
                  style={{ color: '#C06B45' }}>
              View all →
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {patterns.map((pattern) => (
              <div key={pattern.id}
                   className="group cursor-pointer rounded-2xl overflow-hidden transition-transform hover:-translate-y-1"
                   style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}>

                {/* Swatch thumbnail */}
                <div className="h-44 flex items-center justify-center relative overflow-hidden"
                     style={{ backgroundColor: pattern.swatch }}>
                  {/* Knit texture suggestion */}
                  <div className="absolute inset-0 opacity-30"
                       style={{
                         backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(0,0,0,0.15) 6px, rgba(0,0,0,0.15) 7px), repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.08) 10px, rgba(0,0,0,0.08) 11px)`,
                       }} />
                  <span className="relative text-3xl opacity-60">🧶</span>
                </div>

                {/* Card body */}
                <div className="p-5">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="font-semibold leading-snug transition-colors"
                        style={{ color: '#f5f0eb' }}>
                      {pattern.name}
                    </h3>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyStyle[pattern.difficulty]}`}>
                      {pattern.difficulty}
                    </span>
                  </div>
                  <p className="mb-3 text-sm" style={{ color: '#9a8e87' }}>
                    by {pattern.designer}
                  </p>
                  <div className="flex items-center gap-3 text-xs" style={{ color: '#7a6e67' }}>
                    <span>{pattern.weight}</span>
                    <span style={{ color: '#4a4440' }}>·</span>
                    <span>{pattern.yardage}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────── */}
      <section className="px-6 py-20" style={{ borderTop: '1px solid #3a3530', backgroundColor: '#1e1c1a' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold" style={{ color: '#f5f0eb' }}>Simple pricing</h2>
            <p className="mt-2" style={{ color: '#b0a49a' }}>Start free, upgrade when you're ready</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
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
