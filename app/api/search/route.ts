import { getUserFromRequest } from '@/lib/supabase-server'
import { searchRavelry } from '@/app/lib/ravelry-search'
import type { SearchFilters } from '@/app/lib/ravelry-search'

export async function GET(request: Request) {
  try {
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

    // ── 1. Ravelry search ────────────────────────────────────────────────────
    let ravelryData
    try {
      ravelryData = await searchRavelry(filters)
    } catch (err) {
      console.error('[/api/search] searchRavelry threw:', err)
      return Response.json({ error: 'Ravelry search failed.' }, { status: 502 })
    }

    if (ravelryData.error) {
      console.error('[/api/search] Ravelry returned error:', ravelryData.error)
      return Response.json(ravelryData, { status: 502 })
    }

    // ── 2. Return early if favorites filter is off ───────────────────────────
    if (!onlyFavorites) {
      return Response.json(ravelryData)
    }

    // ── 3. Authenticate the request ──────────────────────────────────────────
    let auth
    try {
      auth = await getUserFromRequest(request)
    } catch (err) {
      console.error('[/api/search] getUserFromRequest threw:', err)
      // Token verification failed — return unfiltered rather than 500
      return Response.json(ravelryData)
    }

    if (!auth) {
      console.warn('[/api/search] favorites=1 but no valid auth token — returning unfiltered results')
      return Response.json(ravelryData)
    }

    console.log('[/api/search] Authenticated user:', auth.user.id)

    // ── 4. Fetch favorite designer names ────────────────────────────────────
    let favoriteNames: Set<string>
    try {
      const { data, error } = await auth.client
        .from('favorite_designers')
        .select('designer_name')
        .eq('user_id', auth.user.id)

      if (error) {
        console.error('[/api/search] favorite_designers query error:', error.message, error.code)
        // Fall back to unfiltered rather than 500
        return Response.json(ravelryData)
      }

      favoriteNames = new Set(
        (data ?? []).map((r: { designer_name: string }) => r.designer_name.toLowerCase())
      )
      console.log(`[/api/search] Loaded ${favoriteNames.size} favorite designer(s):`, [...favoriteNames])
    } catch (err) {
      console.error('[/api/search] favorite_designers fetch threw:', err)
      return Response.json(ravelryData)
    }

    // ── 5. Filter patterns ───────────────────────────────────────────────────
    const filtered = ravelryData.patterns.filter(p => {
      if (!p.designer?.name) return false
      const match = favoriteNames.has(p.designer.name.toLowerCase())
      console.log('[/api/search]', match ? '✓' : '✗', `"${p.designer.name}"`)
      return match
    })

    console.log(`[/api/search] ${ravelryData.patterns.length} patterns → ${filtered.length} after favorites filter`)

    return Response.json({
      patterns:  filtered,
      paginator: { results: filtered.length },
    })

  } catch (err) {
    // Catch-all — should not normally be reached
    console.error('[/api/search] Unhandled exception:', err)
    return Response.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
