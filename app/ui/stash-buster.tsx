'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

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
          <mark key={i} style={{ backgroundColor: '#C06B45', color: '#fff', borderRadius: '3px', padding: '0 2px' }}>
            {part}
          </mark>
        ) : part
      )}
    </>
  )
}

// ── Result card ────────────────────────────────────────────────────────────────

function ResultCard({ pattern, yarn }: { pattern: StashPattern; yarn: string }) {
  const preview = relevantLines(pattern.notes!, yarn)
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
               style={{ background: 'linear-gradient(135deg, #3a2a1e 0%, #C06B45 100%)', opacity: 0.7 }} />
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
                style={{ color: '#C06B45' }}>
            View →
          </Link>
        </div>

        {preview && (
          <p className="text-xs leading-relaxed whitespace-pre-line line-clamp-3"
             style={{ color: '#9a8e87' }}>
            <HighlightedText text={preview} term={yarn} />
          </p>
        )}
      </div>
    </div>
  )
}

// ── Constants ──────────────────────────────────────────────────────────────────

const YARDAGE_PRESETS = [
  { label: 'Up to 200 yds',  max: 200  },
  { label: 'Up to 400 yds',  max: 400  },
  { label: 'Up to 800 yds',  max: 800  },
  { label: 'Up to 1500 yds', max: 1500 },
] as const

// ── Main component ─────────────────────────────────────────────────────────────

export function StashBuster({
  patterns,
  collections,
}: {
  patterns: StashPattern[]
  collections: StashCollection[]
}) {
  const [yarn, setYarn]               = useState('')
  const [selectedColls, setSelectedColls]   = useState<Set<string>>(new Set())
  const [maxYardage, setMaxYardage]         = useState<number | null>(null)
  const [selectedWeights, setSelectedWeights] = useState<Set<string>>(new Set())

  const yarnQ = yarn.trim()
  const patternsWithNotes = patterns.filter(p => p.notes).length

  // Note-text matches (yarn name search)
  const noteMatches = useMemo(() => {
    if (!yarnQ) return []
    const re = new RegExp(escapeRegex(yarnQ), 'i')
    return patterns.filter(p => p.notes && re.test(p.notes))
  }, [yarnQ, patterns])

  // Weights available in this result set (for the weight filter)
  const availableWeights = useMemo(() => {
    const ws = new Set<string>()
    noteMatches.forEach(p => { if (p.yarn_weight) ws.add(p.yarn_weight) })
    return [...ws].sort()
  }, [noteMatches])

  // Apply secondary filters
  const results = useMemo(() => noteMatches.filter(p => {
    if (selectedColls.size > 0 && !selectedColls.has(p.collection_id ?? '')) return false
    if (maxYardage != null && p.yardage != null && p.yardage > maxYardage) return false
    if (selectedWeights.size > 0 && (!p.yarn_weight || !selectedWeights.has(p.yarn_weight))) return false
    return true
  }), [noteMatches, selectedColls, maxYardage, selectedWeights])

  function toggleColl(id: string) {
    setSelectedColls(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleWeight(w: string) {
    setSelectedWeights(prev => { const n = new Set(prev); n.has(w) ? n.delete(w) : n.add(w); return n })
  }
  function handleYarnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setYarn(e.target.value)
    if (!e.target.value.trim()) { setSelectedColls(new Set()); setMaxYardage(null); setSelectedWeights(new Set()) }
  }
  function clearFilters() { setSelectedColls(new Set()); setMaxYardage(null); setSelectedWeights(new Set()) }

  const hasFilters  = selectedColls.size > 0 || maxYardage != null || selectedWeights.size > 0
  const showSidebar = !!yarnQ && (collections.length > 0 || availableWeights.length > 0)

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}>

      {/* Header */}
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 select-none text-2xl leading-none">🧶</span>
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#f5f0eb' }}>Stash Busting Tool</h2>
          <p className="mt-0.5 text-sm" style={{ color: '#7a6e67' }}>
            {patternsWithNotes > 0
              ? `Find patterns for yarn you already have · ${patternsWithNotes} pattern${patternsWithNotes === 1 ? '' : 's'} with notes`
              : 'Search your pattern notes to find projects for yarn you already have'}
          </p>
        </div>
      </div>

      {/* Yarn input */}
      <input
        type="text" value={yarn} onChange={handleYarnChange}
        placeholder="What yarn do you have? e.g. Merino, Cotton, Malabrigo Rios…"
        className="w-full rounded-xl px-4 py-3 text-sm outline-none"
        style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#f5f0eb' }}
        onFocus={e => (e.currentTarget.style.borderColor = '#C06B45')}
        onBlur={e  => (e.currentTarget.style.borderColor = '#4a4440')}
      />

      {!yarnQ && patternsWithNotes === 0 && (
        <p className="mt-3 text-xs" style={{ color: '#5a504a' }}>
          Add notes to patterns using the ✏️ icon on each card — include the yarn you plan to use, then search here.
        </p>
      )}

      {/* Results area */}
      {yarnQ && (
        <div className="mt-5">

          {/* Count + clear */}
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold"
               style={{ color: results.length > 0 ? '#C06B45' : '#7a6e67' }}>
              {results.length === 0
                ? `No patterns mention "${yarnQ}"${hasFilters ? ' with these filters' : ''} in their notes`
                : `🎉 ${results.length} pattern${results.length === 1 ? '' : 's'} match your stash!`}
            </p>
            {hasFilters && (
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
                          style={{ accentColor: '#C06B45', width: 13, height: 13 }}
                        />
                        <span className="text-sm" style={{ color: '#c4b8ae' }}>{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Yarn weight */}
                {availableWeights.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#7a6e67' }}>
                      Yarn weight
                    </p>
                    <div className="space-y-1.5">
                      {availableWeights.map(w => (
                        <label key={w} className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox" checked={selectedWeights.has(w)}
                            onChange={() => toggleWeight(w)}
                            style={{ accentColor: '#C06B45', width: 13, height: 13 }}
                          />
                          <span className="text-sm" style={{ color: '#c4b8ae' }}>{w}</span>
                        </label>
                      ))}
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

            {/* Results */}
            <div className="min-w-0 flex-1 space-y-3">
              {results.map(p => <ResultCard key={p.id} pattern={p} yarn={yarnQ} />)}
              {results.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm" style={{ color: '#5a504a' }}>
                    {patternsWithNotes === 0
                      ? 'Add notes to your patterns with the ✏️ icon and include the yarn you plan to use!'
                      : hasFilters
                        ? 'No patterns match all your filters — try relaxing them.'
                        : 'Try a different yarn name, or add more notes to your patterns.'}
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
