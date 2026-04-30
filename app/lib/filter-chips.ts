export type ChipDef = { label: string; removeUrl: string }

export function buildActiveChips(
  searchParams: Record<string, string | string[] | undefined>
): ChipDef[] {
  function raw(key: string): string {
    const v = searchParams[key]
    return Array.isArray(v) ? (v[0] ?? '') : (v ?? '')
  }

  function multi(key: string): string[] {
    return raw(key).split(',').filter(Boolean)
  }

  function withoutValue(key: string, value: string): string {
    const base = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) {
      const val = Array.isArray(v) ? v[0] : v
      if (val) base.set(k, val)
    }
    const current = base.get(key)?.split(',').filter(Boolean) ?? []
    const next = current.filter(x => x !== value)
    if (next.length === 0) base.delete(key)
    else base.set(key, next.join(','))
    return `/search?${base.toString()}`
  }

  function without(key: string): string {
    const base = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) {
      const val = Array.isArray(v) ? v[0] : v
      if (val && k !== key) base.set(k, val)
    }
    return `/search?${base.toString()}`
  }

  const chips: ChipDef[] = []

  if (raw('favorites') === '1') {
    chips.push({ label: 'My favorite designers', removeUrl: without('favorites') })
  }

  const sortVal = raw('sort')
  const sortLabels: Record<string, string> = {
    date: 'Sort: Newest',
    rating: 'Sort: Highest Rated',
    projects: 'Sort: Most Projects',
  }
  if (sortVal && sortLabels[sortVal]) {
    chips.push({ label: sortLabels[sortVal], removeUrl: without('sort') })
  }

  const price = raw('price')
  if (price === 'free') chips.push({ label: 'Free only', removeUrl: without('price') })
  if (price === 'paid') chips.push({ label: 'Paid only', removeUrl: without('price') })

  const rating = raw('rating')
  if (rating === '4') chips.push({ label: '4+ stars', removeUrl: without('rating') })
  if (rating === '3') chips.push({ label: '3+ stars', removeUrl: without('rating') })

  for (const v of multi('craft')) {
    chips.push({
      label: `Craft: ${v[0].toUpperCase() + v.slice(1)}`,
      removeUrl: withoutValue('craft', v),
    })
  }

  const typeLabels: Record<string, string> = {
    sweater: 'Sweater', cardigan: 'Cardigan', hat: 'Hat',
    scarf: 'Scarf', shawl: 'Shawl / Wrap', socks: 'Socks',
    mittens: 'Mittens', blanket: 'Blanket', bag: 'Bag', toy: 'Toy',
  }
  for (const v of multi('type')) {
    chips.push({ label: `Type: ${typeLabels[v] ?? v}`, removeUrl: withoutValue('type', v) })
  }

  const weightLabels: Record<string, string> = {
    lace: 'Lace', fingering: 'Fingering', sport: 'Sport',
    dk: 'DK', worsted: 'Worsted', bulky: 'Bulky', super_bulky: 'Super Bulky',
  }
  for (const v of multi('weight')) {
    chips.push({ label: `Weight: ${weightLabels[v] ?? v}`, removeUrl: withoutValue('weight', v) })
  }

  const diffLabels: Record<string, string> = {
    beginner: 'Beginner', easy: 'Easy', intermediate: 'Intermediate',
    experienced: 'Experienced', expert: 'Expert',
  }
  for (const v of multi('difficulty')) {
    chips.push({ label: diffLabels[v] ?? v, removeUrl: withoutValue('difficulty', v) })
  }

  const sizeLabels: Record<string, string> = {
    baby: 'Baby', child: 'Child', adult: 'Adult', plus: 'Plus Size',
  }
  for (const v of multi('sizes')) {
    chips.push({ label: `Size: ${sizeLabels[v] ?? v}`, removeUrl: withoutValue('sizes', v) })
  }

  const yardageLabels: Record<string, string> = {
    under200:  'Under 200 yds',
    '200to400':  '200–400 yds',
    '400to800':  '400–800 yds',
    '800to1500': '800–1500 yds',
    '1500plus':  '1500+ yds',
  }
  for (const v of multi('yardage')) {
    chips.push({ label: yardageLabels[v] ?? v, removeUrl: withoutValue('yardage', v) })
  }

  const needleLabels: Record<string, string> = {
    us0to2:      'US 0–2',
    us3to5:      'US 3–5',
    us6to8:      'US 6–8',
    us9to11:     'US 9–11',
    us13plus:    'US 13+',
    crochet2to4: '2–4mm crochet',
    crochet5to7: '5–7mm crochet',
    crochet8plus:'8mm+ crochet',
  }
  for (const v of multi('needle')) {
    chips.push({ label: needleLabels[v] ?? v, removeUrl: withoutValue('needle', v) })
  }

  return chips
}
