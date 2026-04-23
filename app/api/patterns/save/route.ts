import { getUserFromRequest } from '@/lib/supabase-server'

async function fetchRavelryYarnData(patternId: number): Promise<{
  yardage: number | null
  yarn_weight: string | null
}> {
  const accessKey    = process.env.RAVELRY_ACCESS_KEY
  const accessSecret = process.env.RAVELRY_ACCESS_SECRET

  if (!accessKey || !accessSecret) {
    console.warn('[save] Ravelry credentials missing, skipping yarn data fetch')
    return { yardage: null, yarn_weight: null }
  }

  const url = `https://api.ravelry.com/patterns/${patternId}.json`
  console.log('[save] Fetching Ravelry pattern detail:', url)

  let res: Response
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${accessKey}:${accessSecret}`).toString('base64')}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })
  } catch (err) {
    console.error('[save] Ravelry fetch threw:', err)
    return { yardage: null, yarn_weight: null }
  }

  if (!res.ok) {
    console.error('[save] Ravelry pattern detail returned', res.status)
    return { yardage: null, yarn_weight: null }
  }

  const json = await res.json()
  const p = json?.pattern

  console.log('[save] Ravelry pattern detail fields:', {
    yardage:              p?.yardage,
    yardage_max:          p?.yardage_max,
    yarn_weight_name:     p?.yarn_weight?.name,
    yarn_weight_ply:      p?.yarn_weight?.ply,
  })

  const yardage     = p?.yardage != null && Number.isFinite(Number(p.yardage)) ? Number(p.yardage) : null
  const yarn_weight = p?.yarn_weight?.name ?? null

  return { yardage, yarn_weight }
}

export async function POST(request: Request) {
  const auth = await getUserFromRequest(request)
  if (!auth) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { pattern_id, pattern_name, designer_name, permalink, photo_url, yardage, yarn_weight } =
    body as Record<string, unknown>

  console.log('[save] Received body:', {
    pattern_id,
    pattern_name,
    permalink,
    yardage,
    yarn_weight,
  })

  if (!pattern_id || !pattern_name || !permalink) {
    return Response.json(
      { error: 'pattern_id, pattern_name, and permalink are required' },
      { status: 400 }
    )
  }

  // Always fetch from Ravelry to get authoritative yardage + yarn_weight.
  // The search API doesn't reliably include these fields.
  const ravelryData = await fetchRavelryYarnData(Number(pattern_id))

  // Prefer Ravelry-fetched values; fall back to whatever the client sent.
  const finalYardage    = ravelryData.yardage    ?? (yardage    != null && Number.isFinite(Number(yardage))    ? Number(yardage)    : null)
  const finalYarnWeight = ravelryData.yarn_weight ?? (yarn_weight != null ? String(yarn_weight) : null)

  console.log('[save] Final values to store:', { yardage: finalYardage, yarn_weight: finalYarnWeight })

  const { data, error } = await auth.client
    .from('saved_patterns')
    .insert({
      user_id:       auth.user.id,
      pattern_id:    Number(pattern_id),
      pattern_name:  String(pattern_name),
      designer_name: designer_name != null ? String(designer_name) : null,
      permalink:     String(permalink),
      photo_url:     photo_url != null ? String(photo_url) : null,
      yardage:       finalYardage,
      yarn_weight:   finalYarnWeight,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return Response.json({ success: true, already_saved: true })
    }
    console.error('[POST /api/patterns/save]', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  console.log('[save] Inserted row id:', data.id, '— yardage:', finalYardage, 'yarn_weight:', finalYarnWeight)

  return Response.json({ success: true, id: data.id }, { status: 201 })
}
