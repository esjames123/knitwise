import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import Nav from '@/app/ui/nav'
import SearchBar from '@/app/ui/search-bar'
import FilterSidebar from '@/app/ui/filter-sidebar'
import { buildActiveChips } from '@/app/lib/filter-chips'
import SaveButton from '@/app/ui/save-button'
import { DesignerPopover } from '@/app/ui/designer-popover'
import { RavelryCardCredit, RavelryFooter } from '@/app/ui/ravelry-attribution'
import { ResourceResults } from '@/app/ui/resource-results'
import type { PublicResource } from '@/app/ui/resource-results'

// ─── Types ────────────────────────────────────────────────────────────────────

type RavelryPattern = {
  id: number
  name: string
  permalink: string
  designer: { name: string } | null
  difficulty_average: number | null
  yarn_weight_description: string | null
  min_yardage_required: number | null
  max_yardage_required: number | null
  free: boolean
  first_photo: {
    square_url: string
    medium_url: string
  } | null
}

type RavelryResponse = {
  patterns: RavelryPattern[]
  paginator: { results: number }
  error?: string
}

type SearchFilters = {
  query: string
  craft: string
  weight: string
  difficulty: string
  price: string
  type: string
  sort: string
  yardage: string
  rating: string
  sizes: string
  needle: string
}

// ─── Ravelry mapping constants ────────────────────────────────────────────────

// Difficulty is a 1–10 float on Ravelry. We send the widest range when multiple
// difficulty levels are selected.
const DIFFICULTY_RANGES: Record<string, [number, number]> = {
  beginner:     [0,   2],
  easy:         [2,   4],
  intermediate: [4,   6],
  experienced:  [6,   8],
  expert:       [8,  10],
}

// Yardage preset → [min, max | null] (null max = no upper bound)
const YARDAGE_RANGES: Record<string, [number, number | null]> = {
  under200:  [0,    200],
  '200to400':  [200,  400],
  '400to800':  [400,  800],
  '800to1500': [800,  1500],
  '1500plus':  [1500, null],
}

// Needle preset → [needleSizeMin, needleSizeMax | null] in Ravelry US needle units.
// Crochet hook mm sizes are mapped to their approximate US knitting needle equivalents
// so Ravelry's needle_size_min/max filter applies across both tool types.
const NEEDLE_RANGES: Record<string, [number, number | null]> = {
  us0to2:      [0,   2],
  us3to5:      [3,   5],
  us6to8:      [6,   8],
  us9to11:     [9,  11],
  us13plus:    [13, null],
  crochet2to4: [0,   6],   // 2–4 mm ≈ US 0–6
  crochet5to7: [8,  10],   // 5–7 mm ≈ US 8–10.5
  crochet8plus:[11, null], // 8 mm+  ≈ US 11+
}

// Pattern category IDs from the Ravelry API category tree.
const PATTERN_CATEGORY_IDS: Record<string, number> = {
  sweater:  338,
  cardigan: 110,
  hat:      157,
  scarf:    292,
  shawl:    308,
  socks:    311,
  mittens:  231,
  blanket:   79,
  bag:       69,
  toy:      364,
}

// ─── Public resources fetch ───────────────────────────────────────────────────

async function searchResources(query: string): Promise<PublicResource[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []

  const { data, error } = await supabase
    .from('resources')
    .select('id, title, url, resource_type, description, source, creator_name, image_url')
    .order('saved_at', { ascending: false })

  if (error || !data) return []

  return data.filter((r: PublicResource) => {
    const haystack = [r.title, r.description, r.source, r.resource_type, r.creator_name]
      .filter(Boolean).join(' ').toLowerCase()
    return terms.every(t => haystack.includes(t))
  })
}

// ─── API fetch ─────────────────────────────────────────────────────────────────

async function searchRavelry(filters: SearchFilters): Promise<RavelryResponse> {
  const accessKey    = process.env.RAVELRY_ACCESS_KEY
  const accessSecret = process.env.RAVELRY_ACCESS_SECRET

  if (!accessKey || !accessSecret) {
    return { patterns: [], paginator: { results: 0 }, error: 'Ravelry API credentials are not configured.' }
  }

  const url = new URL('https://api.ravelry.com/patterns/search.json')
  url.searchParams.set('query',     filters.query)
  url.searchParams.set('page_size', '20')

  // Sort
  const sortMap: Record<string, string> = {
    popularity: 'best',
    date:       'date',
    rating:     'rating',
    projects:   'projects',
  }
  url.searchParams.set('sort', sortMap[filters.sort] ?? 'best')

  // Craft
  const crafts = filters.craft.split(',').filter(Boolean)
  for (const c of crafts) url.searchParams.append('craft', c)

  // Yarn weight
  const weights = filters.weight.split(',').filter(Boolean)
  for (const w of weights) url.searchParams.append('weight', w)

  // Difficulty — take the widest floor/ceiling across selected levels
  const diffs = filters.difficulty.split(',').filter(Boolean)
  if (diffs.length > 0) {
    const floors   = diffs.map(d => DIFFICULTY_RANGES[d]?.[0] ?? 0)
    const ceilings = diffs.map(d => DIFFICULTY_RANGES[d]?.[1] ?? 10)
    url.searchParams.set('difficulty_floor',   String(Math.min(...floors)))
    url.searchParams.set('difficulty_ceiling', String(Math.max(...ceilings)))
  }

  // Price / availability
  if (filters.price === 'free') url.searchParams.set('availability', 'free')
  if (filters.price === 'paid') url.searchParams.set('availability', 'ravelry')

  // Pattern categories
  const types = filters.type.split(',').filter(Boolean)
  for (const t of types) {
    const id = PATTERN_CATEGORY_IDS[t]
    if (id) url.searchParams.append('pc', String(id))
  }

  // Rating
  if (filters.rating) url.searchParams.set('rating_min', filters.rating)

  // Sizes (fit)
  const sizes = filters.sizes.split(',').filter(Boolean)
  for (const s of sizes) url.searchParams.append('fit', s)

  // Yardage — union of all selected preset ranges
  const yardPresets = filters.yardage.split(',').filter(Boolean)
  if (yardPresets.length > 0) {
    const mins = yardPresets.map(p => YARDAGE_RANGES[p]?.[0] ?? 0)
    const maxes = yardPresets.map(p => YARDAGE_RANGES[p]?.[1])
    url.searchParams.set('yardage_min', String(Math.min(...mins)))
    if (maxes.every(m => m != null)) {
      url.searchParams.set('yardage_max', String(Math.max(...(maxes as number[]))))
    }
  }

  // Needle / hook size — union of all selected preset ranges
  const needlePresets = filters.needle.split(',').filter(Boolean)
  if (needlePresets.length > 0) {
    const mins = needlePresets.map(p => NEEDLE_RANGES[p]?.[0] ?? 0)
    const maxes = needlePresets.map(p => NEEDLE_RANGES[p]?.[1])
    url.searchParams.set('needle_size_min', String(Math.min(...mins)))
    if (maxes.every(m => m != null)) {
      url.searchParams.set('needle_size_max', String(Math.max(...(maxes as number[]))))
    }
  }

  const credentials = Buffer.from(`${accessKey}:${accessSecret}`).toString('base64')

  const requestUrl = url.toString()
  console.log('[Ravelry] GET', requestUrl)

  let res: Response
  try {
    res = await fetch(requestUrl, {
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })
  } catch (err) {
    console.error('[Ravelry] fetch threw:', err)
    return { patterns: [], paginator: { results: 0 }, error: 'Network error reaching Ravelry.' }
  }

  if (!res.ok) {
    let body = ''
    try { body = await res.text() } catch { /* ignore */ }
    console.error(`[Ravelry] ${res.status} response body:`, body)
    return { patterns: [], paginator: { results: 0 }, error: `Ravelry returned ${res.status}: ${body.slice(0, 200)}` }
  }

  return res.json()
}


// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  function sp(key: string): string {
    const v = params[key]
    return Array.isArray(v) ? (v[0] ?? '') : (v ?? '')
  }

  const filters: SearchFilters = {
    query:      sp('q'),
    craft:      sp('craft'),
    weight:     sp('weight'),
    difficulty: sp('difficulty'),
    price:      sp('price'),
    type:       sp('type'),
    sort:       sp('sort') || 'popularity',
    yardage:    sp('yardage'),
    rating:     sp('rating'),
    sizes:      sp('sizes'),
    needle:     sp('needle'),
  }

  const [data, communityResources] = await Promise.all([
    filters.query ? searchRavelry(filters) : Promise.resolve(null),
    filters.query ? searchResources(filters.query) : Promise.resolve([]),
  ])

  const chips = buildActiveChips(params as Record<string, string | string[] | undefined>)

  return (
    <div style={{ backgroundColor: '#242220', color: '#f5f0eb', minHeight: '100vh' }}>
      <Nav />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Search bar — full width */}
        <div className="mb-8 flex justify-center">
          <SearchBar />
        </div>

        {/* No query yet */}
        {!filters.query && (
          <p className="text-center text-lg" style={{ color: '#9a8e87' }}>
            Type something above to search thousands of patterns. Try a favorite designer name, a project type like &ldquo;cabled beanie hat,&rdquo; or a yarn weight like &ldquo;worsted weight.&rdquo; An advanced search panel will open after your search to refine your results.
          </p>
        )}

        {filters.query && (
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            {/* ── Sidebar ── */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <FilterSidebar />
            </div>

            {/* ── Results column ── */}
            <div className="min-w-0">
              {/* Error */}
              {data?.error && (
                <div
                  className="rounded-xl px-6 py-4 text-center text-sm"
                  style={{ backgroundColor: '#3a2218', border: '1px solid #C06B45', color: '#e0a090' }}
                >
                  {data.error}
                </div>
              )}

              {data && !data.error && (
                <>
                  {/* Results header */}
                  <div className="mb-4 flex items-baseline justify-between">
                    <h1 className="text-2xl font-bold" style={{ color: '#f5f0eb' }}>
                      Results for{' '}
                      <em style={{ color: '#C06B45', fontStyle: 'italic' }}>{filters.query}</em>
                    </h1>
                    <span className="text-sm" style={{ color: '#7a6e67' }}>
                      {data.paginator.results.toLocaleString()} patterns
                    </span>
                  </div>

                  {/* Active filter chips */}
                  {chips.length > 0 && (
                    <div className="mb-5 flex flex-wrap gap-2">
                      {chips.map((chip, i) => (
                        <Link
                          key={i}
                          href={chip.removeUrl}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
                          style={{ backgroundColor: '#3d2a1e', border: '1px solid #C06B45', color: '#e8c4b0' }}
                        >
                          {chip.label}
                          <svg
                            width="10" height="10" viewBox="0 0 12 12"
                            fill="none" stroke="currentColor" strokeWidth="2.5"
                            strokeLinecap="round"
                          >
                            <path d="M2 2l8 8M10 2l-8 8" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Results grid */}
                  {data.patterns.length === 0 ? (
                    <p className="text-center" style={{ color: '#9a8e87' }}>
                      No patterns found. Try adjusting your filters or search term.
                    </p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {data.patterns.map((pattern) => {
                        return (
                          <div
                            key={pattern.id}
                            className="flex flex-col rounded-2xl overflow-hidden transition-transform hover:-translate-y-1"
                            style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}
                          >
                            {/* Pattern photo or placeholder gradient */}
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

                            <div className="flex flex-1 flex-col p-5 gap-3">
                              <div>
                                <h2 className="font-semibold leading-snug" style={{ color: '#f5f0eb' }}>
                                  {pattern.name}
                                </h2>
                                <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm" style={{ color: '#9a8e87' }}>
                                  {pattern.designer && (
                                    <span>by <DesignerPopover name={pattern.designer.name} /></span>
                                  )}
                                  {pattern.designer && <span aria-hidden="true">·</span>}
                                  <RavelryCardCredit />
                                </div>
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
                  )}
                  <RavelryFooter />
                </>
              )}

              {/* Community resources */}
              {communityResources.length > 0 && (
                <ResourceResults resources={communityResources} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
