import { getUserFromRequest } from '@/lib/supabase-server'
import { searchRavelry } from '@/app/lib/ravelry-search'
import type { SearchFilters } from '@/app/lib/ravelry-search'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  function sp(key: string): string {
    return searchParams.get(key)?.trim() || ''
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

  if (!filters.query) {
    return Response.json({ patterns: [], paginator: { results: 0 } })
  }

  const onlyFavorites = searchParams.get('favorites') === '1'

  // Run Ravelry search and (if needed) favorites fetch in parallel
  const [ravelryData, favoriteNames] = await Promise.all([
    searchRavelry(filters),
    onlyFavorites
      ? (async () => {
          const auth = await getUserFromRequest(request)
          if (!auth) return null
          const { data } = await auth.client
            .from('favorite_designers')
            .select('designer_name')
            .eq('user_id', auth.user.id)
          return new Set(
            (data ?? []).map((r: { designer_name: string }) => r.designer_name.toLowerCase())
          )
        })()
      : Promise.resolve(null),
  ])

  if (ravelryData.error) {
    return Response.json(ravelryData, { status: 502 })
  }

  if (!onlyFavorites || favoriteNames === null) {
    return Response.json(ravelryData)
  }

  console.log('[/api/search] Favorite designer names:', [...favoriteNames])

  const filtered = ravelryData.patterns.filter(p => {
    if (!p.designer?.name) return false
    const match = favoriteNames.has(p.designer.name.toLowerCase())
    console.log('[/api/search] Pattern designer:', p.designer.name, '→', match ? 'MATCH' : 'skip')
    return match
  })

  console.log(`[/api/search] Filtered ${ravelryData.patterns.length} → ${filtered.length} patterns`)

  return Response.json({
    patterns:  filtered,
    paginator: { results: filtered.length },
  })
}
