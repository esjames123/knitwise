import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import Nav from '@/app/ui/nav'
import SearchBar from '@/app/ui/search-bar'
import FilterSidebar from '@/app/ui/filter-sidebar'
import { buildActiveChips } from '@/app/lib/filter-chips'
import { PatternGrid } from '@/app/ui/pattern-grid'
import { searchRavelry } from '@/app/lib/ravelry-search'
import type { SearchFilters } from '@/app/lib/ravelry-search'
import { ResourceResults } from '@/app/ui/resource-results'
import type { PublicResource } from '@/app/ui/resource-results'

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
                  <PatternGrid patterns={data.patterns} />
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
