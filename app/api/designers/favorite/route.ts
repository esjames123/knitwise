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

// Step 1: search patterns for this designer name and return the first matching
// designer's permalink. More reliable than guessing the permalink from the name.
async function findDesignerPermalink(name: string): Promise<string | null> {
  const url = new URL('https://api.ravelry.com/patterns/search.json')
  url.searchParams.set('query', name)
  url.searchParams.set('page_size', '10')
  url.searchParams.set('sort', 'best')

  const res = await ravelryFetch(`/patterns/search.json?${url.searchParams.toString().replace(/^[^?]*\?/, '')}`)
  if (!res.ok) return null

  const data = await res.json()
  const patterns: { designer?: { name: string; permalink: string } }[] = data.patterns ?? []

  // Prefer exact name match, fall back to first result that has a designer
  const exact = patterns.find(
    p => p.designer?.name?.toLowerCase() === name.toLowerCase()
  )
  const first = patterns.find(p => p.designer?.permalink)

  return (exact ?? first)?.designer?.permalink ?? null
}

export async function POST(request: Request) {
  const auth = await getUserFromRequest(request)
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { designer_name } = body as Record<string, unknown>
  if (!designer_name || typeof designer_name !== 'string' || !designer_name.trim()) {
    return Response.json({ error: 'designer_name is required' }, { status: 400 })
  }

  const name = designer_name.trim()

  // ── 1. Find the designer's Ravelry permalink ──
  const permalink = await findDesignerPermalink(name)
  if (!permalink) {
    return Response.json({ error: `Could not find "${name}" on Ravelry.` }, { status: 404 })
  }

  // ── 2. Fetch full designer profile ──
  const profileRes = await ravelryFetch(`/designers/${encodeURIComponent(permalink)}.json`)
  if (!profileRes.ok) {
    return Response.json(
      { error: `Ravelry returned ${profileRes.status} for designer "${permalink}".` },
      { status: profileRes.status }
    )
  }

  const profileData = await profileRes.json()
  const designer: RavelryDesigner = profileData.designer

  const photoUrl =
    designer.users?.[0]?.photo_url ??
    designer.users?.[0]?.small_photo_url ??
    null

  // ── 3. Save to database ──
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
    if (error.code === '23505') {
      return Response.json({ error: 'Already in your favorites.' }, { status: 409 })
    }
    console.error('[POST /api/designers/favorite]', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data, { status: 201 })
}
