import { getUserFromRequest } from '@/lib/supabase-server'
import { searchRavelry } from '@/app/lib/ravelry-search'
import type { SearchFilters } from '@/app/lib/ravelry-search'

export async function GET(request: Request) {
  console.log('[/api/search] ▶ Route handler entered')
  const { searchParams } = new URL(request.url)

  const query     = searchParams.get('q')?.trim() || ''
  const sort      = searchParams.get('sort')?.trim() || 'popularity'
  const library = searchParams.get('library') || '0'

  console.log('[/api/search] Starting with params:', {
    query,
    sort,
    library,
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

  // ── 2. No library filter — return Ravelry results as-is ──────────────────
  if (library !== '1') {
    console.log('[/api/search] No library filter — returning all', ravelryData.patterns.length, 'patterns')
    return Response.json(ravelryData)
  }

  // ── 3. Authenticate ────────────────────────────────────────────────────────
  console.log('[/api/search] Library filter ON — authenticating...')
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

  // ── 4. Fetch saved pattern IDs ─────────────────────────────────────────────
  console.log('[/api/search] Fetching saved_patterns for user:', auth.user.id)
  let savedIds: Set<number>
  try {
    const { data, error } = await auth.client
      .from('saved_patterns')
      .select('pattern_id')
      .eq('user_id', auth.user.id)

    console.log('[/api/search] saved_patterns raw response — data:', JSON.stringify(data), 'error:', JSON.stringify(error))

    if (error) {
      console.error('[/api/search] saved_patterns query error:', error.message, '| code:', error.code, '| hint:', error.hint)
      return Response.json(ravelryData)
    }

    savedIds = new Set((data ?? []).map((r: { pattern_id: number }) => r.pattern_id))
    console.log('[/api/search] User has', savedIds.size, 'saved patterns')
  } catch (err) {
    console.error('[/api/search] saved_patterns fetch threw:', err)
    return Response.json(ravelryData)
  }

  // ── 5. Filter ──────────────────────────────────────────────────────────────
  const filtered = ravelryData.patterns.filter(p => savedIds.has(p.id))

  console.log(`[/api/search] Done — ${ravelryData.patterns.length} → ${filtered.length} patterns after filter`)

  return Response.json({
    patterns:  filtered,
    paginator: { results: filtered.length },
  })
}
