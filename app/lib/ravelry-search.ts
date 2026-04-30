export type RavelryPattern = {
  id: number
  name: string
  permalink: string
  designer: { id: number; name: string; permalink: string } | null
  difficulty_average: number | null
  yarn_weight_description: string | null
  min_yardage_required: number | null
  max_yardage_required: number | null
  free: boolean
  first_photo: { square_url: string; medium_url: string } | null
}

export type SearchFilters = {
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

export type RavelrySearchResponse = {
  patterns: RavelryPattern[]
  paginator: { results: number }
  error?: string
}

// ─── Mapping constants ────────────────────────────────────────────────────────

const DIFFICULTY_RANGES: Record<string, [number, number]> = {
  beginner:     [0,   2],
  easy:         [2,   4],
  intermediate: [4,   6],
  experienced:  [6,   8],
  expert:       [8,  10],
}

const YARDAGE_RANGES: Record<string, [number, number | null]> = {
  under200:    [0,    200],
  '200to400':  [200,  400],
  '400to800':  [400,  800],
  '800to1500': [800,  1500],
  '1500plus':  [1500, null],
}

const NEEDLE_RANGES: Record<string, [number, number | null]> = {
  us0to2:       [0,   2],
  us3to5:       [3,   5],
  us6to8:       [6,   8],
  us9to11:      [9,  11],
  us13plus:     [13, null],
  crochet2to4:  [0,   6],
  crochet5to7:  [8,  10],
  crochet8plus: [11, null],
}

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

// ─── Search function ──────────────────────────────────────────────────────────

export async function searchRavelry(filters: SearchFilters): Promise<RavelrySearchResponse> {
  const accessKey    = process.env.RAVELRY_ACCESS_KEY
  const accessSecret = process.env.RAVELRY_ACCESS_SECRET

  if (!accessKey || !accessSecret) {
    return { patterns: [], paginator: { results: 0 }, error: 'Ravelry API credentials are not configured.' }
  }

  const url = new URL('https://api.ravelry.com/patterns/search.json')
  url.searchParams.set('query',     filters.query)
  url.searchParams.set('page_size', '20')

  const sortMap: Record<string, string> = {
    popularity: 'best', date: 'date', rating: 'rating', projects: 'projects',
  }
  url.searchParams.set('sort', sortMap[filters.sort] ?? 'best')

  for (const c of filters.craft.split(',').filter(Boolean))
    url.searchParams.append('craft', c)

  for (const w of filters.weight.split(',').filter(Boolean))
    url.searchParams.append('weight', w)

  const diffs = filters.difficulty.split(',').filter(Boolean)
  if (diffs.length > 0) {
    const floors   = diffs.map(d => DIFFICULTY_RANGES[d]?.[0] ?? 0)
    const ceilings = diffs.map(d => DIFFICULTY_RANGES[d]?.[1] ?? 10)
    url.searchParams.set('difficulty_floor',   String(Math.min(...floors)))
    url.searchParams.set('difficulty_ceiling', String(Math.max(...ceilings)))
  }

  if (filters.price === 'free') url.searchParams.set('availability', 'free')
  if (filters.price === 'paid') url.searchParams.set('availability', 'ravelry')

  for (const t of filters.type.split(',').filter(Boolean)) {
    const id = PATTERN_CATEGORY_IDS[t]
    if (id) url.searchParams.append('pc', String(id))
  }

  if (filters.rating) url.searchParams.set('rating_min', filters.rating)

  for (const s of filters.sizes.split(',').filter(Boolean))
    url.searchParams.append('fit', s)

  const yardPresets = filters.yardage.split(',').filter(Boolean)
  if (yardPresets.length > 0) {
    const mins  = yardPresets.map(p => YARDAGE_RANGES[p]?.[0] ?? 0)
    const maxes = yardPresets.map(p => YARDAGE_RANGES[p]?.[1])
    url.searchParams.set('yardage_min', String(Math.min(...mins)))
    if (maxes.every(m => m != null))
      url.searchParams.set('yardage_max', String(Math.max(...(maxes as number[]))))
  }

  const needlePresets = filters.needle.split(',').filter(Boolean)
  if (needlePresets.length > 0) {
    const mins  = needlePresets.map(p => NEEDLE_RANGES[p]?.[0] ?? 0)
    const maxes = needlePresets.map(p => NEEDLE_RANGES[p]?.[1])
    url.searchParams.set('needle_size_min', String(Math.min(...mins)))
    if (maxes.every(m => m != null))
      url.searchParams.set('needle_size_max', String(Math.max(...(maxes as number[]))))
  }

  const credentials = Buffer.from(`${accessKey}:${accessSecret}`).toString('base64')
  const requestUrl  = url.toString()
  console.log('[Ravelry] GET', requestUrl)

  let res: Response
  try {
    res = await fetch(requestUrl, {
      headers: { Authorization: `Basic ${credentials}`, Accept: 'application/json' },
      cache: 'no-store',
    })
  } catch (err) {
    console.error('[Ravelry] fetch threw:', err)
    return { patterns: [], paginator: { results: 0 }, error: 'Network error reaching Ravelry.' }
  }

  if (!res.ok) {
    let body = ''
    try { body = await res.text() } catch { /* ignore */ }
    console.error(`[Ravelry] ${res.status}:`, body)
    return { patterns: [], paginator: { results: 0 }, error: `Ravelry returned ${res.status}: ${body.slice(0, 200)}` }
  }

  return res.json()
}
