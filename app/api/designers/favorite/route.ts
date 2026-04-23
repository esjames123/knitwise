import { getUserFromRequest } from '@/lib/supabase-server'
import { ravelryFetch } from '@/lib/ravelry'

type RavelryDesigner = {
  id: number
  name: string
  permalink: string
  bio: string | null
  favorites_count: number | null
  users?: { photo_url?: string; small_photo_url?: string }[]
}

async function findDesignerPermalink(name: string): Promise<string | null> {
  const params = new URLSearchParams({
    query: name,
    page_size: '10',
    sort: 'best',
  })
  const url = `/patterns/search.json?${params.toString()}`
  console.log('[designers/favorite] Ravelry pattern search:', url)

  const res = await ravelryFetch(url)
  console.log('[designers/favorite] Pattern search status:', res.status)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error('[designers/favorite] Pattern search failed:', res.status, body.slice(0, 300))
    return null
  }

  const data = await res.json()
  const patterns: { designer?: { name: string; permalink: string } }[] = data.patterns ?? []
  console.log('[designers/favorite] Patterns returned:', patterns.length)

  const exact = patterns.find(p => p.designer?.name?.toLowerCase() === name.toLowerCase())
  const first = patterns.find(p => p.designer?.permalink)
  const result = (exact ?? first)?.designer?.permalink ?? null
  console.log('[designers/favorite] Permalink found:', result, exact ? '(exact match)' : first ? '(first result)' : '(none)')
  return result
}

export async function POST(request: Request) {
  console.log('[designers/favorite] POST received')

  const auth = await getUserFromRequest(request)
  if (!auth) {
    console.error('[designers/favorite] Auth failed — no valid session token')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  console.log('[designers/favorite] Auth OK, user:', auth.user.id)

  let body: unknown
  try { body = await request.json() }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { designer_name } = body as Record<string, unknown>
  if (!designer_name || typeof designer_name !== 'string' || !designer_name.trim()) {
    return Response.json({ error: 'designer_name is required' }, { status: 400 })
  }

  const name = designer_name.trim()
  console.log('[designers/favorite] Looking up designer:', name)

  // ── 1. Find permalink ──
  const permalink = await findDesignerPermalink(name)
  if (!permalink) {
    console.error('[designers/favorite] Could not find permalink for:', name)
    return Response.json({ error: `Could not find "${name}" on Ravelry.` }, { status: 404 })
  }

  // ── 2. Fetch full profile ──
  const profileUrl = `/designers/${encodeURIComponent(permalink)}.json`
  console.log('[designers/favorite] Fetching profile:', profileUrl)
  const profileRes = await ravelryFetch(profileUrl)
  console.log('[designers/favorite] Profile fetch status:', profileRes.status)

  if (!profileRes.ok) {
    const body = await profileRes.text().catch(() => '')
    console.error('[designers/favorite] Profile fetch failed:', profileRes.status, body.slice(0, 300))
    return Response.json(
      { error: `Ravelry returned ${profileRes.status} for designer "${permalink}".` },
      { status: profileRes.status }
    )
  }

  const profileData = await profileRes.json()
  console.log('[designers/favorite] Profile response keys:', Object.keys(profileData))

  const designer: RavelryDesigner | undefined = profileData.designer ?? profileData.designers?.[0]
  if (!designer) {
    console.error('[designers/favorite] No designer in response. Full response:', JSON.stringify(profileData).slice(0, 500))
    return Response.json(
      { error: `Unexpected Ravelry response for designer "${permalink}".` },
      { status: 502 }
    )
  }
  console.log('[designers/favorite] Designer profile:', { id: designer.id, name: designer.name, permalink: designer.permalink })

  const photoUrl =
    designer.users?.[0]?.photo_url ??
    designer.users?.[0]?.small_photo_url ??
    null

  // ── 3. Save to database ──
  console.log('[designers/favorite] Inserting into DB for user:', auth.user.id)
  const { data, error } = await auth.client
    .from('favorite_designers')
    .insert({
      user_id:             auth.user.id,
      ravelry_designer_id: designer.id,
      designer_name:       designer.name,
      designer_bio:        designer.bio ?? null,
      designer_photo_url:  photoUrl,
      follower_count:      designer.favorites_count ?? null,
      ravelry_permalink:   designer.permalink,
    })
    .select()
    .single()

  if (error) {
    console.error('[designers/favorite] DB insert error:', error.code, error.message, error.details)
    if (error.code === '23505') {
      return Response.json({ error: 'Already in your favorites.' }, { status: 409 })
    }
    return Response.json({ error: error.message, detail: error.details }, { status: 500 })
  }

  console.log('[designers/favorite] Saved successfully, row id:', data?.id)
  return Response.json(data, { status: 201 })
}
