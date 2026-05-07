'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CommunityIcon } from '@/app/ui/icons/CommunityIcon'

export type StashPattern = {
  id: string
  pattern_name: string
  designer_name: string | null
  permalink: string
  photo_url: string | null
  collection_id: string | null
  notes: string | null
  yardage: number | null
  yarn_weight: string | null
}

export type StashCollection = {
  id: string
  name: string
  color: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function relevantLines(notes: string, yarn: string): string {
  const re = new RegExp(escapeRegex(yarn), 'i')
  return notes.split('\n').filter(l => re.test(l)).slice(0, 3).join('\n').trim()
}

function HighlightedText({ text, term }: { text: string; term: string }) {
  if (!term.trim()) return <>{text}</>
  const parts = text.split(new RegExp(`(${escapeRegex(term)})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark key={i} style={{ backgroundColor: '#D4A5A0', color: '#fff', borderRadius: '3px', padding: '0 2px' }}>
            {part}
          </mark>
        ) : part
      )}
    </>
  )
}

// ── Query parser ───────────────────────────────────────────────────────────────

// Maps user-typed keywords to canonical Ravelry yarn_weight values
const WEIGHT_KEYWORDS: { regex: RegExp; canonical: string }[] = [
  { regex: /\b(lace)\b/i,                                 canonical: 'Lace'        },
  { regex: /\b(cobweb)\b/i,                               canonical: 'Cobweb'      },
  { regex: /\b(thread)\b/i,                               canonical: 'Thread'      },
  { regex: /\b(fingering|sock|4-?ply)\b/i,               canonical: 'Fingering'   },
  { regex: /\b(sport|5-?ply)\b/i,                        canonical: 'Sport'       },
  { regex: /\b(dk|double\s*knit|8-?ply)\b/i,            canonical: 'DK'          },
  { regex: /\b(worsted|10-?ply)\b/i,                     canonical: 'Worsted'     },
  { regex: /\b(aran)\b/i,                                 canonical: 'Aran'        },
  { regex: /\b(bulky|chunky|12-?ply)\b/i,               canonical: 'Bulky'       },
  { regex: /\b(super[-\s]?bulky|14-?ply)\b/i,           canonical: 'Super Bulky' },
  { regex: /\b(jumbo)\b/i,                                canonical: 'Jumbo'       },
]

type ParsedQuery = {
  yarnName: string       // remaining text → notes search
  yardage: number | null // extracted from "200 yards / 200 yds"
  weight: string | null  // canonical weight name
}

function parseQuery(raw: string): ParsedQuery {
  let s = raw.trim()
  let yardage: number | null = null
  let weight: string | null = null

  // Extract yardage: "200 yards", "200 yds", "200yd", "200y"
  s = s.replace(/\b(\d+)\s*(?:yards?|yds?|y)\b/gi, (_, n) => {
    yardage = parseInt(n, 10)
    return ' '
  })

  // Extract weight keyword (first match wins)
  for (const { regex, canonical } of WEIGHT_KEYWORDS) {
    if (regex.test(s)) {
      weight = canonical
      s = s.replace(regex, ' ')
      break
    }
  }

  return { yarnName: s.replace(/\s+/g, ' ').trim(), yardage, weight }
}

// Case-insensitive substring match between stored value and canonical keyword
function weightMatches(stored: string | null, canonical: string): boolean {
  if (!stored) return false
  return stored.toLowerCase().includes(canonical.toLowerCase())
}

// ── Constants ──────────────────────────────────────────────────────────────────

const YARDAGE_PRESETS = [
  { label: 'Up to 200 yds',  max: 200  },
  { label: 'Up to 400 yds',  max: 400  },
  { label: 'Up to 800 yds',  max: 800  },
  { label: 'Up to 1500 yds', max: 1500 },
] as const

// ── Result card ────────────────────────────────────────────────────────────────

function ResultCard({ pattern, yarnName }: { pattern: StashPattern; yarnName: string }) {
  const preview = yarnName && pattern.notes ? relevantLines(pattern.notes, yarnName) : null
  return (
    <div className="flex gap-3 rounded-xl p-3"
         style={{ backgroundColor: '#38342f', border: '1px solid #4a4440' }}>
      <div className="flex-shrink-0 overflow-hidden rounded-lg"
           style={{ width: 60, height: 60, backgroundColor: '#2e2b28' }}>
        {pattern.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pattern.photo_url} alt={pattern.pattern_name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full"
               style={{ background: 'linear-gradient(135deg, #3a2a1e 0%, #D4A5A0 100%)', opacity: 0.7 }} />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold" style={{ color: '#f5f0eb' }}>
              {pattern.pattern_name}
            </p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              {pattern.designer_name && (
                <p className="text-xs" style={{ color: '#7a6e67' }}>by {pattern.designer_name}</p>
              )}
              {pattern.yarn_weight && (
                <span className="text-xs" style={{ color: '#5a504a' }}>{pattern.yarn_weight}</span>
              )}
              {pattern.yardage && (
                <span className="text-xs" style={{ color: '#5a504a' }}>~{pattern.yardage.toLocaleString()} yds</span>
              )}
            </div>
          </div>
          <Link href={`https://www.ravelry.com/patterns/library/${pattern.permalink}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-shrink-0 text-xs font-medium transition-colors hover:underline"
                style={{ color: '#D4A5A0' }}>
            View →
          </Link>
        </div>

        {preview && (
          <p className="text-xs leading-relaxed whitespace-pre-line line-clamp-3"
             style={{ color: '#9a8e87' }}>
            <HighlightedText text={preview} term={yarnName} />
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function StashBuster({
  patterns,
  collections,
}: {
  patterns: StashPattern[]
  collections: StashCollection[]
}) {
  const [input, setInput]                     = useState('')
  const [selectedColls, setSelectedColls]     = useState<Set<string>>(new Set())
  const [maxYardage, setMaxYardage]           = useState<number | null>(null)
  const [selectedWeights, setSelectedWeights] = useState<Set<string>>(new Set())

  const parsed = useMemo(() => parseQuery(input), [input])

  // Sidebar manual yardage overrides the parsed value; parsed is the auto fallback
  const effectiveMaxYardage = maxYardage ?? parsed.yardage

  // All unique weights present in the library (not just filtered results)
  const allWeights = useMemo(() => {
    const ws = new Set<string>()
    patterns.forEach(p => { if (p.yarn_weight) ws.add(p.yarn_weight) })
    return [...ws].sort()
  }, [patterns])

  const hasInput        = input.trim().length > 0
  const hasManualFilter = selectedColls.size > 0 || maxYardage != null || selectedWeights.size > 0
  const showResults     = hasInput || hasManualFilter
  const showSidebar     = showResults && (allWeights.length > 0 || collections.length > 0)

  const results = useMemo(() => {
    if (!showResults) return []
    return patterns.filter(p => {
      // Yardage: filter on actual column (patterns with no yardage data pass through)
      if (effectiveMaxYardage != null && p.yardage != null && p.yardage > effectiveMaxYardage) return false

      // Yarn weight: sidebar checkboxes take priority, else use parsed keyword
      if (selectedWeights.size > 0) {
        if (!p.yarn_weight || !selectedWeights.has(p.yarn_weight)) return false
      } else if (parsed.weight) {
        if (!weightMatches(p.yarn_weight, parsed.weight)) return false
      }

      // Collection filter
      if (selectedColls.size > 0 && !selectedColls.has(p.collection_id ?? '')) return false

      // Notes search — only when input has a yarn-name portion after stripping yardage/weight
      if (parsed.yarnName) {
        const re = new RegExp(escapeRegex(parsed.yarnName), 'i')
        if (!p.notes || !re.test(p.notes)) return false
      }

      return true
    })
  }, [patterns, effectiveMaxYardage, selectedWeights, parsed, selectedColls, showResults])

  function toggleColl(id: string) {
    setSelectedColls(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleWeight(w: string) {
    setSelectedWeights(prev => { const n = new Set(prev); n.has(w) ? n.delete(w) : n.add(w); return n })
  }
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value)
    if (!e.target.value.trim()) {
      setSelectedColls(new Set())
      setMaxYardage(null)
      setSelectedWeights(new Set())
    }
  }
  function clearFilters() { setSelectedColls(new Set()); setMaxYardage(null); setSelectedWeights(new Set()) }

  // Chips show what was auto-detected from the input text
  const parsedChips: string[] = []
  if (parsed.yardage) parsedChips.push(`≤ ${parsed.yardage} yds`)
  if (parsed.weight)  parsedChips.push(parsed.weight)
  if (parsed.yarnName) parsedChips.push(`notes: "${parsed.yarnName}"`)

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}>

      {/* Header */}
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 flex-shrink-0">
          <CommunityIcon size={30} color="#D4A5A0" />
        </span>
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#f5f0eb' }}>Stash Busting Tool</h2>
          <p className="mt-0.5 text-sm" style={{ color: '#7a6e67' }}>
            Describe your yarn to find matching patterns — e.g. "200 yards worsted" or "400 yds DK Malabrigo"
          </p>
        </div>
      </div>

      {/* Search input */}
      <input
        type="text" value={input} onChange={handleInputChange}
        placeholder="e.g. 200 yards worsted, fingering Malabrigo, 400 yds DK…"
        className="w-full rounded-xl px-4 py-3 text-sm outline-none"
        style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#f5f0eb' }}
        onFocus={e => (e.currentTarget.style.borderColor = '#D4A5A0')}
        onBlur={e  => (e.currentTarget.style.borderColor = '#4a4440')}
      />

      {/* Auto-detected filter chips */}
      {parsedChips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {parsedChips.map(chip => (
            <span key={chip}
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: '#3d2a1e', border: '1px solid #D4A5A0', color: '#e8c4b0' }}>
              {chip}
            </span>
          ))}
        </div>
      )}

      {/* Results area */}
      {showResults && (
        <div className="mt-5">

          {/* Count + clear manual filters */}
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold"
               style={{ color: results.length > 0 ? '#D4A5A0' : '#7a6e67' }}>
              {results.length === 0
                ? 'No patterns match — try different yardage, weight, or yarn name'
                : <><span style={{ color: '#D4A5A0' }}>✦</span> {results.length} pattern{results.length === 1 ? '' : 's'} match your stash!</>}
            </p>
            {hasManualFilter && (
              <button onClick={clearFilters}
                      className="flex-shrink-0 text-xs transition-colors hover:text-white"
                      style={{ color: '#5a504a' }}>
                Clear filters
              </button>
            )}
          </div>

          <div className="flex gap-6">

            {/* Filter sidebar */}
            {showSidebar && (
              <div className="hidden w-44 flex-shrink-0 space-y-5 sm:block">

                {/* Max yardage */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#7a6e67' }}>
                    Max yardage
                  </p>
                  <div className="space-y-1.5">
                    {YARDAGE_PRESETS.map(p => (
                      <label key={p.max} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio" name="yardage"
                          checked={maxYardage === p.max}
                          onChange={() => setMaxYardage(p.max)}
                          onClick={() => { if (maxYardage === p.max) setMaxYardage(null) }}
                          style={{ accentColor: '#D4A5A0', width: 13, height: 13 }}
                        />
                        <span className="text-sm" style={{ color: '#c4b8ae' }}>{p.label}</span>
                      </label>
                    ))}
                    {parsed.yardage != null && maxYardage == null && (
                      <p className="text-xs italic" style={{ color: '#5a504a' }}>
                        Auto: ≤ {parsed.yardage} yds
                      </p>
                    )}
                  </div>
                </div>

                {/* Yarn weight */}
                {allWeights.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#7a6e67' }}>
                      Yarn weight
                    </p>
                    <div className="space-y-1.5">
                      {allWeights.map(w => {
                        const autoActive = !selectedWeights.size && !!parsed.weight && weightMatches(w, parsed.weight)
                        return (
                          <label key={w} className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedWeights.has(w) || autoActive}
                              onChange={() => toggleWeight(w)}
                              style={{ accentColor: '#D4A5A0', width: 13, height: 13 }}
                            />
                            <span className="text-sm" style={{
                              color: selectedWeights.has(w) || autoActive ? '#f5f0eb' : '#c4b8ae',
                            }}>
                              {w}
                            </span>
                          </label>
                        )
                      })}
                      {parsed.weight && selectedWeights.size === 0 && (
                        <p className="text-xs italic" style={{ color: '#5a504a' }}>
                          Auto: {parsed.weight}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Collection */}
                {collections.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#7a6e67' }}>
                      Collection
                    </p>
                    <div className="space-y-1.5">
                      {collections.map(c => (
                        <label key={c.id} className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox" checked={selectedColls.has(c.id)}
                            onChange={() => toggleColl(c.id)}
                            style={{ accentColor: c.color, width: 13, height: 13 }}
                          />
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className="h-2 w-2 flex-shrink-0 rounded-full"
                                  style={{ backgroundColor: c.color }} />
                            <span className="truncate text-sm" style={{ color: '#c4b8ae' }}>{c.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Results list */}
            <div className="min-w-0 flex-1 space-y-3">
              {results.map(p => <ResultCard key={p.id} pattern={p} yarnName={parsed.yarnName} />)}
              {results.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm" style={{ color: '#5a504a' }}>
                    {hasManualFilter && !hasInput
                      ? 'No patterns match these filters — try relaxing them.'
                      : 'Try adjusting the yardage, weight, or yarn name.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
