import { getUserFromRequest } from '@/lib/supabase-server'
import { searchRavelry } from '@/app/lib/ravelry-search'
import type { SearchFilters } from '@/app/lib/ravelry-search'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const query     = searchParams.get('q')?.trim() || ''
  const sort      = searchParams.get('sort')?.trim() || 'popularity'
  const favorites = searchParams.get('favorites') || '0'

  console.log('[/api/search] Starting with params:', {
    query,
    sort,
    favorites,
    craft:      searchParams.get('craft'),
    weight:     searchParams.get('weight'),
    difficulty: searchParams.get('difficulty'),
    price:      searchParams.get('price'),
    type:       searchParams.get('type'),
  })

  if (!query) {
    console.log('[/api/search] No query — returning empty')
    return Response.json({ patterns: [], paginator: { results: 0 } })
  }

  // ── 1. Ravelry search ──────────────────────────────────────────────────────
  const filters: SearchFilters = {
    query,
    craft:      searchParams.get('craft')?.trim()      || '',
    weight:     searchParams.get('weight')?.trim()     || '',
    difficulty: searchParams.get('difficulty')?.trim() || '',
    price:      searchParams.get('price')?.trim()      || '',
    type:       searchParams.get('type')?.trim()       || '',
    sort,
    yardage:    searchParams.get('yardage')?.trim()    || '',
    rating:     searchParams.get('rating')?.trim()     || '',
    sizes:      searchParams.get('sizes')?.trim()      || '',
    needle:     searchParams.get('needle')?.trim()     || '',
  }

  let ravelryData
  try {
    console.log('[/api/search] Calling searchRavelry...')
    ravelryData = await searchRavelry(filters)
    console.log('[/api/search] Ravelry returned', ravelryData.patterns?.length ?? 'unknown', 'patterns')
    if (ravelryData.error) {
      console.error('[/api/search] Ravelry error field:', ravelryData.error)
    }
  } catch (err) {
    console.error('[/api/search] searchRavelry threw:', err)
    return Response.json({ error: 'Ravelry search failed.', detail: String(err) }, { status: 502 })
  }

  if (ravelryData.error) {
    return Response.json(ravelryData, { status: 502 })
  }

  // ── 2. No favorites filter — return Ravelry results as-is ─────────────────
  if (favorites !== '1') {
    console.log('[/api/search] No favorites filter — returning all', ravelryData.patterns.length, 'patterns')
    return Response.json(ravelryData)
  }

  // ── 3. Authenticate ────────────────────────────────────────────────────────
  console.log('[/api/search] Favorites filter ON — authenticating...')
  const authHeader = request.headers.get('authorization')
  console.log('[/api/search] Authorization header present:', !!authHeader)

  let auth
  try {
    auth = await getUserFromRequest(request)
    console.log('[/api/search] getUserFromRequest result:', auth ? `user ${auth.user.id}` : 'null (no valid token)')
  } catch (err) {
    console.error('[/api/search] getUserFromRequest threw:', err)
    return Response.json(ravelryData)
  }

  if (!auth) {
    console.warn('[/api/search] Not authenticated — returning unfiltered results')
    return Response.json(ravelryData)
  }

  // ── 4. Fetch favorites ─────────────────────────────────────────────────────
  console.log('[/api/search] Fetching favorite_designers for user:', auth.user.id)
  let favoriteNames: Set<string>
  try {
    const { data, error } = await auth.client
      .from('favorite_designers')
      .select('designer_name')
      .eq('user_id', auth.user.id)

    console.log('[/api/search] favorite_designers raw response — data:', JSON.stringify(data), 'error:', JSON.stringify(error))

    if (error) {
      console.error('[/api/search] favorite_designers query error:', error.message, '| code:', error.code, '| hint:', error.hint)
      return Response.json(ravelryData)
    }

    favoriteNames = new Set(
      (data ?? []).map((r: { designer_name: string }) => r.designer_name.toLowerCase())
    )
    console.log('[/api/search] User favorites:', [...favoriteNames])
  } catch (err) {
    console.error('[/api/search] favorite_designers fetch threw:', err)
    return Response.json(ravelryData)
  }

  // ── 5. Filter ──────────────────────────────────────────────────────────────
  console.log('[/api/search] Filtering with:', [...favoriteNames])
  const filtered = ravelryData.patterns.filter(p => {
    if (!p.designer?.name) return false
    const match = favoriteNames.has(p.designer.name.toLowerCase())
    console.log('[/api/search]', match ? '✓' : '✗', `"${p.designer.name}"`)
    return match
  })

  console.log(`[/api/search] Done — ${ravelryData.patterns.length} → ${filtered.length} patterns after filter`)

  return Response.json({
    patterns:  filtered,
    paginator: { results: filtered.length },
  })
}
